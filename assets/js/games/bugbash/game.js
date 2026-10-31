(function () {
    "use strict";
    // Bug Bash's overlay: the dialog with its canvas, the keyboard and pointer controls, and the loop that runs the
    // rules and the drawing.
    const runtime = window.siteRuntime;
    const music = runtime.sounds.bugbash;
    const game = runtime.bugbash;
    const W = game.W;
    const H = game.H;
    let overlay;
    let canvas;
    let art;
    let frame = 0;
    let last = 0;
    let isOpen = false;
    let keys = {};
    let pointer = null;
    let previousFocus = null;
    let cheatSequence = "";
    let cheatLastKey = 0;

    function togglePause() {
        const state = game.state();
        if (state.mode === "play") {
            state.mode = "paused";
        } else if (state.mode === "paused") {
            state.mode = "play";
        }
    }
    function onKey(event) {
        // Let the dialog's close button and native Tab/Escape handling work normally.
        if (event.target !== canvas) {
            return;
        }
        const key = event.key.toLowerCase();
        const down = event.type === "keydown";
        if (key === "tab" || key === "escape") {
            return;
        }
        event.stopPropagation();
        if (/^(arrow|\s)/.test(key) || key === " ") {
            event.preventDefault();
        }
        if (down && !event.repeat) {
            const now = performance.now();
            if (now - cheatLastKey > 2000) {
                cheatSequence = "";
            }
            if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || key.length !== 1) {
                cheatSequence = "";
            } else {
                cheatSequence = (cheatSequence + key).slice(-5);
            }
            cheatLastKey = now;
            if (cheatSequence === "iddqd") {
                cheatSequence = "";
                game.toggleGodMode();
            }
        }
        if (down && key === "p" && !event.repeat) {
            togglePause();
        }
        if (down && (key === " " || key === "enter") && !event.repeat && (game.state().mode === "title" || game.state().mode === "over")) {
            game.begin();
        }
        keys[key] = down;
    }
    function pointerAt(event) {
        const box = canvas.getBoundingClientRect();
        return { x: ((event.clientX - box.left) / box.width) * W };
    }
    function onPointer(event) {
        event.preventDefault();
        if (event.type === "pointerdown") {
            canvas.focus();
            canvas.setPointerCapture(event.pointerId);
            const mode = game.state().mode;
            if (mode === "paused") {
                togglePause();
                return;
            }
            if (mode === "title" || mode === "over") {
                game.begin();
                return;
            }
            pointer = pointerAt(event);
        } else if (event.type === "pointermove") {
            if (pointer) {
                pointer = pointerAt(event);
            }
        } else {
            pointer = null;
        }
    }
    function fit() {
        if (!canvas) {
            return;
        }
        // Whole-pixel scaling where there is room; on small screens, fill the width instead.
        const fits = Math.min((innerWidth - 32) / W, (innerHeight - 90) / H);
        const scale = fits >= 2 ? Math.floor(fits) : Math.max(1, fits);
        canvas.style.width = W * scale + "px";
        canvas.style.height = H * scale + "px";
    }
    function loop(now) {
        if (!isOpen) {
            return;
        }
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        if (game.state().mode !== "paused") {
            game.update(dt, {keys, pointer});
        }
        game.render(art);
        frame = requestAnimationFrame(loop);
    }

    function open() {
        isOpen = true;
        previousFocus = document.activeElement;
        overlay = document.createElement("dialog");
        overlay.className = "bugbash";
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Bug Bash, a small shooter game");
        overlay.innerHTML =
            '<div class="bugbash-frame"><button class="bugbash-close" type="button" aria-label="Close the game">×</button>' +
            '<canvas tabindex="0" aria-label="Game area. Space to start or fire, arrows or A and D to move, P to pause or resume." width="' +
            W +
            '" height="' +
            H +
            '"></canvas>' +
            '<p class="bugbash-help"><span class="bugbash-keys">Arrows or A/D to move · Space to fire · P to pause · Esc to quit</span>' +
            '<span class="bugbash-touch">Tap to start or resume · Drag to move and fire</span></p></div>';
        overlay.addEventListener("cancel", function (event) {
            event.preventDefault();
            window.siteModes.toggle("bugbash");
        });
        document.body.appendChild(overlay);
        overlay.showModal();
        document.documentElement.classList.add("bugbash-open");
        canvas = overlay.querySelector("canvas");
        art = runtime.pixels(canvas.getContext("2d"));
        overlay.querySelector(".bugbash-close").addEventListener("click", function () {
            window.siteModes.toggle("bugbash");
        });
        ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(function (type) {
            canvas.addEventListener(type, onPointer);
        });
        fit();
        game.reset("title");
        keys = {};
        pointer = null;
        cheatSequence = "";
        cheatLastKey = 0;
        // Wait for the key that typed the shortcut to finish before listening.
        setTimeout(function () {
            if (!isOpen) {
                return;
            }
            document.addEventListener("keydown", onKey, true);
            document.addEventListener("keyup", onKey, true);
        }, 0);
        music.start();
        last = 0;
        frame = requestAnimationFrame(loop);
        canvas.addEventListener("blur", function () {
            cheatSequence = "";
            keys = {};
            pointer = null;
        });
        canvas.focus();
    }
    function close() {
        isOpen = false;
        cancelAnimationFrame(frame);
        document.removeEventListener("keydown", onKey, true);
        document.removeEventListener("keyup", onKey, true);
        document.documentElement.classList.remove("bugbash-open");
        if (overlay) {
            overlay.close();
            overlay.remove();
        }
        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
        previousFocus = null;
        overlay = canvas = null;
        music.stop();
        runtime.hush("bugbash");
        game.sounds.stop();
    }
    function sync() {
        const active = window.siteModes.current() === "bugbash";
        if (active && !isOpen) {
            open();
        } else if (!active && isOpen) {
            close();
        }
        // Pause when the tab is hidden; the music stops with it.
        if (isOpen && document.hidden) {
            keys = {};
            pointer = null;
            if (game.state().mode === "play") {
                game.state().mode = "paused";
            }
            music.stop();
        } else if (isOpen) {
            music.start();
        }
    }
    window.addEventListener("resize", fit);
    document.addEventListener("modechange", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", function () {
        if (isOpen) {
            close();
        }
    });
})();