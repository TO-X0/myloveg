/* =========================================================
   ❤️ إلى غدير ❤️
   VERSION 2.0 — DIGITAL LOVE EXPERIENCE

   FILE: js/animations.js

   Animation System
   ─────────────────────────────────────────────────────────
   • Scroll reveal
   • Ambient stars
   • Aurora motion
   • Shooting stars
   • Floating hearts
   • Cursor glow
   • Magnetic buttons
   • Mouse tilt
   • Lightweight parallax
   • Letter reveal
   • Scroll progress
   • Page visibility optimization
   • Reduced-motion support
   • Touch/mobile optimization
   • IntersectionObserver
   • requestAnimationFrame
   • Central cleanup engine
   ========================================================= */

"use strict";

/* =========================================================
   01. ENVIRONMENT
   ========================================================= */

const MOTION_REDUCED =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

const FINE_POINTER =
    window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );

const TOUCH_DEVICE =
    window.matchMedia(
        "(hover: none), (pointer: coarse)"
    );

const SMALL_SCREEN =
    window.matchMedia(
        "(max-width: 768px)"
    );


/* =========================================================
   02. ANIMATION CONFIGURATION
   ========================================================= */

const ANIMATION_CONFIG = {

    stars: {
        enabled: true,
        amount: 110,
        mobileAmount: 55,
        speed: 0.18,
        twinkle: true
    },

    aurora: {
        enabled: true,
        intensity: 0.35
    },

    shootingStars: {
        enabled: true,
        interval: 6500,
        maxVisible: 2
    },

    hearts: {
        enabled: false,
        interval: 2800,
        max: 12
    },

    reveal: {
        enabled: true,
        threshold: 0.14,
        rootMargin: "0px 0px -70px 0px"
    },

    parallax: {
        enabled: true,
        maxOffset: 24
    },

    cursor: {
        enabled: true,
        glowSize: 260,
        smoothing: 0.12,
        trail: true,
        trailLength: 6
    },

    magnetic: {
        enabled: true,
        strength: 0.16
    },

    tilt: {
        enabled: true,
        strength: 5
    },

    letters: {
        enabled: true,
        delay: 28
    },

    scrollProgress: {
        enabled: true
    }
};


/* =========================================================
   03. CENTRAL ANIMATION ENGINE
   ========================================================= */

const AnimationEngine = {

    initialized: false,

    visible:
        !document.hidden,

    rafIds: new Set(),

    timeoutIds: new Set(),

    intervalIds: new Set(),

    observers: new Set(),

    listeners: [],


    addRAF(id) {

        if (id !== null && id !== undefined) {
            this.rafIds.add(id);
        }

        return id;
    },


    removeRAF(id) {

        if (
            id !== null &&
            id !== undefined
        ) {
            this.rafIds.delete(id);
        }

    },


    addTimeout(id) {

        if (id !== null && id !== undefined) {
            this.timeoutIds.add(id);
        }

        return id;
    },


    addInterval(id) {

        if (id !== null && id !== undefined) {
            this.intervalIds.add(id);
        }

        return id;
    },


    addObserver(observer) {

        if (observer) {
            this.observers.add(observer);
        }

        return observer;
    },


    addListener(
        target,
        type,
        handler,
        options
    ) {

        if (!target) {
            return;
        }

        target.addEventListener(
            type,
            handler,
            options
        );

        this.listeners.push({
            target,
            type,
            handler,
            options
        });

    },


    destroy() {

        this.intervalIds.forEach(
            id => clearInterval(id)
        );

        this.timeoutIds.forEach(
            id => clearTimeout(id)
        );

        this.rafIds.forEach(
            id => cancelAnimationFrame(id)
        );

        this.observers.forEach(
            observer => observer.disconnect()
        );

        this.listeners.forEach(
            listener => {

                listener.target.removeEventListener(
                    listener.type,
                    listener.handler,
                    listener.options
                );

            }
        );

        this.intervalIds.clear();
        this.timeoutIds.clear();
        this.rafIds.clear();
        this.observers.clear();

        this.listeners = [];

        this.initialized = false;

    }

};


/* =========================================================
   04. HELPERS
   ========================================================= */

const Utils = {

    random(min, max) {

        return (
            Math.random() *
            (max - min)
        ) + min;

    },


    randomInt(min, max) {

        return Math.floor(
            this.random(
                min,
                max + 1
            )
        );

    },


    clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    },


    isVisible(element) {

        if (!element) {
            return false;
        }

        const rect =
            element.getBoundingClientRect();

        return (
            rect.bottom >= 0 &&
            rect.top <= window.innerHeight
        );

    },


    create(
        tag,
        className
    ) {

        const element =
            document.createElement(tag);

        if (className) {
            element.className =
                className;
        }

        return element;

    },


    debounce(
        callback,
        delay = 150
    ) {

        let timeout = null;

        return (...args) => {

            clearTimeout(timeout);

            timeout =
                window.setTimeout(
                    () => callback(...args),
                    delay
                );

        };

    }

};


