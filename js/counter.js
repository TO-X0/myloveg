/*=========================================================
    counter.js
    VERSION 2.0 — Cinematic Love Duration Counter

    Responsibilities:
    - Calculate the relationship duration
    - Update the counter in real time
    - Respect the configured start date
    - Support reduced motion
    - Pause while the document is hidden
    - Avoid unnecessary DOM updates
    - Provide a small public API
=========================================================*/

"use strict";


/*=========================================================
    CONSTANTS
=========================================================*/

const COUNTER_FALLBACK_DATE = "2021-06-21T00:00:00";

const TIME = Object.freeze({

    SECOND: 1000,

    MINUTE: 60 * 1000,

    HOUR: 60 * 60 * 1000,

    DAY: 24 * 60 * 60 * 1000

});


/*=========================================================
    STATE
=========================================================*/

const Counter = {

    config: null,

    startDate: null,

    elements: {},

    timer: null,

    initialized: false,

    initializing: false,

    reducedMotion: false,

    lastValues: null,

    visibilityHandler: null,

    motionMediaQuery: null,

    motionChangeHandler: null

};


/*=========================================================
    DOM HELPERS
=========================================================*/

/**
 * Safely retrieve an element by ID.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getElement(id) {

    if (
        typeof document === "undefined"
    ) {

        return null;

    }


    return document.getElementById(id);

}


/**
 * Safely retrieve all supported counter elements.
 *
 * The new design can use the original IDs while allowing
 * some elements to be absent without breaking the counter.
 *
 * @returns {Object}
 */
function collectElements() {

    return {

        years:
            getElement("counter-years") ||
            getElement("years"),

        months: getElement("months"),

        days: getElement("days"),

        hours: getElement("hours"),

        minutes: getElement("minutes"),

        seconds: getElement("seconds"),

        totalDays:
            getElement("loveDays") ||
            getElement("total-days"),

        counterLabel: getElement("counter-label")

    };

}


/**
 * Determine whether at least one counter output exists.
 *
 * @returns {boolean}
 */
function hasElements() {

    return Object.values(
        Counter.elements
    ).some(
        Boolean
    );

}


/*=========================================================
    CONFIGURATION
=========================================================*/

/**
 * Load the project configuration.
 *
 * @returns {Promise<Object>}
 */
async function loadConfig() {

    if (
        Counter.config
    ) {

        return Counter.config;

    }


    try {

        const module =
            await import("./config.js");


        if (
            module &&
            module.CONFIG
        ) {

            Counter.config =
                module.CONFIG;

        }

    } catch (error) {

        console.warn(
            "[Counter] Unable to load config.js. Using fallback configuration.",
            error
        );

    }


    /*
     * Always keep a safe configuration available.
     */
    if (
        !Counter.config
    ) {

        Counter.config = {

            counter: {

                startDate:
                    COUNTER_FALLBACK_DATE

            }

        };

    }


    return Counter.config;

}


/*=========================================================
    REDUCED MOTION
=========================================================*/

/**
 * Check the user's motion preference.
 *
 * @returns {boolean}
 */
function getReducedMotionPreference() {

    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {

        return false;

    }


    return window
        .matchMedia(
            "(prefers-reduced-motion: reduce)"
        )
        .matches;

}


/**
 * Watch for changes to the reduced-motion preference.
 */
function setupMotionPreference() {

    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {

        return;

    }


    Counter.motionMediaQuery =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    Counter.reducedMotion =
        Counter.motionMediaQuery.matches;


    Counter.motionChangeHandler =
        event => {

            Counter.reducedMotion =
                Boolean(event.matches);

        };


    /*
     * Modern browsers.
     */
    if (
        typeof Counter.motionMediaQuery.addEventListener ===
        "function"
    ) {

        Counter.motionMediaQuery.addEventListener(
            "change",
            Counter.motionChangeHandler
        );

        return;

    }


    /*
     * Legacy browser fallback.
     */
    if (
        typeof Counter.motionMediaQuery.addListener ===
        "function"
    ) {

        Counter.motionMediaQuery.addListener(
            Counter.motionChangeHandler
        );

    }

}


/**
 * Remove reduced-motion listener.
 */
function removeMotionPreference() {

    if (
        !Counter.motionMediaQuery ||
        !Counter.motionChangeHandler
    ) {

        return;

    }


    if (
        typeof Counter.motionMediaQuery.removeEventListener ===
        "function"
    ) {

        Counter.motionMediaQuery.removeEventListener(
            "change",
            Counter.motionChangeHandler
        );

    } else if (
        typeof Counter.motionMediaQuery.removeListener ===
        "function"
    ) {

        Counter.motionMediaQuery.removeListener(
            "change",
            Counter.motionChangeHandler
        );

    }


    Counter.motionMediaQuery =
        null;

    Counter.motionChangeHandler =
        null;

}


