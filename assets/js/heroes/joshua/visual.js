(function () {
    "use strict";
    // Scholar's Mate: 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#.
    // Each half-move lasts three seconds, followed by a six-second checkmate pause.
    const chessMoves = ["E2-E4", "E7-E5", "F1-C4", "B8-C6", "D1-H5", "G8-F6", "H5XF7"];
    const moveSeconds = 3;
    const mateSeconds = 6;

    function draw(art, t) {
        const ctx = art.ctx;
        const rect = art.rect;
        function text(label, x, y, color, size) {
            ctx.fillStyle = color;
            ctx.font = "bold " + size + "px monospace";
            ctx.fillText(label, x, y);
        }
        // Steel mainframe cabinet, recessed light banks and a sloping operator console.
        rect("#090c10", 4, 87, 73, 5);
        rect("#28333d", 66, 13, 9, 71);
        rect("#56616a", 10, 9, 56, 75);
        rect("#b0b6b7", 10, 9, 56, 3);
        rect("#879095", 10, 12, 3, 69);
        rect("#394650", 63, 12, 3, 69);
        for (let vent = 0; vent < 10; vent++) {
            rect("#141c25", 69, 24 + vent * 5, 4, 2);
        }
        rect("#252e36", 16, 15, 44, 9);
        text("Joshua", 23, 22, "#d6d8cb", 7);
        for (let bank = 0; bank < 3; bank++) {
            const top = 28 + bank * 14;
            rect("#222730", 16, top, 44, 12);
            rect("#111921", 17, top + 1, 42, 10);
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 10; col++) {
                    const n = bank * 30 + row * 10 + col;
                    const on = Math.sin(n * 13.7 + Math.floor(t * (bank + 3)) * 2.1) > -0.1;
                    const color = col < 3 ? "#ff8377" : col < 7 ? "#ffd08b" : "#e6c8b9";
                    // Lit lights bleed a soft halo onto the panel.
                    if (on) {
                        ctx.globalAlpha = 0.22;
                        rect(color, 18 + col * 4, top + 1 + row * 3, 4, 4);
                        ctx.globalAlpha = 1;
                    }
                    rect(on ? color : "#453637", 19 + col * 4, top + 2 + row * 3, 2, 2);
                }
            }
        }
        rect("#969d9c", 7, 71, 60, 3);
        rect("#758389", 5, 74, 62, 8);
        rect("#434e57", 5, 82, 62, 7);
        rect("#1b2731", 9, 76, 25, 5);
        const gameTime = t % (chessMoves.length * moveSeconds + mateSeconds);
        const move = Math.floor(gameTime / moveSeconds);
        text(move < chessMoves.length ? chessMoves[move] : "CHECKMATE", 11, 80, "#91f4c1", 4);
        for (let key = 0; key < 12; key++) {
            rect("#c4c6ba", 39 + (key % 6) * 4, 76 + Math.floor(key / 6) * 3, 3, 2);
        }
        rect("#161e26", 10, 89, 8, 3);
        rect("#161e26", 56, 89, 8, 3);
        // Green terminal-like readout above the machine cycles through game states.
        text("SHALL WE PLAY?", 11, 5, "#75dba9", 5);
        // Data bits drift up from the console screen and fade over the lower light bank.
        for (let bit = 0; bit < 14; bit++) {
            const life = (t * (0.18 + (bit % 4) * 0.05) + bit * 0.271) % 1;
            ctx.globalAlpha = Math.sin(life * Math.PI) * 0.85;
            rect(bit % 3 ? "#91f4c1" : "#d8ffe9", 11 + (bit * 7) % 22 + Math.round(Math.sin(t * 1.3 + bit)), Math.round(75 - life * 22), 1, bit % 2 ? 2 : 1);
        }
        // A CRT scanline sweeps down the cabinet every few seconds.
        ctx.globalAlpha = 0.14;
        rect("#c8ffe0", 10, 9 + Math.round(((t % 3.5) / 3.5) * 80), 56, 1);
        ctx.globalAlpha = 1;
    }

    window.siteRuntime.spriteMode({ mode: "joshua", sprite: ".joshua-sprite", draw, still: 0, fps: 7 });
})();