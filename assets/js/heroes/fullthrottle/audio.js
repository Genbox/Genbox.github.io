(function () {
    "use strict";
    // Original road-rock shuffle in E: chugging power chords, a bluesy pulse riff and straight-ahead drums,
    // with an engine rev at the top of each phrase.
    const roots = [40, 40, 45, 40, 47, 45, 40, 47];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [64, null, 67, 69, 70, 69, 67, 64],
        [62, null, 64, null, 0, 0, 59, 62],
        [69, null, 72, 74, 75, 74, 72, 69],
        [67, null, 64, null, 0, 0, 0, 0],
        [71, null, 74, 76, 74, 71, 69, null],
        [72, null, 69, 67, 64, null, 67, 69],
        [64, null, 67, 64, 62, 59, 62, null],
        [64, null, null, null, 0, 0, 66, 68]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if ((bar === 0 || bar === 4) && sixteenth === 0) {
                voice.sweep(60, 150, at, 0.6, 0.12, "sawtooth");
            }
            if (sixteenth % 2 === 0) {
                const sixth = sixteenth % 8 >= 4 ? 9 : 7;
                voice.note(root, at, length * 1.6, 0.12, "pulse25");
                voice.note(root + sixth, at, length * 1.6, 0.05, "pulse25");
            }
            if (sixteenth === 0 || sixteenth === 8) {
                voice.kick(at, 0.42);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.15);
            }
            if (sixteenth % 2 === 0) {
                voice.hat(at, sixteenth % 4 ? 0.025 : 0.04);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.85, 0.05);
                }
            }
        }
    });

    window.siteRuntime.sounds.fullthrottle = song;
})();