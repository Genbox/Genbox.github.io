(function () {
    "use strict";

    // Click an image in an article to see it enlarged
    let lightbox;
    let lightboxTrigger;

    function openLightbox(src, alt, caption) {
        if (!lightbox) {
            lightbox = document.createElement("dialog");
            lightbox.className = "lightbox";
            lightbox.setAttribute("aria-label", "Enlarged image");
            lightbox.innerHTML = '<div class="lightbox-frame"><img alt=""></div><div class="lightbox-foot"><span></span><button class="button" type="button">Close</button></div>';
            lightbox.addEventListener("click", function (event) {
                if (event.target === lightbox || event.target.closest(".lightbox-frame, .button")) {
                    lightbox.close();
                }
            });
            lightbox.addEventListener("close", function () {
                if (lightboxTrigger) {
                    lightboxTrigger.focus();
                }
            });
            document.body.appendChild(lightbox);
        }
        const image = lightbox.querySelector("img");
        image.src = src;
        image.alt = alt;
        lightbox.querySelector(".lightbox-foot span").textContent = caption;
        lightbox.showModal();
        lightbox.querySelector(".button").focus();
    }

    if (typeof HTMLDialogElement === "function") {
        document.querySelectorAll(".prose a").forEach(function (link) {
            const image = link.querySelector("img");
            if (!image || link.children.length !== 1 || !/\.(png|jpe?g|gif|webp|svg)$/i.test(link.pathname)) {
                return;
            }
            link.setAttribute("aria-label", "Enlarge image" + (image.alt ? ": " + image.alt : ""));
            link.addEventListener("click", function (event) {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
                    return;
                }
                event.preventDefault();
                lightboxTrigger = link;
                const caption = image.title || image.alt;
                openLightbox(link.href, image.alt, /^image$/i.test(caption) ? "" : caption);
            });
        });
    }
})();