(function () {
    "use strict";
    // A blocky voxel world: a miner in a hard hat swings his pickaxe on the beat at the block in front of him.
    // Each block (stone, dirt, a log, then ore) cracks for 1.6 seconds, pops, drops a little copy that flies to
    // the hotbar, and the next block takes its place. Four blocks make an 8-second round.
    const colors = {
        sky: "#7ec0ee",
        skyLow: "#a9d6f5",
        sun: "#fff2a0",
        cloud: "#ffffff",
        grass: "#5cab3c",
        grassLight: "#7cc84f",
        dirt: "#8a5a3a",
        dirtDark: "#6b4528",
        stone: "#8a8a8a",
        stoneDark: "#6b6b6b",
        stoneLight: "#a8a8a8",
        log: "#6b4a2b",
        logDark: "#4a321c",
        logTop: "#b08a5a",
        ore: "#f2c53d",
        crack: "#1b1b1b",
        hat: "#f2c53d",
        hatDark: "#c99a1a",
        lamp: "#fff6c8",
        skin: "#d9a07a",
        skinDark: "#b8805a",
        eye: "#2a1a12",
        shirt: "#c62e2e",
        shirtDark: "#8e1c1c",
        overalls: "#5d6673",
        overallsDark: "#3d434d",
        boot: "#3a2a1a",
        handle: "#7a5a32",
        head: "#c9ced5",
        headDark: "#7d8590",
        slot: "#5a5a5a",
        slotDark: "#2a2a2a",
        slotLight: "#9a9a9a",
        count: "#ffffff"
    };
    const LOOP = 8;
    const SIZE = 12;
    const KINDS = ["stone", "dirt", "log", "ore"];
    // The block being mined sits on the ground in front of the miner.
    const BLOCK_X = 32;
    const BLOCK_Y = 64;
    const GROUND = 76;
    const MINE = 1.6;

    function brush(art, color, x0, y0, x1, y1, size) {
        const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        const offset = Math.floor(size / 2);
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + (x1 - x0) * i / steps) - offset, Math.round(y0 + (y1 - y0) * i / steps) - offset, size, size);
        }
    }

    // A block of the given kind at (x, y), size pixels square, with a fixed speckled texture.
    function block(art, kind, x, y, size) {
        const unit = size / 12;
        const dot = function (color, dx, dy, w, h) {
            art.rect(color, x + Math.round(dx * unit), y + Math.round(dy * unit), Math.max(1, Math.round(w * unit)), Math.max(1, Math.round(h * unit)));
        };
        const base = kind === "log" ? colors.log : kind === "dirt" || kind === "grass" ? colors.dirt : colors.stone;
        const dark = kind === "log" ? colors.logDark : kind === "dirt" || kind === "grass" ? colors.dirtDark : colors.stoneDark;
        art.rect(base, x, y, size, size);
        if (kind === "log") {
            [1, 5, 9].forEach(function (dx) {
                dot(dark, dx, 0, 1, 12);
            });
            dot(colors.logTop, 0, 0, 12, 2);
            return;
        }
        [[1, 2], [6, 1], [9, 4], [3, 7], [7, 9], [10, 10], [2, 10]].forEach(function (d) {
            dot(dark, d[0], d[1], 2, 1);
        });
        if (kind === "stone" || kind === "ore") {
            dot(colors.stoneLight, 4, 3, 3, 1);
            dot(colors.stoneLight, 8, 7, 2, 1);
        }
        if (kind === "ore") {
            [[2, 4], [7, 2], [5, 8], [9, 9]].forEach(function (d) {
                dot(colors.ore, d[0], d[1], 2, 2);
            });
        }
        if (kind === "grass") {
            dot(colors.grass, 0, 0, 12, 3);
            dot(colors.grassLight, 1, 0, 3, 1);
            dot(colors.grass, 4, 3, 1, 1);
            dot(colors.grass, 9, 3, 1, 2);
        }
    }

    function drawWorld(art, t) {
        art.rect(colors.sky, 0, 0, 80, 40);
        art.rect(colors.skyLow, 0, 40, 80, 40);
        art.rect(colors.sun, 62, 14, 8, 8);
        const drift = (t * 2) % 100;
        [[0, 24, 14], [45, 32, 10]].forEach(function (cloud) {
            const x = Math.round(((cloud[0] - drift) % 100 + 100) % 100 - 10);
            art.rect(colors.cloud, x, cloud[1], cloud[2], 3);
            art.rect(colors.cloud, x + 3, cloud[1] - 2, cloud[2] - 6, 2);
        });
        for (let x = -4; x < 80; x += SIZE) {
            block(art, "grass", x, GROUND, SIZE);
            block(art, "dirt", x, GROUND + SIZE, SIZE);
        }
    }

    function drawCracks(art, damage) {
        const lines = [[5, 5, 1, 0], [6, 6, 1, 1], [3, 7, -1, 1], [8, 3, 1, -1], [2, 3, 0, -1], [9, 8, 1, 1], [5, 9, 0, 1], [7, 2, -1, -1]];
        const shown = Math.ceil(damage * lines.length);
        for (let i = 0; i < shown; i++) {
            const l = lines[i];
            for (let s = 0; s < 3; s++) {
                art.rect(colors.crack, BLOCK_X + l[0] + l[2] * s, BLOCK_Y + l[1] + l[3] * s, 1, 1);
            }
        }
    }

    // The pickaxe arm's angle in degrees (0 points forward, 90 straight down) through one half-second swing:
    // an eased wind-up behind the head, a fast strike that lands 0.4 s in, then a short hold with a small recoil.
    function swingAngle(f) {
        const impact = 35;
        const raised = -130;
        if (f < 0.6) {
            const u = f / 0.6;
            return impact + (raised - impact) * (1 - (1 - u) * (1 - u));
        }
        if (f < 0.8) {
            const u = (f - 0.6) / 0.2;
            return raised + (impact - raised) * u * u;
        }
        return impact - 6 * Math.sin((f - 0.8) / 0.2 * Math.PI);
    }

    // The miner, side-on and facing right. The front arm swings the pickaxe from the shoulder on every beat while
    // mining, the body leaning into each strike and the back arm swinging against it; at rest the pickaxe hangs.
    function drawMiner(art, p, mining) {
        const f = (p % 0.5) / 0.5;
        const angle = mining ? swingAngle(f) : 75;
        const lean = mining && f >= 0.65 ? 1 : 0;
        const x = 20 + lean;
        // Back arm, swinging opposite the pickaxe.
        const back = (95 - (angle - 35) * 0.15) * Math.PI / 180;
        brush(art, colors.shirtDark, x - 4, 57, x - 4 + Math.cos(back) * 8, 57 + Math.sin(back) * 8, 3);
        art.rect(colors.skinDark, Math.round(x - 4 + Math.cos(back) * 8) - 1, Math.round(57 + Math.sin(back) * 8) - 1, 3, 2);
        // Legs stay planted; the body above them leans.
        art.rect(colors.overalls, 16, 66, 4, 8);
        art.rect(colors.overallsDark, 21, 66, 4, 8);
        art.rect(colors.boot, 16, 74, 4, 2);
        art.rect(colors.boot, 21, 74, 5, 2);
        art.rect(colors.shirt, x - 5, 55, 10, 11);
        for (let i = 0; i < 3; i++) {
            art.rect(colors.shirtDark, x - 5, 57 + i * 3, 10, 1);
            art.rect(colors.shirtDark, x - 3 + i * 3, 55, 1, 11);
        }
        art.rect(colors.overalls, x - 2, 59, 6, 7);
        art.rect(colors.overallsDark, x - 4, 55, 1, 5);
        art.rect(colors.overallsDark, x + 3, 55, 1, 5);
        // Head with a hard hat and lamp, dipping into the strike.
        const nod = lean;
        art.rect(colors.skin, x - 4, 47 + nod, 8, 8);
        art.rect(colors.skinDark, x - 4, 53 + nod, 8, 2);
        art.rect(colors.eye, x + 2, 49 + nod, 1, 2);
        art.rect(colors.skinDark, x + 3, 52 + nod, 1, 1);
        art.rect(colors.hat, x - 5, 44 + nod, 10, 4);
        art.rect(colors.hatDark, x - 5, 47 + nod, 12, 1);
        art.rect(colors.lamp, x + 3, 45 + nod, 2, 2);
        // Front arm and pickaxe: the handle continues the arm, the head crosses its end.
        const radians = angle * Math.PI / 180;
        const dx = Math.cos(radians);
        const dy = Math.sin(radians);
        const sx = x + 1;
        const sy = 57;
        const hx = sx + dx * 8;
        const hy = sy + dy * 8;
        brush(art, colors.shirt, sx, sy, hx, hy, 3);
        art.rect(colors.skin, Math.round(hx) - 1, Math.round(hy) - 1, 3, 3);
        const tx = hx + dx * 9;
        const ty = hy + dy * 9;
        brush(art, colors.handle, hx + dx, hy + dy, tx, ty, 2);
        brush(art, colors.head, tx + dy * 5, ty - dx * 5, tx - dy * 5, ty + dx * 5, 2);
        brush(art, colors.headDark, tx + dy * 5 + dx, ty - dx * 5 + dy, tx - dy * 5 + dx, ty + dx * 5 + dy, 1);
        // The shoulder joint, drawn last so the arm always meets the body.
        art.rect(colors.shirt, sx - 1, sy - 1, 3, 3);
    }

    function drawHotbar(art, counts) {
        KINDS.forEach(function (kind, i) {
            const x = 2 + i * 13;
            art.rect(colors.slotDark, x, 2, 13, 12);
            art.rect(colors.slot, x + 1, 3, 11, 10);
            art.rect(colors.slotLight, x + 1, 3, 11, 1);
            if (counts[i]) {
                block(art, kind, x + 2, 4, 6);
                art.text(String(Math.min(64, counts[i])), x + 8, 8, colors.count);
            }
        });
    }

    function draw(art, t) {
        const loops = Math.floor(t / LOOP);
        const p = t % LOOP;
        const index = Math.floor(p / 2);
        const within = p % 2;
        const kind = KINDS[index];
        const mining = within < MINE;
        const counts = KINDS.map(function (k, i) {
            return loops + (index > i || (index === i && within >= MINE + 0.4) ? 1 : 0);
        });
        drawWorld(art, t);
        if (mining) {
            block(art, kind, BLOCK_X, BLOCK_Y, SIZE);
            drawCracks(art, within / MINE);
        } else {
            const since = within - MINE;
            // The block pops into chips; a little copy bobs where it was, then flies up to its hotbar slot.
            for (let s = 0; s < 8; s++) {
                const a = -Math.PI * s / 7;
                art.rect(kind === "log" ? colors.logDark : kind === "dirt" ? colors.dirtDark : colors.stoneDark, Math.round(BLOCK_X + 6 + Math.cos(a) * since * 40), Math.round(BLOCK_Y + 6 + Math.sin(a) * since * 40 + since * since * 80), 1, 1);
            }
            const fly = Math.max(0, since - 0.15) / 0.25;
            const bx = BLOCK_X + 4 + (2 + index * 13 + 2 - BLOCK_X - 4) * fly;
            const by = BLOCK_Y + 6 - Math.sin(since * 20) - (BLOCK_Y + 6 - 4) * fly;
            if (fly < 1) {
                block(art, kind, Math.round(bx), Math.round(by), 4);
            }
        }
        drawMiner(art, p, mining);
        drawHotbar(art, counts);
    }

    window.siteRuntime.spriteMode({
        mode: "minecraft",
        sprite: ".minecraft-sprite",
        draw,
        still: 1.3,
        fps: 20
    });
})();