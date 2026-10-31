---
title: "Pseudo-orientation in Farseer Physics Engine"
description: "Determining which side of a physics object was hit by using its orientation and collision information in Farseer Physics."
date: "2009-11-23T00:43:00.001Z"
last_modified_at: "2009-11-23T21:03:05.969Z"
permalink: "/2009/11/pseudo-orientation-in-farseer-physics.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css"]
---

<style>
    .prose .orientation-diagram {
        max-width: 460px;
        break-inside: avoid;
    }
    .orientation-diagram .orientation-scene {
        position: relative;
        aspect-ratio: 1;
        max-width: 300px;
        margin: 0 auto;
        background: var(--surface-2);
        border-radius: 6px;
    }
    .orientation-diagram .orientation-square {
        position: absolute;
        left: 16%;
        top: 16%;
        width: 68%;
        aspect-ratio: 1;
        border: 2px solid #13161b;
        background: #f0c45e;
        color: #13161b;
    }
    .orientation-diagram .orientation-ring {
        position: absolute;
        inset: 2%;
        border: 1px solid #13161b;
        border-radius: 50%;
    }
    .orientation-diagram .orientation-ring::before, .orientation-diagram .orientation-ring::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background: #13161b;
        transform: rotate(45deg);
    }
    .orientation-diagram .orientation-ring::after {
        transform: rotate(-45deg);
    }
    .orientation-diagram .orientation-label {
        position: absolute;
        font: 12px var(--sans);
    }
    .orientation-diagram .orientation-top {
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
    }
    .orientation-diagram .orientation-bottom {
        bottom: 10%;
        left: 50%;
        transform: translateX(-50%);
    }
    .orientation-diagram .orientation-left {
        left: 7%;
        top: 50%;
        transform: translateY(-50%);
    }
    .orientation-diagram .orientation-right {
        right: 7%;
        top: 50%;
        transform: translateY(-50%);
    }
    .orientation-diagram.orientation-pair .orientation-scene {
        max-width: 360px;
    }
    .orientation-diagram.orientation-pair .orientation-square {
        left: 6%;
        top: 6%;
        width: 46%;
    }
    .orientation-diagram .orientation-circle {
        position: absolute;
        left: 48%;
        top: 48%;
        width: 46%;
        aspect-ratio: 1;
        border: 2px solid #13161b;
        border-radius: 50%;
        background: #e7e9ec;
    }
    .orientation-diagram .orientation-circle::after {
        content: "";
        position: absolute;
        left: calc(50% - 2px);
        top: calc(50% - 2px);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #13161b;
    }
    .orientation-diagram.orientation-rotated .orientation-square {
        transform: rotate(100deg);
    }
    .orientation-diagram .orientation-normal {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 44%;
        height: 1px;
        background: #13161b;
        transform: rotate(-50deg);
        transform-origin: 0 50%;
    }
    .orientation-diagram .orientation-normal::after {
        content: "";
        position: absolute;
        right: 0;
        top: -3px;
        width: 7px;
        height: 7px;
        border-top: 1px solid #13161b;
        border-right: 1px solid #13161b;
        transform: rotate(45deg);
    }
    .orientation-diagram .orientation-normal span {
        position: absolute;
        left: 60%;
        top: -15px;
        font: italic 12px var(--sans);
    }
    .orientation-diagram figcaption {
        margin-top: 14px;
        line-height: 1.6;
    }
    @media (max-width: 420px) {
        .prose .orientation-diagram {
            padding: 14px;
        }
        .orientation-diagram.orientation-pair .orientation-label {
            font-size: 10px;
        }
    }
</style>

Farseer Physics Engine does not know about its object’s orientation. It has no clue about what is up
and what is down. It only needs to know where other objects are in the physics world – nothing else.
Sometimes it is good to know what is left, right, top and bottom. In this blog post I will describe
a way of determining the side on which an object is hit, no matter the rotation of the object.

Let’s take a simple box as an example:

<figure class="diagram diagram-panel orientation-diagram orientation-plain" role="img" aria-label="A box with no rotation.">
    <div class="orientation-scene" aria-hidden="true">
        <div class="orientation-square"></div>
    </div>
    <figcaption aria-hidden="true">A box with no rotation.</figcaption>
