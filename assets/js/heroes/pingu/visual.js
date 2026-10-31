(function () {
    "use strict";
    const colors = {
        body: "#1c2333",
        rim: "#38435c",
        white: "#f6f3ea",
        shade: "#d5dbe4",
        beak: "#f2792b",
        lip: "#c4471c",
        mouth: "#5a1c12",
        feet: "#f59a3a",
        ice: "#e3f4ff",
        iceShade: "#a8d3ee",
        iceEdge: "#7fb6dc",
        ink: "#10141c"
    };
    // When the soundtrack's horn notes play, in seconds into its 16-second loop.
    const NOOTS = [6, 6.5, 14, 14.5];
    const NOOT_LENGTH = 0.375;
    const LOOP = 16;

    // How far into a noot we are (0–1), or -1 between noots; and the wind-up before the first of a pair.
    function nootAt(t) {
        for (let i = 0; i < NOOTS.length; i++) {
            if (t >= NOOTS[i] && t < NOOTS[i] + NOOT_LENGTH) {
                return (t - NOOTS[i]) / NOOT_LENGTH;
            }
        }
        return -1;
    }
    function pairAt(t) {
        for (let i = 0; i < NOOTS.length; i += 2) {
            if (t >= NOOTS[i] - 0.45 && t < NOOTS[i]) {
                return { phase: "windup", amount: (t - NOOTS[i] + 0.45) / 0.45 };
            }
            if (t >= NOOTS[i] && t < NOOTS[i + 1] + 1.2) {
                return { phase: "noot", second: t >= NOOTS[i + 1], amount: 1 };
            }
        }
        return null;
    }

    function drawIce(art, t) {
        const rect = art.rect;
        rect(colors.iceEdge, 7, 87, 66, 6);
        rect(colors.ice, 8, 85, 64, 4);
        rect(colors.iceShade, 9, 89, 62, 2);
        rect(colors.iceShade, 18, 86, 6, 1);
        rect(colors.iceShade, 56, 87, 8, 1);
        // Snow drifts down across the scene.
        for (let i = 0; i < 18; i++) {
            const fall = (t * (5 + i % 4) + i * 13) % 92;
            art.alpha(0.5 + (i % 3) * 0.2);
            rect("#ffffff", Math.round((i * 23 + Math.sin(t + i) * 3) % 80), Math.round(fall) - 4, 1, 1);
        }
        art.alpha(1);
    }

    function drawPenguin(art, t) {
        const rect = art.rect;
        const ellipse = art.ellipse;
        const noot = nootAt(t);
        const pair = pairAt(t);
        const windup = pair && pair.phase === "windup" ? pair.amount : 0;
        const blowing = noot >= 0;
        const nooting = pair && pair.phase === "noot";
        // Waddle from foot to foot between noots; stretch tall and lean back to blow the horn.
        const step = nooting || windup ? 0 : Math.floor(t * 2.5) % 2;
        const sway = nooting || windup ? 0 : step ? 1 : -1;
        const stretch = blowing ? 3 + Math.round(Math.sin(noot * Math.PI) * 2) : nooting ? 2 : Math.round(windup * 2);
        const lean = nooting ? -1 : -Math.round(windup);
        const x = 38 + sway;
        const headX = x + 2 + lean;
        const headY = 44 - stretch;

        ellipse("#bddcf0", 40, 86, 18, 2);
        rect(colors.feet, 29, 83 - (step === 1 && !nooting ? 1 : 0), 9, 3);
        rect(colors.feet, 41, 83 - (step === 0 && !nooting && !windup ? 1 : 0), 9, 3);
        // Flippers swing with the waddle, and fling up and back for the noot.
        if (nooting || windup > 0.5) {
            for (let f = 0; f < 10; f++) {
                rect(colors.body, x - 13 - f, 61 - stretch - Math.round(f * 0.7), 5, 3);
                rect(colors.body, x + 9 + f, 62 - stretch - Math.round(f * 0.7), 5, 3);
            }
        } else {
            for (let r = 0; r < 14; r++) {
                rect(colors.body, x - 15 - (r > 4 ? 1 : 0) - (step ? r >> 2 : 0), 58 + r, 4, 1);
                rect(colors.body, x + 13 + (r > 4 ? 1 : 0) + (step ? 0 : r >> 2), 58 + r, 4, 1);
            }
        }
        // Pear-shaped body and a round head with no neck, white belly and face.
        ellipse(colors.body, x, 66 - stretch / 2, 15, 19 + stretch / 2);
        ellipse(colors.body, headX, headY, 13, 12);
        rect(colors.rim, headX - 6, headY - 11, 8, 1);
        ellipse(colors.white, x + 2, 70 - stretch / 2, 10, 13 + stretch / 2);
        ellipse(colors.shade, x + 2, 79, 8, 3);
        ellipse(colors.white, x + 2, 76, 9, 5);
        ellipse(colors.white, headX + 4, headY + 4, 9, 7);

        // Eyes: wide open, a blink every few seconds, squeezed shut while blowing.
        const eyeY = headY - 4;
        if (blowing || nooting && pair.second) {
            // Squeezed shut: a white patch creased into a ">" and a "<".
            [
                [headX - 1, 1],
                [headX + 7, -1]
            ].forEach(function (eye) {
                rect(colors.white, eye[0], eyeY, 4, 5);
                const tip = eye[1] > 0 ? eye[0] + 2 : eye[0] + 1;
                rect(colors.ink, tip - eye[1], eyeY + 1, 1, 1);
                rect(colors.ink, tip, eyeY + 2, 1, 1);
                rect(colors.ink, tip - eye[1], eyeY + 3, 1, 1);
            });
        } else if (t % 3.7 < 0.15) {
            rect(colors.white, headX - 1, eyeY, 4, 5);
            rect(colors.white, headX + 7, eyeY, 4, 5);
            rect(colors.ink, headX - 1, eyeY + 3, 4, 1);
            rect(colors.ink, headX + 7, eyeY + 3, 4, 1);
        } else {
            const look = windup ? -1 : 0;
            rect(colors.white, headX - 1, eyeY, 4, 5);
            rect(colors.white, headX + 7, eyeY, 4, 5);
            rect(colors.ink, headX + 1, eyeY + 1 + look, 2, 3);
            rect(colors.ink, headX + 9, eyeY + 1 + look, 2, 3);
        }

        // The beak: a wide flat bill, puckered while winding up, and stretched into a trumpet for the noot.
        const beakY = headY + 2;
        if (nooting) {
            const reach = blowing ? 12 + Math.round(Math.sin(noot * Math.PI) * 3) : 10;
            rect(colors.beak, headX + 9, beakY, reach, 4);
            rect(colors.lip, headX + 9, beakY + 3, reach, 1);
            rect(colors.beak, headX + 8 + reach, beakY - 2, 2, 8);
            rect(colors.lip, headX + 10 + reach, beakY - 3, 2, 10);
            rect(colors.mouth, headX + 10 + reach, beakY - 1, 1, 6);
            if (blowing) {
                art.alpha(1 - noot * 0.6);
                for (let wave = 0; wave < 3; wave++) {
                    const wx = headX + 14 + reach + wave * 3 + Math.round(noot * 4);
                    rect(colors.white, wx, beakY - 3 - wave, 1, 10 + wave * 2);
                }
                art.alpha(1);
            }
        } else if (windup) {
            rect(colors.beak, headX + 9, beakY, 6, 4);
            rect(colors.lip, headX + 13, beakY + 1, 3, 2);
        } else {
            rect(colors.beak, headX + 8, beakY, 9, 2);
            rect(colors.lip, headX + 8, beakY + 2, 8, 2);
            rect(colors.mouth, headX + 9, beakY + 2, 6, 1);
        }

        // The speech bubble: "NOOT" after the first honk, "NOOT NOOT!" after the second.
        if (nooting) {
            const label = pair.second ? "NOOT NOOT!" : "NOOT";
            const width = art.width(label) + 6;
            const left = Math.min(74 - width, 36);
            const shake = blowing ? Math.round(Math.sin(t * 60)) : 0;
            rect(colors.ink, left - 1 + shake, 3, width + 2, 11);
            rect(colors.white, left + shake, 4, width, 9);
            rect(colors.ink, left + 6 + shake, 14, 3, 2);
            rect(colors.white, left + 7 + shake, 13, 1, 2);
            art.text(label, left + 3 + shake, 6, colors.ink);
        }
    }

    function draw(art, t) {
        drawIce(art, t);
        drawPenguin(art, t % LOOP);
    }

    // The helper follows the soundtrack's clock, so the honks line up with the beak.
    window.siteRuntime.spriteMode({
        mode: "pingu",
        sprite: ".pingu-sprite",
        draw,
        still: 6.6,
        fps: 20
    });
})();