/* =========================================================
   05. PAGE VISIBILITY
   ========================================================= */

function updatePageVisibility() {

    AnimationEngine.visible =
        !document.hidden;

}


AnimationEngine.addListener(
    document,
    "visibilitychange",
    updatePageVisibility
);


/* =========================================================
   06. REDUCED MOTION
   ========================================================= */

function applyMotionPreference() {

    document.documentElement.classList.toggle(
        "reduced-motion",
        MOTION_REDUCED.matches
    );


    if (
        MOTION_REDUCED.matches
    ) {

        document
            .querySelectorAll(
                ".reveal, [data-reveal], [data-animation]"
            )
            .forEach(
                element => {

                    element.classList.add(
                        "revealed",
                        "is-visible",
                        "visible",
                        "animation-visible"
                    );

                }
            );

    }

}


applyMotionPreference();


if (
    typeof MOTION_REDUCED.addEventListener ===
    "function"
) {

    MOTION_REDUCED.addEventListener(
        "change",
        () => {

            applyMotionPreference();

            if (
                MOTION_REDUCED.matches
            ) {
                destroyCursorEffects();
            } else {
                initCursor();
            }

        }
    );

}


/* =========================================================
   07. SCROLL REVEAL
   ========================================================= */

function initReveal() {

    if (
        !ANIMATION_CONFIG.reveal.enabled
    ) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "[data-reveal], .reveal, [data-animation]"
        );


    if (!elements.length) {
        return;
    }


    if (
        MOTION_REDUCED.matches
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "revealed",
                    "is-visible",
                    "visible",
                    "animation-visible"
                );

            }
        );

        return;
    }


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "revealed",
                    "is-visible",
                    "visible",
                    "animation-visible"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        const element =
                            entry.target;


                        const animation =
                            element.dataset.animation;


                        if (
                            animation
                        ) {

                            element.classList.add(
                                `animate-${animation}`
                            );

                        }


                        element.classList.add(
                            "revealed",
                            "is-visible",
                            "visible",
                            "animation-visible"
                        );


                        observer.unobserve(
                            element
                        );

                    }
                );

            },
            {
                threshold:
                    ANIMATION_CONFIG
                        .reveal
                        .threshold,

                rootMargin:
                    ANIMATION_CONFIG
                        .reveal
                        .rootMargin
            }
        );


    elements.forEach(
        (element, index) => {

            element.classList.add(
                "reveal"
            );


            const delay =
                Math.min(
                    index * 45,
                    360
                );


            element.style.setProperty(
                "--reveal-delay",
                `${delay}ms`
            );


            observer.observe(
                element
            );

        }
    );


    AnimationEngine.addObserver(
        observer
    );

}


/* =========================================================
   08. STAGGERED CHILDREN
   ========================================================= */

function initStaggeredElements() {

    const containers =
        document.querySelectorAll(
            "[data-stagger]"
        );


    containers.forEach(
        container => {

            Array.from(
                container.children
            ).forEach(
                (child, index) => {

                    child.style.setProperty(
                        "--stagger-index",
                        index
                    );

                    child.style.setProperty(
                        "--stagger-delay",
                        `${Math.min(index * 70, 500)}ms`
                    );

                }
            );

        }
    );

}


/* =========================================================
   09. DATA ANIMATION OBSERVER
   ========================================================= */

function initDataAnimations() {

    const elements =
        document.querySelectorAll(
            "[data-animation]"
        );


    if (
        !elements.length ||
        MOTION_REDUCED.matches
    ) {
        return;
    }


    if (
        !("IntersectionObserver" in window)
    ) {
        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        const animation =
                            entry.target.dataset.animation;


                        if (animation) {

                            entry.target.classList.add(
                                `animate-${animation}`
                            );

                        }


                        entry.target.classList.add(
                            "animation-visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold: 0.1,
                rootMargin:
                    "0px 0px -40px 0px"
            }
        );


    elements.forEach(
        element =>
            observer.observe(element)
    );


    AnimationEngine.addObserver(
        observer
    );

}


/* =========================================================
   10. LETTER REVEAL
   ========================================================= */

