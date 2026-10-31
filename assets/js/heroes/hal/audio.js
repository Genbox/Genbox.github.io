(function () {
    "use strict";
    // "Daisy Bell" (Harry Dacre, 1892, public domain), sung slowly in 3/4 over a soft waltz. The last phrase
    // winds down in pitch, the way the computer sings it while being shut down; the eye dims to match. In the
    // held notes the computer speaks, calmly, and then ever more slowly as it winds down.
    // One entry per quarter, three per bar; a null holds the previous note.
    const melody = [
        [79, null, null],
        [76, null, null],
        [72, null, null],
        [67, null, null],
        [69, 71, 72],
        [69, null, 72],
        [67, null, null],
        [null, null, null],
        [74, null, null],
        [79, null, null],
        [76, null, null],
        [72, null, null],
        [69, 71, 72],
        [74, null, 76],
        [74, null, null],
        [null, null, null]
    ];
    const roots = [48, 48, 48, 48, 53, 53, 48, 48, 55, 55, 48, 48, 53, 50, 55, 55];
    const STEPS_PER_BAR = 12;
    const TEMPO = 84;
    const WIND_DOWN = 13 * STEPS_PER_BAR;
    const STEPS = 16 * STEPS_PER_BAR;
    const stepLength = 60 / TEMPO / 4;

    const notes = melody.flat();
    // How many semitones the voice has sagged by this step.
    function sag(step) {
        return step < WIND_DOWN ? 0 : Math.pow((step - WIND_DOWN) / (STEPS - WIND_DOWN), 1.6) * 7;
    }

    // When each sung note starts, in seconds into the loop, for the eye to pulse with.
    const onsets = [];
    melody.forEach(function (bar, b) {
        bar.forEach(function (note, q) {
            if (note) {
                onsets.push((b * STEPS_PER_BAR + q * 4) * stepLength);
            }
        });
    });

    // One syllable per melody onset. Pauses keep the preceding syllable highlighted.
    const phrases = [
        ["Dai", "sy, ", "Dai", "sy,"],
        ["Give ", "me ", "your ", "an", "swer ", "do."],
        ["I'm ", "half ", "cra", "zy,"],
        ["All ", "for ", "the ", "love ", "of ", "you…"]
    ];
    let onsetIndex = 0;
    const lyricCues = [];
    phrases.forEach(function (phrase, phraseIndex) {
        phrase.forEach(function (syllable, syllableIndex) {
            lyricCues.push({ at: onsets[onsetIndex++], phrase: phraseIndex, syllable: syllableIndex });
        });
    });

    const speech = [{ step: 180, say: "I'm sorry, Dave. I'm afraid I can't do that.", pitch: 0.5, rate: 0.68 }];

    const song = window.siteRuntime.chiptune({
        tempo: TEMPO,
        steps: STEPS,
        volume: 0.18,
        play(voice, step, at, length) {
            speech.forEach(function (line) {
                if (step === line.step) {
                    window.siteRuntime.speak(line.say, {voice: "male", pitch: line.pitch, rate: line.rate});
                }
            });
            const bar = Math.floor(step / STEPS_PER_BAR);
            const position = step % STEPS_PER_BAR;
            const root = roots[bar] - sag(step);
            const third = bar === 13 ? 3 : 4;
            if (position % 4 === 0) {
                const quarter = position / 4;
                const note = melody[bar][quarter];
                if (note) {
                    voice.lead(note - sag(step), at, length * 4 * window.siteRuntime.heldNotes(notes, bar * 3 + quarter) * 0.92, 0.1);
                }
                // Oom-pah-pah: the root on the downbeat, a soft chord on two and three.
                if (quarter === 0) {
                    voice.note(root - 12, at, length * 3.6, 0.14, "triangle");
                } else {
                    voice.arp([root + third, root + 7, root + 12], at, length * 2.2, 0.018, 0.5);
                }
            }
        }
    });

    window.siteRuntime.sounds.hal = {
        ...song,
        onsets,
        phrases,
        lyricCues,
        windDown: WIND_DOWN * stepLength
    };
})();