(function () {
    "use strict";

    // The footer quote is chosen when the site is built; switch to today's quote if the build is older
    const quote = document.querySelector(".quote[data-day]");
    const today = Math.floor(Date.now() / 86400000);
    if (quote && Number(quote.getAttribute("data-day")) !== today) {
        fetch(quote.getAttribute("data-src"))
            .then(response => response.json())
            .then(
                function (quotes) {
                    const q = quotes[today % quotes.length];
                    quote.querySelector("blockquote").textContent = q.text;
                    const author = quote.querySelector(".quote-author");
                    author.textContent = q.author + (q.role ? ", " + q.role : "");
                },
                function () {}
            );
    }
})();