/*=========================================================
    START DATE
=========================================================*/

/**
 * Resolve and validate the configured relationship start date.
 *
 * @returns {Date}
 */
function getStartDate() {

    const configuredDate =

        Counter.config &&
        Counter.config.counter &&
        Counter.config.counter.startDate;


    const date =
        new Date(
            configuredDate ||
            COUNTER_FALLBACK_DATE
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        console.warn(
            "[Counter] Invalid start date. Falling back to:",
            COUNTER_FALLBACK_DATE
        );


        return new Date(
            COUNTER_FALLBACK_DATE
        );

    }


    return date;

}


/*=========================================================
    DURATION CALCULATION
=========================================================*/

/**
 * Create a zero duration object.
 *
 * @returns {Object}
 */
function emptyDuration() {

    return {

        years: 0,

        months: 0,

        days: 0,

        hours: 0,

        minutes: 0,

        seconds: 0,

        totalDays: 0

    };

}


/**
 * Calculate the exact calendar duration between two dates.
 *
 * Years and months are calculated as calendar units rather
 * than assuming every month/year has a fixed number of days.
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Object}
 */
function calculateDuration(
    startDate,
    endDate
) {

    if (
        !(startDate instanceof Date) ||
        !(endDate instanceof Date)
    ) {

        return emptyDuration();

    }


    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
    ) {

        return emptyDuration();

    }


    if (
        endDate < startDate
    ) {

        return emptyDuration();

    }


    /*
     * Complete calendar years.
     */
    let years =
        endDate.getFullYear() -
        startDate.getFullYear();


    let cursor =
        new Date(startDate);


    cursor.setFullYear(
        cursor.getFullYear() +
        years
    );


    /*
     * Anniversary has not occurred yet.
     */
    if (
        cursor > endDate
    ) {

        years -= 1;


        cursor =
            new Date(startDate);


        cursor.setFullYear(
            cursor.getFullYear() +
            years
        );

    }


    /*
     * Complete calendar months.
     */
    let months =
        endDate.getMonth() -
        cursor.getMonth();


    if (
        months < 0
    ) {

        months += 12;

    }


    let monthCursor =
        new Date(cursor);


    monthCursor.setMonth(
        monthCursor.getMonth() +
        months
    );


    /*
     * Handle dates such as the end of a month safely.
     */
    if (
        monthCursor > endDate
    ) {

        months -= 1;


        monthCursor =
            new Date(cursor);


        monthCursor.setMonth(
            monthCursor.getMonth() +
            months
        );

    }


    /*
     * Remaining time after years and months.
     */
    let remaining =
        endDate.getTime() -
        monthCursor.getTime();


    const days =
        Math.floor(
            remaining /
            TIME.DAY
        );


    remaining -=
        days *
        TIME.DAY;


    const hours =
        Math.floor(
            remaining /
            TIME.HOUR
        );


    remaining -=
        hours *
        TIME.HOUR;


    const minutes =
        Math.floor(
            remaining /
            TIME.MINUTE
        );


    remaining -=
        minutes *
        TIME.MINUTE;


    const seconds =
        Math.floor(
            remaining /
            TIME.SECOND
        );


    /*
     * Total elapsed days are useful for the cinematic
     * "we have been together for..." presentation.
     */
    const totalDays =
        Math.floor(
            (
                endDate.getTime() -
                startDate.getTime()
            ) /
            TIME.DAY
        );


    return {

        years,

        months,

        days,

        hours,

        minutes,

        seconds,

        totalDays

    };

}


/*=========================================================
    VALUE FORMAT
=========================================================*/

/**
 * Format a counter value.
 *
 * Years/months/days/etc. are displayed using two digits
 * to preserve the visual rhythm of the counter.
 *
 * @param {number} value
 * @returns {string}
 */
function formatValue(value) {

    const safeValue =
        Math.max(
            0,
            Number(value) || 0
        );


    return String(
        safeValue
    ).padStart(
        2,
        "0"
    );

}


/**
 * Format total days without forcing two digits.
 *
 * @param {number} value
 * @returns {string}
 */
function formatTotalDays(value) {

    const safeValue =
        Math.max(
            0,
            Number(value) || 0
        );


    return safeValue.toLocaleString(
        "en-US"
    );

}


/*=========================================================
    RENDER
=========================================================*/

/**
 * Update one visual counter element.
 *
 * @param {HTMLElement|null} element
 * @param {number|string} value
 * @param {boolean} animate
 */
