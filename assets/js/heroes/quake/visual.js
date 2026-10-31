(function () {
    "use strict";
    // A rusty gothic arena: an iron emblem turns over its pedestal above a bubbling lava pit.
    const colors = {
        wall: "#3b2f26",
        wallDark: "#2a211b",
        rivet: "#6b5a48",
        rust: "#7a4a2a",
        rune: "#4a3a2e",
        pedestal: "#5a4a3c",
        pedestalLight: "#7a6650",
        iron: "#8a7a6a",
        ironBack: "#6b5d50",
        ironDark: "#2a221c",
        engraving: "#3a2e24",
        rivetLight: "#c9b8a0",
        lava: "#c8441a",
        lavaHot: "#ffb347"
    };
    function drawArena(art, t) {
        art.rect(colors.wall, 0, 0, 80, 88);
        for (let y = 0; y < 88; y += 16) {
            art.rect(colors.wallDark, 0, y, 80, 1);
            for (let x = 0; x < 80; x += 20) {
                art.rect(colors.wallDark, x, y, 1, 16);
                art.rect(colors.rivet, x + 2, y + 2, 1, 1);
                art.rect(colors.rivet, x + 17, y + 2, 1, 1);
                art.rect(colors.rust, x + 6 + (y % 32 ? 5 : 0), y + 9, 3, 2);
            }
        }
        // A carved rune glows faintly on the back wall.
        art.alpha(0.4 + Math.sin(t * 2) * 0.15);
        art.rect(colors.rune, 36, 12, 9, 1);
        art.rect(colors.rune, 40, 8, 1, 12);
        art.rect(colors.rune, 37, 18, 7, 1);
        art.alpha(1);
        // The lava pit, bubbling.
        art.rect(colors.lava, 0, 88, 80, 8);
        for (let i = 0; i < 5; i++) {
            const age = (t * 0.8 + i * 0.37) % 1;
            art.alpha(1 - age);
            art.rect(colors.lavaHot, (i * 17 + 5) % 80, 89 + Math.round((1 - age) * 3), 2, 1);
        }
        art.alpha(1);
        art.rect(colors.lavaHot, 0, 88, 80, 1);
    }

    // An original rusted-iron emblem: a hexagonal plate with an engraved triangle and corner rivets, turning
    // slowly about its vertical axis. Its thickness shows as a dark edge while it is side-on.
    function drawEmblem(art, t) {
        art.rect(colors.pedestal, 31, 74, 18, 14);
        art.rect(colors.pedestalLight, 31, 74, 18, 2);
        art.rect(colors.pedestal, 34, 70, 12, 4);
        const cy = Math.round(50 + Math.sin(t * 2) * 2);
        const turn = Math.cos(t * 1.6);
        const face = Math.abs(turn);
        const r = 13;
        const edge = Math.round((1 - face) * 3);
        for (let y = -r; y <= r; y++) {
            const full = Math.abs(y) <= r / 2 ? r * 0.866 : (r - Math.abs(y)) * 1.732;
            const half = Math.max(0.5, full * face);
            const left = Math.round(40 - half);
            const width = Math.max(1, Math.round(half * 2));
            art.rect(colors.ironDark, left - (turn > 0 ? edge : 0), cy + y, width + edge, 1);
            art.rect(turn > 0 ? colors.iron : colors.ironBack, left, cy + y, width, 1);
            if (Math.abs(y) === r || Math.abs(Math.abs(y) - r / 2) < 0.5) {
                art.rect(colors.ironDark, left, cy + y, width, 1);
            }
        }
        if (face < 0.3) {
            return;
        }
        // The engraving and rivets, squeezed by the turn.
        for (let y = -5; y <= 4; y++) {
            const half = 6 * (4 - y) / 9 * face;
            art.rect(colors.engraving, Math.round(40 - half), cy + y, Math.max(1, Math.round(half * 2)), 1);
            if (half > 1.5) {
                art.rect(turn > 0 ? colors.iron : colors.ironBack, Math.round(40 - half + 1.5 * face), cy + y, Math.max(0, Math.round(half * 2 - 3 * face)), 1);
            }
        }
        [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(function (rivet) {
            art.rect(colors.rivetLight, Math.round(40 + rivet[0] * face), cy + rivet[1], 1, 1);
        });
        art.rect(colors.rust, Math.round(40 + 4 * turn), cy + 9, 2, 1);
        art.rect(colors.rust, Math.round(40 - 6 * turn), cy - 9, 1, 2);
    }

    function draw(art, t) {
        drawArena(art, t);
        drawEmblem(art, t);
    }

    window.siteRuntime.spriteMode({
        mode: "quake",
        sprite: ".quake-sprite",
        draw,
        still: 0,
        fps: 20
    });
})();