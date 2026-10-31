---
title: "Tunneling explained"
description: "Why fast-moving shapes can pass through each other in a physics simulation and which techniques help prevent tunneling."
date: "2010-10-27T10:56:00.001Z"
last_modified_at: "2010-10-27T14:05:49.692Z"
permalink: "/2010/10/what-is-tunneling.html"
tags: ["Game Development", "Algorithms"]
---

Tunneling is an effect where two shapes can get stuck in each other or simply pass each other
without impact. The effect exists because we are limited by the CPU and have to do the calculations
in timesteps instead of one continuous stream.

The effect becomes apparent especially at high velocities and/or with small shapes. Bullets of a gun
are a perfect example because they are usually fired with high velocity and are small in size. To
illustrate this, have a look at the following picture:

Original diagram unavailable: SlowBullet.png (the CodePlex image host is no longer available).

(The numbers illustrate the timestep/seconds)

Imagine that it runs at 1 second per update with a velocity of 34 pixels/second

Everything is fine because the bullet hits the wall as it should and the physics simulator responds
with a proper collision reaction.

But when we turn up the velocity to 89 pixels/second, then this happens

Original diagram unavailable: FastBullet.png (the CodePlex image host is no longer available).

The bullet went right through the wall - the physics engine never had a chance of responding to the
collision because it never happened - that is what is called tunneling.

## What can be done about it

There exists something called CCD or Continuous Collision Detection. It is a name that covers several
different methods of preventing tunneling, one of the more used ones is Conservative Advancement. CA
is a substep that is performed within a world timestep. It moves the shape along its path until it
reaches the next timestep. This is very CPU expensive so it is best to turn it on only for shapes
that need it.

There are simpler ways of limiting tunneling, but they are not as effective in all cases:

- Use a smaller timestep in the physics engine
- Use raycasting
- Make your shapes larger
- Make your shapes slower