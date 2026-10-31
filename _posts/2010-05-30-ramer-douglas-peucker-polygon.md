---
title: "The Ramer-Douglas-Peucker polygon simplification algorithm"
description: "How the Ramer-Douglas-Peucker algorithm simplifies polygons by removing points while respecting a distance tolerance."
date: "2010-05-30T13:13:00.001Z"
last_modified_at: "2010-06-02T00:05:45.088Z"
permalink: "/2010/05/ramer-douglas-peucker-polygon.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css", "vector-diagrams.css"]
---

<style>
    .prose .letter-comparison {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin: 24px 0;
    }
    .prose .letter-diagram {
        margin: 0;
        padding: 16px;
    }
    .letter-diagram svg {
        max-width: 180px;
        margin: auto;
    }
    .letter-diagram path {
        fill: none;
        stroke: var(--accent);
        stroke-width: .65;
        stroke-linejoin: round;
    }
    .letter-diagram figcaption {
        margin-top: 12px;
    }
    @media (max-width: 360px) {
        .prose .letter-comparison {
            grid-template-columns: 1fr;
        }
    }
</style>

One of the important algorithms in vector graphics and robotics is the Ramer-Douglas-Peucker
algorithm. It simplifies a polygon by reducing the number of points by some tolerance. It was
invented independently by [Urs Ramer](http://dx.doi.org/10.1016/S0146-664X(72)80017-0) in 1972 and
by [David Douglas & Thomas Peucker](https://doi.org/10.3138/FM57-6770-U75U-7727) in
1973\. In 1992 it was improved by [John Hershberger & Jack
Snoeyink](https://www.cs.ubc.ca/tr/1992/tr-92-07) at the cost of the algorithm only working
with simple 2D planar polylines, and not in higher dimensions.

Here is how it roughly works:
<figure id="rdp-stages" class="diagram diagram-panel vector-diagram" role="img" aria-label="Five stages of Ramer–Douglas–Peucker polyline simplification. Starting with eight vertices, keep the endpoints and recursively split at the farthest vertex whenever its distance exceeds the tolerance. This example retains five vertices. Dashed lines show the original path.">
    <div aria-hidden="true">
        <div class="rdp-stage">
            <div class="rdp-label"><b>0</b>Original polyline</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 90" aria-hidden="true" focusable="false">
                <polyline class="trace" points="28.00,16.00 49.00,46.00 118.00,70.00 184.00,42.00 262.00,22.00 298.00,32.00 340.00,52.00 475.00,16.00"/>
                <polyline class="curve" points="28.00,16.00 49.00,46.00 118.00,70.00 184.00,42.00 262.00,22.00 298.00,32.00 340.00,52.00 475.00,16.00"/>
                <circle class="kept" cx="28" cy="16" r="3.5"/>
                <circle class="kept" cx="49" cy="46" r="3.5"/>
                <circle class="kept" cx="118" cy="70" r="3.5"/>
                <circle class="kept" cx="184" cy="42" r="3.5"/>
                <circle class="kept" cx="262" cy="22" r="3.5"/>
                <circle class="kept" cx="298" cy="32" r="3.5"/>
                <circle class="kept" cx="340" cy="52" r="3.5"/>
                <circle class="kept" cx="475" cy="16" r="3.5"/>
            </svg>
        </div>
        <div class="rdp-stage">
            <div class="rdp-label"><b>1</b>Connect the endpoints</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 90" aria-hidden="true" focusable="false">
                <polyline class="trace" points="28.00,16.00 49.00,46.00 118.00,70.00 184.00,42.00 262.00,22.00 298.00,32.00 340.00,52.00 475.00,16.00"/>
                <polyline class="curve" points="28.00,16.00 475.00,16.00"/>
                <circle class="kept" cx="28" cy="16" r="3.5"/>
                <circle class="point" cx="49" cy="46" r="3.5"/>
                <circle class="point" cx="118" cy="70" r="3.5"/>
                <circle class="point" cx="184" cy="42" r="3.5"/>
                <circle class="point" cx="262" cy="22" r="3.5"/>
                <circle class="point" cx="298" cy="32" r="3.5"/>
                <circle class="point" cx="340" cy="52" r="3.5"/>
                <circle class="kept" cx="475" cy="16" r="3.5"/>
            </svg>
        </div>
        <div class="rdp-stage">
            <div class="rdp-label"><b>2</b>Keep the farthest point</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 90" aria-hidden="true" focusable="false">
                <polyline class="trace" points="28.00,16.00 49.00,46.00 118.00,70.00 184.00,42.00 262.00,22.00 298.00,32.00 340.00,52.00 475.00,16.00"/>
                <polyline class="curve" points="28.00,16.00 118.00,70.00 475.00,16.00"/>
                <circle class="kept" cx="28" cy="16" r="3.5"/>
                <circle class="point" cx="49" cy="46" r="3.5"/>
                <circle class="kept" cx="118" cy="70" r="3.5"/>
                <circle class="point" cx="184" cy="42" r="3.5"/>
                <circle class="point" cx="262" cy="22" r="3.5"/>
                <circle class="point" cx="298" cy="32" r="3.5"/>
                <circle class="point" cx="340" cy="52" r="3.5"/>
                <circle class="kept" cx="475" cy="16" r="3.5"/>
            </svg>
        </div>
        <div class="rdp-stage">
            <div class="rdp-label"><b>3</b>Split and check each subsegment</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 90" aria-hidden="true" focusable="false">
                <polyline class="trace" points="28.00,16.00 49.00,46.00 118.00,70.00 184.00,42.00 262.00,22.00 298.00,32.00 340.00,52.00 475.00,16.00"/>
                <polyline class="curve" points="28.00,16.00 118.00,70.00 262.00,22.00 475.00,16.00"/>
                <circle class="kept" cx="28" cy="16" r="3.5"/>
                <circle class="point" cx="49" cy="46" r="3.5"/>
                <circle class="kept" cx="118" cy="70" r="3.5"/>
                <circle class="point" cx="184" cy="42" r="3.5"/>
                <circle class="kept" cx="262" cy="22" r="3.5"/>
                <circle class="point" cx="298" cy="32" r="3.5"/>
                <circle class="point" cx="340" cy="52" r="3.5"/>
                <circle class="kept" cx="475" cy="16" r="3.5"/>
            </svg>
        </div>
        <div class="rdp-stage">
            <div class="rdp-label"><b>4</b>Finish when all deviations fit the tolerance</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 90" aria-hidden="true" focusable="false">
                <polyline class="trace" points="28.00,16.00 49.00,46.00 118.00,70.00 184.00,42.00 262.00,22.00 298.00,32.00 340.00,52.00 475.00,16.00"/>
                <polyline class="curve" points="28.00,16.00 118.00,70.00 262.00,22.00 340.00,52.00 475.00,16.00"/>
                <circle class="kept" cx="28" cy="16" r="3.5"/>
                <circle class="point" cx="49" cy="46" r="3.5"/>
                <circle class="kept" cx="118" cy="70" r="3.5"/>
                <circle class="point" cx="184" cy="42" r="3.5"/>
                <circle class="kept" cx="262" cy="22" r="3.5"/>
                <circle class="point" cx="298" cy="32" r="3.5"/>
                <circle class="kept" cx="340" cy="52" r="3.5"/>
                <circle class="kept" cx="475" cy="16" r="3.5"/>
            </svg>
        </div>
    </div>
    <figcaption aria-hidden="true">Starting with eight vertices, keep the endpoints and recursively split at the farthest vertex whenever its distance exceeds the tolerance. This example retains five vertices. Dashed lines show the original path.</figcaption>
</figure>

0. Start with a polyline and a distance tolerance.
1. Connect its two endpoints as the initial approximation.
2. Find the intermediate vertex farthest from that segment. If its distance exceeds the
   tolerance, retain it and split the polyline there.
3. Repeat on both subsegments until every remaining deviation is within the tolerance.
{start="0"}

The idea with the algorithm is that we can give it an input like the one to the left and get an
output like the one to the right:

<div class="letter-comparison">
    <figure id="rough-letters" class="diagram diagram-panel letter-diagram" role="img" aria-label="Rough outlines: many small edges.">
        <div aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 100" aria-hidden="true" focusable="false">
                <path d="M8.00,44.00 9.69,42.51 8.36,39.97 10.99,38.81 9.66,36.27 12.29,35.11 10.96,32.57 13.59,31.41 12.26,28.87 14.89,27.71 13.56,25.17 16.19,24.01 14.86,21.47 17.49,20.31 16.16,17.77 18.79,16.61 17.46,14.07 20.09,12.91 18.76,10.37 21.39,9.21 21.00,7.00 23.00,8.10 25.00,6.00 27.00,8.10 29.00,6.00 31.00,8.10 33.00,7.00 32.61,9.21 35.24,10.37 33.91,12.91 36.54,14.07 35.21,16.61 37.84,17.77 36.51,20.31 39.14,21.47 37.81,24.01 40.44,25.17 39.11,27.71 41.74,28.87 40.41,31.41 43.04,32.57 41.71,35.11 44.34,36.27 43.01,38.81 45.64,39.97 44.31,42.51 46.00,44.00 44.00,42.90 42.00,45.00 40.00,42.90 38.00,45.00 36.00,44.00 36.45,41.68 33.84,40.29 35.25,37.68 32.64,36.29 33.00,34.00 31.00,32.90 29.00,35.00 27.00,32.90 25.00,35.00 23.00,32.90 21.00,34.00 19.35,35.68 20.76,38.29 18.15,39.68 19.56,42.29 18.00,44.00 16.00,42.90 14.00,45.00 12.00,42.90 10.00,45.00Z M24.00,25.00 26.00,26.10 28.00,24.00 30.00,25.00 30.45,22.68 27.84,21.29 29.25,18.68 26.64,17.29 27.00,15.00 25.35,16.68 26.76,19.29 24.15,20.68 25.56,23.29Z M36.00,91.00 37.10,88.94 35.00,86.89 37.10,84.83 35.00,82.78 37.10,80.72 35.00,78.67 37.10,76.61 35.00,74.56 37.10,72.50 35.00,70.44 37.10,68.39 35.00,66.33 37.10,64.28 35.00,62.22 37.10,60.17 35.00,58.11 37.10,56.06 36.00,54.00 37.90,55.10 39.80,53.00 41.70,55.10 43.60,53.00 45.50,55.10 47.40,53.00 49.30,55.10 51.20,53.00 53.10,55.10 55.00,54.00 56.61,55.78 59.35,54.56 60.61,57.28 63.00,57.00 63.02,59.49 65.89,60.55 66.00,63.00 64.29,64.65 65.62,67.32 64.00,69.00 61.34,69.62 60.00,72.00 61.10,73.94 63.85,73.14 65.00,75.00 65.02,77.49 67.89,78.55 68.00,81.00 66.29,82.65 67.62,85.32 66.00,87.00 63.70,87.04 63.00,89.87 60.20,89.04 59.00,91.00 57.08,89.90 55.17,92.00 53.25,89.90 51.33,92.00 49.42,89.90 47.50,92.00 45.58,89.90 43.67,92.00 41.75,89.90 39.83,92.00 37.92,89.90Z M46.00,68.00 48.00,69.10 50.00,67.00 52.00,69.10 54.00,68.00 56.28,67.28 57.00,65.00 57.54,63.15 56.00,62.00 54.00,60.90 52.00,63.00 50.00,60.90 48.00,63.00 46.00,62.00 44.90,64.00 47.00,66.00Z M46.00,83.00 48.00,84.10 50.00,82.00 52.00,84.10 54.00,82.00 56.00,83.00 58.28,82.28 59.00,80.00 58.28,77.72 56.00,77.00 54.00,75.90 52.00,78.00 50.00,75.90 48.00,78.00 46.00,77.00 44.90,79.00 47.00,81.00Z" />
            </svg>
        </div>
        <figcaption aria-hidden="true">Rough outlines: many small edges.</figcaption>
    </figure>
    <figure id="simple-letters" class="diagram diagram-panel letter-diagram" role="img" aria-label="Simplified outlines: fewer edges.">
        <div aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 100" aria-hidden="true" focusable="false">
                <path d="M8.00,44.00 21.00,7.00 33.00,7.00 46.00,44.00 36.00,44.00 33.00,34.00 21.00,34.00 18.00,44.00Z M24.00,25.00 30.00,25.00 27.00,15.00Z M36.00,91.00 36.00,54.00 55.00,54.00 63.00,57.00 66.00,63.00 64.00,69.00 60.00,72.00 65.00,75.00 68.00,81.00 66.00,87.00 59.00,91.00Z M46.00,68.00 54.00,68.00 57.00,65.00 56.00,62.00 46.00,62.00Z M46.00,83.00 56.00,83.00 59.00,80.00 56.00,77.00 46.00,77.00Z" />
            </svg>
        </div>
        <figcaption aria-hidden="true">Simplified outlines: fewer edges.</figcaption>
    </figure>
</div>

This gives us a lot of possibilities; it can reconstruct the original representation of a polygon
and it can provide us with compression of the data. A large and complicated polygon can be
simplified down to the bare essentials by reducing the details of the polygon.

I’ve added this algorithm to [Farseer Physics Engine
3.0](https://github.com/Genbox/VelcroPhysics/blob/master/src/VelcroPhysics/Tools/PolygonManipulation/SimplifyTools.cs).