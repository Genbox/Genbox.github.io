(function () {
    "use strict";

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const shortcuts = [];

    function isTyping() {
        const element = document.activeElement;
        return element && (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) || element.isContentEditable);
    }

    // Each registration keeps its own buffer, so independent easter eggs coexist.
    function registerShortcuts(actions) {
        const words = Object.keys(actions);
        shortcuts.push({
            actions,
            words,
            length: Math.max(...words.map(word => word.length)),
            sequence: "",
            lastKey: 0
        });
    }

    document.addEventListener("keydown", function (event) {
        const blocked = isTyping() || event.ctrlKey || event.metaKey || event.altKey || event.isComposing;
        const now = Date.now();
        shortcuts.forEach(function (shortcut) {
            if (blocked) {
                shortcut.sequence = "";
                return;
            }
            if (event.repeat || event.key === "Shift") {
                return;
            }
            if (event.key.length !== 1) {
                shortcut.sequence = "";
                return;
            }
            if (now - shortcut.lastKey > 2000) {
                shortcut.sequence = "";
            }
            shortcut.lastKey = now;
            shortcut.sequence = (shortcut.sequence + event.key.toLowerCase()).slice(-shortcut.length);
            const word = shortcut.words.find(function (word) {
                return shortcut.sequence.endsWith(word);
            });
            if (!word) {
                return;
            }
            shortcut.sequence = "";
            shortcut.actions[word]();
        });
    });

    // Feature files (listed in siteFeatures) load on first use, versioned by siteAsset. Each file loads once; the
    // stylesheet of a theme shown as the page loaded is in the page already.
    const loading = new Map();

    function loadFile(path) {
        const url = window.siteAsset(path);
        const present = Array.from(document.styleSheets).some(sheet => sheet.href === url);
        if (present) {
            return Promise.resolve();
        }
        if (!loading.has(url)) {
            loading.set(
                url,
                new Promise(function (resolve, reject) {
                    let element;
                    if (new URL(url).pathname.endsWith(".css")) {
                        element = document.createElement("link");
                        element.rel = "stylesheet";
                        element.href = url;
                    } else {
                        element = document.createElement("script");
                        // Fetch immediately, but execute classic scripts in insertion order.
                        element.async = false;
                        element.src = url;
                    }
                    element.onload = resolve;
                    element.onerror = function () {
                        loading.delete(url);
                        element.remove();
                        reject(new Error("Could not load " + url));
                    };
                    document.head.appendChild(element);
                })
            );
        }
        return loading.get(url);
    }

    // Downloads scripts concurrently. async=false preserves dependency order during execution.
    function loadFeature(name) {
        const feature = window.siteFeatures[name];
        return Promise.all(feature.styles.map(loadFile))
            .then(() => Promise.all(feature.scripts.map(loadFile)))
            .catch(function (error) {
                // Callers carry on quietly without the feature, so say why it did not appear.
                console.warn("The " + name + " easter egg could not load: " + error.message);
                throw error;
            });
    }

    // Images marked with data-src (and picture sources with data-srcset) load when their feature first shows them.
    function loadImages(element) {
        for (const attribute of ["srcset", "src"]) {
            element.querySelectorAll(`[data-${attribute}]`).forEach(image => {
                if (!image.getAttribute(attribute)) image[attribute] = image.dataset[attribute];
            });
        }
    }

    function escapeHtml(text) {
        return text.replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
        });
    }

    window.siteRuntime = {
        // Each feature's soundtrack or sound effects, by the feature's name, once loaded.
        sounds: {},
        // Characters expose their toggles here once loaded.
        characters: {},
        loadFeature,
        loadImages,
        escapeHtml,
        isTyping,
        registerShortcuts,
        reducedMotion,
        noteFrequency(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }
    };
})();