function initLetters() {

    if (
        !ANIMATION_CONFIG.letters.enabled
    ) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "[data-letters]"
        );


    if (!elements.length) {
        return;
    }


    elements.forEach(
        element => {

            if (
                element.dataset.lettersInitialized ===
                "true"
            ) {
                return;
            }


            const text =
                element.textContent;


            if (!text.trim()) {
                return;
            }


            element.dataset.lettersInitialized =
                "true";


            if (
                MOTION_REDUCED.matches
            ) {
                return;
            }


            const fragment =
                document.createDocumentFragment();


            Array.from(text).forEach(
                (character, index) => {

                    const span =
                        document.createElement(
                            "span"
                        );


                    span.className =
                        "letter";


                    span.textContent =
                        character === " "
                            ? "\u00A0"
                            : character;


                    span.style.setProperty(
                        "--letter-index",
                        index
                    );


                    span.style.setProperty(
                        "--letter-delay",
                        `${index * ANIMATION_CONFIG.letters.delay}ms`
                    );


                    fragment.appendChild(
                        span
                    );

                }
            );


            element.textContent = "";


            element.appendChild(
                fragment
            );

        }
    );

}


/* =========================================================
   11. STAR CANVAS
   ========================================================= */

let starsCanvas = null;
let starsContext = null;

let starWidth = 0;
let starHeight = 0;
let starDPR = 1;

let stars = [];

let starsFrame = null;


class Star {

    constructor() {

        this.reset(true);

    }


    reset(initial = false) {

        this.x =
            Utils.random(
                0,
                starWidth
            );


        this.y =
            initial
                ? Utils.random(
                    0,
                    starHeight
                )
                : starHeight + 10;


        this.radius =
            Utils.random(
                0.35,
                1.7
            );


        this.speed =
            Utils.random(
                0.08,
                ANIMATION_CONFIG
                    .stars
                    .speed
            );


        this.alpha =
            Utils.random(
                0.25,
                0.85
            );


        this.twinkleDirection =
            Math.random() > 0.5
                ? 1
                : -1;


        this.twinkleSpeed =
            Utils.random(
                0.002,
                0.008
            );

    }


    update() {

        this.y -=
            this.speed;


        if (
            ANIMATION_CONFIG
                .stars
                .twinkle
        ) {

            this.alpha +=
                this.twinkleSpeed *
                this.twinkleDirection;


            if (
                this.alpha >= 0.95
            ) {

                this.alpha = 0.95;

                this.twinkleDirection =
                    -1;

            }


            if (
                this.alpha <= 0.18
            ) {

                this.alpha = 0.18;

                this.twinkleDirection =
                    1;

            }

        }


        if (
            this.y < -10
        ) {

            this.reset();

        }

    }


    draw() {

        if (!starsContext) {
            return;
        }


        starsContext.beginPath();


        starsContext.fillStyle =
            `rgba(255,255,255,${this.alpha})`;


        starsContext.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );


        starsContext.fill();

    }

}


function resizeStars() {

    if (!starsCanvas) {
        return;
    }


    starWidth =
        window.innerWidth;

    starHeight =
        window.innerHeight;


    const maxDPR =
        typeof CONFIG !== "undefined" &&
        CONFIG.performance
            ? CONFIG.performance
                .maxDevicePixelRatio
            : 2;


    starDPR =
        Math.min(
            window.devicePixelRatio || 1,
            maxDPR || 2
        );


    starsCanvas.width =
        Math.floor(
            starWidth * starDPR
        );


    starsCanvas.height =
        Math.floor(
            starHeight * starDPR
        );


    starsCanvas.style.width =
        `${starWidth}px`;


    starsCanvas.style.height =
        `${starHeight}px`;


    if (starsContext) {

        starsContext.setTransform(
            starDPR,
            0,
            0,
            starDPR,
            0,
            0
        );

    }

}


function animateStars() {

    starsFrame = null;


    if (
        !AnimationEngine.visible ||
        document.hidden
    ) {

        starsFrame =
            requestAnimationFrame(
                animateStars
            );

        AnimationEngine.addRAF(
            starsFrame
        );

        return;

    }


    if (
        !starsContext
    ) {
        return;
    }


    starsContext.clearRect(
        0,
        0,
        starWidth,
        starHeight
    );


    stars.forEach(
        star => {

            star.update();

            star.draw();

        }
    );


    starsFrame =
        requestAnimationFrame(
            animateStars
        );


    AnimationEngine.addRAF(
        starsFrame
    );

}


function initStars() {

    if (
        !ANIMATION_CONFIG
            .stars
            .enabled
    ) {
        return;
    }


    if (
        MOTION_REDUCED.matches
    ) {
        return;
    }


    starsCanvas =
        document.getElementById(
            "stars-canvas"
        ) ||
        document.getElementById(
            "ambient-canvas"
        );


    if (!starsCanvas) {

        starsCanvas =
            document.createElement(
                "canvas"
            );


        starsCanvas.id =
            "stars-canvas";


        starsCanvas.setAttribute(
            "aria-hidden",
            "true"
        );


        starsCanvas.className =
            "stars-canvas";


        document.body.prepend(
            starsCanvas
        );

    }


    starsContext =
        starsCanvas.getContext(
            "2d",
            {
                alpha: true
            }
        );


    if (!starsContext) {
        return;
    }


    resizeStars();


    const amount =
        SMALL_SCREEN.matches
            ? ANIMATION_CONFIG
                .stars
                .mobileAmount
            : ANIMATION_CONFIG
                .stars
                .amount;


    stars =
        Array.from(
            {
                length: amount
            },
            () => new Star()
        );


    animateStars();


    const resizeHandler =
        Utils.debounce(
            resizeStars,
            180
        );


    AnimationEngine.addListener(
        window,
        "resize",
        resizeHandler,
        {
            passive: true
        }
    );

}


