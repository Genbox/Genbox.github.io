---
title: "Hybrid narrow phase using convexity detection"
description: "A proposal for combining convex and concave collision detection, with tradeoffs involving geometry, memory, and changing polygons."
date: "2009-09-19T22:34:00.001Z"
last_modified_at: "2009-09-21T17:59:07.090Z"
permalink: "/2009/09/hybrid-narrow-phase-using-convexity.html"
tags: ["Game Development", "Algorithms"]
---

While writing [Convex polygon based collision
detection](/2009/09/convex-polygon-based-collision.html) I came up with the idea of using a hybrid
narrow phase to maximize usability and performance. It might have been thought of before and if you
stumble upon this, I would like to hear your thoughts about it.

It basically consists of taking the pairs found in the broad phase and checking the convexity of the
polygons before sending them down to the narrow phase. As I described in the earlier post, SAT only
works on convex polygons because it uses the separating axis between two non-colliding convex
polygons. This limits the users of the engine to use convex polygons only and thus resort to methods
of convex decomposition to get concave polygon support.

If the polygons were checked for their convexity before being sent to the narrow phase, the engine
could send the pair of potentially colliding polygons to a narrow phase of its choice - depending on
the composition of the pair:

- Convex vs. concave – Send to concave narrow phase
- Convex vs. convex – Send to convex narrow phase
- Concave vs. concave – Send to concave narrow phase

The convexity check could even be done at tool-time or engine startup. Whenever the vertices of an
object change it needs to redo the convexity check.

## Problems that it would solve:

### Small angles

Some triangulation algorithms try to maximize the minimum angle of the triangles (like [Delaunay
Triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation)). But most will come up with a
result that contains narrow triangles and thus it can cause tunneling problems.

### Convex seams

Composing a concave polygon from several convex polygons will create a lot of seams (parts where the
polygons meet) and that can cause trouble for most 2D physics engines. Unrealistic collisions and
hiccups can occur in the middle of a collision.

### Holes

Because of the precision and accuracy of algorithms (due to iterative nature and float errors) –
cases of no-intersection can happen when an intersection is expected. Imagine two narrow triangles
where the narrow parts are up against each other. A small gap can exist between the triangles and a
ray cast in between the two triangles would go right through it. This can of course be solved by
extending the edges a little.

## Problems that it would create:

### Memory issue

The main issue would be memory consumption. Instead of a single narrow phase algorithm you would now
have a dual algorithm. Using a narrow phase collider like the Signed Distance Field can consume a
lot of memory.

### Expensive to change polygons

Again, if you use a narrow phase collider like the SDF you need to recalculate both the convexity
check and the cached grid containing the narrow phase data for the physics object. Most games don’t
change polygons on the fly, so this should not be a major issue.