(function () {
    "use strict";
    // Original eight-bar A minor piece in the keygen style: a 16th-note pulse arpeggio, octave bass and a
    // pulse lead in bars 5–8. Every four bars three shots ring out and the drums drop away for "bullet time"
    // while the bullets crawl past; the matching animation keys off the same steps (see SHOTS).
    const roots = [45, 41, 43, 40, 45, 41, 38, 40];
    const thirds = [3, 4, 4, 3, 3, 4, 3, 4];
    const arpeggio = [0, 1, 2, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2, 1];
    // One entry per quarter in bars 5–8; a null holds the previous note.
    const melody = [
        [76, null, 72, 74],
        [72, null, 69, 72],
        [74, 77, 76, 74],
        [71, null, 68, null]
    ];
    const SHOTS = [8, 9, 10];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.125,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const half = step % 64;
            const chord = [0, thirds[bar], 7, 12];
            const slowMotion = half >= 12 && half < 40;
            voice.note(root + 24 + chord[arpeggio[sixteenth]], at, length * 0.8, slowMotion ? 0.03 : 0.05, "pulse12", true);
            if (sixteenth % 2 === 0) {
                voice.note(root + (sixteenth % 4 ? 12 : 0), at, length * 1.8, 0.2, "triangle");
            }
            if (bar >= 4 && sixteenth % 4 === 0) {
                const quarter = sixteenth / 4;
                const note = melody[bar - 4][quarter];
                if (note) {
                    let length4 = 1;
                    while (quarter + length4 < 4 && melody[bar - 4][quarter + length4] === null) {
                        length4++;
                    }
                    voice.lead(note, at, length * 4 * length4 * 0.9, 0.055);
                }
            }
            if (SHOTS.indexOf(half) >= 0) {
                voice.sweep(2600, 260, at, 0.14, 0.12, "square");
                voice.hat(at, 0.12, true);
            }
            // The bullet-time drop: a long falling sweep, and the drums wait until the bullets have passed.
            if (half === 12) {
                voice.sweep(420, 55, at, 1.6, 0.25, "sine");
            }
            if (slowMotion) {
                return;
            }
            if (sixteenth % 4 === 0) {
                voice.kick(at, 0.45);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.18);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.035);
            }
        }
    });

    window.siteRuntime.sounds.matrix = song;
})();