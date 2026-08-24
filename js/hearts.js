/*=========================================================
    hearts.js PRO v5.0
    Premium Floating Hearts Engine
    Performance / Randomization / Visibility / Cleanup
=========================================================*/

"use strict";


/*=========================================================
DEFAULT CONFIG
=========================================================*/

const HeartsConfig = {

    enabled: true,

    amount: 30,

    speedMin: 0.4,

    speedMax: 1.2,

    interval: 2200,

    sizeMin: 12,

    sizeMax: 30,

    opacityMin: 0.35,

    opacityMax: 0.9,

    driftMin: -35,

    driftMax: 35,

    rotationMin: -35,

    rotationMax: 35,

    lifetimeMin: 6500,

    lifetimeMax: 11000,

    maxActive: 45,

    colors: [

        "#ff4d8d",
        "#ff6fa3",
        "#ff8fb8",
        "#ffb3cc",
        "#ffffff"

    ]

};


/*=========================================================
LOAD PROJECT CONFIG
=========================================================*/

async function loadHeartsConfig(){

    try{

        const module =
            await import("./config.js");


        if(
            module &&
            module.CONFIG &&
            module.CONFIG.hearts
        ){

            Object.assign(
                HeartsConfig,
                module.CONFIG.hearts
            );

        }

    }catch(error){

        console.warn(
            "Hearts configuration could not be loaded. Using defaults.",
            error
        );

    }

}


/*=========================================================
ENGINE STATE
=========================================================*/

const Hearts = {

    container: null,

    timer: null,

    active: new Set(),

    initialized: false,

    initializing: false,

    reducedMotion: false,

    paused: false,

    visibilityHandler: null,

    resizeHandler: null,

    resizeTimer: null,

    generated: 0

};


/*=========================================================
GET CONTAINER
=========================================================*/

function getHeartsContainer(){

    let container =
        document.querySelector(
            ".hearts-container"
        );


    if(
        container
    ){

        return container;

    }


    container =
        document.createElement(
            "div"
        );


    container.className =
        "hearts-container";


    container.setAttribute(
        "aria-hidden",
        "true"
    );


    container.style.pointerEvents =
        "none";


    document.body.appendChild(
        container
    );


    return container;

}


/*=========================================================
RANDOM
=========================================================*/

function randomBetween(
    min,
    max
){

    return (
        Math.random() *
        (
            max - min
        )
    ) + min;

}


function randomInt(
    min,
    max
){

    return Math.floor(
        randomBetween(
            min,
            max + 1
        )
    );

}


/*=========================================================
CLAMP
=========================================================*/

