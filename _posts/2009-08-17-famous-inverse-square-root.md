---
title: "The famous inverse square root"
description: "Explaining the fast inverse square root approximation, its role in vector normalization, and its implementation in C#."
date: "2009-08-17T22:53:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/famous-inverse-square-root.html"
tags: ["Algorithms", "Performance"]
---

I’ve already mentioned before that you can approximate divisions using a division-free
[Newton-Raphson](https://en.wikipedia.org/wiki/Newton-Raphson) approximation. You can also use the
Newton-Raphson method for approximating the square root and the inverse square root function.

But first, what do we actually use inverse square root and square root for? A lot really –
everything that uses a normalized vector; collision responses, lighting and reflection to mention a
few. It is an important part of any game and the operation has to be as fast as possible. Back in
the day when computers had weaker CPUs and no specialized hardware to handle floating point
operations (Today we even have specialized physics cards and specialized lighting circuits), some
steps had to be taken to compute the inverse square root a million times each second as quickly as
possible.

And here it is, for positive, finite, normalized `float` inputs. Enable unsafe compilation to
compile this example, and compare its speed and accuracy with 1 / sqrt(x) on your target hardware:

```csharp
public unsafe float InvSqrt(float x)
{
    float xhalf = 0.5f * x;
    int i = *(int*)&x;
    i = 0x5f3759df - (i >> 1);
    x = *(float*)&i;
    return x * (1.5f - xhalf * x * x);
}
```

I could go into details on how this works, but I think it has been described sufficiently on
Wikipedia's article [Fast inverse square
root](https://en.wikipedia.org/wiki/Fast_inverse_square_root). Suffice to say that the line with
**0x5f3759df** is the interesting one; its historical origin is uncertain, but its mathematical role
has been analyzed.
[Several](https://www.lomont.org/papers/2003/InvSqrt.pdf) different
[papers](https://0x5f37642f.com/documents/McEniryMathematicsBehind.pdf) have been written to try
and explain how this magic hex code produces the initial approximation.

I included this fast inverse square root function in the
[Approx.net](https://github.com/Genbox/ApproximationNet) library
(C#).