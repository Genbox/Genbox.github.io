(function () {
    "use strict";
    // An online role-playing adventure in one 16-second loop: a knight with a quest marker accepts the quest,
    // fights a slime (a sword blow on every second beat), fills the experience bar and levels up in a pillar of light.
    // The level climbs by one each loop.
    const colors = {
        steel: "#9aa5b1",
        steelLight: "#d5dbe4",
        steelDark: "#5d6673",
        boot: "#3b2a1c",
        cape: "#8b1e2b",
        tabard: "#2f5fb3",
        tabardDark: "#234a8c",
        gold: "#e0b74a",
        goldLight: "#fff1a0",
        goldDark: "#5a3d00",
        belt: "#5b3a22",
        plume: "#c8323c",
        visor: "#10141c",
        blade: "#e6ecf2",
        bladeEdge: "#9aa5b1",
        slime: "#58c44a",
        slimeDark: "#3c9a33",
        slimeLight: "#b4f2a6",
        slimeEye: "#10141c",
        grass: "#3f7a3a",
        dirt: "#3b2f24",
        damage: "#ffd84a",
        xp: "#8f5bd6",
        xpLight: "#b98cf0",
        xpFrame: "#1b1530",
        xpText: "#c58cff",
        plate: "#7cfc7c",
        light: "#ffe58a",
        lightCore: "#fff6c8",
        ink: "#10141c"
    };
    const LOOP = 16;
    const GROUND = 86;
    const HERO = 26;
    const SLIME = 57;
    // Blows land on the beat at 6, 7, 8, 9 and 10 seconds; the fifth finishes the slime.
    const SWING_START = 5.4;
    const HITS = [12, 9, 14, 11, 23];
    const LEVEL_UP = 11;
    const MAX_LEVEL = 60;

    // A straight stroke of size×size pixel dabs.
    function brush(art, color, x0, y0, x1, y1, size) {
        const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        const offset = Math.floor(size / 2);
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + (x1 - x0) * i / steps) - offset, Math.round(y0 + (y1 - y0) * i / steps) - offset, size, size);
        }
    }

    // The sword's angle in degrees (0 points forward, 90 straight down) and how many blows have landed.
    function swordAt(p) {
        if (p < SWING_START || p >= SWING_START + HITS.length) {
            // At rest the sword hangs point-down at his side. It comes up to guard as the slime lands and goes down
            // again after the fight.
            const done = p >= SWING_START + HITS.length;
            const guard = done ? 1 - Math.min(1, (p - SWING_START - HITS.length) / 0.5) : Math.max(0, Math.min(1, (p - SWING_START + 0.5) / 0.5));
            return { angle: 90 - 70 * guard, hits: done ? HITS.length : 0, since: -1 };
        }
        const swing = (p - SWING_START) % 1;
        const count = Math.floor(p - SWING_START);
        let angle;
        if (swing < 0.45) {
            angle = 20 - 130 * swing / 0.45;
        } else if (swing < 0.6) {
            angle = -110 + 130 * (swing - 0.45) / 0.15;
        } else {
            angle = 20;
        }
        return { angle, hits: count + (swing >= 0.6 ? 1 : 0), since: swing >= 0.6 ? swing - 0.6 : -1 };
    }

    function drawGround(art) {
        art.rect(colors.dirt, 0, GROUND, 80, 6);
        art.rect(colors.grass, 0, GROUND, 80, 1);
        [5, 14, 40, 47, 70, 77].forEach(function (x) {
            art.rect(colors.grass, x, GROUND - 1, 1, 1);
            art.rect(colors.grass, x + 1, GROUND - 2, 1, 2);
        });
    }

    function drawXpBar(art, fill, flash) {
        art.rect(colors.xpFrame, 3, 92, 74, 4);
        art.rect(flash ? colors.goldLight : colors.xp, 4, 93, Math.round(72 * fill), 2);
        art.rect(flash ? colors.lightCore : colors.xpLight, 4, 93, Math.round(72 * fill), 1);
        for (let x = 12; x < 76; x += 9) {
            art.rect(colors.xpFrame, x, 93, 1, 2);
        }
    }

    function drawHero(art) {
        const x = HERO;
        function part(color, dx, dy, w, h) {
            art.rect(color, x + dx, GROUND + dy, w, h);
        }
        part(colors.cape, -8, -22, 3, 16);
        part(colors.steelDark, -4, -10, 3, 9);
        part(colors.steelDark, 1, -10, 3, 9);
        part(colors.boot, -5, -1, 4, 1);
        part(colors.boot, 1, -1, 4, 1);
        part(colors.steel, -6, -22, 12, 13);
        part(colors.tabard, -3, -21, 7, 15);
        part(colors.tabardDark, 2, -21, 2, 15);
        part(colors.gold, 0, -18, 1, 1);
        part(colors.gold, -1, -17, 3, 1);
        part(colors.gold, 0, -16, 1, 1);
        part(colors.belt, -6, -11, 12, 2);
        part(colors.gold, 0, -11, 2, 2);
        // Oversized pauldrons, as every hero of the genre wears.
        // The sword arm's pauldron is drawn with that arm, over its shoulder.
        art.ellipse(colors.steelDark, x - 6, GROUND - 21, 5, 3);
        art.ellipse(colors.steelLight, x - 6, GROUND - 22, 4, 2);
        part(colors.gold, -9, -25, 1, 2);
        // A great helm with a visor slit and a red plume.
        part(colors.steel, -4, -31, 8, 8);
        part(colors.steelLight, -3, -31, 5, 1);
        part(colors.visor, -1, -27, 5, 1);
        part(colors.steelDark, 1, -28, 1, 4);
        part(colors.plume, -2, -34, 3, 3);
        part(colors.plume, -4, -33, 2, 2);
        // A kite shield on the near arm.
        part(colors.gold, -13, -19, 6, 10);
        part(colors.tabard, -12, -18, 4, 7);
        part(colors.gold, -11, -15, 2, 2);
        part(colors.gold, -11, -9, 2, 1);
    }

    // The sword arm swings from the shoulder, following the sword at a little less than its angle, so the hand
    // rises overhead for the wind-up and reaches forward for the blow.
    function drawSwordArm(art, angle) {
        const sx = HERO + 6;
        const sy = GROUND - 20;
        const arm = (90 + (angle - 90) * 0.85) * Math.PI / 180;
        const hx = sx + Math.cos(arm) * 7;
        const hy = sy + Math.sin(arm) * 7;
        const radians = angle * Math.PI / 180;
        const dx = Math.cos(radians);
        const dy = Math.sin(radians);
        brush(art, colors.steel, sx, sy, hx, hy, 3);
        brush(art, colors.blade, hx + dx * 3, hy + dy * 3, hx + dx * 13, hy + dy * 13, 2);
        brush(art, colors.bladeEdge, hx + dx * 3 - dy, hy + dy * 3 + dx, hx + dx * 12 - dy, hy + dy * 12 + dx, 1);
        brush(art, colors.gold, hx + dx - dy * 2, hy + dy + dx * 2, hx + dx + dy * 2, hy + dy - dx * 2, 1);
        brush(art, colors.steelDark, hx, hy, hx, hy, 2);
        art.rect(colors.gold, Math.round(hx - dx * 2), Math.round(hy - dy * 2), 1, 1);
        art.ellipse(colors.steelDark, sx, GROUND - 21, 5, 3);
        art.ellipse(colors.steelLight, sx, GROUND - 22, 4, 2);
        art.rect(colors.gold, HERO + 9, GROUND - 25, 1, 2);
    }

    function drawSlime(art, p, t, sword) {
        if (p < 4.5 || p >= SWING_START + HITS.length + 0.6) {
            return;
        }
        // It drops in, wobbles, shrinks with every blow and bursts on the last one.
        if (sword.hits >= HITS.length) {
            const burst = (p - SWING_START - HITS.length) / 0.6;
            art.alpha(1 - burst);
            for (let i = 0; i < 10; i++) {
                const angle = i / 10 * Math.PI * 2;
                const reach = 3 + burst * 14;
                art.rect(i % 2 ? colors.slime : colors.slimeLight, Math.round(SLIME + Math.cos(angle) * reach), Math.round(GROUND - 6 + Math.sin(angle) * reach * 0.7), 2, 2);
            }
            art.alpha(1);
            return;
        }
        const drop = p < 5 ? Math.pow(1 - (p - 4.5) / 0.5, 2) * 50 : 0;
        const size = 1 - sword.hits * 0.1;
        const knock = sword.since >= 0 && sword.since < 0.15 ? 2 : 0;
        const squash = Math.sin(t * Math.PI * 4) * 0.08;
        const rx = 9 * size * (1 + squash);
        const ry = 7 * size * (1 - squash);
        const cx = SLIME + knock;
        const cy = GROUND - ry - drop;
        const flash = sword.since >= 0 && sword.since < 0.1;
        art.ellipse(flash ? "#ffffff" : colors.slimeDark, cx, cy + 1, rx, ry);
        art.ellipse(flash ? "#ffffff" : colors.slime, cx, cy, rx - 1, ry - 1);
        art.rect(colors.slimeLight, Math.round(cx - rx / 2), Math.round(cy - ry / 2), 2, 1);
        art.rect(colors.slimeEye, Math.round(cx - 3 * size), Math.round(cy - 1), 1, 2);
        art.rect(colors.slimeEye, Math.round(cx - 6 * size), Math.round(cy - 1), 1, 2);
    }

    function drawDamage(art, p) {
        HITS.forEach(function (amount, i) {
            const at = SWING_START + i + 0.6;
            if (p >= at && p < at + 0.9) {
                const rise = (p - at) / 0.9;
                art.alpha(1 - rise * 0.7);
                art.text("-" + amount, SLIME - 4 + (i % 2) * 4, Math.round(70 - rise * 12), colors.damage);
                art.alpha(1);
            }
        });
        const kill = SWING_START + HITS.length;
        if (p >= kill && p < kill + 1) {
            const rise = p - kill;
            art.alpha(1 - rise * 0.6);
            art.text("+120 XP", 46, Math.round(52 - rise * 8), colors.xpText);
            art.alpha(1);
        }
    }

    // The quest giver's golden exclamation mark, bobbing over the hero's head.
    function drawMarker(art, p, t) {
        const fade = p < 4 ? 1 : p >= 15 ? p - 15 : 0;
        if (!fade) {
            return;
        }
        const y = 31 + Math.round(Math.sin(t * 3) * 1.5);
        const x = HERO;
        art.alpha(fade);
        art.rect(colors.goldDark, x - 2, y - 1, 5, 9);
        art.rect(colors.goldDark, x - 2, y + 9, 5, 5);
        art.rect(colors.gold, x - 1, y, 3, 7);
        art.rect(colors.gold, x - 1, y + 10, 3, 3);
        art.rect(colors.goldLight, x - 1, y, 1, 4);
        art.alpha(1);
    }

    function drawLevelUp(art, p, t) {
        if (p < LEVEL_UP || p >= LEVEL_UP + 3) {
            return;
        }
        const glow = Math.min(1, (p - LEVEL_UP) * 4) * Math.min(1, (LEVEL_UP + 3 - p) * 2);
        for (let y = 0; y < GROUND; y += 2) {
            const strength = glow * (0.15 + 0.35 * y / GROUND);
            art.alpha(strength);
            art.rect(colors.light, HERO - 11, y, 22, 2);
            art.alpha(strength * 1.6);
            art.rect(colors.lightCore, HERO - 4, y, 8, 2);
        }
        art.alpha(glow);
        for (let i = 0; i < 12; i++) {
            const sx = HERO + (i * 7) % 21 - 10;
            const sy = Math.round(GROUND - ((p - LEVEL_UP) * 30 + i * 9) % 70);
            const twinkle = Math.floor(t * 10 + i) % 2;
            art.rect(colors.goldLight, sx, sy, 1, 1);
            if (twinkle) {
                art.rect(colors.gold, sx - 1, sy, 3, 1);
                art.rect(colors.gold, sx, sy - 1, 1, 3);
            }
        }
        art.alpha(1);
    }

    function banner(art, label, color, y) {
        const width = art.width(label);
        const left = Math.round(40 - width / 2);
        art.alpha(0.75);
        art.rect(colors.ink, left - 3, y - 2, width + 6, 9);
        art.alpha(1);
        art.text(label, left, y, color);
    }

    function draw(art, t) {
        const loops = Math.floor(t / LOOP);
        const p = t % LOOP;
        const sword = swordAt(p);
        const reached = 1 + loops + (p >= LEVEL_UP ? 1 : 0);
        const level = Math.min(MAX_LEVEL, reached);
        const fill = p < SWING_START ? 0.55 : p < LEVEL_UP ? 0.55 + 0.09 * sword.hits : p < LEVEL_UP + 0.5 ? 1 : 0.05;

        drawLevelUp(art, p, t);
        drawGround(art);
        drawSlime(art, p, t, sword);
        drawHero(art);
        drawSwordArm(art, sword.angle);
        drawDamage(art, p);
        drawMarker(art, p, t);
        const plate = "LV " + level;
        art.text(plate, Math.round(HERO - art.width(plate) / 2), 48, p >= LEVEL_UP && p < LEVEL_UP + 3 && Math.floor(t * 6) % 2 ? colors.goldLight : colors.plate);
        if (p >= 4 && p < 5.6) {
            banner(art, "QUEST ACCEPTED", colors.damage, 14);
        }
        if (p >= LEVEL_UP && p < LEVEL_UP + 3) {
            banner(art, reached > MAX_LEVEL ? "MAX LEVEL" : "LEVEL UP!", colors.goldLight, 14);
        }
        drawXpBar(art, reached > MAX_LEVEL ? 1 : fill, p >= LEVEL_UP && p < LEVEL_UP + 0.5);
    }

    window.siteRuntime.spriteMode({
        mode: "wow",
        sprite: ".wow-sprite",
        draw,
        still: 12,
        fps: 20
    });
})();