
/*=========================================================
    password.js PRO v6.0
    Premium Password System
=========================================================*/

"use strict";

/*=========================================================
CONFIG
=========================================================*/

const PASSWORD_CONFIG = {

    answer: "حنتوشتي",

    maxAttempts: 5,

    lockTime: 30000,

    lockMinutes: 5,

    fadeDuration: 700,

    loadingDuration: 1200,

    remember: false,

    storageKey: "our-love-password-unlocked"

};


/*=========================================================
STATE
=========================================================*/

const Password = {

    attempts: 0,

    locked: false,

    loading: null,

    screen: null,

    website: null,

    input: null,

    button: null,

    error: null,

    progress: null,

    loadingTimer: null,

    lockTimer: null,

    lockInterval: null,

    initialized: false

};


/*=========================================================
LOAD CONFIG
=========================================================*/

async function loadPasswordConfig(){

    try{

        const module =
            await import("./config.js");


        if(
            module &&
            module.CONFIG &&
            module.CONFIG.password
        ){

            const config =
                module.CONFIG.password;


            if(
                typeof config.answer ===
                "string"
            ){

                PASSWORD_CONFIG.answer =
                    config.answer;

            }


            if(
                Number.isFinite(
                    Number(
                        config.maxAttempts
                    )
                )
            ){

                PASSWORD_CONFIG.maxAttempts =
                    Number(
                        config.maxAttempts
                    );

            }


            if(
                Number.isFinite(
                    Number(
                        config.lockMinutes
                    )
                )
            ){

                PASSWORD_CONFIG.lockMinutes =
                    Number(
                        config.lockMinutes
                    );


                PASSWORD_CONFIG.lockTime =
                    PASSWORD_CONFIG.lockMinutes *
                    60 *
                    1000;

            }


            if(
                typeof config.remember ===
                "boolean"
            ){

                PASSWORD_CONFIG.remember =
                    config.remember;

            }


            if(
                typeof config.enabled ===
                "boolean"
            ){

                PASSWORD_CONFIG.enabled =
                    config.enabled;

            }

        }

    }catch(error){

        console.warn(
            "Password configuration could not be loaded. Using defaults.",
            error
        );

    }

}


/*=========================================================
GET ELEMENT
=========================================================*/

function getPasswordElement(id){

    return document.getElementById(
        id
    );

}


/*=========================================================
INIT
=========================================================*/

async function initPassword(){

    /*
     * Prevent duplicate initialization.
     */

    if(
        Password.initialized
    ){

        return;

    }


    await loadPasswordConfig();


    Password.loading =
        getPasswordElement(
            "loading-screen"
        );


    Password.screen =
        getPasswordElement(
            "password-screen"
        );


    Password.website =
        getPasswordElement(
            "website"
        );


    Password.input =
        getPasswordElement(
            "passwordInput"
        );


    Password.button =
        getPasswordElement(
            "enterBtn"
        );


    Password.error =
        getPasswordElement(
            "password-error"
        );


    Password.opening =
        getPasswordElement(
            "opening"
        );


    Password.enter =
        getPasswordElement(
            "opening-enter"
        );


    Password.visibilityToggle =
        getPasswordElement(
            "password-visibility"
        );


    /*
     * If the password system is disabled,
     * immediately reveal the website.
     */

    if(
        PASSWORD_CONFIG.enabled ===
        false
    ){

        revealWebsiteImmediately();

        Password.initialized =
            true;

        return;

    }


    if(
        !Password.screen ||
        !Password.website ||
        !Password.input ||
        !Password.button
    ){

        console.warn(
            "Password system: required elements are missing."
        );

        return;

    }


    Password.initialized =
        true;


    /*
     * The entry gate is visible now, so the page
     * behind it must not scroll.
     */

    document.body.classList.add(
        "no-scroll"
    );


    /*
     * Check whether the user has already unlocked
     * the website during a previous visit.
     */

    if(
        isRememberedUnlock()
    ){

        revealWebsiteImmediately();

        return;

    }


    startLoading();

    bindEvents();


    /*
     * Put focus on the password field after the
     * loading screen has completed.
     */

    window.setTimeout(
        focusPasswordInput,
        PASSWORD_CONFIG.loadingDuration +
        PASSWORD_CONFIG.fadeDuration
    );

}


