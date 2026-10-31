(function () {
    "use strict";

    // Copy buttons on code blocks
    const copyIcon =
        '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>';

    document.querySelectorAll(".code").forEach(function (block) {
        const bar = block.querySelector(".code-bar");
        const code = block.querySelector("pre");
        if (!bar || !code) {
            return;
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "copy";
        button.setAttribute("aria-label", "Copy code");
        button.innerHTML = copyIcon + '<span aria-live="polite">Copy</span>';
        const label = button.lastChild;
        let timer;
        function feedback(copied) {
            button.toggleAttribute("data-copied", copied);
            label.textContent = copied ? "Copied" : "Copy failed";
            clearTimeout(timer);
            timer = setTimeout(function () {
                button.removeAttribute("data-copied");
                label.textContent = "Copy";
            }, 1800);
        }
        button.addEventListener("click", function () {
            navigator.clipboard.writeText(code.innerText.replace(/\n$/, "")).then(
                () => feedback(true),
                () => feedback(false)
            );
        });
        bar.appendChild(button);
    });
})();