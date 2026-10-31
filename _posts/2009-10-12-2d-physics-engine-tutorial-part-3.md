---
title: "2D physics engine tutorial – part 3"
description: "Introducing velocity, force, acceleration, and numerical integration as the foundations of movement in a 2D physics engine."
date: "2009-10-12T00:54:00Z"
last_modified_at: "2010-01-08T00:28:01.187Z"
permalink: "/2009/09/2d-physics-engine-tutorial-part-3.html"
tags: ["Game Development", "Algorithms"]
stylesheets: ["diagrams.css", "physics-diagrams.css"]
---

In [part 2](/2009/09/2d-physics-engine-tutorial-part-2.html) we had a look at the collision
detection part of physics engines. In this post we take a look at the collision response part and
see what kind of mechanisms it involves.

## Movement

Physics engines have the ability to move objects around both in linear and angular motion. It is
done using linear and angular [velocity](https://en.wikipedia.org/wiki/Velocity) (with
[speed](https://en.wikipedia.org/wiki/Speed) and
[acceleration](https://en.wikipedia.org/wiki/Accelleration)),
[force](https://en.wikipedia.org/wiki/Force) and
[integrators](https://en.wikipedia.org/wiki/Numerical_ordinary_differential_equations).

### Velocity

Velocity is a [vector](https://en.wikipedia.org/wiki/Euclidean_vector) that describes the rate of
change in position; the magnitude of the vector is the speed and the direction of the vector is the
direction in which the speed is applied.

**Velocity definition**

{aria-label="Velocity definition" }

$$
\bar{v} = \frac{\Delta x}{\Delta t}.
$$

**v** is the velocity vector, **Δx** is the displacement and **Δt** is the change in time.

### Force

Force exists in many ways, but generally it is the agent that causes a body to change in motion or
make a mass change its velocity. Force has both magnitude and direction and thus it can be expressed
as a vector.

**[Newton’s second law](https://en.wikipedia.org/wiki/Newton%27s_second_law#Newton.27s_second_law)**

{aria-label="Newton’s second law" }

$$
\vec{F} = m\vec{a}.
$$

**F** is the force vector, **m** is the mass and **a** is the acceleration vector.

### Acceleration

[Acceleration](https://en.wikipedia.org/wiki/Acceleration) is change in velocity over time.
Acceleration can be defined by isolating **a** from Newton’s second law:

**Acceleration definition**

{aria-label="Acceleration definition" }

$$
\mathbf{F} = m\mathbf{a} \rightarrow \mathbf{a} = \mathbf{F}/m
$$

**F** is the force vector, **m** is the mass and **a** is the acceleration.

## Integrator

In the previous velocity definition it is stated that velocity is the displacement over time. If we
know the current position, velocity and the force that will be applied on it, we can integrate it to
find its position and velocity at some point in the future. The integrator performs [numerical
integration](https://en.wikipedia.org/wiki/Numerical_integration); that is – it takes a small step
into the future and tries to find the next position and velocity an object will have – each time it
takes a step, it will use the previous result as the new starting point. It works like this:

1. Use initial position, velocity and force
2. Step 1 time step into the future and integrate to find the new position and velocity
3. Add the position and velocity change to the previous position and velocity
4. Go to step 1, using the results obtained in step 3.

This way we can find the position and velocity of any object at any point in the future.

### Euler’s method

[Euler’s method](https://en.wikipedia.org/wiki/Euler_method) is a simple first-order numerical
integrator that we can use to integrate the position of an object. The step-by-step method mentioned
above is used in Euler’s method.

Solving an example using Euler’s method of integration:

```csharp
float time = 0;
float deltaTime = 1;
float velocity = 0;
float position = 0;
float force = 10;
float mass = 1;
while (time < 10)
{
    position += velocity * deltaTime;
    velocity += (force / mass) * deltaTime;
    time += deltaTime;
}
```

If we run this code, we will get the following results:

| Time | Position | Velocity |
|------|----------|----------|
| 0    | 0        | 0        |
| 1    | 0        | 10       |
| 2    | 10       | 20       |
| 3    | 30       | 30       |
| 4    | 60       | 40       |
| 5    | 100      | 50       |
| 6    | 150      | 60       |
| 7    | 210      | 70       |
| 8    | 280      | 80       |
| 9    | 360      | 90       |
| 10   | 450      | 100      |

The problem with this is that the result is not correct. Using the [equation of
motion](http://library.thinkquest.org/28388/Mechanics/Motions/Equation.htm) we should get 500
meters:

{aria-label="Displacement calculation" }

$$
s = ut + 0.5at^2 \Leftrightarrow 0.5 * 10 * 10^2 = 500
$$

But we got 450 using Euler’s method. That is because Euler is inaccurate when velocity over the time
step is not constant. Using a smaller time step will get us closer to the real result, but it will
always have an error.

There are a lot of alternatives to Euler’s method:

- [Semi-implicit Euler](https://en.wikipedia.org/wiki/Semi-implicit_Euler)
- [Runge-Kutta (RK4)](https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods#The_common_fourth-order_Runge.E2.80.93Kutta_method)

- [Verlet integration](https://en.wikipedia.org/wiki/Verlet_integration)
- [Midpoint method](https://en.wikipedia.org/wiki/Midpoint_method)
- [Leapfrog integration](https://en.wikipedia.org/wiki/Leapfrog_integration)

All of them are more accurate than Euler’s method, but they can also be slower (RK4 needs 4 steps at
each iteration as an example) and they are more advanced.

## Overview

Here is an updated overview of the physics engine structure. We just added the Integrator part of
the engine.

<figure class="diagram diagram-panel physics-diagram physics-expanded" role="img" aria-label="A physics engine contains collision detection and physics response. Collision detection contains broad phase and narrow phase. Physics response contains an integrator.">
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
                <div class="physics-trunk"></div>
                <div class="physics-node">Integrator</div>
            </div>
        </div>
    </div>
    <figcaption aria-hidden="true">Broad phase finds candidate pairs; narrow phase checks their actual shapes. The integrator advances motion over time.</figcaption>
</figure>