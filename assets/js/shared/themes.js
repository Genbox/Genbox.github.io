(function () {
    "use strict";

    const features = window.siteFeatures;
    const themes = Object.keys(features).filter(function (name) {
        return features[name].kind === "theme";
    });
    // The theme boot script (in the page's head) has already put the theme on the page.
    const start = window.siteThemeStart;
    const handlers = {};
    let choice = start.choice;
    let active = start.theme;
    const root = document.documentElement;
    const themeColor = document.querySelector('meta[name="theme-color"]');

    function apply(name) {
        if (name === active) {
            return;
        }
        if (handlers[active]) {
            handlers[active](false);
        }
        root.classList.remove("theme-" + active);
        active = name;
        if (themeColor) {
            themeColor.content = name !== "default" && features[name].color || start.defaultColor;
        }
        if (name !== "default") {
            // The theme's styles and scripts load now; its script registers its handler.
            root.classList.add("theme-" + name);
            window.siteRuntime.loadFeature(name).catch(function () {});
        }
        if (handlers[name]) {
            handlers[name](true);
        }
        document.dispatchEvent(new Event("themechange"));
    }

    // The theme to show now: the visitor's choice, or the season's.
    function chosen() {
        if (choice === "normal") {
            return "default";
        }
        return choice || start.seasonalTheme();
    }

    // "reset" clears the choice so the seasonal themes come back; "normal" forces the plain theme.
    function setTheme(name) {
        choice = name === "reset" ? null : name;
        try {
            if (choice) {
                sessionStorage.setItem("site-theme", choice);
            } else {
                sessionStorage.removeItem("site-theme");
            }
        } catch (_) {}
        apply(chosen());
    }

    window.siteThemes = {
        current() {
            return active;
        },
        setTheme,
        register(name, handler) {
            handlers[name] = handler;
            if (active === name) {
                handler(true);
            }
        }
    };
    const shortcuts = {
        reset() {
            setTheme("reset");
        }
    };
    themes.forEach(function (name) {
        shortcuts[name] = function () {
            setTheme(active === name ? "reset" : name);
        };
    });
    window.siteRuntime.registerShortcuts(shortcuts);
    if (active !== "default") {
        window.siteRuntime.loadFeature(active).catch(function () {});
    }
    setInterval(function () {
        apply(chosen());
    }, 60000);
})();