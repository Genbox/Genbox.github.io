(function () {
    "use strict";
    // A research lab where something is about to go wrong: a figure in a yellow hazmat suit with a crowbar stands
    // by a test chamber whose crackling beam grows unstable and flashes white at the end of each 8-second round.
    const colors = {
        wall: "#5d6b63",
        wallDark: "#46524b",
        panel: "#6f7d74",
        stripe: "#f2c53d",
        stripeDark: "#1b1d20",
        floor: "#3a403c",
        floorLine: "#2a2f2c",
        chamber: "#8a949c",
        chamberDark: "#4a5258",
        glass: "#9fd8c4",
        beam: "#b8ff6a",
        beamCore: "#f4ffd8",
        spark: "#fff6a0",
        suit: "#e3c22a",
        suitDark: "#b0931a",
        hood: "#d9b820",
        mask: "#2a2f35",
        lens: "#7fd8ff",
        filter: "#5d6673",
        glove: "#2a2f35",
        boot: "#1b1d20",
        bar: "#5d6673",
        barLight: "#9aa5b1",
        warn: "#ff4a3a",
        flash: "#ffffff"
    };
    const LOOP = 8;
    const SURGE = 6;

    function brush(art, color, x0, y0, x1, y1, size) {
        const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        const offset = Math.floor(size / 2);
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + (x1 - x0) * i / steps) - offset, Math.round(y0 + (y1 - y0) * i / steps) - offset, size, size);
        }
    }

    function drawLab(art) {
        art.rect(colors.wall, 0, 0, 80, 78);
        for (let x = 0; x < 80; x += 16) {
            art.rect(colors.panel, x + 1, 12, 14, 30);
            art.rect(colors.wallDark, x, 0, 1, 78);
        }
        for (let x = -4; x < 80; x += 8) {
            for (let k = 0; k < 4; k++) {
                art.rect(colors.stripe, x + k, 70 + k, 4, 1);
                art.rect(colors.stripeDark, x + 4 + k, 70 + k, 4, 1);
            }
        }
        art.rect(colors.floor, 0, 78, 80, 18);
        for (let x = 0; x < 80; x += 12) {
            art.rect(colors.floorLine, x, 78, 1, 18);
        }
        art.rect(colors.floorLine, 0, 86, 80, 1);
    }

    // The test chamber: a glass tube with a beam that wobbles more as the surge approaches.
    function drawChamber(art, p, t) {
        const strain = p < SURGE ? p / SURGE : 1;
        art.rect(colors.chamberDark, 54, 10, 20, 6);
        art.rect(colors.chamberDark, 54, 74, 20, 6);
        art.rect(colors.chamber, 55, 11, 18, 3);
        art.rect(colors.chamber, 55, 75, 18, 3);
        art.alpha(0.25);
        art.rect(colors.glass, 56, 16, 16, 58);
        art.alpha(1);
        art.rect(colors.chamberDark, 56, 16, 1, 58);
        art.rect(colors.chamberDark, 71, 16, 1, 58);
        const width = 2 + Math.round(Math.abs(Math.sin(t * (6 + strain * 20))) * (1 + strain * 3));
        art.alpha(0.5);
        art.rect(colors.beam, 64 - width - 1, 16, width * 2 + 2, 58);
        art.alpha(1);
        art.rect(colors.beamCore, 64 - Math.floor(width / 2), 16, Math.max(1, width), 58);
        // Arcs jump off the beam, more often as it strains.
        const frame = Math.floor(t * 15);
        if ((frame * 7) % 10 < 3 + strain * 6) {
            const y = 20 + (frame * 13) % 50;
            const side = frame % 2 ? 1 : -1;
            brush(art, colors.spark, 64, y, 64 + side * 5, y - 3, 1);
            brush(art, colors.spark, 64 + side * 5, y - 3, 64 + side * 7, y + 2, 1);
        }
    }

    function drawWorker(art, p) {
        const x = 24;
        const g = 86;
        // A swing every 2 seconds, landing on the downbeat.
        const swing = p % 2;
        const raised = swing > 1.6;
        art.rect(colors.boot, x - 6, g - 2, 5, 2);
        art.rect(colors.boot, x + 1, g - 2, 5, 2);
        art.rect(colors.suitDark, x - 5, g - 12, 4, 10);
        art.rect(colors.suit, x + 1, g - 12, 4, 10);
        art.rect(colors.suit, x - 6, g - 26, 12, 15);
        art.rect(colors.suitDark, x - 6, g - 26, 2, 15);
        art.rect(colors.suitDark, x - 6, g - 14, 12, 2);
        // A full hood with a dark respirator mask, round lenses and a filter.
        art.ellipse(colors.hood, x, g - 31, 6, 6);
        art.rect(colors.mask, x - 3, g - 33, 8, 6);
        art.rect(colors.lens, x - 2, g - 32, 2, 2);
        art.rect(colors.lens, x + 2, g - 32, 2, 2);
        art.ellipse(colors.filter, x + 2, g - 26, 2, 2);
        // The near arm holds the crowbar: resting point-down, then raised behind the head before each swing.
        const hx = raised ? x + 6 : x + 8;
        const hy = raised ? g - 32 : g - 16;
        brush(art, colors.suit, x + 5, g - 24, hx, hy, 3);
        art.rect(colors.glove, hx - 1, hy - 1, 3, 3);
        if (raised) {
            brush(art, colors.bar, hx, hy, hx - 8, hy - 9, 2);
            brush(art, colors.barLight, hx - 8, hy - 9, hx - 11, hy - 8, 1);
        } else {
            brush(art, colors.bar, hx, hy, hx + 4, hy + 12, 2);
            brush(art, colors.barLight, hx + 4, hy + 12, hx + 7, hy + 12, 1);
        }
        brush(art, colors.suitDark, x - 5, g - 24, x - 8, g - 15, 3);
        art.rect(colors.glove, x - 9, g - 15, 3, 3);
    }

    function draw(art, t) {
        const p = t % LOOP;
        drawLab(art);
        drawChamber(art, p, t);
        drawWorker(art, p);
        const blink = Math.floor(t * 3) % 2 === 0;
        if (p > 3.5 && blink) {
            art.text("WARNING", 3, 3, colors.warn);
        }
        if (p >= SURGE && p < SURGE + 0.6) {
            art.alpha(1 - (p - SURGE) / 0.6);
            art.rect(colors.flash, 0, 0, 80, 96);
            art.alpha(1);
        }
    }

    window.siteRuntime.spriteMode({
        mode: "halflife",
        sprite: ".halflife-sprite",
        draw,
        still: 4.5,
        fps: 20
    });
})();