---
title: "Broad and narrow phase collision detection systems"
description: "Comparing broad-phase and narrow-phase collision detection algorithms and their roles in reducing physics simulation costs."
date: "2010-07-03T21:23:00.001Z"
last_modified_at: "2010-07-03T21:24:27.868Z"
permalink: "/2010/07/broad-and-narrow-phase-collision.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css", "vector-diagrams.css"]
---

If you don’t know about the big O notation, I recommend you read about it
[here](/2010/07/big-o-notation-summary.html) first. This post gives you an idea of what broad and
narrow phase algorithms are and how they are used in physics engines.

## Broad Phase Collision Detection

Performance is an essential part of a physics engine. You can get away with just implementing a few
algorithms that detect collisions using an O(n^2) algorithm, but when you add more and more objects
to the simulator it becomes quite expensive (CPU wise). Not very good for performance.

We can reduce the number of tests by implementing a broad phase into our collision system. It is
responsible for eliminating tests and thus reducing the number of tests needed (We obviously don't
need to test objects far away from the player). We could for example have an algorithm that tests
the distance using the X and Y axis of the screen, if the objects are too far away from each other,
we can eliminate them as potential collisions. There are many algorithms that can eliminate tests, a
few of them are:

**SAP (Sweep and Prune)** - [More info](https://en.wikipedia.org/wiki/Sweep_and_prune) - O(n log(n))
algorithm

**Spatial Hash** - [More
info](https://conkerjo.wordpress.com/2009/06/13/spatial-hashing-implementation-for-fast-2d-collisions/) -
O(n log(n)) algorithm

If I remember correctly they can be O(1) in the best case and O(n^2) in the worst case.

It is important to remember that the broad phase only keeps track of the distance between objects.
If they are close enough to create a potential collision, the objects are paired. To determine if
two objects are close enough to create a collision, we use something called an AABB (Axis Aligned
Bounding Box). It is simply a box that does not rotate that encapsulates the whole object. It is
cheaper to test box vs. box instead of a lot of polygons vs. polygon.

Too far from each other to be tested for collisions:

<figure id="collision-separated" class="diagram diagram-panel vector-diagram vector-geometry" role="img" aria-label="Polygon and circle with axis-aligned bounding boxes. AABBs do not overlap; the pair can be rejected.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 342" aria-hidden="true" focusable="false">
            <rect class="scene" width="324" height="342" rx="6"/>
            <polygon class="polygon" points="10.00,108.00 90.00,15.00 185.00,90.00 109.00,182.00"/>
            <circle class="circle" cx="235" cy="255" r="60"/>
            <rect class="bounds" x="10" y="15" width="175" height="167"/>
            <rect class="bounds" x="175" y="195" width="120" height="120"/>
            <line x1="94.50" y1="94.75" x2="102.50" y2="102.75" class="center"/>
            <line x1="94.50" y1="102.75" x2="102.50" y2="94.75" class="center"/>
            <line x1="231.00" y1="251.00" x2="239.00" y2="259.00" class="center"/>
            <line x1="231.00" y1="259.00" x2="239.00" y2="251.00" class="center"/>
        </svg>
        <div class="vector-legend">
            <span class="legend-primary">Dashed: bounding boxes</span>
        </div>
    </div>
    <figcaption aria-hidden="true">AABBs do not overlap; the pair can be rejected.</figcaption>
</figure>

Close and needs to be further tested for collision:

<figure id="collision-candidate" class="diagram diagram-panel vector-diagram vector-geometry" role="img" aria-label="Polygon and circle with axis-aligned bounding boxes. AABBs overlap, but the shapes are still separated. Run a narrow-phase test.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 342" aria-hidden="true" focusable="false">
            <rect class="scene" width="324" height="342" rx="6"/>
            <polygon class="polygon" points="30.00,112.00 130.00,43.00 200.00,140.00 104.00,208.00"/>
            <circle class="circle" cx="225" cy="242" r="60"/>
            <rect class="bounds" x="30" y="43" width="170" height="165"/>
            <rect class="bounds" x="165" y="182" width="120" height="120"/>
            <line x1="112.00" y1="121.75" x2="120.00" y2="129.75" class="center"/>
            <line x1="112.00" y1="129.75" x2="120.00" y2="121.75" class="center"/>
            <line x1="221.00" y1="238.00" x2="229.00" y2="246.00" class="center"/>
            <line x1="221.00" y1="246.00" x2="229.00" y2="238.00" class="center"/>
        </svg>
        <div class="vector-legend">
            <span class="legend-primary">Dashed: bounding boxes</span>
        </div>
    </div>
    <figcaption aria-hidden="true">AABBs overlap, but the shapes are still separated. Run a narrow-phase test.</figcaption>
</figure>

## Narrow Phase Collision Detection

Once the broad phase collider has done its job, we are left with a couple of pairs that need
further testing. A physics engine needs to know exactly how deep polygon shapes have penetrated each
other and some other stuff like the normals. A narrow phase algorithm basically takes in two polygon
shapes and finds out where those two polygons intersect and how deep.

We need the depth of penetration, the normal and the position of the collision to calculate a proper
physics response.

Collision where the pink dot marks a contact point.

<figure id="collision-contact" class="diagram diagram-panel vector-diagram vector-geometry" role="img" aria-label="Polygon and circle with axis-aligned bounding boxes. The shapes overlap. The pink marker shows a contact point on the polygon edge.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 342" aria-hidden="true" focusable="false">
            <rect class="scene" width="324" height="342" rx="6"/>
            <polygon class="polygon" points="44.00,110.00 151.00,44.00 215.00,152.00 109.00,217.00"/>
            <circle class="circle" cx="210" cy="230" r="66"/>
            <rect class="bounds" x="44" y="44" width="171" height="173"/>
            <rect class="bounds" x="144" y="164" width="132" height="132"/>
            <line x1="125.75" y1="126.75" x2="133.75" y2="134.75" class="center"/>
            <line x1="125.75" y1="134.75" x2="133.75" y2="126.75" class="center"/>
            <line x1="206.00" y1="226.00" x2="214.00" y2="234.00" class="center"/>
            <line x1="206.00" y1="234.00" x2="214.00" y2="226.00" class="center"/>
            <circle class="contact" cx="176.61" cy="175.54" r="4"/>
        </svg>
        <div class="vector-legend">
            <span class="legend-primary">Dashed: bounding boxes</span>
        </div>
    </div>
    <figcaption aria-hidden="true">The shapes overlap. The pink marker shows a contact point on the polygon edge.</figcaption>
</figure>

There are also a few different narrow phase algorithms. Two examples of such algorithms are listed
here:

**SAT (Separate Axis Theorem)** - [More info](https://en.wikipedia.org/wiki/Separating_axis_theorem)

**Distance Grid** - [More
info](https://web.archive.org/web/20110103073632/http://lab.polygonal.de:80/2008/07/13/collision-detection-for-particle-systems/)