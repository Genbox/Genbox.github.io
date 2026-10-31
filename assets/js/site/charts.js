(function () {
    "use strict";

    // Function charts: a crosshair and the exact values under the pointer
    document.querySelectorAll(".chart-plots[data-plot]").forEach(function (plots) {
        const data = JSON.parse(plots.getAttribute("data-plot"));
        const area = plots.querySelector(".chart-area");
        const tip = plots.querySelector(".chart-hover");
        const fmt = function (v) {
            return (v < 0 ? "−" : "") + Math.abs(v).toFixed(5);
        };
        plots.addEventListener("pointermove", function (event) {
            const box = area.getBoundingClientRect();
            const t = (event.clientX - box.left) / box.width;
            if (t < 0 || t > 1) {
                return;
            }
            const i = Math.round(t * (data.x.length - 1));
            const rows = ["<b>x</b> " + fmt(data.x[i]) + " (" + (data.x[i] / Math.PI).toFixed(3) + "π)"];
            data.series.forEach(function (s) {
                rows.push("<b>" + window.siteRuntime.escapeHtml(s.name) + "</b> " + fmt(s.y[i]));
            });
            if (data.error) {
                rows.push("<b>error</b> " + (data.error[i] >= 0 ? "+" : "") + fmt(data.error[i]));
            }
            tip.innerHTML = rows.join("<br>");
            tip.hidden = false;
            plots.setAttribute("data-x", "");
            plots.style.setProperty("--x", (t * 100).toFixed(2) + "%");
            const left = event.clientX - box.left + 14;
            tip.style.left = (left + tip.offsetWidth > box.width ? left - tip.offsetWidth - 28 : left) + "px";
        });
        plots.addEventListener("pointerleave", function () {
            tip.hidden = true;
            plots.removeAttribute("data-x");
        });
    });
})();