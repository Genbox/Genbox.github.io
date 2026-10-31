---
title: "Floating- and fixed-point arithmetic"
description: "Comparing floating-point and fixed-point arithmetic for simulations, including precision, range, determinism, and performance."
date: "2009-10-05T17:25:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/10/floating-and-fixed-point-arithmetic.html"
tags: ["Algorithms", "Performance"]
stylesheets: ["diagrams.css"]
---

<style>
    .prose .fp-diagram {
        break-inside: avoid;
    }
    .fp-diagram .fp-title {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 16px;
        color: var(--text);
        font-size: 16px;
        font-weight: 600;
    }
    .fp-diagram .fp-title span {
        color: var(--muted);
        font: 12px var(--mono);
    }
    .fp-diagram .fp-indexes {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        color: var(--muted);
        font: 11px var(--mono);
    }
    .fp-diagram .fp-bar {
        display: grid;
        grid-template-columns: 1fr 8fr 23fr;
        height: 38px;
        border: 1px solid var(--muted);
    }
    .fp-diagram.fp-double .fp-bar {
        grid-template-columns: 1fr 11fr 52fr;
    }
    .fp-diagram .fp-bar span {
        background-color: var(--field-color);
        background-image: linear-gradient(to right, transparent calc(100% - 1px), #13161b 0);
        background-size: calc(100% / var(--bits)) 100%;
    }
    .fp-diagram .fp-sign {
        --field-color: #efb76b;
        --bits: 1;
    }
    .fp-diagram .fp-exponent {
        --field-color: #6ee7b7;
        --bits: 8;
    }
    .fp-diagram .fp-fraction {
        --field-color: #91baff;
        --bits: 23;
    }
    .fp-diagram.fp-double .fp-exponent {
        --bits: 11;
    }
    .fp-diagram.fp-double .fp-fraction {
        --bits: 52;
    }
    .fp-diagram .fp-legend {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 16px;
    }
    .fp-diagram .fp-legend > div {
        padding-left: 10px;
        border-left: 3px solid var(--field-color);
        color: var(--text);
        font-size: 13px;
    }
    .fp-diagram .fp-legend small {
        display: block;
        color: var(--muted);
        font-size: 12px;
    }
    .fp-diagram .fp-example {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 18px;
        font: 12px/1.6 var(--mono);
    }
    .fp-diagram .fp-example span {
        color: var(--field-color);
        overflow-wrap: anywhere;
    }
    .fp-diagram figcaption {
        margin-top: 14px;
        line-height: 1.6;
    }
    @media (max-width: 420px) {
        .prose .fp-diagram {
            padding: 14px;
        }
        .fp-diagram .fp-legend {
            grid-template-columns: 1fr;
            gap: 10px;
        }
    }
</style>

A user posted a [question](http://farseerphysics.codeplex.com/Thread/View.aspx?ThreadId=71014) (link unavailable) on
the Farseer Physics Engine forums about fixed point math. The topic includes [numeral
systems](https://en.wikipedia.org/wiki/Numeral_system), [implementation
details](https://en.wikipedia.org/wiki/IEEE_754-2008) and performance. A
[whole](http://trac.bookofhook.com/bookofhook/trac.cgi/wiki/IntroductionToFixedPointMath) lot of
[posts](http://preserve.mactech.com/articles/mactech/Vol.10/10.03/FixedPointMath/index.html) have been
[written](https://web.archive.org/web/20090722004725/http://www.ddj.com:80/cpp/207000448?) about it. I’m not going to provide a full introduction
to fixed point math, I’m simply going to provide an abstract answer to the questions (one that applies
to similar questions).

## Background

Back in the good old days (before the Intel [i486
CPU](https://en.wikipedia.org/wiki/Intel_i486#Differences_between_the_386_and_486)), floating point was
available through software or coprocessors. Fixed point was useful where floating-point support
was limited, trading range and precision against implementation cost and performance.

Let us take a quick example: A fixed point number with the radix (point/dot) after the fourth digit:
5186.3924, would be represented with a floating point as 51863924 with an exponent of 3:

5.1863924\*10^3 = 5186.3924

Let us have a look at the ups and downs of floating point math.

## Positive side of floating point

There are both positive and negative sides of floating point arithmetic. It is basically a tradeoff
that the programmer needs to balance; choosing the lesser of two evils.

### Greater range and precision

Floating point numbers have a greater range of number representations. You can’t write 0.00001234567
and 12.34567 with fixed point. The radix is fixed! You can with floating point and that is one of
the main reasons we use floating point over fixed point. Let us take a look at the following example
from [Wikipedia](https://en.wikipedia.org/wiki/Floating_point#Range_of_floating-point_numbers):

In a decimal floating-point system with three digits, the multiplication that humans would write as

0.12 × 0.12 = 0.0144

would be expressed as

(1.2 × 10<sup>−1</sup>) × (1.2 × 10<sup>−1</sup>) = (1.44 × 10<sup>−2</sup>).

In a fixed-point system with the decimal point at the left, it would be

0.120 × 0.120 = 0.014.

A digit of the result was lost because of the inability of the digits and decimal point to 'float'
relative to each other within the digit string.

Since floating point numbers are split up into 2 numbers: *Significant* and *exponent,* it
makes sense that the range of floating point numbers is defined by the number of bits allocated to
the significant and exponent. There are different types of floating point data types available:

- **Single** – Single precision with 32 bits. Called
  [single](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)
  or `float` in C#.
    - Range: ±1.5 × 10−<sup>45</sup> to ±3.4 × 10<sup>38</sup>
    - Precision: 7 digits

<figure class="diagram diagram-panel fp-diagram" role="img" aria-label="Single precision: 32 bits, divided into 1 sign bit, 8 exponent bits, and 23 fraction bits. Example: 0.15625 = +1.01₂ × 2⁻³. The exponent field is 124, with a bias of 127.">
    <div aria-hidden="true">
        <div class="fp-title">Single precision<span>32 bits total</span></div>
        <div class="fp-indexes">
            <span>bit 31</span>
            <span>bit 0</span>
        </div>
        <div class="fp-bar">
            <span class="fp-sign"></span>
            <span class="fp-exponent"></span>
            <span class="fp-fraction"></span>
        </div>
        <div class="fp-legend">
            <div class="fp-sign">Sign<small>1 bit · bit 31</small></div>
            <div class="fp-exponent">Exponent<small>8 bits · bits 30–23</small></div>
            <div class="fp-fraction">Fraction<small>23 bits · bits 22–0</small></div>
        </div>
        <div class="fp-example">
            <span class="fp-sign">0</span>
            <span class="fp-exponent">01111100</span>
            <span class="fp-fraction">01000000000000000000000</span>
        </div>
    </div>
    <figcaption aria-hidden="true">Example: 0.15625 = +1.01₂ × 2⁻³. The exponent field is 124, with a bias of 127.</figcaption>
</figure>

- **Double** – Double precision with 64 bits. Called
  [`double`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)
  in C#.
    - Range ±5.0 × 10−<sup>324</sup> to ±1.7 × 10<sup>308</sup>
    - Precision: 15-16 digits

<figure class="diagram diagram-panel fp-diagram fp-double" role="img" aria-label="Double precision: 64 bits, divided into 1 sign bit, 11 exponent bits, and 52 fraction bits. For normal values, the implicit leading 1 gives 53 bits of significand precision. The exponent bias is 1023.">
    <div aria-hidden="true">
        <div class="fp-title">Double precision<span>64 bits total</span></div>
        <div class="fp-indexes">
            <span>bit 63</span>
            <span>bit 0</span>
        </div>
        <div class="fp-bar">
            <span class="fp-sign"></span>
            <span class="fp-exponent"></span>
            <span class="fp-fraction"></span>
        </div>
        <div class="fp-legend">
            <div class="fp-sign">Sign<small>1 bit · bit 63</small></div>
            <div class="fp-exponent">Exponent<small>11 bits · bits 62–52</small></div>
            <div class="fp-fraction">Fraction<small>52 bits · bits 51–0</small></div>
        </div>
    </div>
    <figcaption aria-hidden="true">For normal values, the implicit leading 1 gives 53 bits of significand precision. The exponent bias is 1023.</figcaption>
</figure>

There are even 128 bit versions with a higher range and precision.

## Negative side of floating point

Floating point numbers come at a cost. One is space, but that is negligible in today’s computers
with the high amount of RAM and huge bandwidth. More important is accuracy and performance of the
arithmetic operations associated with floating point.

### Performance

As mentioned before, the [i486
CPU](https://en.wikipedia.org/wiki/Intel_i486#Differences_between_the_386_and_486) integrated an
[FPU](https://en.wikipedia.org/wiki/Floating_point_unit) in its DX models, bringing hardware
floating-point support onto the CPU. This sped up the operations by a
large factor. Nearly all CPUs today have an FPU located inside of them. Graphics cards are also one
big FPU – it specializes in floating point math and can process a huge amount of floating point
numbers.

**So what is the problem?**

Well, as the forum [post](http://farseerphysics.codeplex.com/Thread/View.aspx?ThreadId=71014) (link unavailable) points
out, some devices do not have an FPU and even if they do, their floating point operations can be
**magnitudes slower** than fixed point operations. A good example is the Xbox 360 platform. It does
have an FPU and it even has the [AltiVec](https://en.wikipedia.org/wiki/AltiVec) instruction set. But
the software designed for the Xbox 360 (the .Net Compact Framework - NetCF for short) does not
utilize those instructions. This means we have [lower floating point
throughput](http://blogs.msdn.com/netcfteam/archive/2006/12/22/managed-code-performance-on-xbox-360-for-the-xna-framework-1-0.aspx)
on the Xbox360.

### Accuracy

Floating point numbers have a bad reputation of being inaccurate. Floating point numbers are not able to
represent numbers like π or 0.1 correctly and inaccuracies may create inconsistency in your
application. Let’s take an example:

If you take the sine of pi, then it should yield zero: sin(π) = 0  
That is not the case with most (if not all) floating point implementations.  sin(π) in C# yields the
following result with double precision:

approximately 1.2 × 10<sup>−16</sup>

Equality checks are also a cause of concern. If you check a condition like sin(π) = 0 then it will
yield `false` even though it is mathematically true. Normally we use
a comparison tolerance chosen for the application’s scale and acceptable error.

The floating point standard is shared, but evaluation details and math-library results can differ across platforms.
The implementation on an Intel CPU might be different from an AMD CPU. The differences can also
sometimes lie in the operating system – further fueling the inaccuracies across platforms.

## The solution

There is no perfect solution. As mentioned before it is a tradeoff and sometimes floating point is
the way to go. However, there are some alternatives.

### Fixed point

Fixed point math is based on simple integers. You can represent the number 1.200 by the value of
1200 and a scaling factor of 1000. Most fixed point libraries implement a fixed point version of
integer and then use [bit-shifting](https://web.archive.org/web/20100426005235/http://www.irixtech.com:80/java/tutorials/binary-shift-operations)
to scale the values.

Fixed point math has some advantages over floating point:

- Reproducible behavior with consistent scaling, rounding and overflow rules
  ([deterministic](/2009/08/simulators-and-determinism.html))
- Can be faster on platforms with limited floating-point support
- Storage can be chosen to match the required range and precision

But as always, there is a downside too:

- Complex implementations
- Lower range of values
- Overhead of constantly scaling values

### Double precision

Double precision floating point data types are 64bit and have a higher precision than normal 32bit
floating point. This is not really a solution as it simply shifts the problem to a whole other
dimension. It might lower the impact of the problem, but it does not go away. Sometimes it is
sufficient to switch to doubles and it is far easier to do than converting everything to fixed point
math.

Double precision can also be implemented in software on platforms without an FPU, though
performance depends on the platform and implementation.