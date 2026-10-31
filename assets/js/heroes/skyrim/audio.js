(function () {
    "use strict";
    // Original northern epic in D minor: pounding war drums, low choir-like fifths and a heroic horn line, with
    // the warrior's shout five seconds into each 8-second round.
    const roots = [38, 38, 34, 36, 38, 41, 36, 33];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [62, null, null, 65, 64, null, 62, null],
        [60, null, null, null, 57, null, null, null],
        [62, null, null, 65, 67, null, 69, null],
        [67, null, 65, null, 64, null, null, null],
        [69, null, null, 72, 70, null, 69, null],
        [65, null, null, null, 0, 0, 0, 0],
        [64, null, 65, null, 67, null, 64, null],
        [62, null, null, null, 0, 0, 0, 0]
    ];
    const SHOUTS = [40, 104];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 0 || sixteenth === 8) {
                voice.note(root + 12, at, length * 7.5, 0.06, "pulse12");
                voice.note(root + 19, at, length * 7.5, 0.04, "pulse12");
                voice.note(root, at, length * 7.5, 0.18, "triangle");
            }
            if (sixteenth === 0 || sixteenth === 3 || sixteenth === 8 || sixteenth === 11) {
                voice.kick(at, sixteenth % 8 ? 0.28 : 0.45);
            }
            if (sixteenth === 12) {
                voice.snare(at, 0.12);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.horn(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.9, 0.07);
                }
            }
            if (SHOUTS.indexOf(step) >= 0) {
                voice.sweep(320, 80, at, 0.9, 0.16, "sawtooth");
                voice.sweep(330, 82, at, 0.9, 0.1, "square");
                voice.kick(at, 0.7);
                voice.hat(at, 0.1, true);
            }
        }
    });

    window.siteRuntime.sounds.skyrim = song;
})();