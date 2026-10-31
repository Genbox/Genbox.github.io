---
title: "The big O notation – summary"
description: "A short explanation of Big O notation and how growth rates help compare the complexity of algorithms."
date: "2010-07-03T21:17:00.001Z"
last_modified_at: "2010-08-19T20:27:21.964Z"
permalink: "/2010/07/big-o-notation-summary.html"
tags: ["Algorithms"]
stylesheets: ["diagrams.css", "vector-diagrams.css"]
---

<style>
    #growth-functions text, #growth-functions .plot-label {
        font-size: 22px;
    }
</style>

Big O notation was invented to describe the growth rate of a function. You basically take away all
constants and small factors and only focus on the big factors. Let’s take an example; the function:

*x*^2 + 2*x* + 6

in terms of big O notation becomes:

O(*x*^2)

We use this notation to describe how algorithm costs grow with input size. For example, testing
all distinct pairs of objects takes O(n²) time. The exact number of tests is n(n − 1) / 2,
which is 4,950 for 100 objects.

An O(n log n) algorithm grows more slowly than a quadratic one, although constant factors and
input size also affect actual performance. For illustration, at n = 100 the function n² gives
10,000, while n log₁₀ n gives 200. Big O describes growth rates rather than these exact counts;
changing the logarithm's base changes only a constant factor.

The plot compares these two growth functions. Its horizontal axis is the number of items and
its vertical axis is the function value.

