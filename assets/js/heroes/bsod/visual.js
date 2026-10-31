(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.bsod;
    const colors = {
        case: "#d8d2c0",
        caseShade: "#a9a290",
        ink: "#1b1b1b",
        blue: "#0000aa",
        grey: "#aaaaaa",
        white: "#ffffff",
        teal: "#008080",
        navy: "#000080",
        silver: "#c0c0c0"
    };
    const arrow = ["1000", "1100", "1210", "1221", "1210", "0110"];

    function cursor(art, x, y) {
        arrow.forEach(function (row, dy) {
            for (let dx = 0; dx < row.length; dx++) {
                if (row[dx] !== "0") {
                    art.rect(row[dx] === "1" ? colors.ink : colors.white, x + dx, y + dy, 1, 1);
                }
            }
        });
    }
    function desktopWindow(art, x, y) {
        art.rect(colors.ink, x, y, 30, 20);
        art.rect(colors.silver, x, y, 29, 19);
        art.rect(colors.navy, x + 1, y + 1, 27, 4);
        art.rect(colors.silver, x + 24, y + 2, 3, 2);
        art.rect(colors.white, x + 2, y + 6, 25, 11);
        for (let line = 0; line < 3; line++) {
            art.rect("#7a7a7a", x + 4, y + 8 + line * 3, line === 2 ? 12 : 20, 1);
        }
    }

    // The screen, cycling crash → self-test → desktop → freeze in time with the soundtrack.
    function drawScreen(art, t) {
        const left = 10;
        const top = 10;
        const width = 60;
        const height = 44;
        if (t < sound.reboot) {
            art.rect(colors.blue, left, top, width, height);
            art.rect(colors.grey, 31, 13, 18, 7);
            art.text("BLOG", 32, 14, colors.blue);
            ["A FATAL ERROR", "HAS OCCURRED.", "", "PRESS ANY KEY"].forEach(function (line, i) {
                art.text(line, 13, 24 + i * 7, colors.white);
            });
            if (Math.floor(t * 2.5) % 2 === 0) {
                art.rect(colors.white, 15 + art.width("PRESS ANY KEY"), 49, 3, 1);
            }
        } else if (t < sound.chime) {
            const test = t - sound.reboot;
            art.rect("#000000", left, top, width, height);
            art.text("BIOS OK", 13, 13, colors.grey);
            art.text("RAM " + ("000" + Math.min(640, Math.floor(test * 480))).slice(-4) + "K", 13, 20, colors.grey);
            if (test > 1.4) {
                art.text("OK", 58, 20, colors.white);
            }
            if (test > 1.6) {
                art.text("BOOTING...", 13, 30, colors.grey);
            }
        } else {
            // The desktop, then a freeze that smears the window across the screen.
            art.rect(colors.teal, left, top, width, height);
            art.rect(colors.silver, left, top + height - 5, width, 5);
            art.rect(colors.white, left, top + height - 5, width, 1);
            art.rect(colors.ink, left + 1, top + height - 4, 9, 3);
            art.rect(colors.silver, left + 1, top + height - 4, 8, 2);
            const d = Math.min(t, sound.stutter) - sound.chime;
            const wx = Math.round(22 + Math.sin(d * 0.9) * 8);
            const wy = Math.round(18 + Math.cos(d * 0.7) * 4);
            if (t >= sound.stutter) {
                for (let smear = 0; smear < 14; smear++) {
                    const s = sound.stutter - sound.chime + (Math.min(t - sound.stutter, 2) * smear) / 7;
                    desktopWindow(art, Math.round(22 + Math.sin(s * 0.9) * 8 + smear * 1.2), Math.round(18 + Math.cos(s * 0.7) * 4));
                }
            } else {
                desktopWindow(art, wx, wy);
            }
            cursor(art, Math.round(left + 30 + Math.sin(d * 1.3) * 22), Math.round(top + 18 + Math.sin(d * 0.8) * 14));
        }
    }

    function draw(art, t) {
        t %= sound.loop;
        art.rect(colors.ink, 3, 3, 74, 60);
        art.rect(colors.case, 4, 4, 72, 58);
        art.rect("#ece7d8", 4, 4, 72, 1);
        art.rect(colors.caseShade, 4, 58, 72, 4);
        art.rect("#3a3a3a", 8, 8, 64, 48);
        drawScreen(art, t);
        art.alpha(0.12);
        for (let line = 10; line < 54; line += 2) {
            art.rect("#000000", 10, line, 60, 1);
        }
        art.alpha(1);
        art.rect(t < sound.reboot || t >= sound.chime ? "#3ddc4a" : "#e0b020", 68, 59, 3, 2);
        art.rect(colors.caseShade, 30, 63, 20, 6);
        art.rect(colors.ink, 18, 69, 44, 6);
        art.rect(colors.case, 19, 69, 42, 5);
        // The beige box under the monitor, with a drive light that chatters through the self-test.
        art.rect(colors.ink, 6, 76, 68, 16);
        art.rect(colors.case, 7, 76, 66, 15);
        art.rect(colors.caseShade, 12, 80, 26, 3);
        art.rect(colors.caseShade, 12, 85, 26, 3);
        const busy = t >= sound.reboot && t < sound.chime && Math.floor(t * 13) % 3 !== 0;
        art.rect(busy ? "#ff9a20" : "#5a4630", 62, 81, 4, 2);
    }

    let wasOn = false;
    function toggle(on) {
        if (on && !wasOn) {
            window.siteRuntime.bsodScreen.show();
        }
        if (!on) {
            window.siteRuntime.bsodScreen.dismiss();
        }
        wasOn = on;
    }

    window.siteRuntime.spriteMode({
        mode: "bsod",
        sprite: ".bsod-sprite",
        draw,
        still: 2,
        fps: 20,
        toggle
    });
})();