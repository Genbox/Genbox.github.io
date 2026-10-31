---
title: "The accuracy and speed of function approximations – part 2"
description: "Comparing higher-degree polynomials and Taylor series to improve the accuracy of sine approximations."
date: "2009-08-08T19:21:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/accuracy-and-speed-of-function.html"
tags: ["Algorithms", "Performance"]
---

In [part 1](/2009/08/accuracy-of-function-approximations.html) we took a look at two different
function approximations: a quadratic polynomial and a truncated Taylor polynomial. The Taylor
polynomial was more accurate over the plotted interval – can we improve the quadratic approximation?

The quadratic equation is fine in some cases. If you want to create a swinging hammer, a wave or the
movement for a platform; this approximation is fine. But we can add some extra precision to the
function and get it to be even more accurate. The new function looks like this:

{aria-label="Corrected sine approximation" }

$$
\begin{aligned}
f(x) &= 1.27323954x - 0.405284735 \cdot x^2 \\
g(x) &= .225 \cdot (f(x)^2 - f(x)) + f(x)
\end{aligned}
$$

The first function *f* defines the sine approximation and the second function *g* adds some extra
precision, producing a fourth-degree polynomial on this interval. The result will look like this:

```chart
id: corrected-sine
type: function
title: Sine and the corrected polynomial
description: sin(x) and the corrected approximation g(x) from 0 to π. The two curves are almost identical over the whole interval.
x: [0, pi]
x_ticks: pi
error: true
series:
  - { name: "sin(x)", fn: sin }
  - { name: "g(x)", fn: corrected_poly, coefficients: [0, 1.27323954, -0.405284735] }
```

We are nearly unable to distinguish the two lines from each other. The rounded coefficients give
approximate agreement at 0, π/2 and π. This corrected polynomial is more accurate than the Taylor
polynomial used here over the plotted interval – but accuracy is not everything. We will take a look at the performance
in part 3.