---
title: "That new code smell – with a C# example"
description: "A C# sine approximation using a Taylor series, written for the High Performance Game Development article."
date: "2009-08-08T17:59:00.002Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/that-new-code-smell-with-c-example.html"
tags: ["Algorithms", "Performance"]
---

The High Performance Game Development article is coming along fine. I wrote up some C# code that
follows with the article, most of the code consists of examples of [transcendental
function](https://en.wikipedia.org/wiki/Transcendental_function) approximations.

Here is a pretty example of a sine function using [Taylor
Series](https://en.wikipedia.org/wiki/Taylor_series). This seventh-degree polynomial takes radians
and is most accurate near zero; accuracy deteriorates as the input moves farther from zero:

```csharp
public static float FastSin(float x)
{
    return x - ((x * x * x) / 6) + ((x * x * x * x * x) / 120) - ((x * x * x * x * x * x * x) / 5040);
}
```

Much more to come!