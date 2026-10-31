(function () {
    "use strict";
    // Original eight-bar chip score in E minor, arranged like a 2000-era keygen tune: a 16th-note pluck
    // arpeggio, octave-jumping bass and four-on-the-floor drums; the lead and tracker chords join in bars 5–8.
    const roots = [40, 36, 45, 38, 40, 43, 36, 38];
    const thirds = [3, 4, 3, 4, 3, 4, 4, 4];
    const arpeggio = [0, 2, 1, 3, 2, 0, 3, 1, 0, 1, 3, 2, 1, 3, 2, 0];
    // One entry per quarter, as semitones above the chord root two octaves up; a null holds the previous note.
    const melody = [
        [15, 12, null, 7],
        [7, 12, 16, 14],
        [12, null, 7, 4],
        [14, 12, 9, 7]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 128,
        steps: 128,
        volume: 0.11,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const chord = [0, thirds[bar], 7, 12];
            const lead = bar >= 4;
            voice.note(root + 24 + chord[arpeggio[sixteenth]], at, length * 0.85, lead ? 0.04 : 0.065, "pulse12", true);
            voice.note(root + (sixteenth % 2 ? 12 : 0), at, length * 0.9, 0.2, "triangle");
            if (lead && sixteenth % 8 === 0) {
                voice.arp(
                    chord.map(function (i) {
                        return root + 12 + i;
                    }),
                    at,
                    length * 8,
                    0.04
                );
            }
            if (lead && sixteenth % 4 === 0) {
                const quarter = sixteenth / 4;
                const offset = melody[bar - 4][quarter];
                if (offset !== null) {
                    const before = quarter ? melody[bar - 4][quarter - 1] : null;
                    voice.lead(
                        root + 24 + offset,
                        at,
                        length * 4 * window.siteRuntime.heldNotes(melody[bar - 4], quarter) * 0.9,
                        0.06,
                        before !== null && Math.abs(before - offset) <= 4 ? root + 24 + before : null
                    );
                }
            }
            if (sixteenth % 4 === 0) {
                voice.kick(at, 0.5);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.22);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.04);
            }
            if (sixteenth === 14) {
                voice.hat(at, 0.05, true);
            }
        }
    });

    window.siteRuntime.sounds.tron = song;
})();