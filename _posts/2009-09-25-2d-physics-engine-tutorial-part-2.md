---
title: "2D physics engine tutorial – part 2"
description: "How broad-phase and narrow-phase collision detection fit together inside a 2D physics engine."
date: "2009-09-25T17:06:00.001Z"
last_modified_at: "2009-09-27T17:29:38.363Z"
permalink: "/2009/09/2d-physics-engine-tutorial-part-2.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css", "vector-diagrams.css", "physics-diagrams.css"]
---

<style>
    .prose .bounds-diagram {
        padding: 18px;
        max-width: 520px;
        break-inside: avoid;
    }
    .bounds-diagram .bounds-title {
        margin-bottom: 16px;
        color: var(--text);
        font-size: 15px;
        font-weight: 600;
    }
    .bounds-diagram .bounds-scene {
        position: relative;
        aspect-ratio: 4 / 3;
        background: var(--surface-2);
        border-radius: 6px;
    }
    .bounds-diagram .bounds-object {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: 12%;
        aspect-ratio: 1;
        transform: translate(-50%, -50%);
    }
    .bounds-diagram .bounds-object::before {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        border: 2px solid #13161b;
        border-radius: 50%;
        background: #e7e9ec;
    }
    .bounds-diagram.with-bounds .bounds-object {
        outline: 2px solid var(--accent);
    }
    .bounds-diagram figcaption {
        margin-top: 14px;
        line-height: 1.6;
    }
</style>

In [part 1](/2009/09/2d-physics-engine-tutorial-part-1.html) I explained what a physics engine does
and what kind of physics engines there exist. This post will focus on the collision detection
internals of physics engines.

## Overview

A physics engine does two things: Collision detection and physics reaction. They work seamlessly
together to create the illusion of things colliding and bouncing back.

<figure class="diagram diagram-panel physics-diagram" role="img" aria-label="A physics engine has two cooperating components: collision detection finds contacts, and physics response resolves their effects on motion.">
    <div aria-hidden="true">
        <div class="physics-node physics-root">Physics engine</div>
        <div class="physics-trunk"></div>
        <div class="physics-branches">
            <div class="physics-branch">
                <div class="physics-node">Collision detection<small>Find contacts</small></div>
            </div>
            <div class="physics-branch">
                <div class="physics-node">Physics response<small>Resolve motion</small></div>
            </div>
        </div>
    </div>
    <figcaption aria-hidden="true">Detection identifies contacts; response determines how the bodies react.</figcaption>
</figure>

### Collision Detection

The collision detection part of the engine is responsible for detecting when things overlap and by
how much they overlap. Most physics engines have developed a two-tier architecture where you first
detect if objects are near each other using a crude representation of the object. Then it performs
the collision detection on the objects themselves using their real representations. It basically is set up
like this:

### Broad phase

