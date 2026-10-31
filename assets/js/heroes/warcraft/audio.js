(function () {
    "use strict";
    // Original eight-bar war march in D minor: war drums on the beats (the worker's axe lands on each one while
    // chopping), a brassy horn call at the top of each phrase, and a pulse lead over tracker chords.
    const roots = [38, 38, 34, 36, 38, 41, 36, 33];
    const thirds = [3, 3, 4, 4, 3, 4, 4, 4];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [62, null, 62, 65, 69, null, 67, 65],
        [64, null, 62, null, 57, null, 0, 0],
        [62, null, 65, 67, 70, null, 69, 67],
        [65, null, 64, null, 60, null, 0, 0],
        [69, null, 69, 70, 72, null, 74, null],
        [72, 70, 69, null, 65, null, 0, 0],
        [67, null, 65, 64, 62, null, 64, 65],
        [62, null, null, null, 0, 0, 0, 0]
    ];
    // The worker drops the log at 5 seconds into each 8-second trip, two trips to the loop.
    const DROPS = [40, 104];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            // A low grunt as the log hits the pile: two falling buzzes and a breath of noise. A two-note chime
            // follows as the "+10" rises over the hut.
            if (DROPS.indexOf(step) >= 0) {
                voice.sweep(170, 85, at, 0.22, 0.2, "sawtooth");
                voice.sweep(176, 88, at, 0.22, 0.12, "square");
                voice.snare(at, 0.04);
            }
            if (DROPS.indexOf(step - 1) >= 0) {
                voice.note(83, at, length * 1.2, 0.05, "square");
                voice.note(90, at + length, length * 2.5, 0.05, "square");
            }
            if ((bar === 0 || bar === 4) && sixteenth === 0) {
                voice.horn(root + 24, at, length * 6, 0.1);
                voice.horn(root + 31, at + length * 6, length * 6, 0.08);
            }
            if (sixteenth % 4 === 0) {
                voice.kick(at, sixteenth % 8 ? 0.32 : 0.42);
                voice.note(root + 12, at, length * 1.8, 0.2, "triangle");
            }
            if (sixteenth === 14) {
                voice.kick(at, 0.22);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.08);
            }
            if (sixteenth % 8 === 0) {
                voice.arp([root + 24, root + 24 + thirds[bar], root + 31], at, length * 7.5, 0.03, 0.5);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.85, 0.05);
                }
            }
            // A snare roll into the second phrase and back to the top.
            if ((bar === 3 || bar === 7) && sixteenth >= 12) {
                voice.snare(at, 0.06 + (sixteenth - 12) * 0.02);
            }
        }
    });

    window.siteRuntime.sounds.warcraft = song;
})();