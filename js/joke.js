"use strict";

/*=========================================================
    joke.js PRO v2.0
    Love Question Interaction Engine
    Premium Interactive Experience
=========================================================*/


/*=========================================================
CONFIG
=========================================================*/

const JokeConfig = {

    maxNoAttempts: 8,

    particleCount: 120,

    particleLifetime: 6500,

    messageDelay: 0,

    escapeEnabled: true,

    buttonPlayfulness: true,

    celebration: true,

    sounds: true,

    autoReveal: true,

    symbols: [

        "❤️",
        "💕",
        "💖",
        "💗",
        "💓",
        "🌹",
        "✨",
        "💫",
        "🦋",
        "🎉"

    ]

};


/*=========================================================
LOAD PROJECT CONFIG
=========================================================*/

async function loadJokeConfig(){

    try{

        const module =
            await import("./config.js");


        if(
            module &&
            module.CONFIG
        ){

            /*
             * Respect the global effects configuration
             * when available.
             */

            if(
                module.CONFIG.effects
            ){

                JokeConfig.celebration =
                    module.CONFIG.effects.confetti !== false;

            }

        }

    }catch(error){

        console.warn(
            "Joke configuration could not be loaded. Using defaults.",
            error
        );

    }

}


/*=========================================================
MESSAGES
=========================================================*/

const noMsgs = [

    "نو نو حاول مرا اخرى 🥺❤️",

    "اه متأكدة ولج ؟ 😢❤️",

    "فكري مرة ثانية حنتوشتييي 🥹",

    "ولج خبلة 💔",

    "عود صدكككك ؟؟؟؟؟؟؟؟😭❤️",

    "راح اطيح حظجججج!!!!! 😡😡😡😡",

    "يلا كدامي دوسي نعم 🥹❤️",

    "يلاااا ولججج حنتوشتيييي 😭❤️"

];


/*=========================================================
STATE
=========================================================*/

const Joke = {

    noCount: 0,

    maxNoCount: noMsgs.length,

    celebrationStarted: false,

    initialized: false,

    particles: new Set(),

    timers: new Set(),

    reducedMotion: false,

    originalQuestionHTML: null,

    originalNoButtonText: null,

    originalNoButtonDisplay: null,

    originalYesButtonClass: null,

    lastNoMessage: -1,

    audioContext: null

};


/*=========================================================
HELPERS
=========================================================*/

function getElement(id){

    return document.getElementById(id);

}


function prefersReducedMotion(){

    return (

        typeof window !== "undefined" &&

        typeof window.matchMedia === "function" &&

        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

    );

}


/*=========================================================
TIMER MANAGEMENT
=========================================================*/

function addTimer(
    callback,
    delay
){

    const timer =
        window.setTimeout(
            () => {

                Joke.timers.delete(
                    timer
                );

                callback();

            },
            delay
        );


    Joke.timers.add(
        timer
    );


    return timer;

}


function clearJokeTimers(){

    Joke.timers.forEach(
        timer => {

            window.clearTimeout(
                timer
            );

        }
    );


    Joke.timers.clear();

}


/*=========================================================
PARTICLE CLEANUP
=========================================================*/

function removeParticle(
    particle
){

    if(
        !particle
    ){

        return;

    }


    if(
        particle.parentNode
    ){

        particle.remove();

    }


    Joke.particles.delete(
        particle
    );

}


/*=========================================================
CLEAR PARTICLES
=========================================================*/

function clearParticles(){

    Joke.particles.forEach(
        particle => {

            removeParticle(
                particle
            );

        }
    );


    Joke.particles.clear();

}


/*=========================================================
QUESTION ELEMENT
=========================================================*/

