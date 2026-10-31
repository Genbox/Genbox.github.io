(function () {
    "use strict";
    // A helmeted biker cruising a desert highway at sunset: mesas and cacti scroll past at different speeds,
    // the road dashes rush by and the bike jolts over a bump every couple of seconds.
    const colors = {
        sky: ["#2b1640", "#4a1f4f", "#7a2a50", "#b43c3c", "#e0623a", "#f28c38", "#ffb45a", "#ffd27a"],
        sun: "#ffe08a",
        mesaFar: "#5a2a46",
        mesaNear: "#3a1a30",
        sand: "#c2703d",
        sandDark: "#9a5530",
        cactus: "#2f4a2a",
        road: "#2b2a2e",
        roadEdge: "#4a4850",
        dash: "#f2c53d",
        tire: "#15151a",
        tireLight: "#3a3a42",
        rim: "#7d8590",
        chrome: "#c9ced5",
        engine: "#3d434d",
        fin: "#7d8590",
        frame: "#1b1b20",
        headlight: "#fff6c8",
        tail: "#ff3b30",
        tank: "#b3261e",
        tankLight: "#e04a3a",
        seat: "#1d1d22",
        jacket: "#1d1d22",
        jacketLight: "#3a3a42",
        jeans: "#2f4a7a",
        boot: "#2a1a12",
        helmet: "#2a2a30",
        helmetLight: "#4a4a55",
        visor: "#ffb45a",
        glove: "#3a2a1c",
        smoke: "#8f8a85"
    };

    // A straight stroke of size×size pixel dabs (1 by default).
    function brush(art, color, x0, y0, x1, y1, size) {
        size = size || 1;
        const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        const offset = Math.floor(size / 2);
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + (x1 - x0) * i / steps) - offset, Math.round(y0 + (y1 - y0) * i / steps) - offset, size, size);
        }
    }

    function drawSky(art) {
        colors.sky.forEach(function (color, i) {
            art.rect(color, 0, i * 8, 80, 8);
        });
        art.ellipse(colors.sun, 54, 60, 13, 13);
    }

    // Repeating silhouettes that scroll left at their own speed.
    function drawMesas(art, t) {
        const far = (t * 4) % 80;
        const near = (t * 10) % 80;
        for (let k = -1; k < 2; k++) {
            const x = Math.round(k * 80 - far);
            art.rect(colors.mesaFar, x + 4, 50, 22, 10);
            art.rect(colors.mesaFar, x + 8, 46, 14, 4);
            art.rect(colors.mesaFar, x + 46, 53, 26, 7);
            art.rect(colors.mesaFar, x + 52, 49, 12, 4);
        }
        for (let k = -1; k < 2; k++) {
            const x = Math.round(k * 80 - near);
            art.rect(colors.mesaNear, x + 26, 54, 18, 6);
            art.rect(colors.mesaNear, x + 30, 51, 9, 3);
        }
        art.rect(colors.sand, 0, 60, 80, 14);
        for (let k = -1; k < 2; k++) {
            const x = Math.round(k * 80 - (t * 30) % 80);
            art.rect(colors.sandDark, x + 10, 64, 6, 1);
            art.rect(colors.sandDark, x + 50, 68, 9, 1);
            art.rect(colors.sandDark, x + 32, 71, 4, 1);
            // A saguaro on the roadside.
            art.rect(colors.cactus, x + 64, 58, 2, 13);
            art.rect(colors.cactus, x + 61, 62, 2, 4);
            art.rect(colors.cactus, x + 61, 62, 1, 1);
            art.rect(colors.cactus, x + 67, 60, 2, 4);
        }
    }

    function drawRoad(art, t) {
        art.rect(colors.road, 0, 74, 80, 18);
        art.rect(colors.roadEdge, 0, 74, 80, 1);
        art.rect(colors.sand, 0, 92, 80, 4);
        const offset = (t * 60) % 20;
        for (let x = -20; x < 90; x += 20) {
            art.rect(colors.dash, Math.round(x - offset), 90, 10, 1);
        }
    }

    // A spoked wheel: fat tyre, chrome rim and six turning spokes.
    function drawWheel(art, cx, cy, t) {
        art.ellipse(colors.tire, cx, cy, 8, 8);
        art.ellipse(colors.tireLight, cx, cy - 1, 7, 7);
        art.ellipse(colors.tire, cx, cy, 7, 7);
        art.ellipse(colors.chrome, cx, cy, 5, 5);
        art.ellipse(colors.tire, cx, cy, 4, 4);
        const angle = -t * 14;
        for (let s = 0; s < 6; s++) {
            const a = angle + s * Math.PI / 3;
            brush(art, colors.rim, cx, cy, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4);
        }
        art.ellipse(colors.engine, cx, cy, 2, 2);
        art.rect(colors.chrome, cx, cy, 1, 1);
    }

    // A low chopper seen from the side, ridden by a helmeted biker sitting back with arms out to the bars.
    function drawBike(art, t) {
        // A jolt over a bump every 2 seconds.
        const y = t % 2 < 0.15 ? -1 : 0;
        const rear = [18, 82 + y];
        const front = [58, 82 + y];
        drawWheel(art, rear[0], rear[1], t);
        drawWheel(art, front[0], front[1], t);
        // Fenders hugging the tops of both wheels.
        for (let dx = -8; dx <= 8; dx++) {
            const top = Math.round(Math.sqrt(Math.max(0, 90 - dx * dx)));
            if (dx <= 4) {
                art.rect(colors.tank, rear[0] + dx, rear[1] - top, 1, 2);
            }
            if (dx >= -3 && dx <= 5) {
                art.rect(colors.tank, front[0] + dx, front[1] - top, 1, 2);
            }
        }
        art.rect(colors.tail, rear[0] - 9, rear[1] - 6, 2, 2);
        // Exhaust puffs drifting back, behind everything else.
        for (let i = 0; i < 4; i++) {
            const age = (t * 2 + i / 4) % 1;
            art.alpha(0.45 * (1 - age));
            art.ellipse(colors.smoke, 4 - age * 12, 84 - age * 5 + y, 1 + age * 3, 1 + age * 2);
        }
        art.alpha(1);
        // Twin exhaust pipes sweeping back under the frame.
        art.rect(colors.chrome, 6, 84 + y, 30, 2);
        art.rect(colors.rim, 6, 85 + y, 30, 1);
        art.rect(colors.chrome, 8, 81 + y, 26, 2);
        art.rect(colors.rim, 8, 82 + y, 26, 1);
        art.rect(colors.engine, 5, 84 + y, 2, 2);
        // Swingarm, frame rails, and a side cover with an oil-tank cap filling the space under the seat.
        brush(art, colors.frame, rear[0], rear[1], 34, 80 + y, 2);
        brush(art, colors.frame, 21, 70 + y, rear[0], rear[1], 2);
        art.rect(colors.frame, 21, 72 + y, 13, 9);
        art.rect(colors.engine, 22, 73 + y, 11, 7);
        art.rect(colors.fin, 22, 73 + y, 11, 1);
        art.ellipse(colors.chrome, 27, 76 + y, 2, 2);
        art.rect(colors.engine, 27, 76 + y, 1, 1);
        brush(art, colors.frame, 26, 72 + y, 50, 66 + y, 2);
        brush(art, colors.frame, 50, 67 + y, 42, 84 + y, 2);
        // The V-twin: a crankcase with two finned cylinders splayed apart.
        art.rect(colors.engine, 33, 79 + y, 12, 6);
        art.rect(colors.rim, 34, 80 + y, 4, 3);
        for (let row = 0; row < 8; row++) {
            const shade = row % 2 ? colors.fin : colors.chrome;
            art.rect(shade, 33 + Math.round(row * 0.4), 71 + row + y, 5, 1);
            art.rect(shade, 40 - Math.round(row * 0.4), 71 + row + y, 5, 1);
        }
        // Teardrop tank, seat with a sissy bar.
        art.ellipse(colors.tank, 42, 68 + y, 7, 3);
        art.rect(colors.tankLight, 38, 66 + y, 6, 1);
        art.rect(colors.chrome, 41, 69 + y, 3, 1);
        art.rect(colors.seat, 23, 69 + y, 12, 3);
        art.rect(colors.seat, 21, 66 + y, 3, 4);
        art.rect(colors.chrome, 20, 60 + y, 1, 9);
        // A long raked fork, headlight and pulled-back bars.
        brush(art, colors.chrome, 50, 64 + y, front[0], front[1], 2);
        art.rect(colors.engine, 49, 64 + y, 4, 3);
        art.ellipse(colors.chrome, 55, 65 + y, 3, 3);
        art.ellipse(colors.headlight, 56, 65 + y, 2, 2);
        brush(art, colors.chrome, 50, 64 + y, 46, 57 + y, 1);
        art.rect(colors.seat, 45, 56 + y, 3, 2);
        // The rider: jeans, boot on the peg, upright leather-jacketed torso, arms to the grips, full helmet.
        brush(art, colors.jeans, 28, 67 + y, 38, 70 + y, 4);
        brush(art, colors.jeans, 38, 70 + y, 41, 78 + y, 3);
        art.rect(colors.boot, 40, 77 + y, 5, 3);
        art.rect(colors.jacket, 23, 50 + y, 10, 18);
        art.rect(colors.jacketLight, 24, 51 + y, 2, 15);
        art.rect(colors.jacketLight, 23, 64 + y, 10, 1);
        brush(art, colors.jacket, 31, 53 + y, 45, 57 + y, 3);
        art.rect(colors.glove, 44, 55 + y, 3, 3);
        art.ellipse(colors.helmet, 29, 45 + y, 6, 6);
        art.rect(colors.helmetLight, 25, 41 + y, 4, 1);
        art.rect(colors.visor, 30, 44 + y, 6, 3);
        art.rect(colors.sun, 32, 44 + y, 2, 1);
        // Speed lines streaming past.
        art.alpha(0.5);
        for (let i = 0; i < 4; i++) {
            const lx = Math.round(((t * 90 + i * 23) % 100) - 20);
            art.rect(colors.sun, 80 - lx, 50 + i * 6, 6, 1);
        }
        art.alpha(1);
    }

    function draw(art, t) {
        drawSky(art);
        drawMesas(art, t);
        drawRoad(art, t);
        drawBike(art, t);
    }

    window.siteRuntime.spriteMode({
        mode: "fullthrottle",
        sprite: ".fullthrottle-sprite",
        draw,
        still: 0.5,
        fps: 20
    });
})();