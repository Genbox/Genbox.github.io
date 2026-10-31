(function () {
    "use strict";

    window.siteRuntime.heldNotes = function (notes, index) {
        let length = 1;
        while (index + length < notes.length && notes[index + length] === null) length++;
        return length;
    };

    // A small tracker-style chip synth for the mode soundtracks, in the spirit of 2000-era keygen and cracktro
    // music: fast chord arpeggios, a pulse-width-modulated lead with slides and ping-pong echo, octave-jumping
    // bass and punchy drums. Each mode supplies only its score, as a function that plays one 16th-note step.
    const frequency = window.siteRuntime.noteFrequency;
    const frame = 1 / 50; // Old trackers step their arpeggios at the 50 Hz frame rate.

    window.siteRuntime.chiptune = function (options) {
        let audio;
        let master;
        let echo;
        let noise;
        let analyser;
        const pulses = {};
        const sources = new Set();
        let timer;
        let suspendTimer;
        let playing = false;
        let generation = 0;
        let step = 0;
        let next = 0;
        let origin = 0;
        const stepLength = 60 / options.tempo / 4;

        function track(source, parts) {
            sources.add(source);
            source.onended = function () {
                sources.delete(source);
                parts.forEach(function (part) {
                    part.disconnect();
                });
            };
        }

        function setup() {
            master = audio.createGain();
            master.gain.value = 0;
            const compressor = audio.createDynamicsCompressor();
            compressor.threshold.value = -16;
            compressor.ratio.value = 4;
            master.connect(compressor).connect(audio.destination);
            // A read-only tap after compression includes the lead's echo and drums.
            analyser = audio.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.3;
            compressor.connect(analyser);

            // Ping-pong echo: a dotted eighth that bounces left and right, fed by the lead.
            echo = audio.createGain();
            const left = audio.createDelay(1);
            const right = audio.createDelay(1);
            const feedbackLeft = audio.createGain();
            const feedbackRight = audio.createGain();
            const panLeft = audio.createStereoPanner();
            const panRight = audio.createStereoPanner();
            left.delayTime.value = right.delayTime.value = stepLength * 3;
            feedbackLeft.gain.value = feedbackRight.gain.value = 0.38;
            panLeft.pan.value = -0.7;
            panRight.pan.value = 0.7;
            echo.connect(left);
            left.connect(panLeft).connect(master);
            left.connect(feedbackLeft).connect(right);
            right.connect(panRight).connect(master);
            right.connect(feedbackRight).connect(left);

            // One-bit noise from a 15-bit shift register, like the NES noise channel.
            noise = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.25), audio.sampleRate);
            const samples = noise.getChannelData(0);
            let register = 1;
            for (let i = 0; i < samples.length; i++) {
                if (i % 4 === 0) {
                    register = register >>> 1 | ((register ^ register >>> 1) & 1) << 14;
                }
                samples[i] = register & 1 ? 0.7 : -0.7;
            }
        }

        // A fixed-duty pulse wave (0.125, 0.25 or 0.5), built from its Fourier series.
        function pulse(duty) {
            if (!pulses[duty]) {
                const harmonics = 32;
                const real = new Float32Array(harmonics);
                const imag = new Float32Array(harmonics);
                for (let n = 1; n < harmonics; n++) {
                    real[n] = Math.sin(2 * Math.PI * n * duty) / (Math.PI * n);
                    imag[n] = (2 * Math.pow(Math.sin(Math.PI * n * duty), 2)) / (Math.PI * n);
                }
                pulses[duty] = audio.createPeriodicWave(real, imag);
            }
            return pulses[duty];
        }

        // Quick attack, a sustain, then a short release so notes never click.
        function envelope(at, length, volume, sustain) {
            const gain = audio.createGain();
            gain.gain.setValueAtTime(0, at);
            gain.gain.linearRampToValueAtTime(volume, at + 0.004);
            gain.gain.setTargetAtTime(volume * sustain, at + 0.02, 0.08);
            gain.gain.setTargetAtTime(0, at + Math.max(0.02, length - 0.02), 0.012);
            return gain;
        }

        const voices = {
            // A pulse lead whose width sweeps slowly (the SID "breathing" sound), with an optional slide from
            // the previous note, late vibrato and the ping-pong echo. The pulse is a sawtooth minus a delayed copy.
            lead(note, at, length, volume, from) {
                const hz = frequency(note);
                const saw = audio.createOscillator();
                const delay = audio.createDelay(0.05);
                const invert = audio.createGain();
                const gain = envelope(at, length, volume, 0.75);
                const sweep = audio.createOscillator();
                const width = audio.createGain();
                const wobble = audio.createOscillator();
                const depth = audio.createGain();
                saw.type = "sawtooth";
                if (from) {
                    saw.frequency.setValueAtTime(frequency(from), at);
                    saw.frequency.exponentialRampToValueAtTime(hz, at + 0.045);
                } else {
                    saw.frequency.setValueAtTime(hz, at);
                }
                delay.delayTime.value = 0.5 / hz;
                invert.gain.value = -1;
                sweep.frequency.value = 1.3;
                width.gain.value = 0.32 / hz;
                wobble.frequency.value = 6;
                depth.gain.setValueAtTime(0, at);
                depth.gain.setValueAtTime(0, at + 0.18);
                depth.gain.linearRampToValueAtTime(hz * 0.008, at + 0.3);
                saw.connect(gain);
                saw.connect(delay).connect(invert).connect(gain);
                sweep.connect(width).connect(delay.delayTime);
                wobble.connect(depth).connect(saw.frequency);
                gain.connect(master);
                const send = audio.createGain();
                send.gain.value = 0.45;
                gain.connect(send).connect(echo);
                [saw, sweep, wobble].forEach(function (oscillator) {
                    oscillator.start(at);
                    oscillator.stop(at + length + 0.05);
                });
                track(saw, [saw, delay, invert, gain, send]);
                track(sweep, [sweep, width]);
                track(wobble, [wobble, depth]);
            },
            // The tracker chord: one pulse voice cycling through the chord tones every 50 Hz frame.
            arp(notes, at, length, volume, duty) {
                const oscillator = audio.createOscillator();
                const gain = envelope(at, length, volume, 0.7);
                oscillator.setPeriodicWave(pulse(duty || 0.25));
                for (let time = at, i = 0; time < at + length; time += frame, i++) {
                    oscillator.frequency.setValueAtTime(frequency(notes[i % notes.length]), time);
                }
                oscillator.connect(gain).connect(master);
                track(oscillator, [oscillator, gain]);
                oscillator.start(at);
                oscillator.stop(at + length + 0.05);
            },
            // A plain chip note: pulse ("pulse12", "pulse25", "square") or "triangle".
            note(note, at, length, volume, type, echoed) {
                const oscillator = audio.createOscillator();
                const gain = envelope(at, length, volume, 0.6);
                if (type === "pulse12") {
                    oscillator.setPeriodicWave(pulse(0.125));
                } else if (type === "pulse25") {
                    oscillator.setPeriodicWave(pulse(0.25));
                } else {
                    oscillator.type = type;
                }
                oscillator.frequency.value = frequency(note);
                oscillator.connect(gain).connect(master);
                const parts = [oscillator, gain];
                if (echoed) {
                    const send = audio.createGain();
                    send.gain.value = 0.3;
                    gain.connect(send).connect(echo);
                    parts.push(send);
                }
                track(oscillator, parts);
                oscillator.start(at);
                oscillator.stop(at + length + 0.05);
            },
            // A pitch sweep, for blips and zaps.
            sweep(fromHz, toHz, at, length, volume, type) {
                const oscillator = audio.createOscillator();
                const gain = audio.createGain();
                oscillator.type = type || "triangle";
                oscillator.frequency.setValueAtTime(fromHz, at);
                oscillator.frequency.exponentialRampToValueAtTime(toHz, at + length);
                gain.gain.setValueAtTime(volume, at);
                gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
                oscillator.connect(gain).connect(master);
                track(oscillator, [oscillator, gain]);
                oscillator.start(at);
                oscillator.stop(at + length + 0.01);
            },
            // A nasal toy horn: two detuned sawtooths through a narrow resonant filter that opens on the attack,
            // scooping up into the note and dropping off at the end.
            horn(note, at, length, volume) {
                const hz = frequency(note);
                const gain = envelope(at, length, volume, 0.85);
                const filter = audio.createBiquadFilter();
                const nose = audio.createBiquadFilter();
                filter.type = "lowpass";
                filter.Q.value = 5;
                filter.frequency.setValueAtTime(500, at);
                filter.frequency.exponentialRampToValueAtTime(2600, at + 0.05);
                filter.frequency.exponentialRampToValueAtTime(1500, at + length);
                nose.type = "peaking";
                nose.frequency.value = 1250;
                nose.Q.value = 2;
                nose.gain.value = 9;
                filter.connect(nose).connect(gain).connect(master);
                const parts = [filter, nose, gain];
                [-7, 7].forEach(function (cents, index) {
                    const saw = audio.createOscillator();
                    saw.type = "sawtooth";
                    saw.detune.value = cents;
                    saw.frequency.setValueAtTime(hz * 0.92, at);
                    saw.frequency.exponentialRampToValueAtTime(hz, at + 0.04);
                    saw.frequency.setValueAtTime(hz, at + length - 0.07);
                    saw.frequency.exponentialRampToValueAtTime(hz * 0.84, at + length);
                    saw.connect(filter);
                    saw.start(at);
                    saw.stop(at + length + 0.05);
                    track(saw, index ? [saw].concat(parts) : [saw]);
                });
            },
            kick(at, volume) {
                voices.sweep(160, 42, at, 0.16, volume || 0.6, "sine");
            },
            snare(at, volume) {
                hit(at, 1200, 0.13, volume || 0.3);
                voices.sweep(220, 130, at, 0.08, (volume || 0.3) * 0.6, "triangle");
            },
            hat(at, volume, open) {
                hit(at, 7500, open ? 0.12 : 0.035, volume || 0.07);
            }
        };

        function hit(at, cutoff, length, volume) {
            const source = audio.createBufferSource();
            const filter = audio.createBiquadFilter();
            const gain = audio.createGain();
            source.buffer = noise;
            filter.type = "highpass";
            filter.frequency.value = cutoff;
            gain.gain.setValueAtTime(volume, at);
            gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
            source.connect(filter).connect(gain).connect(master);
            track(source, [source, filter, gain]);
            source.start(at);
            source.stop(at + length + 0.01);
        }

        function schedule() {
            if (!playing) {
                return;
            }
            while (next < audio.currentTime + 0.15) {
                options.play(voices, step % options.steps, next, stepLength, Math.floor(step / options.steps));
                next += stepLength;
                step++;
                if (step % options.steps === 0) {
                    next += options.loopDelay || 0;
                }
            }
        }

        function start() {
            if (playing) {
                return;
            }
            // The prefixed fallback supports old Safari/WebKit.
            const Audio = window.AudioContext || window.webkitAudioContext;
            if (!Audio) {
                return;
            }
            if (!audio) {
                audio = new Audio();
                setup();
            }
            clearTimeout(suspendTimer);
            playing = true;
            const current = ++generation;
            audio
                .resume()
                .then(function () {
                    if (!playing || current !== generation) {
                        return;
                    }
                    const now = audio.currentTime;
                    master.gain.cancelScheduledValues(now);
                    master.gain.setValueAtTime(0, now);
                    master.gain.linearRampToValueAtTime(options.volume, now + 0.05);
                    origin = performance.now();
                    step = 0;
                    next = now + 0.06;
                    schedule();
                    timer = setInterval(schedule, 25);
                    document.dispatchEvent(
                        new CustomEvent("chiptunechange", {
                            detail: {analyser, playing: true, sampleRate: audio.sampleRate }
                        })
                    );
                })
                .catch(function () {
                    if (current === generation) {
                        playing = false;
                    }
                });
        }

        // Fade out instead of cutting the notes off, which clicks.
        function stop() {
            if (playing && analyser) {
                document.dispatchEvent(
                    new CustomEvent("chiptunechange", {
                        detail: {analyser, playing: false }
                    })
                );
            }
            playing = false;
            generation++;
            clearInterval(timer);
            if (!audio) {
                return;
            }
            const now = audio.currentTime;
            master.gain.cancelScheduledValues(now);
            master.gain.setValueAtTime(master.gain.value, now);
            master.gain.linearRampToValueAtTime(0, now + 0.04);
            sources.forEach(function (source) {
                source.stop(now + 0.05);
            });
            clearTimeout(suspendTimer);
            suspendTimer = setTimeout(function () {
                if (!playing) {
                    audio.suspend().catch(function () {});
                }
            }, 80);
        }

        return {
            stepLength,
            eighth: stepLength * 2,
            loop: options.steps * stepLength + (options.loopDelay || 0),
            start,
            stop,
            startedAt() {
                return origin;
            }
        };
    };
})();