function updateQuestion(
    message
){

    const question =
        getElement(
            "question-text"
        );


    if(
        !question
    ){

        /*
         * The current design shows the playful
         * replies inside the feedback line.
         */

        const feedback =
            getElement(
                "no-message"
            );

        if(
            feedback
        ){

            feedback.textContent =
                message;

            feedback.setAttribute(
                "aria-live",
                "polite"
            );

        }

        return;

    }


    /*
     * Avoid innerHTML for dynamic text.
     */

    question.replaceChildren();


    const title =
        document.createElement(
            "span"
        );


    title.className =
        "joke-question-title";


    title.textContent =
        "❤️ غدير ❤️";


    const line =
        document.createElement(
            "br"
        );


    const text =
        document.createElement(
            "span"
        );


    text.className =
        "joke-question-message";


    text.textContent =
        message;


    question.append(
        title,
        line,
        text
    );


    question.setAttribute(
        "aria-live",
        "polite"
    );

}


/*=========================================================
GET RANDOM MESSAGE
=========================================================*/

function getNoMessage(){

    if(
        noMsgs.length === 0
    ){
        return "هل تحبيني؟ ❤️";
    }

    const index =
        Joke.noCount - 1;

    Joke.lastNoMessage =
        index;

    return noMsgs[index];
}


/*=========================================================
NO BUTTON SHAKE
=========================================================*/

function animateNoButton(){

    const button =
        getElement(
            "no-btn"
        );


    if(
        !button ||
        Joke.reducedMotion ||
        typeof button.animate !==
        "function"
    ){

        return;

    }


    button.animate(

        [

            {
                transform:
                    "translateX(0) rotate(0deg) scale(1)"
            },

            {
                transform:
                    "translateX(-8px) rotate(-2deg) scale(.96)"
            },

            {
                transform:
                    "translateX(8px) rotate(2deg) scale(1.04)"
            },

            {
                transform:
                    "translateX(-5px) rotate(-1deg) scale(1)"
            },

            {
                transform:
                    "translateX(5px) rotate(1deg)"
            },

            {
                transform:
                    "translateX(0) rotate(0deg) scale(1)"
            }

        ],

        {

            duration:
                420,

            easing:
                "cubic-bezier(.22,.61,.36,1)"

        }

    );

}


/*=========================================================
PLAYFUL NO BUTTON
=========================================================*/

function moveNoButton(){

    if(
        !JokeConfig.buttonPlayfulness ||
        Joke.reducedMotion
    ){

        return;

    }


    const button =
        getElement(
            "no-btn"
        );


    if(
        !button
    ){

        return;

    }


    /*
     * Keep the movement small so the button remains
     * usable and doesn't escape the screen.
     */

    const x =
        (
            Math.random() - 0.5
        ) * 50;


    const y =
        (
            Math.random() - 0.5
        ) * 24;


    if(
        typeof button.animate ===
        "function"
    ){

        button.animate(

            [

                {
                    transform:
                        "translate(0,0)"
                },

                {
                    transform:
                        `translate(${x}px,${y}px)`
                },

                {
                    transform:
                        "translate(0,0)"
                }

            ],

            {

                duration:
                    550,

                easing:
                    "cubic-bezier(.22,.61,.36,1)"

            }

        );

    }

}


/*=========================================================
YES BUTTON EFFECT
=========================================================*/

function highlightYesButton(){

    const yesButton =
        document.querySelector(
            ".btn-yes"
        );


    if(
        !yesButton
    ){

        return;

    }


    yesButton.classList.add(
        "pulse-big"
    );


    yesButton.setAttribute(
        "aria-label",
        "نعم ❤️"
    );


    yesButton.setAttribute(
        "aria-pressed",
        "true"
    );


    if(
        Joke.reducedMotion ||
        typeof yesButton.animate !==
        "function"
    ){

        return;

    }


    yesButton.animate(

        [

            {
                transform:
                    "scale(1)"
            },

            {
                transform:
                    "scale(1.12)"
            },

            {
                transform:
                    "scale(.98)"
            },

            {
                transform:
                    "scale(1.08)"
            },

            {
                transform:
                    "scale(1)"
            }

        ],

        {

            duration:
                1200,

            easing:
                "ease-in-out"

        }

    );

}


/*=========================================================
NO BUTTON
=========================================================*/

