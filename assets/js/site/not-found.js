(function () {
    "use strict";

    // Shuffle the 404 characters, showing each once before starting a new cycle.
    const art = document.querySelector(".not-found-art");
    if (art) {
        let order;
        try {
            order = JSON.parse(localStorage.getItem("404-art-order-32") || "[]");
        } catch (_) {
            order = [];
        }
        if (!order.length) {
            order = [
                "face",
                "robot",
                "ghost",
                "floppy",
                "document",
                "alien",
                "star",
                "mouse",
                "jellyfish",
                "monitor",
                "potion",
                "cat",
                "ice",
                "cactus",
                "mushroom",
                "coffee",
                "fox",
                "cloud",
                "strawberry",
                "wizard",
                "frog",
                "crab",
                "rocket",
                "bat",
                "heart",
                "chest",
                "turtle",
                "whale",
                "bee",
                "apple",
                "satellite",
                "popcorn"
            ];
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const swap = order[i];
                order[i] = order[j];
                order[j] = swap;
            }
        }
        art.src = window.siteAsset("../images/404/" + order.pop() + ".webp");
        art.hidden = false;
        try {
            localStorage.setItem("404-art-order-32", JSON.stringify(order));
        } catch (_) {}
    }

    // Show the missing address on the 404 page
    const missing = document.getElementById("missing-path");
    if (missing) {
        missing.textContent = location.host + location.pathname;
    }
})();