(function () {
    "use strict";
    // Original eight-bar industrial piece in D minor: a pumping low pulse bass, syncopated kicks and a metallic
    // anvil strike on each bar; a dark lead joins in bars 5–8. Each strike lines up with a new target lock, and
    // a flat machine voice reads out the new readout.
    const roots = [38, 38, 34, 36, 38, 38, 41, 36];
    // One entry per quarter in bars 5–8; a null holds the previous note.
    const melody = [
        [62, null, 65, 64],
        [62, null, null, 57],
        [58, null, 60, 62],
        [64, null, 61, null]
    ];
    // The readouts, one per bar, running on across loops: what the display shows and what the voice says.
    const readouts = [
        { text: "SCAN MODE 4398", say: "Scan mode. Four three nine eight." },
        { text: "SIZE ASSESSMENT", say: "Size assessment." },
        { text: "ASSESS COMPLETE", say: "Assessment complete." },
        { text: "FIT PROB 0.99", say: "Zero point nine nine." },
        { text: "MATCH", say: "Match." },
        { text: "THREAT: NONE", say: "Threat level. None." },
        { text: "SUBROUTINE 3F2A", say: "Subroutine three F two A." },
        { text: "OVERRIDE", say: "Priority override." },
        { text: "LOCATE ARTICLE", say: "Locating article." }
    ];

    function anvil(voice, at, volume) {
        voice.sweep(1760, 1650, at, 0.5, volume, "square");
        voice.sweep(2490, 2380, at, 0.35, volume * 0.6, "square");
        voice.hat(at, volume * 1.6, true);
    }

    const song = window.siteRuntime.chiptune({
        tempo: 96,
        steps: 128,
        volume: 0.13,
        play(voice, step, at, length, loop) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth === 1) {
                window.siteRuntime.speak(readouts[(loop * 8 + bar) % readouts.length].say, {
                    voice: "male",
                    pitch: 0.45,
                    rate: 0.95
                });
            }
            voice.note(root - 12 + (sixteenth % 4 === 3 ? 12 : 0), at, length * 0.7, 0.2, "pulse25");
            if (sixteenth === 0) {
                anvil(voice, at, 0.06);
            }
            if (sixteenth === 0 || sixteenth === 6 || sixteenth === 8 || sixteenth === 11) {
                voice.kick(at, 0.55);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.2);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.03);
            }
            if (bar >= 4 && sixteenth % 4 === 0) {
                const quarter = sixteenth / 4;
                const note = melody[bar - 4][quarter];
                let length4 = 1;
                while (quarter + length4 < 4 && melody[bar - 4][quarter + length4] === null) {
                    length4++;
                }
                if (note) {
                    voice.lead(note, at, length * 4 * length4 * 0.9, 0.06);
                }
            }
            if (bar < 4 && sixteenth === 8) {
                voice.arp([root + 12, root + 15, root + 19], at, length * 8, 0.03, 0.125);
            }
        }
    });

    window.siteRuntime.sounds.terminator = {
        ...song,
        bar: (16 * 60) / 96 / 4,
        readouts
    };
})();