The broad phase is the one responsible for detecting objects near each other. It was developed to
speed up the collision detection phase by reducing the number of collision checks needed. Imagine a
simulation containing 12 balls; testing every distinct pair would require 66 expensive
real-shape collision checks (12 × 11 / 2). If a broad phase is introduced, this number of checks can be reduced to a smaller
amount. Broad phase algorithms usually use
[AABB](https://en.wikipedia.org/wiki/Axis-aligned_bounding_box#Axis-aligned_minimum_bounding_box)s to
represent a crude shape of the object. It is a lot cheaper to test AABB vs. AABB than a polygon vs.
polygon.

In the example below, bounding-box tests can reject distant pairs cheaply. Only pairs whose
bounding boxes overlap need the more expensive real-shape tests.

With and without AABBs:

<figure class="diagram diagram-panel bounds-diagram" role="img" aria-label="Without bounding boxes: twelve circles at the same positions as the companion diagram. Twelve circles represented by their actual shapes.">
    <div class="bounds-title" aria-hidden="true">Without bounding boxes</div>
    <div class="bounds-scene" aria-hidden="true">
        <span class="bounds-object" style="--x: 12.917%; --y: 10.000%"></span>
        <span class="bounds-object" style="--x: 25.417%; --y: 10.000%"></span>
        <span class="bounds-object" style="--x: 7.083%; --y: 24.444%"></span>
        <span class="bounds-object" style="--x: 17.083%; --y: 38.889%"></span>
        <span class="bounds-object" style="--x: 14.167%; --y: 55.556%"></span>
        <span class="bounds-object" style="--x: 30.833%; --y: 61.111%"></span>
        <span class="bounds-object" style="--x: 48.333%; --y: 37.778%"></span>
        <span class="bounds-object" style="--x: 54.583%; --y: 55.556%"></span>
        <span class="bounds-object" style="--x: 75.417%; --y: 60.556%"></span>
        <span class="bounds-object" style="--x: 92.500%; --y: 72.222%"></span>
        <span class="bounds-object" style="--x: 73.333%; --y: 85.556%"></span>
        <span class="bounds-object" style="--x: 43.750%; --y: 90.000%"></span>
    </div>
    <figcaption aria-hidden="true">Twelve circles represented by their actual shapes.</figcaption>
</figure>
<figure class="diagram diagram-panel bounds-diagram with-bounds" role="img" aria-label="With bounding boxes: twelve circles at the same positions as the companion diagram. Each circle has a tight axis-aligned bounding box for cheap overlap tests.">
    <div class="bounds-title" aria-hidden="true">With bounding boxes</div>
    <div class="bounds-scene" aria-hidden="true">
        <span class="bounds-object" style="--x: 12.917%; --y: 10.000%"></span>
        <span class="bounds-object" style="--x: 25.417%; --y: 10.000%"></span>
        <span class="bounds-object" style="--x: 7.083%; --y: 24.444%"></span>
        <span class="bounds-object" style="--x: 17.083%; --y: 38.889%"></span>
        <span class="bounds-object" style="--x: 14.167%; --y: 55.556%"></span>
        <span class="bounds-object" style="--x: 30.833%; --y: 61.111%"></span>
        <span class="bounds-object" style="--x: 48.333%; --y: 37.778%"></span>
        <span class="bounds-object" style="--x: 54.583%; --y: 55.556%"></span>
        <span class="bounds-object" style="--x: 75.417%; --y: 60.556%"></span>
        <span class="bounds-object" style="--x: 92.500%; --y: 72.222%"></span>
        <span class="bounds-object" style="--x: 73.333%; --y: 85.556%"></span>
        <span class="bounds-object" style="--x: 43.750%; --y: 90.000%"></span>
    </div>
    <figcaption aria-hidden="true">Each circle has a tight axis-aligned bounding box for cheap overlap tests.</figcaption>
</figure>

There exist a lot of algorithms to do broad phase tests:

- [Brute force](https://en.wikipedia.org/wiki/Brute-force_search)
- [Sweep and prune](https://en.wikipedia.org/wiki/Sweep_and_prune)
- [Dynamic tree](https://en.wikipedia.org/wiki/Dynamic_tree)
- [Spatial hash](http://users.design.ucla.edu/~mflux/p5/hashcollision2/applet/)
- [BSP tree](https://en.wikipedia.org/wiki/Binary_space_partitioning)
- [QuadTree](https://en.wikipedia.org/wiki/Quadtree)

All of them have in common that they divide the screen up into smaller parts using trees (flat or
hierarchical), grid or axis-division. Have in mind that no broad phase algorithm is the “best” – it
depends on the situation in which they are used.

### Narrow phase

When the broad phase has detected that two objects are near each other (their crude representations
intersect) the engine should create a pair (sometimes called an arbiter) that contains the two
objects. The objects are then tested using the narrow phase algorithm. Unlike the broad phase, the
narrow phase tests the real shapes (polygons) against each other. This is an expensive test in most
cases since a polygon can be anything from 3 to *n* points. The narrow phase algorithm needs to find
the following information:

- Does a collision exist
- Position
- Normal
- Distance

The last 3 items are vital for the collision response phase. The information is used to generate a
contact; it contains the previously gathered information and can be persisted over several time steps.

<figure id="contact-geometry" class="diagram diagram-panel vector-diagram vector-geometry" role="img" aria-label="Contact between a square corner and a circle. Pink dots mark the centroids and contact point. The green arrow is a contact normal pointing from the circle toward the square; dark lines join each centroid to the contact.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 322" aria-hidden="true" focusable="false">
            <rect class="scene" width="318" height="322" rx="6"/>
            <polygon class="polygon" points="133.00,16.00 233.00,86.00 163.00,186.00 63.00,116.00"/>
            <circle class="circle" cx="185" cy="249" r="66.73080"/>
            <line x1="148.00" y1="101.00" x2="163.00" y2="186.00" class="distance"/>
            <line x1="185.00" y1="249.00" x2="163.00" y2="186.00" class="distance"/>
            <line x1="163.00" y1="186.00" x2="148.49" y2="144.46" class="normal"/>
            <polyline class="normal" points="155.24,151.64 148.49,144.46 147.68,154.28"/>
            <circle class="contact" cx="148" cy="101" r="3.5"/>
            <circle class="contact" cx="185" cy="249" r="3.5"/>
            <circle class="contact" cx="163" cy="186" r="3.5"/>
        </svg>
    </div>
    <figcaption aria-hidden="true">Pink dots mark the centroids and contact point. The green arrow is a contact normal pointing from the circle toward the square; dark lines join each centroid to the contact.</figcaption>
</figure>

Just like the broad phase collision detection system, there are a lot of narrow phase algorithms:

- [GJK](https://en.wikipedia.org/wiki/Gilbert%E2%80%93Johnson%E2%80%93Keerthi_distance_algorithm)
- [Signed Distance Field](http://www.codersnotes.com/notes/signed-distance-fields/)
- [VClip](https://web.archive.org/web/20100428040456/http://lab.polygonal.de:80/2009/01/11/feature-based-geometrical-algorithms/)
- [SAT](https://en.wikipedia.org/wiki/Separating_axis_theorem)
- [Raycasting](https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm)

## Improved overview

Now that the collision detection system has been identified, the new overview looks like this:

<figure class="diagram diagram-panel physics-diagram physics-expanded" role="img" aria-label="A physics engine contains collision detection and physics response. Collision detection contains broad phase and narrow phase.">
    <div aria-hidden="true">
        <div class="physics-node physics-root">Physics engine</div>
        <div class="physics-trunk"></div>
        <div class="physics-branches">
            <div class="physics-branch">
                <div class="physics-node">Collision detection</div>
                <div class="physics-descendants">
                    <div class="physics-trunk"></div>
                    <div class="physics-leaves">
                        <div class="physics-leaf">
                            <div class="physics-node">Broad phase</div>
                        </div>
                        <div class="physics-leaf">
                            <div class="physics-node">Narrow phase</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="physics-branch">
                <div class="physics-node">Physics response</div>
            </div>
        </div>
    </div>
    <figcaption aria-hidden="true">Broad phase finds candidate pairs; narrow phase checks their actual shapes.</figcaption>
</figure>