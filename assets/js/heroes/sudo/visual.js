(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.sudo;
    const colors = {
        frame: "#3a4048",
        screen: "#0d1114",
        bar: "#2a2f36",
        text: "#c9d1d9",
        prompt: "#6ee7b7",
        refused: "#ff7b72",
        okay: "#6ee7b7",
        plate: "#f4f4f4",
        plateRim: "#b9c0c7"
    };
    // The sandwich, bottom to top: each layer's height and how to draw it across x 20–60.
    const layers = [
        {
            height: 5,
            draw(art, y) {
                art.rect("#a86f32", 20, y, 40, 5);
                art.rect("#d9a35e", 21, y, 38, 4);
                art.rect("#f0c98a", 21, y, 38, 1);
            }
        },
        {
            height: 3,
            draw(art, y) {
                art.rect("#4e9a36", 18, y, 44, 3);
                art.rect("#6fbf4a", 19, y, 42, 2);
                for (let x = 18; x < 62; x += 4) {
                    art.rect("#4e9a36", x, y + 3, 2, 1);
                }
            }
        },
        {
            height: 3,
            draw(art, y) {
                art.rect("#b8322a", 21, y, 38, 3);
                art.rect("#e04b3a", 21, y, 38, 2);
                for (let x = 24; x < 58; x += 8) {
                    art.rect("#ff8a74", x, y, 3, 1);
                }
            }
        },
        {
            height: 2,
            draw(art, y) {
                art.rect("#ffd23f", 19, y, 42, 2);
                [24, 41, 55].forEach(function (x) {
                    art.rect("#ffd23f", x, y + 2, 2, 2);
                    art.rect("#ffd23f", x, y + 4, 1, 1);
                });
            }
        },
        {
            height: 3,
            draw(art, y) {
                art.rect("#d9748c", 20, y, 40, 3);
                art.rect("#f29bb0", 21, y, 38, 2);
            }
        },
        {
            height: 7,
            draw(art, y) {
                art.ellipse("#a86f32", 40, y + 7, 21, 7);
                art.ellipse("#d9a35e", 40, y + 7, 20, 6);
                art.rect("#f0c98a", 28, y + 2, 10, 1);
                [
                    [30, 3],
                    [38, 2],
                    [46, 3],
                    [34, 5],
                    [50, 5],
                    [42, 5]
                ].forEach(function (seed) {
                    art.rect("#fff4d6", seed[0], y + seed[1], 2, 1);
                });
            }
        }
    ];

    // The terminal's text so far: commands type out after their "$ ", replies appear whole. The pixel font
    // has no dollar sign, so the prompt is drawn as ">".
    function transcript(s) {
        const lines = [];
        let typing = false;
        sound.script.forEach(function (event) {
            if (s < event.step) {
                return;
            }
            let text = event.text;
            if (event.typed) {
                const fixed = text.indexOf("$ ") === 0 ? 2 : text.indexOf(": ") + 2;
                const progress = Math.min(1, (s - event.step) / event.typed);
                text = text.slice(0, fixed + Math.floor((text.length - fixed) * progress));
                if (progress < 1) {
                    typing = true;
                }
            }
            lines.push({
                text,
                color: event.refused ? colors.refused : event.okay ? colors.okay : colors.text
            });
        });
        return {lines, typing};
    }

    function terminal(art, s) {
        const refused = sound.script[1];
        const shake = s >= refused.step && s < refused.step + 3 ? Math.round(Math.sin(s * 9)) : 0;
        art.rect(colors.frame, 2 + shake, 1, 76, 44);
        art.rect(colors.screen, 3 + shake, 5, 74, 39);
        art.rect(colors.bar, 3 + shake, 2, 74, 3);
        ["#ff5f57", "#febc2e", "#28c840"].forEach(function (color, i) {
            art.rect(color, 5 + i * 4 + shake, 3, 2, 1);
        });
        const state = transcript(s);
        const rows = [];
        state.lines.forEach(function (line) {
            art.wrap(line.text || " ", 70).forEach(function (row) {
                rows.push({ text: row, color: line.color });
            });
        });
        // Reserve the prompt row so blinking never shifts the transcript.
        if (!state.typing) {
            rows.push({ text: Math.floor(s / 4) % 2 === 0 ? "$ _" : "$ ", color: colors.prompt });
        }
        rows.slice(-5).forEach(function (row, i) {
            const x = 5 + shake;
            const y = 8 + i * 7;
            if (row.text.indexOf("$ ") === 0) {
                art.text(">", x, y, colors.prompt);
                art.text(row.text.slice(2), x + 4, y, row.color);
            } else {
                art.text(row.text, x, y, row.color);
            }
        });
    }

    function sandwich(art, s) {
        art.ellipse(colors.plateRim, 40, 90, 24, 4);
        art.ellipse(colors.plate, 40, 89, 23, 3);
        let base = 88;
        layers.forEach(function (layer, i) {
            const start = sound.layers[i];
            base -= layer.height;
            if (s < start) {
                return;
            }
            // Fall for two steps, then settle with a one-pixel bounce.
            const fall = Math.min(1, (s - start) / 2);
            let y = Math.round(48 + (base - 48) * fall * fall);
            if (s >= start + 2 && s < start + 3) {
                y += 1;
            }
            layer.draw(art, y);
        });
        if (s >= sound.done) {
            const top = base - 8;
            art.rect("#c8a27a", 40, top, 1, 10);
            art.rect("#28a745", 41, top, 9, 7);
            art.text("OK", 42, top + 1, "#ffffff");
            const sparkle = s - sound.done;
            if (sparkle < 8) {
                art.alpha(1 - sparkle / 8);
                [
                    [14, 70],
                    [66, 66],
                    [20, 54],
                    [62, 80]
                ].forEach(function (p, i) {
                    const arm = (Math.floor(sparkle) + i) % 2 + 1;
                    art.rect("#fff4a8", p[0], p[1] - arm, 1, arm * 2 + 1);
                    art.rect("#fff4a8", p[0] - arm, p[1], arm * 2 + 1, 1);
                });
                art.alpha(1);
            }
        }
    }

    function draw(art, t) {
        const s = (t % sound.loop) / sound.step;
        terminal(art, s);
        sandwich(art, s);
    }

    window.siteRuntime.spriteMode({ mode: "sudo", sprite: ".sudo-sprite", draw, still: 15, fps: 20 });
})();