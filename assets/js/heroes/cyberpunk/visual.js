(function () {
    "use strict";
    // A neon megacity at night, seen from a wet rooftop: layers of towers under a smog glow, a holographic
    // jellyfish drifting between the towers and flying cars trailing light. A figure in a high-collared coat stands at the railing, cybernetic eye scanning and arm circuits
    // pulsing. Every 4 seconds the picture glitches with a colour split.
    const colors = {
        skyTop: "#0c0618",
        skyMid: "#1e0a32",
        smog: "#5a1a5a",
        farTower: "#1a1030",
        midTower: "#140c26",
        window: ["#2de2e6", "#ff3ec9", "#fcee0a", "#7a5cff"],
        pink: "#ff3ec9",
        cyan: "#2de2e6",
        yellow: "#fcee0a",
        violet: "#7a5cff",
        holo: "#6ff7ff",
        roof: "#0a0812",
        roofWet: "#1c1430",
        rail: "#3a3452",
        unit: "#2a2640",
        unitLight: "#4a4466",
        steam: "#b8a8d8",
        antenna: "#ff3b30",
        coat: "#141422",
        coatLight: "#2a2a44",
        collar: "#20203a",
        skin: "#c98a6a",
        hair: "#0e0e18",
        streak: "#ff3ec9",
        metal: "#5a6070",
        car: "#3a3a52",
        headlight: "#fff6c8",
        tail: "#ff3b30"
    };
    const LOOP = 4;

    function noise(i) {
        const v = Math.sin(i * 12.9898) * 43758.5453;
        return v - Math.floor(v);
    }

    function drawSky(art) {
        art.rect(colors.skyTop, 0, 0, 80, 20);
        art.rect(colors.skyMid, 0, 20, 80, 30);
        art.alpha(0.5);
        art.rect(colors.smog, 0, 44, 80, 10);
        art.alpha(0.3);
        art.rect(colors.smog, 0, 38, 80, 6);
        art.alpha(1);
    }

    // Towers with windows; a few windows blink on and off over time.
    function drawTowers(art, towers, color, t, seed, density) {
        const frame = Math.floor(t * 2);
        towers.forEach(function (tower, i) {
            art.rect(color, tower[0], tower[1], tower[2], 80 - tower[1]);
            for (let y = tower[1] + 3; y < 78; y += 3) {
                for (let x = tower[0] + 1; x < tower[0] + tower[2] - 1; x += 2) {
                    const n = noise(x * 7 + y * 13 + i * 31 + seed);
                    if (n < density) {
                        const blinking = n < density * 0.08;
                        if (!blinking || noise(n * 977 + frame) > 0.5) {
                            art.rect(colors.window[Math.floor(n * 1000) % 4], x, y, 1, 1);
                        }
                    }
                }
            }
        });
    }

    // A pink bar sign that stutters.
    function drawSigns(art, t) {
        if (noise(Math.floor(t * 4)) > 0.12) {
            art.rect(colors.pink, 8, 30, 10, 2);
            art.alpha(0.3);
            art.rect(colors.pink, 6, 28, 14, 6);
            art.alpha(1);
        }
    }

    // A translucent jellyfish hologram drifting slowly, tentacles waving.
    function drawJellyfish(art, t) {
        const x = 38 + Math.sin(t * 0.4) * 6;
        const y = 22 + Math.sin(t * 0.9) * 3;
        const flicker = noise(Math.floor(t * 10)) > 0.08 ? 1 : 0.3;
        art.alpha(0.35 * flicker);
        art.ellipse(colors.holo, x, y, 9, 6);
        art.alpha(0.55 * flicker);
        art.rect(colors.holo, Math.round(x - 9), Math.round(y), 19, 1);
        art.ellipse(colors.cyan, x, y - 2, 5, 2);
        for (let k = 0; k < 5; k++) {
            const tx = x - 7 + k * 3.5;
            for (let s = 0; s < 12; s++) {
                art.rect(colors.holo, Math.round(tx + Math.sin(t * 2 + k + s * 0.4) * (s / 5)), Math.round(y + 1 + s), 1, 1);
            }
        }
        // Scan lines across the hologram.
        art.alpha(0.25 * flicker);
        for (let line = Math.floor(t * 20) % 3; line < 14; line += 3) {
            art.rect(colors.skyTop, Math.round(x - 9), Math.round(y - 6 + line), 19, 1);
        }
        art.alpha(1);
    }

    function drawCars(art, t) {
        [[t * 20, 34, 1], [80 - (t * 14) % 120, 48, -1]].forEach(function (car, i) {
            const x = car[2] > 0 ? Math.round((car[0] % 120) - 20) : Math.round(car[0]);
            const y = car[1] + Math.round(Math.sin(t + i) * 1);
            const dir = car[2];
            art.alpha(0.35);
            art.rect(dir > 0 ? colors.tail : colors.headlight, dir > 0 ? x - 12 : x + 10, y + 1, 12, 1);
            art.alpha(1);
            art.rect(colors.car, x, y, 10, 3);
            art.rect(colors.car, x + 2, y - 2, 6, 2);
            art.rect(colors.violet, x, y + 3, 10, 1);
            art.rect(colors.headlight, dir > 0 ? x + 9 : x, y + 1, 1, 1);
            art.rect(colors.tail, dir > 0 ? x : x + 9, y + 1, 1, 1);
        });
    }

    // The rooftop: a railing, an AC unit with a turning fan, a steam vent and a
    // blinking antenna.
    function drawRoof(art, t) {
        art.rect(colors.roof, 0, 80, 80, 16);
        art.rect(colors.roofWet, 0, 80, 80, 1);
        art.rect(colors.rail, 0, 72, 80, 1);
        for (let x = 2; x < 80; x += 8) {
            art.rect(colors.rail, x, 72, 1, 8);
        }
        art.rect(colors.unit, 54, 70, 16, 10);
        art.rect(colors.unitLight, 54, 70, 16, 1);
        art.ellipse(colors.roof, 62, 75, 4, 4);
        const spin = t * 12;
        for (let b = 0; b < 3; b++) {
            const a = spin + b * Math.PI * 2 / 3;
            art.rect(colors.unitLight, Math.round(62 + Math.cos(a) * 3), Math.round(75 + Math.sin(a) * 3), 1, 1);
        }
        for (let i = 0; i < 4; i++) {
            const age = (t * 0.7 + i / 4) % 1;
            art.alpha(0.35 * (1 - age));
            art.ellipse(colors.steam, 74 + Math.sin(t + i) * 2, 70 - age * 18, 2 + age * 3, 1 + age * 2);
        }
        art.alpha(1);
        art.rect(colors.metal, 72, 70, 4, 10);
        art.rect(colors.metal, 46, 52, 1, 20);
        if (Math.floor(t * 1.5) % 2 === 0) {
            art.rect(colors.antenna, 45, 51, 3, 2);
        }
    }

    // The figure at the railing, three-quarter view facing left over the city.
    function drawFigure(art, t) {
        const x = 24;
        const g = 80;
        const flap = Math.round(Math.sin(t * 2.2) * 1);
        art.rect(colors.coat, x - 6, g - 24, 12, 22);
        art.rect(colors.coat, x - 7 - flap, g - 10, 3, 9);
        art.rect(colors.coatLight, x + 3, g - 24, 2, 21);
        art.rect(colors.coat, x - 4, g - 2, 3, 2);
        art.rect(colors.coat, x + 1, g - 2, 3, 2);
        // High collar around the jaw.
        art.rect(colors.collar, x - 5, g - 27, 10, 4);
        art.rect(colors.coatLight, x + 2, g - 27, 2, 4);
        // Head: undercut hair with a pink streak, the face turned toward the city.
        art.rect(colors.skin, x - 3, g - 33, 6, 7);
        art.rect(colors.hair, x - 3, g - 35, 7, 3);
        art.rect(colors.hair, x + 2, g - 33, 2, 4);
        art.rect(colors.streak, x - 2, g - 35, 3, 1);
        // The cybernetic eye, with a scan line sweeping out from it.
        const pulse = 0.6 + Math.sin(t * 5) * 0.4;
        art.alpha(pulse);
        art.rect(colors.yellow, x - 3, g - 31, 2, 1);
        art.alpha(0.25 * pulse);
        art.rect(colors.yellow, x - 12, g - 31, 9, 1);
        art.alpha(1);
        // The cybernetic arm resting on the railing, its circuit lines pulsing in sequence.
        art.rect(colors.metal, x - 9, g - 20, 4, 3);
        art.rect(colors.metal, x - 11, g - 17, 3, 9);
        const lit = Math.floor(t * 8) % 4;
        for (let i = 0; i < 4; i++) {
            art.alpha(i === lit ? 1 : 0.4);
            art.rect(colors.cyan, x - 10, g - 16 + i * 2, 1, 1);
        }
        art.alpha(1);
        art.rect(colors.cyan, x - 9, g - 19, 3, 1);
    }

    // The glitch: shifted strips, a red/cyan split and an error tag.
    function drawGlitch(art, p, t) {
        if (p < 3.65 || p >= 3.95) {
            return;
        }
        const frame = Math.floor(t * 30);
        const canvas = art.ctx.canvas;
        art.alpha(0.35);
        art.ctx.globalCompositeOperation = "lighter";
        art.ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, -1, 0, 80, 96);
        art.ctx.globalCompositeOperation = "source-over";
        art.alpha(1);
        for (let i = 0; i < 6; i++) {
            const y = Math.floor(noise(frame + i) * 92);
            const shift = Math.round((noise(frame * 3 + i) - 0.5) * 12);
            // The source is in canvas pixels; the destination is on the 80×96 grid the drawing is scaled to.
            art.ctx.drawImage(canvas, 0, y * 2, canvas.width, 6, shift, y, 80, 3);
            art.alpha(0.45);
            art.rect(i % 2 ? colors.pink : colors.cyan, 0, y, 80, 1);
            art.alpha(1);
        }
        art.text("ERR", 62, 4, colors.yellow);
    }

    function draw(art, t) {
        const p = t % LOOP;
        drawSky(art);
        drawTowers(art, [[0, 30, 12], [14, 24, 9], [26, 34, 10], [50, 20, 10], [70, 28, 10]], colors.farTower, t, 1, 0.25);
        drawJellyfish(art, t);
        drawTowers(art, [[4, 40, 10], [20, 46, 12], [40, 42, 9], [66, 44, 14]], colors.midTower, t, 2, 0.3);
        drawSigns(art, t);
        drawCars(art, t);
        drawRoof(art, t);
        drawFigure(art, t);
        drawGlitch(art, p, t);
    }

    window.siteRuntime.spriteMode({
        mode: "cyberpunk",
        sprite: ".cyberpunk-sprite",
        draw,
        still: 1,
        fps: 20
    });
})();