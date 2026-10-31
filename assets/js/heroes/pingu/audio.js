(function () {
    "use strict";
    // Original eight-bar waddle in F major: an oom-pah bass and off-beat chords under a staccato pulse tune.
    // Bars 3 and 7 stop for two horn "noots", which the penguin's animation follows (see NOOTS below).
    const roots = [41, 48, 46, 48, 41, 46, 48, 41];
    // One entry per eighth; a null holds the previous note and a 0 is a rest.
    const melody = [
        [72, 69, 72, 77, 76, 72, 69, null],
        [67, 72, 76, 74, 72, null, 67, null],
        [0, 0, 0, 0, 70, 74, 77, null],
        [76, 74, 72, 70, 69, 67, 72, null],
        [77, null, 76, 77, 81, 77, 72, null],
        [74, 77, 74, 70, 65, null, 70, null],
        [0, 0, 0, 0, 72, 76, 79, null],
        [77, null, 72, null, 69, 72, 65, null]
    ];
    const NOOTS = [48, 52, 112, 116];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.15,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            const stopTime = (bar === 2 || bar === 6) && sixteenth < 8;
            if (NOOTS.indexOf(step) >= 0) {
                voice.horn(70, at, length * 3, 0.16);
            }
            if (stopTime) {
                return;
            }
            // Oom: root and fifth on the beats. Pah: a short chord on the off-beats.
            if (sixteenth % 4 === 0) {
                voice.note(root + (sixteenth % 8 ? 7 : 0), at, length * 1.6, 0.22, "triangle");
            }
            if (sixteenth % 4 === 2) {
                voice.arp([root + 16, root + 19, root + 24], at, length * 1.2, 0.035, 0.5);
            }
            if (sixteenth % 2 === 0) {
                const eighth = sixteenth / 2;
                const note = melody[bar][eighth];
                if (note) {
                    voice.note(note, at, length * 2 * window.siteRuntime.heldNotes(melody[bar], eighth) * 0.6, 0.06, "pulse25", true);
                }
            }
            if (sixteenth % 4 === 2) {
                voice.hat(at, 0.035);
            }
            if (sixteenth === 4 || sixteenth === 12) {
                voice.snare(at, 0.1);
            }
            if (sixteenth === 0) {
                voice.kick(at, 0.3);
            }
            // A little drum fill leads back in after each pair of noots.
            if ((bar === 2 || bar === 6) && sixteenth >= 12) {
                voice.snare(at, 0.07 + (sixteenth - 12) * 0.02);
            }
        }
    });

    window.siteRuntime.sounds.pingu = song;
})();