/* =========================================================
   12. AURORA
   ========================================================= */

function initAurora() {

    if (
        !ANIMATION_CONFIG
            .aurora
            .enabled
    ) {
        return;
    }


    if (
        MOTION_REDUCED.matches
    ) {
        return;
    }


    let aurora =
        document.querySelector(
            ".aurora-bg"
        );


    if (!aurora) {

        aurora =
            Utils.create(
                "div",
                "aurora-bg"
            );


        aurora.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.prepend(
            aurora
        );

    }


    if (
        aurora.children.length
    ) {
        return;
    }


    const fragment =
        document.createDocumentFragment();


    for (
        let index = 1;
        index <= 3;
        index++
    ) {

        const layer =
            Utils.create(
                "span",
                `aurora-layer aurora-layer-${index}`
            );


        layer.style.setProperty(
            "--aurora-delay",
            `${index * -5}s`
        );


        fragment.appendChild(
            layer
        );

    }


    aurora.appendChild(
        fragment
    );

}


/* =========================================================
   13. SHOOTING STARS
   ========================================================= */

let shootingStarsContainer = null;


function initShootingStars() {

    if (
        !ANIMATION_CONFIG
            .shootingStars
            .enabled ||
        MOTION_REDUCED.matches ||
        SMALL_SCREEN.matches
    ) {
        return;
    }


    shootingStarsContainer =
        document.querySelector(
            ".shooting-stars"
        );


    if (!shootingStarsContainer) {

        shootingStarsContainer =
            Utils.create(
                "div",
                "shooting-stars"
            );


        shootingStarsContainer.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.appendChild(
            shootingStarsContainer
        );

    }


    const createShootingStar =
        () => {

            if (
                !AnimationEngine.visible ||
                document.hidden
            ) {
                return;
            }


            if (
                shootingStarsContainer
                    .children
                    .length >=
                ANIMATION_CONFIG
                    .shootingStars
                    .maxVisible
            ) {
                return;
            }


            const star =
                Utils.create(
                    "span",
                    "shooting-star"
                );


            star.style.left =
                `${Utils.random(10, 88)}%`;


            star.style.top =
                `${Utils.random(5, 55)}%`;


            star.style.setProperty(
                "--shoot-distance",
                `${Utils.random(130, 260)}px`
            );


            star.style.setProperty(
                "--shoot-duration",
                `${Utils.random(0.8, 1.45)}s`
            );


            shootingStarsContainer
                .appendChild(
                    star
                );


            const remove =
                () => {

                    if (
                        star.parentNode
                    ) {
                        star.remove();
                    }

                };


            star.addEventListener(
                "animationend",
                remove,
                {
                    once: true
                }
            );


            const timeout =
                window.setTimeout(
                    remove,
                    2200
                );


            AnimationEngine.addTimeout(
                timeout
            );

        };


    const interval =
        window.setInterval(
            createShootingStar,
            ANIMATION_CONFIG
                .shootingStars
                .interval
        );


    AnimationEngine.addInterval(
        interval
    );

}


/* =========================================================
   14. FLOATING HEARTS
   ========================================================= */

let heartsContainer = null;


function initFloatingHearts() {

    if (
        !ANIMATION_CONFIG
            .hearts
            .enabled ||
        MOTION_REDUCED.matches
    ) {
        return;
    }


    heartsContainer =
        document.querySelector(
            ".floating-hearts"
        );


    if (!heartsContainer) {

        heartsContainer =
            Utils.create(
                "div",
                "floating-hearts"
            );


        heartsContainer.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.appendChild(
            heartsContainer
        );

    }


    const createHeart =
        () => {

            if (
                !AnimationEngine.visible ||
                document.hidden
            ) {
                return;
            }


            if (
                heartsContainer.children.length >=
                ANIMATION_CONFIG
                    .hearts
                    .max
            ) {
                return;
            }


            const heart =
                Utils.create(
                    "span",
                    "floating-heart"
                );


            heart.textContent =
                "♥";


            heart.style.left =
                `${Utils.random(5, 95)}%`;


            heart.style.setProperty(
                "--heart-size",
                `${Utils.random(8, 18)}px`
            );


            heart.style.setProperty(
                "--heart-duration",
                `${Utils.random(6, 11)}s`
            );


            heart.style.setProperty(
                "--heart-delay",
                `${Utils.random(0, 1.5)}s`
            );


            heart.style.setProperty(
                "--heart-drift",
                `${Utils.random(-45, 45)}px`
            );


            heartsContainer.appendChild(
                heart
            );


            heart.addEventListener(
                "animationend",
                () => {

                    if (
                        heart.parentNode
                    ) {
                        heart.remove();
                    }

                },
                {
                    once: true
                }
            );

        };


    const interval =
        window.setInterval(
            createHeart,
            ANIMATION_CONFIG
                .hearts
                .interval
        );


    AnimationEngine.addInterval(
        interval
    );

}


