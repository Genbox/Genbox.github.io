(function () {
    "use strict";
    // Original eight-bar bubblegum tune in D major at a gallop: a bright pulse melody in eighths, a bouncing
    // octave bass, off-beat chord stabs and a busy little beat.
    const roots = [38, 43, 38, 45, 38, 35, 43, 45];
    const thirds = [4, 4, 4, 4, 4, 3, 4, 4];
    // One entry per eighth; a null holds the previous note.
    const melody = [
        [78, 79, 81, null, 86, 83, 81, 78],
        [79, 81, 83, 81, 79, 78, 76, null],
        [78, 79, 81, 83, 86, 88, 86, 83],
        [81, null, 78, null, 81, 83, 81, null],
        [86, 85, 83, 81, 83, 85, 86, null],
        [88, 86, 85, 83, 81, null, 78, 81],
        [83, 81, 79, 78, 76, 78, 79, 81],
        [78, null, 81, null, 86, null, null, null]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 144,
        steps: 128,
        volume: 0.13,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.note(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.8, 0.05, "pulse25", true);
                }
                voice.note(root + (eighth % 2 ? 12 : 0), at, length * 1.6, 0.2, "triangle");
            }
            if (sixteenth % 4 === 2) {
                voice.arp([root + 24, root + 24 + thirds[bar], root + 31], at, length * 1.5, 0.03, 0.5);
            }
            if (sixteenth % 4 === 0) {
                voice.kick(at, 0.35);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.12);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.035);
            }
        }
    });

    window.siteRuntime.sounds.nyan = song;
})();