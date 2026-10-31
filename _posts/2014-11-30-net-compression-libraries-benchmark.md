---
title: ".NET compression libraries benchmark"
description: "Comparing .NET compression libraries by compression ratio, compression speed, and decompression speed using in-memory benchmarks."
date: "2014-11-30T23:06:00.002Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2014/12/net-compression-libraries-benchmark.html"
tags: ["C#", "Performance"]
stylesheets: ["diagrams.css"]
---

<style>
    .prose .zip-diagram {
        break-inside: avoid;
    }
    .zip-diagram .zip-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px 26px;
        align-items: stretch;
    }
    .zip-diagram .zip-heading {
        color: var(--muted);
        font-size: 12px;
        text-align: center;
    }
    .zip-diagram .zip-step {
        position: relative;
        padding: 16px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--muted);
        border-radius: 6px;
        color: var(--text);
        font-size: 14px;
        text-align: center;
    }
    .zip-diagram .zip-step::after {
        content: "→";
        position: absolute;
        left: 100%;
        width: 26px;
        color: var(--accent);
        text-align: center;
        font-size: 20px;
    }
    .zip-diagram .zip-archive {
        grid-column: 3;
        grid-row: 2 / 4;
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        gap: 16px;
        padding: 6px;
        border: 1px solid var(--accent);
        border-radius: 6px;
    }
    .zip-diagram .zip-entry {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 6px;
        background: var(--surface-2);
        color: var(--text);
        font-size: 14px;
        text-align: center;
    }
    .zip-diagram figcaption {
        margin-top: 16px;
        line-height: 1.6;
    }
    @media (max-width: 480px) {
        .prose .zip-diagram {
            padding: 12px;
        }
        .zip-diagram .zip-grid {
            gap: 12px 18px;
        }
        .zip-diagram .zip-step, .zip-diagram .zip-entry {
            padding: 10px 4px;
            font-size: 12px;
        }
        .zip-diagram .zip-step::after {
            width: 18px;
            font-size: 16px;
        }
        .zip-diagram .zip-heading {
            font-size: 11px;
        }
    }
</style>

I often find myself needing a compression library in a software development project, and after a few
tests with disappointing results I usually fall back to spawning 7Zip as an external process. This
time however, the application specification prohibits any data written to disk, which my existing
7Zip workflow required. I needed to do everything in memory, and so I had to test some of the
C# libraries available for compression as well as the different compression algorithms.

Here is a full list of the tested libraries:

