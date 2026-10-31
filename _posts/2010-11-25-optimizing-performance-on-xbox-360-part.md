---
title: "Optimizing performance on the Xbox 360 – part 2"
description: "Further Xbox 360 optimization techniques, including struct usage, object reuse, boxing, and references for measuring performance."
date: "2010-11-25T19:16:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2010/11/optimizing-performance-on-xbox-360-part.html"
tags: ["Performance", "Game Development"]
---

In [part 1](/2010/11/optimizing-performance-for-xbox-360.html) I described the reasons why Xbox 360
is slower than an equivalent PC and some of the basic recommendations for optimizing C# code to
make it run faster. In this post I will mention a few other tricks to increase performance on the
Xbox 360.

## Structures… again.

In the .NET world, class instances are allocated on the managed heap. Structures can be stored on
the stack or inline inside objects and arrays. Inline structures share the lifetime of their
containing object or array and can reduce separate heap allocations. This means you can reduce garbage collection and
increase speed by using structures instead of objects – however, you need to know the
[difference](/2010/09/value-types-and-reference-types.html) between the two. You should also follow
the general recommendations for using structures:

- Small data objects (data containers)
- Often destroyed or created
- Read-only (or mostly-read) objects

## Reuse those objects

As mentioned before, objects are allocated on the heap that is garbage collected. That is why you
should avoid creating a lot of objects on each update. Instead, you should reuse the objects using
pools as explained in [part 1](/2010/11/optimizing-performance-for-xbox-360.html). Another and
simpler way is to move the object to an outer scope with the appropriate lifetime. Use `static`
when one shared instance is appropriate. One object that you should
pay close attention to is the
[SpriteBatch](https://learn.microsoft.com/en-us/previous-versions/windows/xna/bb200104(v=xnagamestudio.41)?redirectedfrom=MSDN)
(if you are using [XNA](https://web.archive.org/web/20110103084200/http://create.msdn.com:80/en-US)). Do not create the SpriteBatch object on
each update, but keep a reference to it throughout the game.

You should also pay attention to [List\<T\>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1?view=net-10.0&redirectedfrom=MSDN),
arrays and other commonly used list types. When you create a new List\<T\> and add a single item to
it, it will initialize an array with a size of 4. If you add more than 4 elements, it will create a
new array with double the size. The old backing array becomes eligible for garbage collection, while the list uses the new array. To keep
that from happening, you should initialize List\<T\> with a capacity that is equal to what you need.
To keep the List\<T\> from being garbage collected, you should move the list to an outer scope and
clear it before use instead of initializing a new instance.

## Boxing

[Boxing](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing) is the process of encapsulating a
value type in a reference type container. This is great as it allows us to pass value types as
objects to methods or store them in collections as objects. However, this is not great for
performance and we have to eliminate boxing and unboxing where we can. You can use tools like
[Reflector](https://www.red-gate.com/products/reflector/) or
[Ildasm](https://learn.microsoft.com/en-us/previous-versions/dotnet/netframework-2.0/f7dy01k1(v=vs.80)?redirectedfrom=MSDN) to disassemble your
application to [MSIL](https://en.wikipedia.org/wiki/MSIL) code. Inside the MSIL code you simply look
for the **box** and **unbox** keywords. You can find more info along with pictures in my post
[Performance Tips and Tricks Part 4](/2009/09/performance-tips-and-tricks-part-4.html).

## Further reading

I recommend you read two GDC 2008 PowerPoint presentations. [CLR
Performance](https://web.archive.org/web/20110216004532/http://www.microsoft.com:80/downloads/en/details.aspx?FamilyId=8450DB46-283F-4924-B35C-3CCD1DB7E97E&displaylang=en)
by Frank Savage and [Understanding XNA Framework
Performance](https://web.archive.org/web/20110127171058/http://www.microsoft.com:80/downloads/en/details.aspx?FamilyId=B11AD912-4158-44CC-A771-A5E044F7E3BB&displaylang=en)
by [Shawn Hargreaves](https://shawnhargreaves.com/blogindex.html).