function renderValue(
    element,
    value,
    animate = true
) {

    if (
        !element
    ) {

        return;

    }


    const text =
        formatValue(value);


    /*
     * Avoid unnecessary DOM work.
     */
    if (
        element.dataset.value ===
        text
    ) {

        return;

    }


    const previous =
        element.dataset.value;


    element.dataset.value =
        text;


    element.textContent =
        text;


    /*
     * No visual animation when:
     * - reduced motion is enabled
     * - animation is disabled
     * - this is the first render
     */
    if (
        !animate ||
        Counter.reducedMotion ||
        !previous
    ) {

        return;

    }


    animateValue(
        element
    );

}


/**
 * Render total elapsed days.
 *
 * @param {HTMLElement|null} element
 * @param {number} value
 */
function renderTotalDays(
    element,
    value
) {

    if (
        !element
    ) {

        return;

    }


    const text =
        formatTotalDays(value);


    if (
        element.dataset.value ===
        text
    ) {

        return;

    }


    element.dataset.value =
        text;


    element.textContent =
        text;

}


/*=========================================================
    NUMBER ANIMATION
=========================================================*/

/**
 * Animate an updated number.
 *
 * Uses the Web Animations API when available.
 *
 * @param {HTMLElement} element
 */
function animateValue(element) {

    if (
        !element ||
        Counter.reducedMotion ||
        typeof element.animate !==
        "function"
    ) {

        return;

    }


    /*
     * Cancel the previous animation.
     */
    if (
        element._counterAnimation
    ) {

        try {

            element._counterAnimation.cancel();

        } catch {

            /*
             * Ignore cancellation errors.
             */

        }

    }


    element._counterAnimation =
        element.animate(

            [

                {

                    opacity: 0.35,

                    transform:
                        "translate3d(0, 8px, 0) scale(.96)"

                },

                {

                    opacity: 1,

                    transform:
                        "translate3d(0, 0, 0) scale(1)"

                }

            ],

            {

                duration: 380,

                easing:
                    "cubic-bezier(.22,.61,.36,1)",

                fill:
                    "both"

            }

        );

}


/*=========================================================
    UPDATE COUNTER
=========================================================*/

/**
 * Update all counter values.
 *
 * @returns {Object|null}
 */
function updateCounter() {

    if (
        !Counter.startDate
    ) {

        return null;

    }


    const now =
        new Date();


    const duration =
        calculateDuration(
            Counter.startDate,
            now
        );


    /*
     * Determine which values actually changed.
     */
    const previous =
        Counter.lastValues;


    const changed =
        !previous ||
        previous.years !== duration.years ||
        previous.months !== duration.months ||
        previous.days !== duration.days ||
        previous.hours !== duration.hours ||
        previous.minutes !== duration.minutes ||
        previous.seconds !== duration.seconds ||
        previous.totalDays !== duration.totalDays;


    if (
        !changed
    ) {

        return duration;

    }


    /*
     * Render the calendar duration.
     */
    renderValue(
        Counter.elements.years,
        duration.years,
        Boolean(previous)
    );


    renderValue(
        Counter.elements.months,
        duration.months,
        Boolean(previous)
    );


    if (
        Counter.elements.months &&
        !Counter.elements.months.dataset.value
    ) {
        Counter.elements.months.dataset.value =
            formatValue(duration.months);
        Counter.elements.months.textContent =
            formatValue(duration.months);
    }


    renderValue(
        Counter.elements.days,
        duration.days,
        Boolean(previous)
    );


    renderValue(
        Counter.elements.hours,
        duration.hours,
        Boolean(previous)
    );


    renderValue(
        Counter.elements.minutes,
        duration.minutes,
        Boolean(previous)
    );


    renderValue(
        Counter.elements.seconds,
        duration.seconds,
        Boolean(previous)
    );


    /*
     * Optional total-days display.
     */
    renderTotalDays(
        Counter.elements.totalDays,
        duration.totalDays
    );


    Counter.lastValues =
        duration;


    return duration;

}


/*=========================================================
    TIMER
=========================================================*/

/**
 * Stop the current timer.
 */
function stopTimer() {

    if (
        Counter.timer !== null
    ) {

        window.clearTimeout(
            Counter.timer
        );


        window.clearInterval(
            Counter.timer
        );


        Counter.timer =
            null;

    }

}


/**
 * Start the counter timer.
 *
 * The first update is aligned approximately with the next
 * second boundary, keeping the displayed seconds synchronized
 * with real time.
 */
function startTimer() {

    stopTimer();


    if (
        !Counter.initialized &&
        !Counter.startDate
    ) {

        return;

    }


    if (
        typeof window === "undefined"
    ) {

        return;

    }


    if (
        document.hidden
    ) {

        return;

    }


    const now =
        Date.now();


    const remainder =
        now %
        TIME.SECOND;


    const delay =
        remainder === 0
            ? TIME.SECOND
            : TIME.SECOND - remainder;


    Counter.timer =
        window.setTimeout(
            () => {

                updateCounter();


                Counter.timer =
                    window.setInterval(
                        updateCounter,
                        TIME.SECOND
                    );

            },
            delay
        );

}


