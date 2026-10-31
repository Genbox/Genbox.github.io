---
title: "Raycasting explained"
description: "How raycasting works and how games use it for collision tests, visibility, jumping, and vehicle suspension."
date: "2009-08-26T17:45:00.001Z"
last_modified_at: "2010-01-15T16:47:29.912Z"
permalink: "/2009/08/raycasting-explained.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css", "vector-diagrams.css"]
---

[Raycasting](https://en.wikipedia.org/wiki/Raycasting) can be an extremely useful tool in computer
games. There is a lot of confusion on what raycasting really is and how it can be used. I’ll try to
explain some of it in simple terms and give some simple examples.

Raycasting - as the name suggests involves a ray – but what exactly is a ray?

A ray is part of a line which is finite in one direction, but infinite in the other. It can be
defined by two points, the initial point, A, and one other, B.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Line_%28mathematics%29#Ray)

In [Farseer Physics Engine](https://github.com/Genbox/VelcroPhysics) we define a ray as two vectors;
start and end. We can for obvious reasons not have an infinite length ray, we have to have some kind
of boundary where the ray stops. This means that rays essentially become lines and then we simply
use those lines to test for collisions with other stuff like other lines,
[AABB](https://en.wikipedia.org/wiki/Axis-aligned_bounding_box) or geometries.

## Collision testing

There are 4 test cases that can be performed:

1. Point
2. Line
3. AABB
4. Geometry

The great thing about all those (except number 1) is that they can be reduced to simple line vs.
line tests. An AABB is made up of 4 lines and a geometry is made of N (where N \> 2) lines. With
this in mind we just have to know how to test two lines against each other.

This is done simply by using a [linear equation](https://en.wikipedia.org/wiki/Linear_equation) from
basic algebra:

{aria-label="Straight-line equation" }

$$
y = mx + b,
$$

Using this equation we can create a line. *m* is the amount that the y-value grows or shrinks with
each time x increases by 1. *b* is the point on which the line crosses the y-axis. With this knowledge
we can draw a line like this:

<figure id="ray-one-line" class="diagram diagram-panel vector-diagram" role="img" aria-label="Coordinate plot. The line y = 2x + 1 has slope 2 and crosses the y-axis at 1.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380" aria-hidden="true" focusable="false">
            <line x1="74.00" y1="30.00" x2="74.00" y2="350.00" class="grid"/>
            <text x="74" y="210" text-anchor="middle">-4</text>
            <line x1="42.00" y1="318.00" x2="362.00" y2="318.00" class="grid"/>
            <text x="192" y="322" text-anchor="end">-4</text>
            <line x1="138.00" y1="30.00" x2="138.00" y2="350.00" class="grid"/>
            <text x="138" y="210" text-anchor="middle">-2</text>
            <line x1="42.00" y1="254.00" x2="362.00" y2="254.00" class="grid"/>
            <text x="192" y="258" text-anchor="end">-2</text>
            <line x1="202.00" y1="30.00" x2="202.00" y2="350.00" class="grid"/>
            <line x1="42.00" y1="190.00" x2="362.00" y2="190.00" class="grid"/>
            <line x1="266.00" y1="30.00" x2="266.00" y2="350.00" class="grid"/>
            <text x="266" y="210" text-anchor="middle">2</text>
            <line x1="42.00" y1="126.00" x2="362.00" y2="126.00" class="grid"/>
            <text x="192" y="130" text-anchor="end">2</text>
            <line x1="330.00" y1="30.00" x2="330.00" y2="350.00" class="grid"/>
            <text x="330" y="210" text-anchor="middle">4</text>
            <line x1="42.00" y1="62.00" x2="362.00" y2="62.00" class="grid"/>
            <text x="192" y="66" text-anchor="end">4</text>
            <line x1="42.00" y1="190.00" x2="370.00" y2="190.00" class="axis"/>
            <line x1="202.00" y1="350.00" x2="202.00" y2="20.00" class="axis"/>
            <text x="373" y="207" class="plot-label">x</text>
            <text x="213" y="22" class="plot-label">y</text>
            <line x1="106.00" y1="350.00" x2="266.00" y2="30.00" class="curve"/>
        </svg>
        <div class="vector-legend">
            <span class="legend-primary">Solid: y = 2x + 1</span>
        </div>
    </div>
    <figcaption aria-hidden="true">The line y = 2x + 1 has slope 2 and crosses the y-axis at 1.</figcaption>
</figure>

It has the equation: y = 2\*x+1

Now that we know how to create a line, we need a second one to test against:

<figure id="ray-two-lines" class="diagram diagram-panel vector-diagram" role="img" aria-label="Coordinate plot. The lines y = 2x + 1 and y = −x + 1 intersect at (0, 1).">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380" aria-hidden="true" focusable="false">
            <line x1="74.00" y1="30.00" x2="74.00" y2="350.00" class="grid"/>
            <text x="74" y="210" text-anchor="middle">-4</text>
            <line x1="42.00" y1="318.00" x2="362.00" y2="318.00" class="grid"/>
            <text x="192" y="322" text-anchor="end">-4</text>
            <line x1="138.00" y1="30.00" x2="138.00" y2="350.00" class="grid"/>
            <text x="138" y="210" text-anchor="middle">-2</text>
            <line x1="42.00" y1="254.00" x2="362.00" y2="254.00" class="grid"/>
            <text x="192" y="258" text-anchor="end">-2</text>
            <line x1="202.00" y1="30.00" x2="202.00" y2="350.00" class="grid"/>
            <line x1="42.00" y1="190.00" x2="362.00" y2="190.00" class="grid"/>
            <line x1="266.00" y1="30.00" x2="266.00" y2="350.00" class="grid"/>
            <text x="266" y="210" text-anchor="middle">2</text>
            <line x1="42.00" y1="126.00" x2="362.00" y2="126.00" class="grid"/>
            <text x="192" y="130" text-anchor="end">2</text>
            <line x1="330.00" y1="30.00" x2="330.00" y2="350.00" class="grid"/>
            <text x="330" y="210" text-anchor="middle">4</text>
            <line x1="42.00" y1="62.00" x2="362.00" y2="62.00" class="grid"/>
            <text x="192" y="66" text-anchor="end">4</text>
            <line x1="42.00" y1="190.00" x2="370.00" y2="190.00" class="axis"/>
            <line x1="202.00" y1="350.00" x2="202.00" y2="20.00" class="axis"/>
            <text x="373" y="207" class="plot-label">x</text>
            <text x="213" y="22" class="plot-label">y</text>
            <line x1="106.00" y1="350.00" x2="266.00" y2="30.00" class="curve"/>
            <line x1="74.00" y1="30.00" x2="362.00" y2="318.00" class="secondary"/>
            <circle class="contact" cx="202" cy="158" r="4"/>
            <text x="216" y="148" class="plot-label">(0, 1)</text>
        </svg>
        <div class="vector-legend">
            <span class="legend-primary">Solid: y = 2x + 1</span>
            <span class="legend-secondary">Dashed: y = −x + 1</span>
        </div>
    </div>
    <figcaption aria-hidden="true">The lines y = 2x + 1 and y = −x + 1 intersect at (0, 1).</figcaption>
</figure>

This line has the equation y = –1\*x+1. From what we gathered earlier, *b* was the point where the
line crosses the y-axis. Since both linear equations have a *b* value of 1, they must be intersecting
each other there at (0, 1).

For these two lines, we solve the equations together to find their intersection. For collision
testing, the intersection must also lie within both line segments. A general implementation must
handle vertical lines, parallel lines and overlapping segments.

{aria-label="Line intersection calculation" }

$$
\begin{aligned}
\mathit{solve}(l_1 = l_2) &= 0 \\
2 \cdot 0 + 1 &= 1
\end{aligned}
$$

So our intersection point is at (0,1). Exactly how this is done in code is a little more
complicated. In Farseer Physics Engine we implemented line intersection like described here:
[Intersection Point Of Two Lines](https://paulbourke.net/geometry/pointlineplane/)

## Usage

Now we know that raycasting operates on lines, but how can this be applied to games? Here is a list
of a few examples:

- Collision detection
- Distance calculation
- Jumping
- Lasers
- Field of view
- Lighting
- Suspension
- Many more…

You can use rays for collision detection and check the distance between the two objects. You can
also use it for [smooth jumping](https://boxycraft.wordpress.com/2009/06/30/behind-boxboy/) on to
platforms and even [car
suspension](https://web.archive.org/web/20101127070734/http://newtondynamics.com/wiki/index.php5?title=Making_a_raycast_car). Another
common usage is finding the [field of view](https://www.permadi.com/tutorial/raycast/rayc4.html). The
only limit is your imagination.

Ray casts are cheap, but they should not be used for everything. Some physics engines incorporate
rays into their [broad phase
collider](/2010/07/broad-and-narrow-phase-collision.html) to speed up
permanent rays. This will soon be implemented into Farseer Physics Engine too.