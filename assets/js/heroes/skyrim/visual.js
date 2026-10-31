(function () {
    "use strict";
    // A northern fantasy dusk: the aurora ripples over snowy peaks, a dragon beats across the sky, and a warrior
    // in a horned helm and fur cloak looses a wordless shout whose shockwave scatters the snow. 8-second rounds.
    const colors = {
        skyTop: "#0e1a2b",
        skyLow: "#2b4766",
        aurora: "#5cf2a6",
        auroraBlue: "#5ac8ff",
        peakFar: "#5a6f8a",
        peakNear: "#8aa0b8",
        snow: "#eef4fa",
        snowShade: "#c4d2e0",
        dragon: "#151820",
        dragonWing: "#232836",
        fur: "#6b4a2b",
        furLight: "#8a6a42",
        iron: "#7d8590",
        ironDark: "#4a5058",
        horn: "#e8dcc0",
        skin: "#d9a07a",
        beard: "#a0522d",
        boot: "#3a2a1a",
        wave: "#dff4ff"
    };
    const LOOP = 8;
    const SHOUT = 5;

    function drawSky(art, t) {
        art.rect(colors.skyTop, 0, 0, 80, 30);
        art.rect(colors.skyLow, 0, 30, 80, 40);
        // The aurora: two wavering ribbons.
        for (let x = 0; x < 80; x += 2) {
            const y1 = 10 + Math.sin(x * 0.12 + t * 0.8) * 4;
            const y2 = 16 + Math.sin(x * 0.09 - t * 0.6) * 5;
            art.alpha(0.25 + 0.15 * Math.sin(x * 0.2 + t));
            art.rect(colors.aurora, x, Math.round(y1), 2, 6);
            art.alpha(0.18);
            art.rect(colors.auroraBlue, x, Math.round(y2), 2, 5);
        }
        art.alpha(1);
    }

    function drawPeaks(art) {
        [[10, 34, 22], [42, 28, 26], [72, 36, 20]].forEach(function (peak) {
            for (let y = peak[1]; y < 70; y++) {
                const half = Math.round((y - peak[1]) * peak[2] / 36);
                art.rect(colors.peakFar, peak[0] - half, y, half * 2 + 1, 1);
                if (y < peak[1] + 7) {
                    art.rect(colors.snow, peak[0] - half, y, half * 2 + 1, 1);
                }
            }
        });
        [[26, 50, 20], [62, 54, 18]].forEach(function (peak) {
            for (let y = peak[1]; y < 82; y++) {
                const half = Math.round((y - peak[1]) * peak[2] / 30);
                art.rect(colors.peakNear, peak[0] - half, y, half * 2 + 1, 1);
                if (y < peak[1] + 5) {
                    art.rect(colors.snow, peak[0] - half, y, half * 2 + 1, 1);
                }
            }
        });
        art.rect(colors.snow, 0, 82, 80, 14);
        art.rect(colors.snowShade, 0, 82, 80, 1);
    }

    // A dragon silhouette crossing the sky, wings beating.
    function drawDragon(art, p, t) {
        if (p >= SHOUT + 0.6) {
            return;
        }
        const x = Math.round(-20 + p / (SHOUT + 0.6) * 110);
        // Low enough to cross the pale peaks, where the dark silhouette stands out.
        const y = 40 + Math.round(Math.sin(p * 2) * 3);
        const flap = Math.sin(t * 6);
        art.ellipse(colors.dragon, x, y, 8, 2);
        art.rect(colors.dragon, x + 7, y - 2, 5, 2);
        art.rect(colors.dragon, x + 11, y - 3, 3, 2);
        for (let i = 0; i < 9; i++) {
            art.rect(colors.dragon, x - 8 - i, y + Math.round(i * 0.3), 1, 1);
        }
        const tip = Math.round(flap * 8);
        for (let i = 0; i < 8; i++) {
            const h = Math.round(tip * (8 - i) / 8);
            art.rect(colors.dragonWing, x - 4 + i, y - Math.max(0, h) - 1, 1, Math.abs(h) + 1);
        }
    }

    function drawWarrior(art, p) {
        const x = 20;
        const g = 84;
        const shouting = p >= SHOUT && p < SHOUT + 1;
        const lean = shouting ? 1 : 0;
        art.rect(colors.boot, x - 5, g - 2, 4, 2);
        art.rect(colors.boot, x + 1, g - 2, 4, 2);
        art.rect(colors.fur, x - 5, g - 10, 4, 8);
        art.rect(colors.fur, x + 1, g - 10, 4, 8);
        // A fur cloak behind, iron and leather in front.
        art.rect(colors.fur, x - 8, g - 26, 6, 18);
        art.rect(colors.furLight, x - 8, g - 26, 6, 2);
        art.rect(colors.ironDark, x - 5 + lean, g - 24, 11, 14);
        art.rect(colors.iron, x - 4 + lean, g - 24, 9, 2);
        art.rect(colors.fur, x - 5 + lean, g - 12, 11, 2);
        // Head thrown forward for the shout, mouth open, beard and a horned helm.
        const hx = x + lean * 2;
        art.rect(colors.skin, hx - 3, g - 31, 7, 6);
        art.rect(colors.beard, hx - 3, g - 27, 7, 4);
        if (shouting) {
            art.rect(colors.dragon, hx + 1, g - 27, 3, 2);
        }
        art.rect(colors.iron, hx - 4, g - 34, 9, 4);
        art.rect(colors.ironDark, hx - 4, g - 31, 9, 1);
        art.rect(colors.horn, hx - 6, g - 35, 2, 3);
        art.rect(colors.horn, hx - 7, g - 38, 2, 3);
        art.rect(colors.horn, hx + 5, g - 35, 2, 3);
        art.rect(colors.horn, hx + 6, g - 38, 2, 3);
        art.rect(colors.ironDark, x + 5 + lean, g - 22, 3, 8);
    }

    function drawShout(art, p) {
        if (p < SHOUT || p >= SHOUT + 1.4) {
            return;
        }
        const f = (p - SHOUT) / 1.4;
        for (let ring = 0; ring < 3; ring++) {
            const r = 6 + f * 70 - ring * 8;
            if (r <= 2) {
                continue;
            }
            art.alpha((1 - f) * (0.8 - ring * 0.2));
            for (let a = -0.7; a <= 0.5; a += 0.04) {
                art.rect(colors.wave, Math.round(24 + Math.cos(a) * r), Math.round(56 + Math.sin(a) * r * 0.8), 1, 2);
            }
        }
        art.alpha(1);
    }

    function drawSnow(art, p, t) {
        const blast = p >= SHOUT && p < SHOUT + 1.4 ? (p - SHOUT) / 1.4 : 0;
        for (let i = 0; i < 26; i++) {
            const x = (i * 31 + t * (6 + i % 3) + blast * blast * 120) % 84 - 2;
            const y = (i * 17 + t * (8 + i % 4)) % 86;
            art.alpha(0.6 + (i % 3) * 0.15);
            art.rect(colors.snow, Math.round(x), Math.round(y), 1, 1);
        }
        art.alpha(1);
    }

    function draw(art, t) {
        const p = t % LOOP;
        drawSky(art, t);
        drawPeaks(art);
        drawDragon(art, p, t);
        drawWarrior(art, p);
        drawShout(art, p);
        drawSnow(art, p, t);
    }

    window.siteRuntime.spriteMode({
        mode: "skyrim",
        sprite: ".skyrim-sprite",
        draw,
        still: 5.3,
        fps: 20
    });
})();