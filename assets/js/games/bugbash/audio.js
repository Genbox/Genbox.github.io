(function () {
    "use strict";
    // Original eight-bar driving tune in A minor for Bug Bash: a 16th-note pulse arpeggio, an octave bass in
    // eighths, a pulse lead in bars 5–8 and a steady beat. It sits a little lower than the other modes so the
    // game's sound effects cut through.
    const roots = [45, 41, 43, 40, 45, 41, 38, 40];
    const thirds = [3, 4, 4, 4, 3, 4, 3, 4];
    const arpeggio = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2];
    // One entry per eighth in bars 5–8; a null holds the previous note.
    const melody = [
        [76, null, 72, 74, 76, 79, 77, 76],
        [74, null, 72, 69, 72, null, null, null],
        [74, null, 71, 74, 79, 77, 76, 74],
        [76, null, 75, 76, 80, null, null, null]
    ];

    function held(bar, eighth) {
        let length = 1;
        while (eighth + length < 8 && melody[bar][eighth + length] === null) {
            length++;
        }
        return length;
    }

    const song = window.siteRuntime.chiptune({
        tempo: 140,
        steps: 128,
        volume: 0.1,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const chord = [0, thirds[bar], 7, 12];
            voice.note(root + 24 + chord[arpeggio[sixteenth] % 4], at, length * 0.8, 0.04, "pulse12", true);
            if (sixteenth % 2 === 0) {
                voice.note(root + (sixteenth % 4 ? 12 : 0), at, length * 1.7, 0.2, "triangle");
            }
            if (bar >= 4 && sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar - 4][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * held(bar - 4, eighth) * 0.9, 0.05, eighth ? melody[bar - 4][eighth - 1] : null);
                }
            }
            if (sixteenth % 4 === 0) {
                voice.kick(at, 0.45);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.16);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.035);
            }
        }
    });

    window.siteRuntime.sounds.bugbash = song;
})();