- [.NET
  DeflateStream](https://learn.microsoft.com/en-us/dotnet/api/system.io.compression.deflatestream?view=net-10.0&redirectedfrom=MSDN)

- [ICSharpCode SharpZip](https://icsharpcode.github.io/SharpZipLib/)
- [Zlib.NET](https://www.componentace.com/zlib_.NET.htm)
- [DotNetZip](https://github.com/DinoChiesa/DotNetZip)
- [Managed LZMA](https://code.google.com/p/managed-lzma/)
- [LZMA SDK](https://www.7-zip.org/sdk.html)
- [QuickLZ](http://www.quicklz.com/)

## Compression 101

Before I get to the results of the benchmark, I think it is important to understand the different
archive formats and compression algorithms in order to compare the results with other benchmarks and/
or tests. Let's get to it!

A compression algorithm can be compared to a small machine that takes in some data, does some math on
it and transforms it to a representation intended to be smaller; some inputs grow instead. It sounds simple, but it involves a lot
of math to do it efficiently. The best compression algorithms are the ones which have a high
compression ratio while only using small amounts of RAM and CPU. One such algorithm is the very well
known DEFLATE which internally uses the famous LZ77 algorithm created by Abraham Lempel and Jacob
Ziv. The DEFLATE algorithm has become the de facto standard when it comes to compression, and it is
used in nearly all instances when a compression algorithm is needed. There are many compression
algorithms out there, some are better than DEFLATE and also very widespread. Examples include LZW,
BWT, LZSS and LZMA.

Each of the compression algorithms only takes in a single file, either as a blob of bytes, or a
stream of bytes. The question is, how do compression applications such as 7Zip, WinZip and WinRAR
compress multiple files?

Enter the world of archive and compression formats. Zip and RAR hold files, while gzip and bzip2
compress byte streams. They all simply
describe the content of themselves either in terms of files or streams of data, along with some
metadata such as original size, file name and path. The archive formats are more complex than you
would think, simply because there are a lot of features. Some of them support multiple data streams
(for multi-threading), encryption, password protection, file name obfuscation, self-extracting
archives and more.

<figure class="diagram diagram-panel zip-diagram" role="img" aria-label="File 1 and File 2 are compressed separately. Their compressed data is stored as Entry 1 and Entry 2 in one ZIP archive.">
    <div class="zip-grid" aria-hidden="true">
        <span class="zip-heading">Input files</span>
        <span class="zip-heading">Compression</span>
        <span class="zip-heading">ZIP archive</span>
        <div class="zip-step">File 1</div>
        <div class="zip-step">Compress</div>
        <div class="zip-archive">
            <div class="zip-entry">Entry 1</div>
            <div class="zip-entry">Entry 2</div>
        </div>
        <div class="zip-step">File 2</div>
        <div class="zip-step">Compress</div>
    </div>
    <figcaption aria-hidden="true">Each file is compressed separately and stored as an entry in the archive.</figcaption>
</figure>

Figure 1: The relationship between files, compression algorithms and archive formats.

Many of the archiving formats are now synonymous with the compression algorithm they use. We say
"Zip the file" or "Make a 7z of the folder". Archive formats can support several compression
algorithms, with the allowed combinations defined by each format, such as Zip with LZMA or 7z with
DEFLATE. That being said, there are some default compression algorithms in some
archive formats. I've listed some examples here in archive/algorithm format:

- Zip / DEFLATE
- 7zip / LZMA
- Bzip2 / BWT
- Gzip / DEFLATE
- GIF / LZW
- PNG / DEFLATE
- Tar / none
- Rar / LZSS

The avid reader noticed that I put a couple of image formats in the list (GIF, PNG). Both of them
use compression algorithms to minimize the size of the image data within their image formats. The same applies to Microsoft Excel 2013 files (xlsx / DEFLATE) and Java Archives
(Jar / DEFLATE).

In the Linux world, the solution to compressing multiple files was solved using an archiving format
called Tar. It is a pretty simple format designed for tape archiving, which preserves the filesystem
information such as timestamps, owner information and file size on the files held inside the
archive. To compress a directory, Tar simply stores all the files within the directory inside a
single file. A separate compressor such as gzip or bzip2 then compresses that file.

## Benchmark

Now that we know the difference between compression algorithms and archive formats, we can continue
to the benchmark. The libraries tested here are overlapping in the sense that they are simply
different implementations of different compression algorithms, and even though the name of the
library might contain Zip, it has nothing to do with the actual Zip archiving format, but everything
to do with the compression algorithm used by default in Zip files.

The benchmark uses a 128 MB test file that contains images, music, text and some random data. The
file represents arbitrary data usually found on a filesystem.

| Library      | Type    | Packed (MB) | Pack (ms) | Unpack (ms) | Ratio | Speed (MB/s) |
|--------------|---------|-------------|-----------|-------------|-------|--------------|
| .NET 4.5.1   | Zip     | 34.10       | 2,921     | 895         | 3.58  | 43.82        |
| ICSharpCode  | Zip     | 34.07       | 6,373     | 1,524       | 3.58  | 20.08        |
| ICSharpCode  | Gzip    | 34.07       | 6,347     | 1,511       | 3.58  | 20.17        |
| ICSharpCode  | BZip2   | 35.69       | 45,002    | 6,811       | 3.42  | 2.84         |
| 7z SDK       | LZMA    | 28.51       | 40,235    | 3,254       | 4.28  | 3.18         |
| Zlib.NET     | Zlib    | 33.97       | 4,837     | 985         | 3.59  | 26.46        |
| DotNETZip    | Zip     | 33.97       | 5,120     | 1,482       | 3.59  | 25.00        |
| DotNETZip    | Gzip    | 35.67       | 31,739    | 4,556       | 3.42  | 4.03         |
| DotNETZip    | Zlib    | 33.97       | 4,509     | 887         | 3.59  | 28.39        |
| LZMA-managed | LZMA    | 28.07       | 35,555    | 7,402       | 4.35  | 3.60         |
| QuickLZ      | QuickLZ | 42.90       | 1,015     | 1,010       | 2.85  | 126.11       |

## Conclusion

The fastest algorithm was QuickLZ, but it also has the worst compression ratio. The best compression
ratio was gained by LZMA, but it is also the third-slowest compression speed. It would seem the
built-in DeflateStream in .NET is the overall winner when it comes to speed vs. compression ratio.