/*=========================================================
    utils.js
    Premium Utility Library
    Version 6.0
=========================================================*/

"use strict";


/*=========================================================
RANDOM
=========================================================*/

/**
 * Returns a random floating-point number between min
 * and max.
 */
export function random(
    min,
    max
){

    min = Number(min);
    max = Number(max);


    if(
        !Number.isFinite(min) ||
        !Number.isFinite(max)
    ){

        return 0;

    }


    if(
        min > max
    ){

        [
            min,
            max
        ] = [
            max,
            min
        ];

    }


    return Math.random() *
        (
            max - min
        ) +
        min;

}


/**
 * Returns a random integer between min and max,
 * inclusive.
 */
export function randomInt(
    min,
    max
){

    min = Math.ceil(
        Number(min)
    );

    max = Math.floor(
        Number(max)
    );


    if(
        !Number.isFinite(min) ||
        !Number.isFinite(max)
    ){

        return 0;

    }


    if(
        min > max
    ){

        [
            min,
            max
        ] = [
            max,
            min
        ];

    }


    return Math.floor(
        Math.random() *
        (
            max - min + 1
        )
    ) + min;

}


/*=========================================================
MATH
=========================================================*/

/**
 * Restricts a value to a specific range.
 */
export function clamp(
    value,
    min,
    max
){

    value = Number(value);
    min = Number(min);
    max = Number(max);


    if(
        !Number.isFinite(value)
    ){

        value = 0;

    }


    if(
        !Number.isFinite(min)
    ){

        min = 0;

    }


    if(
        !Number.isFinite(max)
    ){

        max = 1;

    }


    if(
        min > max
    ){

        [
            min,
            max
        ] = [
            max,
            min
        ];

    }


    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );

}


/**
 * Linear interpolation.
 */
export function lerp(
    start,
    end,
    t
){

    start = Number(start);
    end = Number(end);
    t = Number(t);


    if(
        !Number.isFinite(start)
    ){

        start = 0;

    }


    if(
        !Number.isFinite(end)
    ){

        end = 0;

    }


    if(
        !Number.isFinite(t)
    ){

        t = 0;

    }


    return start +
        (
            end - start
        ) *
        t;

}


/**
 * Maps a value from one range to another.
 */
export function map(
    value,
    inMin,
    inMax,
    outMin,
    outMax
){

    value = Number(value);
    inMin = Number(inMin);
    inMax = Number(inMax);
    outMin = Number(outMin);
    outMax = Number(outMax);


    if(
        !Number.isFinite(value) ||
        !Number.isFinite(inMin) ||
        !Number.isFinite(inMax) ||
        !Number.isFinite(outMin) ||
        !Number.isFinite(outMax)
    ){

        return 0;

    }


    /*
     * Prevent division by zero when the input range
     * contains identical boundaries.
     */
    if(
        inMin === inMax
    ){

        return outMin;

    }


    return (
        (
            value - inMin
        ) *
        (
            outMax - outMin
        ) /
        (
            inMax - inMin
        )
    ) +
    outMin;

}


/*=========================================================
DOM
=========================================================*/

/**
 * Query a single element.
 */
export function qs(
    selector,
    parent = document
){

    if(
        typeof selector !==
        "string" ||
        !selector.trim()
    ){

        return null;

    }


    if(
        !parent ||
        typeof parent.querySelector !==
        "function"
    ){

        return null;

    }


    try{

        return parent.querySelector(
            selector
        );

    }catch(error){

        console.warn(
            "Invalid selector:",
            selector,
            error
        );


        return null;

    }

}


/**
 * Query multiple elements.
 */
export function qsa(
    selector,
    parent = document
){

    if(
        typeof selector !==
        "string" ||
        !selector.trim()
    ){

        return [];

    }


    if(
        !parent ||
        typeof parent.querySelectorAll !==
        "function"
    ){

        return [];

    }


    try{

        return Array.from(
            parent.querySelectorAll(
                selector
            )
        );

    }catch(error){

        console.warn(
            "Invalid selector:",
            selector,
            error
        );


        return [];

    }

}


/**
 * Creates a DOM element and optionally assigns a
 * class name.
 */
export function create(
    tag,
    className = ""
){

    if(
        typeof tag !==
        "string" ||
        !tag.trim()
    ){

        throw new TypeError(
            "create() requires a valid tag name."
        );

    }


    const element =
        document.createElement(
            tag
        );


    if(
        typeof className ===
        "string" &&
        className.trim()
    ){

        element.className =
            className;

    }


    return element;

}


/*=========================================================
ATTRIBUTES
=========================================================*/

/**
 * Assigns multiple HTML attributes.
 */
export function setAttributes(
    element,
    attributes
){

    if(
        !element ||
        typeof element.setAttribute !==
        "function"
    ){

        return element;

    }


    if(
        !attributes ||
        typeof attributes !==
        "object"
    ){

        return element;

    }


    Object.entries(
        attributes
    ).forEach(
        ([key,value]) => {

            if(
                value === null ||
                value === undefined
            ){

                element.removeAttribute(
                    key
                );

                return;

            }


            element.setAttribute(
                key,
                String(value)
            );

        }
    );


    return element;

}


