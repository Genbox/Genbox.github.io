(function () {
    "use strict";
    // Original dark dungeon theme in D minor: a low drone, a slow plucked arpeggio, a tolling bell at the top of
    // each phrase and the shadow's roar four seconds into each round.
    const roots = [38, 38, 34, 33, 38, 41, 34, 33];
    const thirds = [3, 3, 4, 4, 3, 4, 4, 4];
    const ROARS = [32, 96];
    const POTIONS = [52, 116];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 0) {
                voice.note(root, at, length * 15, 0.2, "triangle");
                voice.kick(at, 0.3);
            }
            if ((bar === 0 || bar === 4) && sixteenth === 0) {
                voice.note(root + 36, at, length * 12, 0.035, "triangle");
                voice.note(root + 43, at, length * 10, 0.02, "triangle");
            }
            // The plucked arpeggio: root, fifth, octave, third, one note per eighth.
            if (sixteenth % 2 === 0) {
                const notes = [0, 7, 12, thirds[bar] + 12, 7, 12, 19, 12];
                voice.note(root + 12 + notes[sixteenth / 2], at, length * 1.6, 0.05, "pulse12");
            }
            if (sixteenth === 12) {
                voice.hat(at, 0.025, true);
            }
            if (ROARS.indexOf(step) >= 0) {
                voice.sweep(110, 45, at, 0.9, 0.16, "sawtooth");
                voice.sweep(115, 48, at, 0.9, 0.1, "square");
                voice.kick(at, 0.5);
            }
            if (POTIONS.indexOf(step) >= 0) {
                voice.sweep(300, 900, at, 0.4, 0.04, "triangle");
            }
        }
    });

    window.siteRuntime.sounds.diablo = song;
})();