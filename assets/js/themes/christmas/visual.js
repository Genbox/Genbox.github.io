(function () {
    "use strict";

    function isActive() {
        return window.siteThemes.current() === "christmas";
    }

    let layer = null;
    let flakes = [];
    let time = 0;
    let width = 0;
    let height = 0;

    let snowSeed = 0;

    function random() {
        snowSeed = Math.imul(snowSeed, 1664525) + 1013904223 | 0;
        return (snowSeed >>> 0) / 4294967296;
    }

    function flake(scatter) {
        const depth = random();
        return {
            x: random() * width,
            y: scatter ? random() * height : -12,
            size: 1 + depth * 2.5,
            speed: 18 + depth * 34,
            opacity: 0.2 + depth * 0.5,
            phase: random() * Math.PI * 2,
            crystal: random() < 0.2
        };
    }

    const storageKey = "christmas-snowfall-v1";

    function saveSnowfall() {
        if (!flakes.length) {
            return;
        }
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({flakes, time, seed: snowSeed, width, height}));
        } catch {
            // Snow still works when browser storage is unavailable.
        }
    }

    window.addEventListener("pagehide", saveSnowfall);

    // Resume the same flakes in this tab, scaling their positions if the viewport changes.
    function fill(page) {
        if (!flakes.length) {
            try {
                const saved = JSON.parse(sessionStorage.getItem(storageKey));
                if (saved && saved.flakes.length && saved.width > 0 && saved.height > 0) {
                    flakes = saved.flakes;
                    time = saved.time;
                    snowSeed = saved.seed;
                    width = saved.width;
                    height = saved.height;
                }
            } catch {
                // Start a fresh snowfall if there is no usable saved state.
            }
        }
        if (flakes.length) {
            flakes.forEach(function (snow) {
                snow.x *= page.width / width;
                snow.y *= page.height / height;
            });
            width = page.width;
            height = page.height;
            return;
        }
        snowSeed = 1225;
        time = 0;
        width = page.width;
        height = page.height;
        flakes = Array.from({ length: Math.min(100, Math.max(20, Math.round((width * height) / 16000))) }, function () {
            return flake(true);
        });
    }

    function step(delta) {
        const dt = delta / 1000;
        const context = layer.ctx;
        time += dt;
        context.clearRect(0, 0, width, height);
        flakes.forEach(function (snow, i) {
            snow.y += snow.speed * dt;
            snow.x += (8 + Math.sin(time * 0.7 + snow.phase) * 13) * dt;
            if (snow.x > width + 12) {
                snow.x = -12;
            }
            if (snow.x < -12) {
                snow.x = width + 12;
            }
            if (snow.y > height + 12) {
                flakes[i] = flake(false);
                return;
            }
            context.globalAlpha = snow.opacity;
            context.fillStyle = "#ffffff";
            context.strokeStyle = "#ffffff";
            if (snow.crystal) {
                context.save();
                context.translate(snow.x, snow.y);
                context.rotate(snow.phase + time * 0.2);
                context.lineWidth = 0.8;
                context.beginPath();
                for (let arm = 0; arm < 6; arm++) {
                    const angle = (arm * Math.PI) / 3;
                    context.moveTo(0, 0);
                    context.lineTo(Math.cos(angle) * snow.size * 1.8, Math.sin(angle) * snow.size * 1.8);
                }
                context.stroke();
                context.restore();
            } else {
                context.beginPath();
                context.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2);
                context.fill();
            }
        });
    }

    // The snow falls in front of the page, and stops (taking its canvas with it) for reduced motion.
    const snowfall = window.siteRuntime.loop(step, {
        maxStep: 50,
        change(state) {
            if (state === "running" && !layer) {
                layer = window.siteRuntime.pageLayer("snowfall", {maxRatio: 2, resized: fill});
            } else if ((state === "off" || state === "still") && layer) {
                saveSnowfall();
                layer.remove();
                layer = null;
                flakes = [];
            }
        }
    });

    function decorateBoxes() {
        window.siteRuntime.eachBox("snowStyle", function (box, random) {
            const style = Math.floor(random() * 3);
            const edge = style === 0 ? 12 : 9;
            const bottom = style === 2 ? 19 : 16;
            let path = "M0 " + edge;
            for (let mound = 0; mound < 8; mound++) {
                const end = mound === 7 ? edge : Math.round(edge - random() * (style === 0 ? 2 : 5));
                const peak = Math.round(edge - (style === 0 ? 3 : 8) * random());
                path += "Q" + (mound * 50 + 25) + " " + peak + " " + (mound + 1) * 50 + " " + end;
            }
            path += "V" + bottom;
            for (let drift = 15; drift >= 0; drift--) {
                const dip = bottom + Math.round(random() * (style === 0 ? 1 : style === 1 ? 3 : 4));
                path += "Q" + (drift * 25 + 12.5) + " " + dip + " " + drift * 25 + " " + bottom;
            }
            path += "Z";
            const svg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="24" viewBox="0 0 400 24" preserveAspectRatio="none"><path fill="#c7e1f0" transform="translate(0 2)" d="' +
                path +
                '"/><path fill="#f4fbff" d="' +
                path +
                '"/></svg>';
            box.style.setProperty("--snowcap", window.siteRuntime.svgUrl(svg));
            return ["dusting", "drifts", "overhang"][style];
        });
    }

    function update(enabled) {
        const active = typeof enabled === "boolean" ? enabled : isActive();
        const tree = document.querySelector(".christmas-tree");
        if (tree) {
            tree.hidden = !active || !!window.siteModes.current();
            if (!tree.hidden) {
                window.siteRuntime.loadImages(tree);
            }
        }
        document.documentElement.classList.toggle("christmas-snowcaps", active);
        if (active) {
            decorateBoxes();
        }
        snowfall.toggle(active);
    }

    document.addEventListener("modechange", update);
    window.siteThemes.register("christmas", update);
    update();
})();