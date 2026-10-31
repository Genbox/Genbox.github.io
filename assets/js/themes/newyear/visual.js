(function () {
    "use strict";
    // 5×7 pixel digits, drawn with the gold rocket's colours: a light-to-orange ramp over a dark drop shadow.
    const digits = {
        0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
        1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
        2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
        3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
        4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
        5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
        6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
        7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
        8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
        9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"]
    };
    const ramp = ["#fff3c4", "#ffe08a", "#ffd75e", "#ffd75e", "#f0b13a", "#f0b13a", "#e0862e"];
    const shadow = "#8a5a1c";

    function pixelYear(text) {
        const width = text.length * 6;
        const rows = ramp.map(function () {
            return "";
        });
        let shade = "";
        text.split("").forEach(function (digit, index) {
            digits[digit].forEach(function (row, y) {
                for (let x = 0; x < 5; x++) {
                    if (row[x] !== "1") {
                        continue;
                    }
                    const cell = "M" + (index * 6 + x) + " " + y + "h1v1h-1z";
                    rows[y] += cell;
                    shade += "M" + (index * 6 + x + 1) + " " + (y + 1) + "h1v1h-1z";
                }
            });
        });
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        width +
        ' 8" width="' +
        width * 5 +
        '" height="40" shape-rendering="crispEdges">' +
        '<path fill="' +
        shadow +
        '" d="' +
        shade +
        '"/>' +
        rows
            .map(function (d, y) {
                return '<path fill="' + ramp[y] + '" d="' + d + '"/>';
            })
            .join("") +
        "</svg>";
    }

    function isActive() {
        return window.siteThemes.current() === "newyear";
    }

    function decorateBoxes() {
        const palette = ["#ffd779", "#72d9ef", "#c7a1ef", "#fff1ba"];
        function image(markup, height) {
            return window.siteRuntime.svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="' + height + '" viewBox="0 0 400 ' + height + '">' + markup + "</svg>");
        }
        window.siteRuntime.eachBox("newyearDecorated", function (box, random) {
            let confetti = "";
            let stars = "";
            for (let n = 0; n < 17; n++) {
                const x = Math.round(8 + n * 23 + random() * 10);
                const y = Math.round(4 + random() * 6);
                const angle = Math.round(random() * 100 - 50);
                const color = palette[Math.floor(random() * palette.length)];
                confetti += '<rect x="' + x + '" y="' + y + '" width="3" height="5" fill="' + color + '" transform="rotate(' + angle + " " + x + " " + y + ')"/>';
            }
            for (let s = 0; s < 7; s++) {
                const sx = Math.round(12 + s * 55 + random() * 25);
                const sy = Math.round(7 + random() * 15);
                const r = 2 + Math.floor(random() * 3);
                stars +=
                    '<path fill="' +
                    palette[Math.floor(random() * palette.length)] +
                    '" d="M' +
                    sx +
                    " " +
                    (sy - r) +
                    "l1 " +
                    (r - 1) +
                    " " +
                    (r - 1) +
                    " 1-" +
                    (r - 1) +
                    " 1-1 " +
                    (r - 1) +
                    "-1-" +
                    (r - 1) +
                    "-" +
                    (r - 1) +
                    "-1 " +
                    (r - 1) +
                    '-1Z"/>';
            }
            box.style.setProperty("--newyear-confetti", image(confetti, 32));
            box.style.setProperty("--newyear-sparks", image(stars, 38));
            box.style.setProperty("--newyear-twinkle-duration", (2.8 + random() * 2).toFixed(2) + "s");
            box.style.setProperty("--newyear-twinkle-delay", (-random() * 5).toFixed(2) + "s");
        });
    }

    function update(enabled) {
        const active = typeof enabled === "boolean" ? enabled : isActive();
        if (active) {
            decorateBoxes();
        }
        const rockets = document.querySelector(".new-year");
        if (!rockets) {
            return;
        }
        const date = new Date();
        const number = rockets.querySelector(".new-year-number");
        const year = String(date.getFullYear() + (date.getMonth() >= 6 ? 1 : 0));
        rockets.hidden = !active || !!window.siteModes.current();
        if (!rockets.hidden) {
            window.siteRuntime.loadImages(rockets);
        }
        if (number.dataset.year !== year) {
            number.dataset.year = year;
            number.innerHTML = pixelYear(year);
        }
    }
    // While the theme shows, the year keeps up with the date, for a page left open across the turn of the year.
    let timer = 0;
    function toggle(enabled) {
        clearInterval(timer);
        timer = enabled ? setInterval(update, 60000) : 0;
        update(enabled);
    }
    document.addEventListener("modechange", update);
    window.siteThemes.register("newyear", toggle);
})();