/* =========================================================
   15. CURSOR GLOW
   ========================================================= */

let cursorGlow = null;

let cursorTrail = [];

let cursorX = 0;
let cursorY = 0;

let targetCursorX = 0;
let targetCursorY = 0;

let cursorFrame = null;


function initCursor() {

    if (
        !ANIMATION_CONFIG
            .cursor
            .enabled ||
        MOTION_REDUCED.matches ||
        !FINE_POINTER.matches
    ) {
        return;
    }


    if (
        cursorGlow
    ) {
        return;
    }


    cursorGlow =
        Utils.create(
            "div",
            "cursor-glow"
        );


    cursorGlow.setAttribute(
        "aria-hidden",
        "true"
    );


    cursorGlow.style.setProperty(
        "--cursor-size",
        `${ANIMATION_CONFIG.cursor.glowSize}px`
    );


    document.body.appendChild(
        cursorGlow
    );


    if (
        ANIMATION_CONFIG
            .cursor
            .trail
    ) {

        const length =
            ANIMATION_CONFIG
                .cursor
                .trailLength;


        for (
            let index = 0;
            index < length;
            index++
        ) {

            const dot =
                Utils.create(
                    "span",
                    "cursor-trail"
                );


            dot.setAttribute(
                "aria-hidden",
                "true"
            );


            dot.style.setProperty(
                "--trail-index",
                index
            );


            document.body.appendChild(
                dot
            );


            cursorTrail.push({
                element: dot,
                x: 0,
                y: 0
            });

        }

    }


    const handlePointerMove =
        event => {

            targetCursorX =
                event.clientX;

            targetCursorY =
                event.clientY;

        };


    AnimationEngine.addListener(
        window,
        "pointermove",
        handlePointerMove,
        {
            passive: true
        }
    );


    animateCursor();

}


