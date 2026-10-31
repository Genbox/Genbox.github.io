---
title: "Performance tips and tricks – part 1"
description: "C# performance techniques for loops, constants, and simplifying calculations, with examples of moving work out of repeated operations."
date: "2009-08-18T20:51:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/performance-tips-and-tricks-part-1.html"
tags: ["Performance", "C#"]
---

In this post series I will take a look at the different tips and tricks that can increase the
performance of your application. You probably already know some of them and some of them are even
just a bit of logical thinking. In any case, it should help you remember the different techniques. I
took all these tips and tricks out of my article High Performance Game Development (The revised
version – coming out soon) since they apply to almost all languages.

## Move work out of loops

This one is kind of obvious, but it can be hard to identify in some cases. You simply move work from
inner loops to outer loops or even out of a loop altogether. I’ve made some simple examples of this:

Before:

```csharp
double result = 0;
for (int i = 0; i < 10000; i++)
{
    for (int j = 0; j < 10000; j++)
    {
        result += Math.PI;
    }
}
```

After:

```csharp
double result = 0;
for (int i = 0; i < 10000; i++)
{
    result += Math.PI * 10000;
    for (int j = 0; j < 10000; j++)
    {
    }
}
```

Replacing repeated floating-point additions with multiplication changes rounding, so check that
the resulting accuracy meets your needs.

## Don’t use loops

This is much like the previous one. One important difference is that you don’t use loops at all. You
will save a lot of instructions and thus you will have better performance.

Before:

```csharp
double result = 0;
for (int i = 0; i < 10000000; i++)
{
    result += Math.PI;
}
```

After:

```csharp
double result;
result = Math.PI * 10000000;
```

## Use constants whenever possible

Using constants lets the compiler evaluate constant expressions at compile time. The JIT may also
optimize the local-variable version below, so measure the actual performance difference.

Before:

```csharp
float ten = 10f;
float twenty = 20f;
float addition = ten + twenty;
```

After:

```csharp
const float ten = 10f;
const float twenty = 20f;
const float addition = ten + twenty;
```

Note how we can use the `const` keyword on the addition variable. This is only possible when the
dependent variables are also marked with the `const` keyword.

## Simplify variables

Whenever you can, make sure to simplify variables by removing redundant operations. This might not
always be possible and sometimes it can severely decrease the code readability. In this specific
case you can maintain the readability by simply using the `const` keyword. The compiler will then
simplify the variables for you.

Before:

```csharp
int offset = 10;
int centerX = 300;
int centerY = 300;

Vector2 center = new Vector2(centerX + offset + 50, centerY + offset + 10);
```

After:

```csharp
Vector2 center = new Vector2(360, 320);
```