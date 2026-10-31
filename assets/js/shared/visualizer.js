(function () {
    "use strict";
    const brand = document.querySelector(".site-brand");
    if (!brand) {
        return;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "chiptune-visualizer";
    canvas.width = 1;
    canvas.height = 32;
    canvas.hidden = true;
    canvas.setAttribute("aria-hidden", "true");
    brand.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let analyser;
    let bins;
    let edges;
    let frame = 0;
    let last = 0;
    let peaks = new Float32Array(0);
    let width = 0;
    let height = 32;
    let barCount = 0;
    let sampleRate = 0;
    const barWidth = 4;
    const barPitch = 6;
    const blockHeight = 2;
    const blockPitch = 4;
    const reducedMotion = window.siteRuntime.reducedMotion;
    function position() {
        canvas.hidden = !analyser || document.hidden;
    }

    function frequencyBands() {
        edges = [];
        if (!analyser) {
            return;
        }
        const binWidth = sampleRate / analyser.fftSize;
        for (let i = 0; i <= barCount; i++) {
            edges.push(Math.min(bins.length - 1, Math.max(1, Math.round((90 * Math.pow(6500 / 90, i / barCount)) / binWidth))));
        }
    }

    function resize() {
        const box = canvas.getBoundingClientRect();
        width = box.width;
        height = box.height;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        barCount = Math.max(1, Math.floor((width + barPitch - barWidth) / barPitch));
        peaks = new Float32Array(barCount);
        frequencyBands();
        if (analyser && !canvas.hidden) {
            draw(0);
        }
    }

    function draw(dt) {
        ctx.clearRect(0, 0, width, height);
        // The playing feature's colours, from the registry.
        const feature = window.siteFeatures[window.siteModes.current()];
        const colors = feature && feature.visualizer || { bar: "#65e3b7", peak: "#b8a1ff" };
        const base = colors.bar;
        const highlight = colors.peak;
        if (!reducedMotion.matches) {
            analyser.getFloatFrequencyData(bins);
        }
        const levels = Math.floor(height / blockPitch);
        const baseline = height - blockHeight;
        const left = Math.floor((width - ((barCount - 1) * barPitch + barWidth)) / 2);
        for (let bar = 0; bar < barCount; bar++) {
            let level = 0;
            if (!reducedMotion.matches) {
                const end = Math.min(bins.length, Math.max(edges[bar] + 1, edges[bar + 1]));
                // Keep narrow chip harmonics visible instead of averaging them away
                // in the wider treble bands. Quiet tails still fall below the gate.
                let power = 0;
                let strongest = 0;
                for (let bin = edges[bar]; bin < end; bin++) {
                    const energy = Math.pow(10, bins[bin] / 10);
                    power += energy;
                    strongest = Math.max(strongest, energy);
                }
                const decibels = 10 * Math.log10(0.6 * strongest + (0.4 * power) / (end - edges[bar]));
                const frequency = ((edges[bar] + end) * 0.5 * sampleRate) / analyser.fftSize;
                const trebleLift = Math.min(18, Math.max(0, 4 * Math.log2(frequency / 250)));
                const gate = Math.max(0, Math.min(1, (decibels + 82) / 10));
                const audible = Math.max(0, Math.min(1, (decibels + trebleLift + 74) / 44));
                level = Math.pow(audible, 1.05) * gate;
            }
            const blocks = Math.round(level * levels);
            peaks[bar] = Math.max(blocks, peaks[bar] - dt * 12);
            // Frequency stays at a fixed x; loudness grows upward from the baseline.
            const x = left + bar * barPitch;
            // A split display (Portal's) keeps its two colours apart: the peak colour low, the bar colour high.
            const splitColor = bar < barCount / 2 ? highlight : base;
            ctx.fillStyle = colors.split ? splitColor : base;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(x, baseline, barWidth, blockHeight);
            const gradient = ctx.createLinearGradient(0, baseline + blockHeight, 0, baseline - Math.max(1, blocks - 1) * blockPitch);
            gradient.addColorStop(0, base);
            gradient.addColorStop(1, highlight);
            ctx.fillStyle = colors.split ? splitColor : gradient;
            ctx.globalAlpha = 0.85;
            for (let block = 0; block < blocks; block++) {
                ctx.fillRect(x, baseline - block * blockPitch, barWidth, blockHeight);
            }
            if (peaks[bar] > 0) {
                ctx.fillStyle = colors.split ? splitColor : highlight;
                ctx.globalAlpha = 1;
                ctx.fillRect(x, Math.max(0, baseline - Math.ceil(peaks[bar]) * blockPitch), barWidth, blockHeight);
            }
        }
        ctx.globalAlpha = 1;
    }

    function animate(now) {
        if (reducedMotion.matches) {
            peaks.fill(0);
            draw(0);
            frame = 0;
            return;
        }
        if (now - last >= 33) {
            draw(last ? Math.min((now - last) / 1000, 0.1) : 0);
            last = now;
        }
        frame = requestAnimationFrame(animate);
    }

    function update() {
        cancelAnimationFrame(frame);
        frame = 0;
        position();
        if (canvas.hidden) {
            return;
        }
        if (reducedMotion.matches) {
            peaks.fill(0);
            draw(0);
        } else {
            last = 0;
            frame = requestAnimationFrame(animate);
        }
    }

    document.addEventListener("chiptunechange", function (event) {
        const sound = event.detail;
        if (!sound.playing) {
            // A previous mode can finish stopping after the next one has started.
            if (analyser !== sound.analyser) {
                return;
            }
            analyser = null;
        } else {
            analyser = sound.analyser;
            bins = new Float32Array(analyser.frequencyBinCount);
            sampleRate = sound.sampleRate;
            frequencyBands();
            peaks.fill(0);
        }
        update();
    });
    new ResizeObserver(resize).observe(canvas);
    resize();
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    window.addEventListener("pagehide", function () {
        cancelAnimationFrame(frame);
        canvas.hidden = true;
    });
})();