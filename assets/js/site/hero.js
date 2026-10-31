(function () {
    "use strict";

    // The front page's hero: heroes and the seasonal themes show their artwork beside the heading.
    const hero = document.querySelector(".hero");
    const heading = document.getElementById("typed-heading");
    if (!hero || !heading) {
        return;
    }

    // Center every decoration in the space after the complete heading, even while it types.
    const measure = document.createElement("canvas").getContext("2d");
    function positionArt() {
        const style = getComputedStyle(heading);
        const text = heading.getAttribute("data-text");
        measure.font = style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
        const spacing = parseFloat(style.letterSpacing) || 0;
        let textWidth = measure.measureText(text).width + spacing * (text.length - 1);
        const cursor = heading.querySelector(".cursor");
        if (cursor) {
            textWidth += cursor.getBoundingClientRect().width + parseFloat(style.fontSize) * 0.1;
        }
        const gap = hero.getBoundingClientRect().width - textWidth;
        hero.style.setProperty("--hero-art-right", Math.max(0, (gap - 160) / 2) + "px");
    }
    new ResizeObserver(positionArt).observe(hero);
    document.fonts.ready.then(positionArt);
    positionArt();

    // Make room for the artwork whenever any of it shows.
    function updateArtwork() {
        hero.classList.toggle("hero-has-art", !!hero.querySelector(".hero-art:not([hidden])"));
    }
    const observer = new MutationObserver(updateArtwork);
    hero.querySelectorAll(".hero-art").forEach(function (art) {
        observer.observe(art, { attributes: true, attributeFilter: ["hidden"] });
    });
    updateArtwork();
})();