using System.Buffers.Binary;
using System.IO.Compression;

namespace Blog.Generation;

/// <summary>Recompresses PNG scanlines without altering pixels, palette, transparency or metadata.</summary>
public static class ImageOptimizer
{
    public static async Task OptimizeAsync(string file, CancellationToken cancellationToken = default)
    {
        // JPEG re-encoding is lossy. GIF, WebP and animated PNG retain their original bytes and timing.
        if (!Path.GetExtension(file).Equals(".png", StringComparison.OrdinalIgnoreCase))
            return;

        byte[] original = await File.ReadAllBytesAsync(file, cancellationToken);
        byte[]? optimized = Recompress(original);

        if (optimized is not null && optimized.Length < original.Length)
            await File.WriteAllBytesAsync(file, optimized, cancellationToken);
    }

    private static byte[]? Recompress(byte[] original)
    {
        ReadOnlySpan<byte> signature = [137, 80, 78, 71, 13, 10, 26, 10];
        if (!original.AsSpan().StartsWith(signature))
            return null;

        List<(int Offset, int Length, bool IsData)> chunks = [];
        using MemoryStream compressed = new MemoryStream();
        int offset = 8;

        while (offset + 12 <= original.Length)
        {
            uint length = BinaryPrimitives.ReadUInt32BigEndian(original.AsSpan(offset));
            if (length > int.MaxValue || offset + length + 12 > original.Length)
                return null;

            ReadOnlySpan<byte> type = original.AsSpan(offset + 4, 4);
            if (type.SequenceEqual("acTL"u8))
                return null;

            bool isData = type.SequenceEqual("IDAT"u8);
            int chunkLength = (int)length + 12;
            chunks.Add((offset, chunkLength, isData));

            if (isData)
                compressed.Write(original.AsSpan(offset + 8, (int)length));

            offset += chunkLength;

            if (type.SequenceEqual("IEND"u8))
                break;
        }

        if (compressed.Length == 0)
            return null;
        compressed.Position = 0;

        using MemoryStream scanlines = new MemoryStream();
        using (ZLibStream decoder = new ZLibStream(compressed, CompressionMode.Decompress, true))
            decoder.CopyTo(scanlines);

        scanlines.Position = 0;

        using MemoryStream recompressed = new MemoryStream();
        using (ZLibStream encoder = new ZLibStream(recompressed, CompressionLevel.SmallestSize, true))
            scanlines.CopyTo(encoder);

        byte[] data = recompressed.ToArray();
        using MemoryStream output = new MemoryStream();
        output.Write(signature);
        bool written = false;
        Span<byte> header = stackalloc byte[8];
        Span<byte> crc = stackalloc byte[4];

        foreach ((int Offset, int Length, bool IsData) chunk in chunks)
        {
            if (!chunk.IsData)
                output.Write(original.AsSpan(chunk.Offset, chunk.Length));
            else if (!written)
            {
                BinaryPrimitives.WriteUInt32BigEndian(header, (uint)data.Length);
                "IDAT"u8.CopyTo(header[4..]);
                output.Write(header);
                output.Write(data);
                uint checksum = UpdateCrc(uint.MaxValue, "IDAT"u8);
                checksum = UpdateCrc(checksum, data);
                BinaryPrimitives.WriteUInt32BigEndian(crc, ~checksum);
                output.Write(crc);
                written = true;
            }
        }

        // Retain any trailing data as well; only the IDAT compression stream changes.
        output.Write(original.AsSpan(offset));
        return output.ToArray();
    }

    private static uint UpdateCrc(uint crc, ReadOnlySpan<byte> bytes)
    {
        foreach (byte value in bytes)
        {
            crc ^= value;
            for (int bit = 0; bit < 8; bit++)
            {
                crc = (crc & 1) != 0 ? (crc >> 1) ^ 0xEDB88320u : crc >> 1;
            }
        }

        return crc;
    }
}