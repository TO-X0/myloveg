"use strict";

const Cake = {
    initialized: false,
    candles: [],
    extinguished: 0,
    totalCandles: 3,
    completed: false
};

function cakeGet(id) {
    return document.getElementById(id);
}

function updateCakeCounter() {
    const counter = cakeGet("cake-counter");
    if (counter) {
        counter.textContent = `${Cake.extinguished} / ${Cake.totalCandles}`;
    }
}

function createCandleSparkles(candle) {
    const rect = candle.getBoundingClientRect();

    for (let i = 0; i < 6; i++) {
        const particle = document.createElement("span");
        particle.className = "cake-sparkle";
        particle.textContent = i % 2 === 0 ? "✨" : "💗";
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top}px`;
        particle.style.setProperty("--spark-x", `${(Math.random() - 0.5) * 70}px`);
        particle.style.setProperty("--spark-y", `${-25 - Math.random() * 60}px`);
        document.body.appendChild(particle);
        window.setTimeout(() => particle.remove(), 1000);
    }
}

function createCakeCandles() {
    const container = cakeGet("cake-candles");
    if (!container) {
        return;
    }

    container.replaceChildren();
    Cake.candles = [];

    for (let i = 0; i < Cake.totalCandles; i++) {
        const candle = document.createElement("button");
        candle.type = "button";
        candle.className = `cake-candle cake-candle-${i + 1}`;
        candle.dataset.index = String(i);
        candle.setAttribute("aria-label", `إطفاء الشمعة ${i + 1}`);

        const flame = document.createElement("span");
        flame.className = "cake-flame";
        flame.innerHTML = '<span class="flame-inner"></span>';

        const smoke = document.createElement("span");
        smoke.className = "cake-smoke";
        candle.append(flame, smoke);
        candle.addEventListener("click", () => extinguishCandle(candle));
        container.appendChild(candle);
        Cake.candles.push(candle);
    }
}

function extinguishCandle(candle) {
    if (!candle || Cake.completed || candle.classList.contains("is-extinguished")) {
        return false;
    }

    candle.classList.add("is-extinguished");
    candle.disabled = true;
    Cake.extinguished++;
    updateCakeCounter();
    createCandleSparkles(candle);

    const status = cakeGet("cake-touch-status");
    if (status && Cake.extinguished < Cake.totalCandles) {
        const remaining = Cake.totalCandles - Cake.extinguished;
        status.textContent = `❤️ بقت ${remaining} شمعة... المسّي الشمعة التالية`;
    }

    if (Cake.extinguished >= Cake.totalCandles) {
        finishCake();
    }
    return true;
}

function finishCake() {
    if (Cake.completed) {
        return;
    }

    Cake.completed = true;
    const status = cakeGet("cake-touch-status");
    if (status) {
        status.textContent = "🥹❤️ انطفت كل الشموع... أتمنى تتحقق أمنيتج ❤️";
    }

    document.body.classList.add("cake-finale-active");

    let overlay = document.querySelector(".cake-finale-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "cake-finale-overlay";
        overlay.setAttribute("aria-hidden", "true");
        document.body.appendChild(overlay);
    }

    const finale = cakeGet("cake-finale");
    if (finale) {
        finale.classList.add("is-visible");
        finale.setAttribute("aria-hidden", "false");
        finale.removeAttribute("tabindex");
    }

    createFinalCakeParticles();
}

function createFinalCakeParticles() {
    const symbols = ["❤️", "💕", "✨", "💖", "🌹"];
    for (let i = 0; i < 18; i++) {
        window.setTimeout(() => {
            const particle = document.createElement("span");
            particle.className = "cake-final-particle";
            particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.setProperty("--rise-x", `${(Math.random() - 0.5) * 160}px`);
            document.body.appendChild(particle);
            window.setTimeout(() => particle.remove(), 4000);
        }, i * 90);
    }
}

function resetCake() {
    Cake.extinguished = 0;
    Cake.completed = false;
    createCakeCandles();
    updateCakeCounter();

    const finale = cakeGet("cake-finale");
    if (finale) {
        finale.classList.remove("is-visible");
        finale.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("cake-finale-active");
    document.querySelector(".cake-finale-overlay")?.remove();

    const status = cakeGet("cake-touch-status");
    if (status) {
        status.textContent = "المسّي كل شمعة لإطفائها ❤️";
    }
}

function initCake() {
    if (Cake.initialized || !cakeGet("cake-candles")) {
        return;
    }

    createCakeCandles();
    updateCakeCounter();
    Cake.initialized = true;
}

window.initCake = initCake;
window.resetCake = resetCake;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCake, { once: true });
} else {
    initCake();
}
