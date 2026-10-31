(function () {
    "use strict";
    // A full-page crash screen when the mode starts; any key or click (or a few seconds) dismisses it.
    let screen = null;
    let timer = 0;
    function dismiss() {
        if (!screen) {
            return;
        }
        const leaving = screen;
        screen = null;
        clearTimeout(timer);
        document.removeEventListener("keydown", dismiss, true);
        document.removeEventListener("pointerdown", dismiss, true);
        leaving.classList.add("bsod-leaving");
        setTimeout(function () {
            leaving.remove();
        }, 300);
    }
    function crash() {
        dismiss();
        screen = document.createElement("div");
        screen.className = "bsod-screen";
        screen.setAttribute("role", "alert");
        screen.innerHTML =
            '<div class="bsod-body"><p class="bsod-title"><span>BLOG</span></p>' +
            "<p>A fatal exception 0E has occurred at 0028:C0FFEE42 in VXD BLOG(01) + 0000BEEF. " +
            "The current article will be terminated.</p>" +
            "<p>*  Press any key to continue reading.<br>" +
            "*  Press CTRL+ALT+DEL to restart your computer. You will lose any unsaved thoughts.</p>" +
            '<p class="bsod-prompt">Press any key to continue <span class="bsod-cursor">_</span></p></div>';
        document.body.appendChild(screen);
        // Wait for the key that typed the shortcut to finish before listening for the next one.
        setTimeout(function () {
            if (!screen) {
                return;
            }
            document.addEventListener("keydown", dismiss, true);
            document.addEventListener("pointerdown", dismiss, true);
        }, 0);
        timer = setTimeout(dismiss, 9000);
    }
    window.siteRuntime.bsodScreen = { show: crash, dismiss };
})();