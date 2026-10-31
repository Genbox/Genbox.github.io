(function () {
    "use strict";
    // Original tense electronic breakbeat in A minor: a 16th-note synth bass, syncopated drums and a sparse lead,
    // rising in intensity until the chamber surges six seconds into each 8-second round.
    const roots = [45, 45, 41, 43, 45, 45, 41, 40];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [69, null, 0, 72, 0, 71, null, 0],
        [69, null, 0, 0, 67, null, 64, null],
        [65, null, 0, 69, 0, 72, null, 0],
        [71, null, 0, 0, 74, null, 76, null],
        [81, null, 0, 79, 0, 76, null, 0],
        [77, null, 76, null, 74, null, 72, null],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [76, null, null, null, 0, 0, 0, 0]
    ];
    const SURGES = [48, 112];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            voice.note(root + (sixteenth % 4 === 2 ? 12 : 0), at, length * 0.8, 0.09, "pulse25");
            if (sixteenth === 0 || sixteenth === 6 || sixteenth === 10) {
                voice.kick(at, 0.4);
            }
            if (sixteenth === 4 || sixteenth === 12 || sixteenth === 15) {
                voice.snare(at, sixteenth === 15 ? 0.06 : 0.14);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.03);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.8, 0.045);
                }
            }
            // The chamber builds to its surge.
            if (SURGES.indexOf(step + 16) >= 0) {
                voice.sweep(200, 2000, at, 2, 0.025, "sawtooth");
            }
            if (SURGES.indexOf(step) >= 0) {
                voice.kick(at, 0.6);
                voice.hat(at, 0.12, true);
                voice.sweep(3000, 200, at, 0.5, 0.06, "square");
            }
        }
    });

    window.siteRuntime.sounds.halflife = song;
})();