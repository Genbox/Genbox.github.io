(function () {
    "use strict";

    // Every easter egg on the site, by the word that toggles it (or by its name, when word sets a different one):
    //   hero: takes over the front page's hero area. game: opens over any page. The two share one slot, so only
    //     one runs at a time.
    //   character: runs alongside everything else, on every page.
    //   theme: restyles the page; color is the browser bar's colour while it shows.
    // A feature's files load on first use, from paths relative to assets/js/: its styles alongside its scripts,
    // which load in order so the shared files and the soundtrack are ready before the visuals that use them.
    // visualizer: the colours of the header's music visualizer while the feature plays: { bar, peak }, and split to
    //   colour the low half of the display with the peak colour and the high half with the bar colour.
    // The small inline theme bootstrap runs first; this full registry is deferred.

    // The build fills in content hashes for assets loaded on demand.
    const versions = "__ASSET_VERSIONS__";
    const ownUrl = new URL(document.currentScript.src);
    const base = new URL("../", ownUrl);
    window.siteAsset = function (path) {
        const url = new URL(path, base);
        if (versions[url.pathname]) {
            url.searchParams.set("v", versions[url.pathname]);
        }
        return url.href;
    };

    const chiptune = ["shared/chiptune.js", "shared/visualizer.js"];
    const animation = ["shared/animation.js"];
    const sprite = [...animation, "shared/sprite.js"];
    const sfx = ["shared/sfx.js"];
    const boxes = ["shared/boxes.js"];

    // Every hero has a soundtrack and a visual in its folder. options: scripts to load before them, styled when
    // the folder has a style.css, the visualizer's colours, and word when typing the name itself would not work.
    function hero(name, options) {
        const folder = "heroes/" + name + "/";
        return {
            kind: "hero",
            word: options.word,
            scripts: [...chiptune, ...sprite, ...(options.scripts || []), folder + "audio.js", folder + "visual.js"],
            styles: options.styled ? [folder + "style.css"] : [],
            visualizer: options.visualizer
        };
    }

    // Theme colours and fingerprinted styles come from the inline bootstrap's shared theme data.
    function theme(name, options) {
        return {
            kind: "theme",
            color: window.siteThemeStart.themes[name].color || null,
            scripts: options.scripts || [],
            styles: [window.siteThemeStart.themes[name].style, ...(options.styles || [])]
        };
    }

    window.siteFeatures = {
        doom: hero("doom", { scripts: sfx, styled: true, visualizer: { bar: "#ff713f", peak: "#ffe082" } }),
        tron: hero("tron", { styled: true, visualizer: { bar: "#50d9ff", peak: "#c78aff" } }),
        joshua: hero("joshua", { visualizer: { bar: "#91f4c1", peak: "#fff1a1" } }),
        spock: hero("spock", { styled: true, visualizer: { bar: "#0078f0", peak: "#f0c060" } }),
        terminator: hero("terminator", { styled: true, visualizer: { bar: "#ff6a58", peak: "#e6edf5" } }),
        pingu: hero("pingu", { visualizer: { bar: "#a8d3ee", peak: "#f2792b" } }),
        matrix: hero("matrix", { styled: true, visualizer: { bar: "#7dffa8", peak: "#d9ffe2" } }),
        // A shortcut fires as soon as the typed letters end with its word, so "hal" would fire partway through
        // "halflife".
        hal: hero("hal", { word: "hal9000", styled: true, visualizer: { bar: "#ff5050", peak: "#ffbf72" } }),
        c64: hero("c64", { visualizer: { bar: "#a59cf2", peak: "#94e089" } }),
        portal: hero("portal", { visualizer: { bar: "#25aaff", peak: "#ff8a20", split: true } }),
        hyperspace: hero("hyperspace", { visualizer: { bar: "#8fc8ff", peak: "#ff9b4a" } }),
        bsod: hero("bsod", { scripts: ["shared/bsod.js"], styled: true, visualizer: { bar: "#0000aa", peak: "#ffffff" } }),
        clippy: hero("clippy", { visualizer: { bar: "#8f99a4", peak: "#fff6b8" } }),
        nyan: hero("nyan", { visualizer: { bar: "#ff9ad5", peak: "#0099ff" } }),
        eggdog: hero("eggdog", { visualizer: { bar: "#f6f3ec", peak: "#f28a9b" } }),
        dontpanic: hero("dontpanic", { visualizer: { bar: "#f2b84b", peak: "#a4e94c" } }),
        sudo: hero("sudo", { visualizer: { bar: "#f0c98a", peak: "#ff8a74" } }),
        kaiju: hero("kaiju", { styled: true, visualizer: { bar: "#23b7ff", peak: "#c7f5ff" } }),
        warcraft: hero("warcraft", { visualizer: { bar: "#6f9a3c", peak: "#f2c53d" } }),
        wow: hero("wow", { visualizer: { bar: "#2f5fb3", peak: "#e0b74a" } }),
        fullthrottle: hero("fullthrottle", { visualizer: { bar: "#f28c38", peak: "#ffd27a" } }),
        rayman: hero("rayman", { visualizer: { bar: "#8a5cf6", peak: "#ffe14d" } }),
        diablo: hero("diablo", { visualizer: { bar: "#c41e1e", peak: "#ff8a2a" } }),
        quake: hero("quake", { visualizer: { bar: "#c8441a", peak: "#ffb347" } }),
        halflife: hero("halflife", { visualizer: { bar: "#e3c22a", peak: "#b8ff6a" } }),
        gta: hero("gta", { visualizer: { bar: "#d32f2f", peak: "#3b82ff" } }),
        minecraft: hero("minecraft", { visualizer: { bar: "#5cab3c", peak: "#a9d6f5" } }),
        skyrim: hero("skyrim", { visualizer: { bar: "#8aa0b8", peak: "#5cf2a6" } }),
        witcher: hero("witcher", { visualizer: { bar: "#ffb347", peak: "#7cff5a" } }),
        cyberpunk: hero("cyberpunk", { visualizer: { bar: "#2de2e6", peak: "#fcee0a" } }),
        bugbash: {
            kind: "game",
            scripts: [...chiptune, ...sprite, ...sfx, "games/bugbash/audio.js", "games/bugbash/rules.js", "games/bugbash/draw.js", "games/bugbash/game.js"],
            styles: ["games/bugbash/style.css"],
            visualizer: { bar: "#ff6b5e", peak: "#6ee7b7" }
        },
        doggy: {
            kind: "character",
            scripts: [...animation, "characters/doggy/audio.js", "characters/doggy/visual.js"],
            styles: ["characters/doggy/style.css"]
        },
        christmas: theme("christmas", { scripts: [...animation, ...boxes, "themes/christmas/visual.js"] }),
        newyear: theme("newyear", { scripts: [...boxes, "themes/newyear/visual.js"] }),
        kawaii: theme("kawaii", { scripts: [...animation, "themes/kawaii/visual.js"] }),
        winxp: theme("winxp", {
            scripts: [...sprite, ...sfx, "themes/windows/desktop.js"]
        }),
        win95: theme("win95", {
            scripts: [...sprite, ...sfx, "shared/bsod.js", "themes/windows/desktop.js"],
            styles: ["heroes/bsod/style.css"]
        }),
        // The palette from https://purplesyringa.moe/; it needs no script.
        purple: theme("purple", {}),
        broken: theme("broken", { scripts: [...animation, "themes/broken/visual.js"] })
    };
})();