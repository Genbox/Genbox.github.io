(function () {
    "use strict";

    const results = document.getElementById("friends-results");
    if (!results) {
        return;
    }

    const rows = Array.from(results.querySelectorAll(".friend-row"));
    const sort = document.getElementById("friends-sort");
    const group = document.getElementById("friends-group");
    const note = document.getElementById("friends-group-note");
    const status = document.getElementById("friends-status");
    const compare = new Intl.Collator("en", { sensitivity: "base", numeric: true });
    const entries = rows.map(row => ({
        row,
        name: row.dataset.name,
        website: new URL(row.querySelector("a").href).hostname.replace(/^www\./, ""),
        subjects: Array.from(row.querySelectorAll(".pill"), pill => pill.textContent.trim())
    }));

    function list(items) {
        const ul = document.createElement("ul");
        ul.className = "friends-list";
        items.forEach(entry => ul.appendChild(entry.row.cloneNode(true)));
        return ul;
    }

    function render() {
        const sorted = entries.slice().sort((a, b) => {
            if (sort.value === "website") {
                return compare.compare(a.website, b.website) || compare.compare(a.name, b.name);
            }
            return compare.compare(a.name, b.name) * (sort.value === "reverse" ? -1 : 1);
        });
        const fragment = document.createDocumentFragment();
        const grouped = group.value === "subject";
        let groupCount = 0;

        if (grouped) {
            const subjects = new Map();
            sorted.forEach(entry => {
                const tags = entry.subjects.length ? entry.subjects : ["Other"];
                tags.forEach(subject => {
                    if (!subjects.has(subject)) {
                        subjects.set(subject, []);
                    }
                    subjects.get(subject).push(entry);
                });
            });
            Array.from(subjects.keys())
                .sort(compare.compare)
                .forEach((subject, index) => {
                    const section = document.createElement("section");
                    section.className = "friends-subject";
                    const heading = document.createElement("h3");
                    heading.id = "friends-subject-" + index;
                    heading.textContent = subject + " (" + subjects.get(subject).length + ")";
                    section.setAttribute("aria-labelledby", heading.id);
                    section.append(heading, list(subjects.get(subject)));
                    fragment.appendChild(section);
                });
            groupCount = subjects.size;
        } else {
            fragment.appendChild(list(sorted));
        }

        results.replaceChildren(fragment);
        note.hidden = !grouped;
        status.textContent = entries.length + " blogs, " + (grouped ? "grouped into " + groupCount + " subjects, " : "") + "sorted by " + sort.selectedOptions[0].textContent + ".";
    }

    sort.addEventListener("change", render);
    group.addEventListener("change", render);
    document.getElementById("friends-controls").hidden = false;
    render();
})();