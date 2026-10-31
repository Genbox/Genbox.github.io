(function () {
    "use strict";
    // Original eight-bar chip-metal score in E, arranged like a 2000-era keygen tune: tracker power chords
    // (root, fifth, octave cycling every frame), octave bass, pounding drums and a pulse lead in bars 5–8.
    // One riff entry per eighth; a null is a rest.
    const riff = [
        40,
        null,
        40,
        43,
        40,
        41,
        40,
        null,
        40,
        40,
        null,
        47,
        46,
        43,
        41,
        40,
        40,
        null,
        43,
        40,
        45,
        43,
        40,
        38,
        41,
        41,
        40,
        null,
        38,
        36,
        38,
        null,
        40,
        40,
        43,
        null,
        40,
        46,
        45,
        43,
        40,
        null,
        47,
        46,
        43,
        41,
        40,
        40,
        45,
        45,
        43,
        40,
        41,
        43,
        46,
        43,
        38,
        41,
        40,
        null,
        36,
        38,
        40,
        null
    ];
    // The lead follows the riff's chromatic lines (bars 5 and 6) instead of rubbing a semitone against them.
    const lead = [
        [83, 79, 76, null, 78, 77, 74, 71],
        [76, 79, 83, 82, 79, null, 76, 74],
        [81, null, 79, 76, 74, 76, 79, 77],
        [74, 77, 76, null, 72, 74, 76, null]
    ];
    const leadNotes = [].concat.apply([], lead);

    const song = window.siteRuntime.chiptune({
        tempo: 152,
        steps: 128,
        volume: 0.1,
        play(voice, step, at, length) {
            const sixteenth = step % 16;
            const eighth = step / 2;
            const beat = eighth % 8;
            const late = eighth >= 32;
            if (step % 2 === 0) {
                const note = riff[eighth];
                if (note !== null) {
                    const chug = length * 2 * (beat === 0 ? 0.9 : 0.55);
                    voice.arp([note + 12, note + 19, note + 24], at, chug, 0.11, 0.25);
                    voice.note(note, at, chug, 0.3, "triangle");
                }
                if (late) {
                    const index = eighth - 32;
                    const melody = leadNotes[index];
                    if (melody !== null) {
                        const previous = index ? leadNotes[index - 1] : null;
                        voice.lead(melody, at, length * 2 * window.siteRuntime.heldNotes(leadNotes, index) * 0.85, 0.06, previous !== null && Math.abs(previous - melody) <= 3 ? previous : null);
                    }
                }
                if (beat === 0 || beat === 3 || beat === 4 || late && beat === 7) {
                    voice.kick(at, 0.55);
                }
                if (beat === 2 || beat === 6) {
                    voice.snare(at, 0.28);
                }
                voice.hat(at, 0.06);
            }
            // A double-kick roll into the loop.
            if (step >= 120 && step % 2 === 1) {
                voice.kick(at, 0.35);
            }
            if (sixteenth === 15 && step >= 120) {
                voice.hat(at, 0.06, true);
            }
        }
    });

    window.siteRuntime.sounds.doom = song;
})();