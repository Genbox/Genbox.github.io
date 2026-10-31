(function () {
    "use strict";
    const sound = window.siteRuntime.sounds.clippy;
    const colors = {
        wire: "#8f99a4",
        shine: "#e6ebf0",
        shadow: "#4f5862",
        ink: "#141414",
        bubble: "#ffffe1",
        paper: "#fff6b8",
        rule: "#9cc3e6"
    };
    const tips = [
        "IT LOOKS LIKE YOU'RE READING A BLOG. NEED HELP?",
        "TIP: THE ARTICLES ARE DOWN THERE.",
        "DID YOU KNOW? SCROLLING MOVES THE PAGE.",
        "WANT ME TO SUMMARIZE THIS FOR YOU? TOO BAD.",
        "IT LOOKS LIKE YOU'RE BORED. TRY TYPING NYAN."
    ];
    const reactions = {
        copy: "IT LOOKS LIKE YOU'RE COPYING CODE. MIND THE LICENSE!",
        scroll: "WHOA! SLOW DOWN, IT'S NOT GOING ANYWHERE.",
        select: "WOULD YOU LIKE HELP SELECTING TEXT?"
    };
    let reaction = null;
    let said = null;
    let bubbleUntil = 0;
    let speechId = 0;

    // The wire, as a path of lines and half-turns: up the inner right, over a small bend, down the inner left,
    // round the bottom, up the outer right, over the big top bend and down the outer left.
    const path = [];
    function line(x0, y0, x1, y1) {
        const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
        for (let i = 0; i <= steps; i++) {
            path.push([x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps]);
        }
    }
    function arc(cx, cy, r, from, to) {
        const steps = Math.ceil(Math.abs(to - from) * r * 2);
        for (let i = 0; i <= steps; i++) {
            const a = from + ((to - from) * i) / steps;
            path.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
    }
    line(44, 74, 44, 52);
    arc(40, 52, 4, 0, -Math.PI);
    line(36, 52, 36, 84);
    arc(42, 84, 6, Math.PI, 0);
    line(48, 84, 48, 44);
    arc(40, 44, 8, 0, -Math.PI);
    line(32, 44, 32, 76);

    // The current message: a reaction to what the reader just did, otherwise the next tip every four bars.
    function messageAt(t, now) {
        if (reaction && now - reaction.at < 4500) {
            return { text: reaction.text, age: (now - reaction.at) / 1000 };
        }
        return { text: tips[Math.floor(t / sound.tip) % tips.length], age: t % sound.tip };
    }

    function draw(art, t) {
        const message = messageAt(t, performance.now());
        const bounce = message.age < 0.25 ? -1 : 0;
        // Read each new tip or reaction aloud, once, in a bright and eager voice.
        if (message.text !== said) {
            said = message.text;
            const id = ++speechId;
            bubbleUntil = window.siteRuntime.canSpeak ? Infinity : performance.now() + Math.max(3000, message.text.length * 65) + 1000;
            window.siteRuntime.speak(window.siteRuntime.sentenceCase(message.text), {
                voice: "male",
                pitch: 1.35,
                rate: 1.1,
                onEnd() {
                    if (id === speechId) {
                        bubbleUntil = performance.now() + 1000;
                    }
                }
            });
        }
        art.rect(colors.ink, 21, 75, 38, 19);
        art.rect(colors.paper, 22, 76, 36, 17);
        for (let rule = 0; rule < 4; rule++) {
            art.rect(colors.rule, 22, 80 + rule * 4, 36, 1);
        }
        art.rect("#e58a8a", 26, 76, 1, 17);

        path.forEach(function (point) {
            art.rect(colors.shadow, Math.round(point[0]) - 1, Math.round(point[1]) + bounce, 3, 2);
        });
        path.forEach(function (point) {
            art.rect(colors.wire, Math.round(point[0]) - 1, Math.round(point[1]) + bounce - 1, 2, 2);
        });
        path.forEach(function (point) {
            art.rect(colors.shine, Math.round(point[0]) - 1, Math.round(point[1]) + bounce - 1, 1, 1);
        });

        // Big eyes looking up at the bubble, with eyebrows that jump when there is something new to say.
        const blink = t % 3.3 < 0.12;
        const raised = message.age < 0.6 ? 2 : 0;
        [35, 45].forEach(function (x) {
            art.ellipse(colors.ink, x, 47 + bounce, 4.5, 5.5);
            art.ellipse("#ffffff", x, 47 + bounce, 3.5, 4.5);
            if (blink) {
                art.rect(colors.ink, x - 3, 47 + bounce, 7, 1);
            } else {
                art.rect(colors.ink, x - 2, 44 + bounce, 2, 3);
            }
            art.rect(colors.ink, x - 3, 39 + bounce - raised, 7, 2);
        });

        if (performance.now() >= bubbleUntil) {
            return;
        }
        const shown = message.text.slice(0, Math.floor(message.age * 45) + 1);
        const lines = art.wrap(message.text, 70).map(function (full, i, all) {
            const before = all.slice(0, i).join(" ").length + (i ? 1 : 0);
            return shown.slice(before, before + full.length);
        });
        const height = lines.length * 7 + 3;
        art.rect(colors.ink, 2, 2, 76, height + 2);
        art.rect(colors.bubble, 3, 3, 74, height);
        for (let tail = 0; tail < 4; tail++) {
            art.rect(colors.ink, 38 - tail, height + 4 + tail, 6 - tail, 1);
            art.rect(colors.bubble, 39 - tail, height + 3 + tail, 4 - tail, 1);
        }
        lines.forEach(function (text, i) {
            art.text(text, 5, 5 + i * 7, colors.ink);
        });
    }

    // Reactions to the reader, only while the mode is on.
    let lastScroll = 0;
    let lastY = 0;
    let lastSelect = 0;
    function react(kind) {
        reaction = { text: reactions[kind], at: performance.now() };
    }
    function onCopy() {
        react("copy");
    }
    function onScroll() {
        const now = performance.now();
        const y = scrollY;
        if (now - lastScroll < 200 && Math.abs(y - lastY) > 900) {
            react("scroll");
        }
        if (now - lastScroll >= 200) {
            lastScroll = now;
            lastY = y;
        }
    }
    function onSelect() {
        const now = performance.now();
        const selection = String(document.getSelection() || "");
        if (selection.trim().length > 3 && now - lastSelect > 8000 && !(reaction && now - reaction.at < 4500)) {
            lastSelect = now;
            react("select");
        }
    }
    function toggle(on) {
        const method = on ? "addEventListener" : "removeEventListener";
        document[method]("copy", onCopy);
        document[method]("selectionchange", onSelect);
        window[method]("scroll", onScroll, { passive: true });
        if (!on) {
            reaction = null;
            said = null;
            bubbleUntil = 0;
            speechId++;
        }
    }

    window.siteRuntime.spriteMode({
        mode: "clippy",
        sprite: ".clippy-sprite",
        draw,
        still: 2,
        fps: 20,
        toggle
    });
})();