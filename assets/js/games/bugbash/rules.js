(function () {
    "use strict";
    // Bug Bash: an original fixed-screen shooter. You fly a little terminal-window ship along the bottom and
    // squash waves of software bugs that swoop in, settle into a breathing formation and dive at you. Beetles
    // are plain bugs, null pointers aim their shots, segfaults home in on you and merge conflicts split in two.
    // Every fifth wave brings a boss: a lump of legacy code. Squashed bugs sometimes drop patches: a spread
    // shot, rapid fire, piercing lasers, helper ships, a bullet-clearing rollback, shields, slow time, or an extra life.
    // The game is in three files: the rules (this one: the state, waves, enemies and sounds), the drawing, and the
    // overlay with its input and loop. They share siteRuntime.bugbash.
    const runtime = window.siteRuntime;
    const W = 240;
    const H = 320;
    const colors = {
        bg: "#07090c",
        accent: "#6ee7b7",
        text: "#e7e9ec",
        muted: "#8f97a2",
        amber: "#f2b84b",
        red: "#ff6b5e",
        window: "#2a2f36",
        screen: "#0d1114"
    };
    let state;
    let high = 0;
    try {
        high = +localStorage.getItem("bugbash-high") || 0;
    } catch (error) {
        high = 0;
    }

    // Sound effects, synthesized on the spot.
    const effects = runtime.soundEffects();
    function tone(type, from, to, length, volume, delay) {
        effects.tone({type, from, to, length, volume, at: delay });
    }
    function noise(length, volume, from, to) {
        effects.noise({length, volume, filter: { type: "lowpass", from, to} });
    }
    const sfx = {
        shoot() {
            tone("square", 1200, 420, 0.07, 0.035);
        },
        hit() {
            noise(0.06, 0.09, 5000, 1500);
        },
        squash() {
            noise(0.22, 0.13, 3000, 300);
            tone("triangle", 320, 70, 0.22, 0.1);
        },
        zap() {
            tone("triangle", 620, 240, 0.12, 0.03);
        },
        patch() {
            [0, 4, 7, 12].forEach(function (step, i) {
                tone("square", 660 * Math.pow(2, step / 12), 660 * Math.pow(2, step / 12), 0.07, 0.04, i * 0.06);
            });
        },
        shield() {
            tone("sine", 1400, 300, 0.3, 0.08);
        },
        die() {
            noise(0.7, 0.2, 3000, 80);
            tone("sawtooth", 440, 40, 0.8, 0.09);
        },
        boom() {
            noise(1.2, 0.25, 2000, 50);
            tone("sawtooth", 160, 30, 1.2, 0.12);
        },
        start() {
            [0, 7, 12, 19].forEach(function (step, i) {
                tone("square", 440 * Math.pow(2, step / 12), 440 * Math.pow(2, step / 12), 0.09, 0.05, i * 0.08);
            });
        }
    };
    function say(text) {
        runtime.speak(text, { voice: "female", pitch: 1.3, rate: 1 });
    }

    // ---- Game state ----

    function reset(mode) {
        state = {
            mode,
            t: 0,
            score: 0,
            godMode: false,
            lives: 3,
            wave: 0,
            bullets: [],
            shots: [],
            enemies: [],
            drops: [],
            sparks: [],
            banner: null,
            slowUntil: 0,
            spreadUntil: 0,
            rapidUntil: 0,
            hotfixUntil: 0,
            forkUntil: 0,
            rollback: null,
            shield: 0,
            nextWave: 0,
            diveTimer: 3,
            fireTimer: 2,
            shake: 0,
            newHigh: false,
            player: { x: W / 2, y: H - 22, cool: 0, invulnerable: 0, dead: 0 }
        };
    }
    const stars = [];
    for (let s = 0; s < 70; s++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, speed: 6 + (s % 3) * 10, bright: s % 3 });
    }

    function helpers() {
        return [-1, 1].map(function (side) {
            return { x: Math.max(6, Math.min(W - 6, state.player.x + side * 22)), y: state.player.y + 4 };
        });
    }

    function slow() {
        return state.t < state.slowUntil ? 0.5 : 1;
    }
    function banner(text, length) {
        state.banner = {text, until: state.t + (length || 1.8) };
    }
    const points = { beetle: 10, nullptr: 25, segfault: 30, merge: 20 };
    const health = { beetle: 1, nullptr: 2, segfault: 1, merge: 2 };

    function startWave() {
        const n = ++state.wave;
        const boss = n % 5 === 0;
        const rows = boss ? 1 : Math.min(5, 2 + Math.floor((n - 1) / 2));
        banner(boss ? "LEGACY CODE!" : "WAVE " + n);
        say(boss ? "Warning. Legacy code detected." : "Wave " + n + ".");
        let index = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 8; col++) {
                let type = "beetle";
                if (!boss && row === 0 && n >= 3) {
                    type = "nullptr";
                } else if (!boss && row === 1 && n >= 2 && col % 2 === 0) {
                    type = "merge";
                } else if (!boss && n >= 2 && row === rows - 1 && (col === 0 || col === 7)) {
                    type = "segfault";
                }
                const left = col < 4;
                state.enemies.push({
                    type,
                    hp: health[type],
                    row: boss ? row + 3 : row,
                    col,
                    x: -40,
                    y: -40,
                    mode: "enter",
                    at: state.t + 0.6 + index * 0.07 + (left ? 0 : 0.035),
                    from: { x: left ? -16 : W + 16, y: 70 + row * 12 },
                    flash: 0,
                    wobble: Math.random() * 6
                });
                index++;
            }
        }
        if (boss) {
            const hp = 30 + n * 4;
            state.enemies.push({
                type: "boss",
                hp,
                max: hp,
                x: W / 2,
                y: -40,
                mode: "boss",
                at: state.t,
                flash: 0,
                fire: state.t + 2.5,
                spawn: state.t + 4,
                wobble: 0
            });
        }
        state.diveTimer = 2.5;
        state.fireTimer = 1.8;
    }

    // Where an enemy's place in the formation is right now: the formation breathes in and out.
    function slot(enemy) {
        const spread = 1 + 0.07 * Math.sin(state.t * 1.3);
        return {
            x: W / 2 + (enemy.col - 3.5) * 24 * spread,
            y: 44 + enemy.row * 19 + Math.sin(state.t * 2 + enemy.col) * 2
        };
    }
    // Integrate a smooth speed ramp so dive distance is independent of frame rate.
    function diveTravel(time) {
        const duration = 0.35;
        if (time >= duration) {
            return time - duration / 2;
        }
        const progress = time / duration;
        return duration * (progress * progress * progress - 0.5 * progress * progress * progress * progress);
    }

    function size(enemy) {
        return enemy.type === "boss" ? { w: 27, h: 16 } : { w: 6, h: 5 };
    }

    function enemyShot(enemy, aimed) {
        let vx = 0;
        let vy = 95;
        if (aimed) {
            const dx = state.player.x - enemy.x;
            const dy = state.player.y - enemy.y;
            const length = Math.hypot(dx, dy) || 1;
            vx = (dx / length) * 95;
            vy = (dy / length) * 95;
        }
        state.shots.push({ x: enemy.x, y: enemy.y + 6, vx, vy});
        sfx.zap();
    }

    function burst(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = (0.3 + Math.random()) * (speed || 60);
            state.sparks.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                age: 0,
                life: 0.3 + Math.random() * 0.4,
                color
            });
        }
    }

    function kill(enemy, index) {
        state.enemies.splice(index, 1);
        if (enemy.type === "boss") {
            state.score += 100 * state.wave;
            burst(enemy.x, enemy.y, colors.amber, 60, 120);
            burst(enemy.x, enemy.y, colors.red, 40, 80);
            state.shake = 0.6;
            sfx.boom();
            say("Legacy code refactored.");
            state.drops.push({ x: enemy.x, y: enemy.y, kind: "life" });
            return;
        }
        state.score += points[enemy.type] * (enemy.mode === "dive" ? 2 : 1);
        burst(enemy.x, enemy.y, { beetle: colors.red, nullptr: "#5ad8ff", segfault: "#ffd23f", merge: "#c58bff" }[enemy.type], 14);
        sfx.squash();
        // A merge conflict splits into two beetles that dive at once.
        if (enemy.type === "merge") {
            [-1, 1].forEach(function (side) {
                state.enemies.push({
                    type: "beetle",
                    hp: 1,
                    row: enemy.row,
                    col: enemy.col,
                    x: enemy.x + side * 5,
                    y: enemy.y,
                    mode: "dive",
                    child: true,
                    diveX: enemy.x + side * 5,
                    diveT: 0,
                    fired: true,
                    flash: 0,
                    wobble: side
                });
            });
        }
        if (Math.random() < 0.09) {
            const roll = Math.random();
            state.drops.push({
                x: enemy.x,
                y: enemy.y,
                kind:
                    roll < 0.17
                        ? "spread"
                        : roll < 0.39
                          ? "shield"
                          : roll < 0.55
                            ? "rapid"
                            : roll < 0.68
                              ? "hotfix"
                              : roll < 0.81
                                ? "fork"
                                : roll < 0.9
                                  ? "rollback"
                                  : roll < 0.96
                                    ? "duck"
                                    : "life"
            });
        }
    }

    function hurt() {
        const player = state.player;
        if (state.godMode || player.invulnerable > 0 || player.dead > 0) {
            return;
        }
        if (state.shield) {
            state.shield--;
            player.invulnerable = 1;
            sfx.shield();
            return;
        }
        state.lives--;
        burst(player.x, player.y, colors.accent, 40, 90);
        state.shake = 0.4;
        sfx.die();
        player.dead = 1.6;
        state.spreadUntil = 0;
        state.rapidUntil = 0;
        state.hotfixUntil = 0;
        state.forkUntil = 0;
        if (state.lives <= 0) {
            say("Core dumped.");
            if (state.score > high) {
                high = state.score;
                state.newHigh = true;
                try {
                    localStorage.setItem("bugbash-high", String(high));
                } catch (error) {
                    /* Storage may be blocked. */
                }
            }
        }
    }

    function overlaps(a, ah, b, bh) {
        return Math.abs(a.x - b.x) < ah.w + bh.w && Math.abs(a.y - b.y) < ah.h + bh.h;
    }

    // Moves the game on by dt seconds; controls are the keys held down ({ name: true }) and the pointer ({ x }).
    function update(dt, controls) {
        state.t += dt;
        const player = state.player;
        if (state.rollback && state.t - state.rollback.at >= 0.7) {
            state.rollback = null;
        }
        const enemyDt = dt * slow();
        stars.forEach(function (star) {
            star.y = (star.y + star.speed * dt) % H;
        });
        state.shake = Math.max(0, state.shake - dt);
        state.sparks = state.sparks.filter(function (spark) {
            spark.age += dt;
            spark.x += spark.vx * dt;
            spark.y += spark.vy * dt;
            return spark.age < spark.life;
        });
        if (state.mode !== "play") {
            return;
        }

        // The player: move, fire, respawn.
        if (player.dead > 0) {
            player.dead -= dt;
            if (player.dead <= 0) {
                if (state.lives <= 0) {
                    state.mode = "over";
                    return;
                }
                player.x = W / 2;
                player.invulnerable = 2;
            }
        } else {
            const keys = controls.keys;
            const pointer = controls.pointer;
            let direction = (keys.arrowleft || keys.a ? -1 : 0) + (keys.arrowright || keys.d ? 1 : 0);
            if (pointer) {
                direction = Math.abs(pointer.x - player.x) < 2 ? 0 : pointer.x < player.x ? -1 : 1;
            }
            player.x = Math.max(10, Math.min(W - 10, player.x + direction * 135 * dt));
            player.invulnerable = Math.max(0, player.invulnerable - dt);
            player.cool -= dt;
            const spread = state.t < state.spreadUntil;
            const rapid = state.t < state.rapidUntil;
            const fork = state.t < state.forkUntil;
            const hotfix = state.t < state.hotfixUntil;
            const bulletLimit = ((spread ? 3 : 1) + (fork ? 2 : 0)) * (rapid ? 15 : 3);
            if ((keys[" "] || pointer) && player.cool <= 0 && state.bullets.length < bulletLimit) {
                (spread ? [-50, 0, 50] : [0]).forEach(function (vx) {
                    state.bullets.push({ x: player.x, y: player.y - 8, vx, piercing: hotfix, hits: hotfix ? new Set() : null });
                });
                if (fork) {
                    helpers().forEach(function (helper) {
                        state.bullets.push({ x: helper.x, y: helper.y - 8, vx: 0, helper: true });
                    });
                }
                player.cool = rapid ? 0.08 : 0.2;
                sfx.shoot();
            }
        }
        state.bullets = state.bullets.filter(function (bullet) {
            bullet.x += bullet.vx * dt;
            bullet.y -= 260 * dt;
            return bullet.y > -6;
        });

        // Enemies: fly in, hold formation, dive and come back round.
        const n = state.wave;
        state.enemies.forEach(function (enemy) {
            enemy.flash = Math.max(0, enemy.flash - dt);
            if (enemy.mode === "enter") {
                let p = (state.t - enemy.at) / 1.5;
                if (p < 0) {
                    enemy.hidden = true;
                    return;
                }
                enemy.hidden = false;
                const to = slot(enemy);
                const control = { x: enemy.from.x < 0 ? W * 0.8 : W * 0.2, y: 230 };
                p = Math.min(1, p);
                enemy.x = (1 - p) * (1 - p) * enemy.from.x + 2 * (1 - p) * p * control.x + p * p * to.x;
                enemy.y = (1 - p) * (1 - p) * enemy.from.y + 2 * (1 - p) * p * control.y + p * p * to.y;
                if (p >= 1) {
                    enemy.mode = "formation";
                }
            } else if (enemy.mode === "formation") {
                const place = slot(enemy);
                enemy.x = place.x;
                enemy.y = place.y;
            } else if (enemy.mode === "dive") {
                const previousTravel = diveTravel(enemy.diveT);
                enemy.diveT += enemyDt;
                const travel = diveTravel(enemy.diveT);
                const travelStep = travel - previousTravel;
                enemy.y += (enemy.type === "segfault" ? 120 : 85) * travelStep;
                if (enemy.type === "segfault") {
                    enemy.x += Math.max(-70, Math.min(70, (player.x - enemy.x) * 2)) * travelStep;
                } else {
                    // Subtract the starting phase so every curve begins at the departure position.
                    enemy.x = enemy.diveX + (Math.sin(travel * 2.6 + enemy.wobble) - Math.sin(enemy.wobble)) * 40;
                }
                if (!enemy.fired && enemy.y > 120) {
                    enemy.fired = true;
                    enemyShot(enemy, true);
                }
                if (enemy.y > H + 12) {
                    if (enemy.child) {
                        enemy.gone = true;
                        return;
                    }
                    enemy.mode = "return";
                    enemy.back = 0;
                    enemy.y = -12;
                }
            } else if (enemy.mode === "return") {
                enemy.back += enemyDt;
                const home = slot(enemy);
                const q = Math.min(1, enemy.back);
                enemy.x = enemy.x + (home.x - enemy.x) * q;
                enemy.y = -12 + (home.y + 12) * q;
                if (q >= 1) {
                    enemy.mode = "formation";
                }
            } else if (enemy.mode === "boss") {
                const enter = Math.min(1, (state.t - enemy.at) / 2);
                enemy.y = -40 + 104 * enter;
                enemy.x = W / 2 + Math.sin((state.t - enemy.at) * 0.8) * 70;
                if (enter >= 1 && state.t > enemy.fire) {
                    for (let a = -2; a <= 2; a++) {
                        state.shots.push({ x: enemy.x + a * 6, y: enemy.y + 14, vx: a * 26, vy: 90 });
                    }
                    sfx.zap();
                    enemy.fire = state.t + Math.max(0.9, 1.8 - n * 0.05) / slow();
                }
                if (enter >= 1 && state.t > enemy.spawn) {
                    [-1, 1].forEach(function (side) {
                        state.enemies.push({
                            type: "beetle",
                            hp: 1,
                            row: 0,
                            col: 0,
                            x: enemy.x + side * 20,
                            y: enemy.y,
                            mode: "dive",
                            child: true,
                            diveX: enemy.x + side * 20,
                            diveT: 0,
                            fired: false,
                            flash: 0,
                            wobble: side
                        });
                    });
                    enemy.spawn = state.t + 4;
                }
            }
        });
        state.enemies = state.enemies.filter(function (enemy) {
            return !enemy.gone;
        });

        // Pick divers and shooters from the formation, more often as the waves go on.
        const settled = state.enemies.filter(function (enemy) {
            return enemy.mode === "formation";
        });
        state.diveTimer -= enemyDt;
        if (state.diveTimer <= 0 && settled.length) {
            const diver = settled[Math.floor(Math.random() * settled.length)];
            diver.mode = "dive";
            diver.diveX = diver.x;
            diver.diveT = 0;
            diver.fired = false;
            state.diveTimer = Math.max(0.5, 2.6 - n * 0.18) * (0.6 + Math.random() * 0.8);
        }
        state.fireTimer -= enemyDt;
        if (state.fireTimer <= 0 && settled.length) {
            const shooter = settled[Math.floor(Math.random() * settled.length)];
            enemyShot(shooter, shooter.type === "nullptr");
            state.fireTimer = Math.max(0.3, 1.5 - n * 0.09) * (0.6 + Math.random() * 0.8);
        }
        state.shots = state.shots.filter(function (shot) {
            shot.x += shot.vx * enemyDt;
            shot.y += shot.vy * enemyDt;
            return shot.y < H + 6 && shot.x > -6 && shot.x < W + 6;
        });
        state.drops = state.drops.filter(function (drop) {
            drop.y += 45 * dt;
            return drop.y < H + 8 && !drop.taken;
        });

        // Collisions.
        const playerBox = { w: 6, h: 4 };
        state.bullets = state.bullets.filter(function (bullet) {
            for (let i = state.enemies.length - 1; i >= 0; i--) {
                const enemy = state.enemies[i];
                if (enemy.hidden || bullet.hits && bullet.hits.has(enemy) || !overlaps(bullet, { w: 1, h: bullet.piercing ? 8 : 3 }, enemy, size(enemy))) {
                    continue;
                }
                if (bullet.hits) {
                    bullet.hits.add(enemy);
                }
                enemy.hp--;
                enemy.flash = 0.08;
                if (enemy.hp <= 0) {
                    kill(enemy, i);
                } else {
                    sfx.hit();
                }
                if (!bullet.piercing) {
                    return false;
                }
            }
            return true;
        });
        if (player.dead <= 0) {
            state.shots = state.shots.filter(function (shot) {
                if (!overlaps(shot, { w: 1, h: 2 }, player, playerBox)) {
                    return true;
                }
                hurt();
                return false;
            });
            for (let i = state.enemies.length - 1; i >= 0; i--) {
                const enemy = state.enemies[i];
                if (enemy.hidden || enemy.mode === "formation" || !overlaps(enemy, size(enemy), player, playerBox)) {
                    continue;
                }
                if (state.godMode || player.invulnerable > 0) {
                    continue;
                }
                hurt();
                if (enemy.type !== "boss") {
                    kill(enemy, i);
                }
            }
            state.drops.forEach(function (drop) {
                if (!overlaps(drop, { w: 4, h: 4 }, player, playerBox)) {
                    return;
                }
                drop.taken = true;
                sfx.patch();
                if (drop.kind === "spread") {
                    state.spreadUntil = state.t + 10;
                    banner("PATCH: SPREAD SHOT", 1.2);
                }
                if (drop.kind === "shield") {
                    state.shield = Math.min(2, state.shield + 1);
                    banner(state.shield === 2 ? "PATCH: DOUBLE SHIELD" : "PATCH: SHIELD", 1.2);
                }
                if (drop.kind === "rapid") {
                    state.rapidUntil = state.t + 8;
                    player.cool = Math.min(player.cool, 0.08);
                    banner("PATCH: RAPID FIRE", 1.2);
                }
                if (drop.kind === "hotfix") {
                    state.hotfixUntil = state.t + 8;
                    banner("HOTFIX: PIERCING LASER", 1.2);
                }
                if (drop.kind === "fork") {
                    state.forkUntil = state.t + 10;
                    banner("FORK: HELPERS ONLINE", 1.2);
                }
                if (drop.kind === "rollback") {
                    state.shots = [];
                    state.rollback = { x: player.x, y: player.y, at: state.t };
                    sfx.shield();
                    banner("ROLLBACK: BULLETS CLEARED", 1.2);
                }
                if (drop.kind === "duck") {
                    state.slowUntil = state.t + 6;
                    banner("RUBBER DUCK MODE", 1.2);
                }
                if (drop.kind === "life") {
                    state.lives = Math.min(5, state.lives + 1);
                    banner("PATCH: EXTRA LIFE", 1.2);
                }
            });
        }

        // The next wave, once this one is squashed.
        if (!state.enemies.length && player.dead <= 0) {
            if (!state.nextWave) {
                state.nextWave = state.t + 1.6;
            } else if (state.t >= state.nextWave) {
                state.nextWave = 0;
                startWave();
            }
        }
    }

    function toggleGodMode() {
        if (state.mode !== "play" && state.mode !== "paused") {
            return;
        }
        state.godMode = !state.godMode;
        banner(state.godMode ? "GOD MODE ON" : "GOD MODE OFF", 1.5);
        sfx.patch();
    }

    function begin() {
        reset("play");
        sfx.start();
        startWave();
    }

    runtime.bugbash = {
        W,
        H,
        colors,
        stars,
        helpers,
        state() {
            return state;
        },
        high() {
            return high;
        },
        reset,
        begin,
        toggleGodMode,
        update,
        sounds: effects
    };
})();