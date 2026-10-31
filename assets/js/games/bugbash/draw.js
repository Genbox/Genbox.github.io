(function () {
    "use strict";
    // Bug Bash's drawing: the bugs, the ship, the HUD and the title and game-over screens, on the game's canvas.
    const runtime = window.siteRuntime;
    const reducedMotion = runtime.reducedMotion;
    const game = runtime.bugbash;
    const W = game.W;
    const H = game.H;
    const colors = game.colors;
    const stars = game.stars;
    let art;
    let ctx;
    let state;
    let high;

    function paint(flash, color) {
        return flash > 0 ? "#ffffff" : color;
    }
    function beetle(x, y, beat, flash) {
        const legs = paint(flash, "#ffb3a8");
        [-3, 0, 3].forEach(function (dy, i) {
            const kick = i % 2 === beat ? 1 : 0;
            art.rect(legs, x - 8, y + dy + kick, 3, 1);
            art.rect(legs, x + 5, y + dy + 1 - kick, 3, 1);
        });
        art.rect(legs, x - 3, y - 8 + beat, 1, 3);
        art.rect(legs, x + 2, y - 8 + beat, 1, 3);
        art.ellipse(paint(flash, "#5a1f1a"), x, y - 5, 3, 2);
        art.ellipse(paint(flash, "#b33a2f"), x, y + 1, 6, 6);
        art.ellipse(paint(flash, colors.red), x, y + 1, 5, 5);
        art.rect(paint(flash, "#b33a2f"), x, y - 4, 1, 10);
        art.rect(paint(flash, "#5a1f1a"), x - 3, y - 1, 2, 2);
        art.rect(paint(flash, "#5a1f1a"), x + 2, y + 2, 2, 2);
        art.rect("#ffffff", x - 3, y - 3, 1, 1);
    }
    function nullptr(x, y, beat, flash) {
        const ring = paint(flash, "#5ad8ff");
        art.ellipse(ring, x, y, 6 + beat * 0.5, 6 + beat * 0.5);
        art.ellipse(colors.bg, x, y, 4, 4);
        for (let i = -5; i <= 5; i++) {
            art.rect(ring, x + i, y - i, 2, 1);
        }
        art.rect("#ffffff", x - 2, y - 1, 1, 2);
        art.rect("#ffffff", x + 2, y - 1, 1, 2);
    }
    function segfault(x, y, beat, flash) {
        const bolt = paint(flash, "#ffd23f");
        const edge = paint(flash, "#ff9a1f");
        [
            [0, -7, 4],
            [-2, -4, 4],
            [-1, -1, 6],
            [-3, 1, 4],
            [-1, 4, 3]
        ].forEach(function (piece) {
            art.rect(edge, x + piece[0] - 1, y + piece[1], piece[2] + 2, 3);
            art.rect(bolt, x + piece[0], y + piece[1], piece[2], 3);
        });
        art.rect("#ffffff", x + (beat ? 5 : -6), y + (beat ? -5 : 3), 1, 1);
        art.rect("#ffffff", x + (beat ? -5 : 5), y + (beat ? 4 : -4), 1, 1);
    }
    function merge(x, y, beat, flash) {
        art.ellipse(paint(flash, "#2f9e8a"), x - 3, y, 5, 6);
        art.ellipse(paint(flash, "#3fd0b6"), x - 3, y, 4, 5);
        art.ellipse(paint(flash, "#c86a1e"), x + 3, y, 5, 6);
        art.ellipse(paint(flash, "#ff9a3c"), x + 3, y, 4, 5);
        art.rect(paint(flash, "#c58bff"), x, y - 6, 1, 12);
        art.rect("#ffffff", x - 4, y - 2, 2, 2);
        art.rect("#ffffff", x + 3, y - 2, 2, 2);
        art.rect("#111111", x - 4 + beat, y - 1, 1, 1);
        art.rect("#111111", x + 3 + beat, y - 1, 1, 1);
        art.rect(paint(flash, "#2f9e8a"), x - 6, y + 5 + beat, 2, 2);
        art.rect(paint(flash, "#c86a1e"), x + 4, y + 6 - beat, 2, 2);
    }
    function boss(enemy, beat) {
        const x = Math.round(enemy.x);
        const y = Math.round(enemy.y);
        const f = enemy.flash;
        for (let cable = 0; cable < 6; cable++) {
            const cx = x - 22 + cable * 9;
            for (let cy = 0; cy < 10; cy++) {
                art.rect(paint(f, ["#ff6b5e", "#5ad8ff", "#ffd23f"][cable % 3]), cx + Math.round(Math.sin(state.t * 3 + cable + cy * 0.6) * 2), y + 14 + cy, 1, 1);
            }
        }
        art.rect(paint(f, "#1c2027"), x - 27, y - 16, 54, 31);
        art.rect(paint(f, "#4a5260"), x - 26, y - 15, 52, 29);
        art.rect(paint(f, "#5d6675"), x - 26, y - 15, 52, 2);
        art.rect(paint(f, "#2a2f36"), x - 22, y - 11, 44, 8);
        art.text("LEGACY", x - 12, y - 9, colors.amber);
        [-16, 0, 16].forEach(function (dx, i) {
            const blink = Math.floor(state.t * 1.7 + i) % 5 === 0;
            art.ellipse("#111111", x + dx, y + 5, 4, 3);
            if (!blink) {
                art.ellipse(paint(f, colors.red), x + dx, y + 5, 2, 2);
            }
        });
        for (let tooth = 0; tooth < 9; tooth++) {
            art.rect("#c9ced3", x - 18 + tooth * 4, y + 11, 2, 2 + beat * (tooth % 2));
        }
    }
    function drawEnemy(enemy, beat) {
        if (enemy.hidden) {
            return;
        }
        if (enemy.type === "boss") {
            return boss(enemy, beat);
        }
        const x = Math.round(enemy.x);
        const y = Math.round(enemy.y);
        ({beetle, nullptr, segfault, merge})[enemy.type](x, y, beat, enemy.flash);
    }
    // The player's ship: a small terminal window with wings, a blinking cursor and an engine flame.
    function ship(x, y, beat, alpha) {
        art.alpha(alpha === undefined ? 1 : alpha);
        art.rect(colors.accent, x - 1, y - 9, 2, 3);
        art.rect(colors.accent, x - 3, y - 6, 6, 2);
        art.rect(colors.accent, x - 10, y, 3, 5);
        art.rect(colors.accent, x + 7, y, 3, 5);
        art.rect("#3aa883", x - 10, y + 4, 3, 1);
        art.rect("#3aa883", x + 7, y + 4, 3, 1);
        art.rect(colors.window, x - 7, y - 4, 14, 9);
        art.rect(colors.screen, x - 6, y - 2, 12, 6);
        ["#ff5f57", "#febc2e", "#28c840"].forEach(function (color, i) {
            art.rect(color, x - 6 + i * 2, y - 4, 1, 1);
        });
        art.rect(colors.accent, x - 5, y - 1, 1, 1);
        art.rect(colors.accent, x - 4, y, 1, 1);
        art.rect(colors.accent, x - 5, y + 1, 1, 1);
        if (beat) {
            art.rect(colors.accent, x - 2, y + 2, 3, 1);
        }
        art.rect("#ffb347", x - 1, y + 5, 2, 1 + beat);
        art.alpha(1);
    }
    const dropStyle = {
        spread: ["S", "#5ad8ff"],
        shield: ["#", colors.accent],
        rapid: ["R", "#ffad66"],
        hotfix: ["H", "#ff7fda"],
        fork: ["F", "#80baff"],
        rollback: ["B", "#78f0e7"],
        duck: ["D", "#ffd23f"],
        life: ["+", "#ff8fb1"]
    };

    function big(label, y, scale, color) {
        const width = art.width(label) * scale;
        ctx.save();
        ctx.translate(Math.round(W / 2 - width / 2), y);
        ctx.scale(scale, scale);
        art.text(label, 0, 0, color);
        ctx.restore();
    }
    function center(label, y, color) {
        art.text(label, Math.round(W / 2 - art.width(label) / 2), y, color);
    }
    function pad(number) {
        return ("000000" + number).slice(-6);
    }

    // Draws the current frame with the pixel helpers for the game's canvas.
    function render(pixels) {
        art = pixels;
        ctx = pixels.ctx;
        state = game.state();
        high = game.high();
        const beat = Math.floor(state.t * 4) % 2;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        art.rect(colors.bg, 0, 0, W, H);
        if (state.shake > 0 && !reducedMotion.matches) {
            ctx.translate(Math.round((Math.random() - 0.5) * 6 * state.shake), Math.round((Math.random() - 0.5) * 6 * state.shake));
        }
        stars.forEach(function (star) {
            art.rect(["#2a2f36", "#4a5260", "#8f97a2"][star.bright], Math.round(star.x), Math.round(star.y), 1, 1);
        });
        if (state.t < state.slowUntil) {
            art.alpha(0.08);
            art.rect("#ffd23f", 0, 0, W, H);
            art.alpha(1);
        }

        if (state.mode === "title") {
            return title(beat);
        }
        state.enemies.forEach(function (enemy) {
            drawEnemy(enemy, beat);
        });
        state.drops.forEach(function (drop) {
            const style = dropStyle[drop.kind];
            const x = Math.round(drop.x) - 4;
            const y = Math.round(drop.y) - 4;
            art.rect(style[1], x, y, 9, 9);
            art.rect(colors.bg, x + 1, y + 1, 7, 7);
            art.text(style[0], x + 3, y + 2, style[1]);
        });
        state.bullets.forEach(function (bullet) {
            const color = bullet.piercing ? "#ff7fda" : bullet.helper ? "#80baff" : colors.accent;
            art.rect(color, Math.round(bullet.x) - (bullet.piercing ? 1 : 0), Math.round(bullet.y) - (bullet.piercing ? 6 : 0), bullet.piercing ? 3 : 1, bullet.piercing ? 14 : 4);
            art.rect("#ffffff", Math.round(bullet.x), Math.round(bullet.y) - (bullet.piercing ? 6 : 0), 1, bullet.piercing ? 10 : 1);
        });
        state.shots.forEach(function (shot) {
            art.rect(beat ? colors.red : "#ffb3a8", Math.round(shot.x) - 1, Math.round(shot.y) - 1, 2, 3);
        });
        const player = state.player;
        if (state.mode === "play" && player.dead <= 0) {
            const blink = player.invulnerable > 0 && Math.floor(state.t * 12) % 2;
            ship(Math.round(player.x), player.y, beat, blink ? 0.3 : 1);
            if (state.t < state.forkUntil) {
                game.helpers().forEach(function (helper) {
                    const x = Math.round(helper.x);
                    const y = Math.round(helper.y);
                    art.rect("#80baff", x - 3, y - 4, 7, 7);
                    art.rect(colors.screen, x - 2, y - 3, 5, 3);
                    art.rect("#c7e3ff", x - 5, y, 2, 4);
                    art.rect("#c7e3ff", x + 4, y, 2, 4);
                    art.rect("#ffad66", x - 1, y + 3, 3, 2 + beat);
                });
            }
            if (state.shield) {
                art.alpha(0.5 + 0.3 * beat);
                for (let ring = 0; ring < state.shield; ring++) {
                    for (let a = 0; a < Math.PI * 2; a += 0.2) {
                        art.rect(ring ? "#b6a0ff" : colors.accent, Math.round(player.x + Math.cos(a) * (12 + ring * 3)), Math.round(player.y + Math.sin(a) * (9 + ring * 3)), 1, 1);
                    }
                }
                art.alpha(1);
            }
        }
        if (state.rollback) {
            const progress = (state.t - state.rollback.at) / 0.7;
            const radius = reducedMotion.matches ? 32 : 8 + progress * 400;
            art.alpha((1 - progress) * 0.8);
            for (let angle = 0; angle < Math.PI * 2; angle += 0.025) {
                art.rect("#78f0e7", Math.round(state.rollback.x + Math.cos(angle) * radius), Math.round(state.rollback.y + Math.sin(angle) * radius), 2, 2);
            }
            art.alpha(1);
        }
        state.sparks.forEach(function (spark) {
            art.alpha(1 - spark.age / spark.life);
            art.rect(spark.color, Math.round(spark.x), Math.round(spark.y), 1, 1);
        });
        art.alpha(1);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        hud(beat);
        if (state.mode === "over") {
            gameOver(beat);
        }
        if (state.mode === "paused") {
            art.alpha(0.6);
            art.rect(colors.bg, 0, 130, W, 50);
            art.alpha(1);
            big("PAUSED", 140, 3, colors.text);
            center("P / TAP TO RESUME  ESC TO QUIT", 166, colors.muted);
        }
    }

    function hud(beat) {
        if (state.godMode) {
            center("GOD MODE", 22, colors.amber);
        }
        art.text("SCORE " + pad(state.score), 4, 4, colors.text);
        const hi = "HI " + pad(Math.max(high, state.score));
        art.text(hi, W - 4 - art.width(hi), 4, colors.muted);
        for (let life = 0; life < Math.min(5, state.lives - (state.player.dead > 0 ? 0 : 1)); life++) {
            art.rect(colors.accent, 5 + life * 9, H - 8, 6, 4);
            art.rect(colors.accent, 7 + life * 9, H - 10, 2, 2);
        }
        let x = W - 6;
        if (state.shield) {
            x -= 18;
            art.text("#" + state.shield, x, H - 10, state.shield === 2 ? "#b6a0ff" : colors.accent);
        }
        [
            ["S", "#5ad8ff", state.spreadUntil, 10],
            ["R", "#ffad66", state.rapidUntil, 8],
            ["H", "#ff7fda", state.hotfixUntil, 8],
            ["F", "#80baff", state.forkUntil, 10],
            ["D", "#ffd23f", state.slowUntil, 6]
        ].forEach(function (power) {
            const left = power[2] - state.t;
            if (left <= 0) {
                return;
            }
            x -= 16;
            art.text(power[0], x, H - 10, power[1]);
            art.rect(power[1], x + 5, H - 7, Math.ceil((9 * left) / power[3]), 2);
        });
        const boss = state.enemies.filter(function (enemy) {
            return enemy.type === "boss";
        })[0];
        if (boss) {
            art.rect("#2a2f36", 40, 13, W - 80, 4);
            art.rect(colors.red, 41, 14, Math.ceil(((W - 82) * boss.hp) / boss.max), 2);
        }
        if (state.banner && state.t < state.banner.until && state.mode === "play") {
            big(state.banner.text, 140, state.banner.text.length > 12 ? 2 : 3, colors.amber);
        }
    }

    function title(beat) {
        big("BUG", 42, 8, colors.accent);
        big("BASH", 90, 8, colors.accent);
        center("SQUASH THE BUGS BEFORE THEY SHIP", 136, colors.muted);
        beetle(60, 166, beat, 0);
        merge(100, 166, beat, 0);
        nullptr(140, 166, beat, 0);
        segfault(180, 166, beat, 0);
        [
            ["10", 60],
            ["20", 100],
            ["25", 140],
            ["30", 180]
        ].forEach(function (label) {
            art.text(label[0], label[1] - 3, 178, colors.text);
        });
        center("ARROWS OR A/D MOVE   SPACE FIRES", 200, colors.text);
        center("P PAUSES   ESC QUITS", 212, colors.text);
        if (beat) {
            center("PRESS SPACE OR TAP TO START", 244, colors.amber);
        }
        center("HI " + pad(high), 270, colors.muted);
        ship(W / 2, 306, beat);
    }

    function gameOver(beat) {
        art.alpha(0.7);
        art.rect(colors.bg, 0, 110, W, 100);
        art.alpha(1);
        big("SEGMENTATION", 118, 2, colors.red);
        big("FAULT", 132, 2, colors.red);
        center("(CORE DUMPED)", 150, colors.muted);
        center("SCORE " + pad(state.score) + "   WAVE " + state.wave, 164, colors.text);
        if (state.newHigh) {
            center("NEW HIGH SCORE!", 176, colors.amber);
        }
        if (beat) {
            center("PRESS SPACE OR TAP TO RETRY", 194, colors.accent);
        }
    }

    game.render = render;
})();