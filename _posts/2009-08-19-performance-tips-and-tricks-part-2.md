---
title: "Performance tips and tricks – part 2"
description: "Exploring the performance implications of sealed, static, struct, ref, out, and unsafe in C#."
date: "2009-08-19T18:33:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/performance-tips-and-tricks-part-2.html"
tags: ["Performance", "C#"]
---

In part 1 I presented you with some tricks on loop optimizations and constants. This time I’ll show
you some simple keywords in C# that can speed up the execution of your code for various reasons.

## `sealed` keyword

Marking a class as [`sealed`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed) makes
it unable to be used as a base class. This is primarily used to prevent other classes from
deriving from it. This can unlock some run-time optimizations.

Before:

```csharp
public class MyClass
{
}
```

After:

```csharp
public sealed class MyClass
{
}
```

## `static` keyword

The [`static`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/static) keyword
associates a member with its type. A `static` class groups `static` members. You can read
more about the `static` keyword in the link – be careful with it, you should only use it where
appropriate.

Before:

```csharp
public class UnitHelper
{
}
```

After:

```csharp
public static class UnitHelper
{
}
```

## `struct` keyword

There are two types of allocations in C#: [Stack and
heap](https://www.c-sharpcorner.com/article/C-Sharp-heaping-vs-stacking-in-net-part-i)

Local values may reside on the stack or in registers. Objects normally reside on the managed heap,
with value-type fields and array elements stored inline.

Using a `struct` can avoid a separate object allocation. [Choose value types](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct?redirectedfrom=MSDN)
when their copying and storage behavior suit the data.

Before:

```csharp
public class UnitData
{
    public int Health;
    public int Level;
}
```

After:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}
```

## `ref` keyword

Using [`ref`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/ref) can sometimes greatly
improve performance. It passes the variable by *reference* instead of copying its value. If
this sounds like gibberish to you, take a look at the following article: [Parameter passing in
C#](https://jonskeet.uk/csharp/parameters.html)

Beware that the before example does actually not change the unit data. It only changes a *copy*
of the data. The calling class will not upgrade the unit.

Also, have in mind that this can also decrease performance. The overhead of dereferencing the value
type can exceed the overhead of copying by value. Always test if you actually get more performance.

Before:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}

public class UnitHelper
{
    public void UpgradeUnit(UnitData data)
    {
        data.Health += 100;
        data.Level += 1;
    }
}
```

After:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}

public class UnitHelper
{
    public void UpgradeUnit(ref UnitData data)
    {
        data.Health += 100;
        data.Level += 1;
    }
}
```

## `out` keyword

Both `ref` and [`out`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/out) give access to the caller’s variable.
A `ref` argument must be assigned before the call; an `out` parameter must be assigned by the method
before it returns normally.

Before:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}

public class UnitHelper
{
    public void UpgradeUnit(UnitData data)
    {
        data.Health += 100;
        data.Level += 1;
    }
}
```

After:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}

public class UnitHelper
{
    public void UpgradeUnit(out UnitData data)
    {
        data = new UnitData();
        data.Health += 100;
        data.Level += 1;
    }
}
```

Note: The `out` version assigns a new UnitData to the caller’s variable and initializes its fields
from zero. Use `ref` when you want to upgrade the caller’s existing values.

## `unsafe` keyword

The [`unsafe`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/unsafe) keyword is not used
very often because of its nature and a name that can scare away most developers. Not to worry, the
`unsafe` keyword enables the use of C concepts like
[pointers](https://en.wikipedia.org/wiki/Pointer_%28computing%29). Pointers are not just grab and go
knowledge and they can cause havoc if used incorrectly.

Remember to turn on `unsafe` code in the project build properties. Also remember to use the
[`fixed`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/fixed) keyword to pin the memory
location of variables or use the
[`stackalloc`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/stackalloc) keyword to allocate
memory outside of the garbage collected memory.

Before:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}

public static void UpgradeUnit(ref UnitData data)
{
    data.Health += 100;
    data.Level += 1;
}

static void Main(string[] args)
{
    UnitData data = new UnitData();
    data.Health = 100;
    data.Level = 0;

    UpgradeUnit(ref data);
}
```

After:

```csharp
public struct UnitData
{
    public int Health;
    public int Level;
}

public unsafe static void UpgradeUnit(UnitData* data)
{
    data->Health += 100;
    data->Level += 1;
}

static void Main(string[] args)
{
    UnitData data = new UnitData();
    data.Health = 100;
    data.Level = 0;

    unsafe
    {
        UpgradeUnit(&data);
    }
}
```

Note how the arrow (-\>) is used instead of the dot (.) when accessing members.