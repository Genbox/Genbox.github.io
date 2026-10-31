---
title: "Simulators and determinism"
description: "Why simulations diverge across platforms and how sorting, floating-point arithmetic, and numeric representations affect determinism."
date: "2009-08-22T15:21:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/simulators-and-determinism.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css"]
---

<style>
    .prose .trajectory-diagram {
        padding: 18px;
    }

    .trajectory-diagram .shooter {
        fill: var(--text);
    }
    .trajectory-diagram .target {
        fill: none;
        stroke: var(--text);
        stroke-width: 2;
        stroke-linecap: round;
    }
    .trajectory-diagram .flight {
        fill: none;
        stroke: var(--accent);
        stroke-width: 2;
        stroke-dasharray: 5 14;
    }
    .trajectory-diagram figcaption {
        margin-top: 12px;
    }
</style>

<style>
    .prose .precision-diagram {
        break-inside: avoid;
    }
    .precision-diagram .precision-flow {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: 16px;
    }
    .precision-diagram .precision-card {
        padding: 16px;
        border: 1px solid var(--muted);
        border-radius: 6px;
        color: var(--text);
        text-align: center;
    }
    .precision-diagram .precision-card strong {
        display: block;
        color: var(--accent);
        font: 600 28px var(--mono);
    }
    .precision-diagram .precision-card span, .precision-diagram .precision-card small {
        display: block;
        margin-top: 6px;
        font-size: 12px;
        color: var(--muted);
    }
    .precision-diagram .precision-card b {
        display: block;
        margin-bottom: 14px;
        font-size: 14px;
    }
    .precision-diagram .precision-arrow {
        color: var(--accent);
        text-align: center;
        font-size: 24px;
    }
    .precision-diagram .precision-arrow small {
        display: block;
        max-width: 7em;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.5;
    }
    .precision-diagram figcaption {
        margin-top: 16px;
        line-height: 1.6;
    }
    @media (max-width: 520px) {
        .precision-diagram .precision-flow {
            grid-template-columns: 1fr;
        }
        .precision-diagram .precision-arrow > span {
            display: inline-block;
            transform: rotate(90deg);
        }
        .precision-diagram .precision-arrow small {
            max-width: none;
        }
    }
</style>