/*=========================================================
LOADING SCREEN
=========================================================*/

function startLoading(){

    if(
        !Password.loading
    ){

        return;

    }


    Password.loading.style.opacity =
        "1";


    Password.loading.style.display =
        "flex";


    Password.loading.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Remove a previously generated progress
     * element if initialization happened before.
     */

    const previousProgress =
        Password.loading.querySelector(
            ".loading-progress"
        );


    if(
        previousProgress
    ){

        previousProgress.remove();

    }


    Password.progress =
        document.createElement(
            "div"
        );


    Password.progress.className =
        "loading-progress";


    Password.progress.setAttribute(
        "aria-hidden",
        "true"
    );


    Password.progress.innerHTML =

        `<div class="loading-bar"></div>`;


    Password.loading.appendChild(
        Password.progress
    );


    const bar =
        Password.progress.querySelector(
            ".loading-bar"
        );


    if(
        bar
    ){

        bar.style.width =
            "0%";


        window.requestAnimationFrame(
            () => {

                bar.style.width =
                    "100%";

            }
        );

    }


    clearTimeout(
        Password.loadingTimer
    );


    Password.loadingTimer =
        window.setTimeout(
            finishLoading,
            PASSWORD_CONFIG.loadingDuration
        );

}


/*=========================================================
FINISH LOADING
=========================================================*/

function finishLoading(){

    if(
        !Password.loading
    ){

        return;

    }


    Password.loading.style.opacity =
        "0";


    Password.loading.style.filter =
        "blur(10px)";


    Password.loading.setAttribute(
        "aria-hidden",
        "true"
    );


    window.setTimeout(
        () => {

            if(
                !Password.loading
            ){

                return;

            }


            Password.loading.style.display =
                "none";


            /*
             * Keep the element available instead of
             * permanently removing it. This makes the
             * system safer if it needs to be initialized
             * again.
             */

        },
        PASSWORD_CONFIG.fadeDuration
    );

}


/*=========================================================
FOCUS INPUT
=========================================================*/

function focusPasswordInput(){

    if(
        !Password.input ||
        Password.input.disabled
    ){

        return;

    }


    try{

        Password.input.focus();

    }catch(error){

        /*
         * Some browsers may reject focus if the page
         * is not currently visible.
         */

    }

}


/*=========================================================
SHOW VAULT
=========================================================*/

function showVault(){

    if(
        !Password.opening ||
        !Password.screen
    ){

        return;

    }


    Password.opening.classList.add(
        "is-hidden"
    );


    Password.screen.classList.add(
        "is-visible"
    );


    focusPasswordInput();

}


/*=========================================================
TOGGLE PASSWORD VISIBILITY
=========================================================*/

function togglePasswordVisibility(){

    if(
        !Password.input ||
        !Password.visibilityToggle
    ){

        return;

    }


    const isHidden =
        Password.input.type ===
        "password";


    Password.input.type =
        isHidden
            ? "text"
            : "password";


    Password.visibilityToggle.setAttribute(
        "aria-pressed",
        String(!isHidden)
    );


    Password.visibilityToggle.setAttribute(
        "aria-label",
        isHidden
            ? "إخفاء كلمة المرور"
            : "إظهار كلمة المرور"
    );

}


/*=========================================================
EVENTS
=========================================================*/

