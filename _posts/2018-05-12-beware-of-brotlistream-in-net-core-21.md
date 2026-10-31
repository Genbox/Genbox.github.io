---
title: "Beware of BrotliStream in .NET Core 2.1"
description: "Investigating the compression defaults of BrotliStream in .NET Core 2.1, their performance cost, and subsequent changes in .NET."
date: "2018-05-12T21:35:00.003Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2018/05/beware-of-brotlistream-in-net-core-21.html"
tags: ["C#", "Performance"]
---

I love compression algorithms and have built a fair share of my own for fun and profit. It is a
difficult task to build something that is efficient when it comes to the compromise between speed
and compression ratio, so when I saw Google's Brotli algorithm mentioned in the  [.NET Core 2.1 RC1
announcement](https://devblogs.microsoft.com/dotnet/announcing-net-core-2-1-rc-1/), I
was ecstatic!

It lasted about 15 minutes until I put the BrotliStream to a test, only to find out that it took
140x longer to compress a 518 MB file!

Curious if this was a bug, I delved into the code and realized that the default compression level
[is set to
11](https://github.com/dotnet/corefx/blob/8f9cfa462dfc2ec5bdbbe2462693036861fb0199/src/System.IO.Compression.Brotli/src/System/IO/Compression/BrotliUtils.cs#L13).
For those not familiar with Brotli, that is the highest level available, that prioritizes compression
ratio above speed.

I [reported it as an issue](https://github.com/dotnet/runtime/issues/26097), but Microsoft seems to
think that having the same configuration as Google's Brotli library is more important than a sane
default, so it is only a matter of time before tons of StackOverflow posts pop up complaining about
the speed of BrotliStream.

If you want to use Brotli in your application (a wise choice! It is a good algorithm), be sure to
use an explicit quality setting with the .NET Core 2.1 implementation discussed here. It accepts
an integer cast to CompressionLevel (I would recommend a value of 6) like this:

BrotliStream stream = new BrotliStream(sm, (CompressionLevel)6);

That is a good compromise between speed and compression ratio for most data. This cast relies on
the .NET Core 2.1 implementation and should be checked when changing runtime versions.

Update 2021-11-01: Microsoft decided to block user settings [in this merge
request](https://github.com/dotnet/runtime/pull/57561).

Update 2022-05-01: Microsoft now [defaults to quality
4](https://github.com/dotnet/runtime/pull/72266). It will be part of .NET 7.

Update 2022-09-01: [Microsoft acknowledges the
problem](https://devblogs.microsoft.com/dotnet/performance_improvements_in_net_7/#compression), but
stays with the decision of setting quality to 4.