/*=========================================================
    VISIBILITY
=========================================================*/

/**
 * Handle browser tab visibility.
 *
 * No counter work is performed while the page is hidden.
 */
function handleVisibilityChange() {

    if (
        document.hidden
    ) {

        stopTimer();

        return;

    }


    if (
        Counter.initialized
    ) {

        /*
         * Immediately synchronize the counter after returning.
         */
        updateCounter();

        startTimer();

    }

}


/**
 * Register visibility listener.
 */
function setupVisibilityListener() {

    if (
        Counter.visibilityHandler
    ) {

        return;

    }


    Counter.visibilityHandler =
        handleVisibilityChange;


    document.addEventListener(
        "visibilitychange",
        Counter.visibilityHandler
    );

}


/**
 * Remove visibility listener.
 */
function removeVisibilityListener() {

    if (
        !Counter.visibilityHandler
    ) {

        return;

    }


    document.removeEventListener(
        "visibilitychange",
        Counter.visibilityHandler
    );


    Counter.visibilityHandler =
        null;

}


/*=========================================================
    INITIALIZATION
=========================================================*/

/**
 * Initialize the love counter.
 *
 * @returns {Promise<Object|null>}
 */
async function initCounter() {

    /*
     * Prevent duplicate initialization.
     */
    if (
        Counter.initialized
    ) {

        return Counter.lastValues;

    }


    /*
     * Prevent simultaneous async initialization.
     */
    if (
        Counter.initializing
    ) {

        return null;

    }


    Counter.initializing =
        true;


    try {

        await loadConfig();


        Counter.elements =
            collectElements();


        /*
         * Nothing to initialize if this page does not
         * contain counter elements.
         */
        if (
            !hasElements()
        ) {

            return null;

        }


        Counter.startDate =
            getStartDate();


        Counter.reducedMotion =
            getReducedMotionPreference();


        setupMotionPreference();


        setupVisibilityListener();


        /*
         * First render should happen immediately.
         */
        updateCounter();


        Counter.initialized =
            true;


        /*
         * Start real-time updates.
         */
        if (
            !document.hidden
        ) {

            startTimer();

        }


        return Counter.lastValues;

    } finally {

        Counter.initializing =
            false;

    }

}


/*=========================================================
    REFRESH
=========================================================*/

/**
 * Force a complete counter refresh.
 *
 * Useful if another part of the website changes the
 * configuration or wants to synchronize the display.
 *
 * @returns {Object|null}
 */
function refreshCounter() {

    if (
        !Counter.initialized
    ) {

        return null;

    }


    Counter.lastValues =
        null;


    return updateCounter();

}


/*=========================================================
    DESTROY
=========================================================*/

/**
 * Completely destroy the counter instance.
 *
 * Clears timers, animations and listeners.
 */
function destroyCounter() {

    stopTimer();


    removeVisibilityListener();


    removeMotionPreference();


    /*
     * Cancel number animations.
     */
    Object.values(
        Counter.elements
    )
    .forEach(
        element => {

            if (
                !element
            ) {

                return;

            }


            if (
                element._counterAnimation
            ) {

                try {

                    element._counterAnimation.cancel();

                } catch {

                    /*
                     * Ignore cancellation errors.
                     */

                }


                element._counterAnimation =
                    null;

            }


            /*
             * Remove internal state added by the counter.
             */
            delete element.dataset.value;

        }
    );


    Counter.config =
        null;


    Counter.startDate =
        null;


    Counter.elements =
        {};


    Counter.lastValues =
        null;


    Counter.initialized =
        false;


    Counter.initializing =
        false;


    Counter.reducedMotion =
        false;

}


/*=========================================================
    PUBLIC API
=========================================================*/

/*
 * Keep the existing global API for compatibility
 * with the rest of the project.
 */
window.initCounter =
    initCounter;


window.updateCounter =
    updateCounter;


window.refreshCounter =
    refreshCounter;


window.destroyCounter =
    destroyCounter;


/*=========================================================
    OPTIONAL AUTO INITIALIZATION
=========================================================*/

/*
 * The counter does not immediately initialize itself.
 *
 * This allows script.js to control the main application
 * startup sequence and prevents unnecessary work when the
 * counter section is not required.
 */
if (
    typeof window !== "undefined"
) {

    window.addEventListener(
        "DOMContentLoaded",
        () => {

            /*
             * Only initialize automatically when a counter
             * element actually exists.
             */
            Counter.elements =
                collectElements();

            if (
                hasElements()
            ) {

                initCounter();

            }

        },
        {
            once: true
        }
    );

}


/*=========================================================
    END OF COUNTER.JS
=========================================================*/