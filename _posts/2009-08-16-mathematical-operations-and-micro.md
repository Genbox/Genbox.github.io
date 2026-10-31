---
title: "Mathematical operations and micro-benchmarking"
description: "How compiler optimizations and CPU caches can distort micro-benchmarks of division, multiplication, and other arithmetic operations."
date: "2009-08-16T22:54:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/mathematical-operations-and-micro.html"
tags: ["Algorithms", "Performance"]
---

You might have heard that the [division
operation](https://en.wikipedia.org/wiki/Division_%28digital%29) on a modern FPU is slower than a
multiplication operation. If you have not heard this before; it’s true – divisions are indeed
slower. But why?

Without going into the technical details, the divide operation is an iterative algorithm and the
multiplication operation is computed directly. One of the more common ways of doing divide
operations on an FPU is to use a divide-free
[Newton-Raphson](https://en.wikipedia.org/wiki/Newton-Raphson) approximation to get the reciprocal of
the denominator and then multiply with the numerator. More on this will come in a later post.

Let’s put it to the test.  
Here we run 10.000.000 iterations where we divide 500 by 11.5

```csharp
const float c = 11.5f;
const float b = 500f;
float a = 0;
for (int i = 0; i < 10000000; i++)
{
    a = b / c;
}
```

Here we multiply 500 by the multiplicative inverse (reciprocal) of 11.5

```csharp
const float d = 1 / c;
float f = 0;
for (int i = 0; i < 10000000; i++)
{
    f = b * d;
}
```

From what I described earlier our multiplication example (code example 2) should perform better than
the division example. Here are the results:

**Division**: 00:00:00.0010787  
**Multiplication**: 00:00:00.0010871

*Something is clearly wrong*. First of all, they have virtually no difference in the time it
took to compute the results. Second of all, the time it took to do the operations is really small.
Don’t worry, there is a perfectly good reason for this:

We used constants to represent the numbers we needed to divide and multiply. The compiler can
calculate these expressions at compile time, and the JIT can eliminate unused results.
This leads us to the next section of this post:

## Micro-benchmarking

Micro-benchmarking is where you test a single or multiple operations to see what takes the most
time. In this case, the constant expressions and unused results allow optimizations that prevent
these timings from measuring the cost of the arithmetic operations.

There are [a
bunch](https://web.archive.org/web/20101123030812/http://blogs.microsoft.co.il:80/blogs/sasha/archive/2009/05/08/micro-benchmarking-considered-harmful.aspx)
of
[examples](https://shawnhargreaves.com/blog/the-perils-of-microbenchmarking.html)
on the internet that show us exactly how micro-benchmarking can deceive us. In this case, the
compiler can fold constant expressions and eliminate unused work. To test the divide and multiply
operators, use runtime inputs, consume the results and inspect the generated code. The performance
difference depends on the platform and compiler optimizations.

## Conclusion

Divisions are really slower than multiplication, but the CPU uses precise approximations by either
using lookup tables or iterative algorithms. It is a clever piece of hardware that always tries to
speed up the execution of your code wherever possible. When you do micro-benchmarking, make
sure the compiler generates the code you actually want to test. Often the compiler even strips away
your for-loop or its unused calculations. Use repeated measurements with observable results and
enough work to exceed timer resolution and measurement overhead.