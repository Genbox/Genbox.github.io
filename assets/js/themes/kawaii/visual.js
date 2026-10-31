(function () {
    "use strict";

    let friends;
    let rabbit;
    let elapsed = 0;
    let snackAt;
    let eating = false;
    let x = 16;
    let direction = 1;
    let stride = 0;
    let sitting = false;
    let sitElapsed = 0;
    let sitAt;
    let sitDuration;

    function nextSnack() {
        return 30000 + Math.random() * 30000;
    }

    function nextSit() {
        return 8000 + Math.random() * 14000;
    }

    function stepRabbit(delta) {
        elapsed += delta;
        if (elapsed >= snackAt) {
            eating = !eating;
            elapsed = 0;
            snackAt = eating ? 5500 : nextSnack();
            rabbit.classList.toggle("is-eating", eating);
            if (eating) {
                sitting = false;
                sitElapsed = 0;
                sitAt = nextSit();
                rabbit.classList.remove("is-sitting");
            }
        }
        const edge = Math.max(0, window.innerWidth - 82);
        x = Math.min(x, edge);
        if (!eating) {
            sitElapsed += delta;
            if (sitting && sitElapsed >= sitDuration) {
                sitting = false;
                sitElapsed = 0;
                sitAt = nextSit();
                stride = 0;
                rabbit.classList.remove("is-sitting");
            } else if (!sitting && sitElapsed >= sitAt && stride < 75) {
                // Settle only after landing, so a sitting break never freezes a midair hop.
                sitting = true;
                sitElapsed = 0;
                sitDuration = 4000 + Math.random() * 4000;
                rabbit.classList.add("is-sitting");
            }
        }
        if (!eating && !sitting) {
            // Cover most of the ground during the airborne part of each bound.
            stride = (stride + delta) % 720;
            const phase = stride / 720;
            const pace = phase < 0.18 || phase > 0.88 ? 0.018 : 0.105;
            x += direction * delta * pace;
            rabbit.style.setProperty("--rabbit-frame", -stride + "ms");
            if (x >= edge) {
                x = edge;
                direction = -1;
            }
            if (x <= 0) {
                x = 0;
                direction = 1;
            }
        }
        rabbit.style.transform = "translateX(" + x + "px)";
        rabbit.firstElementChild.style.transform = "scaleX(" + direction + ")";
    }
    const hopping = window.siteRuntime.loop(stepRabbit);

    function addRabbit() {
        rabbit = document.createElement("div");
        rabbit.className = "kawaii-rabbit";
        rabbit.setAttribute("aria-hidden", "true");
        rabbit.innerHTML = `<svg viewBox="0 0 82 60" width="82" height="60" xmlns="http://www.w3.org/2000/svg">
            <ellipse class="rabbit-shadow" cx="35" cy="56" rx="23" ry="2.5" fill="#a87c9d" opacity=".2"/>
            <g class="rabbit-carrot">
                <path d="m66 53 12-9-2 10Z" fill="#f59a48" stroke="#d17a36" stroke-width=".8"/>
                <path d="m77 46 1-8m0 7 4-5m-5 4-3-5" fill="none" stroke="#78a76b" stroke-width="1.8" stroke-linecap="round"/>
                <path d="m71 50 2 1m1-4 2 1" stroke="#df7c34" stroke-width=".8"/>
            </g>
            <g class="rabbit-body" stroke="#c5b7c6" stroke-width=".85" stroke-linejoin="round">
                <g class="rabbit-foreleg rabbit-far" fill="#eeeaf1">
                    <path d="M45 37q9 0 8 10l8 5q3 3-2 3H48q-3-5-3-18Z"/>
                </g>
                <path d="M15 29c-3-4-7-2-7 0-5-1-7 4-4 6-3 4 1 8 5 6 3 3 8 0 7-3 4-2 3-7-1-9Z" fill="#fff"/>
                <path d="M14 43C7 31 16 21 29 22c12 0 17 9 23 13l-3 13c-12 8-29 7-35-5Z" fill="#fff"/>
                <path d="M18 42q4 8 18 7" fill="none" stroke="#ece6ed" stroke-width="2"/>
                <g class="rabbit-hindleg" fill="#fff">
                    <path d="M31 34c-12-6-20 7-12 14l-4 4q-2 3 3 3h17q5-1 1-4l-8-3c7-2 9-8 3-14Z"/>
                    <path d="m20 52 2 2m2-2 2 2" fill="none" stroke="#e5d3df"/>
                </g>
                <g class="rabbit-foreleg" fill="#fff">
                    <path d="M45 36q9-1 7 12l8 4q3 3-1 3H48q-5-3-3-19Z"/>
                    <path d="m54 52 1 2m2-2 1 2" fill="none" stroke="#e5d3df"/>
                </g>
                <g class="rabbit-head">
                    <g class="rabbit-ears">
                        <path d="M46 28C39 19 37 3 42 3c5-1 10 15 10 23" fill="#f8f5fa"/>
                        <path d="M52 26C51 14 56 1 60 3c5 3 0 18-3 25" fill="#fff"/>
                        <path d="M44 10q0 8 4 13m9-13q0 7-2 12" fill="none" stroke="#efc4d5" stroke-width="2.6" stroke-linecap="round"/>
                    </g>
                    <path d="M40 30c0-8 12-12 19-6 4 3 3 6 7 8 7 2 5 10-2 12-10 5-25 2-25-7Z" fill="#fff"/>
                    <path d="m44 25 1-4 3 2 3-4 2 4" fill="#fff" stroke-linecap="round"/>
                    <g class="rabbit-eye">
                        <ellipse cx="57" cy="32" rx="3.1" ry="3.7" fill="#493746" stroke="none"/>
                        <circle cx="58" cy="30.7" r="1.2" fill="#fff" stroke="none"/>
                        <circle cx="55.9" cy="33.4" r=".55" fill="#fff1fa" stroke="none"/>
                    </g>
                    <ellipse cx="54.5" cy="39" rx="4.6" ry="2.3" fill="#f7c9dc" stroke="none"/>
                    <path d="m52 38-.3 1m2-1-.3 1m2-1-.3 1" stroke="#eaa8c5" stroke-width=".6" stroke-linecap="round"/>
                    <ellipse cx="64" cy="39" rx="3.8" ry="2.6" fill="#fff9fc" stroke="none"/>
                    <path d="M67 35q1-2 2 0 2-1 2 1l-2 2Z" fill="#dba5b9" stroke="none"/>
                    <path class="rabbit-mouth" d="m68 38-1 2q-2 2-4 0" fill="none" stroke="#b18c9e" stroke-linecap="round"/>
                    <path d="m62 37-7-1m7 3-7 1" fill="none" stroke="#d4c5d1" stroke-width=".6"/>
                </g>
            </g>
        </svg>`;
        document.body.appendChild(rabbit);
        elapsed = 0;
        eating = false;
        snackAt = nextSnack();
        sitting = false;
        sitElapsed = 0;
        sitAt = nextSit();
        hopping.toggle(true);
    }

    function setTheme(enabled) {
        if (enabled && !friends) {
            friends = document.createElement("div");
            friends.className = "kawaii-friends";
            friends.setAttribute("aria-hidden", "true");
            ["🌸", "🐰", "✨", "🍓", "☁️", "🎀"].forEach(function (emoji, index) {
                const friend = document.createElement("span");
                friend.textContent = emoji;
                friend.style.setProperty("--friend", index);
                friend.style.left = 5 + (index % 3) * 30 + Math.random() * 25 + "%";
                friend.style.top = 8 + Math.floor(index / 3) * 45 + Math.random() * 32 + "%";
                friends.appendChild(friend);
            });
            document.body.appendChild(friends);
            addRabbit();
        } else if (!enabled && friends) {
            hopping.toggle(false);
            rabbit.remove();
            rabbit = null;
            friends.remove();
            friends = null;
        }
    }

    window.siteThemes.register("kawaii", setTheme);
})();