function handleNo(){

    if(
        Joke.celebrationStarted
    ){

        return;

    }


    const noButton =
        getElement(
            "no-btn"
        );


    if(
        !noButton
    ){

        return;

    }


    if(
        Joke.noCount >=
        Joke.maxNoCount
    ){

        return;

    }


    Joke.noCount++;


    const message =
        getNoMessage();


    updateQuestion(
        message
    );


    animateNoButton();


    /*
     * Small playful movement.
     */

    if(
        Joke.noCount <
        Joke.maxNoCount
    ){

        moveNoButton();

    }


    /*
     * Final attempt.
     */

    if(
        Joke.noCount >=
        Joke.maxNoCount
    ){

        finishNoAttempts();

    }

}


/*=========================================================
FINAL NO ATTEMPT
=========================================================*/

function finishNoAttempts(){

    const noButton =
        getElement(
            "no-btn"
        );


    if(
        !noButton
    ){

        return;

    }


    updateQuestion(
        "هععع غصبا عليج هسه تدوسين نعم 🥹❤️"
    );


    noButton.disabled =
        true;


    noButton.setAttribute(
        "aria-disabled",
        "true"
    );


    if(
        Joke.reducedMotion
    ){

        noButton.style.opacity =
            "0.5";

    }else{

        noButton.animate(

            [

                {
                    opacity:
                        1,

                    transform:
                        "scale(1)"
                },

                {
                    opacity:
                        0,

                    transform:
                        "scale(.7) rotate(-10deg)"
                }

            ],

            {

                duration:
                    650,

                easing:
                    "ease-in",

                fill:
                    "forwards"

            }

        );


        addTimer(
            () => {

                if(
                    noButton.parentNode
                ){

                    noButton.style.display =
                        "none";

                }

            },
            600
        );

    }


    highlightYesButton();

}


/*=========================================================
YES BUTTON
=========================================================*/

function handleYes(){

    if(
        Joke.celebrationStarted
    ){

        return;

    }


    Joke.celebrationStarted =
        true;


    clearJokeTimers();


    const celebration =
        getElement(
            "celebration"
        );


    if(
        celebration
    ){

        celebration.setAttribute(
            "aria-hidden",
            "false"
        );


        /*
         * The stylesheet reveals the overlay
         * through the is-active class.
         */

        requestAnimationFrame(
            () => {

                celebration.classList.add(
                    "is-active"
                );

            }
        );

    }


    highlightYesButton();


    if(
        JokeConfig.celebration &&
        !Joke.reducedMotion
    ){

        createCelebrationParticles();

    }


    revealCelebrationContent();


    playCelebrationSound();

}


/*=========================================================
CREATE CELEBRATION PARTICLES
=========================================================*/

function createCelebrationParticles(){

    const count =
        Math.max(
            20,
            Number(
                JokeConfig.particleCount
            ) || 120
        );


    for(
        let i = 0;
        i < count;
        i++
    ){

        addTimer(

            () => {

                createParticle();

            },

            i * 25

        );

    }

}


/*=========================================================
CREATE PARTICLE
=========================================================*/

