(function () {
    "use strict";
    // Original eight-bar monster march in C minor: a stomp on every beat (a heavy kick with a low thud), a
    // brassy horn theme over a pounding bass, and a roar every four bars while the monster breathes its beam.
    const roots = [36, 36, 32, 34, 36, 36, 32, 31];
    // One entry per quarter; a null holds the previous note and a 0 is a rest.
    const theme = [
        [48, null, 51, 50],
        [48, 0, 0, 0],
        [44, null, 48, 47],
        [46, null, null, 0],
        [48, 51, 55, 53],
        [51, null, 48, 0],
        [44, 48, 51, 50],
        [47, null, null, null]
    ];
    const ROARS = [48, 112];

    const song = window.siteRuntime.chiptune({
        tempo: 90,
        steps: 128,
        volume: 0.11,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth % 4 === 0) {
                voice.kick(at, 0.7);
                voice.sweep(90, 38, at, 0.3, 0.25, "sine");
                const quarter = sixteenth / 4;
                const note = theme[bar][quarter];
                let held = 1;
                while (quarter + held < 4 && theme[bar][quarter + held] === null) {
                    held++;
                }
                if (note) {
                    voice.horn(note, at, length * 4 * held * 0.9, 0.09);
                }
            }
            if (sixteenth % 2 === 0) {
                voice.note(root - 12 + (sixteenth % 4 ? 7 : 0), at, length * 1.6, 0.18, "pulse25");
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.15);
            }
            if (ROARS.indexOf(step) >= 0) {
                voice.sweep(240, 55, at, 1.4, 0.12, "sawtooth");
                voice.sweep(700, 260, at, 1.2, 0.05, "square");
                voice.hat(at, 0.16, true);
                voice.hat(at + 0.12, 0.12, true);
            }
        }
    });

    const step = song.stepLength;
    window.siteRuntime.sounds.kaiju = {
        ...song,
        beat: 4 * step,
        roars: ROARS.map(function (s) {
            return s * step;
        }),
        roarLength: 1.4
    };
})();