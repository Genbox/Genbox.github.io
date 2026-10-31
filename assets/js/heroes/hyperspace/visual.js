(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.hyperspace;
    const readingFade = window.siteRuntime.readingFade;

    // A fixed field of stars in a unit cube, flown through along z.
    function field(count, seed) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            const a = Math.sin((i + seed) * 12.9898) * 43758.5453;
            const b = Math.sin((i + seed) * 78.233) * 12345.6789;
            const c = Math.sin((i + seed) * 39.425) * 24634.6345;
            stars.push({
                x: (a - Math.floor(a)) * 2 - 1,
                y: (b - Math.floor(b)) * 2 - 1,
                z: c - Math.floor(c)
            });
        }
        return stars;
    }
    const pageStars = field(260, 7);

    // Cruise speed, a burst to light speed at the jump, and a quick fall back after dropping out.
    function speedAt(t) {
        if (t < sound.jump) {
            return 0.08;
        }
        if (t < sound.drop) {
            return 0.08 + 1.6 * Math.min(1, (t - sound.jump) / 0.5);
        }
        return 0.08 + 1.6 * Math.exp(-(t - sound.drop) * 5);
    }
    // How far we have flown by time t, counted on across loops so the stars never jump back when the music
    // starts over, and how long the star streaks are.
    let loopDistance = null;
    function travelledWithin(t) {
        let distance = 0;
        for (let s = 0; s < t; s += 0.02) {
            distance += speedAt(s) * Math.min(0.02, t - s);
        }
        return distance;
    }
    function travelled(t) {
        if (loopDistance === null) {
            loopDistance = travelledWithin(sound.loop);
        }
        const loops = Math.floor(t / sound.loop);
        return loops * loopDistance + travelledWithin(t - loops * sound.loop);
    }
    function streakAt(t) {
        const charging = t >= sound.charge && t < sound.jump ? (t - sound.charge) / (sound.jump - sound.charge) : 0;
        return Math.min(0.9, speedAt(t) * 0.5 + charging * 0.35);
    }
    // White, then blue-white in hyperspace.
    function starColor(t) {
        return t >= sound.jump && t < sound.drop ? "#bcd8ff" : "#ffffff";
    }

    function eachStar(stars, t, cx, cy, scale, visit) {
        const distance = travelled(t);
        const streak = streakAt(t % sound.loop);
        stars.forEach(function (star) {
            let z = star.z - distance;
            z = z - Math.floor(z) + 0.02;
            const x = cx + (star.x / z) * scale;
            const y = cy + (star.y / z) * scale;
            const tail = z + streak * z;
            visit(x, y, cx + (star.x / tail) * scale, cy + (star.y / tail) * scale, Math.min(1, 0.25 + (1 - z) * 0.9));
        });
    }

    // How the ship moves through the loop: a gentle bob and bank while cruising, a building tremble as it
    // charges, and a shake through the jump as it pulls away along its nose towards the vanishing point,
    // stretched by the speed. Dropping out plays as one continuous move: the ship springs back from where
    // the jump left it, overshooting a little closer before settling; the stretch snaps back with a small
    // squash; the hull flashes; the engines cool from blue-white to amber; and the bob and bank ease back in.
    function motionAt(t, clock) {
        const charge = t >= sound.charge && t < sound.jump ? (t - sound.charge) / (sound.jump - sound.charge) : 0;
        const inJump = t >= sound.jump && t < sound.drop;
        const since = t - sound.drop;
        const arriving = since >= 0;
        const into = inJump ? Math.min(1, (t - sound.jump) / 0.4) : 0;
        const spring = arriving ? Math.exp(-since * 5.5) * Math.cos(since * 6.5) : 0;
        const shake = inJump ? 0.7 : charge ? charge * 0.6 : arriving ? 0.9 * Math.exp(-since * 3) : 0;
        const calm = inJump ? 0 : arriving ? 1 - Math.exp(-since * 3) : 1;
        return {
            x: Math.round(Math.sin(clock * 23) * shake),
            y: Math.round(Math.cos(clock * 19) * shake * 0.6 + Math.sin(clock * 1.5) * 1.5 * calm),
            bank: Math.sin(clock * 0.6) * 2 * calm,
            tremble: shake,
            wobble: arriving ? 0.12 * Math.exp(-since * 3.5) * Math.sin(since * 11) : 0,
            push: inJump ? into * 22 : 22 * spring,
            stretch: inJump ? 1 + 0.3 * into : arriving ? 1 + 0.3 * Math.exp(-since * 9) * Math.cos(since * 16) : 1,
            heat: inJump ? 1 : arriving ? Math.max(0, 1 - since / 1.1) : 0,
            whiteout: arriving ? Math.max(0, 1 - since / 0.14) : 0,
            charge,
            inJump,
            since
        };
    }

    // ---- The starfighter, as a small 3D model rendered to pixel art ----
    // Ship space: x to the right, y up, z forward (the nose points along +z). Each triangle carries a
    // material, a short ramp of flat shades from dark to light.
    const materials = {
        hull: ["#3f4855", "#6b7684", "#97a3b1", "#c3ccd6", "#e8edf2"],
        dark: ["#161b22", "#232a33", "#333c47", "#4a5461"],
        accent: ["#6e2418", "#9c3424", "#c84630", "#e8603f"],
        glass: ["#0c1a33", "#16305a", "#2a5596", "#7fb2ff"],
        gun: ["#2c333d", "#5f6b7a", "#a9b4c1"]
    };
    const OUTLINE = [21, 26, 33];
    const mesh = [];
    function tri(a, b, c, material) {
        mesh.push([a, b, c, material]);
    }
    function quad(a, b, c, d, material) {
        tri(a, b, c, material);
        tri(a, c, d, material);
    }
    // A ring of points around the z axis, for the hull and the nacelles.
    function ring(cx, cy, z, rx, ry, sides) {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = ((i + 0.5) / sides) * Math.PI * 2;
            points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry, z]);
        }
        return points;
    }
    function tube(rings, material) {
        for (let r = 0; r + 1 < rings.length; r++) {
            for (let i = 0; i < rings[r].length; i++) {
                const j = (i + 1) % rings[r].length;
                quad(rings[r][i], rings[r][j], rings[r + 1][j], rings[r + 1][i], material);
            }
        }
    }
    function cap(points, center, material) {
        for (let i = 0; i < points.length; i++) {
            tri(points[i], points[(i + 1) % points.length], center, material);
        }
    }
    (function build() {
        // The fuselage: a rounded body tapering to a long nose, with a dark engine block at the back.
        const tail = ring(0, 0, -12, 4.5, 4, 8);
        const middle = ring(0, 0.3, 2, 5.5, 4.5, 8);
        const front = ring(0, 0.3, 12, 3.4, 2.8, 8);
        tube([tail, middle, front], "hull");
        cap(front, [0, 0.6, 24], "hull");
        cap(tail, [0, 0, -12.5], "dark");
        // The canopy, a glass bubble on top, and the red dorsal fin behind it.
        const c = [
            [-2.6, 4.2, -3],
            [2.6, 4.2, -3],
            [2, 3.4, 8],
            [-2, 3.4, 8]
        ];
        const apex = [0, 6.6, 1.5];
        tri(c[0], c[1], apex, "glass");
        tri(c[1], c[2], apex, "glass");
        tri(c[2], c[3], apex, "glass");
        tri(c[3], c[0], apex, "glass");
        tri([0, 3.8, -12], [0, 4.4, -3], [0, 10.5, -14], "accent");
        // Swept wings with a slight droop, and a red stripe along each.
        [-1, 1].forEach(function (side) {
            quad([side * 4.5, 0, 6], [side * 4, 0, -11], [side * 27, -2.6, -13], [side * 25, -2.6, -5], "hull");
            quad([side * 8, 0.35, 0.5], [side * 8, 0.35, -3], [side * 24, -1.9, -9.5], [side * 24, -1.9, -7], "accent");
            // An engine nacelle under each wing.
            const x = side * 11.5;
            const back = ring(x, -1.8, -11, 2.4, 2.2, 6);
            const fore = ring(x, -1.8, 3, 2.4, 2.2, 6);
            tube([back, fore], "dark");
            cap(fore, [x, -1.8, 7], "dark");
            cap(back, [x, -1.8, -11.3], "dark");
        });
    })();
    // The wingtip cannons, drawn as 3D lines, and where the engines glow.
    const cannons = [
        [
            [-26.5, -2.4, -11],
            [-26.5, -2.4, 15]
        ],
        [
            [26.5, -2.4, -11],
            [26.5, -2.4, 15]
        ]
    ];
    const engines = [
        { at: [0, 0, -12.6], r: 3.4, phase: 0 },
        { at: [-11.5, -1.8, -11.4], r: 1.9, phase: 1 },
        { at: [11.5, -1.8, -11.4], r: 1.9, phase: 2 }
    ];
    const LIGHT = normalize([-0.45, 0.8, -0.4]);

    function normalize(v) {
        const length = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / length, v[1] / length, v[2] / length];
    }
    function rgb(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }
    Object.keys(materials).forEach(function (name) {
        materials[name] = materials[name].map(rgb);
    });

    // Stretch along the length, roll, then pitch (positive tips the nose down), then yaw (positive turns it
    // right), then move into place.
    function transform(yaw, pitch, roll, offset, stretch) {
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        const cp = Math.cos(pitch);
        const sp = Math.sin(pitch);
        const cr = Math.cos(roll);
        const sr = Math.sin(roll);
        return function (v, direction) {
            const x = v[0] * cr - v[1] * sr;
            const y = v[0] * sr + v[1] * cr;
            const z = direction ? v[2] : v[2] * (stretch || 1);
            const y2 = y * cp - z * sp;
            const z2 = y * sp + z * cp;
            const x3 = x * cy + z2 * sy;
            const z3 = -x * sy + z2 * cy;
            return direction ? [x3, y2, z3] : [x3 + offset[0], y2 + offset[1], z3 + offset[2]];
        };
    }

    const buffer = document.createElement("canvas");
    let bufferCtx;
    let bufferArt;
    let image;
    const depth = new Float32Array(80 * 96);
    buffer.width = 80;
    buffer.height = 96;
    const FOCAL = 76;

    function fillTriangle(a, b, c, color) {
        const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
        const maxX = Math.min(79, Math.ceil(Math.max(a[0], b[0], c[0])));
        const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
        const maxY = Math.min(95, Math.ceil(Math.max(a[1], b[1], c[1])));
        const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        if (Math.abs(area) < 0.01) {
            return;
        }
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const px = x + 0.5;
                const py = y + 0.5;
                const w0 = ((b[0] - px) * (c[1] - py) - (b[1] - py) * (c[0] - px)) / area;
                const w1 = ((c[0] - px) * (a[1] - py) - (c[1] - py) * (a[0] - px)) / area;
                const w2 = 1 - w0 - w1;
                if (w0 < 0 || w1 < 0 || w2 < 0) {
                    continue;
                }
                plot(x, y, w0 * a[2] + w1 * b[2] + w2 * c[2], color);
            }
        }
    }
    function plot(x, y, z, color) {
        const i = y * 80 + x;
        if (x < 0 || y < 0 || x > 79 || y > 95 || z >= depth[i]) {
            return;
        }
        depth[i] = z;
        image.data[i * 4] = color[0];
        image.data[i * 4 + 1] = color[1];
        image.data[i * 4 + 2] = color[2];
        image.data[i * 4 + 3] = 255;
    }

    // Render the model into the 80×96 buffer: flat-shaded triangles with a depth buffer, the cannons as
    // lines, then a dark outline around the silhouette so it reads as pixel art.
    function renderShip(pose) {
        if (!bufferCtx) {
            bufferCtx = buffer.getContext("2d");
            bufferArt = window.siteRuntime.pixels(bufferCtx);
            image = bufferCtx.createImageData(80, 96);
        }
        image.data.fill(0);
        depth.fill(Infinity);
        const place = transform(pose.yaw, pose.pitch, pose.roll, pose.offset, pose.stretch);
        function project(v) {
            return [pose.cx + (pose.focal * v[0]) / v[2], pose.cy - (pose.focal * v[1]) / v[2], v[2]];
        }
        mesh.forEach(function (face) {
            const a = place(face[0]);
            const b = place(face[1]);
            const c = place(face[2]);
            const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            let normal = normalize([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
            // Light both sides of every face: turn the normal towards the camera.
            const center = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
            if (normal[0] * center[0] + normal[1] * center[1] + normal[2] * center[2] > 0) {
                normal = [-normal[0], -normal[1], -normal[2]];
            }
            const lit = Math.max(0, normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2]);
            const ramp = materials[face[3]];
            const shade = Math.min(ramp.length - 1, Math.floor((0.2 + 0.8 * lit) * ramp.length));
            fillTriangle(project(a), project(b), project(c), ramp[shade]);
        });
        cannons.forEach(function (cannon) {
            const a = project(place(cannon[0]));
            const b = project(place(cannon[1]));
            const steps = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1));
            for (let i = 0; i <= steps; i++) {
                const f = i / steps;
                const x = Math.round(a[0] + (b[0] - a[0]) * f);
                const y = Math.round(a[1] + (b[1] - a[1]) * f);
                const z = a[2] + (b[2] - a[2]) * f;
                plot(x, y, z - 0.5, materials.gun[f > 0.85 ? 2 : 1]);
                plot(x + 1, y, z - 0.4, materials.gun[0]);
            }
        });
        const filled = new Uint8Array(80 * 96);
        for (let i = 0; i < filled.length; i++) {
            filled[i] = image.data[i * 4 + 3] ? 1 : 0;
        }
        for (let y = 0; y < 96; y++) {
            for (let x = 0; x < 80; x++) {
                const k = y * 80 + x;
                if (filled[k]) {
                    continue;
                }
                if (x > 0 && filled[k - 1] || x < 79 && filled[k + 1] || y > 0 && filled[k - 80] || y < 95 && filled[k + 80]) {
                    image.data[k * 4] = OUTLINE[0];
                    image.data[k * 4 + 1] = OUTLINE[1];
                    image.data[k * 4 + 2] = OUTLINE[2];
                    image.data[k * 4 + 3] = 255;
                }
            }
        }
        bufferCtx.putImageData(image, 0, 0);
        return {place, project, focal: pose.focal };
    }

    // An engine's glow at its projected spot: bloom, a flickering core and, at speed, a plume of exhaust
    // streaming back towards the viewer.
    function mix(from, to, amount) {
        const a = rgb(from);
        const b = rgb(to);
        return "rgb(" +
        a
            .map(function (channel, i) {
                return Math.round(channel + (b[i] - channel) * amount);
            })
            .join(",") +
        ")";
    }
    function engineGlow(art, view, engine, pose, m, t) {
        const at = view.place(engine.at);
        const spot = view.project(at);
        const r = Math.max(1, (view.focal * engine.r) / at[2]);
        const flicker = 0.85 + 0.15 * Math.sin(t * 31 + engine.phase);
        const heat = m.heat;
        const glow = heat > 0 ? mix("#ff9b4a", "#8fc8ff", heat) : m.charge > 0.5 ? "#ffd9a0" : "#ff9b4a";
        const core = heat > 0.15 ? "#ffffff" : m.charge > 0.5 ? "#fff4d6" : "#ffd0a0";
        const bloom = Math.min(1.6, (0.55 + 0.45 * Math.max(heat, m.charge)) * flicker * (1 + m.whiteout));
        const length = m.inJump ? 16 + Math.sin(t * 40 + engine.phase) * 2 : heat > 0 ? heat * 14 : m.charge * 7;
        if (length > 0.5) {
            const back = view.place([0, 0, -1], true);
            const tail = view.project([at[0] + back[0] * length, at[1] + back[1] * length, Math.max(4, at[2] + back[2] * length)]);
            const steps = Math.ceil(Math.max(Math.abs(tail[0] - spot[0]), Math.abs(tail[1] - spot[1]), 1));
            for (let i = 0; i <= steps; i++) {
                const f = i / steps;
                const width = Math.max(1, Math.round(r * 1.6 * (1 - f * 0.7)));
                art.alpha((1 - f) * 0.55 * flicker);
                art.rect(glow, Math.round(spot[0] + (tail[0] - spot[0]) * f - width / 2), Math.round(spot[1] + (tail[1] - spot[1]) * f - width / 2), width, width);
            }
        }
        [
            [r + 3.5, 0.1],
            [r + 2, 0.2],
            [r + 1, 0.3]
        ].forEach(function (ring) {
            art.alpha(ring[1] * bloom);
            art.ellipse(glow, spot[0], spot[1], ring[0], ring[0]);
        });
        art.alpha(flicker);
        art.ellipse(glow, spot[0], spot[1], Math.max(1, r - 0.5), Math.max(1, r - 0.5));
        art.ellipse(core, spot[0], spot[1], Math.max(0.6, r - 2), Math.max(0.6, r - 2));
        art.alpha(1);
    }

    // Which way the nose points: towards the vanishing point of the star field behind the page, which sits
    // in the middle of the window. The hero sprite's place on screen decides the angle. Only half of the
    // downward angle is used: tipping the nose further down would turn the wings edge-on to the camera.
    const sprite = document.querySelector(".hyperspace-sprite");
    function aim() {
        if (!sprite) {
            return { yaw: 0, pitch: 0.25 };
        }
        const box = sprite.getBoundingClientRect();
        if (!box.width) {
            return { yaw: 0, pitch: 0.25 };
        }
        const dx = innerWidth / 2 - (box.left + box.width / 2);
        const dy = innerHeight / 2 - (box.top + box.height / 2);
        const reach = 520;
        const limit = 0.75;
        return {
            yaw: Math.max(-limit, Math.min(limit, Math.atan2(dx, reach))),
            pitch: Math.max(-limit, Math.min(limit, Math.atan2(dy, reach) * 0.5))
        };
    }

    // The ship's projected bounding box, cannons included, for a projection centred on (0, 0).
    function boundsOf(heading, roll, offset, stretch) {
        const place = transform(heading.yaw, heading.pitch, roll, offset, stretch);
        const box = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
        function add(point) {
            const v = place(point);
            const x = (FOCAL * v[0]) / v[2];
            const y = (-FOCAL * v[1]) / v[2];
            box.left = Math.min(box.left, x);
            box.right = Math.max(box.right, x + 1);
            box.top = Math.min(box.top, y);
            box.bottom = Math.max(box.bottom, y);
        }
        mesh.forEach(function (face) {
            face.slice(0, 3).forEach(add);
        });
        cannons.forEach(function (cannon) {
            cannon.forEach(add);
        });
        return box;
    }

    // Where the ship is at time t into the loop: its turn, place and stretch, and where it sits in the frame.
    // The bob, bank and shake follow the running clock instead, so they carry on smoothly into the next loop.
    function poseAt(t, heading, clock) {
        const m = motionAt(t, clock);
        // Fly along the nose: further away (and so smaller) through the jump.
        const forward = transform(heading.yaw, heading.pitch, 0, [0, 0, 0])([0, 0, 1], true);
        const push = m.push;
        const base = [0, -24, 58];
        const roll = m.bank * 0.06 + Math.sin(clock * 29) * m.tremble * 0.01 + m.wobble;
        const offset = [base[0] + forward[0] * push, base[1] + forward[1] * push, base[2] + forward[2] * push];
        // Centre the ship where it is now, drift it a little towards the vanishing point as it pulls away,
        // and keep the whole model inside the frame, shake included. Shrink the view when the ship would not
        // fit (outline and margin included), sized on whichever is larger: the ship at rest or as it is now.
        const margin = 3;
        const rest = boundsOf(heading, roll, base, 1);
        const now = boundsOf(heading, roll, offset, m.stretch);
        const fit = Math.min(
            1,
            (80 - margin * 2) / Math.max(rest.right - rest.left, now.right - now.left),
            (96 - margin * 2) / Math.max(rest.bottom - rest.top, now.bottom - now.top)
        );
        const box = {
            left: now.left * fit,
            right: now.right * fit,
            top: now.top * fit,
            bottom: now.bottom * fit
        };
        let cx = 40 - (box.left + box.right) / 2 + Math.max(0, push) * Math.sin(heading.yaw) * 0.6 + m.x;
        let cy = 48 - (box.top + box.bottom) / 2 + Math.max(0, push) * Math.sin(heading.pitch) * 0.6 + m.y;
        cx = Math.max(margin - box.left, Math.min(80 - margin - box.right, cx));
        cy = Math.max(margin - box.top, Math.min(96 - margin - box.bottom, cy));
        return {
            m,
            pose: {
                yaw: heading.yaw,
                pitch: heading.pitch,
                roll,
                offset,
                stretch: m.stretch,
                cx,
                cy,
                focal: FOCAL * fit
            }
        };
    }

    // Afterimages: the ship at a few earlier moments, tinted blue and faded, so the first half second out of
    // hyperspace leaves a trail from where it was back to where it is.
    const ghost = document.createElement("canvas");
    let ghostCtx;
    ghost.width = 80;
    ghost.height = 96;
    function afterimages(art, t, heading, since, clock) {
        if (since < 0 || since >= 0.5) {
            return;
        }
        ghostCtx = ghostCtx || ghost.getContext("2d");
        for (let k = 3; k >= 1; k--) {
            renderShip(poseAt(t - k * 0.05, heading, clock - k * 0.05).pose);
            ghostCtx.globalCompositeOperation = "copy";
            ghostCtx.globalAlpha = 1;
            ghostCtx.drawImage(buffer, 0, 0);
            ghostCtx.globalCompositeOperation = "source-atop";
            ghostCtx.globalAlpha = 0.7;
            ghostCtx.fillStyle = "#8fc8ff";
            ghostCtx.fillRect(0, 0, 80, 96);
            art.ctx.globalAlpha = 0.4 * (1 - k / 4) * (1 - since / 0.5);
            art.ctx.drawImage(ghost, 0, 0);
        }
        art.ctx.globalAlpha = 1;
    }

    function draw(art, clock) {
        const t = clock % sound.loop;
        const heading = aim();
        const now = poseAt(t, heading, clock);
        const m = now.m;
        art.ctx.imageSmoothingEnabled = false;
        afterimages(art, t, heading, m.since, clock);
        const view = renderShip(now.pose);
        // The hull flashes white for an instant as the ship drops out.
        if (m.whiteout > 0) {
            bufferCtx.globalCompositeOperation = "source-atop";
            bufferCtx.globalAlpha = m.whiteout * 0.85;
            bufferCtx.fillStyle = "#ffffff";
            bufferCtx.fillRect(0, 0, 80, 96);
            bufferCtx.globalCompositeOperation = "source-over";
            bufferCtx.globalAlpha = 1;
        }
        engines.forEach(function (engine) {
            engineGlow(bufferArt, view, engine, now.pose, m, clock);
        });
        art.ctx.drawImage(buffer, 0, 0);
    }

    // Behind the page: the same flight through a wider star field, faint over the reading column.
    function drawLayer(ctx, width, height, clock) {
        const t = clock % sound.loop;
        const inJump = t >= sound.jump && t < sound.drop;
        ctx.lineWidth = inJump ? 2 : 1.5;
        ctx.lineCap = "round";
        ctx.strokeStyle = starColor(t);
        eachStar(pageStars, clock, width / 2, height / 2, Math.max(width, height) * 0.35, function (x, y, tx, ty, bright) {
            ctx.globalAlpha = bright * 0.8 * readingFade(x, width);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(x + 0.5, y + 0.5);
            ctx.stroke();
        });
        const flash = t >= sound.drop ? Math.max(0, 1 - (t - sound.drop) * 3) : 0;
        if (flash > 0) {
            ctx.globalAlpha = flash * 0.35;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }
    }

    window.siteRuntime.spriteMode({
        mode: "hyperspace",
        sprite: ".hyperspace-sprite",
        draw,
        still: 9,
        fps: 30,
        layer: { className: "hyperspace-stars", draw: drawLayer }
    });
})();