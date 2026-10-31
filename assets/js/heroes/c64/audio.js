(function () {
    "use strict";
    // Original eight-bar SID-style tune in E minor. Bars 1–4 play under the loading screen: bass and tracker
    // chords only, with a ticking noise like the loader. The demo starts on bar 5 with drums and a pulse lead.
    const roots = [40, 36, 38, 35, 40, 36, 45, 35];
    const thirds = [3, 4, 4, 4, 3, 4, 3, 4];
    // One entry per eighth in bars 5–8; a null holds the previous note.
    const melody = [
        [76, null, 79, 78, 76, null, 71, 74],
        [72, null, 76, 79, 81, 79, 76, null],
        [81, null, 79, 76, 72, 74, 76, null],
        [75, null, 78, 81, 83, null, null, null]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 125,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const demo = bar >= 4;
            const chord = [root + 24, root + 24 + thirds[bar], root + 31];
            voice.note(root + (sixteenth % 2 ? 12 : 0), at, length * 0.8, 0.18, "pulse25");
            if (sixteenth % 2 === 0) {
                voice.arp(chord, at, length * 1.8, demo ? 0.035 : 0.05, 0.25);
            }
            if (!demo) {
                if (sixteenth % 2 === 1) {
                    voice.hat(at, 0.02);
                }
                return;
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar - 4][eighth];
                const before = eighth ? melody[bar - 4][eighth - 1] : null;
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar - 4], eighth) * 0.9, 0.06, before);
                }
            }
            if (sixteenth === 0 || sixteenth === 8 || sixteenth === 10) {
                voice.kick(at, 0.45);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.18);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.04);
            }
        }
    });

    window.siteRuntime.sounds.c64 = {
        ...song,
        demo: (64 * 60) / 125 / 4
    };
})();