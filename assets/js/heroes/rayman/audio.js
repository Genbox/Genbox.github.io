(function () {
    "use strict";
    // Original bouncy jungle tune in C major: staccato triangle bass, a playful pulse melody and woodblock-like
    // hats, with a bright two-note chime each time the critter snatches an orb (half a second into each hop).
    const roots = [48, 45, 41, 43, 48, 45, 41, 43];
    const thirds = [4, 3, 4, 4, 4, 3, 4, 4];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [72, 76, 79, 0, 76, 0, 72, 0],
        [69, 72, 76, 0, 74, 72, 69, 0],
        [65, 69, 72, 0, 77, 0, 76, 74],
        [74, 0, 71, 72, 74, 0, 79, 0],
        [84, 0, 79, 76, 72, 0, 76, 79],
        [81, 0, 76, 72, 69, 0, 72, 76],
        [77, 76, 74, 72, 69, 0, 72, 74],
        [72, null, 67, 0, 72, 0, 0, 0]
    ];
    const ORBS = [4, 20, 36, 52, 68, 84, 100, 116];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth % 4 === 0) {
                voice.note(root + (sixteenth % 8 ? 7 : 0), at, length * 1.2, 0.2, "triangle");
            }
            if (sixteenth % 4 === 2) {
                voice.arp([root + 24, root + 24 + thirds[bar], root + 31], at, length * 1.2, 0.03, 0.5);
                voice.hat(at, 0.03);
            }
            if (sixteenth === 0 || sixteenth === 8) {
                voice.kick(at, 0.25);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.07);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.note(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.6, 0.06, "pulse25", true);
                }
            }
            if (ORBS.indexOf(step) >= 0) {
                voice.note(88, at, length, 0.05, "triangle");
                voice.note(95, at + length * 0.6, length * 2, 0.05, "triangle");
            }
        }
    });

    window.siteRuntime.sounds.rayman = song;
})();