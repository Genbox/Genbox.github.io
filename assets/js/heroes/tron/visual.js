(function () {
    "use strict";
    const canvas = document.querySelector(".tron-sprite");
    if (!canvas) {
        return;
    }
    const image = new Image();
    let transparentSprite;
    const figureScale = 1.65;
    const beamHeight = 24;

    function draw(art, t) {
        if (!transparentSprite) {
            return;
        }
        const ctx = art.ctx;
        function pixel(color, x, y, w, h) {
            ctx.fillStyle = color;
            // Compress only the empty upper beam; keep the figure and effects proportional.
            const mappedY = y < 90 ? (y * beamHeight) / 90 : y - 90 + beamHeight;
            const mappedHeight = y < 90 ? Math.max(1, (h * beamHeight) / 90) : h;
            ctx.fillRect(Math.round(x), Math.round(mappedY), w, mappedHeight);
        }
        // Enlarge the figure while shortening the upper beam to fit the same slot (in the canvas's 160×192
        // pixels, so this replaces the helper's 2× scale).
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(figureScale, 0, 0, figureScale, 80 * (1 - figureScale), 0);
        const split = (image.naturalHeight * 90) / 192;
        ctx.drawImage(transparentSprite, 0, 0, image.naturalWidth, split, 0, 0, 160, beamHeight);
        ctx.drawImage(transparentSprite, 0, split, image.naturalWidth, image.naturalHeight - split, 0, beamHeight, 160, 102);
        ctx.globalCompositeOperation = "screen";
        const strength = (Math.sin(t * 3) + 1) / 2;
        ctx.globalAlpha = 0.15 + strength * 0.2;
        // Source beam center: x=201 in the 416px-wide reference, scaled to 160px.
        const beamX = Math.round((201 * 160) / image.naturalWidth);
        pixel("#19dcff", beamX, 17, 1, 91);
        ctx.globalAlpha = 1;
        for (let i = 0; i < 2; i++) {
            const y = 106 - (t * 25 + i * 48) % 94;
            pixel("#0871b5", beamX - 3, y - 2, 7, 5);
            pixel("#53eaff", beamX - 2, y - 1, 5, 3);
            pixel("#efffff", beamX - 1, y, 3, 1);
        }
        // Bright pinpoint glints and occasional cross-shaped stars throughout the aura.
        for (let spark = 0; spark < 64; spark++) {
            const angle = spark * 2.399 + t * 0.12;
            const radius = 18 + spark % 22;
            const x = beamX + Math.cos(angle) * radius;
            const y = 135 + Math.sin(angle) * radius * 0.85;
            const twinkle = Math.pow((Math.sin(t * 4 + spark * 1.7) + 1) / 2, 5);
            ctx.globalAlpha = 0.15 + twinkle * 0.85;
            pixel(spark % 3 ? "#56cfff" : "#be77ff", x, y, 1, 1);
            if (twinkle > 0.85 && spark % 4 === 0) {
                ctx.globalAlpha = twinkle * 0.75;
                pixel("#83eaff", x - 2, y, 5, 1);
                pixel("#83eaff", x, y - 2, 1, 5);
                pixel("#ffffff", x, y, 1, 1);
            }
        }
        // Rising sparks frame the beam without moving its center line.
        for (let mote = 0; mote < 24; mote++) {
            const progress = (t * (0.22 + (mote % 3) * 0.04) + mote * 0.173) % 1;
            const x = beamX + Math.sin(mote * 2.4 + t * 0.8) * (4 + mote % 7);
            const y = 108 - progress * 96;
            ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.9;
            pixel(mote % 3 ? "#26c9f4" : "#d9ffff", x, y, 1, mote % 4 === 0 ? 2 : 1);
        }
        for (let ember = 0; ember < 12; ember++) {
            const progress = (t * 0.6 + ember * 0.173) % 1;
            ctx.globalAlpha = 1 - progress;
            pixel("#ff923d", 53 + ember * 4.5, 178 - progress * 9, 1, 1);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
    }
    // A low blue fog and rising embers at the page edges, leaving the reading column clear.
    function drawAtmosphere(ctx, width, height, t) {
        function haze(x, y, radius, color) {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, "rgba(0,35,80,0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        for (let i = 0; i < 12; i++) {
            const side = i % 2 ? width : 0;
            const y = ((i / 12) * height + Math.sin(t * 0.12 + i) * 70 + height) % height;
            haze(side + Math.sin(t * 0.18 + i * 3) * 50, y, 210 + (i % 3) * 60, "rgba(5,70,155,0.13)");
        }
        for (let ember = 0; ember < 36; ember++) {
            const life = (t * (0.035 + (ember % 3) * 0.01) + ember * 0.137) % 1;
            const edgeX = 10 + (ember % 6) * 14 + Math.sin(t * 0.4 + ember) * 14;
            ctx.globalAlpha = Math.sin(life * Math.PI) * 0.65;
            ctx.fillStyle = ember % 3 ? "#279cdf" : "#8feeff";
            ctx.fillRect(ember % 2 ? width - edgeX : edgeX, height * (1 - life), 1 + ember % 2, 2);
        }
        ctx.globalAlpha = 1;
    }

    image.addEventListener("load", function () {
        // Convert the black-backed light artwork to alpha once, before animation.
        // This keeps the glow independent of page stacking contexts and mist layers.
        transparentSprite = document.createElement("canvas");
        transparentSprite.width = image.naturalWidth;
        transparentSprite.height = image.naturalHeight;
        const buffer = transparentSprite.getContext("2d");
        buffer.drawImage(image, 0, 0);
        const light = buffer.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
        const pixels = light.data;
        for (let i = 0; i < pixels.length; i += 4) {
            const brightness = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
            if (brightness <= 12) {
                pixels[i + 3] = 0;
                continue;
            }
            pixels[i + 3] = Math.round(((brightness - 12) / 243) * 255);
            for (let channel = 0; channel < 3; channel++) {
                pixels[i + channel] = Math.round((pixels[i + channel] * 255) / brightness);
            }
        }
        buffer.putImageData(light, 0, 0);
        hero.refresh();
    });
    // Load the artwork the first time the mode is switched on.
    function toggle(active) {
        if (active && !image.getAttribute("src")) {
            image.src = canvas.getAttribute("data-sprite");
        }
    }

    const hero = window.siteRuntime.spriteMode({
        mode: "tron",
        sprite: ".tron-sprite",
        draw,
        layer: { className: "tron-atmosphere", draw: drawAtmosphere },
        toggle,
        still: 0,
        fps: 20
    });
})();