function bindEvents(){

    if(
        !Password.button ||
        !Password.input
    ){

        return;

    }


    /*
     * Use named handlers instead of creating anonymous
     * listeners repeatedly.
     */

    Password.button.addEventListener(
        "click",
        attemptLogin
    );


    Password.input.addEventListener(
        "keydown",
        handlePasswordKeydown
    );


    Password.input.addEventListener(
        "input",
        handlePasswordInput
    );


    if(
        Password.enter
    ){

        Password.enter.addEventListener(
            "click",
            showVault
        );

    }


    if(
        Password.visibilityToggle
    ){

        Password.visibilityToggle.addEventListener(
            "click",
            togglePasswordVisibility
        );

    }


    /*
     * Prevent accidental form submission when the
     * surrounding markup contains a form.
     */

    const form =
        Password.input.closest(
            "form"
        );


    if(
        form
    ){

        form.addEventListener(
            "submit",
            handleFormSubmit
        );

    }

}


/*=========================================================
KEYBOARD HANDLER
=========================================================*/

function handlePasswordKeydown(event){

    if(
        event.key ===
        "Enter"
    ){

        event.preventDefault();

        attemptLogin();

    }

}


/*=========================================================
INPUT HANDLER
=========================================================*/

function handlePasswordInput(){

    clearError();


    if(
        Password.input
    ){

        Password.input.classList.remove(
            "input-error"
        );

    }

}


/*=========================================================
FORM HANDLER
=========================================================*/

function handleFormSubmit(event){

    event.preventDefault();

    attemptLogin();

}


/*=========================================================
ATTEMPT LOGIN
=========================================================*/

function attemptLogin(){

    if(
        Password.locked ||
        !Password.input
    ){

        return;

    }


    const value =
        Password.input.value.trim();


    if(
        value === ""
    ){

        showError(
            "اكتب الإجابة أولاً ❤️"
        );


        focusPasswordInput();

        return;

    }


    if(
        value ===
        PASSWORD_CONFIG.answer
    ){

        unlockWebsite();

        return;

    }


    Password.attempts++;


    wrongPassword();

}


/*=========================================================
CLEAR ERROR
=========================================================*/

function clearError(){

    if(
        Password.error
    ){

        Password.error.textContent =
            "";

        Password.error.removeAttribute(
            "role"
        );

    }

}


/*=========================================================
ERROR
=========================================================*/

function showError(message){

    if(
        Password.error
    ){

        Password.error.textContent =
            message;


        Password.error.setAttribute(
            "role",
            "alert"
        );

    }


    if(
        Password.input
    ){

        Password.input.classList.add(
            "input-error"
        );

    }

}


/*=========================================================
WRONG PASSWORD
=========================================================*/

function wrongPassword(){

    showError(
        "❌ الإجابة غير صحيحة"
    );


    shake(
        Password.input
    );


    if(
        Password.input
    ){

        Password.input.select();

    }


    if(
        Password.attempts >=
        PASSWORD_CONFIG.maxAttempts
    ){

        lockInput();

    }

}


/*=========================================================
SHAKE
=========================================================*/

function shake(element){

    if(
        !element ||
        typeof element.animate !==
        "function"
    ){

        return;

    }


    element.animate(

        [

            {

                transform:
                    "translateX(0)"

            },

            {

                transform:
                    "translateX(-10px)"

            },

            {

                transform:
                    "translateX(10px)"

            },

            {

                transform:
                    "translateX(-8px)"

            },

            {

                transform:
                    "translateX(8px)"

            },

            {

                transform:
                    "translateX(0)"

            }

        ],

        {

            duration:
                450,

            easing:
                "ease-out"

        }

    );

}
/*=========================================================
LOCK INPUT
=========================================================*/

function lockInput(){

    if(
        Password.locked
    ){

        return;

    }


    Password.locked =
        true;


    if(
        Password.button
    ){

        Password.button.disabled =
            true;

    }


    if(
        Password.input
    ){

        Password.input.disabled =
            true;

    }


    /*
     * Clear any previous timers before starting a
     * new lock period.
     */

    clearTimeout(
        Password.lockTimer
    );


    clearInterval(
        Password.lockInterval
    );


    let remaining =
        Math.max(
            1,
            Math.ceil(
                PASSWORD_CONFIG.lockTime /
                1000
            )
        );


    updateLockMessage(
        remaining
    );


    Password.lockInterval =
        window.setInterval(
            () => {

                remaining--;

                if(
                    remaining <= 0
                ){

                    unlockInput();

                    return;

                }


                updateLockMessage(
                    remaining
                );

            },
            1000
        );


    Password.lockTimer =
        window.setTimeout(
            unlockInput,
            PASSWORD_CONFIG.lockTime
        );

}


