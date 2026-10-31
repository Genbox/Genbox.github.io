(function () {
    "use strict";

    // Page-wide code rain: columns of glyphs falling behind the content, dimmed over the reading column.
    // The canvas is mirrored in CSS, so the glyphs read backwards like the film's.
    let columns = [];
    let height = 0;
    let previous = null;
    const CELL = 16;
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ012345789Z:.=*+-<>¦";
    function glyph() {
        return glyphs[Math.floor(Math.random() * glyphs.length)];
    }
    function newColumn(column, scatter) {
        column.speed = 5 + Math.random() * 13;
        column.length = 8 + Math.floor(Math.random() * 18);
        column.head = scatter ? Math.random() * (height / CELL + column.length) : -Math.random() * 20;
        column.cells = [];
        for (let i = 0; i < column.length; i++) {
            column.cells.push(glyph());
        }
        return column;
    }
    // One column per cell across the window, kept as the window resizes.
    function fitColumns(width, newHeight) {
        height = newHeight;
        const count = Math.ceil(width / CELL);
        columns = columns.slice(0, count);
        while (columns.length < count) {
            columns.push(newColumn({}, true));
        }
    }
    function drawRain(ctx, width, newHeight, t) {
        if (columns.length !== Math.ceil(width / CELL) || height !== newHeight) {
            fitColumns(width, newHeight);
        }
        // The rain moves by the time since the last frame, and stands still for reduced motion.
        const step = previous === null || t < previous ? 0 : Math.min(0.1, t - previous);
        previous = t;
        ctx.font = CELL - 2 + "px monospace";
        ctx.textAlign = "center";
        const reading = Math.min(width, 1180) / 2 - 30;
        const middle = width / 2;
        columns.forEach(function (column, index) {
            column.head += column.speed * step;
            if ((column.head - column.length) * CELL > height) {
                newColumn(column, false);
            }
            if (step && Math.random() < 0.05) {
                column.cells[Math.floor(Math.random() * column.length)] = glyph();
            }
            const x = index * CELL + CELL / 2;
            const fade = Math.abs(x - middle) < reading ? 0.3 : 1;
            for (let i = 0; i < column.length; i++) {
                const y = Math.floor(column.head - i) * CELL;
                if (y < -CELL || y > height + CELL) {
                    continue;
                }
                ctx.globalAlpha = (i === 0 ? 0.95 : 0.6 * (1 - i / column.length)) * fade;
                ctx.fillStyle = i === 0 ? "#d9ffe2" : i < 3 ? "#5cf58c" : "#18b24a";
                ctx.fillText(column.cells[(i + Math.floor(column.head)) % column.length], x, y);
            }
        });
        ctx.globalAlpha = 1;
    }

    // Neo, posed from a small skeleton on an 80×96 canvas, then snapped to a fixed palette with hard alpha so
    // every angle of the lean stays crisp pixel art.
    const body = document.createElement("canvas");
    body.width = 80;
    body.height = 96;
    const bodyCtx = body.getContext("2d", { willReadFrequently: true });
    const palette = [
        [8, 11, 9],
        [24, 33, 28],
        [40, 70, 51],
        [38, 44, 41],
        [70, 86, 78],
        [214, 168, 130],
        [160, 118, 92],
        [125, 255, 168]
    ];
    const tone = {
        coat: "rgb(24,33,28)",
        rim: "rgb(40,70,51)",
        suit: "rgb(38,44,41)",
        black: "rgb(8,11,9)",
        skin: "rgb(214,168,130)",
        skinShade: "rgb(160,118,92)",
        glint: "rgb(125,255,168)"
    };
    const edgeLight = [54, 128, 79];
    // Shots ring out with the soundtrack; Neo anticipates the near-hit bullet-time transition by 0.3 seconds.
    const SHOTS = [
        { at: 1, y: 41 },
        { at: 1.125, y: 47 },
        { at: 1.25, y: 53 }
    ];
    const LOOP = 8;
    const BULLET_START_X = 86;
    const APPROACH_SPEED = 32;
    const DODGE_X = 48;
    const SLOW_START = SHOTS[0].at + (BULLET_START_X - DODGE_X) / APPROACH_SPEED;
    const DODGE_DURATION = 0.45;
    const SLOW_END = 5;

    function ease(x) {
        x = Math.min(1, Math.max(0, x));
        return x * x * (3 - 2 * x);
    }
    function leanAt(t) {
        const dodgeStart = SLOW_START - 0.3;
        if (t < dodgeStart) {
            return 0;
        }
        if (t < dodgeStart + DODGE_DURATION) {
            return ease((t - dodgeStart) / DODGE_DURATION);
        }
        if (t < SLOW_END) {
            return 1;
        }
        return 1 - ease((t - SLOW_END) / 0.7);
    }
    function from(point, length, angle) {
        return { x: point.x + Math.sin(angle) * length, y: point.y - Math.cos(angle) * length };
    }
    function limb(points, thickness, color) {
        bodyCtx.strokeStyle = color;
        bodyCtx.lineWidth = thickness;
        bodyCtx.lineCap = bodyCtx.lineJoin = "round";
        bodyCtx.beginPath();
        bodyCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            bodyCtx.lineTo(points[i].x, points[i].y);
        }
        bodyCtx.stroke();
    }
    function polygon(points, color) {
        bodyCtx.fillStyle = color;
        bodyCtx.beginPath();
        points.forEach(function (p, i) {
            if (i) {
                bodyCtx.lineTo(p.x, p.y);
            } else {
                bodyCtx.moveTo(p.x, p.y);
            }
        });
        bodyCtx.fill();
    }

    function drawNeo(t) {
        const lean = leanAt(t);
        const breathe = lean ? 0 : Math.round(Math.sin(t * 2) * 0.5);
        const flail = Math.sin(t * 5) * 0.25 * lean;
        const flutter = Math.sin(t * 7) * (1 + 3 * lean);
        bodyCtx.clearRect(0, 0, 80, 96);
        // Feet stay planted; the knees push forward while the torso folds back almost flat.
        const legs = [
            { x: 37, y: 90 },
            { x: 46, y: 90 }
        ].map(function (ankle, i) {
            const knee = from(ankle, 14, lean * (0.85 - i * 0.15));
            return {ankle, knee, hip: from(knee, 14, -lean * 0.3 + (i ? -0.08 : 0.08)) };
        });
        const hip = {
            x: (legs[0].hip.x + legs[1].hip.x) / 2,
            y: (legs[0].hip.y + legs[1].hip.y) / 2 + breathe
        };
        const spine = -lean * 1.3;
        const shoulder = from(hip, 24, spine);
        const head = from(shoulder, 8, spine * 1.04);
        const across = { x: Math.cos(spine) * 6, y: Math.sin(spine) * 6 };
        // Arms hang at the sides, then swing back past the hips (angles run clockwise from straight up).
        const arm = function (side) {
            const hang = Math.PI - 0.12 + side * 0.18;
            const thrown = 2 * Math.PI - 1.9 - side * 0.35 + flail * (side ? 1 : -1);
            const swing = hang + (thrown - hang) * lean;
            const elbow = from(shoulder, 10, swing);
            return [shoulder, elbow, from(elbow, 9, swing + lean * (0.5 + flail) - 0.1 * (1 - lean))];
        };

        limb(arm(1), 4, tone.coat);
        // The long coat hangs from the shoulders and swings down and back from the hips.
        polygon(
            [
                { x: shoulder.x - across.x, y: shoulder.y - across.y },
                { x: shoulder.x + across.x, y: shoulder.y + across.y },
                { x: hip.x + 5, y: hip.y },
                { x: hip.x + 10 + lean * 2, y: hip.y + 23 - lean * 2 },
                { x: hip.x - 12 - lean * 14 + flutter, y: hip.y + 24 - lean * 5 },
                { x: hip.x - 5, y: hip.y }
            ],
            tone.coat
        );
        legs.forEach(function (leg) {
            limb([leg.hip, leg.knee, leg.ankle], 5, tone.suit);
            limb([leg.ankle, { x: leg.ankle.x + 5, y: leg.ankle.y }], 3, tone.black);
        });
        limb([hip, shoulder], 9, tone.suit);
        limb(
            [
                { x: hip.x + across.x * 0.6, y: hip.y + across.y * 0.6 },
                { x: shoulder.x + across.x, y: shoulder.y + across.y }
            ],
            3,
            tone.coat
        );
        // Tailored lapels, a high collar, and silver coat seams follow the torso.
        const collar = from(shoulder, 3, spine);
        polygon([{ x: shoulder.x - across.x, y: shoulder.y - across.y }, from(collar, 4, spine - Math.PI / 2), from(hip, 10, spine)], tone.black);
        polygon([{ x: shoulder.x + across.x, y: shoulder.y + across.y }, from(collar, 3, spine + Math.PI / 2), from(hip, 8, spine)], tone.rim);
        limb([from(hip, 3, spine - Math.PI / 2), from(shoulder, 4, spine - Math.PI / 2)], 1, "rgb(70,86,78)");
        // Two separate coat tails flare behind the legs during the dodge.
        polygon(
            [
                { x: hip.x - 3, y: hip.y + 1 },
                { x: hip.x - 5, y: hip.y + 17 },
                { x: hip.x - 13 - lean * 12 + flutter, y: hip.y + 23 - lean * 5 },
                { x: hip.x - 8, y: hip.y + 8 }
            ],
            tone.black
        );
        limb(
            [
                { x: hip.x - 8, y: hip.y + 8 },
                { x: hip.x - 13 - lean * 12 + flutter, y: hip.y + 23 - lean * 5 }
            ],
            1,
            tone.rim
        );

        // Angular face and slicked-back hair, drawn in local coordinates so the
        // sunglasses and jaw stay coherent throughout the bullet-time lean.
        bodyCtx.save();
        bodyCtx.translate(Math.round(head.x), Math.round(head.y));
        bodyCtx.rotate(spine);
        polygon(
            [
                { x: -4, y: -5 },
                { x: 3, y: -5 },
                { x: 5, y: -2 },
                { x: 5, y: 3 },
                { x: 2, y: 6 },
                { x: -2, y: 5 },
                { x: -4, y: 2 }
            ],
            tone.skin
        );
        polygon(
            [
                { x: -4, y: -2 },
                { x: -1, y: 1 },
                { x: 0, y: 5 },
                { x: 2, y: 6 },
                { x: -2, y: 5 },
                { x: -4, y: 2 }
            ],
            tone.skinShade
        );
        polygon(
            [
                { x: -5, y: 0 },
                { x: -5, y: -5 },
                { x: -2, y: -8 },
                { x: 3, y: -7 },
                { x: 5, y: -4 },
                { x: 2, y: -4 },
                { x: 0, y: -5 },
                { x: -3, y: -3 },
                { x: -3, y: 1 }
            ],
            tone.black
        );
        limb(
            [
                { x: -3, y: -6 },
                { x: 1, y: -6 },
                { x: 3, y: -5 }
            ],
            1,
            "rgb(70,86,78)"
        );
        bodyCtx.fillStyle = tone.black;
        bodyCtx.fillRect(-3, -1, 4, 2);
        bodyCtx.fillRect(2, -1, 4, 2);
        bodyCtx.fillRect(0, -1, 3, 1);
        bodyCtx.fillStyle = tone.skinShade;
        bodyCtx.fillRect(3, 2, 2, 1);
        bodyCtx.fillRect(1, 4, 3, 1);
        bodyCtx.fillStyle = tone.glint;
        bodyCtx.fillRect(3, -1, 2, 1);
        bodyCtx.restore();
        limb(arm(0), 5, tone.coat);
        const hand = arm(0)[2];
        limb([hand, from(hand, 2, Math.PI * 0.5 + spine)], 3, tone.skin);
        limb([arm(0)[0], arm(0)[1]], 1, tone.rim);

        // Snap every pixel to the palette with hard edges.
        const image = bodyCtx.getImageData(0, 0, 80, 96);
        const data = image.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 110) {
                data[i + 3] = 0;
                continue;
            }
            let best = 0;
            let distance = Infinity;
            for (let c = 0; c < palette.length; c++) {
                const d = Math.pow(data[i] - palette[c][0], 2) + Math.pow(data[i + 1] - palette[c][1], 2) + Math.pow(data[i + 2] - palette[c][2], 2);
                if (d < distance) {
                    distance = d;
                    best = c;
                }
            }
            data[i] = palette[best][0];
            data[i + 1] = palette[best][1];
            data[i + 2] = palette[best][2];
            data[i + 3] = 255;
        }
        // Green light from the code catches every outer edge of the dark clothes, so the silhouette reads.
        const solid = function (x, y) {
            return x >= 0 && y >= 0 && x < 80 && y < 96 && data[(y * 80 + x) * 4 + 3] > 0;
        };
        const edges = [];
        for (let y = 0; y < 96; y++) {
            for (let x = 0; x < 80; x++) {
                const at = (y * 80 + x) * 4;
                if (!data[at + 3] || data[at] > 150) {
                    continue;
                }
                if (!solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1)) {
                    edges.push(at);
                }
            }
        }
        edges.forEach(function (at) {
            data[at] = edgeLight[0];
            data[at + 1] = edgeLight[1];
            data[at + 2] = edgeLight[2];
        });
        bodyCtx.putImageData(image, 0, 0);
    }

    // Bullets fly in fast, crawl through bullet time trailing rippling air, then whip away.
    function bulletX(shot, t) {
        if (t < shot.at) {
            return null;
        }
        let x = BULLET_START_X - APPROACH_SPEED * (Math.min(t, SLOW_START) - shot.at);
        if (t > SLOW_START) {
            x -= 14 * (Math.min(t, SLOW_END) - SLOW_START);
        }
        if (t > SLOW_END) {
            x -= 160 * (t - SLOW_END);
        }
        return x > -10 ? x : null;
    }
    function drawBullets(art, t) {
        function pixel(color, x, y, w, h) {
            art.rect(color, Math.round(x), Math.round(y), w || 1, h || 1);
        }
        SHOTS.forEach(function (shot) {
            const x = bulletX(shot, t);
            if (x === null) {
                return;
            }
            const slow = t >= SLOW_START && t < SLOW_END;
            // Rings of disturbed air left behind at even spacing, widening and fading.
            for (let ring = 1; ring <= 4 && slow; ring++) {
                const rx = x + ring * 7;
                const age = ring / 5;
                const radius = 2 + age * 4;
                art.alpha(0.4 * (1 - age));
                for (let a = 0; a < 20; a++) {
                    const angle = (a / 20) * Math.PI * 2;
                    pixel("#bfffd4", rx + Math.cos(angle) * radius * 0.45, shot.y + Math.sin(angle) * radius);
                }
            }
            art.alpha(slow ? 0.35 : 0.6);
            pixel("#d8ffe4", x + 3, shot.y, slow ? 10 : 18, 1);
            art.alpha(1);
            pixel("#e8c26a", x, shot.y, 3, 1);
            pixel("#fff1bd", x, shot.y, 1, 1);
            pixel("#9a7130", x + 2, shot.y, 1, 1);
        });
    }

    function drawScene(art, t) {
        t %= LOOP;
        drawNeo(t);
        // A rooftop ledge with a faint green glow from the code below.
        art.alpha(0.25);
        art.rect("#2ee66b", 4, 92, 72, 1);
        art.alpha(1);
        art.rect("#0d1a12", 4, 93, 72, 3);
        art.ctx.imageSmoothingEnabled = false;
        art.ctx.drawImage(body, 0, 0);
        drawBullets(art, t);
    }

    function toggle(active) {
        if (!active) {
            previous = null;
        }
    }

    window.siteRuntime.spriteMode({
        mode: "matrix",
        sprite: ".matrix-sprite",
        draw: drawScene,
        layer: { className: "matrix-rain", draw: drawRain },
        toggle,
        still: 3,
        fps: 20
    });
})();