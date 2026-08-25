"use strict";

/* =========================================================
   CAKE.JS
   Interactive Birthday Cake
   Microphone Blow Detection
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

    totalCandles: 12,

    blowCooldown: false,

    lastVolume: 0,

    calibration: 0,

    completed: false

};


/* =========================================================
   ELEMENTS
========================================================= */

function cakeGet(id){

    return document.getElementById(id);

}


/* =========================================================
   CREATE CANDLES
========================================================= */

function createCakeCandles(){

    const container =
        cakeGet("cake-candles");

    if(!container){
        return;
    }

    container.replaceChildren();

    Cake.candles = [];

    for(
        let i = 0;
        i < Cake.totalCandles;
        i++
    ){

        const candle =
            document.createElement("div");

        candle.className =
            "cake-candle";

        candle.dataset.index =
            String(i);


        const flame =
            document.createElement("span");

        flame.className =
            "cake-flame";

        flame.innerHTML =
            `
            <span class="flame-inner"></span>
            `;


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


        Cake.candles.push(candle);

    }

}


/* =========================================================
   EXTINGUISH CANDLE
========================================================= */

function extinguishNextCandle(){

    if(
        Cake.completed ||
        Cake.extinguished >= Cake.totalCandles
    ){

        return;

    }


    const candle =
        Cake.candles[
            Cake.extinguished
        ];


    if(!candle){
        return;
    }


    candle.classList.add(
        "is-extinguished"
    );


    Cake.extinguished++;


    updateCakeCounter();


    createCandleSparkles(
        candle
    );


    if(
        Cake.extinguished >=
        Cake.totalCandles
    ){

        finishCake();

    }

}


/* =========================================================
   COUNTER
========================================================= */

function updateCakeCounter(){

    const counter =
        cakeGet("cake-counter");

    if(!counter){
        return;
    }


    counter.textContent =
        `${Cake.extinguished} / ${Cake.totalCandles}`;

}


/* =========================================================
   SPARKLES
========================================================= */

function createCandleSparkles(
    candle
){

    const rect =
        candle.getBoundingClientRect();


    for(
        let i = 0;
        i < 8;
        i++
    ){

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
            `${(Math.random() - .5) * 100}px`
        );

        particle.style.setProperty(
            "--spark-y",
            `${-30 - Math.random() * 80}px`
        );


        document.body.appendChild(
            particle
        );


        setTimeout(
            () => particle.remove(),
            1000
        );

    }

}


/* =========================================================
   MICROPHONE
========================================================= */

async function startCakeMicrophone(){

    if(
        Cake.microphoneActive
    ){

        return;

    }


    const status =
        cakeGet("cake-mic-status");

    const button =
        cakeGet("cake-mic-button");


    if(
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ){

        if(status){

            status.textContent =
                "المتصفح لا يدعم استخدام المايكروفون 😔";

        }

        return;

    }


    try{

        Cake.stream =
            await navigator.mediaDevices.getUserMedia({

                audio: {

                    echoCancellation: true,

                    noiseSuppression: true,

                    autoGainControl: false

                }

            });


        Cake.audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        Cake.analyser =
            Cake.audioContext.createAnalyser();


        Cake.analyser.fftSize =
            1024;


        Cake.analyser.smoothingTimeConstant =
            0.25;


        Cake.microphone =
            Cake.audioContext.createMediaStreamSource(
                Cake.stream
            );


        Cake.microphone.connect(
            Cake.analyser
        );


        Cake.microphoneActive =
            true;

        if(button){

            button.classList.add(
                "is-listening"
            );

        }


        if(status){

            status.textContent =
                "🎤 اسمعج... انفخي على الشموع بلطف ❤️";

        }


        monitorCakeBlow();


    }catch(error){

        console.warn(
            "Microphone permission failed:",
            error
        );


        if(status){

            status.textContent =
                "ما قدرت أوصل للمايكروفون. تأكدي من السماح بالوصول ❤️";

        }

    }

}


/* =========================================================
   MONITOR BLOW
========================================================= */