/*=========================================================
STYLE
=========================================================*/

/**
 * Applies multiple inline styles.
 */
export function css(
    element,
    styles
){

    if(
        !element ||
        !element.style ||
        !styles ||
        typeof styles !==
        "object"
    ){

        return element;

    }


    Object.assign(
        element.style,
        styles
    );


    return element;

}


/*=========================================================
REMOVE
=========================================================*/

/**
 * Removes an element immediately or after a delay.
 *
 * Returns the timer ID when delayed.
 */
export function remove(
    element,
    delay = 0
){

    if(
        !element
    ){

        return null;

    }


    delay =
        Number(delay);


    if(
        !Number.isFinite(delay) ||
        delay < 0
    ){

        delay = 0;

    }


    if(
        delay === 0
    ){

        if(
            typeof element.remove ===
            "function"
        ){

            element.remove();

        }

        return null;

    }


    return setTimeout(
        () => {

            if(
                element &&
                typeof element.remove ===
                "function"
            ){

                element.remove();

            }

        },
        delay
    );

}


/*=========================================================
WAIT
=========================================================*/

/**
 * Resolves after the specified amount of time.
 */
export function wait(
    ms
){

    ms =
        Number(ms);


    if(
        !Number.isFinite(ms) ||
        ms < 0
    ){

        ms = 0;

    }


    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                ms
            );

        }
    );

}


/*=========================================================
IDLE
=========================================================*/

/**
 * Executes a callback when the browser is idle.
 */
export function idle(
    callback,
    options = {}
){

    if(
        typeof callback !==
        "function"
    ){

        return null;

    }


    const timeout =
        Number(
            options.timeout
        );


    if(
        typeof window !==
        "undefined" &&
        typeof window.requestIdleCallback ===
        "function"
    ){

        const idleOptions = {};


        if(
            Number.isFinite(timeout) &&
            timeout >= 0
        ){

            idleOptions.timeout =
                timeout;

        }


        return window.requestIdleCallback(
            callback,
            idleOptions
        );

    }


    return setTimeout(
        () => {

            callback({

                didTimeout:
                    false,

                timeRemaining:
                    () => 0

            });

        },
        1
    );

}


/*=========================================================
RAF
=========================================================*/

/**
 * Resolves on the next animation frame.
 */
export function nextFrame(){

    return new Promise(
        resolve => {

            if(
                typeof requestAnimationFrame ===
                "function"
            ){

                requestAnimationFrame(
                    resolve
                );

                return;

            }


            setTimeout(
                resolve,
                16
            );

        }
    );

}


/*=========================================================
EVENT HELPERS
=========================================================*/

/**
 * Creates a debounced function.
 */
export function debounce(
    callback,
    delay = 250
){

    if(
        typeof callback !==
        "function"
    ){

        throw new TypeError(
            "debounce() requires a function."
        );

    }


    delay =
        Number(delay);


    if(
        !Number.isFinite(delay) ||
        delay < 0
    ){

        delay = 250;

    }


    let timer =
        null;


    const debounced =
        function(...args){

            clearTimeout(
                timer
            );


            timer =
                setTimeout(
                    () => {

                        timer =
                            null;

                        callback.apply(
                            this,
                            args
                        );

                    },
                    delay
                );

        };


    /*
     * Allow callers to cancel a pending execution.
     */
    debounced.cancel =
        () => {

            clearTimeout(
                timer
            );

            timer =
                null;

        };


    return debounced;

}


/**
 * Creates a throttled function.
 */
export function throttle(
    callback,
    delay = 100
){

    if(
        typeof callback !==
        "function"
    ){

        throw new TypeError(
            "throttle() requires a function."
        );

    }


    delay =
        Number(delay);


    if(
        !Number.isFinite(delay) ||
        delay < 0
    ){

        delay = 100;

    }


    let waiting =
        false;


    let timeout =
        null;


    const throttled =
        function(...args){

            if(
                waiting
            ){

                return;

            }


            callback.apply(
                this,
                args
            );


            waiting =
                true;


            timeout =
                setTimeout(
                    () => {

                        waiting =
                            false;

                        timeout =
                            null;

                    },
                    delay
                );

        };


    /*
     * Allow pending throttle state to be cancelled.
     */
    throttled.cancel =
        () => {

            clearTimeout(
                timeout
            );


            timeout =
                null;


            waiting =
                false;

        };


    return throttled;

}


/*=========================================================
DEVICE
=========================================================*/

/**
 * Returns true when the viewport is considered mobile.
 */
export function isMobile(){

    if(
        typeof window ===
        "undefined" ||
        typeof window.matchMedia !==
        "function"
    ){

        return false;

    }


    return window.matchMedia(
        "(max-width: 768px)"
    ).matches;

}


/**
 * Returns true when the viewport is considered tablet.
 */
export function isTablet(){

    if(
        typeof window ===
        "undefined" ||
        typeof window.matchMedia !==
        "function"
    ){

        return false;

    }


    return window.matchMedia(
        "(min-width: 769px) and (max-width: 1024px)"
    ).matches;

}


