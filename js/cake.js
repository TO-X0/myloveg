
"use strict";

/* =========================================================
   CAKE.JS
   Interactive Birthday Cake
   3 Candles + Improved Microphone Blow Detection
========================================================= */


/* =========================================================
   STATE
========================================================= */

const Cake = {

    initialized: false,

    microphoneActive: false,

    audioContext: null,

    analyser: null,

    microphone: null,

    stream: null,

    animationFrame: null,

    candles: [],

    extinguished: 0,

    totalCandles: 3,

    blowCooldown: false,

    lastVolume: 0,

    noiseFloor: 0,

    blowStrength: 0,

    blowFrames: 0,

    completed: false

};


/* =========================================================
   ELEMENTS
========================================================= */

function cakeGet(id) {

    return document.getElementById(id);

}


/* =========================================================
   CREATE CANDLES
========================================================= */

function createCakeCandles() {

    const container =
        cakeGet("cake-candles");

    if (!container) {
        return;
    }


    container.replaceChildren();

    Cake.candles = [];


    /*
     * Three candles:
     *
     * 0 = left
     * 1 = center
     * 2 = right
     */

    for (
        let i = 0;
        i < Cake.totalCandles;
        i++
    ) {

        const candle =
            document.createElement("div");

        candle.className =
            "cake-candle";

        candle.dataset.index =
            String(i);


        /*
         * Give each candle its own position.
         */

        candle.classList.add(
            `cake-candle-${i + 1}`
        );


        const flame =
            document.createElement("span");

        flame.className =
            "cake-flame";


        flame.innerHTML =
            `
            <span class="flame-inner"></span>
            `;


        const clickHandler = () => {

            if (
                Cake.completed ||
                candle.classList.contains("is-extinguished")
            ) {

                return;

            }

            extinguishCandle(candle);

        };

        candle.addEventListener(
            "click",
            clickHandler
        );


        const smoke =
            document.createElement("span");

        smoke.className =
            "cake-smoke";


        candle.append(
            flame,
            smoke
        );


        container.appendChild(
            candle
        );


        Cake.candles.push(
            candle
        );

    }

}


/* =========================================================
   EXTINGUISH NEXT CANDLE
========================================================= */

function extinguishCandle(candle) {

    if (
        !candle ||
        Cake.completed ||
        candle.classList.contains("is-extinguished")
    ) {

        return false;

    }

    candle.classList.add(
        "is-extinguished"
    );

    Cake.extinguished++;

    updateCakeCounter();

    createCandleSparkles(candle);

    const status =
        cakeGet("cake-mic-status");

    if (status && Cake.extinguished < Cake.totalCandles) {

        const remaining =
            Cake.totalCandles - Cake.extinguished;

        status.textContent =
            `❤️ بقت ${remaining} شمعة... اضغطي على الشمعة التالية`;

    }

    if (Cake.extinguished >= Cake.totalCandles) {
        finishCake();
    }

    return true;

}

function extinguishNextCandle() {

    if (
        Cake.completed ||
        Cake.extinguished >= Cake.totalCandles
    ) {

        return;

    }

    const candle =
        Cake.candles[
            Cake.extinguished
        ];

    extinguishCandle(candle);

}


/* =========================================================
   COUNTER
========================================================= */

function updateCakeCounter() {

    const counter =
        cakeGet("cake-counter");


    if (!counter) {
        return;
    }


    counter.textContent =
        `${Cake.extinguished} / ${Cake.totalCandles}`;

}


/* =========================================================
   CANDLE SPARKLES
========================================================= */

function createCandleSparkles(
    candle
) {

    const rect =
        candle.getBoundingClientRect();


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "cake-sparkle";


        particle.textContent =
            i % 2 === 0
                ? "✨"
                : "💗";


        particle.style.left =
            `${rect.left + rect.width / 2}px`;


        particle.style.top =
            `${rect.top}px`;


        particle.style.setProperty(
            "--spark-x",
            `${(Math.random() - 0.5) * 70}px`
        );


        particle.style.setProperty(
            "--spark-y",
            `${-25 - Math.random() * 60}px`
        );


        document.body.appendChild(
            particle
        );


        window.setTimeout(
            () => {

                particle.remove();

            },
            1000
        );

    }

}


/* =========================================================
   MICROPHONE
========================================================= */

async function startCakeMicrophone() {

    const button =
        cakeGet("cake-mic-button");

    if (button) {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.style.display = "none";
    }

    const status =
        cakeGet("cake-mic-status");

    if (status) {
        status.textContent =
            "اضغطي على الشموع نفسها لإطفائها ❤️";
    }

    stopCakeMicrophone();

    return;

}


/* =========================================================
   BLOW DETECTION
========================================================= */