<figure id="growth-functions" class="diagram diagram-panel vector-diagram" role="img" aria-label="Quadratic and linearithmic growth. At n = 70, n² is 4,900 and n log₁₀ n is approximately 129. These are illustrative function values, not exact operation counts.">
    <div aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 0 650 355" aria-hidden="true" focusable="false">
            <line x1="64.00" y1="294.00" x2="594.00" y2="294.00" class="grid"/>
            <text x="54" y="298.00" text-anchor="end">0</text>
            <line x1="64.00" y1="252.33" x2="594.00" y2="252.33" class="grid"/>
            <text x="54" y="256.33" text-anchor="end">1000</text>
            <line x1="64.00" y1="210.67" x2="594.00" y2="210.67" class="grid"/>
            <text x="54" y="214.67" text-anchor="end">2000</text>
            <line x1="64.00" y1="169.00" x2="594.00" y2="169.00" class="grid"/>
            <text x="54" y="173.00" text-anchor="end">3000</text>
            <line x1="64.00" y1="127.33" x2="594.00" y2="127.33" class="grid"/>
            <text x="54" y="131.33" text-anchor="end">4000</text>
            <line x1="64.00" y1="85.67" x2="594.00" y2="85.67" class="grid"/>
            <text x="54" y="89.67" text-anchor="end">5000</text>
            <line x1="64.00" y1="44.00" x2="594.00" y2="44.00" class="grid"/>
            <text x="54" y="48.00" text-anchor="end">6000</text>
            <text x="64.00" y="316" text-anchor="middle">0</text>
            <text x="139.71" y="316" text-anchor="middle">10</text>
            <text x="215.43" y="316" text-anchor="middle">20</text>
            <text x="291.14" y="316" text-anchor="middle">30</text>
            <text x="366.86" y="316" text-anchor="middle">40</text>
            <text x="442.57" y="316" text-anchor="middle">50</text>
            <text x="518.29" y="316" text-anchor="middle">60</text>
            <text x="594.00" y="316" text-anchor="middle">70</text>
            <line x1="64.00" y1="44.00" x2="64.00" y2="294.00" class="axis"/>
            <line x1="64.00" y1="294.00" x2="594.00" y2="294.00" class="axis"/>
            <text x="64" y="24" class="plot-label">Growth-function value</text>
            <text x="594" y="342" text-anchor="end" class="plot-label">Number of items, n</text>
            <polyline class="curve" points="64.00,294.00 67.79,293.99 71.57,293.96 75.36,293.91 79.14,293.83 82.93,293.74 86.71,293.62 90.50,293.49 94.29,293.33 98.07,293.16 101.86,292.96 105.64,292.74 109.43,292.50 113.21,292.24 117.00,291.96 120.79,291.66 124.57,291.33 128.36,290.99 132.14,290.62 135.93,290.24 139.71,289.83 143.50,289.41 147.29,288.96 151.07,288.49 154.86,288.00 158.64,287.49 162.43,286.96 166.21,286.41 170.00,285.83 173.79,285.24 177.57,284.62 181.36,283.99 185.14,283.33 188.93,282.66 192.71,281.96 196.50,281.24 200.29,280.50 204.07,279.74 207.86,278.96 211.64,278.16 215.43,277.33 219.21,276.49 223.00,275.62 226.79,274.74 230.57,273.83 234.36,272.91 238.14,271.96 241.93,270.99 245.71,270.00 249.50,268.99 253.29,267.96 257.07,266.91 260.86,265.83 264.64,264.74 268.43,263.62 272.21,262.49 276.00,261.33 279.79,260.16 283.57,258.96 287.36,257.74 291.14,256.50 294.93,255.24 298.71,253.96 302.50,252.66 306.29,251.33 310.07,249.99 313.86,248.62 317.64,247.24 321.43,245.83 325.21,244.41 329.00,242.96 332.79,241.49 336.57,240.00 340.36,238.49 344.14,236.96 347.93,235.41 351.71,233.83 355.50,232.24 359.29,230.62 363.07,228.99 366.86,227.33 370.64,225.66 374.43,223.96 378.21,222.24 382.00,220.50 385.79,218.74 389.57,216.96 393.36,215.16 397.14,213.33 400.93,211.49 404.71,209.62 408.50,207.74 412.29,205.83 416.07,203.91 419.86,201.96 423.64,199.99 427.43,198.00 431.21,195.99 435.00,193.96 438.79,191.91 442.57,189.83 446.36,187.74 450.14,185.62 453.93,183.49 457.71,181.33 461.50,179.16 465.29,176.96 469.07,174.74 472.86,172.50 476.64,170.24 480.43,167.96 484.21,165.66 488.00,163.33 491.79,160.99 495.57,158.62 499.36,156.24 503.14,153.83 506.93,151.41 510.71,148.96 514.50,146.49 518.29,144.00 522.07,141.49 525.86,138.96 529.64,136.41 533.43,133.83 537.21,131.24 541.00,128.62 544.79,125.99 548.57,123.33 552.36,120.66 556.14,117.96 559.93,115.24 563.71,112.50 567.50,109.74 571.29,106.96 575.07,104.16 578.86,101.33 582.64,98.49 586.43,95.62 590.21,92.74 594.00,89.83"/>
            <polyline class="secondary" points="64.00,294.00 67.79,294.01 71.57,294.00 75.36,293.99 79.14,293.97 82.93,293.96 86.71,293.94 90.50,293.92 94.29,293.90 98.07,293.88 101.86,293.85 105.64,293.83 109.43,293.81 113.21,293.78 117.00,293.75 120.79,293.73 124.57,293.70 128.36,293.67 132.14,293.64 135.93,293.61 139.71,293.58 143.50,293.55 147.29,293.52 151.07,293.49 154.86,293.46 158.64,293.43 162.43,293.40 166.21,293.36 170.00,293.33 173.79,293.30 177.57,293.26 181.36,293.23 185.14,293.20 188.93,293.16 192.71,293.13 196.50,293.09 200.29,293.06 204.07,293.02 207.86,292.99 211.64,292.95 215.43,292.92 219.21,292.88 223.00,292.84 226.79,292.81 230.57,292.77 234.36,292.73 238.14,292.70 241.93,292.66 245.71,292.62 249.50,292.58 253.29,292.54 257.07,292.51 260.86,292.47 264.64,292.43 268.43,292.39 272.21,292.35 276.00,292.31 279.79,292.27 283.57,292.23 287.36,292.19 291.14,292.15 294.93,292.11 298.71,292.07 302.50,292.03 306.29,291.99 310.07,291.95 313.86,291.91 317.64,291.87 321.43,291.83 325.21,291.79 329.00,291.75 332.79,291.71 336.57,291.67 340.36,291.62 344.14,291.58 347.93,291.54 351.71,291.50 355.50,291.46 359.29,291.41 363.07,291.37 366.86,291.33 370.64,291.29 374.43,291.24 378.21,291.20 382.00,291.16 385.79,291.12 389.57,291.07 393.36,291.03 397.14,290.99 400.93,290.94 404.71,290.90 408.50,290.86 412.29,290.81 416.07,290.77 419.86,290.73 423.64,290.68 427.43,290.64 431.21,290.59 435.00,290.55 438.79,290.50 442.57,290.46 446.36,290.42 450.14,290.37 453.93,290.33 457.71,290.28 461.50,290.24 465.29,290.19 469.07,290.15 472.86,290.10 476.64,290.06 480.43,290.01 484.21,289.97 488.00,289.92 491.79,289.88 495.57,289.83 499.36,289.78 503.14,289.74 506.93,289.69 510.71,289.65 514.50,289.60 518.29,289.55 522.07,289.51 525.86,289.46 529.64,289.42 533.43,289.37 537.21,289.32 541.00,289.28 544.79,289.23 548.57,289.18 552.36,289.14 556.14,289.09 559.93,289.04 563.71,289.00 567.50,288.95 571.29,288.90 575.07,288.86 578.86,288.81 582.64,288.76 586.43,288.71 590.21,288.67 594.00,288.62"/>
        </svg>
        <div class="vector-legend">
            <span class="legend-primary">Solid: n²</span>
            <span class="legend-secondary">Dashed: n log₁₀ n</span>
        </div>
    </div>
    <figcaption aria-hidden="true">At n = 70, n² is 4,900 and n log₁₀ n is approximately 129. These are illustrative function values, not exact operation counts.</figcaption>
</figure>

As you can see, when the number of items increases, the number of checks to perform increases much
more rapidly in the n^2 function than the n\*log(n) function.

Here is a table of the most commonly used notations:

| Notation   | Name         |
|------------|--------------|
| O(1)       | Constant     |
| O(log n)   | Logarithmic  |
| O(n)       | Linear       |
| O(n log n) | Linearithmic |
| O(n^2)     | Quadratic    |

You can find a more complete list in [this Wikipedia
article](https://en.wikipedia.org/wiki/Time_complexity#Table_of_common_time_complexities).