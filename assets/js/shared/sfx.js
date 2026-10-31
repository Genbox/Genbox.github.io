(function () {
    "use strict";
    // Short synthesized sound effects, in an audio context of their own so they play at once. Each sound starts
    // with a quick attack and fades out exponentially; the context sleeps a moment after the last one ends. Each
    // feature gets its own set, so it can cut off its sounds without touching another feature's.
    let audio;
    let master;
    let noiseBuffer;
    let sleepTimer;
    const sources = new Set();

    function wake() {
        // The prefixed fallback supports old Safari/WebKit.
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!audio && Audio) {
            audio = new Audio();
            master = audio.createGain();
            master.gain.value = 0.8;
            master.connect(audio.destination);
        }
        if (!audio) {
            return null;
        }
        clearTimeout(sleepTimer);
        if (audio.state === "suspended") {
            audio.resume().catch(function () {});
        }
        return audio;
    }

    function sleep() {
        if (audio && !sources.size) {
            audio.suspend().catch(function () {});
        }
    }

    // Plays source from at to end through the optional filter, { type, from, to, q }, swept from one frequency to
    // the other, and keeps it in the set owner until it ends.
    function play(source, options, at, owner) {
        const end = at + options.length;
        const gain = audio.createGain();
        let output = source;
        let filter;
        if (options.filter) {
            filter = audio.createBiquadFilter();
            filter.type = options.filter.type;
            filter.Q.value = options.filter.q || 1;
            filter.frequency.setValueAtTime(options.filter.from, at);
            filter.frequency.exponentialRampToValueAtTime(options.filter.to || options.filter.from, end);
            output = source.connect(filter);
        }
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(options.volume, at + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        output.connect(gain).connect(master);
        sources.add(source);
        owner.add(source);
        source.onended = function () {
            sources.delete(source);
            owner.delete(source);
            source.disconnect();
            if (filter) {
                filter.disconnect();
            }
            gain.disconnect();
            if (!sources.size) {
                clearTimeout(sleepTimer);
                sleepTimer = setTimeout(sleep, 1000);
            }
        };
        source.start(at);
        source.stop(end + 0.02);
    }

    // An oscillator gliding from one frequency to another.
    // options: { type ("sine"), from, to (from), at (0, seconds from now), length, volume, filter }.
    function tone(options, owner) {
        if (!wake()) {
            return;
        }
        const at = audio.currentTime + (options.at || 0);
        const oscillator = audio.createOscillator();
        oscillator.type = options.type || "sine";
        oscillator.frequency.setValueAtTime(options.from, at);
        oscillator.frequency.exponentialRampToValueAtTime(options.to || options.from, at + options.length);
        play(oscillator, options, at, owner);
    }

    // White noise, usually shaped by a filter. options: { at, length, volume, filter }, as for tone.
    function noise(options, owner) {
        if (!wake()) {
            return;
        }
        if (!noiseBuffer) {
            noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }
        const source = audio.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        play(source, options, audio.currentTime + (options.at || 0), owner);
    }

    // A feature's set of sound effects: { tone, noise, stop }. stop() cuts off the set's sounds, including those
    // scheduled for later; each cleans up as it ends.
    function soundEffects() {
        const owned = new Set();
        return {
            tone(options) {
                tone(options, owned);
            },
            noise(options) {
                noise(options, owned);
            },
            stop() {
                owned.forEach(function (source) {
                    source.stop();
                });
            }
        };
    }

    window.siteRuntime.soundEffects = soundEffects;
})();