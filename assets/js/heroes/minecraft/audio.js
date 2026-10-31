(function () {
    "use strict";
    // Original calm, sparse piano-like tune in C Lydian: soft triangle chords and a gentle melody with long rests,
    // plus a pickaxe tick on each strike and a pop as each block breaks.
    const roots = [48, 50, 48, 45, 48, 50, 53, 52];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [76, null, null, 0, 79, null, 78, null],
        [0, 0, 0, 0, 74, null, null, null],
        [72, null, null, 0, 76, null, 79, null],
        [81, null, null, null, 0, 0, 0, 0],
        [76, null, null, 0, 79, null, 78, null],
        [0, 0, 0, 0, 81, null, 79, null],
        [77, null, null, 0, 76, null, 74, null],
        [72, null, null, null, 0, 0, 0, 0]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 0) {
                voice.note(root, at, length * 14, 0.12, "triangle");
                voice.note(root + 7, at + length, length * 13, 0.06, "triangle");
                voice.note(root + 16, at + length * 2, length * 12, 0.05, "triangle");
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.note(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.9, 0.06, "triangle");
                }
            }
            // Each block takes 2 seconds (16 steps): the pickaxe strikes 0.35 s into every beat while mining,
            // and the block breaks at 1.6 s.
            const inBlock = step % 16;
            if (inBlock === 3 || inBlock === 7 || inBlock === 11) {
                voice.hat(at, 0.04);
                voice.kick(at, 0.08);
            }
            if (inBlock === 13) {
                voice.snare(at, 0.08);
                voice.note(84, at + length, length, 0.04, "pulse25");
            }
        }
    });

    window.siteRuntime.sounds.minecraft = song;
})();