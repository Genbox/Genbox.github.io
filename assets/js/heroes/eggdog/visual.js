(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.eggdog;
    const readingFade = window.siteRuntime.readingFade;
    const colors = {
        fur: "#f6f3ec",
        shade: "#ddd7cb",
        deep: "#c2baab",
        outline: "#8d8576",
        ink: "#1a1716",
        nose: "#2b2422",
        tongue: "#f28a9b",
        paw: "#eadcc3",
        shadow: "#000000"
    };

    // A fluffy dog groomed into a perfect egg: wider at the bottom, with a ragged outline of fur. It hops on
    // every beat, squashing as it lands, and its face swings round as the egg spins (angle 0 faces forward).
    function eggdog(art, cx, ground, rx, ry, phase, angle) {
        const lift = Math.sin(phase * Math.PI);
        const land = Math.max(0, 1 - Math.min(phase, 1 - phase) / 0.12);
        const height = lift * ry * 0.75;
        const squash = 1 + land * 0.14;
        const w = rx * squash;
        const h = ry / squash;
        const cy = ground - h - height;
        art.alpha(0.25 * (1 - lift * 0.6));
        art.ellipse(colors.shadow, cx, ground, w * (1 - lift * 0.4), 2);
        art.alpha(1);
        if (lift < 0.2) {
            [-0.55, -0.2, 0.2, 0.55].forEach(function (x) {
                art.rect(colors.paw, Math.round(cx + x * w) - 1, ground - 2, 3, 2);
            });
        }
        for (let y = Math.ceil(cy - h); y <= Math.floor(cy + h); y++) {
            const v = (y - cy) / h;
            const half = w * Math.sqrt(Math.max(0, 1 - v * v)) * (1 + 0.14 * v);
            const fluff = y % 3 === 0 ? 1 : 0;
            const left = Math.round(cx - half) - fluff;
            const right = Math.round(cx + half) + fluff;
            if (right - left <= 0) {
                continue;
            }
            art.rect(colors.outline, left, y, right - left, 1);
            art.rect(colors.fur, left + 1, y, right - left - 2, 1);
            // Shade the right flank and the underside so the egg reads round.
            const shadeFrom = Math.round(cx + half * 0.35);
            if (right - 1 > shadeFrom) {
                art.rect(v > 0.55 ? colors.deep : colors.shade, shadeFrom, y, right - 1 - shadeFrom, 1);
            }
            if (v > 0.7) {
                art.rect(colors.shade, left + 1, y, right - left - 2, 1);
            }
        }
        art.rect("#ffffff", Math.round(cx - w * 0.45), Math.round(cy - h * 0.55), 3, 2);
        // The face, carried round the egg as it spins; hidden while it faces away.
        const facing = Math.cos(angle);
        if (facing <= 0.05) {
            return;
        }
        const fx = cx + Math.sin(angle) * w * 0.75;
        const spread = Math.max(1, Math.round(rx * 0.24 * facing));
        const fy = Math.round(cy - h * 0.12);
        [-1, 1].forEach(function (side) {
            const ex = Math.round(fx + side * spread) - (side < 0 ? 2 : 0);
            art.rect(colors.ink, ex, fy - 1, 2, 3);
            art.rect("#ffffff", ex, fy - 1, 1, 1);
        });
        art.rect(colors.nose, Math.round(fx) - 1, fy + 3, 3, 2);
        if (lift > 0.3) {
            art.rect(colors.tongue, Math.round(fx), fy + 5, 2, 2);
        } else {
            art.rect(colors.outline, Math.round(fx) - 1, fy + 5, 3, 1);
        }
    }

    function spinAt(t) {
        if (t < sound.spin) {
            return 0;
        }
        const p = (t - sound.spin) / (sound.loop - sound.spin);
        return p * Math.PI * 4;
    }

    function draw(art, t) {
        t %= sound.loop;
        const phase = (t / sound.beat) % 1;
        art.ellipse("#2b3a2f", 40, 88, 32, 4);
        art.ellipse("#3b5241", 40, 87, 30, 3);
        eggdog(art, 40, 87, 17, 21, phase, spinAt(t));
        // Little motion ticks where it lands.
        if (phase < 0.15) {
            art.alpha(1 - phase / 0.15);
            [
                [16, 80],
                [14, 85],
                [64, 80],
                [66, 85]
            ].forEach(function (tick) {
                art.rect("#f6f3ec", tick[0], tick[1], 2, 1);
            });
            art.alpha(1);
        }
    }

    // A parade of little eggdogs hopping along the bottom of the page, each a step behind the one ahead.
    let pageArt;
    function drawLayer(ctx, width, height, t) {
        pageArt = pageArt && pageArt.ctx === ctx ? pageArt : window.siteRuntime.pixels(ctx);
        const scale = 2;
        const columns = width / scale;
        const ground = Math.floor(height / scale) - 4;
        const gap = 60;
        const march = (t * 12) % gap;
        const spin = spinAt(t % sound.loop);
        ctx.save();
        ctx.scale(scale, scale);
        for (let i = -1; i * gap < columns + gap; i++) {
            const x = Math.round(i * gap + march);
            const phase = ((t / sound.beat + i * 0.25) % 1 + 1) % 1;
            const fade = readingFade(x * scale, width);
            // Faint over the reading column, like the other page layers.
            const art = {
                rect: pageArt.rect,
                ellipse: pageArt.ellipse,
                alpha(amount) {
                    ctx.globalAlpha = amount * fade;
                }
            };
            art.alpha(1);
            eggdog(art, x, ground, 7, 9, phase, spin ? spin + i * 0.5 : 0);
        }
        ctx.restore();
    }

    window.siteRuntime.spriteMode({
        mode: "eggdog",
        sprite: ".eggdog-sprite",
        draw,
        still: 0.25,
        fps: 30,
        layer: { className: "eggdog-parade", draw: drawLayer }
    });
})();