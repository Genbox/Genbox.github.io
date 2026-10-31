(function () {
    "use strict";
    // Original eight-bar bouncy tune in G major: a springy "boing" on every beat as the eggdog hops, an
    // oom-pah bass and a staccato pulse melody. Bars 7–8 swirl up an arpeggio while the egg spins.
    const roots = [43, 48, 43, 50, 43, 48, 50, 50];
    const thirds = [4, 4, 4, 4, 4, 4, 4, 4];
    // One entry per eighth; a 0 is a rest.
    const melody = [
        [71, 0, 74, 0, 79, 78, 76, 74],
        [72, 0, 76, 0, 79, 0, 76, 0],
        [71, 74, 79, 74, 71, 0, 67, 0],
        [69, 0, 72, 74, 78, 0, 74, 0],
        [79, 0, 78, 79, 81, 0, 79, 0],
        [76, 0, 79, 76, 72, 0, 76, 0],
        [74, 78, 81, 86, 81, 78, 74, 78],
        [81, 86, 90, 86, 81, 78, 74, 0]
    ];
    const SPIN = 96;

    const song = window.siteRuntime.chiptune({
        tempo: 128,
        steps: 128,
        volume: 0.17,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth % 4 === 0) {
                voice.sweep(170, 560, at, 0.13, 0.07, "triangle");
            }
            if (sixteenth % 2 === 0) {
                const note = melody[bar][sixteenth / 2];
                if (note) {
                    voice.note(note, at, length * 1.3, 0.05, "pulse25", true);
                }
            }
            if (sixteenth % 8 === 0) {
                voice.note(root - 12, at, length * 2, 0.22, "triangle");
            }
            if (sixteenth % 8 === 4) {
                voice.note(root - 5, at, length * 2, 0.18, "triangle");
            }
            if (sixteenth % 4 === 2) {
                voice.arp([root + 12, root + 12 + thirds[bar], root + 19], at, length * 1.5, 0.03, 0.5);
            }
            if (step >= SPIN) {
                voice.note(root + 24 + [0, 4, 7, 12][sixteenth % 4], at, length * 0.8, 0.03, "pulse12");
            }
            if (sixteenth === 0 || sixteenth === 8) {
                voice.kick(at, 0.35);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.1);
            }
        }
    });

    const step = song.stepLength;
    window.siteRuntime.sounds.eggdog = {
        ...song,
        beat: 4 * step,
        spin: SPIN * step
    };
})();