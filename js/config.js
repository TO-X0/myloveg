/* =========================================================
   ❤️ إلى غدير ❤️
   VERSION 2.0 — DIGITAL LOVE EXPERIENCE

   FILE: js/config.js

   Central configuration
   ---------------------------------------------------------
   This file contains no DOM logic and no event listeners.
   Other modules should import CONFIG from this file.
   ========================================================= */

"use strict";


/* =========================================================
   MAIN CONFIGURATION
   ========================================================= */

export const CONFIG = Object.freeze({

    /* =====================================================
       WEBSITE
       ===================================================== */

    website: Object.freeze({

        title: "❤️ إلى غدير ❤️",

        shortTitle: "إلى غدير",

        version: "2.0",

        language: "ar",

        direction: "rtl",

        developer: "Mohammed",

        theme: "cinematic-romantic"

    }),


    /* =====================================================
       PASSWORD / PRIVATE VAULT
       ===================================================== */

    password: Object.freeze({

        enabled: true,

        /*
         * Keep the existing password functionality.
         *
         * IMPORTANT:
         * This value is intentionally kept compatible with
         * the existing project configuration.
         */

        answer: "حنتوشتي",

        maxAttempts: 5,

        lockMinutes: 5,

        remember: false,

        rememberStorageKey:
            "ghadeer_love_vault",

        attemptsStorageKey:
            "ghadeer_vault_attempts",

        lockStorageKey:
            "ghadeer_vault_lock"

    }),


    /* =====================================================
       LOVE STORY
       ===================================================== */

    story: Object.freeze({

        startYear: 2021,

        startDate: "2021-06-21T00:00:00",

        dateFormat: "yyyy-MM-dd",

        chapterCount: 6

    }),


    /* =====================================================
       LOVE COUNTER
       ===================================================== */

    counter: Object.freeze({

        startDate:
            "2021-06-21T00:00:00",

        updateInterval:
            1000,

        enabled:
            true,

        showYears:
            true,

        showDays:
            true,

        showHours:
            true,

        showMinutes:
            true,

        showSeconds:
            true

    }),


    /* =====================================================
       AUDIO / MUSIC
       ===================================================== */

    music: Object.freeze({

        source:
            "music/shms.m4a",

        autoplay:
            false,

        volume:
            0.4,

        fadeSpeed:
            800,

        loop:
            true,

        preload:
            "metadata",

        rememberVolume:
            true,

        storageKey:
            "ghadeer_music_volume",

        visualizer:
            true

    }),


    /* =====================================================
       GALLERY
       ===================================================== */

    gallery: Object.freeze({

        enabled:
            true,

        zoom:
            true,

        swipe:
            true,

        keyboard:
            true,

        preload:
            true,

        fullscreen:
            true,

        lazy:
            true,

        closeOnBackdrop:
            true,

        closeOnEscape:
            true,

        preloadCount:
            2,

        swipeThreshold:
            45,

        animationDuration:
            320

    }),


    /* =====================================================
       STARS
       ===================================================== */

    stars: Object.freeze({

        enabled:
            true,

        amount:
            150,

        speed:
            0.35,

        twinkle:
            true,

        shootingStars:
            true,

        shootingInterval:
            5000,

        /*
         * Performance limits
         */

        mobileAmount:
            55,

        tabletAmount:
            90,

        reducedMotion:
            false

    }),


    /* =====================================================
       AURORA / ATMOSPHERE
       ===================================================== */

    aurora: Object.freeze({

        enabled:
            true,

        blur:
            170,

        opacity:
            0.35,

        mobileOpacity:
            0.18,

        animation:
            true

    }),


    /* =====================================================
       HEART PARTICLES
       ===================================================== */

    hearts: Object.freeze({

        enabled:
            true,

        amount:
            30,

        speedMin:
            0.4,

        speedMax:
            1.2,

        interval:
            2200,

        mobileAmount:
            8,

        maxActive:
            30

    }),


    /* =====================================================
       ROSE PARTICLES
       ===================================================== */

    roses: Object.freeze({

        enabled:
            true,

        amount:
            18,

        speedMin:
            0.3,

        speedMax:
            0.9,

        interval:
            3200,

        mobileAmount:
            4,

        maxActive:
            18

    }),


    /* =====================================================
       CURSOR
       ===================================================== */

    cursor: Object.freeze({

        enabled:
            true,

        glow:
            true,

        trail:
            true,

        trailLength:
            18,

        /*
         * Cursor effects should only run on devices
         * that actually have a fine pointer.
         */

        disableOnTouch:
            true,

        smoothing:
            0.18

    }),


    /* =====================================================
       LETTER / TYPING EXPERIENCE
       ===================================================== */

    letters: Object.freeze({

        typingSpeed:
            18,

        delayBetweenLetters:
            600,

        autoPlay:
            true,

        cursor:
            true,

        pauseOnHidden:
            true

    }),


    /* =====================================================
       SCROLL / REVEAL
       ===================================================== */

    scroll: Object.freeze({

        reveal:
            true,

        threshold:
            0.14,

        rootMargin:
            "0px 0px -8% 0px",

        parallax:
            true,

        smooth:
            true,

        stickyTimeline:
            true

    }),


    /* =====================================================
       PERFORMANCE
       ===================================================== */

    performance: Object.freeze({

        useIdle:
            true,

        pauseWhenHidden:
            true,

        useGPU:
            true,

        fps:
            60,

        maxDevicePixelRatio:
            2,

        /*
         * Prevent expensive visual systems from
         * creating excessive DOM nodes.
         */

        maxParticles:
            180,

        maxHearts:
            30,

        maxRoses:
            18,

        maxShootingStars:
            2,

        lazyEffects:
            true,

        intersectionObserver:
            true,

        requestAnimationFrame:
            true,

        cleanupListeners:
            true,

        cleanupIntervals:
            true

    }),


    /* =====================================================
       EFFECTS
       ===================================================== */

    effects: Object.freeze({

        ripple:
            true,

        confetti:
            true,

        fireworks:
            true,

        sparkles:
            true,

        glow:
            true,

        magneticButtons:
            true,

        cardTilt:
            true,

        cursorLight:
            true,

        screenFlash:
            true

    }),


    /* =====================================================
       MOBILE
       ===================================================== */

    mobile: Object.freeze({

        disableCursor:
            true,

        reduceParticles:
            true,

        reduceParallax:
            true,

        reduceAurora:
            true,

        useBottomNavigation:
            true,

        enableTouchGestures:
            true

    }),


    /* =====================================================
       ACCESSIBILITY
       ===================================================== */

    accessibility: Object.freeze({

        reducedMotion:
            true,

        keyboardNavigation:
            true,

        focusStates:
            true,

        accessibleLabels:
            true,

        semanticMarkup:
            true,

        respectSystemMotionPreference:
            true

    }),


    /* =====================================================
       STORAGE
       ===================================================== */

    storage: Object.freeze({

        prefix:
            "ghadeer_love_",

        musicVolume:
            "music_volume",

        vaultRemember:
            "vault_remember",

        introSeen:
            "intro_seen"

    })

});


