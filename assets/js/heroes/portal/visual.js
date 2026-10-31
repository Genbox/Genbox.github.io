(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.portal;
    const colors = {
        blue: "#3aa6ff",
        blueDeep: "#0d3f78",
        orange: "#ff9a1f",
        orangeDeep: "#743809",
        cube: "#8e959c",
        edge: "#5c636a",
        corner: "#c9ced3",
        face: "#d7dadd",
        heart: "#ff6fae"
    };
    const heart = ["0101", "1111", "1111", "0110"];
    // An all-white shell lit from the left, so it stands out on the dark page; dark legs and gun blocks.
    const turret = {
        white: "#ffffff",
        shell: "#f1f3f4",
        mid: "#dfe3e6",
        shade: "#c3c9ce",
        rim: "#8f979e",
        seam: "#6b737b",
        dark: "#2e3338",
        darker: "#1b1e22",
        metal: "#5b636b",
        eye: "#ff2a1a",
        glow: "#ff6a4a",
        iris: "#b3120c",
        ink: "#2a2e33"
    };
    const LINE = sound.line;

    // The turret's state for line k of the loop: how far its side panels are open, how bright the eye is and
    // where the laser points (null when it is off).
    function stateAt(t) {
        const k = Math.floor(t / LINE) % sound.lines.length;
        const p = t % LINE;
        const line = sound.lines[k];
        const talk = line.syllables * sound.syllable;
        let open = 0;
        let laser = null;
        if (line.mood === "spot") {
            open = Math.min(1, Math.max(0, (p - 0.2) / 0.3));
        }
        if (line.mood === "sorry") {
            open = Math.max(0, 1 - p / 0.5);
        }
        if (line.mood === "search" && p > talk) {
            laser = Math.sin((p - talk) * 2.6) * 30;
        }
        if (line.mood === "spot" && p > 0.5) {
            laser = 0;
        }
        const since = p < talk ? p % sound.syllable : Infinity;
        return {
            line,
            p,
            talk,
            open,
            laser,
            eye: 0.6 + 0.4 * Math.exp(-since * 9),
            bob: since < 0.08 ? -1 : 0
        };
    }

    // A pixel line, for the laser and the antenna.
    function line(art, x0, y0, x1, y1, color, width) {
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), width || 1, 1);
        }
    }
    // A leg blade, tapering from `wide` pixels at the top to a point, with a lit left edge.
    function blade(art, x0, y0, x1, y1, wide) {
        for (let y = y0; y <= y1; y++) {
            const f = (y - y0) / (y1 - y0);
            const x = Math.round(x0 + (x1 - x0) * f);
            const w = Math.max(1, Math.round(wide * (1 - f * 0.75)));
            art.rect(turret.dark, x, y, w, 1);
            art.rect(turret.metal, x, y, 1, 1);
        }
    }
    // A shaded lens of shell, row by row: lit on the left, shading to a rim on the right. `inside` draws the
    // inner face of a swung-out panel instead: a dark cross-braced frame behind a white rim.
    function lens(art, cx, cy, rx, ry, inside) {
        for (let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++) {
            const v = (y - cy) / ry;
            const half = rx * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(v), 2.2)), 0.5);
            const left = Math.round(cx - half);
            const right = Math.round(cx + half);
            for (let x = left; x <= right; x++) {
                const u = (x - cx) / Math.max(1, half);
                let color;
                if (x === left || x === right) {
                    color = turret.rim;
                } else if (inside) {
                    color = x === left + 1 || x === right - 1 ? turret.mid : Math.abs(u + v * 0.9) < 0.2 || Math.abs(u - v * 0.9) < 0.2 ? turret.metal : turret.dark;
                } else if (u > 0.62) {
                    color = turret.shade;
                } else if (u > 0.2) {
                    color = turret.mid;
                } else if (u > -0.62 && u < -0.32 && v > -0.75 && v < 0.1) {
                    color = turret.white;
                } else {
                    color = turret.shell;
                }
                art.rect(color, x, y, 1, 1);
            }
        }
    }
    // A black gun block with two barrel holes facing forward.
    function guns(art, x, y, width) {
        art.rect(turret.darker, x, y, width, 12);
        art.rect(turret.metal, x, y, width, 1);
        [2, 7].forEach(function (dy) {
            art.rect(turret.metal, x + Math.floor(width / 2) - 1, y + dy, 3, 3);
            art.rect("#000000", x + Math.floor(width / 2), y + dy + 1, 1, 1);
        });
    }

    function drawTurret(art, s) {
        const cy = 50 + s.bob;
        const swing = Math.round(s.open * 7);
        const open = s.open > 0.15;
        // The back leg sits behind the body, and a hooked antenna sticks out of the top.
        blade(art, 50, cy + 8, 56, 93, 3);
        line(art, 41, cy - 25, 41, cy - 33, turret.seam);
        line(art, 41, cy - 33, 43, cy - 35, turret.seam);
        line(art, 43, cy - 35, 43, cy - 40, turret.seam);
        if (!open) {
            lens(art, 40, cy, 13, 25, false);
            for (let y = cy - 23; y <= cy + 23; y++) {
                if (Math.abs(y - (cy - 2)) > 5) {
                    art.rect(turret.seam, 35 + (y > cy + 12 ? 1 : 0), y, 1, 1);
                }
            }
            art.rect(turret.seam, 49, cy - 3, 4, 1);
        } else {
            // Opened: the side panels swing out on their gun blocks, showing the machinery in the core.
            guns(art, 26 - swing, cy - 7, 6 + swing);
            guns(art, 47, cy - 7, 6 + swing);
            lens(art, 24 - swing, cy, 5, 21, true);
            lens(art, 56 + swing, cy, 6, 22, false);
            art.rect(turret.seam, 57 + swing, cy - 3, 4, 1);
            lens(art, 38, cy, 10, 25, false);
            art.rect(turret.darker, 42, cy - 15, 6, 26);
            art.rect("#7f8456", 43, cy - 12, 4, 3);
            art.rect("#3d5a8a", 43, cy - 2, 3, 4);
            art.rect(turret.metal, 44, cy + 5, 3, 1);
            for (let y2 = cy - 22; y2 <= cy + 22; y2++) {
                if (Math.abs(y2 - (cy - 2)) > 5) {
                    art.rect(turret.seam, 37, y2, 1, 1);
                }
            }
        }
        art.rect(turret.ink, 38, cy + 24, 6, 1);
        art.rect(turret.ink, 44, cy + 25, 2, 1);
        // Front legs: a curved white cap on each, then a dark blade down to the floor.
        for (let pass = 0; pass < 2; pass++) {
            for (let i = 0; i <= 12; i++) {
                const f = i / 12;
                const cx = Math.round(35 - 12 * f);
                const cy2 = Math.round(cy + 17 + 7 * f * f);
                if (pass) {
                    art.rect(f < 0.5 ? turret.shell : turret.mid, cx, cy2, 3, 2);
                } else {
                    art.rect(turret.rim, cx - 1, cy2 - 1, 5, 4);
                }
            }
        }
        blade(art, 23, cy + 26, 17, 94, 4);
        art.rect(turret.rim, 43, cy + 21, 7, 8);
        art.rect(turret.shell, 44, cy + 22, 4, 6);
        art.rect(turret.mid, 48, cy + 22, 1, 6);
        blade(art, 44, cy + 29, 46, 95, 4);
        // The eye: a dark socket, a red iris that brightens as it talks, and a glint.
        const ex = open ? 37 : 35;
        const ey = cy - 2;
        art.ellipse(turret.ink, ex + 0.5, ey, 4, 4);
        art.alpha(0.4 * s.eye);
        art.ellipse(turret.glow, ex + 0.5, ey, 6, 6);
        art.alpha(1);
        art.ellipse(turret.iris, ex + 0.5, ey, 3, 3);
        art.ellipse(turret.eye, ex + 0.5, ey, 2, 2);
        art.alpha(s.eye);
        art.rect("#ffd2c4", ex, ey - 1, 1, 1);
        art.alpha(1);
        // The laser, swept across the floor while searching, or a flare straight at the reader.
        if (s.laser !== null) {
            art.alpha(0.55);
            if (s.laser === 0) {
                art.ellipse(turret.glow, ex + 0.5, ey, 8, 8);
            } else {
                line(art, ex, ey, ex + s.laser, 95, turret.eye);
            }
            art.alpha(1);
        }
    }

    function bubble(art, s) {
        if (s.p > s.talk + 1.6) {
            return;
        }
        const shown = s.line.text.slice(0, Math.ceil(s.line.text.length * Math.min(1, s.p / s.talk)));
        const lines = art.wrap(s.line.text, 66);
        const height = lines.length * 7 + 3;
        let used = 0;
        const width = Math.max.apply(null, lines.map(art.width)) + 6;
        const left = 40 - Math.ceil(width / 2);
        art.rect(turret.ink, left - 1, 1, width + 2, height + 2);
        art.rect(turret.white, left, 2, width, height);
        for (let tail = 0; tail < 3; tail++) {
            art.rect(tail === 2 ? turret.ink : turret.white, 31 - (2 - tail), height + 2 + tail, 5 - tail * 2 || 1, 1);
        }
        lines.forEach(function (text, i) {
            const visible = shown.slice(used, used + text.length);
            used += text.length + 1;
            art.text(visible, left + 3, 4 + i * 7, turret.ink);
        });
    }

    function draw(art, t) {
        const s = stateAt(t % sound.loop);
        drawTurret(art, s);
        bubble(art, s);
    }

    // Two portals on the edges of the page, and a companion cube flung from one to the other behind the text.
    function drawLayer(ctx, width, height, t) {
        const middle = height * 0.55;
        const phase = t % sound.flight;
        const now = t;
        function edgePortal(x, rim, deep) {
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = rim;
            ctx.shadowColor = rim;
            ctx.shadowBlur = 24;
            ctx.beginPath();
            ctx.ellipse(x, middle, 16, 74, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = deep;
            ctx.beginPath();
            ctx.ellipse(x, middle, 10, 64, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < 8; i++) {
                const angle = now * 2 + (i * Math.PI) / 4;
                ctx.globalAlpha = 0.5;
                ctx.fillRect(x + Math.cos(angle) * 6 - 1, middle + Math.sin(angle) * 54 - 2, 2, 4);
            }
            ctx.globalAlpha = 1;
        }
        edgePortal(width - 6, colors.blue, colors.blueDeep);
        edgePortal(6, colors.orange, colors.orangeDeep);

        const p = (phase - 0.6) / 2.4;
        if (p < 0 || p > 1) {
            return;
        }
        const x = width - 6 + (12 - width) * p;
        const y = middle - Math.sin(p * Math.PI) * height * 0.14;
        const size = 34;
        ctx.save();
        ctx.beginPath();
        ctx.rect(6, 0, width - 12, height);
        ctx.clip();
        ctx.translate(x, y);
        ctx.rotate(-p * Math.PI * 3);
        ctx.fillStyle = colors.edge;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = colors.cube;
        ctx.fillRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6);
        ctx.fillStyle = colors.corner;
        [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1]
        ].forEach(function (c) {
            ctx.fillRect((c[0] * size) / 2 - (c[0] > 0 ? 9 : 0), (c[1] * size) / 2 - (c[1] > 0 ? 9 : 0), 9, 9);
        });
        ctx.fillStyle = colors.face;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.heart;
        heart.forEach(function (row, dy) {
            for (let dx = 0; dx < 4; dx++) {
                if (row[dx] === "1") {
                    ctx.fillRect(-6 + dx * 3, -6 + dy * 3, 3, 3);
                }
            }
        });
        ctx.restore();
    }

    window.siteRuntime.spriteMode({
        mode: "portal",
        sprite: ".portal-sprite",
        draw,
        still: 6.3,
        fps: 25,
        layer: { className: "portal-edges", draw: drawLayer }
    });
})();