When working with simulators, it is important to understand
[determinism](https://en.wikipedia.org/wiki/Deterministic_system) and why we have trouble with
determinism across different platforms and configurations. Simulators that are iterative converge
their solution over multiple iterations and can accumulate system-inherited errors and thus can
become unstable over time.

## Why is determinism important

Does determinism in simulation systems even matter? The short answer is yes, very important. The
long answer is that simulation systems usually base their current world on the previous world. It
takes one step at a time (time step) and calculates everything based on the previous step. If you
shoot a projectile towards a target, the [trajectory of the
projectile](https://en.wikipedia.org/wiki/Trajectory_of_a_projectile) will travel in a certain curve.
If you run the same simulation on a different platform, the projectile might end up somewhere
totally different than the first simulation.

Take the following example with a projectile trajectory. They both have the same initial conditions.

Simulation on platform 1:

<figure id="bullet-hit" class="diagram diagram-panel trajectory-diagram" role="img" aria-label="Platform 1: the projectile hits the target.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 84" aria-hidden="true" focusable="false">
            <path class="shooter" d="M8 30 43 21 48 23 47 29 28 34 26 39 19 40 20 52 9 54 11 40 7 40 9 35 5 33Z" />
            <g class="target">
                <circle cx="294" cy="22" r="4.5" fill="currentColor" />
                <path d="M294 27V56M294 35 273 27M294 35 315 27M294 56 277 72M294 56 311 72" />
            </g>
            <path class="flight" d="M51 22 Q165 -2 290 22" />
        </svg>
    </div>
    <figcaption aria-hidden="true">Platform 1: the projectile hits the target.</figcaption>
</figure>

Simulation on platform 2:

<figure id="bullet-miss" class="diagram diagram-panel trajectory-diagram" role="img" aria-label="Platform 2: the projectile passes above the target.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 84" aria-hidden="true" focusable="false">
            <path class="shooter" d="M8 30 43 21 48 23 47 29 28 34 26 39 19 40 20 52 9 54 11 40 7 40 9 35 5 33Z" />
            <g class="target">
                <circle cx="294" cy="22" r="4.5" fill="currentColor" />
                <path d="M294 27V56M294 35 273 27M294 35 315 27M294 56 277 72M294 56 311 72" />
            </g>
            <path class="flight" d="M51 22 Q172 1 329 15" />
        </svg>
    </div>
    <figcaption aria-hidden="true">Platform 2: the projectile passes above the target.</figcaption>
</figure>

You would expect the results to be the same on both platforms, but they are not.

## What can affect determinism

There are several things that can affect the determinism of a simulation, the order of elements, the
rounding of floats, the low level instructions and much more. Here is a list of some examples on
what can impact determinism:

- Sorting
    - Stable vs. unstable sorting

- `float` operations
    - Rounding methods
    - Optimizations

- Hardware instructions
    - Some hardware has higher accuracy than others.

The list is by no means complete, there are hundreds of factors that can affect determinism; the
list only contains those we focus on in this post.

### Sorting

In [Farseer Physics Engine](https://github.com/Genbox/VelcroPhysics) we sort the contacts (where two
shapes touch) by the amount two shapes overlap. This way we can resolve the deepest contacts first
and get a more realistic simulation. We used to use Array.Sort() that is based on [quick
sort](https://en.wikipedia.org/wiki/Quicksort), but quick sort is not a stable sorting algorithm.
[Stable](https://en.wikipedia.org/wiki/Sorting_algorithm#Stability) in this case just means that the
order of elements is preserved if the keys that are equal are in the same order before and after
sorting. If two contacts had the same amount of penetration, they might get shuffled around and the
order of IDs will be out of order. We switched to an [insertion
sort](https://en.wikipedia.org/wiki/Insertion_sort) algorithm instead and suddenly the whole
simulation acted differently. Not a big problem since it would do that across all platforms, but
simulations recorded from previous versions of the physics simulator did not match newer versions
anymore.

### Floating point operations

Floats can be tricky to work with. I took the following example from [this article on floating
points in .net](https://csharpindepth.com/articles/FloatingPoint):

```csharp
static float f;

static void Main(string[] args)
{
    f = Sum(0.1f, 0.2f);
    float g = Sum(0.1f, 0.2f);
    Console.WriteLine(f == g);
}

static float Sum(float f1, float f2)
{
    return f1 + f2;
}
```

You would guess that the program always returns `true` - but that is **not the case**. If compiled
under release mode (to enable optimizations) with some older x86 JITs, it can return `false`. Even though you can
represent two values exactly, the result of an operation on the values might not be exact. There is a
[standard](https://en.wikipedia.org/wiki/IEEE_floating-point_standard) for floating point operations,
but it allows different platforms to return different values. This means that even if two systems
follow the same standard, they might return different values. Reproducible floating-point results require consistent inputs, evaluation order, precision and
rounding behavior.

Let us look at what happens under the hood.

<figure class="diagram diagram-panel precision-diagram" role="img" aria-label="An x87 register stores an 80-bit extended-precision value with 64 significand bits. Storing it as a 64-bit double in memory rounds it to 53 significand bits for normal values.">
    <div class="precision-flow" aria-hidden="true">
        <div class="precision-card">
            <b>x87 register</b>
            <strong>80 bits</strong>
            <span>Extended precision</span>
            <small>64 significand bits</small>
        </div>
        <div class="precision-arrow">
            <span>→</span>
            <small>Round on store</small>
        </div>
        <div class="precision-card">
            <b>Memory</b>
            <strong>64 bits</strong>
            <span>Double precision</span>
            <small>53 significand bits</small>
        </div>
    </div>
    <figcaption aria-hidden="true">Storing as a double can change the value when it does not fit the destination precision. Significand counts shown are for normal values.</figcaption>
</figure>

On x87, intermediate results can use 80-bit registers. Storing a result as a `float` rounds it to
32 bits; storing it as a `double` rounds it to 64 bits. Some
compilers optimize your code in such a way that the value in the register gets compared to the value
in memory. Since the memory value has been rounded, it may differ from the value still in the register. This
can cause the comparison behavior in the C# example above. To combat this we can do some tricks to disable `float`
optimizations. For approximate equality, compare the difference against a suitable tolerance.
Deterministic simulation also requires consistent arithmetic and branching decisions. More on
comparison tolerances further down.

### Hardware Instructions

Let us take the [fused multiply-accumulate](https://en.wikipedia.org/wiki/Multiply-accumulate)
instruction as an example. This instruction can be found in IBM PowerPC or Intel Itanium processors
that can compute ax±b with a single rounding instead of multiple. This increases accuracy (and
performance because of the fewer rounding instructions) and thus a simulation will run with higher
accuracy on the PowerPC or Intel Itanium platform compared to the PC platform.

This is just one out of many instructions. Some platforms have lower accuracy some have higher. If
you develop a simulation that runs on PC, make sure to test it on other platforms if you officially
support them.

## What can we do about it

Now that we know some of the factors that influence the determinism of a simulation we can implement
some techniques to increase the determinism.

Use stable sorting with a consistent input order, or break equal-key ties using a consistent unique ID. Anything `float`
related is a little more complicated. There are 3 methods of getting more accuracy:

- Use doubles
- Use `decimal`
- Epsilon
- Don’t use floats

### `double` and `decimal`

Using doubles simply just shifts the problem. It might not be as visible as before, but it is still
there. Floats have a precision of 7 digits while `double` has 15-16 digits. `decimal` on the other hand
can represent many decimal fractions exactly, but still has finite precision and rounding errors. (They have a precision of
28-29 digits by the way). Take a look at the following example:

```csharp
static void Main(string[] args)
{
    Console.WriteLine(0.1 + 0.2 == 0.3);
}
```

The code above will write `false` for reasons described earlier in this post. The same code using the
[`decimal` data type](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types):

```csharp
static void Main(string[] args)
{
    Console.WriteLine(0.1m + 0.2m == 0.3m);
}
```

The above example will return `true`, just like we would expect. Performance of decimals is not as
high as with floats or integers because of the added precision. But places where accuracy is
paramount, it might be the only solution.

### Epsilon

[`float.Epsilon`](https://learn.microsoft.com/en-us/dotnet/api/system.single.epsilon) is the smallest positive `float` value greater
than zero in .NET. It is not machine epsilon or a useful general comparison tolerance.

```csharp
static bool Equals(float f1, float f2)
{
    const float tolerance = 1e-6f; // Example absolute tolerance for finite values.
    return Math.Abs(f1 - f2) <= tolerance;
}
```

Choose the tolerance for the application's scale and acceptable error; this is not a universal equality rule.

### Fixed point

The last thing is to simply not use floats and use integers instead. This is also called [fixed
point arithmetic](https://en.wikipedia.org/wiki/Fixed-point_arithmetic). In fixed point math you have a
fixed number of digits after the [radix point](https://en.wikipedia.org/wiki/Radix_point). It is
basically an integer that you scale using some scale factor. Take the number 1.595 as an example.
That is the same as 1595/1000 – so 1000 is the scale factor here. Not only can this improve
accuracy, but it can also improve performance on devices without a
[FPU](https://en.wikipedia.org/wiki/Floating_point_unit).

## Conclusion

Use stable sorting methods if the order of elements is important and make sure to take great care
with floats in algorithms that are sensitive to small errors. Use doubles if you simply need more
precision or use fixed point math if you need exact values. Floating point values are not evil, they
are a trade-off between performance and accuracy, but you might need to do equality checks in places
where you do `float` operations.