function monitorCakeBlow() {

    if (
        !Cake.microphoneActive ||
        !Cake.analyser
    ) {

        return;

    }


    /*
     * Cancel an old animation loop first.
     */

    if (
        Cake.animationFrame
    ) {

        cancelAnimationFrame(
            Cake.animationFrame
        );

    }


    const buffer =
        new Uint8Array(
            Cake.analyser.fftSize
        );


    function analyze() {

        if (
            !Cake.microphoneActive ||
            !Cake.analyser
        ) {

            return;

        }


        Cake.analyser.getByteTimeDomainData(
            buffer
        );


        /*
         * Calculate RMS volume.
         */

        let sum = 0;


        for (
            let i = 0;
            i < buffer.length;
            i++
        ) {

            const value =
                (
                    buffer[i] - 128
                ) / 128;


            sum +=
                value * value;

        }


        const rms =
            Math.sqrt(
                sum / buffer.length
            );


        /*
         * Convert RMS to a readable 0..1 range.
         */

        const volume =
            Math.min(
                1,
                rms * 4.5
            );


        /*
         * Keep the previous volume BEFORE
         * changing lastVolume.
         *
         * This fixes the original logical bug.
         */

        const previousVolume =
            Cake.lastVolume;


        Cake.lastVolume =
            volume;


        updateCakeVolume(
            volume
        );


        /*
         * Slowly learn the ambient noise level.
         *
         * This helps prevent normal background noise
         * from extinguishing candles.
         */

        if (
            !Cake.blowCooldown &&
            Cake.blowFrames === 0
        ) {

            Cake.noiseFloor =
                Cake.noiseFloor * 0.96 +
                volume * 0.04;

        }


        /*
         * Detect a sudden increase in sound.
         */

        const suddenIncrease =
            volume >
            previousVolume + 0.035;


        /*
         * A blow should be noticeably stronger than
         * the surrounding microphone noise.
         */

        const aboveNoise =
            volume >
            Math.max(
                0.18,
                Cake.noiseFloor * 2.2
            );


        /*
         * Main blow condition.
         *
         * We do not extinguish immediately.
         * The signal must remain strong for a few
         * consecutive animation frames.
         */

        const strongBlow =
            volume > 0.28 &&
            aboveNoise &&
            suddenIncrease;


        /*
         * Also allow a sustained strong blow even if
         * the first frame was missed.
         */

        const sustainedBlow =
            volume > 0.34 &&
            aboveNoise;


        if (
            !Cake.blowCooldown &&
            (
                strongBlow ||
                sustainedBlow
            )
        ) {

            Cake.blowFrames++;

        } else if (
            Cake.blowFrames > 0
        ) {

            Cake.blowFrames =
                Math.max(
                    0,
                    Cake.blowFrames - 1
                );

        }


        /*
         * Require several consecutive frames.
         */

        if (
            Cake.blowFrames >= 3 &&
            !Cake.blowCooldown
        ) {

            detectCakeBlow();

            Cake.blowFrames =
                0;

        }


        Cake.animationFrame =
            requestAnimationFrame(
                analyze
            );

    }


    analyze();

}


/* =========================================================
   BLOW DETECTED
========================================================= */

function detectCakeBlow() {

    if (
        Cake.blowCooldown ||
        Cake.completed
    ) {

        return;

    }


    Cake.blowCooldown =
        true;


    /*
     * One blow = one candle.
     */

    extinguishNextCandle();


    /*
     * Wait before accepting another blow.
     *
     * This prevents one long blow from turning off
     * multiple candles.
     */

    window.setTimeout(
        () => {

            Cake.blowCooldown =
                false;

            Cake.blowFrames =
                0;

        },
        900
    );

}


/* =========================================================
   VOLUME UI
========================================================= */

function updateCakeVolume(
    volume
) {

    const bar =
        cakeGet("cake-volume-bar");


    if (!bar) {
        return;
    }


    const fill =
        bar.querySelector("span");


    if (!fill) {
        return;
    }


    fill.style.width =
        `${Math.round(volume * 100)}%`;

}


/* =========================================================
   FINISH CAKE
========================================================= */

function finishCake() {

    if (
        Cake.completed
    ) {

        return;

    }


    Cake.completed =
        true;


    /*
     * Stop microphone analysis first.
     */

    stopCakeMicrophone();


    const status =
        cakeGet("cake-mic-status");


    if (status) {

        status.textContent =
            "🥹❤️ نطفت كل الشموع... أتمنى تتحقق أمنيتج ❤️";

    }


    document.body.classList.add(
        "cake-finale-active"
    );


    const overlay =
        document.querySelector(
            ".cake-finale-overlay"
        );

    if (!overlay) {
        const newOverlay =
            document.createElement("div");

        newOverlay.className =
            "cake-finale-overlay";

        newOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.appendChild(
            newOverlay
        );
    }


    const finale =
        cakeGet("cake-finale");


    if (finale) {

        finale.style.opacity = "1";
        finale.style.visibility = "visible";
        finale.style.transform = "scale(1)";
        finale.style.pointerEvents = "auto";

        finale.classList.add(
            "is-visible"
        );

        finale.setAttribute(
            "aria-hidden",
            "false"
        );

        if (
            typeof finale.focus ===
            "function"
        ) {

            finale.setAttribute(
                "tabindex",
                "-1"
            );

            finale.focus();
        }

    }


    createFinalCakeParticles();

}


/* =========================================================
   FINAL PARTICLES
========================================================= */

