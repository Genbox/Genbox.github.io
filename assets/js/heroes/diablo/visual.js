(function () {
    "use strict";
    // A gothic action-RPG dungeon: torches gutter on a stone wall, a horned shadow rises in the dark archway with
    // burning eyes, and the red and blue globes in the corners slosh. The shadow's roar drains the red globe; a
    // potion fills it again. One round is 8 seconds.
    const colors = {
        stone: "#2a2420",
        stoneLight: "#3a322c",
        mortar: "#1a1512",
        floor: "#1c1815",
        arch: "#4a4038",
        archDark: "#0a0606",
        bracket: "#5a4a3a",
        flame: "#ff8a2a",
        flameHot: "#ffe08a",
        flameRed: "#c8322a",
        light: "#ff9a4a",
        shadow: "#000000",
        eye: "#ff2a1a",
        eyeHot: "#ffd0a0",
        fog: "#6a1010",
        globeRim: "#6b5a3a",
        life: "#c41e1e",
        lifeLight: "#ff5a4a",
        mana: "#1e46c4",
        manaLight: "#5a8aff",
        empty: "#120c0c",
        potion: "#ff5a4a"
    };
    const LOOP = 8;
    const ROAR = 4;

    function drawWall(art) {
        art.rect(colors.stone, 0, 0, 80, 80);
        for (let row = 0; row < 10; row++) {
            const y = row * 8;
            art.rect(colors.mortar, 0, y, 80, 1);
            for (let x = (row % 2) * 6; x < 80; x += 12) {
                art.rect(colors.mortar, x, y, 1, 8);
                art.rect(colors.stoneLight, x + 1, y + 1, 4, 1);
            }
        }
        art.rect(colors.floor, 0, 80, 80, 16);
        for (let x = 0; x < 80; x += 10) {
            art.rect(colors.mortar, x, 80, 1, 16);
        }
        art.rect(colors.mortar, 0, 80, 80, 1);
    }

    function drawTorch(art, x, t, seed) {
        const flicker = Math.sin(t * 17 + seed) * 0.5 + Math.sin(t * 29 + seed * 3) * 0.5;
        art.alpha(0.12 + flicker * 0.03);
        art.ellipse(colors.light, x, 34, 16, 16);
        art.alpha(1);
        art.rect(colors.bracket, x - 1, 38, 3, 8);
        art.rect(colors.bracket, x - 3, 37, 7, 2);
        const h = 6 + Math.round(flicker * 1.5);
        art.ellipse(colors.flameRed, x, 35 - h / 2, 3, h / 2 + 1);
        art.ellipse(colors.flame, x, 35 - h / 2, 2, h / 2);
        art.ellipse(colors.flameHot, x, 35 - h / 3, 1, h / 4);
    }

    function drawArch(art) {
        art.rect(colors.arch, 24, 28, 32, 52);
        art.ellipse(colors.arch, 40, 28, 16, 12);
        art.rect(colors.archDark, 28, 30, 24, 50);
        art.ellipse(colors.archDark, 40, 30, 12, 9);
        for (let i = 0; i < 6; i++) {
            art.rect(colors.mortar, 24, 36 + i * 8, 4, 1);
            art.rect(colors.mortar, 52, 36 + i * 8, 4, 1);
        }
    }

    // The horned shadow: it rises from the dark, roars, and sinks back.
    function drawShadow(art, p, t) {
        const rise = p < 1.5 ? 0 : p < 3 ? (p - 1.5) / 1.5 : p < 6 ? 1 : p < 7 ? 1 - (p - 6) : 0;
        if (!rise) {
            return;
        }
        const y = Math.round((1 - rise) * 10);
        art.alpha(0.3 * rise);
        art.ellipse(colors.fog, 40, 74, 14, 5);
        art.alpha(rise);
        art.ellipse(colors.shadow, 40, 68 + y, 13, 8);
        art.ellipse(colors.shadow, 40, 50 + y, 7, 8);
        for (let i = 0; i < 6; i++) {
            art.rect(colors.shadow, 34 - i, 44 + y - i, 2, 2);
            art.rect(colors.shadow, 45 + i, 44 + y - i, 2, 2);
        }
        const roaring = p >= ROAR && p < ROAR + 1;
        const glow = roaring ? 1 : 0.7 + Math.sin(t * 5) * 0.3;
        art.alpha(rise * glow);
        art.rect(roaring ? colors.eyeHot : colors.eye, 36, 49 + y, 3, 1);
        art.rect(roaring ? colors.eyeHot : colors.eye, 42, 49 + y, 3, 1);
        if (roaring) {
            art.rect(colors.eye, 38, 54 + y, 5, 2);
        }
        art.alpha(1);
    }

    function drawGlobe(art, x, level, fill, light, t, potion) {
        art.ellipse(colors.globeRim, x, 86, 10, 10);
        art.ellipse(colors.empty, x, 86, 8, 8);
        const top = Math.round(94 - 16 * level);
        for (let y = Math.max(78, top); y <= 94; y++) {
            const half = Math.round(8 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 86) / 8, 2))));
            const wave = y === top ? Math.round(Math.sin(t * 4 + x) * 1) : 0;
            art.rect(y === top ? light : fill, x - half + wave, y, half * 2, 1);
        }
        art.alpha(0.5);
        art.rect("#ffffff", x - 4, 81, 2, 2);
        art.alpha(1);
        if (potion) {
            art.text("+", x - 1, 72 - Math.round(potion * 6), colors.potion);
        }
    }

    function draw(art, t) {
        const p = t % LOOP;
        drawWall(art);
        drawArch(art);
        drawTorch(art, 10, t, 0);
        drawTorch(art, 70, t, 2);
        drawShadow(art, p, t);
        const drained = p >= ROAR && p < 6.5 ? Math.min(1, (p - ROAR) * 4) : p >= 6.5 && p < 7.3 ? 1 - (p - 6.5) / 0.8 : 0;
        const potion = p >= 6.5 && p < 7.3 ? (p - 6.5) / 0.8 : 0;
        drawGlobe(art, 9, 0.9 - drained * 0.55, colors.life, colors.lifeLight, t, potion);
        drawGlobe(art, 71, 0.75 + Math.sin(t * 0.7) * 0.05, colors.mana, colors.manaLight, t, 0);
    }

    window.siteRuntime.spriteMode({
        mode: "diablo",
        sprite: ".diablo-sprite",
        draw,
        still: 4.3,
        fps: 20
    });
})();