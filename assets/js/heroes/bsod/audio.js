(function () {
    "use strict";
    // An original sixteen-second crash-and-reboot cycle rather than a tune: an error buzz, a low hum while the
    // blue screen sits there, hard-disk chatter through the self-test, a start-up chime, a gentle desktop
    // loop, then a stutter into the next crash. The monitor in the hero follows the same steps.
    const CRASH = 0;
    const REBOOT = 48;
    const CHIME = 64;
    const STUTTER = 112;
    const desktop = [
        [60, 64, 67],
        [57, 60, 64],
        [53, 57, 60],
        [55, 59, 62]
    ];

    const song = window.siteRuntime.chiptune({
        tempo: 120,
        steps: 128,
        volume: 0.2,
        play(voice, step, at, length) {
            if (step === CRASH) {
                voice.note(46, at, 0.5, 0.18, "square");
                voice.note(47, at, 0.5, 0.12, "square");
            }
            if (step > CRASH && step < REBOOT && step % 16 === 4) {
                voice.note(33, at, length * 16, 0.12, "triangle");
            }
            if (step >= REBOOT && step < CHIME) {
                if (step % 3 !== 1) {
                    voice.hat(at, 0.03 + ((step * 7) % 5) * 0.012);
                }
                if (step === REBOOT) {
                    voice.note(93, at, 0.12, 0.05, "square");
                }
            }
            if (step === CHIME) {
                [60, 67, 72, 76, 79].forEach(function (note, i) {
                    voice.lead(note, at + i * length * 1.5, length * 12 - i * length * 1.5, 0.05);
                });
                voice.note(48, at, length * 14, 0.18, "triangle");
            }
            if (step >= CHIME + 16 && step < STUTTER) {
                const chord = desktop[Math.floor((step - CHIME - 16) / 8) % desktop.length];
                if (step % 8 === 0) {
                    voice.arp(chord, at, length * 7.5, 0.035, 0.5);
                }
                if (step % 4 === 0) {
                    voice.note(chord[0] - 12, at, length * 3, 0.14, "triangle");
                }
                if (step % 4 === 2) {
                    voice.hat(at, 0.02);
                }
            }
            // The freeze: the last chord repeats faster and faster, like a stuck sound buffer.
            if (step >= STUTTER) {
                const stutter = step < 120 ? 4 : step < 124 ? 2 : 1;
                if (step % stutter === 0) {
                    voice.arp(desktop[3], at, length * stutter * 0.8, 0.04, 0.5);
                }
            }
        }
    });

    const stepLength = song.stepLength;
    window.siteRuntime.sounds.bsod = {
        ...song,
        reboot: REBOOT * stepLength,
        chime: CHIME * stepLength,
        stutter: STUTTER * stepLength
    };
})();