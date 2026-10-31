(function () {
    "use strict";
    // Original synthwave loop in F minor: a 16th-note octave bass, four-on-the-floor kick, big gated snares and an
    // echoing lead, with a digital stutter as the picture glitches every 4 seconds.
    const roots = [41, 41, 44, 39, 41, 41, 37, 39];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [77, null, 0, 80, 0, 79, 77, null],
        [75, null, 72, null, 0, 0, 0, 0],
        [80, null, 0, 84, 0, 82, 80, null],
        [79, null, 75, null, 0, 0, 0, 0],
        [84, null, 82, null, 80, null, 79, null],
        [77, null, null, null, 72, null, 75, null],
        [73, null, 75, null, 77, null, 80, null],
        [79, null, null, null, 0, 0, 0, 0]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            voice.note(root + (sixteenth % 2 ? 12 : 0), at, length * 0.85, 0.09, "pulse25");
            if (sixteenth % 4 === 0) {
                voice.kick(at, 0.42);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.16);
                voice.hat(at, 0.05, true);
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.035);
            }
            if (sixteenth === 0) {
                voice.arp([root + 24, root + 27, root + 31, root + 36], at, length * 15, 0.02, 0.5);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.9, 0.05);
                }
            }
            // The glitch at 3.7 seconds of every 4 (step 29.6 of each 32).
            if (step % 32 === 30) {
                voice.sweep(1600, 80, at, 0.2, 0.05, "square");
                voice.sweep(80, 1600, at + length, 0.1, 0.03, "square");
            }
        }
    });

    window.siteRuntime.sounds.cyberpunk = song;
})();