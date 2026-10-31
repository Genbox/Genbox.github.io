(function () {
    "use strict";
    // Puts the visitor's theme on the page before it first renders, so a chosen or seasonal theme never flashes the
    // default colours: it sets the theme's class and browser bar colour, and writes the theme's stylesheet into the
    // page, where (unlike one added later) the page waits for it before rendering. themes.js takes over from here.
    const themes = "__THEME_ASSETS__";
    const root = document.documentElement;
    const themeColor = document.querySelector('meta[name="theme-color"]');

    // Christmas from the 23rd to the 25th of December, and New Year from the 30th of December to the 2nd of January.
    function seasonalTheme() {
        const date = new Date();
        const month = date.getMonth();
        const day = date.getDate();
        if (month === 11 && day >= 30 || month === 0 && day <= 2) {
            return "newyear";
        }
        if (month === 11 && day >= 23 && day <= 25) {
            return "christmas";
        }
        return "default";
    }

    // The visitor's choice for this visit: a theme name, "normal" to force the plain theme, or null to follow the
    // season.
    let choice = null;
    try {
        const saved = sessionStorage.getItem("site-theme");
        if (saved === "normal" || Object.prototype.hasOwnProperty.call(themes, saved)) {
            choice = saved;
        }
    } catch (_) {}

    const theme = choice === "normal" ? "default" : choice || seasonalTheme();
    window.siteThemeStart = {
        themes,
        choice,
        theme,
        defaultColor: themeColor && themeColor.content,
        seasonalTheme
    };
    if (theme === "default") {
        return;
    }
    root.classList.add("theme-" + theme);
    if (themeColor && themes[theme].color) {
        themeColor.content = themes[theme].color;
    }
    document.write('<link href="' + themes[theme].style + '" rel="stylesheet">');
})();