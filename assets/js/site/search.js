(function () {
    "use strict";

    // Search: shared index loading, matching and highlighting
    const searchLink = document.querySelector(".site-nav [data-index]");
    let indexPromise = null;

    function loadIndex() {
        if (!indexPromise) {
            indexPromise = fetch(searchLink.getAttribute("data-index"))
                .then(response => response.json())
                .then(function (data) {
                    // Compact rows omit repeated field names; all article text is retained.
                    return data.map(function (row) {
                        const [title, url, date, tags, description, text] = row;
                        const post = { title, url, date, tags, description, text };
                        post._title = post.title.toLowerCase();
                        post._description = post.description.toLowerCase();
                        post._text = post.text.toLowerCase();
                        post._url = post.url.toLowerCase();
                        return post;
                    });
                });
            indexPromise.catch(function () {
                indexPromise = null;
            });
        }
        return indexPromise;
    }

    function debounce(callback, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(callback, delay);
        };
    }

    function termsOf(query) {
        return query.toLowerCase().split(/\s+/).filter(Boolean);
    }

    function termPattern(terms) {
        return new RegExp(
            "(" +
                terms
                    .map(function (t) {
                        return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    })
                    .join("|") +
                ")",
            "gi"
        );
    }

    // Terms are matched on the raw text so a search for "amp" or "&" never splits an entity like &amp;.
    // Splitting on the capturing pattern puts the matches at the odd indices.
    function highlight(text, terms) {
        const escapeHtml = window.siteRuntime.escapeHtml;
        return text
            .split(termPattern(terms))
            .map((part, i) => i % 2 ? "<mark>" + escapeHtml(part) + "</mark>" : escapeHtml(part))
            .join("");
    }

    function rankedPosts(matches) {
        return matches.sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1)).map(match => match.post);
    }

    function findMatches(index, terms) {
        const matches = [];
        index.forEach(function (post) {
            const title = post._title;
            const description = post._description;
            const text = post._text;
            let score = 0;
            for (let i = 0; i < terms.length; i++) {
                const t = terms[i];
                const inTitle = title.indexOf(t) >= 0;
                const inDescription = description.indexOf(t) >= 0;
                const inText = text.indexOf(t) >= 0;
                if (!inTitle && !inDescription && !inText) {
                    return;
                }
                score += (inTitle ? 10 : 0) + (inDescription ? 4 : 0) + (inText ? Math.min(text.split(t).length - 1, 10) / 5 : 0);
            }
            matches.push({ post, score });
        });
        return rankedPosts(matches);
    }

    function snippet(post, terms) {
        const re = termPattern(terms);
        if (post.description && re.test(post.description)) {
            return post.description;
        }
        re.lastIndex = 0;
        const hit = post.text.search(re);
        if (hit < 0) {
            return post.description || post.text.slice(0, 200);
        }
        const start = Math.max(0, post.text.lastIndexOf(" ", Math.max(0, hit - 80)));
        const end = post.text.indexOf(" ", Math.min(post.text.length, hit + 160));
        return (start > 0 ? "…" : "") + post.text.slice(start, end < 0 ? undefined : end).trim() + (end > 0 ? "…" : "");
    }

    function resultHtml(post, terms, withSnippet) {
        const excerpt = withSnippet ? `<span class="result-text">${highlight(snippet(post, terms), terms)}</span>` : "";
        const tags = post.tags.length ? " · " + window.siteRuntime.escapeHtml(post.tags.join(" / ")) : "";
        return `<li><a class="result" href="${window.siteRuntime.escapeHtml(post.url)}"><span class="result-title">${highlight(post.title, terms)}</span>${excerpt}<span class="mono">${post.date}${tags}</span></a></li>`;
    }

    // Search page
    const results = document.getElementById("search-results");
    if (results) {
        const input = document.getElementById("q");
        const status = results.querySelector(".results-status");
        const list = results.querySelector("ol");
        const more = results.querySelector("button");
        let index = null;
        let matches = [];
        let shown = 0;
        let terms = [];
        const initial = new URLSearchParams(location.search).get("q") || "";

        const render = function (focusNew) {
            const firstNew = shown;
            list.insertAdjacentHTML(
                "beforeend",
                matches
                    .slice(shown, shown + 10)
                    .map(function (post) {
                        return resultHtml(post, terms, true);
                    })
                    .join("")
            );
            shown = Math.min(matches.length, shown + 10);
            more.hidden = shown >= matches.length;
            if (focusNew && list.children[firstNew]) {
                list.children[firstNew].querySelector("a").focus();
            }
        };

        const search = function () {
            const query = input.value.trim();
            terms = termsOf(query);
            history.replaceState(null, "", query ? "?q=" + encodeURIComponent(query) : location.pathname);
            list.innerHTML = "";
            shown = 0;
            matches = [];
            more.hidden = true;
            if (!terms.length) {
                status.textContent = "Search titles, descriptions and article text.";
                return;
            }
            if (!index) {
                status.textContent = "Loading articles…";
                return;
            }
            matches = findMatches(index, terms);
            status.textContent = matches.length + (matches.length === 1 ? " result" : " results") + " for “" + query + "”";
            render();
        };

        input.value = initial;
        input.addEventListener("input", debounce(search, 120));
        input.form.addEventListener("submit", function (event) {
            event.preventDefault();
            search();
        });
        more.addEventListener("click", function () {
            render(true);
        });
        if (!initial) {
            input.focus();
        }

        loadIndex().then(
            function (data) {
                index = data;
                search();
            },
            function () {
                status.textContent = "Search could not load. Try again later.";
            }
        );
    }

    // Search overlay on every other page: the header button, "/" or Ctrl+K
    let overlay = null;

    function openOverlay() {
        if (!overlay) {
            const page = window.siteRuntime.escapeHtml(searchLink.getAttribute("href"));
            overlay = document.createElement("dialog");
            overlay.className = "search-dialog";
            overlay.setAttribute("aria-label", "Search articles");
            overlay.innerHTML = `
                <form action="${page}" method="get" role="search">
                    <div class="search-field"><svg aria-hidden="true" fill="none" height="18" stroke="#8F97A2" stroke-linecap="round" stroke-width="2" viewBox="0 0 24 24" width="18"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                    <input aria-label="Search articles" autocomplete="off" name="q" placeholder="Search articles" type="search"><kbd>Esc</kbd></div>
                </form>
                <p class="mono search-dialog-status" role="status" aria-live="polite"></p><ol class="search-dialog-results"></ol>
                <p class="mono search-dialog-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>Enter</kbd> to open</span><a href="${page}">All results →</a></p>`;

            document.body.appendChild(overlay);

            const field = overlay.querySelector("input");
            const status = overlay.querySelector(".search-dialog-status");
            const list = overlay.querySelector("ol");
            const all = overlay.querySelector(".search-dialog-foot a");
            const run = function () {
                const query = field.value.trim();
                const terms = termsOf(query);
                all.href = searchLink.getAttribute("href") + (query ? "?q=" + encodeURIComponent(query) : "");
                list.innerHTML = "";
                if (!terms.length) {
                    status.textContent = "Type to search titles, descriptions and article text.";
                    return;
                }
                status.textContent = "Loading articles…";
                loadIndex().then(
                    function (index) {
                        if (field.value.trim() !== query) {
                            return;
                        }
                        const matches = findMatches(index, terms);
                        status.textContent = matches.length ? matches.length + (matches.length === 1 ? " result" : " results") : "No articles match “" + query + "”.";
                        list.innerHTML = matches
                            .slice(0, 8)
                            .map(function (post) {
                                return resultHtml(post, terms, false);
                            })
                            .join("");
                    },
                    function () {
                        status.textContent = "Search could not load. Try again later.";
                    }
                );
            };

            field.addEventListener("input", debounce(run, 100));
            overlay.addEventListener("keydown", function (event) {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
                    return;
                }
                const items = Array.from(list.querySelectorAll("a"));
                if (!items.length) {
                    return;
                }
                event.preventDefault();
                const at = items.indexOf(document.activeElement);
                if (event.key === "ArrowDown") {
                    (items[at + 1] || items[0]).focus();
                } else if (at <= 0) {
                    field.focus();
                } else {
                    items[at - 1].focus();
                }
            });
            overlay.querySelector("form").addEventListener("submit", function (event) {
                const first = list.querySelector("a");
                if (first) {
                    event.preventDefault();
                    location.href = first.href;
                }
            });
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    overlay.close();
                }
            });
            run();
        }
        overlay.showModal();
        overlay.querySelector("input").select();
        loadIndex().catch(function () {});
    }

    if (searchLink && typeof HTMLDialogElement === "function") {
        searchLink.addEventListener("click", function (event) {
            if (results || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
                return;
            }
            event.preventDefault();
            openOverlay();
        });
        document.addEventListener("keydown", function (event) {
            const shortcut = (event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey);
            if (!shortcut && (event.key !== "/" || window.siteRuntime.isTyping() || event.ctrlKey || event.metaKey || event.altKey)) {
                return;
            }
            if (overlay && overlay.open) {
                return;
            }
            event.preventDefault();
            if (results) {
                document.getElementById("q").focus();
            } else {
                openOverlay();
            }
        });
    }

    // Suggest articles whose title or text match the words in the missing address
    const suggestions = document.querySelector(".suggestions");
    if (suggestions && searchLink) {
        const ignored = ["html", "htm", "php", "aspx", "www", "the", "and", "for", "with", "from", "part", "page", "post", "blog"];
        const words = decodeURIComponent(location.pathname)
            .toLowerCase()
            .split(/[^a-z0-9#+.]+|\.(?=html?$)/)
            .filter(function (w) {
                return w.length > 2 && !/^\d+$/.test(w) && ignored.indexOf(w) < 0;
            });
        if (words.length) {
            loadIndex().then(
                function (index) {
                    const scored = index
                        .map(function (post) {
                            const title = post._title;
                            const url = post._url;
                            let score = 0;
                            words.forEach(function (w) {
                                if (url.indexOf(w) >= 0) {
                                    score += 4;
                                }
                                if (title.indexOf(w) >= 0) {
                                    score += 3;
                                } else if (post._description.indexOf(w) >= 0) {
                                    score += 1;
                                } else if (post._text.indexOf(w) >= 0) {
                                    score += 0.25;
                                }
                            });
                            return { post, score };
                        })
                        .filter(function (m) {
                            return m.score >= 3;
                        });
                    if (!scored.length) {
                        return;
                    }
                    suggestions.querySelector("ol").innerHTML = rankedPosts(scored)
                        .slice(0, 5)
                        .map(function (m) {
                            return resultHtml(m, words, false);
                        })
                        .join("");
                    suggestions.hidden = false;
                },
                function () {}
            );
        }
    }
})();