(function () {
    "use strict";
    // Original dark folk tune in A Dorian: a droning fifth, a plucked lute arpeggio, a fiddle-like lead and a soft
    // hand drum, with a shimmering swell as the hunter casts his rune five seconds into each round.
    const roots = [45, 45, 43, 45, 45, 50, 43, 45];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [69, null, 72, 74, 76, null, 74, 72],
        [69, null, null, null, 0, 0, 67, 69],
        [71, null, 74, null, 72, 71, 69, null],
        [67, null, null, null, 0, 0, 0, 0],
        [76, null, 79, 78, 76, null, 74, 72],
        [74, null, 78, null, 76, null, 74, null],
        [71, null, 69, 67, 69, null, 71, 72],
        [69, null, null, null, 0, 0, 0, 0]
    ];
    const CASTS = [40, 104];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 0) {
                voice.note(root, at, length * 15, 0.15, "triangle");
                voice.note(root + 7, at, length * 15, 0.05, "pulse12");
            }
            if (sixteenth % 2 === 0) {
                const pluck = [0, 7, 12, 15, 12, 7, 14, 12][sixteenth / 2];
                voice.note(root + 12 + pluck, at, length * 1.4, 0.04, "pulse12");
            }
            if (sixteenth === 0 || sixteenth === 6 || sixteenth === 10) {
                voice.kick(at, 0.2);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.hat(at, 0.04);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.9, 0.045);
                }
            }
            if (CASTS.indexOf(step) >= 0) {
                voice.sweep(400, 1400, at, 0.5, 0.05, "triangle");
                voice.arp([81, 84, 88, 93], at, length * 6, 0.03, 0.5);
                voice.hat(at, 0.06, true);
            }
        }
    });

    window.siteRuntime.sounds.witcher = song;
})();