function animateCursor() {

    if (
        !cursorGlow
    ) {
        return;
    }


    cursorX +=
        (
            targetCursorX -
            cursorX
        ) *
        ANIMATION_CONFIG
            .cursor
            .smoothing;


    cursorY +=
        (
            targetCursorY -
            cursorY
        ) *
        ANIMATION_CONFIG
            .cursor
            .smoothing;


    cursorGlow.style.transform =
        `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;


    if (
        cursorTrail.length
    ) {

        let previousX =
            cursorX;

        let previousY =
            cursorY;


        cursorTrail.forEach(
            item => {

                item.x +=
                    (
                        previousX -
                        item.x
                    ) *
                    0.22;


                item.y +=
                    (
                        previousY -
                        item.y
                    ) *
                    0.22;


                item.element.style.transform =
                    `translate3d(${item.x}px, ${item.y}px, 0) translate(-50%, -50%)`;


                previousX =
                    item.x;

                previousY =
                    item.y;

            }
        );

    }


    cursorFrame =
        requestAnimationFrame(
            animateCursor
        );


    AnimationEngine.addRAF(
        cursorFrame
    );

}


function destroyCursorEffects() {

    if (
        cursorGlow &&
        cursorGlow.parentNode
    ) {

        cursorGlow.remove();

    }


    cursorGlow = null;


    cursorTrail.forEach(
        item => {

            if (
                item.element &&
                item.element.parentNode
            ) {

                item.element.remove();

            }

        }
    );


    cursorTrail = [];

}


/* =========================================================
   16. MAGNETIC BUTTONS
   ========================================================= */

function initMagneticElements() {

    if (
        !ANIMATION_CONFIG
            .magnetic
            .enabled ||
        MOTION_REDUCED.matches ||
        !FINE_POINTER.matches
    ) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "[data-magnetic], .magnetic"
        );


    elements.forEach(
        element => {

            const move =
                event => {

                    const rect =
                        element.getBoundingClientRect();


                    const x =
                        (
                            event.clientX -
                            rect.left -
                            rect.width / 2
                        ) /
                        rect.width;


                    const y =
                        (
                            event.clientY -
                            rect.top -
                            rect.height / 2
                        ) /
                        rect.height;


                    const strength =
                        ANIMATION_CONFIG
                            .magnetic
                            .strength;


                    element.style.transform =
                        `translate3d(${x * rect.width * strength}px, ${y * rect.height * strength}px, 0)`;

                };


            const reset =
                () => {

                    element.style.transform =
                        "";

                };


            AnimationEngine.addListener(
                element,
                "pointermove",
                move
            );


            AnimationEngine.addListener(
                element,
                "pointerleave",
                reset
            );

        }
    );

}


/* =========================================================
   17. CARD TILT
   ========================================================= */

function initTiltElements() {

    if (
        !ANIMATION_CONFIG
            .tilt
            .enabled ||
        MOTION_REDUCED.matches ||
        !FINE_POINTER.matches
    ) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "[data-tilt]"
        );


    elements.forEach(
        element => {

            const move =
                event => {

                    const rect =
                        element.getBoundingClientRect();


                    const x =
                        (
                            event.clientX -
                            rect.left
                        ) /
                        rect.width;


                    const y =
                        (
                            event.clientY -
                            rect.top
                        ) /
                        rect.height;


                    const rotateY =
                        (
                            x -
                            0.5
                        ) *
                        ANIMATION_CONFIG
                            .tilt
                            .strength;


                    const rotateX =
                        (
                            0.5 -
                            y
                        ) *
                        ANIMATION_CONFIG
                            .tilt
                            .strength;


                    element.style.transform =
                        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;

                };


            const reset =
                () => {

                    element.style.transform =
                        "";

                };


            AnimationEngine.addListener(
                element,
                "pointermove",
                move
            );


            AnimationEngine.addListener(
                element,
                "pointerleave",
                reset
            );

        }
    );

}


/* =========================================================
   18. PARALLAX
   ========================================================= */

let parallaxElements = [];

let parallaxTicking = false;


function updateParallax() {

    parallaxTicking = false;


    if (
        !AnimationEngine.visible ||
        MOTION_REDUCED.matches ||
        TOUCH_DEVICE.matches
    ) {
        return;
    }


    const viewportCenter =
        window.innerHeight / 2;


    parallaxElements.forEach(
        element => {

            const rect =
                element.getBoundingClientRect();


            if (
                rect.bottom < -100 ||
                rect.top >
                    window.innerHeight + 100
            ) {
                return;
            }


            const speed =
                Utils.clamp(
                    parseFloat(
                        element.dataset.parallaxSpeed ||
                        "0.06"
                    ),
                    -0.18,
                    0.18
                );


            const elementCenter =
                rect.top +
                rect.height / 2;


            const distance =
                elementCenter -
                viewportCenter;


            const offset =
                Utils.clamp(
                    distance * speed,
                    -ANIMATION_CONFIG
                        .parallax
                        .maxOffset,
                    ANIMATION_CONFIG
                        .parallax
                        .maxOffset
                );


            element.style.setProperty(
                "--parallax-offset",
                `${offset}px`
            );

        }
    );

}


function requestParallaxUpdate() {

    if (
        parallaxTicking
    ) {
        return;
    }


    parallaxTicking =
        true;


    const id =
        requestAnimationFrame(
            updateParallax
        );


    AnimationEngine.addRAF(
        id
    );

}


function initParallax() {

    if (
        !ANIMATION_CONFIG
            .parallax
            .enabled ||
        MOTION_REDUCED.matches ||
        TOUCH_DEVICE.matches
    ) {
        return;
    }


    parallaxElements =
        Array.from(
            document.querySelectorAll(
                "[data-parallax], .parallax"
            )
        );


    if (
        !parallaxElements.length
    ) {
        return;
    }


    AnimationEngine.addListener(
        window,
        "scroll",
        requestParallaxUpdate,
        {
            passive: true
        }
    );


    AnimationEngine.addListener(
        window,
        "resize",
        requestParallaxUpdate,
        {
            passive: true
        }
    );


    requestParallaxUpdate();

}


/* =========================================================
   19. SCROLL PROGRESS
   ========================================================= */

let progressTicking = false;


function updateScrollProgress() {

    progressTicking = false;


    if (
        !ANIMATION_CONFIG
            .scrollProgress
            .enabled
    ) {
        return;
    }


    const documentHeight =
        document.documentElement
            .scrollHeight;


    const viewportHeight =
        window.innerHeight;


    const maximum =
        Math.max(
            documentHeight -
            viewportHeight,
            1
        );


    const progress =
        Utils.clamp(
            window.scrollY /
            maximum,
            0,
            1
        );


    document.documentElement
        .style.setProperty(
            "--scroll-progress",
            progress.toFixed(4)
        );


    const progressBar =
        document.querySelector(
            "[data-scroll-progress]"
        );


    if (
        progressBar
    ) {

        progressBar.style.transform =
            `scaleX(${progress})`;

    }

}


function requestScrollProgress() {

    if (
        progressTicking
    ) {
        return;
    }


    progressTicking =
        true;


    const id =
        requestAnimationFrame(
            updateScrollProgress
        );


    AnimationEngine.addRAF(
        id
    );

}


function initScrollProgress() {

    if (
        !ANIMATION_CONFIG
            .scrollProgress
            .enabled
    ) {
        return;
    }


    AnimationEngine.addListener(
        window,
        "scroll",
        requestScrollProgress,
        {
            passive: true
        }
    );


    AnimationEngine.addListener(
        window,
        "resize",
        requestScrollProgress,
        {
            passive: true
        }
    );


    requestScrollProgress();

}


/* =========================================================
   20. ACTIVE SECTION TRACKING
   ========================================================= */

function initSectionTracking() {

    const sections =
        document.querySelectorAll(
            "main section[id], section[id]"
        );


    const navigationLinks =
        document.querySelectorAll(
            "[data-nav], nav a[href^='#']"
        );


    if (
        !sections.length ||
        !navigationLinks.length ||
        !("IntersectionObserver" in window)
    ) {
        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        const id =
                            entry.target.id;


                        navigationLinks.forEach(
                            link => {

                                const href =
                                    link.getAttribute(
                                        "href"
                                    );


                                const active =
                                    href ===
                                    `#${id}` ||
                                    link.dataset.nav ===
                                    id;


                                link.classList.toggle(
                                    "active",
                                    active
                                );


                                if (
                                    active
                                ) {

                                    link.setAttribute(
                                        "aria-current",
                                        "page"
                                    );

                                } else {

                                    link.removeAttribute(
                                        "aria-current"
                                    );

                                }

                            }
                        );

                    }
                );

            },
            {
                threshold: 0.2,
                rootMargin:
                    "-20% 0px -55% 0px"
            }
        );


    sections.forEach(
        section =>
            observer.observe(section)
    );


    AnimationEngine.addObserver(
        observer
    );

}


