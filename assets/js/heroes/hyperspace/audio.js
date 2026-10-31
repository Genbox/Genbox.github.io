(function () {
    "use strict";
    // Original eight-bar space piece in G minor. It cruises quietly, charges with a rising sweep and a snare
    // roll, drives hard through the jump, then drops out of hyperspace into a fanfare in B♭. The animation
    // keys off the same steps (CHARGE, JUMP and DROP).
    const roots = [43, 39, 43, 41, 43, 38, 46, 41];
    const thirds = [3, 4, 3, 4, 3, 4, 4, 4];
    const CHARGE = 40;
    const JUMP = 48;
    const DROP = 96;
    // One entry per eighth in bars 7–8; a null holds the previous note.
    const fanfare = [
        [70, null, 70, 74, 77, null, 82, null],
        [81, 79, 77, null, 72, 77, null, null]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 110,
        steps: 128,
        volume: 0.13,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const chord = [root + 12, root + 12 + thirds[bar], root + 19, root + 24];
            if (step < CHARGE) {
                if (sixteenth % 8 === 0) {
                    voice.arp(chord, at, length * 7.5, 0.04, 0.5);
                }
                if (sixteenth === 0) {
                    voice.note(root - 12, at, length * 15, 0.2, "triangle");
                }
                if (sixteenth % 4 === 2) {
                    voice.hat(at, 0.02);
                }
                return;
            }
            if (step === CHARGE) {
                voice.sweep(110, 1800, at, length * 8, 0.08, "sawtooth");
            }
            if (step < JUMP) {
                voice.snare(at, 0.05 + (step - CHARGE) * 0.025);
                voice.note(root - 12, at, length, 0.2, "triangle");
                return;
            }
            if (step === JUMP || step === DROP) {
                voice.kick(at, 0.7);
                voice.hat(at, 0.14, true);
                voice.sweep(1800, 90, at, 0.6, 0.08, "sawtooth");
            }
            voice.note(root - 12 + (sixteenth % 2 ? 12 : 0), at, length * 0.8, 0.2, "pulse25");
            if (step < DROP) {
                voice.arp(chord, at, length, 0.03, 0.125);
                if (sixteenth % 4 === 0) {
                    voice.kick(at, 0.5);
                }
                if (sixteenth === 4 || sixteenth === 12) {
                    voice.snare(at, 0.18);
                }
                voice.hat(at, sixteenth % 2 ? 0.05 : 0.025);
                return;
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = fanfare[bar - 6][eighth];
                if (note) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(fanfare[bar - 6], eighth) * 0.92, 0.065);
                    voice.note(note - 12, at, length * 2 * window.siteRuntime.heldNotes(fanfare[bar - 6], eighth) * 0.8, 0.03, "pulse25");
                }
            }
            if (sixteenth % 8 === 0) {
                voice.arp(chord, at, length * 7.5, 0.03, 0.5);
            }
            if (sixteenth % 8 === 0) {
                voice.kick(at, 0.45);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.14);
            }
        }
    });

    const step = song.stepLength;
    window.siteRuntime.sounds.hyperspace = {
        ...song,
        charge: CHARGE * step,
        jump: JUMP * step,
        drop: DROP * step
    };
})();