function clamp(
    value,
    min,
    max
){

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


/*=========================================================
REDUCED MOTION
=========================================================*/

function prefersReducedMotion(){

    if(
        typeof window ===
        "undefined" ||
        typeof window.matchMedia !==
        "function"
    ){

        return false;

    }


    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

}


/*=========================================================
CREATE HEART
=========================================================*/

function createHeart(){

    if(
        !Hearts.container ||
        Hearts.paused ||
        document.hidden
    ){

        return null;

    }


    const maxActive =
        Math.max(
            1,
            Number(
                HeartsConfig.maxActive
            ) || 45
        );


    if(
        Hearts.active.size >=
        maxActive
    ){

        return null;

    }


    const heart =
        document.createElement(
            "span"
        );


    heart.className =
        "floating-heart";


    heart.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
     * Random visual properties.
     */

    const size =
        randomBetween(
            Number(
                HeartsConfig.sizeMin
            ) || 12,
            Number(
                HeartsConfig.sizeMax
            ) || 30
        );


    const opacity =
        randomBetween(
            Number(
                HeartsConfig.opacityMin
            ) || 0.35,
            Number(
                HeartsConfig.opacityMax
            ) || 0.9
        );


    const left =
        randomBetween(
            0,
            100
        );


    const drift =
        randomBetween(
            Number(
                HeartsConfig.driftMin
            ) || -35,
            Number(
                HeartsConfig.driftMax
            ) || 35
        );


    const rotation =
        randomBetween(
            Number(
                HeartsConfig.rotationMin
            ) || -35,
            Number(
                HeartsConfig.rotationMax
            ) || 35
        );


    const speed =
        randomBetween(
            Number(
                HeartsConfig.speedMin
            ) || 0.4,
            Number(
                HeartsConfig.speedMax
            ) || 1.2
        );


    const lifetime =
        randomBetween(
            Number(
                HeartsConfig.lifetimeMin
            ) || 6500,
            Number(
                HeartsConfig.lifetimeMax
            ) || 11000
        );


    const color =
        HeartsConfig.colors[
            randomInt(
                0,
                HeartsConfig.colors.length - 1
            )
        ];


    heart.textContent =
        "❤";


    heart.style.left =
        `${left}%`;


    heart.style.fontSize =
        `${size}px`;


    heart.style.opacity =
        String(
            opacity
        );


    heart.style.color =
        color;


    heart.style.setProperty(
        "--heart-drift",
        `${drift}px`
    );


    heart.style.setProperty(
        "--heart-rotation",
        `${rotation}deg`
    );


    heart.style.setProperty(
        "--heart-duration",
        `${lifetime / speed}ms`
    );


    heart.style.setProperty(
        "--heart-size",
        `${size}px`
    );


    /*
     * Use Web Animations API when available.
     */

    Hearts.container.appendChild(
        heart
    );


    Hearts.active.add(
        heart
    );


    Hearts.generated++;


    animateHeart(
        heart,
        lifetime
    );


    return heart;

}


/*=========================================================
ANIMATE HEART
=========================================================*/

function animateHeart(
    heart,
    lifetime
){

    if(
        !heart
    ){

        return;

    }


    if(
        Hearts.reducedMotion
    ){

        /*
         * Reduced-motion mode keeps the element
         * static for a very short period.
         */

        const timeout =
            window.setTimeout(
                () => {

                    removeHeart(
                        heart
                    );

                },
                1200
            );


        heart._heartTimeout =
            timeout;


        return;

    }


    if(
        typeof heart.animate ===
        "function"
    ){

        const drift =
            heart.style.getPropertyValue(
                "--heart-drift"
            ) ||
            "0px";


        const rotation =
            heart.style.getPropertyValue(
                "--heart-rotation"
            ) ||
            "0deg";


        const animation =
            heart.animate(

                [

                    {

                        transform:
                            "translate3d(0, 30px, 0) scale(.5) rotate(0deg)",

                        opacity:
                            0

                    },

                    {

                        transform:
                            `translate3d(
                                ${drift},
                                -25vh,
                                0
                            )
                            scale(1)
                            rotate(${rotation})`,

                        opacity:
                            0.8

                    },

                    {

                        transform:
                            `translate3d(
                                calc(${drift} * 1.5),
                                -110vh,
                                0
                            )
                            scale(.7)
                            rotate(${rotation})`,

                        opacity:
                            0

                    }

                ],

                {

                    duration:
                        lifetime,

                    easing:
                        "linear",

                    fill:
                        "forwards"

                }

            );


        heart._heartAnimation =
            animation;


        animation.onfinish =
            () => {

                removeHeart(
                    heart
                );

            };


        animation.oncancel =
            () => {

                removeHeart(
                    heart
                );

            };


        return;

    }


    /*
     * Fallback for browsers without Web Animations API.
     */

    heart.style.animation =
        `heartFloat ${lifetime}ms linear forwards`;


    heart._heartTimeout =
        window.setTimeout(
            () => {

                removeHeart(
                    heart
                );

            },
            lifetime + 100
        );

}


/*=========================================================
REMOVE HEART
=========================================================*/

function removeHeart(
    heart
){

    if(
        !heart
    ){

        return;

    }


    if(
        heart._heartTimeout
    ){

        clearTimeout(
            heart._heartTimeout
        );


        heart._heartTimeout =
            null;

    }


    if(
        heart._heartAnimation
    ){

        try{

            heart._heartAnimation.cancel();

        }catch(error){

            /* Safe fallback. */

        }


        heart._heartAnimation =
            null;

    }


    Hearts.active.delete(
        heart
    );


    if(
        heart.parentNode
    ){

        heart.parentNode.removeChild(
            heart
        );

    }

}


/*=========================================================
SPAWN
=========================================================*/

function spawnHeart(){

    if(
        !Hearts.initialized ||
        Hearts.paused ||
        document.hidden ||
        !HeartsConfig.enabled
    ){

        return;

    }


    createHeart();

}


/*=========================================================
START TIMER
=========================================================*/

function startHeartsTimer(){

    stopHeartsTimer();


    if(
        !HeartsConfig.enabled ||
        Hearts.reducedMotion
    ){

        return;

    }


    const interval =
        Math.max(
            250,
            Number(
                HeartsConfig.interval
            ) || 2200
        );


    Hearts.timer =
        window.setInterval(
            spawnHeart,
            interval
        );

}


/*=========================================================
STOP TIMER
=========================================================*/

function stopHeartsTimer(){

    if(
        Hearts.timer !== null
    ){

        window.clearInterval(
            Hearts.timer
        );


        Hearts.timer =
            null;

    }

}


/*=========================================================
INITIAL BURST
=========================================================*/

function createInitialHearts(){

    if(
        Hearts.reducedMotion ||
        !HeartsConfig.enabled
    ){

        return;

    }


    const amount =
        clamp(
            Number(
                HeartsConfig.amount
            ) || 30,
            0,
            Number(
                HeartsConfig.maxActive
            ) || 45
        );


    /*
     * Spread creation over time instead of inserting
     * everything in a single frame.
     */

    let created =
        0;


    const burst =
        () => {

            if(
                created >= amount ||
                Hearts.paused ||
                document.hidden
            ){

                return;

            }


            createHeart();


            created++;


            if(
                created < amount
            ){

                window.setTimeout(
                    burst,
                    80
                );

            }

        };


    burst();

}


/*=========================================================
VISIBILITY
=========================================================*/

function handleVisibilityChange(){

    if(
        document.hidden
    ){

        Hearts.paused =
            true;


        stopHeartsTimer();


        return;

    }


    Hearts.paused =
        false;


    if(
        HeartsConfig.enabled
    ){

        startHeartsTimer();

    }

}


/*=========================================================
RESIZE
=========================================================*/

function handleResize(){

    /*
     * Debounce resize work.
     */

    if(
        Hearts.resizeTimer
    ){

        clearTimeout(
            Hearts.resizeTimer
        );

    }


    Hearts.resizeTimer =
        window.setTimeout(
            () => {

                Hearts.resizeTimer =
                    null;

                /*
                 * Nothing expensive is required here.
                 * Keeping this handler allows future
                 * responsive behavior without modifying
                 * the engine API.
                 */

            },
            150
        );

}


/*=========================================================
MEDIA QUERY CHANGE
=========================================================*/

function handleReducedMotionChange(){

    Hearts.reducedMotion =
        prefersReducedMotion();


    if(
        Hearts.reducedMotion
    ){

        stopHeartsTimer();


        /*
         * Remove currently animated hearts so that
         * reduced-motion preference takes effect
         * immediately.
         */

        clearHearts();

    }else if(
        HeartsConfig.enabled &&
        !document.hidden
    ){

        startHeartsTimer();

    }

}


/*=========================================================
BIND GLOBAL EVENTS
=========================================================*/

function bindGlobalEvents(){

    Hearts.visibilityHandler =
        handleVisibilityChange;


    document.addEventListener(
        "visibilitychange",
        Hearts.visibilityHandler
    );


    Hearts.resizeHandler =
        handleResize;


    window.addEventListener(
        "resize",
        Hearts.resizeHandler,
        {
            passive: true
        }
    );


    if(
        typeof window.matchMedia ===
        "function"
    ){

        const media =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        Hearts._motionMedia =
            media;


        if(
            typeof media.addEventListener ===
            "function"
        ){

            media.addEventListener(
                "change",
                handleReducedMotionChange
            );

        }else if(
            typeof media.addListener ===
            "function"
        ){

            media.addListener(
                handleReducedMotionChange
            );

        }

    }

}


/*=========================================================
UNBIND GLOBAL EVENTS
=========================================================*/

function unbindGlobalEvents(){

    if(
        Hearts.visibilityHandler
    ){

        document.removeEventListener(
            "visibilitychange",
            Hearts.visibilityHandler
        );


        Hearts.visibilityHandler =
            null;

    }


    if(
        Hearts.resizeHandler
    ){

        window.removeEventListener(
            "resize",
            Hearts.resizeHandler
        );


        Hearts.resizeHandler =
            null;

    }


    const media =
        Hearts._motionMedia;


    if(
        media
    ){

        if(
            typeof media.removeEventListener ===
            "function"
        ){

            media.removeEventListener(
                "change",
                handleReducedMotionChange
            );

        }else if(
            typeof media.removeListener ===
            "function"
        ){

            media.removeListener(
                handleReducedMotionChange
            );

        }

    }


    Hearts._motionMedia =
        null;

}


/*=========================================================
CLEAR HEARTS
=========================================================*/

function clearHearts(){

    Array.from(
        Hearts.active
    )
    .forEach(
        heart => {

            removeHeart(
                heart
            );

        }
    );


    Hearts.active.clear();

}


/*=========================================================
PAUSE
=========================================================*/

function pauseHearts(){

    Hearts.paused =
        true;


    stopHeartsTimer();

}


/*=========================================================
RESUME
=========================================================*/

function resumeHearts(){

    if(
        !HeartsConfig.enabled
    ){

        return;

    }


    Hearts.paused =
        false;


    if(
        !document.hidden
    ){

        startHeartsTimer();

    }

}


/*=========================================================
SET ENABLED
=========================================================*/

function setHeartsEnabled(
    enabled
){

    HeartsConfig.enabled =
        Boolean(
            enabled
        );


    if(
        !HeartsConfig.enabled
    ){

        pauseHearts();

        clearHearts();

        return;

    }


    resumeHearts();

}


/*=========================================================
SET AMOUNT
=========================================================*/

function setHeartsAmount(
    amount
){

    const value =
        Math.max(
            0,
            Number(amount) || 0
        );


    HeartsConfig.amount =
        value;


    /*
     * Remove excess active hearts if the new
     * limit is lower than the current amount.
     */

    const maxActive =
        Math.max(
            value,
            Number(
                HeartsConfig.maxActive
            ) || 45
        );


    while(
        Hearts.active.size >
        maxActive
    ){

        const first =
            Hearts.active.values()
                .next()
                .value;


        if(
            !first
        ){

            break;

        }


        removeHeart(
            first
        );

    }

}


/*=========================================================
GET STATS
=========================================================*/

function getHeartsStats(){

    return {

        initialized:
            Hearts.initialized,

        paused:
            Hearts.paused,

        active:
            Hearts.active.size,

        generated:
            Hearts.generated,

        enabled:
            Boolean(
                HeartsConfig.enabled
            ),

        reducedMotion:
            Hearts.reducedMotion

    };

}


/*=========================================================
INIT
=========================================================*/

async function initHearts(){

    if(
        Hearts.initialized
    ){

        return;

    }


    if(
        Hearts.initializing
    ){

        return;

    }


    Hearts.initializing =
        true;


    try{

        await loadHeartsConfig();


        /*
         * If disabled, don't create unnecessary DOM.
         */

        if(
            !HeartsConfig.enabled
        ){

            return;

        }


        Hearts.reducedMotion =
            prefersReducedMotion();


        Hearts.container =
            getHeartsContainer();


        bindGlobalEvents();


        Hearts.initialized =
            true;


        if(
            Hearts.reducedMotion
        ){

            return;

        }


        createInitialHearts();


        startHeartsTimer();


    }finally{

        Hearts.initializing =
            false;

    }

}


/*=========================================================
DESTROY
=========================================================*/

function destroyHearts(){

    stopHeartsTimer();


    if(
        Hearts.resizeTimer
    ){

        clearTimeout(
            Hearts.resizeTimer
        );


        Hearts.resizeTimer =
            null;

    }


    clearHearts();


    unbindGlobalEvents();


    if(
        Hearts.container
    ){

        /*
         * Only remove the container generated by
         * this engine. Existing custom containers
         * remain untouched.
         */

        if(
            Hearts.container.dataset.generated ===
            "true"
        ){

            Hearts.container.remove();

        }

    }


    Hearts.container =
        null;


    Hearts.initialized =
        false;


    Hearts.initializing =
        false;


    Hearts.paused =
        false;


    Hearts.generated =
        0;

}


/*=========================================================
MARK GENERATED CONTAINER
=========================================================*/

function markGeneratedContainer(){

    if(
        Hearts.container
    ){

        if(
            !Hearts.container.dataset.generated
        ){

            Hearts.container.dataset.generated =
                "true";

        }

    }

}


/*=========================================================
PATCH CONTAINER CREATION
=========================================================*/

const originalGetHeartsContainer =
    getHeartsContainer;


/*
 * Ensure dynamically generated containers can be
 * safely removed during destroy().
 */

function ensureContainer(){

    const existing =
        document.querySelector(
            ".hearts-container"
        );


    if(
        existing
    ){

        Hearts.container =
            existing;

        return existing;

    }


    const container =
        originalGetHeartsContainer();


    Hearts.container =
        container;


    markGeneratedContainer();


    return container;

}


/*=========================================================
REINITIALIZE
=========================================================*/

async function refreshHearts(){

    destroyHearts();

    await initHearts();

}


/*=========================================================
PUBLIC API
=========================================================*/

window.initHearts =
    initHearts;


window.spawnHeart =
    spawnHeart;


window.pauseHearts =
    pauseHearts;


window.resumeHearts =
    resumeHearts;


window.clearHearts =
    clearHearts;


window.setHeartsEnabled =
    setHeartsEnabled;


window.setHeartsAmount =
    setHeartsAmount;


window.getHeartsStats =
    getHeartsStats;


window.destroyHearts =
    destroyHearts;


window.refreshHearts =
    refreshHearts;


/*=========================================================
AUTO INIT
=========================================================*/

async function autoInitializeHearts(){

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                /*
                 * Use the safe container resolver.
                 */

                ensureContainer();

                initHearts();

            },
            {
                once: true
            }
        );

        return;

    }


    ensureContainer();

    await initHearts();

}


autoInitializeHearts();


/*=========================================================
END OF HEARTS.JS
=========================================================*/