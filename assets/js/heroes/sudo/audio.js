(function () {
    "use strict";
    // Original eight-bar jaunty tune in C major under the old joke, played out in a terminal: the reader asks
    // for a sandwich and is refused, asks again with sudo, types a password and gets an "Okay". Then the
    // sandwich drops together layer by layer on the beat. Both voices speak, and the hero follows these steps.
    const roots = [48, 53, 55, 48, 45, 53, 55, 48];
    const thirds = [4, 4, 4, 4, 3, 4, 4, 4];
    const script = [
        { step: 2, typed: 12, text: "$ MAKE ME A SANDWICH", say: "Make me a sandwich.", voice: "male" },
        {
            step: 16,
            text: "WHAT? MAKE IT YOURSELF.",
            say: "What? Make it yourself.",
            voice: "female",
            refused: true
        },
        {
            step: 30,
            typed: 14,
            text: "$ SUDO MAKE ME A SANDWICH",
            say: "Sudo make me a sandwich.",
            voice: "male"
        },
        { step: 46, typed: 4, text: "PASSWORD: ****" },
        { step: 52, text: "OKAY.", say: "Okay.", voice: "female", okay: true }
    ];
    const LAYERS = [56, 62, 68, 74, 80, 86];
    const DONE = 94;

    const song = window.siteRuntime.chiptune({
        tempo: 110,
        steps: 128,
        loopDelay: 10,
        volume: 0.195,
        play(voice, step, at, length) {
            const bar = Math.floor(step / 16);
            const sixteenth = step % 16;
            const root = roots[bar];
            if (sixteenth % 4 === 0) {
                voice.note(root - 12 + (sixteenth % 8 ? 7 : 0), at, length * 1.6, 0.2, "triangle");
            }
            if (sixteenth % 4 === 2) {
                voice.arp([root + 12, root + 12 + thirds[bar], root + 19], at, length * 1.4, 0.03, 0.5);
            }
            if (sixteenth % 2 === 1) {
                voice.hat(at, 0.02);
            }
            script.forEach(function (event) {
                if (step === event.step && event.say) {
                    window.siteRuntime.speak(event.say, event.voice === "male" ? {voice: "male", pitch: 1, rate: 1} : {voice: "female", pitch: 0.8, rate: 0.95});
                }
                // Key clicks while a command or the password is typed.
                if (event.typed && step >= event.step && step < event.step + event.typed) {
                    voice.hat(at, 0.05);
                }
                if (event.refused && step === event.step) {
                    voice.note(43, at, 0.3, 0.12, "square");
                }
                if (event.okay && step === event.step) {
                    voice.arp([72, 76, 79, 84], at, 0.4, 0.05, 0.25);
                }
            });
            // A plop for each layer landing, a little lower each time as the stack grows.
            const layer = LAYERS.indexOf(step - 2);
            if (layer >= 0) {
                voice.sweep(900 - layer * 60, 220, at, 0.12, 0.08, "sine");
            }
            if (step === DONE) {
                [72, 76, 79, 84].forEach(function (note, i) {
                    voice.note(note, at + i * length, length * 3, 0.06, "pulse25", true);
                });
            }
            if (step >= LAYERS[0] && step < DONE + 16) {
                if (sixteenth % 8 === 0) {
                    voice.kick(at, 0.3);
                }
                if (sixteenth % 8 === 4) {
                    voice.snare(at, 0.08);
                }
            }
        }
    });

    const step = song.stepLength;
    window.siteRuntime.sounds.sudo = {
        ...song,
        step,
        script,
        layers: LAYERS,
        done: DONE
    };
})();