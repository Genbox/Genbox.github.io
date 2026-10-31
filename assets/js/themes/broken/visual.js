(function () {
    "use strict";

    const motion = window.siteRuntime.reducedMotion;
    let layer;
    let rat;
    let crumbleAt = 0;
    let pause = 0;
    let x = 24;
    let direction = 1;
    let distance = 0;
    let targets = [];
    let pieces = [];
    let headingObserver;
    let fallingWord;
    let headingSlot;
    let repairRobot;
    let repairWait = -1;
    let repairElapsed = 0;
    let headingRepaired = false;
    const repairLabels = [
        "DO NOT LEAN",
        "probably fine",
        "fixed (ish)",
        "load-bearing tape",
        "do not sneeze",
        "held by hope",
        "temporary since 2008",
        "one screw left",
        "looks structural",
        "warranty expired",
        "the rat approved",
        "please don’t refresh",
        "not a crack. a feature.",
        "inspected from a distance",
        "this side mostly up"
    ];
    const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
    const selector = "main .card, main .panel, main .toc, main .series, main .adj, main .terminal, main .chart";

    // Repeatable decoration choices per box, without relying on browser storage.
    function decorationRandom(key) {
        let seed = 2166136261;
        for (let i = 0; i < key.length; i++) {
            seed = Math.imul(seed ^ key.charCodeAt(i), 16777619);
        }
        return function () {
            seed += 0x6d2b79f5;
            let value = Math.imul(seed ^ seed >>> 15, seed | 1);
            value ^= value + Math.imul(value ^ value >>> 7, value | 61);
            return ((value ^ value >>> 14) >>> 0) / 4294967296;
        };
    }

    function decoration(parent, className) {
        const element = document.createElement("span");
        element.className = className;
        element.setAttribute("aria-hidden", "true");
        parent.appendChild(element);
        return element;
    }

    function breakHeading() {
        const heading = document.getElementById("typed-heading");
        if (!heading || fallingWord || motion.matches) {
            return;
        }
        const cursor = heading.querySelector(".cursor");
        if (!cursor || !cursor.classList.contains("cursor-done")) {
            return;
        }
        const typed = heading.firstElementChild;
        const text = typed.textContent;
        if (!text.endsWith("mind")) {
            return;
        }
        if (headingObserver) {
            headingObserver.disconnect();
        }
        typed.textContent = text.slice(0, -3);
        headingSlot = document.createElement("span");
        headingSlot.className = "broken-heading-slot";
        typed.appendChild(headingSlot);
        fallingWord = document.createElement("span");
        fallingWord.className = "broken-heading-word";
        fallingWord.textContent = "ind";
        headingSlot.appendChild(fallingWord);
        const animate = heading.dataset.titleAnimation !== "skip";
        heading.dataset.titleAnimation = "skip";
        if (!animate) {
            fallingWord.style.animation = "none";
            installReplacement();
            return;
        }
        fallingWord.addEventListener(
            "animationend",
            function (event) {
                if (event.animationName === "broken-heading-fall") {
                    repairWait = 10000;
                }
            },
            { once: true }
        );
    }

    function installReplacement(count, struggle) {
        if (!headingSlot || headingRepaired) {
            return;
        }
        if (count === undefined) {
            count = 3;
        }
        fallingWord.style.visibility = "hidden";
        let replacement = headingSlot.querySelector(".broken-heading-patch");
        if (!replacement) {
            replacement = decoration(headingSlot, "broken-heading-patch");
        }
        while (replacement.children.length < count) {
            const tile = document.createElement("span");
            tile.textContent = "Ind"[replacement.children.length];
            if (struggle) {
                tile.className = "is-being-fitted";
            }
            replacement.appendChild(tile);
        }
        if (count === 3) {
            headingRepaired = true;
            replacement.classList.add("is-complete");
        }
    }

    function summonRobot() {
        repairRobot = decoration(headingSlot, "broken-repair-robot");
        repairRobot.innerHTML = `<span class="broken-robot-cargo">Ind</span>
            <svg viewBox="0 0 100 90" width="100" height="90" xmlns="http://www.w3.org/2000/svg">
                <g class="broken-robot-flame" fill="#e6b35c"><path d="m31 68 6 18 6-18Z"/><path d="m58 68 6 18 6-18Z"/></g>
                <path d="M34 62v8h10v-8m13 0v8h10v-8" fill="#716e63" stroke="#282721" stroke-width="2"/>
                <rect x="27" y="35" width="46" height="29" rx="5" fill="#9b9b87" stroke="#35362e" stroke-width="2"/>
                <path d="M30 53h40v8H30z" fill="#c8a957"/><path d="m34 53 5 8m7-8 5 8m7-8 5 8" stroke="#39372b" stroke-width="4"/>
                <rect x="24" y="9" width="52" height="28" rx="7" fill="#c7c6a9" stroke="#35362e" stroke-width="2"/>
                <path d="M50 9V3" stroke="#989b87" stroke-width="3"/><circle cx="50" cy="3" r="3" fill="#e2b95f"/>
                <rect x="31" y="16" width="38" height="12" rx="4" fill="#292f2b"/>
                <circle cx="40" cy="22" r="3" fill="#bde5bf"/><path d="m57 20 6 3-6 1" fill="none" stroke="#bde5bf" stroke-width="2"/>
                <path d="m28 41-12 5-6-11" fill="none" stroke="#9b9b87" stroke-width="7" stroke-linecap="round"/>
                <g class="broken-robot-tool"><path d="m71 41 14-7-2-16" fill="none" stroke="#9b9b87" stroke-width="7" stroke-linecap="round"/>
                <path d="m78 4-1 8 6 6 6-6-1-8-4 6-3-1Z" fill="#cfceba" stroke="#45473b"/></g>
                <circle cx="48" cy="44" r="3" fill="#b35b48"/>
            </svg><span class="broken-robot-sparks">✦</span><span class="broken-robot-verdict">good enough.</span>`;
        repairElapsed = 0;
    }

    function updateRepair(delta) {
        if (repairWait >= 0) {
            repairWait -= delta;
            if (repairWait <= 0) {
                repairWait = -1;
                summonRobot();
            }
        }
        if (!repairRobot) {
            return;
        }
        repairElapsed += delta;
        const working = repairElapsed >= 3500 && repairElapsed < 11300;
        repairRobot.classList.toggle("is-working", working);
        if (working) {
            const letter = Math.min(2, Math.floor((repairElapsed - 3500) / 2600));
            installReplacement(letter + 1, true);
            repairRobot.style.setProperty("--repair-step", letter * 22 + "px");
            repairRobot.querySelector(".broken-robot-cargo").textContent = "Ind".slice(letter + 1);
        }
        if (repairElapsed >= 11300) {
            installReplacement();
            repairRobot.classList.add("is-delivered");
        }
        repairRobot.classList.toggle("is-speaking", repairElapsed >= 11300 && repairElapsed < 13300);
        if (repairElapsed >= 16800) {
            repairRobot.remove();
            repairRobot = null;
        }
    }

    function finishHeadingRepair() {
        if (!headingSlot) {
            breakHeading();
            return;
        }
        fallingWord.style.animation = "none";
        repairWait = -1;
        if (repairRobot) {
            repairRobot.remove();
        }
        repairRobot = null;
        installReplacement();
        headingSlot.querySelectorAll(".is-being-fitted").forEach(function (tile) {
            tile.classList.remove("is-being-fitted");
        });
    }

    function watchHeading() {
        const heading = document.getElementById("typed-heading");
        if (!heading) {
            return;
        }
        heading.addEventListener("headingstatic", finishHeadingRepair);
        headingObserver = new MutationObserver(breakHeading);
        headingObserver.observe(heading, { subtree: true, attributes: true, attributeFilter: ["class"] });
        breakHeading();
    }

    function damage(target, falling) {
        const corner = decoration(target.element, "broken-corner broken-corner-" + target.corner);
        target.chips.push(corner);
        target.element.classList.add("broken-chipped");
        if (!falling) {
            return;
        }
        const box = corner.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
            const piece = decoration(layer, "broken-debris");
            piece.style.left = box.left + Math.random() * 14 + "px";
            piece.style.top = box.top + "px";
            piece.style.setProperty("--drift", (Math.random() - 0.5) * 100 + "px");
            piece.style.setProperty("--spin", (Math.random() - 0.5) * 420 + "deg");
            pieces.push({ element: piece, remaining: 1500 });
        }
    }

    function crumble() {
        const visible = targets.filter(function (target) {
            const box = target.element.getBoundingClientRect();
            const cornerY = target.corner.startsWith("bottom") ? box.bottom : box.top;
            return !target.chips.length && cornerY > 12 && cornerY < innerHeight - 30 && box.right > 0 && box.left < innerWidth;
        });
        if (visible.length) {
            damage(visible[Math.floor(Math.random() * visible.length)], true);
        }
    }

    function step(delta) {
        updateRepair(delta);
        crumbleAt -= delta;
        if (crumbleAt <= 0) {
            crumble();
            crumbleAt = 20000 + Math.random() * 25000;
        }
        pieces = pieces.filter(function (piece) {
            piece.remaining -= delta;
            if (piece.remaining > 0) {
                return true;
            }
            piece.element.remove();
            return false;
        });
        const edge = Math.max(0, innerWidth - 116);
        x = Math.min(x, edge);
        if (pause > 0) {
            pause -= delta;
            rat.classList.add("is-sniffing");
        } else {
            rat.classList.remove("is-sniffing");
            x += direction * delta * 0.105;
            distance += delta;
            if (x >= edge || x <= 0) {
                x = Math.max(0, Math.min(x, edge));
                direction *= -1;
                pause = 1000 + Math.random() * 1800;
            } else if (distance > 4500) {
                distance = 0;
                pause = 1300 + Math.random() * 1800;
            }
        }
        rat.style.transform = "translateX(" + x + "px)";
        rat.firstElementChild.style.transform = "scaleX(" + direction + ")";
    }

    // The heading waits with the rat while the tab is hidden; with reduced motion, any repair finishes at once.
    function settle(state) {
        if (state === "off") {
            return;
        }
        breakHeading();
        if (headingSlot) {
            headingSlot.classList.toggle("broken-heading-paused", state === "paused");
        }
        if (state === "still" && (repairRobot || repairWait >= 0)) {
            installReplacement();
            repairWait = -1;
            if (repairRobot) {
                repairRobot.remove();
            }
            repairRobot = null;
        }
    }
    const scurrying = window.siteRuntime.loop(step, { maxStep: 64, change: settle });

    function setTheme(enabled) {
        if (!enabled) {
            scurrying.toggle(false);
            if (headingObserver) {
                headingObserver.disconnect();
            }
            headingObserver = null;
            const heading = document.getElementById("typed-heading");
            if (heading) {
                heading.removeEventListener("headingstatic", finishHeadingRepair);
            }
            if (headingSlot) {
                headingSlot.replaceWith(document.createTextNode("ind"));
            }
            fallingWord = headingSlot = repairRobot = null;
            repairWait = -1;
            repairElapsed = 0;
            headingRepaired = false;
            targets.forEach(function (target) {
                target.decorations.concat(target.chips).forEach(function (element) {
                    element.remove();
                });
                target.element.classList.remove("broken-box", "broken-chipped");
            });
            if (layer) {
                layer.remove();
            }
            layer = rat = null;
            targets = [];
            pieces = [];
            return;
        }
        if (layer) {
            return;
        }
        layer = document.createElement("div");
        layer.className = "broken-world";
        layer.setAttribute("aria-hidden", "true");
        document.body.appendChild(layer);
        const sign = decoration(layer, "broken-notice");
        sign.textContent = "STRUCTURALLY QUESTIONABLE";
        decoration(layer, "broken-wall-crack");
        decoration(layer, "broken-floor");
        rat = decoration(layer, "broken-rat");
        rat.innerHTML = `<svg viewBox="0 0 116 54" width="116" height="54" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="67" cy="49" rx="39" ry="3" fill="#000" opacity=".3"/>
            <path class="broken-rat-tail" d="M43 37C17 24 31 51 6 42" fill="none" stroke="#b98b7c" stroke-width="3" stroke-linecap="round"/>
            <g class="broken-rat-body">
                <path class="broken-rat-feet" d="m51 39-8 8h10m29-9 5 9h9" fill="none" stroke="#bd9584" stroke-width="3" stroke-linecap="round"/>
                <path d="M35 38C33 18 52 13 72 23l15 6 17 10q2 6-9 6H53Q39 45 35 38Z" fill="#81776b" stroke="#302c27" stroke-width="1.5"/>
                <path d="M41 34q10-15 29-7" fill="none" stroke="#a39784" stroke-width="2"/>
                <path d="m53 23 2-4 4 3 3-3 3 4" fill="#81776b"/>
                <circle cx="81" cy="26" r="9" fill="#81776b" stroke="#302c27" stroke-width="1.5"/>
                <circle cx="82" cy="26" r="5" fill="#bf9484"/>
                <circle cx="94" cy="35" r="2.5" fill="#12120f"/>
                <circle cx="94.7" cy="34.2" r=".8" fill="#fff2cf"/>
                <circle cx="105" cy="40" r="2.4" fill="#d1a090"/>
                <path d="m101 41 11-4m-11 6 12 2" stroke="#bdaf97" stroke-width=".8"/>
                <path d="m98 45 2 3 2-3" fill="#e5d8b7"/>
            </g>
        </svg>`;
        Array.from(document.querySelectorAll(selector)).forEach(function (element, index) {
            // Nested boxes keep their own content layout; decorate only the outer shell.
            if (element.parentElement.closest(selector)) {
                return;
            }
            const random = decorationRandom(location.pathname + ":" + (element.id || index));
            element.classList.add("broken-box");
            const target = {
                element,
                corner: corners[Math.floor(random() * corners.length)],
                decorations: [],
                chips: []
            };
            targets.push(target);
            // Repairs are occasional, with independently varied material, placement and angle.
            if (random() < 0.3) {
                const repair = decoration(element, random() < 0.5 ? "broken-bandage" : "broken-tape");
                repair.style.setProperty("--repair-angle", random() * 60 - 30 + "deg");
                const side = random() < 0.5 ? "left" : "right";
                repair.style.left = "auto";
                repair.style.right = "auto";
                repair.style[side] = 10 + random() * 22 + "%";
                const vertical = random() < 0.5 ? "top" : "bottom";
                repair.style.top = "auto";
                repair.style.bottom = "auto";
                repair.style[vertical] = "-9px";
                target.decorations.push(repair);
            }
            if (random() < 0.25) {
                damage(target, false);
            }
            if (random() < 0.15) {
                const note = decoration(element, "broken-repair-note");
                note.textContent = repairLabels[Math.floor(random() * repairLabels.length)];
                target.decorations.push(note);
            }
        });
        x = 24;
        direction = 1;
        distance = 0;
        pause = 0;
        crumbleAt = 15000 + Math.random() * 15000;
        watchHeading();
        scurrying.toggle(true);
    }

    window.siteThemes.register("broken", setTheme);
})();