(function () {
    "use strict";
    // Original dark industrial loop in C minor: heavy half-time drums, metallic clanks, a grinding low drone and
    // a sparse pulse motif.
    const roots = [36, 36, 39, 34, 36, 36, 32, 31];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const motif = [
        [60, null, null, 0, 63, null, 62, null],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [63, null, null, 0, 67, null, 65, null],
        [0, 0, 0, 0, 0, 0, 62, 63],
        [60, null, null, 0, 63, null, 62, null],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [56, null, null, 0, 60, null, 59, null],
        [55, null, null, null, 0, 0, 0, 0]
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
                voice.note(root, at, length * 15, 0.18, "pulse12");
                voice.note(root - 12, at, length * 15, 0.16, "triangle");
            }
            if (sixteenth === 0 || sixteenth === 6) {
                voice.kick(at, 0.5);
            }
            if (sixteenth === 8) {
                voice.snare(at, 0.2);
            }
            if (sixteenth === 3 || sixteenth === 11 || sixteenth === 14) {
                voice.hat(at, 0.05, true);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = motif[bar][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(motif[bar], eighth) * 0.8, 0.04);
                }
            }
        }
    });

    window.siteRuntime.sounds.quake = song;
})();