(function () {
    "use strict";
    const sprite = document.querySelector(".doomguy");
    if (!sprite) {
        return;
    }

    const sfx = window.siteRuntime.soundEffects();
    let reloadTimer;
    const reload = document.createElement("div");
    reload.className = "doom-reload";
    reload.innerHTML = '<i class="doom-muzzle"></i><i class="doom-shot-smoke"></i><i class="doom-shell"></i><span>LOCK &amp; LOAD</span>';
    sprite.appendChild(reload);

    function stopReload() {
        clearTimeout(reloadTimer);
        if (sprite.classList.contains("is-reloading")) {
            sprite.classList.remove("is-reloading");
            sfx.stop();
        }
    }

    // Original shotgun blast and bass thump, followed by a mechanical reload and locked-in chirp.
    function reloadSound() {
        // Each hit is noise or a falling triangle tone, through a band-pass filter at its frequency.
        function hit(at, length, hz, volume, noisy) {
            const options = {
                at,
                length,
                volume: volume * 0.225,
                filter: { type: "bandpass", from: hz, q: noisy ? 1.5 : 0.5 }
            };
            if (noisy) {
                sfx.noise(options);
            } else {
                sfx.tone({ ...options, type: "triangle", from: hz, to: hz * 0.55 });
            }
        }
        hit(0, 0.055, 3000, 1.1, true); // Sharp muzzle crack.
        hit(0.005, 0.32, 520, 1.3, true); // Decaying blast.
        hit(0.005, 0.24, 95, 1.2, false); // Low shotgun thump.
        hit(0.06, 0.4, 1100, 0.3, true); // Short outdoor tail.
        hit(0.15, 0.07, 2100, 0.7, true);
        hit(0.16, 0.22, 850, 0.5, true);
        hit(0.42, 0.09, 3200, 0.5, false);
        hit(0.53, 0.06, 2500, 0.35, false);
        hit(0.78, 0.17, 450, 0.8, true);
        hit(0.96, 0.08, 160, 0.9, false);
        hit(1.04, 0.06, 2200, 0.65, true);
        hit(1.14, 0.08, 880, 0.25, false);
        hit(1.23, 0.12, 1320, 0.2, false);
    }

    window.siteRuntime.registerShortcuts({
        iddqd() {
            if (window.siteModes.current() !== "doom" || document.hidden || sprite.classList.contains("is-reloading")) {
                return;
            }
            sprite.classList.add("is-reloading");
            reloadSound();
            reloadTimer = setTimeout(stopReload, 4550);
        }
    });

    // Pixel-art particles on an 80×96 canvas (2 screen pixels each), in the unmirrored sprite's coordinates:
    // embers kicked up around the boots, smoke curling from the shotgun barrel, and a low hell glow.
    let previous = null;
    const embers = [];
    const smoke = [];
    const feet = { left: 20, right: 66, y: 92 };
    const muzzle = { x: 75, y: 33 };
    const emberColors = ["#fff1a8", "#ffd04a", "#ff9a2e", "#f0561d", "#b3240f", "#5e1208"];

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function spawnEmber(ember, scatter) {
        ember.x = random(feet.left, feet.right);
        ember.y = feet.y - (scatter ? random(0, 70) : random(0, 3));
        ember.speed = random(9, 22);
        ember.drift = random(-4, 4);
        ember.phase = random(0, Math.PI * 2);
        ember.life = random(1.2, 2.6);
        ember.age = scatter ? random(0, ember.life) : 0;
        ember.size = Math.random() < 0.2 ? 2 : 1;
        return ember;
    }

    function spawnSmoke(puff, scatter) {
        puff.x = muzzle.x + random(-1, 1);
        puff.y = muzzle.y;
        puff.life = random(1.6, 2.4);
        puff.age = scatter ? random(0, puff.life) : 0;
        puff.phase = random(0, Math.PI * 2);
        return puff;
    }

    for (let i = 0; i < 36; i++) {
        embers.push(spawnEmber({}, true));
    }
    for (let j = 0; j < 9; j++) {
        smoke.push(spawnSmoke({}, true));
    }

    function draw(art, time) {
        const context = art.ctx;
        // The particles move by the time since the last frame.
        const step = previous === null || time < previous ? 0 : Math.min(0.1, time - previous);
        previous = time;
        // Hell glow pooled under the boots, pulsing slowly.
        const glow = context.createRadialGradient(43, 94, 2, 43, 94, 34);
        glow.addColorStop(0, "rgba(255,70,20," + (0.28 + 0.08 * Math.sin(time * 2.1)) + ")");
        glow.addColorStop(1, "rgba(255,40,10,0)");
        context.fillStyle = glow;
        context.fillRect(0, 56, 80, 40);

        smoke.forEach(function (puff) {
            puff.age += step;
            if (puff.age > puff.life) {
                spawnSmoke(puff, false);
            }
            const t = puff.age / puff.life;
            const size = 1 + Math.floor(t * 3);
            const x = puff.x + Math.sin(time * 1.6 + puff.phase + t * 4) * (1 + t * 3) + t * 3;
            const y = puff.y - t * 22;
            context.globalAlpha = 0.55 * (1 - t) * Math.min(1, t * 6);
            context.fillStyle = t < 0.4 ? "#c9c2b8" : "#8d8780";
            context.fillRect(Math.round(x), Math.round(y), size, size);
        });

        embers.forEach(function (ember) {
            ember.age += step;
            if (ember.age > ember.life) {
                spawnEmber(ember, false);
            }
            const t = ember.age / ember.life;
            ember.y -= ember.speed * step;
            const x = ember.x + ember.drift * t + Math.sin(time * 3 + ember.phase) * 1.5;
            // Embers cool as they rise and flicker as they burn out.
            const color = emberColors[Math.min(emberColors.length - 1, Math.floor(t * emberColors.length))];
            context.globalAlpha = (t > 0.6 && Math.sin(time * 40 + ember.phase) > 0.3 ? 0.35 : 1) * Math.min(1, (1 - t) * 3);
            context.fillStyle = color;
            context.fillRect(Math.round(x), Math.round(ember.y), ember.size, ember.size);
        });
        context.globalAlpha = 1;
    }

    // A reload in progress stops when the mode ends or the tab is hidden.
    function toggle(active) {
        if (!active) {
            stopReload();
            previous = null;
        }
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            stopReload();
        }
    });
    window.addEventListener("pagehide", stopReload);
    window.siteRuntime.spriteMode({
        mode: "doom",
        sprite: ".doomguy",
        draw,
        toggle,
        still: 0,
        fps: 25
    });
})();