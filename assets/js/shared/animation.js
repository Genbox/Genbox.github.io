(function () {
    "use strict";
    // Shared plumbing for the animated features: a frame loop that sleeps while the tab is hidden or motion is
    // reduced, and page-wide canvases that follow the window's size.
    const reducedMotion = window.siteRuntime.reducedMotion;

    // Calls step(delta, now) every animation frame while switched on, with delta the milliseconds since the last
    // step (0 on the first, and at most options.maxStep, 100 by default, after a stall).
    // options:
    //   fps: at most this many steps a second.
    //   ignoreMotion: keep stepping with reduced motion, for a step that tones its own motion down.
    //   change(state): runs as the loop changes between "running", "still" (on, but holding a still frame for
    //     reduced motion), "paused" (on, in a hidden tab) and "off".
    // Returns { toggle(on) }.
    function loop(step, options) {
        options = options || {};
        const tick = options.fps ? 1000 / options.fps : 0;
        let on = false;
        let state = "off";
        let frame = 0;
        let previous = 0;
        let lastFrame = -1;

        function animate(now) {
            if (state !== "running") {
                return;
            }
            frame = requestAnimationFrame(animate);
            if (tick) {
                const current = Math.floor(now / tick);
                if (current === lastFrame) {
                    return;
                }
                lastFrame = current;
            }
            const delta = previous ? Math.min(now - previous, options.maxStep || 100) : 0;
            previous = now;
            step(delta, now);
        }
        function sync() {
            let next = "running";
            if (!on) {
                next = "off";
            } else if (document.hidden) {
                next = "paused";
            } else if (reducedMotion.matches && !options.ignoreMotion) {
                next = "still";
            }
            if (next === state) {
                return;
            }
            state = next;
            cancelAnimationFrame(frame);
            frame = 0;
            previous = 0;
            lastFrame = -1;
            if (state === "running") {
                frame = requestAnimationFrame(animate);
            }
            if (options.change) {
                options.change(state);
            }
        }
        document.addEventListener("visibilitychange", sync);
        reducedMotion.addEventListener("change", sync);
        return {
            toggle(active) {
                on = active;
                sync();
            }
        };
    }

    // A fixed canvas covering the window, drawn in CSS pixels at up to options.maxRatio (1) device pixels each.
    // options:
    //   behind: put it behind the page's content instead of in front.
    //   resized(layer): runs after each change of size, which clears the canvas.
    // Returns { canvas, ctx, width, height, remove() }.
    function pageLayer(className, options) {
        options = options || {};
        const canvas = document.createElement("canvas");
        const layer = {canvas, ctx: canvas.getContext("2d"), width: 0, height: 0, remove};
        canvas.className = className;
        canvas.setAttribute("aria-hidden", "true");

        function resize() {
            const ratio = Math.min(devicePixelRatio || 1, options.maxRatio || 1);
            layer.width = innerWidth;
            layer.height = innerHeight;
            canvas.width = Math.round(layer.width * ratio);
            canvas.height = Math.round(layer.height * ratio);
            layer.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            if (options.resized) {
                options.resized(layer);
            }
        }
        function remove() {
            window.removeEventListener("resize", resize);
            canvas.remove();
        }
        if (options.behind) {
            document.body.prepend(canvas);
        } else {
            document.body.appendChild(canvas);
        }
        window.addEventListener("resize", resize);
        resize();
        return layer;
    }

    window.siteRuntime.loop = loop;
    window.siteRuntime.pageLayer = pageLayer;
})();