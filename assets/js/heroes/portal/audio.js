(function () {
    "use strict";
    // Original eight-bar test-chamber tune in D major: a plucked arpeggio, a round triangle bass and a soft
    // lead in bars 5–8. Every two bars a portal whoosh sweeps through, as the cube flies across the page, and
    // every four bars the turret says a line out loud with the browser's speech synthesis. Without it, the turret
    // chirps once per syllable instead; its eye flashes along with the syllables either way.
    const roots = [50, 45, 47, 43, 50, 45, 43, 45];
    const thirds = [4, 4, 3, 4, 4, 4, 4, 4];
    const arpeggio = [0, 2, 1, 2, 3, 2, 1, 2];
    // One entry per quarter in bars 5–8; a null holds the previous note.
    const melody = [
        [74, 78, 81, null],
        [76, null, 73, 76],
        [74, 71, 79, 78],
        [76, null, null, null]
    ];
    // The turret's lines, one every four bars, with the pitch of each syllable's chirp.
    const lines = [
        { text: "HELLO? ANYONE READING?", mood: "hello", pitches: [88, 86, 84, 86, 88, 89, 93] },
        { text: "THERE YOU ARE.", mood: "spot", pitches: [91, 88, 84] },
        { text: "I WAS NOT GOING TO SHOOT.", mood: "sorry", pitches: [86, 88, 86, 84, 86, 84, 81] },
        { text: "TARGET LOST. SEARCHING...", mood: "search", pitches: [86, 84, 81, 84, 81] }
    ];
    lines.forEach(function (line) {
        line.syllables = line.pitches.length;
        line.say = window.siteRuntime.sentenceCase(line.text);
    });

    // The turret's voice: high, a little slow, and female where the system has one.
    const speak = window.siteRuntime.speak;
    const canSpeak = window.siteRuntime.canSpeak;
    function say(text) {
        speak(text, { voice: "female", pitch: 1.7, rate: 0.85 });
    }

    const song = window.siteRuntime.chiptune({
        tempo: 100,
        steps: 256,
        volume: 0.135,
        play(voice, step, at, length) {
            const bar = Math.floor((step % 128) / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const chord = [12, 12 + thirds[bar], 19, 24];
            if (sixteenth % 2 === 0) {
                voice.note(root + 12 + chord[arpeggio[sixteenth / 2]], at, length * 1.4, 0.05, "pulse12", true);
            }
            if (sixteenth % 8 === 0) {
                voice.note(root - 12, at, length * 7, 0.22, "triangle");
            }
            if (sixteenth === 10) {
                voice.note(root - 5, at, length * 5, 0.16, "triangle");
            }
            if (bar >= 4 && sixteenth % 4 === 0) {
                const quarter = sixteenth / 4;
                const note = melody[bar - 4][quarter];
                let length4 = 1;
                while (quarter + length4 < 4 && melody[bar - 4][quarter + length4] === null) {
                    length4++;
                }
                if (note) {
                    voice.lead(note, at, length * 4 * length4 * 0.9, 0.05);
                }
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.03);
            }
            if (bar >= 4 && (sixteenth === 4 || sixteenth === 12)) {
                voice.snare(at, 0.07);
            }
            const spoken = lines[Math.floor(step / 64) % lines.length];
            const syllable = (step % 64) / 2;
            if (step % 64 === 0) {
                say(spoken.say);
            }
            if (!canSpeak && step % 2 === 0 && syllable < spoken.syllables) {
                const hz = 440 * Math.pow(2, (spoken.pitches[syllable] - 69) / 12);
                voice.sweep(hz * 0.94, hz, at, 0.16, 0.07, "sine");
                voice.sweep(hz * 2.01, hz * 1.9, at, 0.1, 0.015, "sine");
            }
            if (step % 32 === 4) {
                voice.sweep(300, 1400, at, 0.35, 0.05, "sine");
            }
            if (step % 32 === 20) {
                voice.sweep(1400, 260, at, 0.35, 0.05, "sine");
            }
        }
    });

    window.siteRuntime.sounds.portal = {
        ...song,
        line: (64 * 60) / 100 / 4,
        flight: (32 * 60) / 100 / 4,
        syllable: (2 * 60) / 100 / 4,
        lines
    };
})();