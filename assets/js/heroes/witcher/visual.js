(function () {
    "use strict";
    // A dark-fantasy monster hunt under a full moon: a hooded hunter sits on a log by his campfire while a hunched
    // swamp creature creeps closer through the fog. He rises and throws a glowing sign from his open hand, and
    // the creature flees. Fireflies drift over the water. 8-second rounds.
    const colors = {
        skyTop: "#0b1418",
        skyLow: "#1d2e2c",
        moon: "#e8ecd8",
        moonShade: "#c4c9b0",
        tree: "#0a100f",
        ground: "#1a2420",
        mud: "#26322b",
        water: "#22403c",
        waterLight: "#3a5e58",
        reed: "#2e4a32",
        fog: "#9ab0a8",
        firefly: "#d8ff8a",
        cloak: "#3a2e26",
        cloakDark: "#251c17",
        cloakLight: "#52423a",
        leather: "#5a4030",
        leatherDark: "#3a291e",
        strap: "#1e1510",
        buckle: "#c9a85a",
        shadow: "#060404",
        chin: "#8a6a55",
        hilt: "#2a1d14",
        guard: "#9aa5b1",
        pommel: "#c9ced5",
        boot: "#1b1410",
        trousers: "#2e2620",
        log: "#4a321c",
        logLight: "#6b4a2b",
        fire: "#ff8a2a",
        fireHot: "#ffe08a",
        ember: "#ffb347",
        beast: "#0e1a14",
        beastEdge: "#1e3426",
        eye: "#7cff5a",
        rune: "#ffb347",
        runeCore: "#fff1c0"
    };
    const LOOP = 8;
    const RISE = 4;
    const CAST = 5;
    const HUNTER = 20;
    const GROUND = 86;

    function brush(art, color, x0, y0, x1, y1, size) {
        const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        const offset = Math.floor(size / 2);
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + (x1 - x0) * i / steps) - offset, Math.round(y0 + (y1 - y0) * i / steps) - offset, size, size);
        }
    }

    function drawNight(art, t) {
        art.rect(colors.skyTop, 0, 0, 80, 40);
        art.rect(colors.skyLow, 0, 40, 80, 40);
        art.ellipse(colors.moon, 62, 18, 9, 9);
        art.ellipse(colors.moonShade, 59, 15, 2, 2);
        art.ellipse(colors.moonShade, 65, 21, 3, 2);
        [[8, 30], [74, 38]].forEach(function (tree) {
            art.rect(colors.tree, tree[0], tree[1], 2, 82 - tree[1]);
            art.rect(colors.tree, tree[0] - 4, tree[1] + 8, 5, 1);
            art.rect(colors.tree, tree[0] - 5, tree[1] + 5, 1, 4);
            art.rect(colors.tree, tree[0] + 2, tree[1] + 14, 5, 1);
            art.rect(colors.tree, tree[0] + 6, tree[1] + 11, 1, 4);
        });
        art.rect(colors.ground, 0, 82, 80, 14);
        art.rect(colors.mud, 0, 82, 80, 1);
        // A still pool with the moon's broken reflection, and reeds.
        art.rect(colors.water, 46, 86, 34, 6);
        for (let i = 0; i < 3; i++) {
            const wobble = Math.round(Math.sin(t * 2 + i) * 1);
            art.rect(colors.waterLight, 58 + wobble - i, 87 + i * 2, 7 + i * 2, 1);
        }
        [44, 47, 77].forEach(function (x, i) {
            const sway = Math.round(Math.sin(t * 1.5 + i) * 0.6);
            art.rect(colors.reed, x + sway, 78, 1, 8);
            art.rect(colors.reed, x + 1, 80, 1, 6);
        });
    }

    function drawFire(art, t) {
        art.alpha(0.18);
        art.ellipse(colors.fire, 36, 80, 16, 9);
        art.alpha(1);
        art.rect(colors.log, 30, 83, 12, 2);
        art.rect(colors.logLight, 33, 82, 6, 1);
        const h = 7 + Math.round(Math.sin(t * 13) + Math.sin(t * 21));
        art.ellipse(colors.fire, 36, 82 - h / 2, 3, h / 2 + 1);
        art.ellipse(colors.fireHot, 36, 82 - h / 3, 1, h / 4);
        for (let i = 0; i < 3; i++) {
            const age = (t * 0.9 + i * 0.33) % 1;
            art.alpha(1 - age);
            art.rect(colors.ember, 35 + Math.round(Math.sin(t * 3 + i * 2) * 2), Math.round(76 - age * 16), 1, 1);
        }
        art.alpha(1);
    }

    // The swamp creature: a hunched shape with long arms and green eyes, creeping in from the right, then fleeing.
    function drawBeast(art, p, t) {
        const approach = Math.min(1, p / CAST);
        const flee = p >= CAST + 0.5 ? (p - CAST - 0.5) / 1.2 : 0;
        if (flee >= 1) {
            return;
        }
        const x = Math.round(84 - approach * 20 + flee * 30);
        const sway = Math.round(Math.sin(t * 3) * 1);
        art.alpha(0.85 * (1 - flee) * Math.min(1, p / 1.5));
        art.ellipse(colors.beast, x, 72 + sway, 6, 8);
        art.ellipse(colors.beast, x - 3, 64 + sway, 4, 4);
        brush(art, colors.beast, x - 4, 68 + sway, x - 9, 80, 2);
        brush(art, colors.beast, x + 3, 68 + sway, x + 1, 81, 2);
        art.rect(colors.beastEdge, x - 6, 66 + sway, 2, 1);
        if (t % 2.7 >= 0.12) {
            art.rect(colors.eye, x - 6, 63 + sway, 1, 1);
            art.rect(colors.eye, x - 3, 63 + sway, 1, 1);
        }
        art.alpha(1);
    }

    // The hunter, facing right: seated on a log, rising, then standing with his hand thrown forward to cast.
    function drawHunter(art, p, t) {
        const x = HUNTER;
        const rise = p < RISE ? 0 : Math.min(1, (p - RISE) / 0.8);
        const drop = Math.round((1 - rise) * 8);
        const top = GROUND - 32 + drop;
        // The log he sits on.
        art.rect(colors.log, x - 9, GROUND - 6, 16, 4);
        art.rect(colors.logLight, x - 9, GROUND - 6, 16, 1);
        art.rect(colors.logLight, x + 6, GROUND - 6, 1, 4);
        // Legs: knees bent forward while seated, straight when standing.
        if (rise < 1) {
            brush(art, colors.trousers, x - 1, top + 22, x + 6, top + 22, 3);
            brush(art, colors.trousers, x + 6, top + 22, x + 7, GROUND - 2, 3);
            art.rect(colors.boot, x + 5, GROUND - 3, 5, 3);
        } else {
            art.rect(colors.trousers, x - 3, top + 22, 3, 8);
            art.rect(colors.trousers, x + 1, top + 22, 3, 8);
            art.rect(colors.boot, x - 4, GROUND - 2, 4, 2);
            art.rect(colors.boot, x + 1, GROUND - 2, 5, 2);
        }
        // The cloak falls behind him in layers.
        art.rect(colors.cloakDark, x - 8, top + 7, 6, 20 - Math.round(drop / 2));
        art.rect(colors.cloak, x - 7, top + 7, 4, 18 - Math.round(drop / 2));
        art.rect(colors.cloakLight, x - 7, top + 7, 1, 14);
        // Two sword hilts crossing behind the shoulders.
        brush(art, colors.hilt, x - 6, top + 1, x - 2, top + 8, 1);
        art.rect(colors.pommel, x - 7, top, 1, 1);
        art.rect(colors.guard, x - 4, top + 4, 3, 1);
        brush(art, colors.hilt, x + 5, top + 1, x + 1, top + 8, 1);
        art.rect(colors.pommel, x + 6, top, 1, 1);
        art.rect(colors.guard, x + 1, top + 4, 3, 1);
        // Leather armour with a cross strap, a belt and a buckle.
        art.rect(colors.leather, x - 4, top + 8, 9, 14);
        art.rect(colors.leatherDark, x + 3, top + 8, 2, 14);
        brush(art, colors.strap, x - 4, top + 9, x + 4, top + 18, 1);
        art.rect(colors.strap, x - 4, top + 19, 9, 2);
        art.rect(colors.buckle, x, top + 19, 2, 2);
        // A deep hood: only a hint of chin shows below the shadow.
        art.ellipse(colors.cloak, x, top + 4, 5, 5);
        art.rect(colors.cloak, x - 5, top + 4, 3, 5);
        art.rect(colors.cloakLight, x - 3, top, 4, 1);
        art.ellipse(colors.shadow, x + 2, top + 5, 3, 3);
        art.rect(colors.chin, x + 3, top + 8, 2, 1);
        if (p < CAST) {
            // Arms resting on the knees, or swinging free as he stands.
            brush(art, colors.leatherDark, x + 2, top + 10, x + 7, top + 17, 2);
            art.rect(colors.chin, x + 7, top + 17, 2, 2);
            return;
        }
        // Both swords stay sheathed: he throws his hand out toward the creature, fingers spread, and the sign
        // glows in his palm as it leaves.
        const glow = Math.max(0, 1 - (p - CAST) / 0.6);
        brush(art, colors.leatherDark, x + 2, top + 10, x + 10, top + 9, 2);
        art.rect(colors.chin, x + 10, top + 8, 2, 3);
        art.rect(colors.chin, x + 12, top + 7, 1, 1);
        art.rect(colors.chin, x + 12, top + 9, 1, 1);
        art.rect(colors.chin, x + 12, top + 11, 1, 1);
        if (glow > 0) {
            art.alpha(glow * (0.5 + 0.3 * Math.sin(t * 30)));
            art.ellipse(colors.rune, x + 12, top + 9, 3, 3);
            art.alpha(1);
        }
    }

    // A glowing rune cast from the off hand toward the creature.
    function drawRune(art, p) {
        if (p < CAST || p >= CAST + 1.2) {
            return;
        }
        const f = (p - CAST) / 1.2;
        const cx = 36 + f * 22;
        const cy = 62;
        const r = 3 + f * 5;
        art.alpha(1 - f * 0.8);
        for (let a = 0; a < Math.PI * 2; a += 0.15) {
            art.rect(colors.rune, Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
        }
        // Four spokes turning inside the ring, around a small inner ring.
        for (let k = 0; k < 4; k++) {
            const a = f * 3 + k * Math.PI / 2;
            brush(art, colors.runeCore, cx + Math.cos(a) * r * 0.35, cy + Math.sin(a) * r * 0.35, cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85, 1);
        }
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
            art.rect(colors.runeCore, Math.round(cx + Math.cos(a) * r * 0.3), Math.round(cy + Math.sin(a) * r * 0.3), 1, 1);
        }
        art.alpha(1);
    }

    function drawFog(art, t) {
        for (let i = 0; i < 3; i++) {
            const x = Math.round(((t * (3 + i) + i * 30) % 120) - 40);
            art.alpha(0.07 + i * 0.03);
            art.ellipse(colors.fog, x, 76 + i * 4, 26, 3);
            art.ellipse(colors.fog, x + 60, 78 + i * 3, 20, 2);
        }
        art.alpha(1);
    }

    function drawFireflies(art, t) {
        for (let i = 0; i < 6; i++) {
            const x = 44 + ((i * 13 + Math.sin(t * 0.7 + i) * 8) % 34);
            const y = 58 + Math.sin(t * 1.1 + i * 2) * 8 + i * 3;
            art.alpha(0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + i * 1.7)));
            art.rect(colors.firefly, Math.round(x), Math.round(y), 1, 1);
        }
        art.alpha(1);
    }

    function draw(art, t) {
        const p = t % LOOP;
        drawNight(art, t);
        drawFireflies(art, t);
        drawBeast(art, p, t);
        drawFire(art, t);
        drawHunter(art, p, t);
        drawRune(art, p);
        drawFog(art, t);
    }

    window.siteRuntime.spriteMode({
        mode: "witcher",
        sprite: ".witcher-sprite",
        draw,
        still: 5.4,
        fps: 20
    });
})();