function createParticle(){

    const particle =
        document.createElement(
            "span"
        );


    particle.className =
        "cel";


    const symbols =
        JokeConfig.symbols;


    particle.textContent =
        symbols[
            Math.floor(
                Math.random() *
                symbols.length
            )
        ];


    particle.setAttribute(
        "aria-hidden",
        "true"
    );


    const startX =
        Math.random() * 100;


    const startY =
        80 +
        Math.random() * 25;


    const endX =
        (
            Math.random() -
            0.5
        ) *
        280;


    const endY =
        -(
            180 +
            Math.random() *
            450
        );


    const rotation =
        (
            Math.random() -
            0.5
        ) *
        720;


    const size =
        14 +
        Math.random() *
        30;


    const duration =
        3500 +
        Math.random() *
        3000;


    particle.style.position =
        "fixed";


    particle.style.left =
        `${startX}vw`;


    particle.style.top =
        `${startY}vh`;


    particle.style.fontSize =
        `${size}px`;


    particle.style.pointerEvents =
        "none";


    particle.style.zIndex =
        "99999";


    particle.style.setProperty(
        "--cel-x",
        `${endX}px`
    );


    particle.style.setProperty(
        "--cel-y",
        `${endY}px`
    );


    particle.style.setProperty(
        "--cel-r",
        `${rotation}deg`
    );


    document.body.appendChild(
        particle
    );


    Joke.particles.add(
        particle
    );


    /*
     * Prefer CSS animation when available.
     */

    if(
        typeof particle.animate ===
        "function"
    ){

        const animation =
            particle.animate(

                [

                    {

                        transform:
                            "translate3d(0,0,0) scale(.4) rotate(0deg)",

                        opacity:
                            0

                    },

                    {

                        opacity:
                            1

                    },

                    {

                        transform:
                            `translate3d(${endX}px,${endY}px,0)
                             scale(1)
                             rotate(${rotation}deg)`,

                        opacity:
                            0

                    }

                ],

                {

                    duration,

                    easing:
                        "cubic-bezier(.22,.61,.36,1)",

                    fill:
                        "forwards"

                }

            );


        animation.finished
            .then(
                () => {

                    removeParticle(
                        particle
                    );

                }
            )
            .catch(
                () => {

                    removeParticle(
                        particle
                    );

                }
            );

    }else{

        addTimer(

            () => {

                removeParticle(
                    particle
                );

            },

            JokeConfig.particleLifetime

        );

    }

}


/*=========================================================
CELEBRATION CONTENT
=========================================================*/

function revealCelebrationContent(){

    if(
        !JokeConfig.autoReveal
    ){

        return;

    }


    const ids = [

        "cel-1",
        "cel-2",
        "cel-3",
        "cel-4",
        "cel-5"

    ];


    const delays = [

        500,
        1800,
        3200,
        4800,
        6500

    ];


    ids.forEach(
        (id,index) => {

            const delay =
                Joke.reducedMotion
                    ? 0
                    : delays[index];


            addTimer(

                () => {

                    revealJokeElement(
                        getElement(id)
                    );

                },

                delay

            );

        }
    );

}


/*=========================================================
REVEAL ELEMENT
=========================================================*/

function revealJokeElement(
    element
){

    if(
        !element
    ){

        return;

    }


    element.style.opacity =
        "1";


    element.setAttribute(
        "aria-hidden",
        "false"
    );


    if(
        Joke.reducedMotion ||
        typeof element.animate !==
        "function"
    ){

        return;

    }


    element.animate(

        [

            {

                opacity:
                    0,

                transform:
                    "translateY(24px) scale(.92)"

            },

            {

                opacity:
                    1,

                transform:
                    "translateY(0) scale(1)"

            }

        ],

        {

            duration:
                750,

            easing:
                "cubic-bezier(.22,.61,.36,1)",

            fill:
                "forwards"

        }

    );

}


/*=========================================================
CELEBRATION SOUND
=========================================================*/

function playCelebrationSound(){

    if(
        !JokeConfig.sounds ||
        Joke.reducedMotion
    ){

        return;

    }


    /*
     * Web Audio is optional.
     * It gracefully fails when autoplay/user gesture
     * restrictions prevent it.
     */

    try{

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if(
            !AudioContext
        ){

            return;

        }


        if(
            !Joke.audioContext
        ){

            Joke.audioContext =
                new AudioContext();

        }


        const context =
            Joke.audioContext;


        if(
            context.state ===
            "suspended"
        ){

            context.resume()
                .catch(
                    () => {}
                );

        }


        const now =
            context.currentTime;


        const notes = [

            523.25,
            659.25,
            783.99

        ];


        notes.forEach(
            (frequency,index) => {

                const oscillator =
                    context.createOscillator();


                const gain =
                    context.createGain();


                oscillator.type =
                    "sine";


                oscillator.frequency.value =
                    frequency;


                gain.gain.setValueAtTime(
                    0,
                    now +
                    index * 0.08
                );


                gain.gain.linearRampToValueAtTime(
                    0.08,
                    now +
                    index * 0.08 +
                    0.02
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now +
                    index * 0.08 +
                    0.35
                );


                oscillator.connect(
                    gain
                );


                gain.connect(
                    context.destination
                );


                oscillator.start(
                    now +
                    index * 0.08
                );


                oscillator.stop(
                    now +
                    index * 0.08 +
                    0.4
                );

            }
        );

    }catch(error){

        /*
         * Sound is an enhancement only.
         */

    }

}


