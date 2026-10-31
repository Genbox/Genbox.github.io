---
title: "Performance tips and tricks – part 3"
description: "How method inlining and loop unrolling work, what can prevent inlining, and when manual optimization may help."
date: "2009-08-20T00:18:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/performance-tips-and-tricks-part-3.html"
tags: ["Performance", "C#"]
---

In [part 2](/2009/08/performance-tips-and-tricks-part-2.html) I gave a list of the different C#
keywords that could potentially increase the performance of your code. This time we take a look at
the different manual inlining techniques – it will not be like the two previous posts as this one
can’t be presented in simple code snippets. The compiler is normally in charge of doing those kinds
of optimizations, but sometimes it might not because of some requirements. First off, let’s get an
overview of the different optimizations done by the JIT compiler:

- [Constant folding](https://en.wikipedia.org/wiki/Constant_folding)
- [Constant and copy propagation](https://en.wikipedia.org/wiki/Copy_propagation)
- [Common subexpression elimination](https://en.wikipedia.org/wiki/Common_subexpression_elimination)
- [Code motion of loop invariants](https://en.wikipedia.org/wiki/Loop-invariant_code_motion)
- [Dead store](https://en.wikipedia.org/wiki/Dead_store) and [dead code
  elimination](https://en.wikipedia.org/wiki/Dead_code_elimination)

- [Register allocation](https://en.wikipedia.org/wiki/Register_allocation)
- [Method inlining](https://en.wikipedia.org/wiki/Inline_function)
- [Loop unrolling](https://en.wikipedia.org/wiki/Loop_unwinding) (small loops with small bodies)
- [More…](https://www.codeproject.com/KB/dotnet/JITOptimizations.aspx)

As you see, it is quite effective and contains the most commonly used optimization techniques required by
modern compilers.

## Why manually optimize?

Well, the problem is that while the compiler almost always takes the right path, there are times
where manual inlining is necessary. One example is when you are using an old .net version like 2.0;
It will [not inline
methods](https://web.archive.org/web/20091013064231/http://connect.microsoft.com/VisualStudio/feedback/ViewFeedback.aspx?FeedbackID=93858)
that take struct parameters.

Another example is automatic properties. They will get inlined in release mode and all that, but
they are considered regular methods by the compiler and thus still fall under the requirements of
the compiler (see them further down).

## Method inlining

The older .NET x86 JIT has a [few
requirements](https://learn.microsoft.com/en-us/archive/blogs/vancem/to-inline-or-not-to-inline-that-is-the-question)
for a method before it can be inlined; these limits vary by JIT and runtime version:

- Methods that are greater than 32 bytes of IL will not be inlined.
- `virtual` functions are not inlined.
- Methods that have complex flow control will not be in-lined. Complex flow control is any flow
  control other than `if/then/else;` in this case, `switch` or `while`.

- Methods that contain exception-handling blocks are not inlined, though methods that throw
  exceptions are still candidates for inlining.

While all of them are great requirements and suffice to say that the compiler is really clever in
this area (it determines inlining depending on cache size etc.) a few of those items can pose as
limitations in your application. More precisely: `virtual` functions, `struct` arguments and exception
handling. I’m going to take each of them separately.

### `virtual` calls

The only way to get around this one is to simply not use `virtual` calls. If you have a way of getting
rid of `virtual` methods, do it. The overhead of `virtual` calls depends on the runtime and call site. If you get rid of them, the compiler might also inline more methods.

### `struct` arguments

.Net 3.5 SP1 brought some improvements to this area and it now considers methods with `struct`
arguments as candidates for inlining. However, if you use \< .net 3.5 SP1, you will need to identify
the methods yourself and inline them manually.

### Exception handling

I’m not going to tell you not to do exception handling. While there are other ways of reporting
errors, you might be forced to use `try`/`catch`. To get around this you need to make sure that the
expensive methods do not contain exception handling code. Always test input once and
then send it off to be calculated on.

Another thing is properties. You might have a ListCapacity property that checks if the list capacity
is \< 0 and throws an error if that is the case. Using that property directly in a loop can give you
a performance penalty. Instead you should have a backing field (a simple variable) that contains the
value and get/set from/to that instead.

## Loop unrolling

As I mentioned in [part 1](/2009/08/performance-tips-and-tricks-part-1.html), you should move your
work outside of loops and you should not even use loops if you don’t need to. Loop unrolling is
(almost) the same thing. A classic example of loop unrolling:

Before:

```csharp
double value = 0;
for (int i = 1; i < 4; i++)
{
    value += Math.Sqrt(i);
}
```

After:

```csharp
double value = 0;
value += Math.Sqrt(1);
value += Math.Sqrt(2);
value += Math.Sqrt(3);
```

The JIT compiler can unroll small loops with small bodies. Unrolling a huge loop is very inefficient
since the code size would increase and thus you will get slower code execution. But intelligently
unrolling a loop can greatly increase performance, so beware of what you unroll and remember to
profile it.