(function () {
    "use strict";
    // A top-down crime-sandbox chase: a red sports car laps a city block with a police cruiser on its tail, lights
    // flashing, while the wanted stars climb from one to five over each 8-second lap.
    const colors = {
        grass: "#3f7a3a",
        walk: "#9a9a92",
        walkLine: "#7d7d76",
        road: "#3a3a3e",
        dash: "#e8e2c8",
        roof: "#6b6f78",
        roofDark: "#50545c",
        vent: "#9aa5b1",
        pool: "#4fb3d9",
        tree: "#2f6b2f",
        treeLight: "#4f8f3f",
        car: "#d32f2f",
        carDark: "#8e1c1c",
        glass: "#9fd8ff",
        cop: "#f2f2f2",
        copDark: "#1b1d20",
        red: "#ff3b30",
        blue: "#3b82ff",
        star: "#ffd84a",
        starEmpty: "#3a3a3e",
        starEdge: "#10141c"
    };
    const LOOP = 8;
    // The lap follows the middle of the road around the block, clockwise from the top-left corner.
    const PATH = [[12, 14], [68, 14], [68, 82], [12, 82]];
    const SIDES = PATH.map(function (point, i) {
        const next = PATH[(i + 1) % PATH.length];
        return Math.abs(next[0] - point[0]) + Math.abs(next[1] - point[1]);
    });
    const LAP = SIDES.reduce(function (a, b) {
        return a + b;
    });

    function along(distance) {
        distance = ((distance % LAP) + LAP) % LAP;
        for (let i = 0; i < PATH.length; i++) {
            if (distance <= SIDES[i]) {
                const a = PATH[i];
                const b = PATH[(i + 1) % PATH.length];
                const f = distance / SIDES[i];
                return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, horizontal: a[1] === b[1] };
            }
            distance -= SIDES[i];
        }
        return { x: PATH[0][0], y: PATH[0][1], horizontal: true };
    }

    function drawCity(art) {
        art.rect(colors.grass, 0, 0, 80, 96);
        art.rect(colors.road, 4, 6, 72, 84);
        art.rect(colors.walk, 20, 22, 40, 52);
        art.rect(colors.walkLine, 20, 22, 40, 1);
        art.rect(colors.walkLine, 20, 73, 40, 1);
        art.rect(colors.roofDark, 22, 24, 36, 48);
        art.rect(colors.roof, 23, 25, 34, 46);
        art.rect(colors.vent, 27, 29, 6, 4);
        art.rect(colors.vent, 46, 58, 4, 6);
        art.rect(colors.pool, 38, 34, 14, 9);
        art.ellipse(colors.tree, 2, 2, 4, 4);
        art.ellipse(colors.tree, 78, 94, 4, 4);
        art.ellipse(colors.treeLight, 78, 93, 2, 2);
        for (let x = 10; x < 72; x += 8) {
            art.rect(colors.dash, x, 14, 4, 1);
            art.rect(colors.dash, x, 82, 4, 1);
        }
        for (let y = 20; y < 78; y += 8) {
            art.rect(colors.dash, 12, y, 1, 4);
            art.rect(colors.dash, 68, y, 1, 4);
        }
    }

    function drawCar(art, spot, body, dark, police, t) {
        const x = Math.round(spot.x);
        const y = Math.round(spot.y);
        const w = spot.horizontal ? 10 : 6;
        const h = spot.horizontal ? 6 : 10;
        art.rect(dark, x - w / 2, y - h / 2, w, h);
        art.rect(body, x - w / 2 + 1, y - h / 2 + 1, w - 2, h - 2);
        if (spot.horizontal) {
            art.rect(colors.glass, x - 1, y - h / 2 + 1, 2, h - 2);
        } else {
            art.rect(colors.glass, x - w / 2 + 1, y - 1, w - 2, 2);
        }
        if (police) {
            const flip = Math.floor(t * 8) % 2;
            art.rect(flip ? colors.red : colors.blue, x - 2, y - 1, 2, 2);
            art.rect(flip ? colors.blue : colors.red, x, y - 1, 2, 2);
            art.alpha(0.25);
            art.ellipse(flip ? colors.red : colors.blue, x, y, 9, 9);
            art.alpha(1);
        }
    }

    // A five-pointed star in a 5×5 box.
    function drawStar(art, x, y, lit) {
        const color = lit ? colors.star : colors.starEmpty;
        art.rect(colors.starEdge, x - 1, y - 1, 7, 7);
        art.rect(color, x + 2, y, 1, 1);
        art.rect(color, x, y + 1, 5, 1);
        art.rect(color, x + 1, y + 2, 3, 1);
        art.rect(color, x + 1, y + 3, 1, 1);
        art.rect(color, x + 3, y + 3, 1, 1);
        art.rect(color, x, y + 4, 1, 1);
        art.rect(color, x + 4, y + 4, 1, 1);
    }

    function draw(art, t) {
        const p = t % LOOP;
        const distance = (t / LOOP) * LAP;
        drawCity(art);
        drawCar(art, along(distance - 16), colors.cop, colors.copDark, true, t);
        drawCar(art, along(distance), colors.car, colors.carDark, false, t);
        const wanted = Math.min(5, 1 + Math.floor(p / 1.6));
        for (let i = 0; i < 5; i++) {
            drawStar(art, 47 + i * 6, 1, i < wanted && (i < wanted - 1 || Math.floor(t * 4) % 2 === 0));
        }
    }

    window.siteRuntime.spriteMode({
        mode: "gta",
        sprite: ".gta-sprite",
        draw,
        still: 7,
        fps: 20
    });
})();