/*=========================================================
LOCK MESSAGE
=========================================================*/

function updateLockMessage(
    seconds
){

    if(
        !Password.error
    ){

        return;

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    let text;


    if(
        minutes > 0
    ){

        text =
            `⏳ حاول بعد ${minutes} دقيقة`;


        if(
            remainingSeconds > 0
        ){

            text +=
                ` و ${remainingSeconds} ثانية`;

        }

    }else{

        text =
            `⏳ حاول بعد ${seconds} ثانية`;

    }


    Password.error.textContent =
        text;


    Password.error.setAttribute(
        "role",
        "alert"
    );

}


/*=========================================================
UNLOCK INPUT
=========================================================*/

function unlockInput(){

    clearTimeout(
        Password.lockTimer
    );


    clearInterval(
        Password.lockInterval
    );


    Password.lockTimer =
        null;


    Password.lockInterval =
        null;


    Password.locked =
        false;


    Password.attempts =
        0;


    if(
        Password.button
    ){

        Password.button.disabled =
            false;

    }


    if(
        Password.input
    ){

        Password.input.disabled =
            false;


        Password.input.value =
            "";


        Password.input.classList.remove(
            "input-error"
        );

    }


    clearError();


    focusPasswordInput();

}


/*=========================================================
REMEMBERED UNLOCK
=========================================================*/

function isRememberedUnlock(){

    if(
        !PASSWORD_CONFIG.remember
    ){

        return false;

    }


    try{

        return (
            localStorage.getItem(
                PASSWORD_CONFIG.storageKey
            ) === "true"
        );

    }catch(error){

        /*
         * localStorage may be blocked by browser
         * privacy settings.
         */

        return false;

    }

}


/*=========================================================
REMEMBER UNLOCK STATE
=========================================================*/

function rememberUnlock(){

    if(
        !PASSWORD_CONFIG.remember
    ){

        return;

    }


    try{

        localStorage.setItem(
            PASSWORD_CONFIG.storageKey,
            "true"
        );

    }catch(error){

        /*
         * Continue normally when storage isn't available.
         */

    }

}


/*=========================================================
FORGET REMEMBERED UNLOCK
=========================================================*/

function forgetRememberedUnlock(){

    try{

        localStorage.removeItem(
            PASSWORD_CONFIG.storageKey
        );

    }catch(error){

        /*
         * Ignore storage errors.
         */

    }

}


/*=========================================================
UNLOCK WEBSITE
=========================================================*/

function unlockWebsite(){

    if(
        !Password.screen ||
        !Password.website
    ){

        return;

    }


    clearError();


    if(
        Password.input
    ){

        Password.input.blur();

    }


    if(
        Password.button
    ){

        Password.button.disabled =
            true;


        Password.button.classList.add(
            "success-button"
        );

    }


    rememberUnlock();


    /*
     * Keep the original visual transition while
     * making the timing configurable.
     */

    if(
        typeof Password.screen.animate ===
        "function"
    ){

        Password.screen.animate(

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
                        "scale(1.08)"

                }

            ],

            {

                duration:
                    PASSWORD_CONFIG.fadeDuration,

                easing:
                    "cubic-bezier(.22,.61,.36,1)",

                fill:
                    "forwards"

            }

        );

    }else{

        Password.screen.style.opacity =
            "0";

    }


    window.setTimeout(
        revealWebsite,
        PASSWORD_CONFIG.fadeDuration
    );

}


/*=========================================================
REVEAL WEBSITE
=========================================================*/

