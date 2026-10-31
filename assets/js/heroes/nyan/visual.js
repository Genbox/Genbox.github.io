(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.nyan;
    const readingFade = window.siteRuntime.readingFade;
    const rainbow = ["#ff1a1a", "#ff9a00", "#ffee00", "#33e000", "#0099ff", "#6633ff"];
    const colors = {
        ink: "#111111",
        fur: "#9a9a9a",
        crust: "#f5c58e",
        frosting: "#ff9ad5",
        sprinkle: "#ff3b9a",
        cheek: "#ff9ab0"
    };
    const sprinkles = [
        [9, 4],
        [14, 3],
        [19, 5],
        [11, 8],
        [16, 10],
        [9, 12],
        [13, 14],
        [20, 12]
    ];

    // An original rainbow cat: a grey head on a frosted toast body, paddling its legs and wagging its tail.
    // Drawn in a 34×20 box from (x, y); paddle is 0 or 1, alternating on each eighth note.
    function cat(art, x, y, paddle) {
        const swing = paddle ? 1 : -1;
        art.rect(colors.ink, x, y + 8 + swing, 7, 4);
        art.rect(colors.fur, x + 1, y + 9 + swing, 5, 2);
        [6, 10, 19, 23].forEach(function (lx, i) {
            const kick = i % 2 ? -swing : swing;
            art.rect(colors.ink, x + lx + kick, y + 16, 4, 5);
            art.rect(colors.fur, x + lx + kick + 1, y + 17, 2, 3);
        });
        art.rect(colors.ink, x + 4, y - 1, 22, 19);
        art.rect(colors.crust, x + 5, y, 20, 17);
        art.rect(colors.frosting, x + 7, y + 2, 16, 13);
        sprinkles.forEach(function (s) {
            art.rect(colors.sprinkle, x + s[0], y + s[1], 1, 1);
        });
        const hx = x + 18 + (paddle ? 1 : 0);
        art.rect(colors.ink, hx, y + 1, 4, 4);
        art.rect(colors.ink, hx + 10, y + 1, 4, 4);
        art.rect(colors.fur, hx + 1, y + 2, 2, 3);
        art.rect(colors.fur, hx + 11, y + 2, 2, 3);
        art.rect(colors.ink, hx, y + 4, 15, 12);
        art.rect(colors.fur, hx + 1, y + 5, 13, 10);
        art.rect(colors.ink, hx + 3, y + 7, 2, 2);
        art.rect(colors.ink, hx + 10, y + 7, 2, 2);
        art.rect("#ffffff", hx + 3, y + 7, 1, 1);
        art.rect("#ffffff", hx + 10, y + 7, 1, 1);
        art.rect(colors.cheek, hx + 1, y + 10, 2, 2);
        art.rect(colors.cheek, hx + 12, y + 10, 2, 2);
        art.rect(colors.ink, hx + 5, y + 12, 5, 1);
        art.rect(colors.ink, hx + 5, y + 11, 1, 1);
        art.rect(colors.ink, hx + 9, y + 11, 1, 1);
        art.rect(colors.ink, hx + 7, y + 10, 1, 1);
    }
    // Rainbow stripes from x0 to x1, waving by a pixel per segment; alphaAt fades the older end.
    function trail(art, x0, x1, y, stripe, segment, beat, alphaAt) {
        for (let x = x1 - segment, k = 0; x >= x0 - segment; x -= segment, k++) {
            const wave = (k + beat) % 2 ? stripe / 3 : 0;
            art.alpha(alphaAt ? alphaAt(x) : 1);
            rainbow.forEach(function (color, i) {
                art.rect(color, x, y + i * stripe + wave, segment, stripe);
            });
        }
        art.alpha(1);
    }
    // Across the page: every half loop the cat flies over at a new height, leaving a fading rainbow.
    let pageArt;
    function drawLayer(ctx, width, height, t) {
        pageArt = pageArt && pageArt.ctx === ctx ? pageArt : window.siteRuntime.pixels(ctx);
        const period = sound.loop / 2;
        const run = Math.floor(t / period);
        const local = t % period;
        const flight = 6.43;
        const beat = Math.floor(t / sound.eighth);
        const scale = 3;
        const seed = Math.sin(run * 91.7) * 1000;
        const height01 = 0.18 + (seed - Math.floor(seed)) * 0.6;
        const speed = (width + 240) / flight;
        const catX = -120 + speed * local;
        const catY = Math.round(height * height01);
        ctx.save();
        ctx.scale(scale, scale);
        const x = Math.round(catX / scale);
        const y = Math.round(catY / scale);
        trail(pageArt, -60, x + 6, y, 3, 8, beat, function (segmentX) {
            const age = ((x - segmentX) * scale) / speed;
            return Math.max(0, 1 - age / 1.75) * readingFade(segmentX * scale, width) * 0.9;
        });
        if (local < flight + 1) {
            cat(pageArt, x, y - 1 - beat % 2, beat % 2);
        }
        ctx.restore();
    }

    window.siteRuntime.spriteMode({
        mode: "nyan",
        still: 1,
        fps: 24,
        layer: { className: "nyan-trail", draw: drawLayer }
    });
})();