(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.dontpanic;
    const readingFade = window.siteRuntime.readingFade;
    const colors = {
        light: "#f1f2f2",
        mid: "#c7cbce",
        dark: "#6e7681",
        deep: "#3f454d",
        outline: "#2a2e34",
        eye: "#a4e94c",
        eyeDim: "#558c25",
        ink: "#2a2e33",
        bubble: "#ffffff"
    };

    // An original gloomy robot: a big domed head on a small body, arms hanging, eyes half shut. At the start
    // of each line it heaves a sigh, rising a little and then slumping lower than before.
    function robot(art, t) {
        const p = t % sound.line;
        const rise = p < 0.6 ? p / 0.6 : Math.max(0, 1 - (p - 0.6) / 1.6);
        const lift = Math.round(rise * 2);
        const droop = rise > 0.3 ? 0 : 1;
        const headY = 45 - lift + droop;
        const top = 62 - lift;
        function polygon(color, points) {
            const ctx = art.ctx;
            ctx.fillStyle = color;
            ctx.beginPath();
            points.forEach(function (point, i) {
                if (i === 0) {
                    ctx.moveTo(point[0], point[1]);
                } else {
                    ctx.lineTo(point[0], point[1]);
                }
            });
            ctx.closePath();
            ctx.fill();
        }
        // Short armored legs and oversized white boots, separated by dark joints.
        [33, 46].forEach(function (x) {
            art.ellipse(colors.outline, x, 85, 6, 8);
            art.ellipse(colors.mid, x, 84, 5, 7);
            art.rect(colors.deep, x - 5, 86, 10, 2);
            art.ellipse(colors.outline, x, 91, 7, 4);
            art.ellipse(colors.light, x, 90, 6, 3);
            art.rect(colors.mid, x - 5, 92, 10, 1);
        });
        // Rounded belly, narrow shoulders, and the black inset beneath the chest plate.
        art.ellipse(colors.outline, 40, top + 13, 13, 14);
        art.ellipse(colors.mid, 40, top + 13, 12, 13);
        art.ellipse(colors.light, 38, top + 12, 10, 12);
        polygon(colors.deep, [
            [29, top + 1],
            [50, top + 1],
            [53, top + 13],
            [27, top + 13]
        ]);
        polygon(colors.light, [
            [32, top - 3],
            [47, top - 3],
            [51, top + 10],
            [45, top + 7],
            [35, top + 7],
            [28, top + 11]
        ]);
        art.rect(colors.dark, 34, top + 9, 12, 1);
        art.rect(colors.dark, 32, top + 11, 16, 1);
        polygon(colors.deep, [
            [28, top + 18],
            [39, top + 26],
            [38, top + 28],
            [28, top + 21]
        ]);
        polygon(colors.deep, [
            [51, top + 19],
            [42, top + 26],
            [42, top + 28],
            [51, top + 22]
        ]);
        // Sloping shoulders, long white forearms, and small black articulated hands.
        [25, 54].forEach(function (x, i) {
            art.ellipse(colors.outline, x + (i ? -1 : 1), top + 5, 4, 9);
            art.ellipse(colors.light, x + (i ? -1 : 1), top + 4, 3, 8);
            art.rect(colors.deep, x - 3, top + 9, 6, 2);
            art.ellipse(colors.outline, x, top + 17, 4, 9);
            art.ellipse(i ? colors.mid : colors.light, x, top + 16, 3, 8);
            art.rect("#ffffff", x - 2, top + 12, 1, 9);
            art.ellipse(colors.outline, x, top + 25, 3.5, 4.5);
            art.rect(colors.dark, x - 2, top + 23, 1, 4);
            art.rect(colors.deep, x, top + 24, 1, 4);
        });
        art.ellipse(colors.outline, 40, top, 6, 4);
        art.ellipse(colors.deep, 40, top - 1, 5, 3);
        // An enormous spherical shell with a single curved face seam, no mouth or ears.
        const hx = 40 - droop;
        art.ellipse(colors.dark, hx, headY, 21, 21);
        art.ellipse(colors.mid, hx, headY, 20, 20);
        art.ellipse("#dfe1e2", hx - 1, headY - 1, 19, 19);
        art.ellipse(colors.light, hx - 2, headY - 3, 17, 16);
        art.ellipse("#f9fafa", hx - 3, headY - 5, 13, 12);
        const blink = t % 5.3 < 0.35;
        if (!blink) {
            polygon(colors.eyeDim, [
                [hx - 17, headY + 2],
                [hx - 9, headY + 1],
                [hx - 13, headY + 7]
            ]);
            polygon(colors.eye, [
                [hx - 16, headY + 2],
                [hx - 10, headY + 2],
                [hx - 13, headY + 5]
            ]);
            polygon(colors.eyeDim, [
                [hx + 6, headY + 2],
                [hx + 15, headY + 4],
                [hx + 10, headY + 9]
            ]);
            polygon(colors.eye, [
                [hx + 7, headY + 3],
                [hx + 14, headY + 4],
                [hx + 10, headY + 7]
            ]);
        }
        const ctx = art.ctx;
        ctx.strokeStyle = colors.outline;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(hx - 19, headY + 4);
        ctx.bezierCurveTo(hx - 12, headY - 2, hx + 10, headY + 1, hx + 19, headY + 7);
        ctx.stroke();
    }

    function bubble(art, t) {
        const p = t % sound.line;
        const line = sound.lines[Math.floor((t % sound.loop) / sound.line)];
        if (p < sound.speech || !sound.bubbleVisible()) {
            return;
        }
        const duration = Math.max(2.5, line.text.length * 0.075);
        const lines = art.wrap(line.text, 70);
        const shown = line.text.slice(0, Math.ceil(line.text.length * Math.min(1, (p - sound.speech) / duration)));
        const height = lines.length * 7 + 3;
        const width = Math.max.apply(null, lines.map(art.width)) + 6;
        const left = 40 - Math.ceil(width / 2);
        let used = 0;
        art.rect(colors.ink, left - 1, 1, width + 2, height + 2);
        art.rect(colors.bubble, left, 2, width, height);
        for (let tail = 0; tail < 3; tail++) {
            art.rect(tail === 2 ? colors.ink : colors.bubble, 46 - (2 - tail), height + 2 + tail, 5 - tail * 2 || 1, 1);
        }
        lines.forEach(function (text, i) {
            art.text(shown.slice(used, used + text.length), left + 3, 4 + i * 7, colors.ink);
            used += text.length + 1;
        });
    }

    function draw(art, t) {
        robot(art, t);
        bubble(art, t);
    }

    // Behind the page: flickering "42" and DON'T PANIC while the robot says it.
    function drawLayer(ctx, width, height, t) {
        const loopTime = t % sound.loop;
        const dontPanic = Math.floor(loopTime / sound.line) === 2;
        if (dontPanic) {
            const p = loopTime - 2 * sound.line;
            const fade = Math.min(1, p / 0.8, (sound.line - p) / 0.8);
            ctx.globalAlpha = 0.16 * fade;
            ctx.fillStyle = "#f2b84b";
            ctx.font = "800 " + Math.round(Math.min(width / 7, 140)) + "px 'Geist', system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("DON'T PANIC", width / 2, height / 2);
        }
        for (let k = 0; k < 5; k++) {
            const cycle = Math.floor(t / 3 + k * 0.37);
            const phase = (t / 3 + k * 0.37) % 1;
            const seed = Math.sin(cycle * 37.1 + k * 11.3) * 9999;
            const rx = seed - Math.floor(seed);
            const ry = seed * 7.3 - Math.floor(seed * 7.3);
            const x = rx * width;
            const y = 60 + ry * (height - 120);
            ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.4 * readingFade(x, width);
            ctx.fillStyle = "#8f97a2";
            ctx.font = "600 22px 'Geist Mono', ui-monospace, monospace";
            ctx.textAlign = "center";
            ctx.fillText("42", x, y);
        }
        ctx.globalAlpha = 1;
    }

    window.siteRuntime.spriteMode({
        mode: "dontpanic",
        sprite: ".dontpanic-sprite",
        draw,
        still: 2,
        fps: 20,
        layer: { className: "dontpanic-towel", draw: drawLayer }
    });
})();