/* =========================================================
   21. SMOOTH ANCHOR NAVIGATION
   ========================================================= */

function initAnchorNavigation() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        link => {

            AnimationEngine.addListener(
                link,
                "click",
                event => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior:
                            MOTION_REDUCED.matches
                                ? "auto"
                                : "smooth",
                        block: "start"
                    });

                }
            );

        }
    );

}


/* =========================================================
   22. IMAGE LOAD MICRO INTERACTION
   ========================================================= */

function initImageLoading() {

    const images =
        document.querySelectorAll(
            "img"
        );


    images.forEach(
        image => {

            if (
                image.complete
            ) {

                image.classList.add(
                    "image-loaded"
                );

                return;

            }


            AnimationEngine.addListener(
                image,
                "load",
                () => {

                    image.classList.add(
                        "image-loaded"
                    );

                },
                {
                    once: true
                }
            );


            AnimationEngine.addListener(
                image,
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );

                },
                {
                    once: true
                }
            );

        }
    );

}


/* =========================================================
   23. LAZY IMAGE SUPPORT
   ========================================================= */

function initLazyImages() {

    const images =
        document.querySelectorAll(
            "img[data-src]"
        );


    if (
        !images.length
    ) {
        return;
    }


    const loadImage =
        image => {

            const source =
                image.dataset.src;


            if (!source) {
                return;
            }


            image.src =
                source;


            image.removeAttribute(
                "data-src"
            );

        };


    if (
        !("IntersectionObserver" in window)
    ) {

        images.forEach(
            loadImage
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        loadImage(
                            entry.target
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                rootMargin:
                    "300px 0px"
            }
        );


    images.forEach(
        image =>
            observer.observe(image)
    );


    AnimationEngine.addObserver(
        observer
    );

}


/* =========================================================
   24. HOVER LIGHT
   ========================================================= */

function initHoverLight() {

    if (
        MOTION_REDUCED.matches ||
        !FINE_POINTER.matches
    ) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "[data-hover-light]"
        );


    elements.forEach(
        element => {

            const move =
                event => {

                    const rect =
                        element.getBoundingClientRect();


                    const x =
                        (
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width
                        ) *
                        100;


                    const y =
                        (
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height
                        ) *
                        100;


                    element.style.setProperty(
                        "--mouse-x",
                        `${x}%`
                    );


                    element.style.setProperty(
                        "--mouse-y",
                        `${y}%`
                    );

                };


            AnimationEngine.addListener(
                element,
                "pointermove",
                move
            );

        }
    );

}


/* =========================================================
   25. BUTTON RIPPLE
   ========================================================= */

