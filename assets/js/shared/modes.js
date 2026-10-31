(function () {
    "use strict";

    // Heroes and games share one active slot; characters and themes are independent.
    const features = window.siteFeatures;
    const names = Object.keys(features);
    // Heroes live in the front page's hero area, so they only exist there; games work on every page.
    const hasHero = !!document.querySelector(".hero");
    const modes = names.filter(function (name) {
        return features[name].kind === "game" || hasHero && features[name].kind === "hero";
    });
    const characters = names.filter(function (name) {
        return features[name].kind === "character";
    });
    let mode = null;
    // The mode whose scripts are loading; a later choice (or Escape) makes it stale.
    let pending = null;

    function setMode(next) {
        mode = next;
        modes.forEach(function (name) {
            document.documentElement.classList.toggle(name + "-active", mode === name);
        });
        document.dispatchEvent(new Event("modechange"));
    }

    // Turning a mode on loads its scripts first; asking for the active mode again turns it off.
    function toggleMode(requested) {
        if (requested && modes.indexOf(requested) < 0) {
            return;
        }
        if (!requested || requested === mode) {
            pending = null;
            setMode(null);
            return;
        }
        pending = requested;
        window.siteRuntime
            .loadFeature(requested)
            .then(function () {
                if (pending === requested) {
                    pending = null;
                    setMode(requested);
                }
            })
            .catch(function () {
                if (pending === requested) {
                    pending = null;
                }
            });
    }

    window.siteModes = {
        current() {
            return mode;
        },
        // For modes with their own controls, such as a close button.
        toggle: toggleMode
    };

    // Escape turns off whichever mode is on, unless it is closing something else first (the search or an
    // image in the lightbox) or the reader is typing.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" || !(mode || pending) || event.defaultPrevented) {
            return;
        }
        if (window.siteRuntime.isTyping() || document.querySelector("dialog[open]")) {
            return;
        }
        toggleMode(mode);
    });

    const shortcuts = {
        normal() {
            window.siteThemes.setTheme("normal");
            toggleMode(null);
        }
    };
    modes.forEach(function (name) {
        shortcuts[features[name].word || name] = function () {
            toggleMode(name);
        };
    });
    // Characters run alongside everything else, on every page; each loads on first use.
    characters.forEach(function (word) {
        shortcuts[word] = function () {
            window.siteRuntime
                .loadFeature(word)
                .then(function () {
                    window.siteRuntime.characters[word]();
                })
                .catch(function () {});
        };
    });
    window.siteRuntime.registerShortcuts(shortcuts);
})();