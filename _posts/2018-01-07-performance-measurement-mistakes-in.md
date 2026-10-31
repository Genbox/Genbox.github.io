---
title: "Performance measurement mistakes in academic publications"
description: "Common mistakes in academic performance measurements, including hardware comparisons, parallelization, and asymptotic complexity."
date: "2018-01-07T16:02:00.002Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2018/01/performance-measurement-mistakes-in.html"
tags: ["Performance"]
---

One of the fastest ways to get me to stop reading a paper is to make incorrect assumptions in the
hypothesis or rely on previous work that is not completely solid. There is no doubt that research in
the academic context is hard, and writing a paper about it is even harder, but the value of all this
hard work is diminished if you make a mistake.

This time, I will focus on performance measurement mistakes in computer science papers. They come in
different flavours and are sometimes very subtle. Performance is paramount in algorithmics and some
researchers don't do their due diligence when trying to prove theirs is faster. Here are the 3 most
often occurring mistakes I see, in no particular order.

## Performance Measurements on Different Hardware

When measuring performance, it is paramount to do it under the right circumstances. Every so often I
come across a paper that states algorithm X is 4x faster than algorithm Y, but they measured it
using absolute numbers between two very different hardware configurations. Of course, if algorithm X
takes 10 ms to run, and Y takes 20 ms to run **on the same hardware**, it might be faster. I see
this problem occurring a lot in the fields of cryptocurrency (GPU acceleration) or Machine Learning
(GPU/TPU acceleration).

Researchers should use asymptotic notation - also called Big O notation - to indicate the
algorithmic complexity of their algorithm. If your algorithm is asymptotically slower than another,
such as O(n^2) vs. O(n), then it is up to you to demonstrate under which conditions your algorithm
is actually faster. Whether it be parallelization, specialization on specific architectures or even
favoured by certain compiler optimizations, it is your responsibility to make sure it is illuminated
by the paper.

If you want to demonstrate any of those specialized cases, you are measuring efficiency, which is
measured in cycles per operation. Calculate how fast your algorithm performs compared to others in
that and you will be much better off.

## Parallelization as an Excuse for Speed

As improvements in single-core performance slow, increasing core counts make parallelization
increasingly important.
Researchers today take advantage of the many cores in computers, which often leads them to make the
mistake of reporting speedups without accounting for the extra resources used.

Speed is not the same as throughput. When we measure an algorithm, we measure the efficiency of the
execution of some data. Using two cores can increase throughput or reduce a single job’s elapsed
time; efficiency also depends on the resources used. I often see the same mistake when measuring
network bandwidth. For example:

You have a 100 megabit/second network connection. That means 100.000.000 bits can flow through your
network card per second, and therefore your throughput is 100 megabits/second.

However, in order for that to make sense, you need to send it somewhere. How fast your network card
can send the data out is the speed. Let's say you send 3 packets of 5 bits each, and it takes 1 millisecond between each packet:

\[data\].\[data\].\[data\]

If packets arrive once per millisecond, the resulting throughput is 5 bits/ms; packet latency is
a separate measurement. You decide
to add another network card so you can send data in parallel:

\[data\].\[data\].\[data\]

\[data\].\[data\].\[data\]

You just doubled the aggregate throughput to 10 bits/ms, while each card still sends 5 bits/ms!

In this analogy, network cards are CPU cores. When reporting a speedup from using more cores,
state the core count and compare elapsed time, throughput and resource efficiency separately.

## Reduction of Asymptotic Notation

I've read papers that state their algorithms are constant (O(1)) in running time. Their argument is
that they split the problem into a smaller set of problems, and each problem takes 1/n to solve, and
therefore the same as O(1).

No. That is not how it works.

Algorithmic complexity describes how resource use grows with input size under a specified model.
An algorithm can have different best-case, average-case and worst-case complexity.

What you are really measuring is the algorithm’s ability to solve a particular problem, and even then
a timing for smaller inputs describes a different workload. Splitting a sorting problem into
smaller chunks still requires accounting for all chunks and any merging work. General sorting
requires at least linear work to process all elements in the usual sequential model.