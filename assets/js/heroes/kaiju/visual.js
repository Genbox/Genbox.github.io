(function () {
    "use strict";
    const runtime = window.siteRuntime;
    const sound = runtime.sounds.kaiju;
    const image = new Image();
    const frames = [];
    let shaken = [];
    let screenShaken = [];
    const chargeLength = 2;
    const holdLength = Math.ceil(sound.roarLength / sound.beat) * sound.beat;

    // Integrate only walking time; charging and firing hold the exact same position.
    function stateAt(t) {
        const cycle = t % sound.loop;
        const holds = sound.roars.length * (chargeLength + holdLength);
        const state = {
            walked: Math.floor(t / sound.loop) * (sound.loop - holds) + cycle,
            charge: 0,
            fire: 0,
            stopped: false
        };
        sound.roars.forEach(function (roar) {
            const start = roar - chargeLength;
            if (cycle >= start && cycle < roar + holdLength) {
                state.stopped = true;
            }
            state.walked -= Math.max(0, Math.min(cycle - start, chargeLength + holdLength));
            if (cycle >= start && cycle < roar) {
                state.charge = (cycle - start) / chargeLength;
                state.stopped = true;
            }
            if (cycle >= roar && cycle < roar + sound.roarLength) {
                state.fire = Math.min(1, (cycle - roar) / 0.12) * Math.min(1, (roar + sound.roarLength - cycle) / 0.25);
                state.charge = 1;
                state.stopped = true;
            }
        });
        return state;
    }
    // The depth sway, arm counter-swing and torso perspective are drawn in all eight poses.
    // Extract connected sprites so tails that extend past a nominal atlas cell are not clipped.
    function buildFrames() {
        const atlas = document.createElement("canvas");
        atlas.width = image.width;
        atlas.height = image.height;
        const source = atlas.getContext("2d");
        source.drawImage(image, 0, 0);
        const width = atlas.width;
        const height = atlas.height;
        const pixels = source.getImageData(0, 0, width, height).data;
        const labels = new Int32Array(width * height);
        const queue = new Int32Array(width * height);
        const sprites = [];
        let label = 0;
        function visit(pixel, id, tail) {
            if (!labels[pixel] && pixels[pixel * 4 + 3] > 8) {
                labels[pixel] = id;
                queue[tail++] = pixel;
            }
            return tail;
        }
        for (let pixel = 0; pixel < labels.length; pixel++) {
            if (labels[pixel] || pixels[pixel * 4 + 3] <= 8) {
                continue;
            }
            const id = ++label;
            let head = 0;
            let tail = 1;
            let left = width;
            let top = height;
            let right = 0;
            let bottom = 0;
            queue[0] = pixel;
            labels[pixel] = id;
            while (head < tail) {
                const current = queue[head++];
                const x = current % width;
                const y = Math.floor(current / width);
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
                if (x) {
                    tail = visit(current - 1, id, tail);
                }
                if (x + 1 < width) {
                    tail = visit(current + 1, id, tail);
                }
                if (y) {
                    tail = visit(current - width, id, tail);
                }
                if (y + 1 < height) {
                    tail = visit(current + width, id, tail);
                }
            }
            if (tail > 10000) {
                sprites.push({id, left, top, right, bottom});
            }
        }
        sprites.sort(function (a, b) {
            return Math.floor(a.top / (height / 2)) - Math.floor(b.top / (height / 2)) || a.left - b.left;
        });
        sprites.forEach(function (sprite) {
            const cutout = document.createElement("canvas");
            const cut = cutout.getContext("2d");
            cutout.width = sprite.right - sprite.left + 1;
            cutout.height = sprite.bottom - sprite.top + 1;
            const crop = source.getImageData(sprite.left, sprite.top, cutout.width, cutout.height);
            for (let y = 0; y < cutout.height; y++) {
                for (let x = 0; x < cutout.width; x++) {
                    if (labels[(sprite.top + y) * width + sprite.left + x] !== sprite.id) {
                        crop.data[(y * cutout.width + x) * 4 + 3] = 0;
                    }
                }
            }
            cut.putImageData(crop, 0, 0);
            const frame = document.createElement("canvas");
            const ctx = frame.getContext("2d");
            frame.width = 544;
            frame.height = 416;
            ctx.imageSmoothingEnabled = false;
            // Uniform scale and grounded registration only: no skew, rotation, squash or mesh deformation.
            ctx.drawImage(cutout, 18, 392 - cutout.height * 1.08, cutout.width * 1.08, cutout.height * 1.08);
            frames.push(frame);
        });
    }
    function clearShake() {
        shaken.concat(screenShaken).forEach(function (entry) {
            entry.element.style.translate = entry.translate;
        });
    }
    function shake(x, height, t, state) {
        if (runtime.reducedMotion.matches) {
            clearShake();
            return;
        }
        if (state.fire) {
            shaken.forEach(function (entry) {
                entry.element.style.translate = entry.translate;
            });
            const dx = Math.round((Math.sin(t * 43) + Math.sin(t * 71) * 0.4) * 3 * state.fire);
            const dy = Math.round(Math.cos(t * 53) * 2 * state.fire);
            screenShaken.forEach(function (entry) {
                entry.element.style.translate = dx + "px " + dy + "px";
            });
            return;
        }
        screenShaken.forEach(function (entry) {
            entry.element.style.translate = entry.translate;
        });
        if (state.stopped) {
            clearShake();
            return;
        }
        const phase = (state.walked / sound.beat) % 1;
        const energy = Math.max(0, 1 - phase / 0.25);
        shaken.forEach(function (entry, i) {
            const box = entry.element.getBoundingClientRect();
            const distance = Math.abs(box.left + box.width / 2 - x);
            const amount = energy * Math.max(0, 1 - distance / 300) * 3;
            entry.element.style.translate =
                box.bottom < 0 || box.top > height || amount < 0.3 ? entry.translate : Math.round(Math.sin(t * 70 + i) * amount) + "px " + Math.round(amount * 0.7) + "px";
        });
    }
    function toggle(on) {
        clearShake();
        screenShaken = on
            ? Array.from(document.querySelectorAll("body > header, body > main, body > footer"), element => ({ element, translate: element.style.translate }))
            : [];
        shaken = on
            ? Array.from(document.querySelectorAll(".card, .post-list li, .panel, .pager .pg"), element => ({ element, translate: element.style.translate }))
            : [];
    }
    // Energy climbs the dorsal ridge in discrete pulses, followed by jagged electrical arcs to the jaws.
    function chargeSpines(ctx, x, y, scale, t, state) {
        if (!state.charge) {
            return;
        }
        const ridge = [
            [450, 285],
            [400, 300],
            [350, 267],
            [313, 221],
            [285, 166],
            [245, 109],
            [208, 30],
            [150, 50],
            [83, 85],
            [51, 120]
        ];
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.globalCompositeOperation = "screen";
        ridge.forEach(function (p, i) {
            const arrival = i / ridge.length;
            if (state.charge < arrival) {
                return;
            }
            const power = Math.min(1, (state.charge - arrival) * 5);
            ctx.globalAlpha = power * (0.65 + 0.2 * Math.sin(t * 15 - i));
            ctx.fillStyle = "#1bbaff";
            ctx.fillRect(p[0] - 5, p[1] - 9, 10, 18);
            ctx.fillStyle = "#d8ffff";
            ctx.fillRect(p[0] - 2, p[1] - 6, 4, 12);
            if (i && state.charge > 0.45) {
                const previous = ridge[i - 1];
                ctx.strokeStyle = "#70e5ff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(previous[0], previous[1]);
                for (let j = 1; j <= 4; j++) {
                    const fraction = j / 4;
                    const jitter = j === 4 ? 0 : Math.sin(Math.floor(t * 12) * 3 + i * 7 + j) * 9;
                    ctx.lineTo(previous[0] + (p[0] - previous[0]) * fraction + jitter, previous[1] + (p[1] - previous[1]) * fraction - jitter);
                }
                ctx.stroke();
            }
            for (let spark = 0; spark < 3; spark++) {
                const phase = (t * 1.7 + i * 0.31 + spark / 3) % 1;
                ctx.globalAlpha = power * (1 - phase);
                ctx.fillRect(p[0] + Math.sin(i + spark * 7) * phase * 22, p[1] - phase * 35, 3, 3);
            }
        });
        ctx.restore();
    }
    // Diameter grows from 5 to 30 CSS pixels, independent of the monster's display scale.
    function mouthBloom(ctx, t, charge) {
        const growth = Math.min(1, charge * 2);
        const radius = (5 + growth * 25) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        glow.addColorStop(0, "#efffff");
        glow.addColorStop(0.45, "#68e7ff");
        glow.addColorStop(1, "rgba(0,155,255,0.35)");
        ctx.globalAlpha = 0.4 + charge * 0.6;
        ctx.fillStyle = glow;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        const count = Math.floor(14 + charge * 30);
        for (let i = 0; i < count; i++) {
            const life = (t * 1.6 + i * 0.618034) % 1;
            const angle = i * 2.39996 + life * 0.8;
            const distance = radius * Math.sqrt(life);
            ctx.globalAlpha = (0.3 + charge * 0.7) * (1 - life * 0.6);
            ctx.fillStyle = i % 3 ? "#42d9ff" : "#ffffff";
            ctx.fillRect(Math.cos(angle) * distance - 0.5, Math.sin(angle) * distance - 0.5, 1, 1);
        }
        ctx.globalAlpha = charge;
        ctx.fillStyle = "#eeffff";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    function energy(ctx, mouth, t, state, scale) {
        if (!state.charge) {
            return;
        }
        ctx.save();
        ctx.translate(mouth.x, mouth.y);
        ctx.globalCompositeOperation = "screen";
        mouthBloom(ctx, t, state.charge);
        if (state.fire) {
            const length = Math.max(0, mouth.x + 20);
            const thickness = (9 + Math.sin(t * 45) * 2) * scale * state.fire;
            ctx.globalAlpha = state.fire;
            [
                ["rgba(0,130,255,0.18)", 3],
                ["#168fff", 1],
                ["#71eaff", 0.6],
                ["#efffff", 0.22]
            ].forEach(function (band) {
                ctx.fillStyle = band[0];
                ctx.fillRect(-length, -thickness * band[1], length, thickness * band[1] * 2);
            });
            for (let spark = 0; spark < 28; spark++) {
                const travel = (t * 3 + spark * 0.137) % 1;
                ctx.fillRect(-travel * length, Math.sin(spark * 7 + t * 8) * (thickness + travel * 22), 3 * scale, 2 * scale);
            }
        }
        ctx.restore();
    }
    // Independent discharges jump around page surfaces and borders, never from the monster.
    function screenElectricity(ctx, width, height, t, fire) {
        if (!fire) {
            return;
        }
        const surfaces = shaken
            .concat(screenShaken.slice(0, 1))
            .map(function (entry) {
                return entry.element.getBoundingClientRect();
            })
            .filter(function (box) {
                return box.bottom > 0 && box.top < height && box.width > 20;
            })
            .slice(0, 20);
        function random(seed) {
            const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
            return value - Math.floor(value);
        }
        function clamp(value, limit) {
            return Math.max(2, Math.min(limit - 2, value));
        }
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const count = Math.max(7, Math.min(15, Math.ceil(width / 95)));
        for (let bolt = 0; bolt < count; bolt++) {
            // Stagger short, irregular bursts so the entire screen does not flash together.
            const clock = t * (8 + bolt % 5) + bolt * 0.37;
            const burst = Math.floor(clock);
            const age = clock - burst;
            const seed = burst * 97 + bolt * 31;
            if (random(seed + 1) < 0.22 || age > 0.82) {
                continue;
            }
            let sx = width * ((bolt % 4 + random(seed + 2)) / 4);
            let sy = height * ((Math.floor(bolt / 4) % 4 + random(seed + 3)) / 4);
            let dx;
            let dy;
            if (surfaces.length && bolt % 3 !== 0) {
                const box = surfaces[Math.floor(random(seed + 4) * surfaces.length)];
                const vertical = random(seed + 5) > 0.5;
                if (vertical) {
                    sx = random(seed + 6) > 0.5 ? box.left : box.right;
                    sy = clamp(box.top + random(seed + 7) * box.height, height);
                    dx = (random(seed + 8) - 0.5) * 65;
                    dy = (random(seed + 9) > 0.5 ? 1 : -1) * (50 + random(seed + 10) * 150);
                } else {
                    sx = box.left + random(seed + 6) * box.width;
                    sy = clamp(random(seed + 7) > 0.5 ? box.top : box.bottom, height);
                    dx = (random(seed + 8) > 0.5 ? 1 : -1) * (70 + random(seed + 9) * 180);
                    dy = (random(seed + 10) - 0.5) * 55;
                }
            } else {
                const angle = random(seed + 4) * Math.PI * 2;
                const span = 80 + random(seed + 5) * 200;
                dx = Math.cos(angle) * span;
                dy = Math.sin(angle) * span;
            }
            sx = clamp(sx, width);
            sy = clamp(sy, height);
            const ex = clamp(sx + dx, width);
            const ey = clamp(sy + dy, height);
            const points = [{ x: sx, y: sy }];
            const segments = 10;
            const length = Math.hypot(ex - sx, ey - sy) || 1;
            for (let i = 1; i <= segments; i++) {
                const fraction = i / segments;
                const jitter = i === segments ? 0 : (random(seed + 20 + i + Math.floor(age * 3) * 17) - 0.5) * 44;
                points.push({
                    x: clamp(sx + (ex - sx) * fraction - ((ey - sy) / length) * jitter, width),
                    y: clamp(sy + (ey - sy) * fraction + ((ex - sx) / length) * jitter, height)
                });
            }
            ctx.globalAlpha = fire * Math.min(1, age * 12) * (1 - age * 0.6);
            [
                [7, "rgba(0,120,255,0.18)"],
                [3, "rgba(35,183,255,0.6)"],
                [1, "#c7f5ff"]
            ].forEach(function (stroke) {
                ctx.lineWidth = stroke[0];
                ctx.strokeStyle = stroke[1];
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.slice(1).forEach(function (p) {
                    ctx.lineTo(p.x, p.y);
                });
                ctx.stroke();
            });
            const fork = points[3 + bolt % 4];
            ctx.beginPath();
            ctx.moveTo(fork.x, fork.y);
            for (let branch = 1; branch <= 4; branch++) {
                ctx.lineTo(fork.x + (random(seed + 50 + branch) - 0.5) * branch * 24, fork.y + (random(seed + 60 + branch) - 0.5) * branch * 24);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(106,226,255,0.7)";
            ctx.stroke();
            ctx.fillStyle = "#dfffff";
            ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }
        ctx.restore();
    }
    function drawLayer(ctx, width, height, t) {
        const still = runtime.reducedMotion.matches;
        let state = stateAt(t);
        if (still) {
            state = { walked: 0, charge: 0, fire: 0, stopped: true };
            t = 0;
        }
        const size = Math.min(360, width * 0.7, height * 0.65);
        const scale = size / 544;
        const x = still ? width - size - 16 : width - ((state.walked / sound.beat) * 96 * scale + size * 0.65) % (width + size);
        const y = height - 392 * scale - 4;
        // Four poses per step; travel uses the same 96-pixel stride at every viewport size.
        const step = state.walked / sound.beat;
        // Pose 3 has both feet planted. Hold it throughout charging, firing and recovery.
        const frame = state.stopped ? 3 : Math.floor(step * 4) % frames.length;
        const mouth = { x: x + 56 * scale, y: y + 113 * scale - 9 };
        screenElectricity(ctx, width, height, t, state.fire);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frames[frame], x, y, size, 416 * scale);
        chargeSpines(ctx, x, y, scale, t, state);
        energy(ctx, mouth, t, state, Math.max(0.65, scale));
        shake(x + 180 * scale, height, t, state);
    }
    // Wait for the sprite before registering, including the single reduced-motion draw.
    image.onload = function () {
        buildFrames();
        runtime.spriteMode({
            mode: "kaiju",
            still: 0,
            fps: 30,
            layer: { className: "kaiju-stomp", draw: drawLayer },
            toggle
        });
    };
    window.addEventListener("pagehide", clearShake);
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            clearShake();
        }
    });
    image.src = window.siteAsset("../images/heroes/kaiju-walk-depth.webp");
})();