function createFinalCakeParticles() {

    /*
     * Keep this celebration intentionally light.
     * It should not cover the entire website.
     */

    const particleCount =
        18;


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        window.setTimeout(
            () => {

                const particle =
                    document.createElement(
                        "span"
                    );


                particle.className =
                    "cake-final-particle";


                particle.textContent =
                    [
                        "❤️",
                        "💕",
                        "✨",
                        "💖",
                        "🌹"
                    ][
                        Math.floor(
                            Math.random() * 5
                        )
                    ];


                particle.style.left =
                    `${Math.random() * 100}vw`;


                particle.style.setProperty(
                    "--rise-x",
                    `${(Math.random() - 0.5) * 160}px`
                );


                document.body.appendChild(
                    particle
                );


                window.setTimeout(
                    () => {

                        particle.remove();

                    },
                    4000
                );

            },
            i * 90
        );

    }

}


/* =========================================================
   STOP MICROPHONE
========================================================= */

function stopCakeMicrophone() {

    Cake.microphoneActive =
        false;


    /*
     * Stop animation loop.
     */

    if (
        Cake.animationFrame
    ) {

        cancelAnimationFrame(
            Cake.animationFrame
        );


        Cake.animationFrame =
            null;

    }


    /*
     * Remove microphone stream.
     */

    if (
        Cake.stream
    ) {

        Cake.stream
            .getTracks()
            .forEach(
                track => {

                    try {

                        track.stop();

                    } catch {

                        /*
                         * Ignore track cleanup errors.
                         */

                    }

                }
            );

    }


    /*
     * Disconnect audio nodes.
     */

    if (
        Cake.microphone
    ) {

        try {

            Cake.microphone.disconnect();

        } catch {

            /*
             * Ignore disconnect errors.
             */

        }

    }


    if (
        Cake.analyser
    ) {

        try {

            Cake.analyser.disconnect();

        } catch {

            /*
             * Ignore disconnect errors.

             */

        }

    }


    /*
     * Close AudioContext.
     */

    if (
        Cake.audioContext
    ) {

        try {

            const closingContext =
                Cake.audioContext.close();


            if (
                closingContext &&
                typeof closingContext.catch ===
                "function"
            ) {

                closingContext.catch(
                    () => {}
                );

            }

        } catch {

            /*
             * Ignore AudioContext cleanup errors.
             */

        }

    }


    Cake.stream =
        null;

    Cake.microphone =
        null;

    Cake.analyser =
        null;

    Cake.audioContext =
        null;


    Cake.blowFrames =
        0;

    Cake.blowCooldown =
        false;


    const button =
        cakeGet("cake-mic-button");


    if (button) {

        button.classList.remove(
            "is-listening"
        );

    }

}


/* =========================================================
   RESET
========================================================= */

/*
 * Optional helper for testing.
 *
 * This lets you reset the cake without refreshing
 * the entire page.
 */

function resetCake() {

    stopCakeMicrophone();


    Cake.extinguished =
        0;


    Cake.blowCooldown =
        false;


    Cake.lastVolume =
        0;


    Cake.noiseFloor =
        0;


    Cake.blowStrength =
        0;


    Cake.blowFrames =
        0;


    Cake.completed =
        false;


    createCakeCandles();

    updateCakeCounter();


    const finale =
        cakeGet("cake-finale");


    if (finale) {

        finale.classList.remove(
            "is-visible"
        );

        finale.style.opacity = "0";
        finale.style.visibility = "hidden";

        finale.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.classList.remove(
        "cake-finale-active"
    );

    const overlay =
        document.querySelector(
            ".cake-finale-overlay"
        );

    if (overlay) {
        overlay.remove();
    }


    const status =
        cakeGet("cake-mic-status");


    if (status) {

        status.textContent =
            "🎂 اضغطي على أي شمعة لإطفائها ❤️";

    }

}


/* =========================================================
   INIT
========================================================= */

function initCake() {

    if (
        Cake.initialized
    ) {

        return;

    }


    /*
     * Only initialize when the cake exists.
     */

    const container =
        cakeGet("cake-candles");


    if (!container) {

        return;

    }


    createCakeCandles();

    updateCakeCounter();


    const button =
        cakeGet("cake-mic-button");


    if (button) {

        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.style.display = "none";

        button.removeEventListener(
            "click",
            startCakeMicrophone
        );

        button.setAttribute(
            "aria-label",
            "إطفاء الشموع بالنقر"
        );

    }

    const status =
        cakeGet("cake-mic-status");

    if (status) {
        status.textContent =
            "اضغطي على أي شمعة للإطفاء ❤️";
    }


    Cake.initialized =
        true;

}


/* =========================================================
   PUBLIC API
========================================================= */

window.initCake =
    initCake;


window.startCakeMicrophone =
    startCakeMicrophone;


window.stopCakeMicrophone =
    stopCakeMicrophone;


window.resetCake =
    resetCake;


/* =========================================================
   AUTO INIT
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initCake,
        {
            once: true
        }
    );

} else {

    initCake();

}


/* =========================================================
   END OF CAKE.JS
========================================================= */