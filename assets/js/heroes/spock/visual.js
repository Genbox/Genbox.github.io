(function () {
    "use strict";
    // The transporter beam, on the 80×96 canvas over the portrait.
    function drawTransporter(art, time) {
        const beam = art.ctx;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
        // Stepped platform rings and narrow light columns stay within the artwork.
        beam.fillStyle = "rgba(92,206,255,0.18)";
        beam.fillRect(22, 88, 36, 3);
        beam.fillRect(18, 89, 44, 1);
        beam.fillStyle = "rgba(183,237,255,0.55)";
        beam.fillRect(25, 91, 30, 1);
        for (let column = 0; column < 9; column++) {
            const x = 19 + column * 5;
            beam.fillStyle = "rgba(100,210,255," + (0.025 + pulse * 0.045) + ")";
            beam.fillRect(x, 6, 1, 83);
            const y = 88 - (time * 25 + column * 11) % 80;
            beam.fillStyle = "rgba(152,226,255," + (0.15 + pulse * 0.18) + ")";
            beam.fillRect(x, Math.floor(y), 1, 5);
        }
        // Deterministic particles rise through the beam, glinting on alternate frames.
        for (let i = 0; i < 52; i++) {
            const life = (time * (0.17 + (i % 4) * 0.025) + i * 0.618) % 1;
            const x = 18 + (i * 17) % 45;
            const y = Math.floor(89 - life * 82);
            const glint = 0.45 + 0.55 * Math.pow(Math.sin(time * 5 + i * 2), 2);
            beam.globalAlpha = Math.sin(life * Math.PI) * glint;
            beam.fillStyle = i % 3 ? "#9bdeff" : "#fff3c1";
            beam.fillRect(x, y, 1, i % 5 === 0 ? 2 : 1);
            if (i % 9 === 0) {
                beam.fillRect(x - 1, y + 1, 3, 1);
            }
        }
        beam.globalAlpha = 1;
    }

    // Load the portrait the first time the mode is switched on.
    function toggle(active) {
        if (active) {
            window.siteRuntime.loadImages(document.querySelector(".spock-sprite"));
        }
    }

    window.siteRuntime.spriteMode({
        mode: "spock",
        sprite: ".spock-sprite",
        draw: drawTransporter,
        toggle,
        still: 0,
        fps: 12.5
    });
})();