function revealWebsite(){

    if(
        Password.opening
    ){

        Password.opening.classList.add(
            "is-hidden"
        );

    }


    document.body.classList.remove(
        "no-scroll"
    );


    if(
        Password.screen
    ){

        Password.screen.style.display =
            "none";

    }


    if(
        Password.loading
    ){

        Password.loading.style.display =
            "none";

    }


    if(
        Password.website
    ){

        Password.website.classList.remove(
            "hidden"
        );


        Password.website.classList.add(
            "is-visible"
        );


        Password.website.setAttribute(
            "aria-hidden",
            "false"
        );


        if(
            typeof Password.website.animate ===
            "function"
        ){

            Password.website.animate(

                [

                    {

                        opacity:
                            0,

                        transform:
                            "translateY(40px)"

                    },

                    {

                        opacity:
                            1,

                        transform:
                            "translateY(0)"

                    }

                ],

                {

                    duration:
                        900,

                    easing:
                        "ease-out",

                    fill:
                        "forwards"

                }

            );

        }

    }


    initializeWebsiteModules();

}


/*=========================================================
REVEAL WEBSITE IMMEDIATELY
=========================================================*/

function revealWebsiteImmediately(){

    if(
        Password.opening
    ){

        Password.opening.classList.add(
            "is-hidden"
        );

    }


    document.body.classList.remove(
        "no-scroll"
    );


    if(
        Password.loading
    ){

        Password.loading.style.display =
            "none";

        Password.loading.style.opacity =
            "0";

        Password.loading.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if(
        Password.screen
    ){

        Password.screen.style.display =
            "none";

    }


    if(
        Password.website
    ){

        Password.website.classList.remove(
            "hidden"
        );


        Password.website.classList.add(
            "is-visible"
        );


        Password.website.style.opacity =
            "1";


        Password.website.style.transform =
            "none";


        Password.website.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    initializeWebsiteModules();

}


/*=========================================================
INITIALIZE WEBSITE MODULES
=========================================================*/

function initializeWebsiteModules(){
    
    if(
    typeof window.initMusic === "function"
){

    window.initMusic()
        .then(() => {

            if(
                typeof window.playMusic ===
                "function"
            ){

                window.playMusic();

            }

        })
        .catch(() => {

            /* Music failure is reported by the music module. */

        });

}
    /*
     * Existing modules are initialized only if their
     * public functions are available.
     */

    if(
        typeof window.initAnimations ===
        "function"
    ){

        try{

            window.initAnimations();

        }catch(error){

            console.error(
                "Animations initialization failed:",
                error
            );

        }

    }


    if(
        typeof window.initGallery ===
        "function"
    ){

        try{

            window.initGallery();

        }catch(error){

            console.error(
                "Gallery initialization failed:",
                error
            );

        }

    }


    if(
        typeof window.initCounter ===
        "function"
    ){

        try{

            window.initCounter();

        }catch(error){

            console.error(
                "Counter initialization failed:",
                error
            );

        }

    }

}


/*=========================================================
RESET PASSWORD SYSTEM
=========================================================*/

function resetPasswordSystem(){

    clearTimeout(
        Password.loadingTimer
    );


    clearTimeout(
        Password.lockTimer
    );


    clearInterval(
        Password.lockInterval
    );


    Password.loadingTimer =
        null;


    Password.lockTimer =
        null;


    Password.lockInterval =
        null;


    Password.attempts =
        0;


    Password.locked =
        false;


    if(
        Password.input
    ){

        Password.input.disabled =
            false;

        Password.input.value =
            "";

        Password.input.classList.remove(
            "input-error"
        );

    }


    if(
        Password.button
    ){

        Password.button.disabled =
            false;

        Password.button.classList.remove(
            "success-button"
        );

    }


    clearError();


    forgetRememberedUnlock();

}


/*=========================================================
PUBLIC API
=========================================================*/

window.initPassword =
    initPassword;


window.resetPasswordSystem =
    resetPasswordSystem;


window.forgetPasswordUnlock =
    forgetRememberedUnlock;


/*=========================================================
AUTO START
=========================================================*/

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initPassword();

        },
        {
            once: true
        }
    );

}else{

    initPassword();

}


/*=========================================================
END OF PASSWORD.JS
=========================================================*/
