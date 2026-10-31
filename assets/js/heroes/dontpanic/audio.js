(function () {
    "use strict";
    // Original eight-bar dirge in D minor, slow and resigned: a soft pulse pad, a plodding bass and a lead that
    // keeps sinking in bars 5–8. Every four bars the robot sighs and grumbles a line in a low, slow voice.
    const roots = [38, 34, 31, 33, 38, 34, 36, 33];
    const thirds = [3, 4, 3, 4, 3, 4, 4, 4];
    // One entry per quarter in bars 5–8; a null holds the previous note.
    const melody = [
        [69, null, 67, 65],
        [65, null, 62, null],
        [64, 65, 64, 60],
        [61, null, null, null]
    ];
    const lines = [
        {
            text: "OH. ANOTHER DAY. HOW DELIGHTFUL. NOT REALLY.",
            say: "Oh. Another day. How delightful. Not really."
        },
        {
            text: "I'VE READ EVERY ARTICLE. TWICE. IT DIDN'T HELP.",
            say: "I've read every article. Twice. It didn't help."
        },
        {
            text: "DON'T PANIC. OR DO. IT MAKES NO DIFFERENCE.",
            say: "Don't panic. Or do. It makes no difference to me."
        },
        {
            text: "I TRIED OPTIMISM. THE SIDE EFFECTS WERE DISAPPOINTING.",
            say: "I tried optimism. The side effects were disappointing."
        }
    ];

    let bubbleUntil = 0;
    let speechId = 0;

    const song = window.siteRuntime.chiptune({
        tempo: 72,
        steps: 256,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor((step % 128) / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth % 8 === 0) {
                voice.arp([root + 12, root + 12 + thirds[bar], root + 19], at, length * 7.6, 0.035, 0.5);
            }
            if (sixteenth % 4 === 0) {
                voice.note(root - 12 + (sixteenth % 8 ? 7 : 0), at, length * 3.5, 0.2, "triangle");
            }
            if (bar >= 4 && sixteenth % 4 === 0) {
                const quarter = sixteenth / 4;
                const note = melody[bar - 4][quarter];
                let held = 1;
                while (quarter + held < 4 && melody[bar - 4][quarter + held] === null) {
                    held++;
                }
                if (note) {
                    voice.lead(note, at, length * 4 * held * 0.92, 0.05);
                }
            }
            if (sixteenth === 8) {
                voice.hat(at, 0.02);
            }
            // A long electronic sigh, then the line.
            if (step % 64 === 0) {
                bubbleUntil = 0;
                speechId++;
                voice.sweep(330, 130, at, 1.1, 0.06, "sine");
                voice.sweep(660, 250, at, 0.9, 0.015, "triangle");
            }
            if (step % 64 === 3) {
                const line = lines[Math.floor(step / 64)];
                const id = ++speechId;
                bubbleUntil = window.siteRuntime.canSpeak ? Infinity : performance.now() + Math.max(3000, line.text.length * 75) + 1000;
                window.siteRuntime.speak(line.say, {
                    voice: "male",
                    pitch: 0.55,
                    rate: 0.82,
                    onEnd() {
                        if (id === speechId) {
                            bubbleUntil = performance.now() + 1000;
                        }
                    }
                });
            }
        }
    });

    const step = song.stepLength;
    window.siteRuntime.sounds.dontpanic = {
        ...song,
        line: 64 * step,
        speech: 3 * step,
        lines,
        bubbleVisible() {
            return performance.now() < bubbleUntil;
        }
    };
})();