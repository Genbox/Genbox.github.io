(function () {
    "use strict";
    // Original eight-bar adventure theme in A minor that turns bright for the level-up: a soaring pulse lead
    // over tracker chords and timpani. At 11 seconds (bar 6, beat 3) a bell and a rising fanfare mark the "ding".
    const roots = [45, 41, 48, 43, 45, 41, 48, 43];
    const thirds = [3, 4, 4, 4, 3, 4, 4, 4];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [69, null, null, 72, 71, null, 69, null],
        [65, null, null, 69, 67, null, 65, 64],
        [67, null, null, 72, 76, null, 74, 72],
        [74, null, null, null, 71, null, 67, null],
        [69, null, 72, 76, 81, null, 79, 76],
        [77, null, 76, 74, 72, null, 0, 0],
        [76, null, 79, null, 84, null, null, null],
        [83, null, 79, null, 74, null, 71, null]
    ];
    const DING = 88;

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 0 || sixteenth === 8) {
                voice.note(root, at, length * 7, 0.22, "triangle");
                voice.arp([root + 24, root + 24 + thirds[bar], root + 31, root + 36], at, length * 7.5, 0.03, 0.5);
            }
            if (sixteenth === 0) {
                voice.kick(at, 0.38);
            }
            if (sixteenth === 8) {
                voice.kick(at, 0.26);
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.03);
            }
            // A timpani roll leads into each new phrase.
            if ((bar === 3 || bar === 7) && sixteenth >= 12) {
                voice.kick(at, 0.16 + (sixteenth - 12) * 0.05);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.9, 0.05);
                }
            }
            if (step === DING) {
                voice.note(96, at, length * 10, 0.06, "triangle");
                voice.note(91, at + length * 0.5, length * 10, 0.04, "triangle");
                voice.arp([72, 76, 79, 84, 88], at, length * 8, 0.05, 0.5);
                voice.sweep(220, 1760, at, length * 4, 0.04, "triangle");
                voice.hat(at, 0.08, true);
            }
        }
    });

    window.siteRuntime.sounds.wow = song;
})();