</figure>

We can easily determine what is left, right, top and bottom on that box. We do it all the time in
the real world. In geometry though, we need to calculate it. Imagine a circle inside the box. This
circle is made up of 360 degrees or 2\*π in radians. We can now use this circle to find out where
the box was hit (left, right, top, bottom) by determining the angle at which the other object hit.

A good reference to how radians are laid out on a circle can be [found on
Wikipedia](https://upload.wikimedia.org/wikipedia/commons/9/9a/Degree-Radian_Conversion.svg).

Now we end up with something like this:

<figure class="diagram diagram-panel orientation-diagram orientation-directions" role="img" aria-label="Four local directions divide the circle into equal sectors.">
    <div class="orientation-scene" aria-hidden="true">
        <div class="orientation-square">
            <div class="orientation-ring">
                <span class="orientation-label orientation-top">Top</span>
                <span class="orientation-label orientation-right">Right</span>
                <span class="orientation-label orientation-bottom">Bottom</span>
                <span class="orientation-label orientation-left">Left</span>
            </div>
        </div>
    </div>
    <figcaption aria-hidden="true">Four local directions divide the circle into equal sectors.</figcaption>
</figure>

Now we need to determine the intervals of the angle values that make up the 4 parts.

Right side: π\*1.75 to π\*2 and 0 to π\*0.25  
Bottom side: π\*0.25 to π\*0.75  
Left side: π\*0.75 to π\*1.25  
Top side: π\*1.25 to π\*1.75

But since we are using the [Atan2](https://en.wikipedia.org/wiki/Atan2) function that has a range
from –π to π, we need an interval that is adjusted to that range:

Right side: –π/4 to π/4  
Bottom side: π/4 to (3\*π)/4  
Left side: –π to (-3\*π)/4 and (3\*π)/4 to π  
Top side: (-3\*π)/4 to –π/4

Now that we know the interval of angle values to test against, we need something to test it with.
Farseer Physics provides you with the normal of the collision points (called contact). This is a
vector pointing directly from the first geometry to the second.

<figure class="diagram diagram-panel orientation-diagram orientation-pair" role="img" aria-label="The box’s local directions align with the world directions. A circular object sits below and to the right of the box.">
    <div class="orientation-scene" aria-hidden="true">
        <div class="orientation-square">
            <div class="orientation-ring">
                <span class="orientation-label orientation-top">Top</span>
                <span class="orientation-label orientation-right">Right</span>
                <span class="orientation-label orientation-bottom">Bottom</span>
                <span class="orientation-label orientation-left">Left</span>
            </div>
        </div>
        <div class="orientation-circle"></div>
    </div>
    <figcaption aria-hidden="true">The box’s local directions align with the world directions.</figcaption>
</figure>

It looks like we can measure the angle of the normal and then see what interval it is within right?
Wrong… What if this happens:

<figure class="diagram diagram-panel orientation-diagram orientation-pair orientation-rotated" role="img" aria-label="The box and its local directions rotate together; n marks the contact normal in world space. A circular object sits below and to the right of the box.">
    <div class="orientation-scene" aria-hidden="true">
        <div class="orientation-square">
            <div class="orientation-ring">
                <span class="orientation-label orientation-top">Top</span>
                <span class="orientation-label orientation-right">Right</span>
                <span class="orientation-label orientation-bottom">Bottom</span>
                <span class="orientation-label orientation-left">Left</span>
            </div>
            <div class="orientation-normal">
                <span>n</span>
            </div>
        </div>
        <div class="orientation-circle"></div>
    </div>
    <figcaption aria-hidden="true">The box and its local directions rotate together; n marks the contact normal in world space.</figcaption>
</figure>

Remember, the object is rotated, the intervals are not! If we measured the angle against the
intervals now, it would say that the right side of the box is hit, when it is the top that gets hit.

The solution is to rotate either the intervals or the normal. I took the latter of the two. It can
all be seen in the sample project below (Based on Farseer Physics Simple Samples for XNA):

[Download sample
project](http://cid-f116593ba64184a2.skydrive.live.com/self.aspx/.Public/Farseer%20Physics%20Orientation.zip)

(click the folder icon – XNA 3.1 needed to run it)