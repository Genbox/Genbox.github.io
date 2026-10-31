(function () {
    "use strict";
    // Type "win95" or "winxp" to turn the page into a retro desktop theme, like the "purple" palette: it stays on
    // for the rest of the visit, on every page, and works alongside the modes. Cards, panels and the article
    // turn into grey windows with title bars you can drag, minimise, maximise and close; a taskbar along the
    // bottom has a Start menu (joke entries and Shut Down), a clock and a speaker for the
    // interface sounds; icons line the left of wide screens. XP swaps the grey bevels for rounded blue title bars,
    // a green Start button and a sky-and-hills desktop. Nothing here is the real operating systems': the logo
    // is the site's, the desktop is drawn from gradients, and the sounds are original.
    const runtime = window.siteRuntime;
    const root = document.documentElement;
    const STORAGE = "win-theme";
    const WINDOWS = "main .card, main .panel, main .post-list, main .article, main .topic-section, main .about-body, main .results, .site-footer";
    let desktop = null;

    // ---- Pixel icons, drawn on a 16×16 grid ----
    function line(art, x0, y0, x1, y1, color) {
        const steps = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (let i = 0; i <= steps; i++) {
            art.rect(color, Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), 1, 1);
        }
    }
    const icons = {
        computer(art) {
            art.rect("#000000", 2, 1, 12, 10);
            art.rect("#c0c0c0", 3, 2, 10, 8);
            art.rect("#008080", 4, 3, 8, 6);
            art.rect("#ffffff", 4, 3, 3, 1);
            art.rect("#808080", 6, 11, 4, 1);
            art.rect("#000000", 1, 12, 14, 3);
            art.rect("#c0c0c0", 2, 13, 12, 1);
        },
        folder(art) {
            art.rect("#806000", 1, 3, 6, 2);
            art.rect("#806000", 1, 4, 14, 10);
            art.rect("#ffd75e", 2, 4, 4, 1);
            art.rect("#ffd75e", 2, 5, 12, 8);
            art.rect("#fff2a8", 2, 5, 12, 1);
        },
        document(art) {
            art.rect("#000000", 3, 1, 9, 14);
            art.rect("#000000", 12, 4, 1, 11);
            art.rect("#ffffff", 4, 2, 7, 12);
            art.rect("#ffffff", 11, 5, 1, 9);
            art.rect("#808080", 10, 1, 1, 4);
            art.rect("#808080", 10, 4, 3, 1);
            for (let y = 5; y < 13; y += 2) {
                art.rect("#000080", 5, y, y === 11 ? 3 : 5, 1);
            }
        },
        power(art) {
            art.ellipse("#000000", 8, 8, 7, 7);
            art.ellipse("#c00000", 8, 8, 6, 6);
            art.ellipse("#ffffff", 8, 9, 4, 4);
            art.ellipse("#c00000", 8, 9, 3, 3);
            art.rect("#c00000", 7, 2, 3, 6);
            art.rect("#ffffff", 8, 3, 1, 6);
        },
        trash(art) {
            art.rect("#000000", 3, 3, 10, 2);
            art.rect("#c0c0c0", 4, 3, 8, 1);
            art.rect("#000000", 4, 5, 8, 10);
            art.rect("#e0e0e0", 5, 5, 6, 9);
            for (let x = 6; x < 11; x += 2) {
                art.rect("#808080", x, 6, 1, 7);
            }
            art.rect("#000000", 6, 1, 4, 2);
        },
        error(art) {
            art.ellipse("#000000", 8, 8, 7, 7);
            art.ellipse("#ff0000", 8, 8, 6, 6);
            line(art, 5, 5, 11, 11, "#ffffff");
            line(art, 6, 5, 11, 10, "#ffffff");
            line(art, 11, 5, 5, 11, "#ffffff");
            line(art, 10, 5, 5, 10, "#ffffff");
        },
        speaker(art) {
            art.rect("#000000", 3, 6, 3, 4);
            line(art, 6, 6, 9, 3, "#000000");
            line(art, 6, 9, 9, 12, "#000000");
            art.rect("#000000", 9, 3, 1, 10);
            art.rect("#ffd75e", 7, 6, 2, 4);
            art.rect("#808080", 11, 6, 1, 4);
            art.rect("#808080", 13, 5, 1, 6);
        },
        muted(art) {
            icons.speaker(art);
            line(art, 2, 2, 14, 14, "#c00000");
        },
        logo(art) {
            art.rect("#000000", 1, 2, 14, 12);
            art.rect("#0d1114", 2, 3, 12, 10);
            line(art, 4, 5, 6, 7, "#6ee7b7");
            line(art, 6, 7, 4, 9, "#6ee7b7");
            art.rect("#6ee7b7", 8, 10, 4, 1);
        }
    };
    function icon(name) {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        canvas.setAttribute("aria-hidden", "true");
        icons[name](runtime.pixels(canvas.getContext("2d")));
        return canvas;
    }

    // ---- Sound effects ----
    const effects = runtime.soundEffects();
    let quiet = false;
    function tone(type, hz, at, length, volume) {
        if (!quiet) {
            effects.tone({type, from: hz, at, length, volume});
        }
    }
    const sfx = {
        click() {
            tone("square", 1800, 0, 0.015, 0.03);
        },
        ding() {
            tone("sine", 1175, 0, 0.7, 0.12);
            tone("sine", 1760, 0, 0.5, 0.05);
            tone("sine", 2350, 0.002, 0.3, 0.02);
        },
        shutdown() {
            [84, 79, 76, 72, 67].forEach(function (note, i) {
                tone("triangle", runtime.noteFrequency(note), i * 0.16, 1.4 - i * 0.12, 0.07);
            });
        }
    };

    // ---- Dialogs ----
    function alertBox(title, message) {
        const dialog = document.createElement("dialog");
        dialog.className = "win-dialog";
        dialog.innerHTML =
            '<div class="win-titlebar"><span class="win-title"></span><button type="button" class="win-button" data-action="close" aria-label="Close dialog"><svg class="win-control-icon" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M1 1h2l3 3 3-3h2v2L8 6l3 3v2H9L6 8l-3 3H1V9l3-3-3-3z"/></svg></button></div>' +
            '<div class="win-dialog-body"><p></p></div><div class="win-dialog-actions"><button class="win-ok" type="button">OK</button></div>';
        dialog.querySelector(".win-title").textContent = title;
        dialog.querySelector("p").textContent = message;
        const errorIcon = icon("error");
        dialog.querySelector(".win-dialog-body").prepend(errorIcon);
        dialog.querySelector(".win-ok").addEventListener("click", function () {
            dialog.close();
        });
        dialog.addEventListener("close", function () {
            dialog.remove();
        });
        document.body.appendChild(dialog);
        dialog.showModal();
        sfx.ding();
    }

    // ---- Windows ----
    // A window's title: a card's own title, else its first heading; the search results and footer get names.
    function titleFor(element) {
        if (element.classList.contains("results")) {
            return "Search results";
        }
        if (element.classList.contains("site-footer")) {
            return "Quote of the day";
        }
        const heading = [".card-title", "h1", "h2", ".label"]
            .map(function (selector) {
                return element.querySelector(selector);
            })
            .filter(Boolean)[0];
        const title = heading ? heading.cloneNode(true) : null;
        if (title) {
            title.querySelectorAll('[aria-hidden="true"]').forEach(function (decoration) {
                decoration.remove();
            });
        }
        const text = title ? title.textContent.trim() : document.title;
        return element.classList.contains("card") ? text + ".txt" : text;
    }
    let zTop = 10;
    let drag = null;
    function onPointerDown(event) {
        const bar = event.target.closest(".win-titlebar");
        if (!bar || event.target.closest(".win-button") || event.button > 0) {
            return;
        }
        const element = bar.parentElement;
        if (element.classList.contains("win-max") || element.tagName === "DIALOG") {
            return;
        }
        event.preventDefault();
        const current = (element.style.translate || "0px 0px").split(" ").map(parseFloat);
        drag = {
            element,
            x: event.clientX,
            y: event.clientY,
            startX: current[0] || 0,
            startY: current[1] || 0,
            moved: false
        };
        element.style.zIndex = ++zTop;
        try {
            bar.setPointerCapture(event.pointerId);
        } catch (error) {
            /* The pointer may already be gone. */
        }
    }
    function onPointerMove(event) {
        if (!drag) {
            return;
        }
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) {
            drag.moved = true;
        }
        drag.element.style.translate = drag.startX + dx + "px " + (drag.startY + dy) + "px";
    }
    function onPointerUp() {
        drag = null;
    }
    // Clicks in a title bar never follow the link a card wraps; its buttons work the window instead.
    function onClick(event) {
        const bar = event.target.closest(".win-titlebar");
        if (!bar) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const button = event.target.closest(".win-button");
        const element = bar.parentElement;
        if (!button) {
            return;
        }
        sfx.click();
        const action = button.getAttribute("data-action");
        if (element.tagName === "DIALOG") {
            element.close();
            return;
        }
        if (action === "min" || action === "max") {
            const pressed = element.classList.toggle("win-" + action);
            button.setAttribute("aria-pressed", String(pressed));
            button.setAttribute("aria-label", pressed ? "Restore window" : action === "min" ? "Minimize window" : "Maximize window");
        }
        if (action === "close") {
            if (element.classList.contains("article")) {
                alertBox("Reader", "This window can't be closed while someone is still reading it.");
            } else {
                element.classList.add("win-closed");
                document.querySelector(".win-task").focus();
            }
        }
    }

    // ---- The desktop ----
    function build(version) {
        const number = version === "winxp" ? "XP" : "95";
        desktop = {version, parts: [], windows: [], links: [] };
        document.querySelectorAll(WINDOWS).forEach(function (element) {
            if (element.parentElement.closest(".card, .panel, .post-list, .article")) {
                return;
            }
            // Keep native controls outside the card's navigation link.
            if (element.tagName === "A") {
                const original = element;
                const shell = document.createElement("div");
                Array.from(original.attributes).forEach(function (attribute) {
                    if (!["href", "target", "rel", "download", "hreflang", "type"].includes(attribute.name)) {
                        shell.setAttribute(attribute.name, attribute.value);
                    }
                });
                const link = original.cloneNode(false);
                link.removeAttribute("id");
                link.className = "win-card-link";
                while (original.firstChild) {
                    link.appendChild(original.firstChild);
                }
                shell.appendChild(link);
                original.replaceWith(shell);
                desktop.links.push({original, shell, link});
                element = shell;
            }
            const bar = document.createElement("span");
            bar.className = "win-titlebar";
            bar.innerHTML =
                '<span class="win-title" aria-hidden="true"></span><button type="button" class="win-button" data-action="min" aria-label="Minimize window" aria-pressed="false"><svg class="win-control-icon" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 9h8v2H2z"/></svg></button>' +
                '<button type="button" class="win-button" data-action="max" aria-label="Maximize window" aria-pressed="false"><svg class="win-maximize-icon" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path class="win-maximize-glyph" fill-rule="evenodd" d="M1 1h10v10H1V1Zm1 3v6h8V4H2Z"/><path class="win-restore-glyph" fill-rule="evenodd" d="M3 0h9v9h-2V2H4v1H3V0ZM0 3h9v9H0V3Zm1 3v5h7V6H1Z"/></svg></button><button type="button" class="win-button" data-action="close" aria-label="Close window"><svg class="win-control-icon" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M1 1h2l3 3 3-3h2v2L8 6l3 3v2H9L6 8l-3 3H1V9l3-3-3-3z"/></svg></button>';
            bar.querySelector(".win-title").textContent = titleFor(element);
            // Last, so the page's own :first-child rules (such as the featured project card's) still apply.
            element.append(bar);
            desktop.windows.push(element);
        });

        // The taskbar: Start, the page's own task button, and a tray with the speaker and clock.
        const taskbar = document.createElement("div");
        taskbar.className = "win-taskbar";
        taskbar.innerHTML =
            '<button class="win-start" type="button" aria-haspopup="menu" aria-expanded="false">Start</button>' +
            '<button class="win-task" type="button"><span></span></button>' +
            '<div class="win-tray"><button class="win-speaker" type="button" aria-label="Sounds on or off"></button><span class="win-clock"></span></div>';
        const start = taskbar.querySelector(".win-start");
        const task = taskbar.querySelector(".win-task");
        const speaker = taskbar.querySelector(".win-speaker");
        start.prepend(icon("logo"));
        task.prepend(icon("document"));
        task.querySelector("span").textContent = document.title.split(" | ")[0];
        task.addEventListener("click", function () {
            sfx.click();
            scrollTo({ top: 0, behavior: "smooth" });
        });
        speaker.style.cssText = "display:grid;padding:0;border:0;background:none;cursor:default";
        function drawSpeaker() {
            speaker.replaceChildren(icon(quiet ? "muted" : "speaker"));
        }
        drawSpeaker();
        speaker.addEventListener("click", function () {
            quiet = !quiet;
            try {
                sessionStorage.setItem(STORAGE + "-quiet", String(quiet));
            } catch (_) {}
            drawSpeaker();
            sfx.click();
        });
        const clock = taskbar.querySelector(".win-clock");
        function tick() {
            clock.textContent = new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            });
        }
        tick();
        desktop.clock = setInterval(tick, 15000);

        // The Start menu: only joke entries (so it never needs to follow the site's pages), and Shut Down.
        const menu = document.createElement("div");
        menu.className = "win-start-menu";
        menu.hidden = true;
        menu.innerHTML = '<div class="win-banner" aria-hidden="true">Whatever <b>' + number + '</b></div><ul class="win-menu" role="menu"></ul>';
        const list = menu.querySelector(".win-menu");
        function item(label, iconName, action) {
            const li = document.createElement("li");
            const element = document.createElement("button");
            element.className = "win-menu-item";
            element.type = "button";
            element.setAttribute("role", "menuitem");
            element.append(icon(iconName), label);
            element.addEventListener("click", function () {
                sfx.click();
                closeMenu();
                action();
            });
            li.appendChild(element);
            return li;
        }
        [
            ["Documents", "folder", "Nothing to see here"],
            ["Defragment Thoughts", "computer", "Your thoughts are 97% fragmented. Defragmenting would take longer than writing another post."],
            ["Help", "document", "Help is not available. Try explaining the problem to a rubber duck."]
        ].forEach(function (joke) {
            list.appendChild(
                item(joke[0], joke[1], function () {
                    alertBox(joke[0], joke[2]);
                })
            );
        });
        const separator = document.createElement("li");
        separator.className = "win-menu-sep";
        separator.setAttribute("role", "separator");
        list.appendChild(separator);
        list.appendChild(item("Shut Down…", "power", shutDown));

        function openMenu() {
            menu.hidden = false;
            start.setAttribute("aria-expanded", "true");
            const first = menu.querySelector(".win-menu-item");
            if (first) {
                first.focus();
            }
        }
        function closeMenu() {
            menu.hidden = true;
            start.setAttribute("aria-expanded", "false");
        }
        desktop.closeMenu = closeMenu;
        start.addEventListener("click", function () {
            sfx.click();
            if (menu.hidden) {
                openMenu();
            } else {
                closeMenu();
            }
        });
        desktop.outside = function (event) {
            if (!menu.hidden && !menu.contains(event.target) && !start.contains(event.target)) {
                closeMenu();
            }
        };
        // Escape closes the Start menu first, before the shared handler turns the mode off.
        desktop.keys = function (event) {
            if (event.key === "Escape" && !menu.hidden) {
                event.preventDefault();
                closeMenu();
                start.focus();
            }
        };
        document.addEventListener("pointerdown", desktop.outside, true);
        document.addEventListener("keydown", desktop.keys, true);

        // Desktop icons: a click selects, a double click (or Enter) opens.
        const desk = document.createElement("div");
        desk.className = "win-icons";
        desk.setAttribute("role", "listbox");
        desk.setAttribute("aria-label", "Desktop");
        // My Blog opens the front page through the header's logo link; the Recycle Bin only complains.
        [
            ["My Blog", "computer", document.querySelector(".wordmark")],
            ["Recycle Bin", "trash", null]
        ].forEach(function (entry) {
            const link = entry[2];
            const element = document.createElement("a");
            element.className = "win-icon";
            element.setAttribute("role", "option");
            element.setAttribute("aria-selected", "false");
            element.href = link ? link.href : "#";
            element.append(icon(entry[1]));
            const label = document.createElement("span");
            label.textContent = entry[0];
            element.append(label);
            function open() {
                if (link) {
                    location.href = link.href;
                } else {
                    alertBox("Recycle Bin", "The Recycle Bin is full of unfinished drafts. They are not ready to be emptied.");
                }
            }
            element.addEventListener("click", function (event) {
                event.preventDefault();
                if (event.detail === 0) {
                    open();
                    return;
                }
                sfx.click();
                desk.querySelectorAll(".win-icon").forEach(function (other) {
                    other.setAttribute("aria-selected", String(other === element));
                });
            });
            element.addEventListener("dblclick", function (event) {
                event.preventDefault();
                open();
            });
            desk.appendChild(element);
        });

        if (version === "win95" || version === "winxp") {
            const blog = desk.children[0];
            const bin = desk.children[1];
            let draggingBlog = false;
            function clearDrop() {
                draggingBlog = false;
                blog.classList.remove("win-icon-dragging");
                bin.classList.remove("win-icon-drop-target");
            }
            blog.draggable = true;
            blog.addEventListener("dragstart", function (event) {
                draggingBlog = true;
                event.dataTransfer.setData("text/plain", "My Blog");
                event.dataTransfer.effectAllowed = "move";
                blog.setAttribute("aria-selected", "true");
                bin.setAttribute("aria-selected", "false");
                blog.classList.add("win-icon-dragging");
            });
            blog.addEventListener("dragend", clearDrop);
            bin.addEventListener("dragover", function (event) {
                if (!draggingBlog) {
                    return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                bin.classList.add("win-icon-drop-target");
            });
            bin.addEventListener("dragleave", function (event) {
                if (!bin.contains(event.relatedTarget)) {
                    bin.classList.remove("win-icon-drop-target");
                }
            });
            bin.addEventListener("drop", function (event) {
                if (!draggingBlog) {
                    return;
                }
                event.preventDefault();
                clearDrop();
                if (version === "win95") {
                    runtime.bsodScreen.show();
                } else {
                    alertBox("Error Deleting My Blog", "Invalid operation. /dev/null not found");
                }
            });
        }

        document.body.append(desk, menu, taskbar);
        desktop.parts.push(desk, menu, taskbar);

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("click", onClick, true);
    }

    function shutDown() {
        sfx.shutdown();
        const screen = document.createElement("div");
        screen.className = "win-shutdown";
        screen.setAttribute("role", "alert");
        screen.innerHTML = "<span>It's now safe to turn off<br>your internet.</span><small>Click or press any key to switch it back on.</small>";
        document.body.appendChild(screen);
        desktop.parts.push(screen);
        function leave() {
            window.siteThemes.setTheme("reset");
        }
        desktop.shutdownKey = leave;
        setTimeout(function () {
            if (!screen.isConnected) {
                return;
            }
            screen.addEventListener("click", leave);
            document.addEventListener("keydown", leave, { capture: true, once: true });
        }, 300);
    }

    function teardown() {
        if (!desktop) {
            return;
        }
        clearInterval(desktop.clock);
        if (desktop.version === "win95") {
            runtime.bsodScreen.dismiss();
        }
        if (desktop.shutdownKey) {
            document.removeEventListener("keydown", desktop.shutdownKey, true);
        }
        desktop.parts.forEach(function (part) {
            part.remove();
        });
        desktop.windows.forEach(function (element) {
            const bar = element.querySelector(":scope > .win-titlebar");
            if (bar) {
                bar.remove();
            }
            element.classList.remove("win-min", "win-max", "win-closed");
            element.style.translate = "";
            element.style.zIndex = "";
        });
        desktop.links.forEach(function (entry) {
            while (entry.link.firstChild) {
                entry.original.appendChild(entry.link.firstChild);
            }
            entry.shell.replaceWith(entry.original);
        });
        document.querySelectorAll(".win-dialog").forEach(function (dialog) {
            dialog.close();
        });
        document.removeEventListener("pointerdown", desktop.outside, true);
        document.removeEventListener("keydown", desktop.keys, true);
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("click", onClick, true);
        desktop = null;
        drag = null;
    }

    // Switch to a version (or off with null), and remember it for the rest of the visit.
    function setTheme(version) {
        if (desktop && desktop.version === version) {
            return;
        }
        // Skip the page's colour transitions while the theme changes, then let them work again.
        root.classList.add("win-instant");
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                root.classList.remove("win-instant");
            });
        });
        teardown();
        if (version) {
            build(version);
        }
    }
    try {
        quiet = sessionStorage.getItem(STORAGE + "-quiet") === "true";
    } catch (_) {}
    ["win95", "winxp"].forEach(function (version) {
        window.siteThemes.register(version, function (enabled) {
            setTheme(enabled ? version : null);
        });
    });
})();