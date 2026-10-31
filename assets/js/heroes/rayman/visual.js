(function () {
    "use strict";
    // A colourful jungle platformer: a round purple critter hops between three floating mossy rocks, snatching
    // the glowing orbs that hang over each jump. Four hops make an 8-second round.
    const colors = {
        skyTop: "#2a9fb3",
        skyLow: "#7fd6c2",
        leaf: "#2f8a4a",
        leafLight: "#4fb35f",
        vine: "#2a6b3a",
        rock: "#6b5a4a",
        rockDark: "#4a3d32",
        moss: "#5ccf5a",
        mossLight: "#9cf08a",
        body: "#8a5cf6",
        bodyDark: "#6a3fd0",
        belly: "#c9b2ff",
        eye: "#ffffff",
        pupil: "#10141c",
        foot: "#ff9a3c",
        orb: "#ffe14d",
        orbCore: "#fff8c2",
        text: "#fff8c2",
        ink: "#10141c"
    };
    const LOOP = 8;
    // The tops of the three platforms.
    const PADS = [[14, 74], [40, 62], [66, 74]];
    // Each hop: from pad, to pad, starting second. An orb hangs over the middle of every hop.
    const HOPS = [[0, 1, 0], [1, 2, 2], [2, 1, 4], [1, 0, 6]];

    function where(p) {
        for (let i = 0; i < HOPS.length; i++) {
            const hop = HOPS[i];
            if (p >= hop[2] && p < hop[2] + 1) {
                const f = p - hop[2];
                const a = PADS[hop[0]];
                const b = PADS[hop[1]];
                return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f - Math.sin(f * Math.PI) * 18, air: true, dir: Math.sign(b[0] - a[0]) };
            }
            if (p >= hop[2] + 1 && p < (HOPS[i + 1] ? HOPS[i + 1][2] : LOOP)) {
                const pad = PADS[hop[1]];
                return { x: pad[0], y: pad[1], air: false, landed: p - hop[2] - 1, dir: 0 };
            }
        }
        return { x: PADS[0][0], y: PADS[0][1], air: false, landed: 1, dir: 0 };
    }

    function orbAt(i) {
        const hop = HOPS[i];
        const a = PADS[hop[0]];
        const b = PADS[hop[1]];
        return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 18 - 4];
    }

    function drawJungle(art, t) {
        for (let y = 0; y < 96; y += 4) {
            art.rect(y < 48 ? colors.skyTop : colors.skyLow, 0, y, 80, 4);
        }
        // Big leaves in the corners and vines swaying from the top.
        art.ellipse(colors.leaf, 4, 20, 12, 5);
        art.ellipse(colors.leafLight, 2, 19, 8, 2);
        art.ellipse(colors.leaf, 78, 34, 12, 5);
        art.ellipse(colors.leaf, 6, 92, 14, 6);
        art.ellipse(colors.leaf, 76, 94, 14, 6);
        [24, 52, 70].forEach(function (x, i) {
            for (let y = 0; y < 22 + i * 6; y++) {
                const sway = Math.round(Math.sin(t * 1.5 + y * 0.15 + i) * y / 14);
                art.rect(colors.vine, x + sway, y, 1, 1);
                if (y % 6 === 5) {
                    art.rect(colors.leafLight, x + sway + 1, y, 2, 1);
                }
            }
        });
    }

    function drawPad(art, pad, t, i) {
        const bob = Math.round(Math.sin(t * 2 + i) * 1);
        const x = pad[0];
        const y = pad[1] + bob;
        art.ellipse(colors.rockDark, x, y + 5, 10, 5);
        art.ellipse(colors.rock, x, y + 3, 10, 4);
        art.rect(colors.moss, x - 10, y, 21, 2);
        art.rect(colors.mossLight, x - 8, y, 6, 1);
        art.rect(colors.rockDark, x - 2, y + 9, 3, 2);
    }

    function drawOrb(art, x, y, t) {
        const pulse = 1 + Math.sin(t * 6) * 0.4;
        art.alpha(0.35);
        art.ellipse(colors.orb, x, y, 3 + pulse, 3 + pulse);
        art.alpha(1);
        art.ellipse(colors.orb, x, y, 2, 2);
        art.rect(colors.orbCore, Math.round(x) - 1, Math.round(y) - 1, 1, 1);
    }

    function drawCritter(art, state, t) {
        const x = Math.round(state.x);
        const squash = !state.air && state.landed < 0.15 ? 1 : 0;
        const idle = !state.air ? Math.round(Math.sin(t * 8) * 0.6) : 0;
        const y = Math.round(state.y) + idle;
        const look = state.dir || 1;
        art.rect(colors.foot, x - 5, y - 2, 4, 2);
        art.rect(colors.foot, x + 2, y - 2, 4, 2);
        art.ellipse(colors.bodyDark, x, y - 7 + squash, 7 + squash, 6 - squash);
        art.ellipse(colors.body, x, y - 8 + squash, 6 + squash, 5 - squash);
        art.ellipse(colors.belly, x, y - 5 + squash, 4, 2);
        const blink = t % 3.3 < 0.12;
        [-2, 2].forEach(function (dx) {
            art.ellipse(colors.eye, x + dx + look, y - 10 + squash, 2, blink ? 0.5 : 2);
            if (!blink) {
                art.rect(colors.pupil, x + dx + look * 2, y - 10 + squash, 1, 2);
            }
        });
        // A little tuft that streams behind in the air.
        art.rect(colors.bodyDark, x - look * 2, y - 14 + squash, 1, 2);
        art.rect(colors.bodyDark, x - look * 3 - (state.air ? look : 0), y - 15 + squash, 1, 1);
    }

    function draw(art, t) {
        const loops = Math.floor(t / LOOP);
        const p = t % LOOP;
        drawJungle(art, t);
        PADS.forEach(function (pad, i) {
            drawPad(art, pad, t, i);
        });
        let collected = 0;
        HOPS.forEach(function (hop, i) {
            const orb = orbAt(i);
            const taken = hop[2] + 0.5;
            if (p < taken) {
                drawOrb(art, orb[0], orb[1] + Math.sin(t * 3 + i), t);
            } else {
                collected++;
                if (p < taken + 0.5) {
                    // A burst of sparkles where the orb was.
                    const f = (p - taken) / 0.5;
                    art.alpha(1 - f);
                    for (let s = 0; s < 6; s++) {
                        const a = s / 6 * Math.PI * 2;
                        art.rect(colors.orbCore, Math.round(orb[0] + Math.cos(a) * f * 8), Math.round(orb[1] + Math.sin(a) * f * 8), 1, 1);
                    }
                    art.alpha(1);
                }
            }
        });
        drawCritter(art, where(p), t);
        drawOrb(art, 6, 6, t);
        art.text("X " + (loops * 4 + collected), 11, 4, colors.text);
    }

    window.siteRuntime.spriteMode({
        mode: "rayman",
        sprite: ".rayman-sprite",
        draw,
        still: 0.45,
        fps: 20
    });
})();