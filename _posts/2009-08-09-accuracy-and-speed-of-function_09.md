---
title: "The accuracy and speed of function approximations – part 3"
description: "Benchmarking C# sine approximations against Math.Sin and weighing speed gains against numerical accuracy."
date: "2009-08-09T18:51:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/accuracy-and-speed-of-function_09.html"
tags: ["Algorithms", "Performance"]
---

In [part 2](/2009/08/accuracy-and-speed-of-function.html) we had a look at the accuracy of the
approximated functions. In this part we will take a look at the speed of the same approximated
functions.

There is no reason to use approximation unless you gain something from it. Usually the gain will be
in the form of a speed improvement over the real function. Embedded devices with low memory and low
frequency CPU can benefit greatly from approximation – even new computers can benefit from it. Let's
test it out:

|       | Math.Sin(1.5f) | Approx.HighSin(1.5f) | Approx.LowSin(1.5f) | Approx.TaylorSin(1.5f) |
|-------|----------------|----------------------|---------------------|------------------------|
| Value | 0.9974949      | 0.9975124            | 0.9979686           | 0.9973912              |
| Time  | 62 ms          | 10 ms                | 6 ms                | 26 ms                  |

The timing depends a lot on the platform and settings. This is compiled under .Net 3.5 SP1 x64 in
release mode. Timing is based on 1000000 iterations.

In this test, the corrected polynomial is a lot faster than both the Taylor polynomial and
Math.Sin. Its accuracy advantage applies to the formulas and interval compared in the earlier posts.

## Conclusion

If you are programming for embedded devices such as mobile phones, PDAs or barcode readers, you can
gain a lot from function approximations. In this article series we tested particular formulas and
input intervals, with timings from .NET 3.5 SP1 on a PC. The corrected polynomial gave about
**10 times better performance** in this test for a small sacrifice in accuracy. Measure both
accuracy and speed on your target platform.

You can get the code to the approximation library (written in C#) here:
[Approx.net](https://github.com/Genbox/ApproximationNet)

**Update:** I managed to improve the performance of the LowSin() function. It now runs at 3 ms on my
computer.