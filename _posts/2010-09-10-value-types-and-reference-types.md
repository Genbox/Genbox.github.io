---
title: "Value types and reference types explained"
description: "Explaining how C# value and reference types behave when assigned or passed to methods, including examples using the ref keyword."
date: "2010-09-10T21:11:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2010/09/value-types-and-reference-types.html"
tags: ["C#"]
---

**Note:** This post reflects C# in 2010. [C# 10](https://devblogs.microsoft.com/dotnet/welcome-to-csharp-10/)
later added support for explicit parameterless `struct` constructors and instance field initializers.

There are two types of data types in the .NET framework: Value and reference types.

Let’s first have a look at the [value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types?redirectedfrom=MSDN):

1. A value-type variable contains its data directly.
2. A value type's lifetime depends on where it is stored and how it is used.
3. When you pass a value type by value, its data is copied.
4. Passing a value type to a parameter of type `object` boxes a copy of its value.

Value types are suitable for representing lightweight objects such as vectors, matrices and colors.
Value types can reduce memory overhead by storing data inline. However, there are a few things that are worth mentioning:

- [Structs](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct) can’t have a default
  parameterless constructor. It is provided by default and it initializes all the fields to their
  default values.

- You can’t initialize an instance field inside a `struct`
- Structs implicitly inherit from `System.ValueType` and can implement interfaces.

Value types can avoid separate object allocations, but their copying and boxing costs also matter. The [16-byte guideline](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct?redirectedfrom=MSDN)
is a starting point; measure allocation and copying costs for your workload.

Now, let us have a look at [reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types?redirectedfrom=MSDN):

1. Objects of reference types typically reside on the managed heap.
2. A reference-type variable contains a reference to an object or `null`.
3. Objects become eligible for garbage collection when they are unreachable from live roots.
4. Are passed by value by default: a copy of the reference is passed.

For your convenience, here is a list of value and reference types:

| Value types                                                                                                                 | Reference types                                                |
|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| Enums<br> structs<br> `bool`, DateTime and `char`<br> `decimal`<br> `byte`, `short`, `int`, `long`<br> `float` and `double` | Classes<br> Delegates<br> Exceptions<br> Attributes<br> Arrays |

## The `ref` keyword

The `ref` keyword is very important when it comes to both performance and the behavior of value and
reference types. If you put `ref` in front of a parameter in a method, the argument is passed by
reference regardless of whether it is a value or reference type.

Example:

```csharp
static void Main(string[] args)
{
    Uri uri = new Uri("http://google.com");

    MyMethod(ref uri);

    Console.WriteLine(uri.AbsoluteUri);
    Console.ReadLine();
}

private static void MyMethod(ref Uri uri)
{
    uri = new Uri("http://google.it");
}
```

The output of this application is “http://google.it/”. With `ref` removed from both the parameter and the call,
the output would be “http://google.com/”. This is because `ref` gives the method access to the caller's variable, allowing it to replace the reference. Passing a value type with `ref` gives the method direct access to the caller’s variable.