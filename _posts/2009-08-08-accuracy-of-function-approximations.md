---
title: "The accuracy and speed of function approximations"
description: "Comparing polynomial and Taylor-series sine approximations, with charts showing their accuracy across different inputs."
date: "2009-08-08T18:53:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2009/08/accuracy-of-function-approximations.html"
tags: ["Algorithms", "Performance"]
---

Function approximations trade accuracy for simplicity or speed. Their accuracy depends on the
formula and the input interval. But just *how* accurate are the different approximations? Here I
will take a look at the [accuracy](https://web.archive.org/web/20090712072343/http://ee.stlcc.info:80/130/accuracy.htm) of the different sine
function approximations.

First off, what exactly are we going to approximate? Let us take a look at the sine function in a
graph:

```chart
id: sine
type: function
title: The sine function
description: sin(x) from −π to π, rising from 0 to 1 at π/2 and falling to −1 at −π/2.
x: [-pi, pi]
x_ticks: pi
series:
  - { name: "sin(x)", fn: sin }
```

The X axis goes from –π to π.

Let the approximation begin. We start out with a polynomial approximation. We simply use a
[quadratic equation](https://en.wikipedia.org/wiki/Quadratic_equation) to approximate the curve of
the sine function as best as we can. I came [across a
post](https://www.devmaster.net/forums/showthread.php?t=5784) where a guy used –π, -π/2, 0, π/2,π as
points of reference and derived a function from that. He came up with:

{aria-label="Sine approximation" }

$$
1.27323954x - 0.405284735 \cdot x^2
$$

Without getting too much into the details, this quadratic equation only approximates the curve of
the interval \[0 ; π\]. Putting this equation into a graph with the real sine function gives us
this:

```chart
id: poly-sine
type: function
title: Sine and the quadratic approximation
description: sin(x) and 1.27323954x − 0.405284735x² from 0 to π. The quadratic matches at 0, π/2 and π and bulges above sine in between.
x: [0, pi]
x_ticks: pi
error: true
series:
  - { name: "sin(x)", fn: sin }
  - { name: "1.27323954x − 0.405284735x²", fn: poly, coefficients: [0, 1.27323954, -0.405284735] }
```

Blue is our sine function and the dashed green line is our quadratic equation. As you can see, the quadratic function
is approximately correct at 0, π/2 and π with the rounded coefficients shown. Now let us have a look at the good old [Taylor
Series](https://en.wikipedia.org/wiki/Taylor_series) approximation of sine:

```chart
id: taylor-sine
type: function
title: Sine and the truncated Taylor polynomial
description: sin(x) and x − x³/3! + x⁵/5! − x⁷/7! from 0 to π. They are indistinguishable up to π/2, then the polynomial falls below sine and ends just under zero at π.
x: [0, pi]
x_ticks: pi
error: true
series:
  - { name: "sin(x)", fn: sin }
  - { name: "x − x³/3! + x⁵/5! − x⁷/7!", fn: poly, coefficients: [0, 1, 0, -1/6, 0, 1/120, 0, -1/5040] }
```

Blue is our sine function and the dashed green line is our truncated Taylor polynomial. Pretty neat huh? It is impossible to tell
the difference between the two functions from the interval \[0;π/2\], but then it starts to deviate.
Suffice to say that we can see from our results that this Taylor polynomial is more
accurate over the plotted interval – or is it? Stay tuned for part 2.