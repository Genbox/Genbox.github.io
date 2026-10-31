(function () {
    "use strict";
    // Shared plumbing for the hero sprite modes: pixel drawing on an 80×96 grid shown at 2×, a 3×5 pixel font,
    // a runner that keeps the sprite (and an optional page-wide layer) in time with the mode's soundtrack, and
    // speech.
    const font = {
        A: "010101111101101",
        B: "110101110101110",
        C: "011100100100011",
        D: "110101101101110",
        E: "111100110100111",
        F: "111100110100100",
        G: "011100101101011",
        H: "101101111101101",
        I: "111010010010111",
        J: "001001001101010",
        K: "101101110101101",
        L: "100100100100111",
        M: ["10001", "11011", "10101", "10001", "10001"],
        N: ["1001", "1101", "1011", "1001", "1001"],
        O: "010101101101010",
        P: "110101110100100",
        Q: "010101101110011",
        R: "110101110101101",
        S: "011100010001110",
        T: "111010010010010",
        U: "101101101101111",
        V: "101101101101010",
        W: ["10001", "10001", "10101", "11011", "10001"],
        X: "101101010101101",
        Y: "101101010010010",
        Z: "111001010100111",
        0: "111101101101111",
        1: "010110010010111",
        2: "110001010100111",
        3: "110001010001110",
        4: "101101111001001",
        5: "111100110001110",
        6: "011100110101010",
        7: "111001010010010",
        8: "010101010101010",
        9: "111101111001110",
        ".": ["0", "0", "0", "0", "1"],
        ",": ["00", "00", "00", "01", "10"],
        "!": ["1", "1", "1", "0", "1"],
        "?": "110001010000010",
        "'": ["1", "1", "0", "0", "0"],
        '"': "101101000000000",
        ":": ["0", "1", "0", "1", "0"],
        "-": "000000111000000",
        "(": ["01", "10", "10", "10", "01"],
        ")": ["10", "01", "01", "01", "10"],
        "%": "101001010100101",
        "/": "001001010100100",
        "*": "000101010101000",
        "=": "000111000111000",
        ">": "100010001010100",
        "<": "001010100010001",
        "+": "000010111010000",
        _: "000000000000111",
        "#": "101111101111101",
        " ": ["00", "00", "00", "00", "00"]
    };
    Object.keys(font).forEach(function (letter) {
        if (typeof font[letter] === "string") {
            font[letter] = font[letter].match(/.../g);
        }
    });
    function glyph(letter) {
        return font[letter.toUpperCase()] || font["?"];
    }

    function pixels(ctx) {
        const art = {
            ctx,
            rect(color, x, y, w, h) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            },
            // A pixel ellipse, filled row by row on whole pixels.
            ellipse(color, cx, cy, rx, ry) {
                for (let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++) {
                    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - Math.pow((y - cy) / ry, 2))));
                    if (half > 0) {
                        art.rect(color, Math.round(cx) - half, y, half * 2, 1);
                    }
                }
            },
            alpha(amount) {
                ctx.globalAlpha = Math.max(0, Math.min(1, amount));
            },
            width(label) {
                return label.split("").reduce(function (sum, letter) {
                    return sum + glyph(letter)[0].length + 1;
                }, -1);
            },
            text(label, x, y, color) {
                label.split("").forEach(function (letter) {
                    const rows = glyph(letter);
                    rows.forEach(function (row, dy) {
                        for (let dx = 0; dx < row.length; dx++) {
                            if (row[dx] === "1") {
                                art.rect(color, x + dx, y + dy, 1, 1);
                            }
                        }
                    });
                    x += rows[0].length + 1;
                });
                return x;
            },
            // Greedy word wrap to a pixel width.
            wrap(label, width) {
                const lines = [];
                label.split(" ").forEach(function (word) {
                    const line = lines.length ? lines[lines.length - 1] + " " + word : word;
                    if (lines.length && art.width(line) <= width) {
                        lines[lines.length - 1] = line;
                    } else {
                        lines.push(word);
                    }
                });
                return lines;
            }
        };
        return art;
    }

    // Runs a hero: shows its artwork while its mode is on, plays its soundtrack, and draws frames in time with it.
    // options:
    //   mode: the mode's name; its soundtrack is siteRuntime.sounds[mode].
    //   sprite: the hero element's selector. Frames are drawn on it (a canvas) or on the canvas inside it, scaled
    //     so the drawing always works on an 80×96 grid.
    //   draw(art, t): draws the sprite at t seconds into the mode.
    //   layer: { className, draw(ctx, width, height, t) } for a page-wide canvas behind the content.
    //   toggle(active): extra setup and teardown as the mode turns on or off.
    //   still: t for the single frame shown with reduced motion; fps: frames a second (20).
    // Returns { refresh }, to redraw after something the frames depend on (such as an image) has loaded.
    function spriteMode(options) {
        const sprite = options.sprite && document.querySelector(options.sprite);
        if (options.sprite && !sprite) {
            return {
                refresh() {
                }};
        }
        const canvas = sprite && (sprite instanceof HTMLCanvasElement ? sprite : sprite.querySelector("canvas"));
        const art = canvas && pixels(canvas.getContext("2d"));
        const scale = canvas ? canvas.width / 80 : 1;
        const sound = window.siteRuntime.sounds[options.mode];
        const still = options.still || 0;
        let began = 0;
        let playing = false;
        let greet = false;
        let state = "off";
        let layer = null;

        function active() {
            return window.siteModes.current() === options.mode;
        }
        function draw(t) {
            if (art && options.draw) {
                art.ctx.clearRect(0, 0, canvas.width, canvas.height);
                art.ctx.save();
                art.ctx.scale(scale, scale);
                options.draw(art, t);
                art.ctx.restore();
            }
            if (layer) {
                layer.ctx.clearRect(0, 0, layer.width, layer.height);
                layer.ctx.save();
                options.layer.draw(layer.ctx, layer.width, layer.height, t);
                layer.ctx.restore();
            }
        }
        // The soundtrack's clock once it is playing; until then (or without one), the time since the mode started.
        function elapsed(now) {
            const start = sound.startedAt ? Math.max(sound.startedAt(), began) : began;
            return Math.max(0, now - start) / 1000;
        }
        const frames = window.siteRuntime.loop(
            function (delta, now) {
                draw(elapsed(now));
            },
            {
                fps: options.fps || 20,
                change(next) {
                    state = next;
                    if (state === "off" || state === "paused") {
                        playing = false;
                        sound.stop();
                        hush(options.mode);
                        return;
                    }
                    if (!playing) {
                        began = performance.now();
                    }
                    playing = true;
                    // Tell the soundtrack when the visitor has just switched the mode on, so Joshua can greet them.
                    sound.start(greet);
                    greet = false;
                    if (state === "still") {
                        draw(still);
                    }
                }
            }
        );
        function update() {
            const on = active();
            if (sprite) {
                sprite.hidden = !on;
            }
            if (options.layer && on && !layer) {
                layer = window.siteRuntime.pageLayer("mode-layer " + options.layer.className, {
                    behind: true,
                    maxRatio: 1.5,
                    resized() {
                        if (state === "still") {
                            draw(still);
                        }
                    }
                });
            } else if (!on && layer) {
                layer.remove();
                layer = null;
            }
            if (options.toggle) {
                options.toggle(on);
            }
            greet = on;
            frames.toggle(on);
        }
        document.addEventListener("modechange", update);
        window.addEventListener("pagehide", function () {
            playing = false;
            sound.stop();
        });
        update();
        return {
            refresh() {
                if (state === "still") {
                    draw(still);
                }
            }
        };
    }

    // How strongly to draw a page layer at x: faint over the reading column, full in the margins.
    function readingFade(x, width) {
        return Math.abs(x - width / 2) < Math.min(width, 1180) / 2 - 30 ? 0.3 : 1;
    }

    // Speech for the modes that talk, through the browser's own synthesizer. One line at a time: a new line
    // cuts off the last one. options.voice picks "female" or "male" where the system has a matching English
    // voice; pitch and rate shape the character.
    const speech = window.speechSynthesis;
    let speechOwner = null;
    let currentUtterance = null;
    const voiceNames = {
        female: /zira|samantha|aria|jenny|libby|sonia|hazel|susan|karen|female/i,
        male: /david|mark|daniel|guy|ryan|george|alex|fred|\bmale/i
    };
    function speak(text, options) {
        if (!speech) {
            return;
        }
        options = options || {};
        const voices = speech.getVoices().filter(function (voice) {
            return /^en/i.test(voice.lang);
        });
        const pattern = voiceNames[options.voice];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice =
            pattern &&
                voices.filter(function (voice) {
                    return pattern.test(voice.name);
                })[0] ||
            voices[0] ||
            null;
        utterance.lang = "en-US";
        utterance.pitch = options.pitch || 1;
        utterance.rate = options.rate || 1;
        utterance.volume = options.volume || 0.8;
        speech.cancel();
        speechOwner = window.siteModes.current();
        currentUtterance = utterance;
        utterance.onend = utterance.onerror = function () {
            if (currentUtterance !== utterance) {
                return;
            }
            currentUtterance = null;
            speechOwner = null;
            if (options.onEnd) {
                options.onEnd();
            }
        };
        speech.speak(utterance);
    }
    function hush(owner) {
        if (!speech || speechOwner !== owner || !currentUtterance) {
            return;
        }
        currentUtterance = null;
        speechOwner = null;
        speech.cancel();
    }
    // Sentence case for the pixel font's capitals, so the synthesizer reads words instead of spelling them.
    function sentenceCase(text) {
        return text
            .toLowerCase()
            .replace(/(^|[.?!] )([a-z])/g, function (match, gap, letter) {
                return gap + letter.toUpperCase();
            })
            .replace(/\bi(?=\b)/g, "I");
    }

    window.siteRuntime.speak = speak;
    window.siteRuntime.hush = hush;
    window.siteRuntime.canSpeak = !!speech;
    window.siteRuntime.sentenceCase = sentenceCase;
    window.siteRuntime.pixels = pixels;
    window.siteRuntime.spriteMode = spriteMode;
    window.siteRuntime.readingFade = readingFade;
})();