/*=========================================================
CLOSE CELEBRATION
=========================================================*/

function closeCelebration(){

    const celebration =
        getElement(
            "celebration"
        );


    if(
        !celebration
    ){

        return;

    }


    celebration.classList.remove(
        "is-active"
    );


    celebration.setAttribute(
        "aria-hidden",
        "true"
    );


    clearParticles();

}


/*=========================================================
RESET
=========================================================*/

function resetJoke(){

    clearJokeTimers();


    clearParticles();


    Joke.noCount =
        0;


    Joke.celebrationStarted =
        false;


    Joke.lastNoMessage =
        -1;


    const noButton =
        getElement(
            "no-btn"
        );


    if(
        noButton
    ){

        noButton.disabled =
            false;


        noButton.style.display =
            Joke.originalNoButtonDisplay ||
            "";


        noButton.style.opacity =
            "";


        noButton.style.transform =
            "";


        noButton.removeAttribute(
            "aria-disabled"
        );

    }


    const yesButton =
        document.querySelector(
            ".btn-yes"
        );


    if(
        yesButton
    ){

        yesButton.classList.remove(
            "pulse-big"
        );


        yesButton.removeAttribute(
            "aria-pressed"
        );

    }


    const question =
        getElement(
            "question-text"
        );


    if(
        question &&
        Joke.originalQuestionHTML !==
        null
    ){

        question.innerHTML =
            Joke.originalQuestionHTML;

    }


    closeCelebration();

}


/*=========================================================
KEYBOARD SUPPORT
=========================================================*/

function handleKeyboard(
    event
){

    if(
        !JokeConfig.escapeEnabled
    ){

        return;

    }


    if(
        event.key ===
        "Escape"
    ){

        const celebration =
            getElement(
                "celebration"
            );


        if(
            celebration &&
            celebration.getAttribute(
                "aria-hidden"
            ) === "false"
        ){

            event.preventDefault();


            closeCelebration();

        }

    }

}


/*=========================================================
INITIALIZE
=========================================================*/

async function initJoke(){

    if(
        Joke.initialized
    ){

        return;

    }


    await loadJokeConfig();


    Joke.reducedMotion =
        prefersReducedMotion();


    const question =
        getElement(
            "question-text"
        );


    const noButton =
        getElement(
            "no-btn"
        );


    if(
        question
    ){

        Joke.originalQuestionHTML =
            question.innerHTML;

    }


    if(
        noButton
    ){

        Joke.originalNoButtonText =
            noButton.textContent;


        Joke.originalNoButtonDisplay =
            noButton.style.display;

    }


    const celebration =
        getElement(
            "celebration"
        );


    if(
        celebration
    ){

        celebration.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    const yesButton =
        getElement(
            "yes-btn"
        );


    if(
        yesButton
    ){

        yesButton.addEventListener(
            "click",
            handleYes
        );

    }


    if(
        noButton
    ){

        noButton.addEventListener(
            "click",
            handleNo
        );

    }


    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    Joke.initialized =
        true;

}


/*=========================================================
PUBLIC API
=========================================================*/

window.handleNo =
    handleNo;


window.handleYes =
    handleYes;


window.resetJoke =
    resetJoke;


window.closeJokeCelebration =
    closeCelebration;


window.initJoke =
    initJoke;


/*=========================================================
AUTO INIT
=========================================================*/

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initJoke();

        },
        {
            once: true
        }
    );

}else{

    initJoke();

}


/*=========================================================
END OF JOKE.JS PRO
=========================================================*/