(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.c64;
    const palette = {
        black: "#000000",
        white: "#ffffff",
        red: "#883932",
        lightRed: "#b86962",
        cyan: "#67b6bd",
        purple: "#8b3f96",
        green: "#55a049",
        lightGreen: "#94e089",
        blue: "#40318d",
        lightBlue: "#7869c4",
        yellow: "#bfce72",
        orange: "#8b5429",
        grey: "#787878"
    };
    const loaderColors = [palette.lightBlue, palette.yellow, palette.red, palette.cyan, palette.purple, palette.white, palette.green];
    const bars = [
        [palette.red, palette.lightRed, palette.white, palette.lightRed, palette.red],
        [palette.blue, palette.lightBlue, palette.white, palette.lightBlue, palette.blue],
        [palette.green, palette.lightGreen, palette.white, palette.lightGreen, palette.green]
    ];
    const COMMAND = 'LOAD"*",8,1';
    const TYPING = 1;
    const KEY = 0.2;
    const SEARCHING = 3.4;
    const LOADING = 4.2;
    const STRIPES = 4.4;

    // A repeatable pseudo-random number for the loader stripes, so each frame's pattern is fixed.
    function noise(n) {
        const x = Math.sin(n * 127.1) * 43758.5453;
        return x - Math.floor(x);
    }

    function drawScreen(art, t) {
        const inner = { x: 14, y: 17, w: 52, h: 40 };
        if (t < sound.demo) {
            // The BASIC screen, with the border flashing loader stripes once the file is found.
            if (t >= STRIPES) {
                let row = 0;
                const frame = Math.floor(t * 20);
                while (row < 50) {
                    const band = 1 + Math.floor(noise(frame * 31 + row) * 4);
                    art.rect(loaderColors[Math.floor(noise(frame * 17 + row * 3) * loaderColors.length)], 9, 12 + row, 62, band);
                    row += band;
                }
            } else {
                art.rect(palette.lightBlue, 9, 12, 62, 50);
            }
            art.rect(palette.blue, inner.x, inner.y, inner.w, inner.h);
            const lines = ["READY."];
            const typed = Math.max(0, Math.min(COMMAND.length, Math.floor((t - TYPING) / KEY)));
            if (t >= TYPING) {
                lines.push(COMMAND.slice(0, typed));
            }
            if (t >= SEARCHING) {
                lines.push("SEARCHING");
            }
            if (t >= LOADING) {
                lines.push("LOADING");
            }
            lines.forEach(function (line, i) {
                art.text(line, 16, 19 + i * 7, "#a59cf2");
            });
            const typing = t >= TYPING && t < SEARCHING;
            const waiting = t < TYPING || t >= LOADING;
            if (typing || waiting && Math.floor(t * 2.5) % 2 === 0) {
                const last = lines[lines.length - 1];
                const cursorX = typing ? 16 + art.width(last) + (last ? 1 : 0) : 16;
                art.rect("#a59cf2", cursorX, 19 + (lines.length - (typing ? 1 : 0)) * 7, 3, 5);
            }
            return;
        }
        // A tiny Ghostbusters title screen, drawn directly on the C64 pixel grid.
        art.rect(palette.black, 9, 12, 62, 50);
        const red = "#e34b45";
        art.ellipse(red, 40, 33, 18, 18);
        art.ellipse(palette.black, 40, 33, 14, 14);
        const ghost = [
            "       WWWWWW       ",
            "     WWWWWWWWWW     ",
            "    WWWWWWWWWWWW    ",
            "   WWWWWWWWWWWWWW   ",
            "   WWWWKKWWWKKWWW   ",
            "   WWWWKKWWWKKWWW   ",
            "   WWWWWWWWWWWWWW   ",
            "   WWWWWWKKWWWWWW   ",
            "   WWWWWKKKKWWWWW   ",
            "   WWWWWKKKKWWWWW   ",
            "  WWWWWWKKKKWWWWWW  ",
            " WWWWWWWWKKWWWWWWWW ",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWW WWWWWWWWWWWW WWW",
            "WW  WWWWWWWWWWWW  WW",
            "    WWWWWWWWWWWW    ",
            "    WWWWWWWWWWWW    ",
            "    WWWWWWWWWWWW    ",
            "   WWWWWWWWWWWWWW   ",
            "   WWWWWWWWWWWWWWW  ",
            "  WWWWWWWWWWWWWWW   ",
            "  WWWWWWWWWWWWW     ",
            "   WWWW WWWW WW     ",
            "    WW   WW        "
        ];
        const bob = Math.floor((t - sound.demo) * 2) % 2;
        ghost.forEach(function (row, y) {
            row.split("").forEach(function (pixel, x) {
                if (pixel !== " ") {
                    art.rect(pixel === "W" ? palette.white : palette.black, 30 + x, 20 + y + bob, 1, 1);
                }
            });
        });
        // Hands grip the rim; the red slash sits in front of the ghost.
        art.rect(palette.white, 21, 29 + bob, 7, 3);
        art.rect(palette.white, 23, 27 + bob, 2, 7);
        art.rect(palette.white, 53, 30 + bob, 7, 3);
        art.rect(palette.white, 56, 28 + bob, 2, 7);
        for (let step = 0; step < 26; step++) {
            art.rect(red, 27 + step, 20 + step, 4, 3);
        }
        const title = "GHOSTBUSTERS";
        art.text(title, 40 - Math.ceil(art.width(title) / 2), 55, palette.white);
    }

    function draw(art, t) {
        t %= sound.loop;
        // A beige monitor with a deep bezel, a control strip and a stand.
        art.rect("#5f584a", 3, 5, 74, 72);
        art.rect("#b5ab94", 4, 6, 72, 70);
        art.rect("#d4cbb4", 4, 6, 72, 2);
        art.rect("#2b2924", 7, 10, 66, 54);
        drawScreen(art, t);
        // Scanlines and a soft glare over the glass.
        art.alpha(0.18);
        for (let line = 12; line < 62; line += 2) {
            art.rect("#000000", 9, line, 62, 1);
        }
        art.alpha(0.06);
        art.rect("#ffffff", 11, 14, 20, 2);
        art.alpha(1);
        art.rect("#8c8370", 8, 67, 64, 6);
        for (let knob = 0; knob < 4; knob++) {
            art.rect("#4a463c", 44 + knob * 7, 69, 4, 2);
        }
        art.rect(t < STRIPES || Math.floor(t * 8) % 2 ? "#ff4636" : "#7a1d16", 12, 69, 3, 2);
        art.rect("#8c8370", 30, 77, 20, 7);
        art.rect("#5f584a", 22, 84, 36, 4);
        art.rect("#b5ab94", 23, 84, 34, 2);
    }

    // Behind the page: faint loader stripes while the "tape" loads, then sweeping copper bars.
    function drawLayer(ctx, width, height, t) {
        t %= sound.loop;
        const reading = Math.min(width, 1180) / 2 - 30;
        const left = width / 2 - reading;
        function band(color, y, h, alpha) {
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(0, y, left, h);
            ctx.fillRect(width - left, y, left, h);
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillRect(left, y, width - left * 2, h);
        }
        if (t >= STRIPES && t < sound.demo) {
            let y = 0;
            const frame = Math.floor(t * 20);
            while (y < height) {
                const h = 6 + Math.floor(noise(frame * 31 + y) * 30);
                band(loaderColors[Math.floor(noise(frame * 17 + y * 3) * loaderColors.length)], y, h, 0.1);
                y += h;
            }
        } else if (t >= sound.demo) {
            const d = t - sound.demo;
            bars.forEach(function (bar, i) {
                const top = height / 2 + Math.sin(d * 1.4 + i * 1.1) * height * 0.38 - 30;
                bar.forEach(function (color, line) {
                    band(color, Math.round(top + line * 12), 12, 0.32);
                });
            });
        }
    }

    window.siteRuntime.spriteMode({
        mode: "c64",
        sprite: ".c64-sprite",
        draw,
        still: 10,
        fps: 25,
        layer: { className: "c64-bars", draw: drawLayer }
    });
})();