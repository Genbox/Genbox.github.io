(function () {
    "use strict";
    // Original laid-back G minor groove: a half-time beat with a swung hat, a gliding sub bass and a whiny
    // sliding lead. As the wanted level climbs, a siren wails underneath the second half of each lap.
    const roots = [43, 43, 46, 41, 43, 43, 39, 41];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [74, null, 0, 70, 72, null, 74, null],
        [0, 0, 77, null, 74, 72, 70, null],
        [74, null, 0, 70, 72, null, 74, 77],
        [79, null, null, 77, 74, null, 0, 0],
        [74, null, 0, 70, 72, null, 74, null],
        [0, 0, 77, null, 79, 77, 74, null],
        [75, null, 74, null, 72, null, 70, null],
        [69, null, null, null, 0, 0, 0, 0]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 0 || sixteenth === 10) {
                voice.kick(at, 0.45);
            }
            if (sixteenth === 8) {
                voice.snare(at, 0.16);
            }
            // A swung hat: the off-beat sixteenths land a little late.
            if (sixteenth % 2 === 0) {
                voice.hat(at + (sixteenth % 4 === 2 ? length * 0.3 : 0), 0.03);
            }
            if (sixteenth === 0) {
                voice.note(root, at, length * 7, 0.22, "triangle");
            }
            if (sixteenth === 8) {
                voice.note(root + (bar % 2 ? 5 : 7), at, length * 6, 0.2, "triangle");
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    const before = eighth > 0 ? melody[bar][eighth - 1] : null;
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.9, 0.045, before || undefined);
                }
            }
            // The siren: a two-tone wail in the second half of every lap.
            if ((bar % 4) >= 2 && sixteenth % 4 === 0) {
                voice.sweep(sixteenth % 8 ? 900 : 700, sixteenth % 8 ? 700 : 900, at, length * 4, 0.015, "triangle");
            }
        }
    });

    window.siteRuntime.sounds.gta = song;
})();