/**
 * Returns true when the viewport is considered desktop.
 */
export function isDesktop(){

    if(
        typeof window ===
        "undefined" ||
        typeof window.matchMedia !==
        "function"
    ){

        return false;

    }


    return window.matchMedia(
        "(min-width: 1025px)"
    ).matches;

}
/*=========================================================
WINDOW
=========================================================*/

/**
 * Returns the current viewport dimensions.
 */
export function viewport(){

    if(
        typeof window ===
        "undefined"
    ){

        return{

            width: 0,

            height: 0

        };

    }


    return{

        width:
            window.innerWidth,

        height:
            window.innerHeight

    };

}


/*=========================================================
LOCAL STORAGE
=========================================================*/

export const Storage = {

    /**
     * Saves a value to localStorage.
     */
    save(
        key,
        value
    ){

        if(
            typeof key !==
            "string" ||
            !key.trim()
        ){

            return false;

        }


        try{

            localStorage.setItem(

                key,

                JSON.stringify(
                    value
                )

            );


            return true;

        }catch(error){

            console.warn(
                "Storage.save() failed:",
                error
            );


            return false;

        }

    },


    /**
     * Loads a value from localStorage.
     */
    load(
        key,
        def = null
    ){

        if(
            typeof key !==
            "string" ||
            !key.trim()
        ){

            return def;

        }


        try{

            const value =
                localStorage.getItem(
                    key
                );


            if(
                value === null
            ){

                return def;

            }


            return JSON.parse(
                value
            );

        }catch(error){

            console.warn(
                "Storage.load() failed:",
                error
            );


            return def;

        }

    },


    /**
     * Removes a specific localStorage item.
     */
    remove(
        key
    ){

        if(
            typeof key !==
            "string" ||
            !key.trim()
        ){

            return false;

        }


        try{

            localStorage.removeItem(
                key
            );


            return true;

        }catch(error){

            console.warn(
                "Storage.remove() failed:",
                error
            );


            return false;

        }

    },


    /**
     * Clears localStorage.
     *
     * Note:
     * This clears all localStorage entries belonging
     * to the current origin.
     */
    clear(){

        try{

            localStorage.clear();


            return true;

        }catch(error){

            console.warn(
                "Storage.clear() failed:",
                error
            );


            return false;

        }

    }

};


/*=========================================================
UUID
=========================================================*/

/**
 * Generates a UUID v4.
 *
 * Uses the browser's cryptographically secure UUID
 * generator when available and falls back to a
 * Math.random-based implementation otherwise.
 */
export function uuid(){

    if(
        typeof crypto !==
        "undefined" &&
        typeof crypto.randomUUID ===
        "function"
    ){

        return crypto.randomUUID();

    }


    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"

        .replace(
            /[xy]/g,
            function(c){

                const r =
                    Math.random() * 16 |
                    0;


                const v =
                    c === "x"

                        ? r

                        : (
                            r & 0x3
                        ) |
                        0x8;


                return v.toString(
                    16
                );

            }
        );

}


/*=========================================================
COLORS
=========================================================*/

/**
 * Returns a random color from the website's
 * predefined premium palette.
 */
export function randomColor(){

    const colors = [

        "#ff2d55",

        "#ff6b81",

        "#ff8cab",

        "#9b5cff",

        "#5b8cff",

        "#7ef9ff",

        "#ffffff"

    ];


    return colors[
        randomInt(
            0,
            colors.length - 1
        )
    ];

}


/*=========================================================
HEX → RGBA
=========================================================*/

/**
 * Converts a HEX color to an RGBA string.
 *
 * Supports:
 * #RGB
 * #RRGGBB
 * #RRGGBBAA
 */
export function hexToRGBA(
    hex,
    alpha = 1
){

    if(
        typeof hex !==
        "string"
    ){

        return null;

    }


    let value =
        hex.trim()
        .replace(
            /^#/,
            ""
        );


    /*
     * Support shorthand HEX colors:
     * #fff → #ffffff
     */
    if(
        value.length === 3
    ){

        value =
            value
                .split("")
                .map(
                    char =>
                        char + char
                )
                .join("");

    }


    /*
     * Support 8-digit HEX values by ignoring
     * the embedded alpha channel. The explicit
     * alpha argument remains the final opacity.
     */
    if(
        value.length === 8
    ){

        value =
            value.slice(
                0,
                6
            );

    }


    if(
        !/^[0-9a-fA-F]{6}$/.test(
            value
        )
    ){

        return null;

    }


    const r =
        parseInt(
            value.slice(
                0,
                2
            ),
            16
        );


    const g =
        parseInt(
            value.slice(
                2,
                4
            ),
            16
        );


    const b =
        parseInt(
            value.slice(
                4,
                6
            ),
            16
        );


    alpha =
        Number(alpha);


    if(
        !Number.isFinite(alpha)
    ){

        alpha = 1;

    }


    alpha =
        clamp(
            alpha,
            0,
            1
        );


    return `rgba(${r},${g},${b},${alpha})`;

}


/*=========================================================
END OF UTILS.JS
=========================================================*/
