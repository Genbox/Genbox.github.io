(function () {
    "use strict";
    // Original eight-bar space-exploration theme in C major (not the Star Trek score), arranged like a
    // 2000-era keygen tune: tracker chords, a breathing pulse lead with echo, octave bass, and a beat on every
    // second pass.
    const roots = [48, 53, 57, 55, 48, 50, 53, 55];
    // Diatonic sevenths: major on C and F, minor on Am and Dm, dominant on G so bar 8 resolves to bar 1.
    const thirds = [4, 4, 3, 4, 4, 3, 4, 4];
    const sevenths = [11, 11, 10, 10, 11, 10, 11, 10];
    // One entry per eighth; a null holds the previous note.
    const melody = [
        [72, null, 79, 83, 81, null, 76, 79],
        [77, null, 81, 84, 83, 81, 79, null],
        [81, 84, 88, null, 86, 84, 83, null],
        [79, null, 83, 86, 81, null, 79, 74],
        [84, null, 83, 79, 76, 79, 81, null],
        [77, 81, 84, null, 86, null, 84, 81],
        [89, null, 84, 81, 79, null, 77, 76],
        [74, 79, 83, null, 81, 79, 76, 72]
    ];
    const notes = [].concat.apply([], melody);

    // How many eighths a melody note lasts: itself plus the nulls that follow it.
    // Tracker-style portamento: slide in from the previous note when it is a small step away.
    function slide(index) {
        for (let i = index - 1; i >= index - 8; i--) {
            const previous = notes[(i + notes.length) % notes.length];
            if (previous !== null) {
                return Math.abs(previous - notes[index]) <= 4 ? previous : null;
            }
        }
        return null;
    }

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.13,
        play(voice, step, at, length, loop) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const full = loop % 2 === 1;
            const root = roots[bar];
            const chord = [0, thirds[bar], 7, sevenths[bar]];
            if (sixteenth % 8 === 0) {
                voice.arp(
                    chord.map(function (i) {
                        return root + 12 + i;
                    }),
                    at,
                    length * 8,
                    0.05
                );
            }
            if (sixteenth % 2 === 0) {
                voice.note(root - 12 + (sixteenth % 4 === 2 ? 12 : 0), at, length * 1.7, 0.2, "triangle");
                const index = bar * 8 + sixteenth / 2;
                const note = notes[index];
                if (note !== null) {
                    voice.lead(note, at, length * 2 * window.siteRuntime.heldNotes(notes, index) * 0.92, 0.055, slide(index));
                }
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.045);
            }
            if (full) {
                if (sixteenth === 0 || sixteenth === 8) {
                    voice.kick(at, 0.45);
                }
                if (sixteenth === 4 || sixteenth === 12) {
                    voice.snare(at, 0.2);
                }
                if (sixteenth % 2 === 1) {
                    voice.hat(at, 0.025);
                }
            } else if (sixteenth === 0) {
                voice.kick(at, 0.3);
            }
        }
    });

    window.siteRuntime.sounds.spock = song;
})();