---
title: "2D physics engine tutorial – part 1"
description: "The responsibilities of a physics engine, the differences between rigid and soft bodies, and real-time versus high-precision simulation."
date: "2009-09-25T13:39:00.001Z"
last_modified_at: "2009-09-26T18:32:20.415Z"
permalink: "/2009/09/2d-physics-engine-tutorial-part-1.html"
tags: ["Game Development", "Algorithms"]
---

In this article series the focus will be on identifying the different parts of a physics engine and
then how we can implement those parts as simply as possible. There are tons of [2D and 3D engines
available](https://en.wikipedia.org/wiki/Physics_engine#Real-time_physics_engines) on the internet –
this is not going to be a contestant to any of those engines, it will purely function as an
educational physics engine to better grasp the concepts behind it.

## What does a physics engine do

Almost all games need some way of detecting if two objects collide and respond using the proper
reaction. It might be Mario standing on top of a platform or Max Payne shooting a bad guy – they
both need collision detection and physics.

**Wikipedia definition**

A physics engine is a computer program that simulates physics models, using variables such as mass,
velocity, friction, and wind resistance. It can simulate and predict effects under different
conditions that would approximate what happens in real life or in a fantasy world. Its main uses are
in scientific simulation and in video games.

Physics engines can be used for so much more than just fun and games:

- [Robot
  dynamics](https://www.youtube.com/watch?v=-yoXkWpcOu8&feature=PlayList&p=C5DFB616BF8042CA&playnext=1&playnext_from=PL&index=21)

- [Cloth simulation](https://www.custom-logic.com/exp/cloth/cloth.html)
- [Transport security](https://www.youtube.com/watch?v=L7PR58fqxgg)
- [Fluid Simulations](https://www.youtube.com/watch?v=mSR2z6naFtI)
- [Wind tunnel testing](https://www.youtube.com/watch?v=kwNvXPEzO-Q)
- Much more…

To us it is natural that if we toss a ball against a wall, it will hit the wall and bounce back.
In the computer world all this has to be simulated.

## Types of physics engines

There are two different kinds of physics engines. One of them is used for soft body (deformable)
objects and the other is used for rigid body objects (hard/non-deformable)

### Soft body physics

[Soft body engines](https://en.wikipedia.org/wiki/Soft_body_dynamics) are used for deformable physics
such as cloth, rubber, jelly or balloons. You can enlarge, rip or puncture a soft body in any way
you want. There are both [3D soft body engines](https://www.youtube.com/watch?v=JncQOCg9FS0) and [2D
soft body engines](https://web.archive.org/web/20100103212019/http://walaber.com/index.php?action=showitem&id=17). Most of them define their
shapes using triangles (or particles) that can change properties (side lengths and angles) and thus
deform the body that contains the triangle.

Soft body dynamics are hard to work with because of the deformations applied to a body. If a body
needs to try and [keep its original shape](https://www.youtube.com/watch?v=exss517n1I0), all the
deformations will have to be kept track of and slowly be resolved to gain its original shape.

### Rigid body physics

[Rigid body engines](https://en.wikipedia.org/wiki/Rigid_body_dynamics) are used for non-deformable
physics such as spacecrafts, buildings, terrain, player characters and more. They can’t be deformed
in any way and only support linear (movement) and angular (rotation)  motion.

Rigid body engines are a lot easier to work with compared to soft body physics. You only have to
keep track of movement on the x, y and z-axis and rotation around the
[centroid](https://en.wikipedia.org/wiki/Centroid) of the object.

Play Doh (Soft) and a metal box (Rigid):

[![Soft versus rigid
body](/assets/images/posts/2480ef11392cf85e2aa5.webp "Soft versus rigid body"){width="534" height="200" loading="lazy" decoding="async"}](/assets/images/posts/2480ef11392cf85e2aa5.webp)

## Real-time vs. High-precision

How all this is calculated depends on the type of engine used. There are generally two different
types of engines:

### Real-Time

Real-time engines are typically used in games and other real time applications. They are used to
simulate the game environment, vehicle dynamics, player interactions and more. Real-time engines are
usually more focused on performance than accuracy – when a tree falls on a vehicle, we don’t need to
know where every single fiber of the tree hits the vehicle with an accuracy of 0.01 mm.

They are identified by the following characteristics:

- [Iterative](https://en.wikipedia.org/wiki/Iterative_method) algorithms
- Low accuracy
- High number of concurrent objects
- Game oriented tools

### High-Precision

This kind of engine is mostly used in scientific applications and animated movies. They are used to
simulate weather, train collisions, explosions and space shuttle trajectory. They can’t be used for
real-time applications because they are too expensive in their computations.

They are identified by the following characteristics:

- Single pass algorithms
- High accuracy and precision
- Low number of concurrent objects
- Scientific application tools