/* =========================================================
   ENVIRONMENT HELPERS
   ========================================================= */

/**
 * Detect whether the current device is using touch input.
 */
export function isTouchDevice() {

    if (
        typeof window === "undefined"
    ) {
        return false;
    }

    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
    );

}


/**
 * Detect whether the user prefers reduced motion.
 */
export function prefersReducedMotion() {

    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {
        return false;
    }

    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

}


/**
 * Detect whether the current pointer is fine.
 */
export function hasFinePointer() {

    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {
        return false;
    }

    return window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

}


/* =========================================================
   EFFECTIVE PERFORMANCE SETTINGS
   ========================================================= */

/**
 * Returns the appropriate particle amount according
 * to the current device.
 */
export function getParticleScale() {

    if (
        prefersReducedMotion()
    ) {
        return 0;
    }


    if (
        isTouchDevice()
    ) {
        return 0.35;
    }


    if (
        typeof window !== "undefined" &&
        window.innerWidth <= 768
    ) {
        return 0.6;
    }


    if (
        typeof window !== "undefined" &&
        window.innerWidth <= 1100
    ) {
        return 0.8;
    }


    return 1;

}


/**
 * Returns whether cursor effects should run.
 */
export function shouldUseCursor() {

    if (
        !CONFIG.cursor.enabled
    ) {
        return false;
    }


    if (
        CONFIG.cursor.disableOnTouch &&
        isTouchDevice()
    ) {
        return false;
    }


    if (
        prefersReducedMotion()
    ) {
        return false;
    }


    return hasFinePointer();

}


/**
 * Returns whether heavy visual effects are allowed.
 */
export function shouldUseHeavyEffects() {

    if (
        prefersReducedMotion()
    ) {
        return false;
    }


    if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
    ) {
        return false;
    }


    return true;

}


/* =========================================================
   SAFE STORAGE HELPERS
   ========================================================= */

/**
 * Safely read from localStorage.
 */
export function getStorage(key) {

    if (
        typeof window === "undefined" ||
        !window.localStorage
    ) {
        return null;
    }


    try {

        return window.localStorage.getItem(
            CONFIG.storage.prefix + key
        );

    } catch {

        return null;

    }

}


/**
 * Safely write to localStorage.
 */
export function setStorage(
    key,
    value
) {

    if (
        typeof window === "undefined" ||
        !window.localStorage
    ) {
        return false;
    }


    try {

        window.localStorage.setItem(
            CONFIG.storage.prefix + key,
            String(value)
        );

        return true;

    } catch {

        return false;

    }

}


/**
 * Safely remove from localStorage.
 */
export function removeStorage(key) {

    if (
        typeof window === "undefined" ||
        !window.localStorage
    ) {
        return false;
    }


    try {

        window.localStorage.removeItem(
            CONFIG.storage.prefix + key
        );

        return true;

    } catch {

        return false;

    }

}


/* =========================================================
   EXPORT DEFAULT
   ========================================================= */

export default CONFIG;


/* =========================================================
   END OF config.js
   ❤️ إلى غدير ❤️
   ========================================================= */
   