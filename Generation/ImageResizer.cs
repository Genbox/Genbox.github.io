using System.IO.Enumeration;
using System.Security.Cryptography;
using System.Text;
using Blog.Models;
using PeachImage;
using PeachImage.Formats.Webp;

namespace Blog.Generation;

/// <summary>Shrinks the images listed in _data/images.json to twice their largest display size. Sources keep full resolution.</summary>
public sealed class ImageResizer(string root, IReadOnlyDictionary<string, ImageSize> sizes)
{
    // Lossy is requested, but PeachImage has no lossy alpha yet and encodes transparent images losslessly.
    private static readonly WebpEncoderOptions Encoder = new WebpEncoderOptions
    {
        Lossless = false,
        Quality = 85,
        CompressionLevel = WebpCompressionLevel.SmallestSize
    };

    private readonly string _cache = Path.Combine(root, "obj", "images");

    /// <summary>Writes the resized image and returns true, or returns false when no size is listed for the file.</summary>
    public async Task<bool> TryResizeAsync(string relative, string source, string destination, CancellationToken cancellationToken)
    {
        ImageSize? size = sizes.Where(pair => FileSystemName.MatchesSimpleExpression(pair.Key, relative, false)).Select(pair => pair.Value).FirstOrDefault();
        if (size is null)
            return false;

        if (!Path.GetExtension(source).Equals(".webp", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Only WebP images can be resized; {relative} is listed in _data/images.json.");

        // Encoding takes seconds per image, so results are cached by source bytes, target size and encoder.
        byte[] original = await File.ReadAllBytesAsync(source, cancellationToken);
        string settings = $"{size.Width}x{size.Height}|{Encoder.Quality}|{typeof(Image).Assembly.GetName().Version}";
        string key = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(Convert.ToHexString(SHA256.HashData(original)) + settings)))[..32];
        string cached = Path.Combine(_cache, key + ".webp");

        if (!File.Exists(cached))
        {
            using Image image = Image.Load(original);
            using Image resized = image.Resize(size.Width, size.Height, new ResizeOptions { Mode = ResizeMode.Max, Filter = ResamplingFilter.Lanczos3 });
            using MemoryStream output = new MemoryStream();
            resized.Save(output, "webp", Encoder);

            // An image that already fits can grow when re-encoded; the smaller of the two is published.
            Directory.CreateDirectory(_cache);
            await File.WriteAllBytesAsync(cached, output.Length < original.Length ? output.ToArray() : original, cancellationToken);
        }

        File.Copy(cached, destination, true);
        return true;
    }
}