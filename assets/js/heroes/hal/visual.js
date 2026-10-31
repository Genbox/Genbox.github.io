(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.hal;
    let caption;
    let currentLine;
    let nextLine;
    let currentPhrase = -1;
    let currentSyllable = -1;
    let captionBegan = 0;

    function updateCaption(t) {
        if (!caption) {
            return;
        }
        const time = t % sound.loop;
        let cue = sound.lyricCues[0];
        for (const candidate of sound.lyricCues) {
            if (candidate.at > time) {
                break;
            }
            cue = candidate;
        }
        if (cue.phrase !== currentPhrase) {
            currentPhrase = cue.phrase;
            currentSyllable = -1;
            currentLine.replaceChildren();
            currentLine.setAttribute("aria-label", sound.phrases[currentPhrase].join(""));
            sound.phrases[currentPhrase].forEach(function (syllable) {
                const span = document.createElement("span");
                span.textContent = syllable;
                span.setAttribute("aria-hidden", "true");
                currentLine.appendChild(span);
            });
            nextLine.textContent = sound.phrases[(currentPhrase + 1) % sound.phrases.length].join("");
        }
        if (cue.syllable !== currentSyllable) {
            currentSyllable = cue.syllable;
            Array.from(currentLine.children).forEach(function (span, index) {
                span.classList.toggle("is-current", index === currentSyllable);
                span.classList.toggle("is-sung", index < currentSyllable);
            });
        }
    }

    // Captions follow the audio clock even when reduced motion holds the artwork still.
    const captionLoop = window.siteRuntime.loop(
        function (delta, now) {
            const start = Math.max(sound.startedAt(), captionBegan);
            updateCaption(Math.max(0, now - start) / 1000);
        },
        { fps: 20, ignoreMotion: true }
    );

    function toggle(active) {
        if (active && !caption) {
            const hero = document.querySelector(".hero");
            if (!hero) {
                return;
            }
            caption = document.createElement("div");
            caption.className = "hal-caption";
            const label = document.createElement("div");
            label.className = "hal-caption-label";
            label.textContent = "HAL 9000 · Daisy Bell";
            currentLine = document.createElement("p");
            currentLine.className = "hal-caption-current";
            nextLine = document.createElement("p");
            nextLine.className = "hal-caption-next";
            caption.append(label, currentLine, nextLine);
            hero.appendChild(caption);
            captionBegan = performance.now();
            updateCaption(0);
        } else if (!active && caption) {
            caption.remove();
            caption = currentLine = nextLine = null;
            currentPhrase = currentSyllable = -1;
        }
        captionLoop.toggle(active);
    }

    // How bright the eye is: a steady glow that swells on each sung note, fading out over the wind-down and
    // flickering back on as the loop restarts.
    function glowAt(t) {
        t %= sound.loop;
        let since = Infinity;
        sound.onsets.forEach(function (onset) {
            if (onset <= t) {
                since = t - onset;
            }
        });
        let glow = 0.7 + 0.3 * Math.exp(-since * 2.2);
        if (t > sound.windDown) {
            glow *= Math.max(0.12, 1 - (t - sound.windDown) / (sound.loop - sound.windDown - 0.6));
        }
        if (t < 0.6) {
            glow *= [0.2, 0.9, 0.3, 1, 0.6, 1][Math.floor(t * 10)] || 1;
        }
        return glow;
    }

    function draw(art, t) {
        const glow = glowAt(t);
        // Brushed steel panel with a black nameplate, the camera lens and a speaker grille.
        art.rect("#1a1c20", 16, 4, 48, 84);
        art.rect("#9aa1a9", 17, 5, 46, 82);
        art.rect("#c3c9cf", 17, 5, 46, 1);
        art.rect("#6d747c", 62, 6, 1, 81);
        for (let line = 0; line < 20; line++) {
            art.rect(line % 2 ? "#a7adb4" : "#8f969e", 18, 7 + line * 4, 44, 1);
        }
        art.rect("#0b0c0f", 21, 9, 38, 9);
        art.rect("#2b6fd6", 37, 10, 21, 7);
        art.text("HAL", 24, 11, "#f2f4f6");
        art.text("9000", 40, 11, "#f2f4f6");

        art.ellipse("#5b6168", 40, 41, 15, 15);
        art.ellipse("#d4d8dc", 40, 40, 14, 14);
        art.ellipse("#050506", 40, 41, 12, 12);
        // The red eye, lit from within, darkening as the glow fades.
        [
            [10, "#5a0606"],
            [8, "#9c0f0b"],
            [6, "#e01d10"],
            [4, "#ff4a24"],
            [2, "#ffb347"],
            [1, "#fff1c2"]
        ].forEach(function (ring) {
            art.ellipse(ring[1], 40, 41, ring[0], ring[0]);
        });
        art.alpha(1 - glow);
        art.ellipse("#050506", 40, 41, 10, 10);
        art.alpha(0.55);
        art.rect("#ffffff", 33, 33, 3, 1);
        art.rect("#ffffff", 32, 34, 1, 2);
        art.alpha(1);

        art.rect("#2a2d32", 24, 62, 32, 20);
        for (let slot = 0; slot < 6; slot++) {
            art.rect("#0d0e10", 26, 64 + slot * 3, 28, 2);
        }
    }

    // A red glow around the edges of the page that breathes with the eye.
    function drawLayer(ctx, width, height, t) {
        const glow = glowAt(t);
        const radius = Math.max(width, height) * 0.75;
        const gradient = ctx.createRadialGradient(width / 2, height / 2, radius * 0.35, width / 2, height / 2, radius);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.6, "rgba(90, 0, 0, " + 0.18 * glow + ")");
        gradient.addColorStop(1, "rgba(170, 10, 0, " + 0.42 * glow + ")");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    window.siteRuntime.spriteMode({
        mode: "hal",
        sprite: ".hal-sprite",
        draw,
        toggle,
        still: 1.5,
        fps: 20,
        layer: { className: "hal-glow", draw: drawLayer }
    });
})();