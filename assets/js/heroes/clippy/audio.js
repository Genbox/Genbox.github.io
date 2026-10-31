(function () {
    "use strict";
    // Original eight-bar office jingle in F major: a soft plucked bass, a marimba-like triangle tune and gentle
    // chords. A bright "ding" every four bars announces the assistant's next tip.
    const roots = [41, 46, 48, 41, 38, 46, 48, 41];
    const thirds = [4, 4, 4, 4, 3, 4, 4, 4];
    // One entry per eighth; a 0 is a rest.
    const melody = [
        [72, 0, 69, 72, 77, 0, 76, 74],
        [74, 0, 70, 74, 77, 0, 0, 0],
        [76, 0, 72, 76, 79, 0, 77, 76],
        [77, 0, 0, 72, 69, 0, 0, 0],
        [74, 0, 69, 74, 77, 0, 74, 72],
        [70, 0, 74, 77, 82, 0, 81, 79],
        [79, 0, 76, 72, 79, 0, 77, 76],
        [77, 0, 0, 0, 0, 0, 0, 0]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 104,
        steps: 128,
        volume: 0.195,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (step % 64 === 0) {
                voice.note(96, at, 0.5, 0.05, "sine");
                voice.note(103, at + 0.06, 0.6, 0.035, "sine");
            }
            if (sixteenth % 2 === 0) {
                const note = melody[bar][sixteenth / 2];
                if (note) {
                    voice.note(note, at, length * 1.5, 0.11, "triangle");
                }
            }
            if (sixteenth === 0 || sixteenth === 8) {
                voice.note(root - 12, at, length * 3, 0.2, "triangle");
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.arp([root + 12, root + 12 + thirds[bar], root + 19], at, length * 3, 0.025, 0.5);
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.015);
            }
        }
    });

    window.siteRuntime.sounds.clippy = {
        ...song,
        tip: (64 * 60) / 104 / 4
    };
})();