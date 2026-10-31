(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.terminator;
    const chrome = {
        light: "#eeece8",
        mid: "#a6a5ae",
        dark: "#637782",
        deep: "#454052",
        black: "#090b10",
        cyan: "#71d6e7",
        tooth: "#eeece8",
        eye: "#f41627",
        hot: "#fff1d4"
    };

    function flareAt(t) {
        return 0.65 + 0.35 * Math.exp(-(t % sound.bar) * 3);
    }

    // Scan-convert the stepped plates to whole pixels, avoiding softened edges.
    function plate(art, color, points) {
        const bottom = Math.max.apply(
            null,
            points.map(function (p) {
                return p[1];
            })
        );
        const top = Math.min.apply(
            null,
            points.map(function (p) {
                return p[1];
            })
        );
        for (let y = top; y < bottom; y++) {
            const cuts = [];
            for (let i = 0; i < points.length; i++) {
                const a = points[i];
                const b = points[(i + 1) % points.length];
                const row = y + 0.5;
                if (a[1] <= row && b[1] > row || b[1] <= row && a[1] > row) {
                    cuts.push(a[0] + ((row - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
                }
            }
            cuts.sort(function (a, b) {
                return a - b;
            });
            for (let x = 0; x + 1 < cuts.length; x += 2) {
                const left = Math.round(cuts[x]);
                const right = Math.round(cuts[x + 1]);
                art.rect(color, left, y, right - left, 1);
            }
        }
    }

    function draw(art, t) {
        if (window.siteRuntime.reducedMotion.matches) {
            t = 0.5;
        }
        const flare = flareAt(t);
        const beat = Math.exp(-(t % sound.bar) * 7);
        const jaw = -Math.round(2 * Math.pow(0.5 + 0.5 * Math.sin(t * 3.2), 2));
        const scan = Math.round(Math.sin(t * 0.85) * 3);
        // Whole-pixel servo movements keep the silhouette crisp while it scans.
        art.ctx.save();
        // Keep the skull below the five-pixel status line, even on a beat.
        art.ctx.translate(scan + Math.round(beat), 1 + Math.round(Math.sin(t * 1.7)));
        // Broad domed skull tapering into a long, open mechanical jaw.
        plate(art, chrome.deep, [
            [32, 8],
            [48, 8],
            [59, 12],
            [65, 20],
            [68, 34],
            [68, 56],
            [62, 63],
            [60, 78],
            [52, 90],
            [45, 94],
            [35, 94],
            [28, 90],
            [20, 78],
            [18, 63],
            [12, 56],
            [12, 34],
            [15, 20],
            [21, 12]
        ]);
        plate(art, chrome.dark, [
            [31, 8],
            [49, 8],
            [59, 14],
            [64, 24],
            [64, 38],
            [16, 38],
            [16, 24],
            [21, 14]
        ]);
        plate(art, chrome.cyan, [
            [30, 10],
            [50, 10],
            [58, 15],
            [61, 26],
            [59, 36],
            [21, 36],
            [19, 26],
            [22, 15]
        ]);
        plate(art, chrome.light, [
            [32, 11],
            [48, 11],
            [56, 15],
            [59, 25],
            [57, 36],
            [47, 39],
            [33, 39],
            [23, 36],
            [21, 25],
            [24, 15]
        ]);
        plate(art, chrome.mid, [
            [31, 15],
            [49, 15],
            [55, 19],
            [57, 28],
            [54, 35],
            [47, 35],
            [45, 40],
            [35, 40],
            [33, 35],
            [26, 35],
            [23, 28],
            [25, 19]
        ]);
        // Temple recesses and central forehead grooves.
        [18, 59].forEach(function (x) {
            art.rect(chrome.black, x, 21, 3, 10);
            art.rect(chrome.light, x, 32, 3, 4);
        });
        art.rect(chrome.black, 34, 26, 1, 11);
        art.rect(chrome.black, 45, 26, 1, 11);
        art.rect(chrome.deep, 35, 31, 10, 7);
        art.rect(chrome.black, 35, 36, 10, 3);
        art.rect(chrome.light, 35, 39, 10, 2);
        // Angular brows, large black sockets and high cheek rims.
        for (let side = 0; side < 2; side++) {
            art.ctx.save();
            if (side) {
                art.ctx.translate(80, 0);
                art.ctx.scale(-1, 1);
            }
            plate(art, chrome.black, [
                [14, 39],
                [25, 39],
                [33, 43],
                [37, 48],
                [34, 56],
                [28, 61],
                [17, 57],
                [12, 51]
            ]);
            plate(art, chrome.deep, [
                [15, 37],
                [24, 37],
                [29, 40],
                [31, 44],
                [28, 46],
                [23, 42],
                [15, 42]
            ]);
            plate(art, chrome.light, [
                [22, 38],
                [29, 40],
                [35, 43],
                [34, 46],
                [29, 44],
                [26, 41],
                [22, 41]
            ]);
            art.rect(chrome.cyan, 14, 41, 9, 1);
            plate(art, chrome.dark, [
                [12, 48],
                [16, 48],
                [16, 55],
                [23, 59],
                [30, 58],
                [34, 55],
                [35, 61],
                [28, 65],
                [17, 60],
                [12, 56]
            ]);
            plate(art, chrome.light, [
                [15, 49],
                [17, 49],
                [17, 55],
                [23, 58],
                [30, 57],
                [29, 60],
                [23, 61],
                [16, 57]
            ]);
            art.rect(chrome.cyan, 12, 50, 2, 7);
            // Red lenses stay recessed; their hot core flashes with the score.
            art.rect(chrome.dark, 23, 49, 5, 3);
            art.alpha(flare);
            art.rect(chrome.eye, 23, 46, 5, 4);
            art.rect(chrome.eye, 22, 47, 7, 2);
            art.rect(chrome.hot, 25, 46, 2, 1);
            art.alpha(1);
            // Exposed cheek-to-jaw pistons.
            art.rect(chrome.black, 19, 64, 9, 11);
            art.rect(chrome.dark, 20, 64, 3, 10);
            art.rect(chrome.mid, 23, 67, 2, 6);
            art.rect(chrome.cyan, 18, 74, 3, 4);
            art.rect(chrome.light, 21, 77, 5, 2);
            plate(art, chrome.dark, [
                [21, 79],
                [26, 79],
                [30, 87],
                [31, 91],
                [28, 89],
                [24, 84]
            ]);
            art.ctx.restore();
        }
        // Hollow nose with silver/cyan rails and a metal septum.
        plate(art, chrome.mid, [
            [38, 49],
            [42, 49],
            [45, 54],
            [48, 65],
            [45, 70],
            [35, 70],
            [32, 65],
            [35, 54]
        ]);
        plate(art, chrome.light, [
            [38, 49],
            [42, 49],
            [44, 53],
            [42, 53],
            [41, 51],
            [39, 51],
            [38, 54],
            [36, 54]
        ]);
        plate(art, chrome.black, [
            [39, 55],
            [41, 55],
            [43, 61],
            [44, 65],
            [36, 65],
            [37, 61]
        ]);
        art.rect(chrome.dark, 39, 63, 2, 3);
        art.rect(chrome.cyan, 33, 61, 2, 6);
        art.rect(chrome.cyan, 45, 61, 2, 6);
        art.rect(chrome.light, 36, 67, 8, 2);
        // Matching silver teeth; the lower row follows the articulated jaw.
        plate(art, chrome.black, [
            [29, 70],
            [51, 70],
            [51, 78],
            [46, 81],
            [34, 81],
            [29, 78]
        ]);
        for (let tooth = 0; tooth < 7; tooth++) {
            const x = 29 + tooth * 3;
            art.rect(chrome.tooth, x, 71 + tooth % 2, 2, 3);
            if (tooth % 2 === 0) {
                art.rect(chrome.tooth, x, 77 + jaw, 2, 2);
            }
        }
        // Extend the piston rods as the jaw opens.
        art.rect(chrome.dark, 29, 78, 3, 5 + jaw);
        art.rect(chrome.dark, 48, 78, 3, 5 + jaw);
        art.rect(chrome.light, 30, 78, 1, 4 + jaw);
        art.rect(chrome.light, 48, 78, 1, 4 + jaw);
        art.ctx.save();
        art.ctx.translate(0, jaw);
        // Long open chin, pale rim and blue side rails, as in the reference.
        plate(art, chrome.dark, [
            [29, 80],
            [51, 80],
            [51, 89],
            [47, 93],
            [33, 93],
            [29, 89]
        ]);
        art.rect(chrome.cyan, 31, 81, 2, 9);
        art.rect(chrome.cyan, 47, 81, 2, 9);
        art.rect(chrome.light, 35, 81, 10, 2);
        art.rect(chrome.light, 34, 83, 2, 7);
        art.rect(chrome.light, 44, 83, 2, 7);
        art.rect(chrome.black, 36, 83, 8, 7);
        art.rect(chrome.deep, 36, 90, 8, 2);
        art.rect(chrome.light, 32, 92, 16, 1);
        art.ctx.restore();
        // A moving cold reflection across the forehead reinforces the metal surface.
        const glint = 27 + Math.round((0.5 + 0.5 * Math.sin(t * 1.3)) * 22);
        art.alpha(0.45);
        art.rect(chrome.light, glint, 19, 2, 8);
        art.alpha(1);
        art.ctx.restore();
        const label = sound.readouts[Math.floor(t / sound.bar) % sound.readouts.length].text;
        art.text(label, 40 - Math.ceil(art.width(label) / 2), 1, "#ff5a40");
    }

    // A red heads-up display over the page: a hex readout in the margin and a reticle that
    // locks onto a different heading or card on every anvil strike.
    function targets() {
        return Array.from(document.querySelectorAll("h1, h2, .card, .post-list li")).filter(element => {
            const box = element.getBoundingClientRect();
            return box.width > 0 && box.bottom > 40 && box.top < innerHeight - 40;
        });
    }
    function drawLayer(ctx, width, height, t) {
        ctx.fillStyle = "rgba(255, 24, 0, 0.05)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1);
        }
        ctx.strokeStyle = "rgba(255, 60, 40, 0.7)";
        ctx.lineWidth = 2;
        function brackets(x, y, w, h, size) {
            ctx.beginPath();
            [
                [x, y, 1, 1],
                [x + w, y, -1, 1],
                [x, y + h, 1, -1],
                [x + w, y + h, -1, -1]
            ].forEach(function (c) {
                ctx.moveTo(c[0] + c[2] * size, c[1]);
                ctx.lineTo(c[0], c[1]);
                ctx.lineTo(c[0], c[1] + c[3] * size);
            });
            ctx.stroke();
        }
        ctx.font = "11px 'Geist Mono', ui-monospace, monospace";
        ctx.fillStyle = "rgba(255, 70, 50, 0.55)";
        const margin = (width - Math.min(width, 1180)) / 2;
        if (margin > 150) {
            for (let line = 0; line < Math.ceil(height / 16); line++) {
                const n = line + Math.floor(t * 4);
                const hex = (Math.imul(n, 2654435761) >>> 0).toString(16).toUpperCase();
                ctx.fillText(("00000000" + hex).slice(-8) + " " + (n % 7 ? "OK" : "--"), width - margin + 24, 40 + line * 16 - (t * 64) % 16);
            }
        }
        const found = targets();
        if (!found.length) {
            return;
        }
        const target = found[Math.floor(t / sound.bar) % found.length];
        const box = target.getBoundingClientRect();
        const lock = Math.min(1, (t % sound.bar) / 0.35);
        const grow = (1 - lock) * 40;
        ctx.strokeStyle = "rgba(255, 60, 40, 0.9)";
        brackets(box.left - 6 - grow, box.top - 6 - grow, box.width + 12 + grow * 2, box.height + 12 + grow * 2, 12);
        if (lock < 1) {
            return;
        }
        ctx.fillStyle = "rgba(255, 80, 60, 0.9)";
        const match = 90 + (Math.floor(t / sound.bar) * 7) % 10;
        ctx.fillText(t % sound.bar < 1.2 ? "TARGET ACQUIRED" : "MATCH " + match + "%", box.left - 6, Math.min(height - 8, box.bottom + 20));
    }

    window.siteRuntime.spriteMode({
        mode: "terminator",
        sprite: ".terminator-sprite",
        draw,
        still: 0.5,
        fps: 20,
        layer: { className: "terminator-hud", draw: drawLayer }
    });
})();