(function () {
    "use strict";

    // Calls decorate(box, random) once for each content box on the page. random() returns the same sequence for
    // the same box on every visit, so each box keeps its look. The box's data-<marker> attribute records that it is
    // done, set to decorate's result (or "true").
    function eachBox(marker, decorate) {
        document.querySelectorAll(".card, .panel, .toc, .series, .adj, .chart").forEach(function (box, index) {
            if (box.dataset[marker]) {
                return;
            }
            const key = location.pathname + "|" + (box.id || box.getAttribute("href") || box.tagName) + "|" + index;
            // FNV-1a hash of the key seeds a linear congruential generator.
            let seed = 2166136261;
            for (let i = 0; i < key.length; i++) {
                seed = Math.imul(seed ^ key.charCodeAt(i), 16777619);
            }
            function random() {
                seed = Math.imul(seed, 1664525) + 1013904223 | 0;
                return (seed >>> 0) / 4294967296;
            }
            box.dataset[marker] = decorate(box, random) || "true";
        });
    }

    // An SVG document as a CSS url() value.
    function svgUrl(svg) {
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    }

    window.siteRuntime.eachBox = eachBox;
    window.siteRuntime.svgUrl = svgUrl;
})();