(function () {
    "use strict";
    // Original eight-bar mainframe theme in F# minor, arranged like a 2000-era keygen tune: chip arpeggios,
    // terminal blips, octave bass and a sparse beat; the lead and tracker chords join in bars 5–8.
    const roots = [42, 38, 45, 40, 42, 43, 37, 42];
    // Bar 7 is C# major (the harmonic-minor dominant), so the loop resolves firmly back to F# minor.
    const thirds = [3, 4, 4, 4, 3, 4, 4, 3];
    const arpeggio = [0, 2, 1, 3, 2, 1, 3, 0];
    // One entry per quarter, as semitones above the chord root two octaves up; a null holds the previous note.
    const melody = [
        [15, 12, 7, null],
        [12, 7, 4, 0],
        [10, 7, 4, 0],
        [12, null, 7, 0]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.12,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const chord = [0, thirds[bar], 7, 12];
            const lead = bar >= 4;
            if (sixteenth % 2 === 0) {
                voice.note(root + 24 + chord[arpeggio[sixteenth / 2]], at, length * 1.3, lead ? 0.04 : 0.06, "square", true);
                voice.note(root - 12 + (sixteenth % 4 === 2 ? 12 : 0), at, length * 1.8, 0.22, "triangle");
            }
            // Terminal pulses, and a falling zap at the end of every second bar.
            if (sixteenth % 4 === 0) {
                voice.sweep(2200, 2190, at, 0.014, 0.02, "square");
            }
            if (sixteenth === 14 && bar % 2) {
                voice.sweep(1400, 350, at, length * 1.6, 0.04);
            }
            if (lead && sixteenth % 8 === 0) {
                voice.arp(
                    chord.map(function (i) {
                        return root + 12 + i;
                    }),
                    at,
                    length * 8,
                    0.035,
                    0.125
                );
            }
            if (lead && sixteenth % 4 === 0) {
                const quarter = sixteenth / 4;
                const offset = melody[bar - 4][quarter];
                if (offset !== null) {
                    voice.lead(root + 24 + offset, at, length * 4 * window.siteRuntime.heldNotes(melody[bar - 4], quarter) * 0.9, 0.05);
                }
            }
            if (sixteenth === 0 || sixteenth === 10) {
                voice.kick(at, 0.4);
            }
            if (sixteenth === 8) {
                voice.snare(at, 0.16);
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.035);
            }
        }
    });

    function start(speak) {
        song.start();
        if (speak) {
            window.siteRuntime.speak("Shall we play a game?", {
                voice: "male",
                rate: 0.5,
                pitch: 0.45,
                volume: 0.45
            });
        }
    }

    window.siteRuntime.sounds.joshua = { ...song, start};
})();