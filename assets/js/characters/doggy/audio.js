(function () {
    "use strict";
    let woofAudio;
    let woofBuffer;
    let woofLoading;
    let barkStarted = -1;
    const yipRate = 1.6;
    const barkUrl = window.siteAsset("../audio/dog-bark.mp3");
    const woofSources = new Set();
    function prepareWoof() {
        // The prefixed fallback supports old Safari/WebKit.
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) {
            return;
        }
        if (!woofAudio) {
            woofAudio = new Audio();
        }
        woofAudio.resume().catch(function () {});
        if (!woofBuffer && !woofLoading) {
            woofLoading = fetch(barkUrl)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Bark unavailable");
                    }
                    return response.arrayBuffer();
                })
                .then(data => woofAudio.decodeAudioData(data))
                .then(function (buffer) {
                    woofBuffer = buffer;
                })
                .catch(function () {})
                .finally(function () {
                    woofLoading = null;
                });
        }
    }
    function stopWoof() {
        barkStarted = -1;
        woofSources.forEach(function (source) {
            source.stop();
        });
        woofSources.clear();
    }
    function woof() {
        if (!woofAudio || woofAudio.state !== "running" || !woofBuffer) {
            return;
        }
        const source = woofAudio.createBufferSource();
        const volume = woofAudio.createGain();
        source.buffer = woofBuffer;
        source.playbackRate.value = yipRate;
        volume.gain.value = 0.18;
        const filter = woofAudio.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 330;
        source.connect(filter).connect(volume).connect(woofAudio.destination);
        woofSources.add(source);
        barkStarted = woofAudio.currentTime;
        source.onended = function () {
            woofSources.delete(source);
            source.disconnect();
            volume.disconnect();
            filter.disconnect();
        };
        source.start();
    }
    function barkMotion() {
        if (barkStarted < 0 || !woofBuffer || window.siteRuntime.reducedMotion.matches) {
            return 0;
        }
        const age = woofAudio.currentTime - barkStarted;
        const duration = woofBuffer.duration / yipRate;
        if (age < 0 || age > duration + 0.16) {
            return 0;
        }
        // Hold the jaw open through the short yip, then visibly settle back down.
        if (age < 0.045) {
            return age / 0.045;
        }
        if (age < duration * 0.8) {
            return 1;
        }
        return Math.max(0, 1 - (age - duration * 0.8) / (duration * 0.2 + 0.16));
    }
    function suspend() {
        if (woofAudio) {
            woofAudio.suspend().catch(function () {});
        }
    }
    window.siteRuntime.sounds.doggy = {
        start: prepareWoof,
        stop: stopWoof,
        play: woof,
        motion: barkMotion,
        suspend
    };
})();