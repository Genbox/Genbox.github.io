(function () {
    "use strict";

    let dog;
    let ctx;
    let x = 24;
    let y = 24;
    let targetX = innerWidth / 2;
    let targetY = innerHeight / 2;
    let facing = 2;
    let elapsed = 0;
    let lickLength = 0;
    let lickNod = 0;
    let velocityX = 0;
    let velocityY = 0;
    let gait = 0;
    let bodyBounce = 0;
    let lastPointerMove = performance.now();
    let sitProgress = 0;
    let gaitRunning = false;
    const stopDistance = 72; // Leave room between the muzzle and the bone cursor.
    const sound = window.siteRuntime.sounds.doggy;
    let nextWoof = 0;
    let barkAmount = 0;
    function stopWoof() {
        nextWoof = 0;
        barkAmount = 0;
        sound.stop();
    }
    let christmas = false;
    const reducedMotion = window.siteRuntime.reducedMotion;
    // A page-wide layer for dust kicked up while running and hearts while licking the bone.
    let effects;
    let particles = [];
    let nextPuff = 0;
    let nextHeart = 0;
    const heart = ["01010", "11111", "01110", "00100"];

    function updateEffects(now, dt, running, licking) {
        if (reducedMotion.matches) {
            particles = [];
            effects.ctx.clearRect(0, 0, effects.width, effects.height);
            return;
        }
        const feetY = y + dog.height * 2 - 8;
        if (running && now >= nextPuff) {
            // Puffs land behind the paws, opposite the direction of travel.
            const speed = Math.hypot(velocityX, velocityY) || 1;
            particles.push({
                kind: "dust",
                x: x + 48 - (velocityX / speed) * 22 + (Math.random() - 0.5) * 8,
                y: feetY + (Math.random() - 0.5) * 4,
                age: 0,
                life: 0.45 + Math.random() * 0.2,
                drift: (Math.random() - 0.5) * 12
            });
            nextPuff = now + 70;
        }
        if (licking && now >= nextHeart) {
            const angle = (facing * Math.PI) / 4;
            particles.push({
                kind: "heart",
                x: x + 48 + Math.cos(angle) * 18,
                y: y + 4,
                age: 0,
                life: 1.2,
                drift: (Math.random() - 0.5) * 10
            });
            nextHeart = now + 650;
        }
        effects.ctx.clearRect(0, 0, effects.width, effects.height);
        particles = particles.filter(function (p) {
            p.age += dt;
            return p.age < p.life;
        });
        particles.forEach(function (p) {
            const t = p.age / p.life;
            // Snap to the same 2px grid as the dog so the effects stay pixel art.
            const px = Math.round((p.x + p.drift * t) / 2) * 2;
            if (p.kind === "dust") {
                const size = 2 + Math.floor(t * 3) * 2;
                effects.ctx.globalAlpha = 0.45 * (1 - t);
                effects.ctx.fillStyle = t < 0.5 ? "#cdbb9c" : "#a89880";
                effects.ctx.fillRect(px - size / 2, Math.round((p.y - t * 6) / 2) * 2 - size / 2, size, size);
            } else {
                const py = Math.round((p.y - t * 28) / 2) * 2;
                effects.ctx.globalAlpha = t < 0.6 ? 1 : (1 - t) / 0.4;
                heart.forEach(function (row, r) {
                    for (let c = 0; c < row.length; c++) {
                        if (row[c] !== "1") {
                            continue;
                        }
                        effects.ctx.fillStyle = r === 1 && c === 1 ? "#ffd3dc" : colors.pink;
                        effects.ctx.fillRect(px - 5 + c * 2, py + r * 2, 2, 2);
                    }
                });
            }
        });
        effects.ctx.globalAlpha = 1;
    }
    const colors = {
        ink: "#191820",
        black: "#292630",
        shine: "#45404b",
        white: "#fff8e9",
        shade: "#d9d0be",
        tan: "#c88b4e",
        brown: "#8e5939",
        pink: "#e995a6"
    };

    function rect(color, left, top, width, height) {
        ctx.fillStyle = colors[color] || color;
        ctx.fillRect(left, top, width, height);
    }

    // Five hand-drawn views, mirrored into eight compass directions.
    function head(left, top, view, bounce, running) {
        ctx.save();
        // Lean toward the bone and recoil with each lick; keep the pixel grid sharp.
        const rearView = view === "back" || view === "back-diagonal";
        const forward = view === "front" || rearView ? 0 : lickNod + Math.round(barkAmount);
        let vertical = view === "back" || view === "back-diagonal" ? 2 - lickNod : lickNod;
        if (view === "side") {
            vertical = -lickNod;
        }
        ctx.translate(Math.min(left + forward, view === "side" ? 18 : 23), Math.max(0, top + vertical - Math.round(barkAmount * (rearView ? 1 : 4))));
        if (christmas) {
            // The folded tip and pom-pom sit behind the head and ears.
            rect("#861b30", 1, -5, 5, 7);
            rect("#bb2940", 1, -5, 3, 5);
            rect("#b7b4ae", -1, 0, 5, 5);
            rect("shade", -2, 1, 7, 3);
            rect("white", -1, 0, 4, 4);
            rect("#ffffff", -1, 0, 2, 2);
        }
        rect("ink", 4, 0, 15, 3);
        rect("black", 2, 3, 19, 15);
        rect("black", 0, 5 + bounce, 5, 17);
        rect("ink", 0, 9 + bounce, 2, 11);
        rect("shine", 2, 6 + bounce, 2, 9);
        rect("brown", 2, 17 + bounce, 2, 4);
        if (view !== "side") {
            rect("black", 19, 5 + bounce, 5, 17);
            rect("ink", 23, 9 + bounce, 2, 11);
            rect("brown", 20, 17 + bounce, 2, 4);
        }
        if (view === "back" || view === "back-diagonal") {
            rect("shine", 5, 3, 13, 2);
            rect("white", 10, 0, 3, 3);
            rect("shade", 7, 16, 11, 3);
            if (view === "back-diagonal") {
                rect("tan", 19, 8, 3, 2);
                rect("white", 20, 11, 4, 5);
                rect("ink", 23, 11, 2, 2);
                if (lickLength) {
                    rect("pink", 23, 10 - lickLength, 2, lickLength);
                }
            } else if (lickLength) {
                // The tongue peeks beyond the muzzle when viewed from behind.
                rect("pink", 11, -lickLength, 2, lickLength);
            }
        } else if (view === "side") {
            rect("white", 16, 2, 3, 10);
            rect("tan", 17, 7, 4, 2);
            rect("ink", 18, 10, 3, 3);
            rect("white", 19, 10, 1, 1);
            rect("tan", 17, 14, 5, 3);
            rect("white", 18, 14, 8, 5);
            rect("ink", 24, 14, 3, 2);
            if (lickLength) {
                rect("pink", 25, 16, lickLength, 2);
                rect("#ffc0cb", 25 + lickLength - 1, 16, 1, 1);
            } else {
                rect("pink", 22, 19, 2, running ? 3 : 1);
            }
        } else {
            const offset = view === "diagonal" ? 2 : 0;
            rect("white", 10 + offset, 1, 3, 11);
            rect("tan", 5 + offset, 6, 4, 2);
            rect("tan", 14 + offset, 6, 4, 2);
            rect("ink", 5 + offset, 9, 4, 4);
            rect("ink", 14 + offset, 9, 4, 4);
            rect("white", 6 + offset, 9, 1, 1);
            rect("white", 15 + offset, 9, 1, 1);
            rect("tan", 4 + offset, 13, 4, 4);
            rect("tan", 16 + offset, 13, 3, 4);
            rect("white", 8 + offset, 12, 9, 7);
            rect("ink", 10 + offset, 13, 4, 3);
            rect("shade", 9 + offset, 18, 7, 2);
            rect("pink", 11 + offset, 19, 2, lickLength || (running ? 3 : 1));
            if (lickLength) {
                rect("#ffc0cb", 11 + offset, 18 + lickLength, 1, 1);
            }
        }
        if (barkAmount > 0.12) {
            const opening = 2 + Math.round(barkAmount * 4);
            if (view === "side") {
                rect("ink", 19, 18, 7, opening);
                rect("pink", 21, 18 + opening - 1, 3, 1);
                rect("white", 20, 18 + opening, 6, 1);
            } else if (view === "front" || view === "diagonal") {
                const mouthX = view === "diagonal" ? 12 : 10;
                rect("ink", mouthX - 1, 17, 7, opening);
                rect("pink", mouthX + 1, 17 + opening - 1, 3, 1);
                rect("white", mouthX, 17 + opening, 5, 1);
            }
        }
        if (christmas) {
            // Compact Santa cap: a lit crown with a shaded fold toward the back.
            rect("#861b30", 4, -3, 16, 5);
            rect("#ce3047", 5, -5, 13, 6);
            rect("#e64757", 7, -6, 8, 4);
            rect("#f56a70", 9, -6, 5, 1);
            rect("#e64757", 3, -7, 8, 3);
            rect("#ce3047", 1, -6, 5, 3);
            rect("#a32239", 5, -3, 3, 3);
            rect("#a32239", 16, -3, 3, 3);
            rect("shade", 3, 0, 18, 3);
            rect("white", 3, 0, 17, 2);
            rect("#ffffff", 6, 0, 9, 1);
            rect("#b7b4ae", 4, 2, 3, 1);
            rect("#b7b4ae", 17, 2, 3, 1);
        }
        ctx.restore();
    }

    function paw(left, top, phase, far) {
        const cycle = ((phase / (Math.PI * 2)) % 1 + 1) % 1;
        // Spend most of the stride planted, then lift and swing forward.
        const stance = cycle < 0.62;
        const swing = (cycle - 0.62) / 0.38;
        const reach = gaitRunning ? (stance ? 2 - (4 * cycle) / 0.62 : -2 + 4 * swing) : 0;
        const lift = gaitRunning && !stance ? Math.sin(swing * Math.PI) * 3 : 0;
        const side = facing === 0 || facing === 4;
        const diagonal = facing % 2 === 1;
        const footX = left + Math.round(reach * (side ? 1 : diagonal ? 0.7 : 0));
        const footY = top + 6 + Math.round((side ? 0 : reach * 0.5) - lift) - bodyBounce;
        const fur = far ? "shade" : "white";
        // The upper leg stays at the shoulder/hip while the bent lower leg follows the paw.
        rect("ink", left, top, 5, 4);
        rect(fur, left + 1, top, 3, 4);
        const kneeX = Math.round((left + footX) / 2);
        rect("ink", kneeX, top + 3, 4, Math.max(2, footY - top - 2));
        rect(fur, kneeX + 1, top + 3, 2, Math.max(1, footY - top - 3));
        rect("ink", footX, footY, 6, 3);
        rect(fur, footX, footY, 5, 2);
    }

    function seated(direction, wag, progress) {
        const side = direction === 0;
        const away = direction === 6 || direction === 7;
        const center = side ? 24 : 25;
        if (direction === 1 || direction === 7) {
            const rear = direction === 7;
            const settle = Math.round(progress * 2) - (rear ? 0 : Math.round(barkAmount));
            // Three-quarter sitting silhouette: rump behind the chest, not a sideways box.
            rect("black", 8, 29, 10, 5);
            rect("white", 7, 30 + wag, 5, 3);
            // Far foreleg is higher and partially concealed by the body.
            rect("ink", 30, rear ? 22 : 25, 5, 10);
            rect("shade", 31, rear ? 23 : 26, 3, 8);
            rect("shade", 30, rear ? 31 : 34, 6, 2);
            rect("ink", 13, 21 + settle, 15, 12);
            rect("black", 14, 22 + settle, 13, 10);
            rect("black", 17, 18 + settle, 12, 13);
            rect("shine", 15, 25 + settle, 5, 5);
            // Folded hind leg and one small rear paw.
            rect("shade", 13, 31, 10, 4);
            rect("white", 13, 34, 9, 3);
            if (rear) {
                rect("black", 23, 16 + settle, 11, 14);
                rect("shine", 24, 18 + settle, 7, 2);
                rect("shade", 29, 26, 4, 9);
                rect("white", 28, 34, 7, 2);
                head(18, 3 + settle, "back-diagonal", wag + Math.round(barkAmount), false);
            } else {
                // White bib follows the head down into two staggered front paws.
                rect("shade", 24, 21 + settle, 12, 10);
                rect("white", 26, 22 + settle, 9, 10);
                rect("white", 26, 29, 4, 7);
                rect("white", 25, 35, 7, 2);
                head(18, 5 + settle, "diagonal", wag + Math.round(barkAmount), false);
            }
            return;
        }
        // Haunches lower while the chest stays upright and the forepaws remain planted.
        const drop = Math.round(progress * 3) - (away ? 0 : Math.round(barkAmount * 2));
        rect("ink", center - 12, 18 + drop, 22, 15 - drop);
        rect("black", center - 11, 19 + drop, 20, 13 - drop);
        rect("shine", center - 10, 21 + drop, 6, 5);
        rect("shade", center - 12, 31, 10, 5);
        rect("white", center - 13, 34, 11, 3);
        rect("white", center + 1, 22, 9, 11);
        rect("shade", center + 1, 29, 3, 7);
        rect("white", center + 6, 29, 3, 7);
        rect("white", center, 35, 5, 2);
        rect("white", center + 5, 35, 6, 2);
        rect("black", center - 17, 28, 7, 6);
        rect("white", center - 18, 29 + wag, 4, 3);
        const view = side ? "side" : away ? (direction === 6 ? "back" : "back-diagonal") : direction === 2 ? "front" : "diagonal";
        // Keep the seated orientation; rear views only give a small head bob.
        head(side ? 17 : 13, 4 + Math.round(progress), view, wag + Math.round(barkAmount), false);
    }

    function draw(running, licking) {
        barkAmount = sitProgress === 1 ? sound.motion() : 0;
        const lickPhase = Math.floor(elapsed / 90) % 6;
        const eager = licking && !reducedMotion.matches;
        lickLength = eager ? [1, 3, 5, 3, 1, 0][lickPhase] : 0;
        lickNod = eager ? [0, 1, 2, 1, 0, 0][lickPhase] : 0;
        ctx.clearRect(0, 0, dog.width, dog.height);
        ctx.save();
        if (christmas) {
            ctx.translate(0, 8);
        }
        // Clockwise from right: E, SE, S, SW, W, NW, N, NE.
        const mirrored = facing === 3 || facing === 4 || facing === 5;
        if (mirrored) {
            ctx.translate(48, 0);
            ctx.scale(-1, 1);
        }
        const direction = mirrored ? (4 - facing + 8) % 8 : facing;
        gaitRunning = running;
        const stride = gait;
        bodyBounce = running ? -Math.round(Math.abs(Math.sin(gait)) * 1.5) : 0;
        const wag = running ? Math.round((Math.sin(gait - 0.8) + 1) / 2) : Math.floor(elapsed / 180) % 2;
        ctx.translate(0, bodyBounce);
        if (sitProgress > 0) {
            seated(direction, wag, sitProgress);
            ctx.restore();
            return;
        }
        if (direction === 2 || direction === 6) {
            // Head-on and rear views have a narrower, foreshortened body.
            paw(14, 27, stride, true);
            paw(29, 27, stride + Math.PI, true);
            rect("ink", 13, 14, 23, 18);
            rect("white", 14, 15, 21, 16);
            rect("black", 16, 15, 17, 12);
            rect("shine", 18, 16, 12, 2);
            if (direction === 2) {
                rect("white", 17, 23, 15, 10);
                paw(17, 29, stride + Math.PI, false);
                paw(27, 29, stride, false);
                head(12, 3, "front", wag, running);
            } else {
                head(12, 2, "back", wag, running);
                rect("black", 17, 22, 15, 8);
                rect("shade", 22, 24, 5, 10);
                rect("white", 21 + wag * 3, 26, 4, 10);
            }
        } else if (direction === 1 || direction === 7) {
            const away = direction === 7;
            // The hips, saddle and shoulders follow the same diagonal as the head.
            const hipY = away ? 23 : 12;
            const shoulderY = away ? 12 : 23;
            paw(13, hipY + 5, stride, true);
            paw(30, shoulderY + 4, stride + Math.PI, true);
            rect("ink", 7, hipY - 6 + wag, 4, 10);
            rect("white", 6, hipY - 8 + wag, 3, 7);
            // Paint the entire silhouette first, then continuous fur layers.
            // Outlining each section separately leaves dark stripes through the coat.
            for (let band = 0; band < 6; band++) {
                const bandY = hipY + (away ? -2 : 2) * band;
                rect("ink", 10 + band * 4, bandY - 3, 6, 13);
            }
            for (let band = 0; band < 6; band++) {
                const bandY = hipY + (away ? -2 : 2) * band;
                rect("white", 11 + band * 4, bandY - 2, 5, 11);
            }
            for (let band = 0; band < 5; band++) {
                const bandY = hipY + (away ? -2 : 2) * band;
                rect("black", 11 + band * 4, bandY - 2, 6, 7);
            }
            // One restrained highlight along the back, rather than repeated bars.
            rect("shine", 13, hipY - 1, 6, 2);
            rect("shine", 18, hipY + (away ? -3 : 1), 5, 2);
            if (away) {
                head(21, 0, "back-diagonal", wag, running);
                rect("black", 11, hipY - 1, 8, 7);
                paw(10, hipY + 7, stride + Math.PI, false);
                paw(31, shoulderY + 7, stride, false);
            } else {
                paw(10, hipY + 7, stride + Math.PI, false);
                rect("white", 29, shoulderY, 9, 7);
                paw(32, 30, stride, false);
                head(20, 8, "diagonal", wag, running);
            }
        } else {
            paw(11, 27, stride, true);
            paw(30, 27, stride + Math.PI, true);
            rect("ink", 3, 17 + wag * 2, 4, 11);
            rect("white", 2, 15 + wag * 2, 3, 8);
            rect("shade", 5, 24, 5, 5);
            rect("ink", 7, 18, 30, 13);
            rect("white", 8, 19, 28, 11);
            rect("black", 9, 18, 20, 8);
            rect("shine", 11, 19, 13, 2);
            rect("shade", 10, 28, 22, 3);
            rect("white", 29, 23, 10, 8);
            head(19, 3, "side", wag, running);
            paw(8, 29, stride + Math.PI, false);
            paw(32, 29, stride, false);
        }
        ctx.restore();
    }

    function tick(delta, now) {
        const dt = delta / 1000;
        const dx = targetX - (x + 48);
        const dy = targetY - (y + 40 + (christmas ? 16 : 0));
        const distance = Math.hypot(dx, dy);
        const wantsToSit = now - lastPointerMove >= 4000;
        sitProgress = Math.max(0, Math.min(1, sitProgress + (wantsToSit ? 1 : -1) * dt * 5));
        if (sitProgress === 1 && wantsToSit) {
            if (!nextWoof) {
                nextWoof = now + 4000 + Math.random() * 12000;
            } else if (now >= nextWoof) {
                sound.play();
                nextWoof = now + 4000 + Math.random() * 12000;
            }
        } else if (nextWoof) {
            stopWoof();
        }
        const startX = x;
        const startY = y;
        if (!reducedMotion.matches && distance > stopDistance + 1 && sitProgress === 0 && !wantsToSit) {
            // Ease into a chase and brake as the bone gets close.
            const speed = Math.min(250, Math.sqrt(2 * 420 * Math.max(0, distance - stopDistance)));
            const response = 1 - Math.exp(-8 * dt);
            velocityX += ((dx / distance) * speed - velocityX) * response;
            velocityY += ((dy / distance) * speed - velocityY) * response;
            const moveX = velocityX * dt;
            const moveY = velocityY * dt;
            const travel = Math.hypot(moveX, moveY);
            const limit = Math.min(1, (distance - stopDistance) / (travel || 1));
            x += moveX * limit;
            y += moveY * limit;
        } else {
            velocityX = 0;
            velocityY = 0;
        }
        const moving = Math.hypot(velocityX, velocityY) > 8;
        if (distance > 12 && !reducedMotion.matches) {
            // Face the actual travel direction through a turn, not the new target instantly.
            const angle = moving ? Math.atan2(velocityY, velocityX) : Math.atan2(dy, dx);
            const currentAngle = (facing * Math.PI) / 4;
            const difference = Math.atan2(Math.sin(angle - currentAngle), Math.cos(angle - currentAngle));
            if (Math.abs(difference) > Math.PI / 8 + 0.08) {
                facing = (Math.round(angle / (Math.PI / 4)) + 8) % 8;
            }
        }
        x = Math.max(0, Math.min(innerWidth - 96, x));
        y = Math.max(0, Math.min(innerHeight - dog.height * 2, y));
        const travelled = Math.hypot(x - startX, y - startY);
        const running = travelled > 0.05 && !reducedMotion.matches;
        // Cadence follows ground covered so feet do not keep sprinting while slowing down.
        gait += (travelled * Math.PI * 2) / 65;
        if (!reducedMotion.matches) {
            elapsed += dt * 1000;
        }
        const licking = Math.hypot(targetX - (x + 48), targetY - (y + 40 + (christmas ? 16 : 0))) <= stopDistance + 1;
        draw(running, licking && !running && sitProgress === 0);
        updateEffects(now, dt, running, licking && !running && sitProgress === 0);
        dog.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
    }
    // The dog keeps going with reduced motion (sitting still where it is); the bark sleeps while it waits.
    const walk = window.siteRuntime.loop(tick, {
        maxStep: 50,
        ignoreMotion: true,
        change(state) {
            if (state === "running") {
                sound.start();
            } else {
                stopWoof();
                sound.suspend();
            }
        }
    });

    function isChristmas() {
        return window.siteThemes.current() === "christmas";
    }

    function toggle() {
        if (dog) {
            walk.toggle(false);
            dog.remove();
            effects.remove();
            effects = null;
            particles = [];
            document.documentElement.classList.remove("mike-active");
            dog = null;
            return;
        }
        nextWoof = 0;
        dog = document.createElement("canvas");
        dog.className = "cavalier";
        dog.width = 48;
        christmas = isChristmas();
        dog.height = christmas ? 48 : 40;
        dog.style.height = dog.height * 2 + "px";
        dog.setAttribute("aria-hidden", "true");
        ctx = dog.getContext("2d");
        x = Math.max(0, innerWidth / 2 - 48);
        y = Math.max(0, innerHeight - 100);
        elapsed = 0;
        lastPointerMove = performance.now();
        sitProgress = 0;
        velocityX = velocityY = gait = bodyBounce = 0;
        effects = window.siteRuntime.pageLayer("doggy-effects");
        nextPuff = nextHeart = 0;
        document.body.appendChild(dog);
        document.documentElement.classList.add("mike-active");
        walk.toggle(true);
    }

    // The Christmas outfit follows the Christmas theme, including when it is switched mid-visit.
    document.addEventListener("themechange", function () {
        if (!dog) {
            return;
        }
        const wasChristmas = christmas;
        christmas = isChristmas();
        y += (Number(wasChristmas) - Number(christmas)) * 16;
        dog.height = christmas ? 48 : 40;
        dog.style.height = dog.height * 2 + "px";
    });

    document.addEventListener("pointermove", function (event) {
        if (event.pointerType === "touch") {
            return;
        }
        if (event.clientX !== targetX || event.clientY !== targetY) {
            lastPointerMove = performance.now();
            stopWoof();
        }
        targetX = event.clientX;
        targetY = event.clientY;
    });
    window.addEventListener("pagehide", stopWoof);
    // The "doggy" shortcut loads this script and then calls the toggle; "normal" sends the dog away.
    window.siteRuntime.characters.doggy = toggle;
    window.siteRuntime.registerShortcuts({
        normal() {
            if (dog) {
                toggle();
            }
        }
    });
})();