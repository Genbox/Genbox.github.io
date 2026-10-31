(function () {
    "use strict";
    // An orc worker's day, in the spirit of the classic real-time strategy games: chop the tree, haul the log to
    // the hut, collect the lumber and go back for more. One trip is 8 seconds, four bars of the march.
    const colors = {
        skin: "#6f9a3c",
        skinShade: "#557a2c",
        skinLight: "#8bb44f",
        cloth: "#7a5230",
        clothShade: "#5c3c22",
        boot: "#3a2a1a",
        tusk: "#f3ecd8",
        brow: "#2b2016",
        eye: "#ffd84a",
        handle: "#8a6a3a",
        blade: "#c9ced5",
        bladeEdge: "#7d8590",
        bark: "#5a3c22",
        needles: "#2f5d34",
        needlesLight: "#3f7a43",
        needlesDark: "#244a29",
        wall: "#6b4a2b",
        plank: "#523720",
        roof: "#8b2f22",
        roofShade: "#6a2219",
        door: "#2a1a12",
        banner: "#b3261e",
        dirt: "#4a3a28",
        grass: "#4f7a32",
        ring: "#3fe04a",
        panel: "#1b1410",
        trim: "#b8862b",
        gold: "#f2c53d",
        goldLight: "#fff3b0",
        count: "#f2d27a",
        log: "#9a6a3a",
        logEnd: "#d9b27a",
        gain: "#9be36a",
        bubble: "#f6f3ea",
        ink: "#10141c"
    };
    const LOOP = 8;
    const GROUND = 86;
    // Where the worker stands to chop, and to drop the log at the hut.
    const TREE = 27;
    const HUT = 50;
    // One line a trip, shown as he starts chopping.
    const SAYINGS = [
        "ME CHOP. ME CARRY.",
        "WHY ALWAYS WOOD?",
        "HUT NEED MORE?",
        "TREE GOOD. BACK BAD.",
        "OKAY OKAY, GOING.",
        "BREAK? NEVER.",
        "SAME TREE AGAIN."
    ];

    // Where the worker is during a trip: chopping until 3 s, carrying to the hut, dropping, then walking back.
    function trip(p) {
        if (p < 3) {
            return { x: TREE, facing: -1, pose: (p % 0.5) < 0.25 ? "down" : "up", swing: (p % 0.5) / 0.25 };
        }
        if (p < 5) {
            return { x: TREE + (HUT - TREE) * (p - 3) / 2, facing: 1, pose: "carry", walking: true };
        }
        if (p < 5.6) {
            return { x: HUT, facing: 1, pose: "drop", drop: (p - 5) / 0.6 };
        }
        return { x: HUT - (HUT - TREE) * (p - 5.6) / 2.4, facing: -1, pose: "walk", walking: true };
    }

    function drawResources(art, lumber) {
        art.alpha(0.85);
        art.rect(colors.panel, 0, 0, 80, 10);
        art.alpha(1);
        art.rect(colors.trim, 0, 10, 80, 1);
        art.ellipse(colors.gold, 5, 5, 3, 3);
        art.rect(colors.goldLight, 4, 3, 1, 1);
        art.text("750", 10, 3, colors.count);
        art.rect(colors.log, 41, 4, 7, 3);
        art.rect(colors.logEnd, 47, 4, 1, 3);
        art.text(String(lumber), 51, 3, colors.count);
    }

    // A pine in three tiers, shaken by each blow of the axe.
    function drawTree(art, shake) {
        const x = 11 + shake;
        art.rect(colors.bark, 9, 68, 5, 18);
        [
            [32, 12, 6],
            [42, 14, 8],
            [53, 17, 11]
        ].forEach(function (tier) {
            for (let row = 0; row < tier[1]; row++) {
                const half = Math.max(1, Math.round(tier[2] * (row + 1) / tier[1]));
                art.rect(colors.needles, x - half, tier[0] + row, half * 2 + 1, 1);
                art.rect(colors.needlesLight, x - half, tier[0] + row, Math.ceil(half / 2), 1);
                art.rect(colors.needlesDark, x + half - Math.floor(half / 3), tier[0] + row, Math.floor(half / 3) + 1, 1);
            }
        });
    }

    // A plank hut with a spiked roof, tusks at the eaves and a banner flapping on the ridge pole.
    function drawHut(art, t) {
        art.rect(colors.wall, 58, 72, 20, 14);
        for (let y = 75; y < GROUND; y += 3) {
            art.rect(colors.plank, 58, y, 20, 1);
        }
        art.rect(colors.plank, 64, 76, 7, 1);
        art.rect(colors.door, 64, 77, 7, 9);
        for (let row = 0; row < 12; row++) {
            const half = row + 1;
            art.rect(colors.roof, 68 - half, 60 + row, half * 2, 1);
            art.rect(colors.roofShade, 68, 60 + row, half, 1);
        }
        [
            [66, 57, 1, 4],
            [65, 56, 1, 1],
            [70, 57, 1, 4],
            [71, 56, 1, 1],
            [53, 71, 4, 1],
            [52, 70, 1, 1],
            [79, 71, 1, 1]
        ].forEach(function (tusk) {
            art.rect(colors.tusk, tusk[0], tusk[1], tusk[2], tusk[3]);
        });
        art.rect(colors.plank, 68, 46, 1, 14);
        for (let column = 0; column < 7; column++) {
            const wave = Math.round(Math.sin(t * 6 - column * 0.9));
            art.rect(colors.banner, 69 + column, 47 + wave, 1, 5 - (column > 4 ? 1 : 0));
        }
    }

    function drawGround(art) {
        art.rect(colors.dirt, 0, GROUND, 80, 6);
        art.rect(colors.grass, 0, GROUND, 80, 1);
        [3, 17, 36, 44, 60, 74].forEach(function (x) {
            art.rect(colors.grass, x, GROUND - 1, 1, 1);
            art.rect(colors.grass, x + 2, GROUND - 2, 1, 2);
        });
    }

    // The selection circle under the unit.
    function drawRing(art, x) {
        for (let i = 0; i < 44; i++) {
            const angle = i / 44 * Math.PI * 2;
            art.rect(colors.ring, Math.round(x + Math.cos(angle) * 10), Math.round(GROUND + 1 + Math.sin(angle) * 2.5), 1, 1);
        }
    }

    function drawWorker(art, state, t) {
        const x = Math.round(state.x);
        const facing = state.facing;
        // Parts are drawn facing right and mirrored for facing left.
        function part(color, dx, dy, w, h) {
            art.rect(color, facing > 0 ? x + dx : x - dx - w, GROUND + dy, w, h);
        }
        const step = state.walking ? Math.floor(t * 8) % 2 : -1;
        const bob = step === 1 ? 1 : 0;

        part(colors.clothShade, -4, -7 - (step === 0 ? 1 : 0), 3, 6);
        part(colors.boot, -5, -1 - (step === 0 ? 1 : 0), 4, 1);
        part(colors.clothShade, 1, -7 - (step === 1 ? 1 : 0), 3, 6);
        part(colors.boot, 1, -1 - (step === 1 ? 1 : 0), 4, 1);

        // A hunched green torso and loincloth, the head jutting forward with a heavy jaw, tusks and pointed ears.
        part(colors.skin, -5, -15 + bob, 10, 8);
        part(colors.skinShade, -5, -15 + bob, 2, 8);
        part(colors.cloth, -5, -9 + bob, 10, 3);
        part(colors.clothShade, -1, -7 + bob, 3, 2);
        part(colors.skin, 1, -21 + bob, 8, 7);
        part(colors.skinLight, 2, -21 + bob, 5, 1);
        part(colors.skinShade, -1, -19 + bob, 3, 2);
        part(colors.skinShade, -2, -20 + bob, 1, 1);
        part(colors.brow, 5, -19 + bob, 4, 1);
        part(colors.eye, 7, -18 + bob, 1, 1);
        part(colors.skinShade, 3, -15 + bob, 6, 1);
        part(colors.tusk, 7, -16 + bob, 1, 2);
        part(colors.tusk, 4, -16 + bob, 1, 1);

        if (state.pose === "up") {
            part(colors.skin, 4, -18, 3, 3);
            part(colors.handle, 5, -29, 1, 12);
            part(colors.blade, 6, -30, 4, 4);
            part(colors.bladeEdge, 9, -30, 1, 4);
        } else if (state.pose === "down") {
            part(colors.skin, 5, -13, 4, 3);
            part(colors.handle, 8, -12, 8, 1);
            part(colors.blade, 13, -14, 3, 6);
            part(colors.bladeEdge, 13, -9, 3, 1);
        } else if (state.pose === "carry" || state.pose === "drop") {
            // The log rides on the shoulder, then falls to the pile beside the hut.
            const fall = state.pose === "drop" ? Math.round(Math.min(1, state.drop * 1.6) * 16) : 0;
            const alpha = state.pose === "drop" ? Math.max(0, 1 - Math.max(0, state.drop - 0.6) * 2.5) : 1;
            part(colors.handle, -4, -24 + bob, 1, 9);
            part(colors.blade, -6, -25 + bob, 3, 3);
            art.alpha(alpha);
            part(colors.log, -7, -20 + bob + fall, 16, 3);
            part(colors.logEnd, -7, -20 + bob + fall, 1, 3);
            part(colors.logEnd, 8, -20 + bob + fall, 1, 3);
            art.alpha(1);
            part(colors.skin, 3, -18 + bob + (fall ? 3 : 0), 3, 3);
        } else {
            part(colors.skin, 3, -14 + bob, 3, 4);
            part(colors.handle, 4, -24 + bob, 1, 11);
            part(colors.blade, 2, -25 + bob, 3, 3);
            part(colors.bladeEdge, 2, -25 + bob, 1, 3);
        }
    }

    // Wood chips burst from the trunk as the axe bites.
    function drawChips(art, swing) {
        if (swing > 0.6) {
            return;
        }
        const f = swing / 0.6;
        art.alpha(1 - f);
        for (let k = 0; k < 4; k++) {
            const x = Math.round(15 + k + f * (3 + k * 3));
            const y = Math.round(73 - k * 2 - f * (5 + k) + f * f * 10);
            art.rect(colors.logEnd, x, y, 1, 1);
        }
        art.alpha(1);
    }

    function drawBubble(art, label, x) {
        const width = art.width(label) + 6;
        const left = Math.max(1, Math.min(79 - width, x - 8));
        const tail = Math.max(left + 2, Math.min(left + width - 4, x + 2));
        art.rect(colors.ink, left - 1, 48, width + 2, 11);
        art.rect(colors.bubble, left, 49, width, 9);
        art.rect(colors.ink, tail, 59, 3, 2);
        art.rect(colors.bubble, tail + 1, 58, 1, 2);
        art.text(label, left + 3, 51, colors.ink);
    }

    function draw(art, t) {
        const trips = Math.floor(t / LOOP);
        const p = t % LOOP;
        const state = trip(p);
        const chopping = state.pose === "up" || state.pose === "down";
        const hit = state.pose === "down" ? state.swing : 1;
        drawResources(art, 100 + 10 * (trips + (p >= 5.1 ? 1 : 0)));
        drawTree(art, chopping && hit < 0.25 ? (Math.floor(t * 40) % 2 ? 1 : -1) : 0);
        drawHut(art, t);
        drawGround(art);
        drawRing(art, state.x);
        drawWorker(art, state, t);
        if (chopping) {
            drawChips(art, hit);
        }
        if (p >= 5.1 && p < 6.4) {
            const rise = (p - 5.1) / 1.3;
            art.alpha(1 - rise * 0.8);
            art.text("+10", HUT + 4, Math.round(62 - rise * 10), colors.gain);
            art.alpha(1);
        }
        if (p < 1.6) {
            drawBubble(art, SAYINGS[trips % SAYINGS.length], Math.round(state.x));
        }
    }

    window.siteRuntime.spriteMode({
        mode: "warcraft",
        sprite: ".warcraft-sprite",
        draw,
        still: 1.1,
        fps: 20
    });
})();