function initButtonRipples() {

    if (
        MOTION_REDUCED.matches
    ) {
        return;
    }


    const buttons =
        document.querySelectorAll(
            "[data-ripple], .btn"
        );


    buttons.forEach(
        button => {

            AnimationEngine.addListener(
                button,
                "click",
                event => {

                    const rect =
                        button.getBoundingClientRect();


                    const ripple =
                        document.createElement(
                            "span"
                        );


                    ripple.className =
                        "button-ripple";


                    const size =
                        Math.max(
                            rect.width,
                            rect.height
                        );


                    ripple.style.width =
                        `${size}px`;


                    ripple.style.height =
                        `${size}px`;


                    ripple.style.left =
                        `${event.clientX - rect.left - size / 2}px`;


                    ripple.style.top =
                        `${event.clientY - rect.top - size / 2}px`;


                    button.appendChild(
                        ripple
                    );


                    ripple.addEventListener(
                        "animationend",
                        () => {

                            ripple.remove();

                        },
                        {
                            once: true
                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   26. FINAL EXPERIENCE HELPERS
   ========================================================= */

window.LoveAnimation = {

    celebrate() {

        if (
            MOTION_REDUCED.matches
        ) {
            return;
        }


        document.body.classList.add(
            "love-celebration"
        );


        window.setTimeout(
            () => {

                document.body.classList.remove(
                    "love-celebration"
                );

            },
            4000
        );

    },


    pulse(element) {

        if (
            !element ||
            MOTION_REDUCED.matches
        ) {
            return;
        }


        element.classList.remove(
            "animation-pulse"
        );


        void element.offsetWidth;


        element.classList.add(
            "animation-pulse"
        );

    }

};


/* =========================================================
   27. RESPONSIVE CURSOR STATE
   ========================================================= */

function updatePointerMode() {

    if (
        MOTION_REDUCED.matches ||
        !FINE_POINTER.matches
    ) {

        destroyCursorEffects();

        return;

    }


    initCursor();

}


if (
    typeof FINE_POINTER.addEventListener ===
    "function"
) {

    FINE_POINTER.addEventListener(
        "change",
        updatePointerMode
    );

}


/* =========================================================
   28. WINDOW FOCUS
   ========================================================= */

function pauseAnimationWork() {

    AnimationEngine.visible =
        false;

}


function resumeAnimationWork() {

    AnimationEngine.visible =
        !document.hidden;

}


AnimationEngine.addListener(
    window,
    "blur",
    pauseAnimationWork
);


AnimationEngine.addListener(
    window,
    "focus",
    resumeAnimationWork
);


/* =========================================================
   29. RESIZE MANAGEMENT
   ========================================================= */

const handleResize =
    Utils.debounce(
        () => {

            requestParallaxUpdate();

            requestScrollProgress();

        },
        180
    );


AnimationEngine.addListener(
    window,
    "resize",
    handleResize,
    {
        passive: true
    }
);


/* =========================================================
   30. MAIN INITIALIZATION
   ========================================================= */

function initializeAnimationSystem() {

    if (
        AnimationEngine.initialized
    ) {
        return;
    }


    AnimationEngine.initialized =
        true;


    applyMotionPreference();


    /*
     * Lightweight DOM animations
     */

    initReveal();

    initDataAnimations();

    initStaggeredElements();

    initLetters();

    initSectionTracking();

    initAnchorNavigation();

    initImageLoading();

    initLazyImages();

    initHoverLight();

    initButtonRipples();


    /*
     * Ambient effects
     */

    if (
        !MOTION_REDUCED.matches
    ) {

        initStars();

        initAurora();

        initShootingStars();

        initFloatingHearts();

    }


    /*
     * Desktop-only interactions
     */

    if (
        FINE_POINTER.matches &&
        !MOTION_REDUCED.matches
    ) {

        initCursor();

        initMagneticElements();

        initTiltElements();

        initHoverLight();

        initParallax();

    }


    /*
     * Global progress
     */

    initScrollProgress();

}


/* =========================================================
   31. BOOTSTRAP
   ========================================================= */

function bootAnimations() {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAnimationSystem,
            {
                once: true
            }
        );

        return;

    }


    initializeAnimationSystem();

}


bootAnimations();


/* =========================================================
   32. GLOBAL ACCESS
   ========================================================= */

window.AnimationEngine =
    AnimationEngine;

window.initAnimations =
    initializeAnimationSystem;


/* =========================================================
   33. CLEANUP API
   ========================================================= */

window.destroyLoveAnimations =
    () => {

        destroyCursorEffects();

        AnimationEngine.destroy();

        stars = [];

        starsCanvas = null;
        starsContext = null;

        parallaxElements = [];

    };


/* =========================================================
   34. SAFETY
   ========================================================= */

window.addEventListener(
    "pagehide",
    () => {

        /*
         * Do not aggressively destroy everything here
         * because browser page restoration may reuse
         * the document. We only stop expensive effects.
         */

        if (
            starsFrame !== null
        ) {

            cancelAnimationFrame(
                starsFrame
            );

            starsFrame = null;

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   END OF js/animations.js
   ❤️ DIGITAL LOVE EXPERIENCE ❤️
   ========================================================= */