function monitorCakeBlow(){

    if(
        !Cake.microphoneActive ||
        !Cake.analyser
    ){

        return;

    }


    const buffer =
        new Uint8Array(
            Cake.analyser.fftSize
        );


    function analyze(){

        if(
            !Cake.microphoneActive
        ){

            return;

        }


        Cake.analyser.getByteTimeDomainData(
            buffer
        );


        let sum = 0;


        for(
            let i = 0;
            i < buffer.length;
            i++
        ){

            const value =
                (
                    buffer[i] -
                    128
                ) / 128;


            sum +=
                value * value;

        }


        const rms =
            Math.sqrt(
                sum / buffer.length
            );


        /*
         * Convert to readable percentage.
         */

        const volume =
            Math.min(
                1,
                rms * 4
            );


        Cake.lastVolume =
            volume;


        updateCakeVolume(
            volume
        );


        /*
         * Blow detection.
         *
         * Normal speaking:
         * approximately low/moderate RMS.
         *
         * A close microphone blow:
         * produces a sudden strong signal.
         */

        const blowThreshold =
            0.22;


        const suddenIncrease =
            volume >
            Cake.lastVolume + 0.08;


        if(
            volume >
            blowThreshold &&
            !Cake.blowCooldown
        ){

            detectCakeBlow();

        }


        requestAnimationFrame(
            analyze
        );

    }


    analyze();

}


/* =========================================================
   BLOW DETECTED
========================================================= */

function detectCakeBlow(){

    if(
        Cake.blowCooldown ||
        Cake.completed
    ){

        return;

    }


    Cake.blowCooldown =
        true;


    extinguishNextCandle();


    /*
     * Prevent multiple candles from
     * disappearing from one long blow.
     */

    setTimeout(
        () => {

            Cake.blowCooldown =
                false;

        },
        750
    );

}


/* =========================================================
   VOLUME UI
========================================================= */

function updateCakeVolume(
    volume
){

    const bar =
        cakeGet("cake-volume-bar");

    if(!bar){
        return;
    }


    const fill =
        bar.querySelector("span");

    if(!fill){
        return;
    }


    fill.style.width =
        `${Math.round(volume * 100)}%`;

}


/* =========================================================
   FINISH
========================================================= */

function finishCake(){

    Cake.completed =
        true;


    const status =
        cakeGet("cake-mic-status");


    if(status){

        status.textContent =
            "🥹❤️ أمنيتج تحققت...";

    }


    const finale =
        cakeGet("cake-finale");


    if(finale){

        finale.setAttribute(
            "aria-hidden",
            "false"
        );


        finale.classList.add(
            "is-visible"
        );

    }


    createFinalCakeParticles();


    stopCakeMicrophone();

}


/* =========================================================
   FINAL PARTICLES
========================================================= */

function createFinalCakeParticles(){

    for(
        let i = 0;
        i < 40;
        i++
    ){

        setTimeout(
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
                    `${(Math.random() - .5) * 200}px`
                );


                document.body.appendChild(
                    particle
                );


                setTimeout(
                    () => particle.remove(),
                    4000
                );

            },
            i * 70
        );

    }

}


/* =========================================================
   STOP MICROPHONE
========================================================= */

function stopCakeMicrophone(){

    Cake.microphoneActive =
        false;


    if(Cake.stream){

        Cake.stream
            .getTracks()
            .forEach(
                track => track.stop()
            );

    }


    if(Cake.audioContext){

        Cake.audioContext.close()
            .catch(
                () => {}
            );

    }


    Cake.stream =
        null;

}


/* =========================================================
   INIT
========================================================= */

function initCake(){

    if(
        Cake.initialized
    ){

        return;

    }


    createCakeCandles();

    updateCakeCounter();


    const button =
        cakeGet("cake-mic-button");


    if(button){

        button.addEventListener(
            "click",
            startCakeMicrophone
        );

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


/* =========================================================
   AUTO INIT
========================================================= */

if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initCake,
        {
            once: true
        }
    );

}else{

    initCake();

}