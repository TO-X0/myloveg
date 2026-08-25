/* =========================================================
   ❤️ إلى غدير ❤️
   VERSION 2.0 — DIGITAL LOVE EXPERIENCE

   FILE: js/script.js

   Core Website Controller
   ---------------------------------------------------------
   Responsibilities:
   - Opening / Vault experience
   - Navigation
   - Story scrolling
   - Reveal animations
   - Scroll progress
   - Cursor interaction
   - Floating atmosphere
   - Music control
   - Gallery / Lightbox
   - Generic UI interactions
   - Accessibility
   - Performance management
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL APPLICATION
   ========================================================= */

const LoveExperience = {

    state: {

        initialized: false,

        unlocked: false,

        menuOpen: false,

        lightboxOpen: false,

        musicPlaying: false,

        currentGalleryIndex: 0,

        scrollTicking: false,

        resizeTimer: null,

        cursorEnabled: false,

        reducedMotion: false,

        touchDevice: false,

        pageVisible: true,

        previousFocus: null

    },


    elements: {

        body: null,

        html: null,

        navbar: null,

        nav: null,

        menuToggle: null,

        passwordScreen: null,

        passwordInput: null,

        passwordButton: null,

        passwordError: null,

        musicToggle: null,

        audio: null,

        lightbox: null,

        lightboxImage: null,

        lightboxClose: null,

        lightboxNext: null,

        lightboxPrevious: null,

        lightboxFullscreen: null,

        backTop: null,

        scrollProgress: null,

        cursorGlow: null

    },


    gallery: [],

    observers: [],

    timers: new Set(),

    listeners: [],

    rafs: new Set()


};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector, parent = document) {

    return parent.querySelector(selector);

}


function $$(selector, parent = document) {

    return Array.from(
        parent.querySelectorAll(selector)
    );

}


function on(
    target,
    event,
    handler,
    options
) {

    if (!target) {
        return;
    }

    target.addEventListener(
        event,
        handler,
        options
    );

    LoveExperience.listeners.push({
        target,
        event,
        handler,
        options
    });

}


function setTimer(callback, delay) {

    const timer = window.setTimeout(() => {

        LoveExperience.timers.delete(timer);

        callback();

    }, delay);

    LoveExperience.timers.add(timer);

    return timer;

}


function cancelTimer(timer) {

    if (!timer) {
        return;
    }

    window.clearTimeout(timer);

    LoveExperience.timers.delete(timer);

}


function nextFrame(callback) {

    const id = window.requestAnimationFrame(
        (time) => {

            LoveExperience.rafs.delete(id);

            callback(time);

        }
    );

    LoveExperience.rafs.add(id);

    return id;

}


/* =========================================================
   ENVIRONMENT
   ========================================================= */

function detectEnvironment() {

    LoveExperience.state.touchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;


    LoveExperience.state.reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    LoveExperience.state.cursorEnabled =
        !LoveExperience.state.touchDevice &&
        !LoveExperience.state.reducedMotion &&
        typeof window.matchMedia === "function" &&
        window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        ).matches;

}


function cacheElements() {

    const elements =
        LoveExperience.elements;


    elements.body =
        document.body;

    elements.html =
        document.documentElement;


    elements.navbar =
        $(
            ".glass-navbar, .main-navbar, [data-navbar], .site-header"
        );


    elements.nav =
        $(
            ".glass-navbar nav, .main-navbar nav, [data-navigation], .mobile-navigation"
        );


    elements.menuToggle =
        $(
            "#menuToggle, #mobile-menu-toggle, .menu-toggle, .nav-toggle, [data-menu-toggle]"
        );


    elements.passwordScreen =
        $(
            "#password-screen, [data-password-screen]"
        );


    elements.passwordInput =
        $(
            "#passwordInput, [data-password-input]"
        );


    elements.passwordButton =
        $(
            "#enterBtn, [data-password-submit]"
        );


    elements.passwordError =
        $(
            "#error, [data-password-error]"
        );


    elements.musicToggle =
        $(
            "#musicToggle, .music-toggle, [data-music-toggle]"
        );


    elements.audio =
        $(
            "audio"
        );


    elements.lightbox =
        $(
            "#lightbox, [data-lightbox]"
        );


    elements.lightboxImage =
        $(
            "#lightboxImage, [data-lightbox-image]"
        );


    elements.lightboxClose =
        $(
            "#closeLightbox"
        );


    elements.lightboxNext =
        $(
            "#nextImage, #lightboxNext, [data-lightbox-next]"
        );


    elements.lightboxPrevious =
        $(
            "#prevImage, #lightboxPrevious, [data-lightbox-prev]"
        );


    elements.lightboxFullscreen =
        $(
            "#fullscreenImage, #lightboxFullscreen, [data-lightbox-fullscreen]"
        );


    elements.backTop =
        $(
            "#backTop, [data-back-top]"
        );


    elements.scrollProgress =
        $(
            ".scroll-progress, [data-scroll-progress]"
        );


    elements.cursorGlow =
        $(
            ".cursor-glow, [data-cursor-glow]"
        );

}


/* =========================================================
   WEBSITE INITIALIZATION
   ========================================================= */

function initializeWebsite() {

    if (window.__loveExperienceInitialized) {
        return;
    }

    if (LoveExperience.state.initialized) {
        return;
    }


    window.__loveExperienceInitialized =
        true;

    LoveExperience.state.initialized =
        true;


    detectEnvironment();

    cacheElements();

    initializePage();

    initializePasswordVault();

    initializeNavigation();

    initializeScrollSystem();

    initializeRevealSystem();

    initializeStoryProgress();

    initializeGallery();

    initializeLightbox();

    initializeMusic();

    initializeAtmosphere();

    initializeCursor();

    initializeButtons();

    initializeForms();

    initializeModals();

    initializeTabs();

    initializeAccordion();

    initializeLazyImages();

    initializeAccessibility();

    initializeConnectionStatus();

    initializeDynamicYear();

    initializeBackToTop();

    initializePageVisibility();

    initializeResizeHandler();

    initializeKeyboardNavigation();

    initializeGlobalInteractions();

}


/* =========================================================
   PAGE BOOT
   ========================================================= */

function initializePage() {

    LoveExperience.elements.html
        .classList
        .add("js-enabled");


    nextFrame(() => {

        LoveExperience.elements.body
            .classList
            .add("page-ready");

    });

}


/* =========================================================
   PASSWORD / SECRET LOVE VAULT
   ========================================================= */

function initializePasswordVault() {

    /*
     * The dedicated password module (js/password.js)
     * owns the vault when it is available.
     */

    if (
        typeof window.initPassword ===
        "function"
    ) {
        return;
    }

    const screen =
        LoveExperience.elements.passwordScreen;

    const input =
        LoveExperience.elements.passwordInput;

    const button =
        LoveExperience.elements.passwordButton;

    const error =
        LoveExperience.elements.passwordError;


    if (!screen || !input || !button) {
        LoveExperience.state.unlocked = true;
        return;
    }


    const correctPassword =
        screen.dataset.password || "";


    document.body.classList.add(
        "no-scroll"
    );


    function showError(message) {

        if (error) {

            error.textContent =
                message ||
                "كلمة المرور غير صحيحة ❤️";

        }


        const box =
            $(".password-box", screen) ||
            $(".vault-card", screen) ||
            screen;


        box.classList.remove(
            "shake"
        );


        void box.offsetWidth;


        box.classList.add(
            "shake"
        );


        input.setAttribute(
            "aria-invalid",
            "true"
        );


        input.focus();

    }


    function unlock() {

        const value =
            input.value.trim();


        if (!correctPassword) {

            completeUnlock();

            return;

        }


        if (value !== correctPassword) {

            showError();

            return;

        }


        completeUnlock();

    }


    function completeUnlock() {

        LoveExperience.state.unlocked =
            true;


        input.value = "";


        input.setAttribute(
            "aria-invalid",
            "false"
        );


        if (error) {
            error.textContent = "";
        }


        screen.classList.add(
            "unlocking"
        );


        screen.classList.add(
            "success"
        );


        setTimer(() => {

            screen.classList.add(
                "hidden"
            );


            document.body.classList.remove(
                "no-scroll"
            );


            screen.setAttribute(
                "aria-hidden",
                "true"
            );


            triggerVaultReveal();

        }, 500);


    }


    on(
        button,
        "click",
        unlock
    );


    on(
        input,
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                unlock();

            }

        }
    );


    const toggle =
        $(
            "[data-toggle-password]",
            screen
        );


    if (toggle) {

        on(
            toggle,
            "click",
            () => {

                const visible =
                    input.type === "text";


                input.type =
                    visible
                        ? "password"
                        : "text";


                toggle.setAttribute(
                    "aria-label",
                    visible
                        ? "إظهار كلمة المرور"
                        : "إخفاء كلمة المرور"
                );

            }
        );

    }


    setTimer(
        () => input.focus(),
        100
    );

}


function triggerVaultReveal() {

    document.body.classList.add(
        "love-experience-unlocked"
    );


    const hero =
        $(
            "#hero, .hero, [data-hero]"
        );


    if (hero) {

        hero.classList.add(
            "hero-entered"
        );

    }


    const opening =
        $(
            ".opening-experience, [data-opening]"
        );


    if (opening) {

        opening.classList.add(
            "opening-complete"
        );

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const {
        navbar,
        nav,
        menuToggle
    } = LoveExperience.elements;


    if (!navbar && !nav) {
        return;
    }


    const links =
        $$(
            'a[href^="#"]',
            nav || document
        );


    function closeMenu() {

        if (!nav) {
            return;
        }


        nav.classList.remove(
            "active",
            "open",
            "is-open"
        );


        if (menuToggle) {

            menuToggle.classList.remove(
                "is-active"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        LoveExperience.state.menuOpen =
            false;

    }


    function openMenu() {

        if (!nav) {
            return;
        }


        nav.classList.add(
            "active",
            "open",
            "is-open"
        );


        if (menuToggle) {

            menuToggle.classList.add(
                "is-active"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        LoveExperience.state.menuOpen =
            true;

    }


    if (menuToggle) {

        on(
            menuToggle,
            "click",
            () => {

                if (
                    LoveExperience.state.menuOpen
                ) {

                    closeMenu();

                } else {

                    openMenu();

                }

            }
        );

    }


    const mobileClose =
        $("#mobile-menu-close");

    if (mobileClose) {

        on(
            mobileClose,
            "click",
            () => {

                closeMenu();

            }
        );

    }


    links.forEach((link) => {

        on(
            link,
            "click",
            (event) => {

                const href =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !href ||
                    href === "#" ||
                    !href.startsWith("#")
                ) {

                    closeMenu();

                    return;

                }


                const target =
                    document.querySelector(
                        href
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                scrollToElement(
                    target
                );


                closeMenu();

            }
        );

    });


    on(
        document,
        "click",
        (event) => {

            if (
                !LoveExperience.state.menuOpen
            ) {
                return;
            }


            if (
                nav &&
                !nav.contains(
                    event.target
                ) &&
                menuToggle &&
                !menuToggle.contains(
                    event.target
                )
            ) {

                closeMenu();

            }

        }
    );


    on(
        document,
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeMenu();

            }

        }
    );


    initializeActiveNavigation();

}


function scrollToElement(element) {

    if (!element) {
        return;
    }


    const navbar =
        LoveExperience.elements.navbar;


    const offset =
        navbar
            ? navbar.offsetHeight + 20
            : 20;


    const position =
        element.getBoundingClientRect().top +
        window.scrollY -
        offset;


    window.scrollTo({

        top:
            Math.max(
                position,
                0
            ),

        behavior:
            LoveExperience.state.reducedMotion
                ? "auto"
                : "smooth"

    });

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function initializeActiveNavigation() {

    const sections =
        $$(
            "main section[id], section[id]"
        );


    const links =
        $$(
            '.glass-navbar a[href^="#"],' +
            '.main-navbar a[href^="#"],' +
            '[data-navigation] a[href^="#"],' +
            '[data-nav-link]'
        );


    if (
        !sections.length ||
        !links.length
    ) {
        return;
    }


    if (
        !("IntersectionObserver" in window)
    ) {
        return;
    }


    const map =
        new Map();


    links.forEach((link) => {

        const href =
            link.getAttribute(
                "href"
            );


        if (href) {
            map.set(
                href,
                link
            );
        }

    });


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        links.forEach(
                            (link) => {

                                link.classList.remove(
                                    "is-active"
                                );

                            }
                        );


                        const active =
                            map.get(
                                `#${entry.target.id}`
                            );


                        if (active) {

                            active.classList.add(
                                "is-active"
                            );

                        }

                    }
                );

            },
            {

                rootMargin:
                    "-35% 0px -55% 0px",

                threshold:
                    0

            }
        );


    sections.forEach(
        (section) => {

            observer.observe(
                section
            );

        }
    );


    LoveExperience.observers.push(
        observer
    );

}


/* =========================================================
   SCROLL SYSTEM
   ========================================================= */

function initializeScrollSystem() {

    const navbar =
        LoveExperience.elements.navbar;


    let ticking = false;


    function update() {

        const scrollY =
            window.scrollY;


        if (navbar) {

            navbar.classList.toggle(
                "is-scrolled",
                scrollY > 40
            );

        }


        updateScrollProgress(
            scrollY
        );


        updateStoryProgress();


        ticking = false;

    }


    on(
        window,
        "scroll",
        () => {

            if (ticking) {
                return;
            }


            ticking = true;


            nextFrame(update);

        },
        {
            passive: true
        }
    );


    update();

}


function updateScrollProgress(scrollY) {

    let progress =
        LoveExperience.elements.scrollProgress;


    if (!progress) {

        progress =
            document.createElement(
                "div"
            );


        progress.className =
            "scroll-progress";


        progress.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.prepend(
            progress
        );


        LoveExperience.elements.scrollProgress =
            progress;

    }


    const bar =
        $(".scroll-progress__bar", progress) ||
        progress;


    const height =
        document.documentElement
            .scrollHeight -
        window.innerHeight;


    if (height <= 0) {

        bar.style.width =
            "0%";

        return;

    }


    const value =
        Math.min(
            Math.max(
                scrollY / height,
                0
            ),
            1
        );


    bar.style.width =
        `${value * 100}%`;

}


/* =========================================================
   STORY PROGRESS
   ========================================================= */

function initializeStoryProgress() {

    const timeline =
        $(
            "[data-story-progress], .story-progress, [data-timeline]"
        );


    if (!timeline) {
        return;
    }


    updateStoryProgress();

}


function updateStoryProgress() {

    const timeline =
        $(
            "[data-story-progress], .story-progress, [data-timeline]"
        );


    if (!timeline) {
        return;
    }


    const story =
        $(
            "[data-story], .story-section, #story"
        );


    if (!story) {
        return;
    }


    const fill =
        $(
            ".story-timeline__progress",
            timeline
        ) ||
        timeline;


    const rect =
        story.getBoundingClientRect();


    const total =
        story.offsetHeight -
        window.innerHeight;


    if (total <= 0) {
        return;
    }


    const passed =
        Math.min(
            Math.max(
                -rect.top / total,
                0
            ),
            1
        );


    timeline.style.setProperty(
        "--story-progress",
        passed
    );


    fill.style.height =
        `${passed * 100}%`;

}


/* =========================================================
   REVEAL SYSTEM
   ========================================================= */

function initializeRevealSystem() {

    const elements =
        $$(
            ".reveal," +
            ".reveal-left," +
            ".reveal-right," +
            ".reveal-scale," +
            ".reveal-blur," +
            "[data-reveal]"
        );


    if (!elements.length) {
        return;
    }


    if (
        LoveExperience.state.reducedMotion ||
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            revealElement
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            (
                entries,
                observerInstance
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        revealElement(
                            entry.target
                        );


                        observerInstance.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {

                threshold:
                    0.12,

                rootMargin:
                    "0px 0px -50px 0px"

            }
        );


    elements.forEach(
        (element) => {

            observer.observe(
                element
            );

        }
    );


    LoveExperience.observers.push(
        observer
    );

}


function revealElement(element) {

    element.classList.add(
        "active",
        "show",
        "visible",
        "revealed"
    );

}


/* =========================================================
   GALLERY
   ========================================================= */

function initializeGallery() {

    const items =
        $$(
            ".gallery-item," +
            "[data-gallery-item]"
        );


    if (!items.length) {
        return;
    }


    LoveExperience.gallery =
        items;


    items.forEach(
        (item, index) => {

            if (
                !item.hasAttribute(
                    "tabindex"
                )
            ) {

                item.setAttribute(
                    "tabindex",
                    "0"
                );

            }


            if (
                !item.hasAttribute(
                    "role"
                )
            ) {

                item.setAttribute(
                    "role",
                    "button"
                );

            }


            item.dataset.galleryIndex =
                String(index);


            on(
                item,
                "click",
                () => {

                    openGallery(
                        index
                    );

                }
            );


            on(
                item,
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        openGallery(
                            index
                        );

                    }

                }
            );

        }
    );

}


function getGalleryImage(item) {

    if (!item) {
        return null;
    }


    return $(
        "img, .gallery-image",
        item
    );

}


function getImageSource(image) {

    if (!image) {
        return "";
    }


    return (
        image.currentSrc ||
        image.src ||
        image.dataset.src ||
        image.getAttribute(
            "data-src"
        ) ||
        ""
    );

}


function openGallery(index) {

    const item =
        LoveExperience.gallery[
            index
        ];


    if (!item) {
        return;
    }


    const image =
        getGalleryImage(
            item
        );


    const source =
        getImageSource(
            image
        );


    if (!source) {
        return;
    }


    LoveExperience.state.currentGalleryIndex =
        index;


    const lightbox =
        LoveExperience.elements.lightbox;


    const lightboxImage =
        LoveExperience.elements.lightboxImage;


    if (
        !lightbox ||
        !lightboxImage
    ) {
        return;
    }


    lightboxImage.src =
        source;


    lightboxImage.alt =
        image?.alt ||
        item.dataset.caption ||
        "ذكرى جميلة";


    const title =
        $("#lightbox-title");

    if (title) {

        title.textContent =
            image?.alt ||
            item.dataset.caption ||
            "ذكرى جميلة";

    }


    const counter =
        $("#lightbox-counter");

    if (
        counter &&
        LoveExperience.gallery.length
    ) {

        const position =
            String(index + 1).padStart(2, "0");

        const total =
            String(
                LoveExperience.gallery.length
            ).padStart(2, "0");

        counter.textContent =
            `${position} / ${total}`;

    }


    updateGalleryMetadata(
        item
    );


    lightbox.classList.add(
        "is-open"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "no-scroll"
    );


    LoveExperience.state.lightboxOpen =
        true;


    LoveExperience.state.previousFocus =
        document.activeElement;


    preloadGalleryNeighbours(
        index
    );


    const close =
        LoveExperience.elements.lightboxClose;


    if (close) {

        setTimer(
            () => close.focus(),
            80
        );

    }

}


function updateGalleryMetadata(item) {

    if (!item) {
        return;
    }


    const caption =
        item.dataset.caption ||
        $(".gallery-caption", item)?.textContent ||
        "";


    const date =
        item.dataset.date ||
        "";


    const captionTarget =
        $(
            "[data-lightbox-caption]"
        );


    const dateTarget =
        $(
            "[data-lightbox-date]"
        );


    if (captionTarget) {

        captionTarget.textContent =
            caption;

    }


    if (dateTarget) {

        dateTarget.textContent =
            date;

    }

}


function closeGallery() {

    const lightbox =
        LoveExperience.elements.lightbox;


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove(
        "is-open"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "no-scroll"
    );


    LoveExperience.state.lightboxOpen =
        false;


    if (
        LoveExperience.state.previousFocus &&
        typeof LoveExperience.state.previousFocus.focus ===
            "function"
    ) {

        LoveExperience.state.previousFocus.focus();

    }

}


function showNextGalleryImage() {

    if (
        !LoveExperience.gallery.length
    ) {
        return;
    }


    const next =
        (
            LoveExperience.state.currentGalleryIndex +
            1
        ) %
        LoveExperience.gallery.length;


    openGallery(
        next
    );

}


function showPreviousGalleryImage() {

    if (
        !LoveExperience.gallery.length
    ) {
        return;
    }


    const previous =
        (
            LoveExperience.state.currentGalleryIndex -
            1 +
            LoveExperience.gallery.length
        ) %
        LoveExperience.gallery.length;


    openGallery(
        previous
    );

}


function preloadGalleryNeighbours(index) {

    const length =
        LoveExperience.gallery.length;


    if (!length) {
        return;
    }


    const indexes = [

        (
            index + 1
        ) % length,

        (
            index - 1 + length
        ) % length

    ];


    indexes.forEach(
        (neighborIndex) => {

            const item =
                LoveExperience.gallery[
                    neighborIndex
                ];


            const image =
                getGalleryImage(
                    item
                );


            const source =
                getImageSource(
                    image
                );


            if (!source) {
                return;
            }


            const preload =
                new Image();


            preload.src =
                source;

        }
    );

}


/* =========================================================
   LIGHTBOX
   ========================================================= */

function initializeLightbox() {

    const {
        lightbox,
        lightboxClose,
        lightboxNext,
        lightboxPrevious,
        lightboxFullscreen
    } = LoveExperience.elements;


    if (!lightbox) {
        return;
    }


    on(
        lightboxClose,
        "click",
        closeGallery
    );


    $$("[data-lightbox-close]").forEach(
        (element) => {

            if (element !== lightboxClose) {

                on(
                    element,
                    "click",
                    closeGallery
                );

            }

        }
    );


    on(
        lightboxNext,
        "click",
        showNextGalleryImage
    );


    on(
        lightboxPrevious,
        "click",
        showPreviousGalleryImage
    );


    on(
        lightboxFullscreen,
        "click",
        toggleFullscreen
    );


    on(
        lightbox,
        "click",
        (event) => {

            if (
                event.target === lightbox
            ) {

                closeGallery();

            }

        }
    );


    on(
        document,
        "keydown",
        (event) => {

            if (
                !LoveExperience.state.lightboxOpen
            ) {
                return;
            }


            switch (event.key) {

                case "Escape":

                    closeGallery();

                    break;


                case "ArrowRight":

                    showNextGalleryImage();

                    break;


                case "ArrowLeft":

                    showPreviousGalleryImage();

                    break;

            }

        }
    );


    initializeGallerySwipe();

}


function toggleFullscreen() {

    const image =
        LoveExperience.elements.lightboxImage;


    if (!image) {
        return;
    }


    if (
        document.fullscreenElement
    ) {

        document.exitFullscreen?.();

        return;

    }


    const target =
        LoveExperience.elements.lightbox;


    target?.requestFullscreen?.();

}


/* =========================================================
   GALLERY TOUCH GESTURES
   ========================================================= */

function initializeGallerySwipe() {

    const lightbox =
        LoveExperience.elements.lightbox;


    if (
        !lightbox ||
        !LoveExperience.state.touchDevice
    ) {
        return;
    }


    let startX = 0;
    let startY = 0;


    on(
        lightbox,
        "touchstart",
        (event) => {

            const touch =
                event.changedTouches[0];


            startX =
                touch.clientX;

            startY =
                touch.clientY;

        },
        {
            passive: true
        }
    );


    on(
        lightbox,
        "touchend",
        (event) => {

            const touch =
                event.changedTouches[0];


            const deltaX =
                touch.clientX -
                startX;


            const deltaY =
                touch.clientY -
                startY;


            if (
                Math.abs(deltaX) < 45 ||
                Math.abs(deltaX) < Math.abs(deltaY)
            ) {
                return;
            }


            if (deltaX < 0) {

                showNextGalleryImage();

            } else {

                showPreviousGalleryImage();

            }

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   MUSIC
   ========================================================= */

function initializeMusic() {

    const {
        musicToggle,
        audio
    } = LoveExperience.elements;


    if (!audio) {
        return;
    }


    audio.loop = true;


    if (
        !Number.isNaN(
            Number(
                audio.dataset.volume
            )
        )
    ) {

        audio.volume =
            Math.min(
                Math.max(
                    Number(
                        audio.dataset.volume
                    ),
                    0
                ),
                1
            );

    }


    const savedVolume =
        readStorage(
            "music_volume"
        );


    if (
        savedVolume !== null &&
        Number.isFinite(
            Number(savedVolume)
        )
    ) {

        audio.volume =
            Number(savedVolume);

    }


    function update() {

        const playing =
            !audio.paused;


        LoveExperience.state.musicPlaying =
            playing;


        if (musicToggle) {

            musicToggle.classList.toggle(
                "playing",
                playing
            );


            musicToggle.setAttribute(
                "aria-pressed",
                String(playing)
            );


            const icon =
                $("i", musicToggle);


            if (icon) {

                icon.className =
                    playing
                        ? "fas fa-pause"
                        : "fas fa-volume-mute";

            }

        }

    }


    async function toggle() {

        try {

            if (audio.paused) {

                await audio.play();

            } else {

                audio.pause();

            }

        } catch (error) {

            console.warn(
                "Music playback unavailable:",
                error
            );

        }


        update();

    }


    on(
        musicToggle,
        "click",
        toggle
    );


    on(
        audio,
        "play",
        update
    );


    on(
        audio,
        "pause",
        update
    );


    on(
        audio,
        "ended",
        update
    );


    const volume =
        $(
            "[data-music-volume]"
        );


    if (volume) {

        on(
            volume,
            "input",
            () => {

                const value =
                    Number(
                        volume.value
                    );


                if (
                    Number.isFinite(value)
                ) {

                    audio.volume =
                        Math.min(
                            Math.max(
                                value,
                                0
                            ),
                            1
                        );


                    writeStorage(
                        "music_volume",
                        audio.volume
                    );

                }

            }
        );

    }


    update();

}


function initializeAudioSource() {

    const audio =
        LoveExperience.elements.audio;


    if (!audio) {
        return;
    }


    if (
        audio.src
    ) {
        return;
    }


    const source =
        $(
            "source",
            audio
        );


    if (
        source?.src
    ) {
        return;
    }


    audio.src =
        "music/shms.m4a";

}


/* =========================================================
   ATMOSPHERE
   ========================================================= */

function initializeAtmosphere() {

    if (
        LoveExperience.state.reducedMotion
    ) {
        return;
    }


    initializeFloatingHearts();

    initializeFloatingStars();

    initializeShootingStars();

}


function initializeFloatingHearts() {

    const container =
        $(
            ".floating-hearts," +
            "[data-floating-hearts]"
        );


    if (!container) {
        return;
    }


    if (
        LoveExperience.state.reducedMotion
    ) {
        return;
    }


    if (
        container.children.length
    ) {
        return;
    }


    const mobile =
        window.innerWidth < 768;


    const count =
        mobile
            ? 7
            : 18;


    const fragment =
        document.createDocumentFragment();


    for (
        let index = 0;
        index < count;
        index++
    ) {

        const heart =
            document.createElement(
                "span"
            );


        heart.className =
            "floating-heart";


        heart.textContent =
            "❤";


        heart.style.left =
            `${Math.random() * 100}%`;


        heart.style.fontSize =
            `${10 + Math.random() * 18}px`;


        heart.style.animationDuration =
            `${8 + Math.random() * 10}s`;


        heart.style.animationDelay =
            `${Math.random() * 8}s`;


        fragment.appendChild(
            heart
        );

    }


    container.appendChild(
        fragment
    );

}


function initializeFloatingStars() {

    const container =
        $(
            ".floating-stars," +
            "[data-floating-stars]"
        );


    if (!container) {
        return;
    }


    if (
        LoveExperience.state.reducedMotion
    ) {
        return;
    }


    if (
        container.children.length
    ) {
        return;
    }


    const width =
        window.innerWidth;


    let count;


    if (width < 480) {

        count = 25;

    } else if (width < 900) {

        count = 45;

    } else {

        count = 70;

    }


    const fragment =
        document.createDocumentFragment();


    for (
        let index = 0;
        index < count;
        index++
    ) {

        const star =
            document.createElement(
                "span"
            );


        star.className =
            "floating-star";


        const size =
            1 +
            Math.random() * 2.5;


        star.style.width =
            `${size}px`;


        star.style.height =
            `${size}px`;


        star.style.left =
            `${Math.random() * 100}%`;


        star.style.top =
            `${Math.random() * 100}%`;


        star.style.animationDuration =
            `${2 + Math.random() * 5}s`;


        star.style.animationDelay =
            `${Math.random() * 5}s`;


        fragment.appendChild(
            star
        );

    }


    container.appendChild(
        fragment
    );

}


function initializeShootingStars() {

    if (
        LoveExperience.state.reducedMotion
    ) {
        return;
    }


    const container =
        $(
            ".shooting-stars," +
            "[data-shooting-stars]"
        );


    if (!container) {
        return;
    }


    const interval =
        window.innerWidth < 768
            ? 9000
            : 5000;


    const timer =
        window.setInterval(
            () => {

                if (
                    !LoveExperience.state.pageVisible
                ) {
                    return;
                }


                createShootingStar(
                    container
                );

            },
            interval
        );


    LoveExperience.timers.add(
        timer
    );

}


function createShootingStar(container) {

    const star =
        document.createElement(
            "span"
        );


    star.className =
        "shooting-star";


    star.style.top =
        `${Math.random() * 45}%`;


    star.style.left =
        `${60 + Math.random() * 30}%`;


    container.appendChild(
        star
    );


    setTimer(
        () => {

            star.remove();

        },
        1400
    );

}


/* =========================================================
   CURSOR
   ========================================================= */

function initializeCursor() {

    if (
        !LoveExperience.state.cursorEnabled
    ) {
        return;
    }


    const glow =
        LoveExperience.elements.cursorGlow;


    if (!glow) {
        return;
    }


    let mouseX = 0;
    let mouseY = 0;

    let currentX = 0;
    let currentY = 0;

    let ticking = false;


    on(
        document,
        "pointermove",
        (event) => {

            mouseX =
                event.clientX;

            mouseY =
                event.clientY;


            if (ticking) {
                return;
            }


            ticking = true;


            nextFrame(
                animateCursor
            );

        },
        {
            passive: true
        }
    );


    function animateCursor() {

        currentX +=
            (
                mouseX -
                currentX
            ) *
            0.18;


        currentY +=
            (
                mouseY -
                currentY
            ) *
            0.18;


        glow.style.transform =
            `translate3d(${currentX}px, ${currentY}px, 0)`;


        ticking = false;


        if (
            Math.abs(
                mouseX - currentX
            ) > 0.5 ||
            Math.abs(
                mouseY - currentY
            ) > 0.5
        ) {

            ticking = true;

            nextFrame(
                animateCursor
            );

        }

    }


    document.body.classList.add(
        "cursor-enabled"
    );

    LoveExperience.state.cursorEnabled =
        true;

}


/* =========================================================
   MAGNETIC BUTTONS
   ========================================================= */

function initializeMagneticButtons() {

    if (
        !LoveExperience.state.cursorEnabled
    ) {
        return;
    }


    const buttons =
        $$(
            ".magnetic," +
            "[data-magnetic]"
        );


    buttons.forEach(
        (button) => {

            on(
                button,
                "pointermove",
                (event) => {

                    const rect =
                        button.getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left -
                        rect.width / 2;


                    const y =
                        event.clientY -
                        rect.top -
                        rect.height / 2;


                    const strength =
                        Number(
                            button.dataset.magneticStrength ||
                            0.18
                        );


                    button.style.transform =
                        `translate3d(${x * strength}px, ${y * strength}px, 0)`;

                }
            );


            on(
                button,
                "pointerleave",
                () => {

                    button.style.transform =
                        "";

                }
            );

        }
    );

}


/* =========================================================
   BUTTONS / RIPPLE
   ========================================================= */

function initializeButtons() {

    const buttons =
        $$(
            "button," +
            ".btn-love," +
            ".btn-outline," +
            "[data-ripple]"
        );


    buttons.forEach(
        (button) => {

            if (
                !button.hasAttribute(
                    "type"
                )
            ) {

                button.setAttribute(
                    "type",
                    "button"
                );

            }


            on(
                button,
                "click",
                (event) => {

                    if (
                        LoveExperience.state.reducedMotion
                    ) {
                        return;
                    }


                    createRipple(
                        button,
                        event
                    );

                }
            );

        }
    );


    initializeMagneticButtons();

}


function createRipple(
    element,
    event
) {

    if (!element) {
        return;
    }


    const rect =
        element.getBoundingClientRect();


    const ripple =
        document.createElement(
            "span"
        );


    ripple.className =
        "click-ripple";


    const size =
        Math.max(
            rect.width,
            rect.height
        );


    const x =
        event.clientX -
        rect.left -
        size / 2;


    const y =
        event.clientY -
        rect.top -
        size / 2;


    ripple.style.width =
        `${size}px`;


    ripple.style.height =
        `${size}px`;


    ripple.style.left =
        `${x}px`;


    ripple.style.top =
        `${y}px`;


    element.appendChild(
        ripple
    );


    setTimer(
        () => ripple.remove(),
        700
    );

}


/* =========================================================
   HEART INTERACTIONS
   ========================================================= */

function initializeHeartInteractions() {

    const buttons =
        $$(
            ".heart-button," +
            ".love-button," +
            "[data-love]," +
            "[data-heart]"
        );


    buttons.forEach(
        (button) => {

            on(
                button,
                "click",
                () => {

                    const active =
                        button.classList.toggle(
                            "liked"
                        );


                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );


                    if (
                        active &&
                        !LoveExperience.state.reducedMotion
                    ) {

                        createHeartBurst(
                            button
                        );

                    }

                }
            );

        }
    );

}


function createHeartBurst(button) {

    const rect =
        button.getBoundingClientRect();


    const fragment =
        document.createDocumentFragment();


    for (
        let index = 0;
        index < 7;
        index++
    ) {

        const heart =
            document.createElement(
                "span"
            );


        heart.className =
            "heart-burst-item";


        heart.textContent =
            "❤";


        const angle =
            (
                index /
                7
            ) *
            Math.PI *
            2;


        const distance =
            35 +
            Math.random() * 45;


        heart.style.left =
            `${rect.width / 2}px`;


        heart.style.top =
            `${rect.height / 2}px`;


        heart.style.setProperty(
            "--burst-x",
            `${Math.cos(angle) * distance}px`
        );


        heart.style.setProperty(
            "--burst-y",
            `${Math.sin(angle) * distance}px`
        );


        fragment.appendChild(
            heart
        );

    }


    button.appendChild(
        fragment
    );


    setTimer(
        () => {

            $$(".heart-burst-item", button)
                .forEach(
                    (heart) =>
                        heart.remove()
                );

        },
        1000
    );

}


/* =========================================================
   FORMS
   ========================================================= */

function initializeForms() {

    const forms =
        $$(
            "form"
        );


    forms.forEach(
        (form) => {

            on(
                form,
                "submit",
                (event) => {

                    const required =
                        $$(
                            "[required]",
                            form
                        );


                    let valid = true;


                    required.forEach(
                        (field) => {

                            const value =
                                String(
                                    field.value ||
                                    ""
                                ).trim();


                            const invalid =
                                !value;


                            field.classList.toggle(
                                "input-error",
                                invalid
                            );


                            field.setAttribute(
                                "aria-invalid",
                                String(invalid)
                            );


                            if (invalid) {
                                valid = false;
                            }

                        }
                    );


                    if (!valid) {

                        event.preventDefault();


                        const first =
                            $(
                                ".input-error",
                                form
                            );


                        first?.focus();

                    }

                }
            );


            $$(
                "input, textarea, select",
                form
            ).forEach(
                (field) => {

                    on(
                        field,
                        "input",
                        () => {

                            field.classList.remove(
                                "input-error"
                            );


                            field.setAttribute(
                                "aria-invalid",
                                "false"
                            );

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   MODALS
   ========================================================= */

function initializeModals() {

    const triggers =
        $$(
            "[data-modal-target]"
        );


    const modals =
        $$(
            "[data-modal]"
        );


    triggers.forEach(
        (trigger) => {

            on(
                trigger,
                "click",
                () => {

                    const selector =
                        trigger.dataset.modalTarget;


                    if (!selector) {
                        return;
                    }


                    const modal =
                        document.querySelector(
                            selector
                        );


                    if (modal) {
                        openModal(
                            modal
                        );
                    }

                }
            );

        }
    );


    modals.forEach(
        (modal) => {

            $$(
                "[data-modal-close], .modal-close",
                modal
            ).forEach(
                (button) => {

                    on(
                        button,
                        "click",
                        () =>
                            closeModal(
                                modal
                            )
                    );

                }
            );


            on(
                modal,
                "click",
                (event) => {

                    if (
                        event.target === modal
                    ) {

                        closeModal(
                            modal
                        );

                    }

                }
            );

        }
    );


    on(
        document,
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            $$(
                "[data-modal].active," +
                "[data-modal].show"
            ).forEach(
                closeModal
            );

        }
    );

}


function openModal(modal) {

    modal.classList.add(
        "active",
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "no-scroll"
    );


    const focus =
        $(
            "button, [href], input, textarea, select",
            modal
        );


    setTimer(
        () => focus?.focus(),
        80
    );

}


function closeModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active",
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !LoveExperience.state.lightboxOpen
    ) {

        document.body.classList.remove(
            "no-scroll"
        );

    }

}


/* =========================================================
   ACCORDION
   ========================================================= */

function initializeAccordion() {

    const items =
        $$(
            "[data-accordion]"
        );


    items.forEach(
        (item) => {

            const trigger =
                $(
                    "[data-accordion-trigger]",
                    item
                );


            if (!trigger) {
                return;
            }


            on(
                trigger,
                "click",
                () => {

                    const open =
                        item.classList.contains(
                            "active"
                        );


                    items.forEach(
                        (other) => {

                            other.classList.remove(
                                "active"
                            );


                            const otherTrigger =
                                $(
                                    "[data-accordion-trigger]",
                                    other
                                );


                            otherTrigger?.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }
                    );


                    if (!open) {

                        item.classList.add(
                            "active"
                        );


                        trigger.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   TABS
   ========================================================= */

function initializeTabs() {

    const groups =
        $$(
            "[data-tabs]"
        );


    groups.forEach(
        (group) => {

            const tabs =
                $$(
                    "[data-tab]",
                    group
                );


            const panels =
                $$(
                    "[data-tab-panel]",
                    group
                );


            tabs.forEach(
                (tab) => {

                    on(
                        tab,
                        "click",
                        () => {

                            const target =
                                tab.dataset.tab;


                            if (!target) {
                                return;
                            }


                            tabs.forEach(
                                (other) => {

                                    const active =
                                        other ===
                                        tab;


                                    other.classList.toggle(
                                        "active",
                                        active
                                    );


                                    other.setAttribute(
                                        "aria-selected",
                                        String(active)
                                    );

                                }
                            );


                            panels.forEach(
                                (panel) => {

                                    const active =
                                        panel.dataset.tabPanel ===
                                        target;


                                    panel.classList.toggle(
                                        "active",
                                        active
                                    );


                                    panel.hidden =
                                        !active;

                                }
                            );

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   LAZY IMAGES
   ========================================================= */

function initializeLazyImages() {

    const images =
        $$(
            "img[data-src]"
        );


    if (!images.length) {
        return;
    }


    function load(image) {

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


        on(
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

    }


    if (
        LoveExperience.state.reducedMotion ||
        !("IntersectionObserver" in window)
    ) {

        images.forEach(
            load
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            (
                entries,
                instance
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        load(
                            entry.target
                        );


                        instance.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {

                rootMargin:
                    "250px 0px"

            }
        );


    images.forEach(
        (image) =>
            observer.observe(
                image
            )
    );


    LoveExperience.observers.push(
        observer
    );


    initializeImageErrors();

}


function initializeImageErrors() {

    $$("img").forEach(
        (image) => {

            on(
                image,
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );


                    if (
                        !image.alt
                    ) {

                        image.alt =
                            "تعذر تحميل الصورة";

                    }

                },
                {
                    once: true
                }
            );

        }
    );

}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

function initializeAccessibility() {

    $$("button").forEach(
        (button) => {

            if (
                !button.hasAttribute(
                    "type"
                )
            ) {

                button.type =
                    "button";

            }

        }
    );


    $$("img").forEach(
        (image) => {

            if (
                !image.hasAttribute(
                    "alt"
                )
            ) {

                image.alt =
                    "";

            }

        }
    );


    $$("[data-tooltip]").forEach(
        (element) => {

            const text =
                element.dataset.tooltip;


            if (
                text &&
                !element.hasAttribute(
                    "aria-label"
                )
            ) {

                element.setAttribute(
                    "aria-label",
                    text
                );

            }

        }
    );

}


/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

function initializeKeyboardNavigation() {

    on(
        document,
        "keydown",
        (event) => {

            if (
                event.key === "Tab"
            ) {

                document.body.classList.add(
                    "keyboard-user"
                );

            }

        }
    );


    on(
        document,
        "mousedown",
        () => {

            document.body.classList.remove(
                "keyboard-user"
            );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function initializeConnectionStatus() {

    const indicators =
        $$(
            "[data-connection-status]"
        );


    if (!indicators.length) {
        return;
    }


    function update() {

        const online =
            navigator.onLine;


        indicators.forEach(
            (indicator) => {

                indicator.dataset.status =
                    online
                        ? "online"
                        : "offline";


                indicator.textContent =
                    online
                        ? "متصل"
                        : "غير متصل";

            }
        );

    }


    on(
        window,
        "online",
        update
    );


    on(
        window,
        "offline",
        update
    );


    update();

}


/* =========================================================
   DYNAMIC YEAR
   ========================================================= */

function initializeDynamicYear() {

    const year =
        String(
            new Date()
                .getFullYear()
        );


    $$(
        "[data-current-year]"
    ).forEach(
        (element) => {

            element.textContent =
                year;

        }
    );

}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function initializeBackToTop() {

    const button =
        LoveExperience.elements.backTop;


    if (!button) {
        return;
    }


    on(
        button,
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior:
                    LoveExperience.state.reducedMotion
                        ? "auto"
                        : "smooth"

            });

        }
    );


    function update() {

        button.classList.toggle(
            "show",
            window.scrollY > 500
        );

    }


    on(
        window,
        "scroll",
        update,
        {
            passive: true
        }
    );


    update();

}


/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

function initializePageVisibility() {

    on(
        document,
        "visibilitychange",
        () => {

            const hidden =
                document.hidden;


            LoveExperience.state.pageVisible =
                !hidden;


            const audio =
                LoveExperience.elements.audio;


            if (
                hidden &&
                audio &&
                !audio.paused
            ) {

                audio.pause();

            }

        }
    );

}


/* =========================================================
   RESPONSIVE REFRESH
   ========================================================= */

function initializeResizeHandler() {

    on(
        window,
        "resize",
        () => {

            cancelTimer(
                LoveExperience.state.resizeTimer
            );


            LoveExperience.state.resizeTimer =
                setTimer(
                    refreshResponsiveElements,
                    180
                );

        },
        {
            passive: true
        }
    );

}


function refreshResponsiveElements() {

    const hearts =
        $(
            ".floating-hearts," +
            "[data-floating-hearts]"
        );


    const stars =
        $(
            ".floating-stars," +
            "[data-floating-stars]"
        );


    if (hearts) {

        hearts.innerHTML =
            "";

    }


    if (stars) {

        stars.innerHTML =
            "";

    }


    initializeFloatingHearts();

    initializeFloatingStars();

}


/* =========================================================
   SMOOTH LINK FALLBACK
   ========================================================= */

function initializeSmoothLinks() {

    $$(
        'a[href^="#"]'
    ).forEach(
        (link) => {

            if (
                link.dataset.navigationHandled
            ) {
                return;
            }


            link.dataset.navigationHandled =
                "true";


            on(
                link,
                "click",
                (event) => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    scrollToElement(
                        target
                    );

                }
            );

        }
    );

}


/* =========================================================
   COPY BUTTONS
   ========================================================= */

function initializeCopyButtons() {

    $$(
        "[data-copy]"
    ).forEach(
        (button) => {

            on(
                button,
                "click",
                async () => {

                    const selector =
                        button.dataset.copy;


                    if (!selector) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            selector
                        );


                    if (!target) {
                        return;
                    }


                    const text =
                        target.value ??
                        target.textContent ??
                        "";


                    if (
                        !String(
                            text
                        ).trim()
                    ) {
                        return;
                    }


                    try {

                        await navigator.clipboard
                            .writeText(
                                text
                            );


                        showTemporaryMessage(
                            button,
                            "تم النسخ ✓"
                        );

                    } catch (error) {

                        console.warn(
                            "Copy failed:",
                            error
                        );

                    }

                }
            );

        }
    );

}


function showTemporaryMessage(
    element,
    message
) {

    const original =
        element.dataset.originalText ||
        element.textContent;


    element.dataset.originalText =
        original;


    element.textContent =
        message;


    setTimer(
        () => {

            element.textContent =
                original;

        },
        1500
    );

}


/* =========================================================
   PAGE PARALLAX
   ========================================================= */

function initializeParallax() {

    if (
        LoveExperience.state.reducedMotion ||
        LoveExperience.state.touchDevice
    ) {
        return;
    }


    const elements =
        $$(
            "[data-parallax]"
        );


    if (!elements.length) {
        return;
    }


    let ticking = false;


    function update() {

        const viewport =
            window.innerHeight;


        elements.forEach(
            (element) => {

                const rect =
                    element.getBoundingClientRect();


                if (
                    rect.bottom < 0 ||
                    rect.top > viewport
                ) {
                    return;
                }


                const speed =
                    Number(
                        element.dataset.parallax ||
                        0.08
                    );


                const center =
                    viewport / 2;


                const elementCenter =
                    rect.top +
                    rect.height / 2;


                const offset =
                    (
                        elementCenter -
                        center
                    ) *
                    speed;


                element.style.transform =
                    `translate3d(0, ${offset}px, 0)`;

            }
        );


        ticking = false;

    }


    on(
        window,
        "scroll",
        () => {

            if (ticking) {
                return;
            }


            ticking = true;


            nextFrame(
                update
            );

        },
        {
            passive: true
        }
    );


    update();

}


/* =========================================================
   FINAL LOVE QUESTION
   ========================================================= */

function initializeLoveQuestion() {

    const yesButtons =
        $$(
            "[data-love-yes]," +
            ".love-yes," +
            "#yesBtn"
        );


    const noButtons =
        $$(
            "[data-love-no]," +
            ".love-no," +
            "#noBtn"
        );


    yesButtons.forEach(
        (button) => {

            on(
                button,
                "click",
                handleLoveYes
            );

        }
    );


    noButtons.forEach(
        (button) => {

            on(
                button,
                "click",
                handleLoveNo
            );

        }
    );

}


function handleLoveYes() {

    document.body.classList.add(
        "love-accepted"
    );


    createCelebration();


    const audio =
        LoveExperience.elements.audio;


    if (
        audio &&
        audio.paused
    ) {

        audio.play()
            .catch(
                () => {}
            );

    }


    setTimer(
        () => {

            const final =
                $(
                    "#final," +
                    ".final-experience," +
                    "[data-final]"
                );


            final?.classList.add(
                "revealed",
                "active",
                "show"
            );


            final?.scrollIntoView({
                behavior:
                    LoveExperience.state.reducedMotion
                        ? "auto"
                        : "smooth"
            });

        },
        900
    );

}


function handleLoveNo() {

    const button =
        event?.currentTarget;


    if (!button) {
        return;
    }


    const messages = [

        "متأكدة؟ ❤️",

        "جربي تضغطين نعم 😌",

        "واضح أن الزر غلطان 😂",

        "هذا الخيار غير متاح في قصتنا ❤️",

        "حتى الموقع يعرف الإجابة 😭❤️"

    ];


    const index =
        Number(
            button.dataset.noAttempts ||
            0
        );


    const next =
        index % messages.length;


    button.dataset.noAttempts =
        String(index + 1);


    showTemporaryMessage(
        button,
        messages[next]
    );


    if (
        !LoveExperience.state.touchDevice &&
        !LoveExperience.state.reducedMotion
    ) {

        const container =
            button.closest(
                ".question-card," +
                ".love-question," +
                "[data-love-question]"
            );


        if (container) {

            const maxX =
                Math.min(
                    80,
                    window.innerWidth * 0.12
                );


            const x =
                (
                    Math.random() *
                    2 -
                    1
                ) *
                maxX;


            button.style.transform =
                `translateX(${x}px)`;


            setTimer(
                () => {

                    button.style.transform =
                        "";

                },
                450
            );

        }

    }

}


/* =========================================================
   CELEBRATION
   ========================================================= */

function createCelebration() {

    if (
        LoveExperience.state.reducedMotion
    ) {
        return;
    }


    const layer =
        document.createElement(
            "div"
        );


    layer.className =
        "love-celebration";


    layer.setAttribute(
        "aria-hidden",
        "true"
    );


    const fragment =
        document.createDocumentFragment();


    for (
        let index = 0;
        index < 40;
        index++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "celebration-heart";


        particle.textContent =
            index % 3 === 0
                ? "♥"
                : "❤";


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.animationDelay =
            `${Math.random() * 0.8}s`;


        particle.style.animationDuration =
            `${1.5 + Math.random() * 2}s`;


        fragment.appendChild(
            particle
        );

    }


    layer.appendChild(
        fragment
    );


    document.body.appendChild(
        layer
    );


    setTimer(
        () => {

            layer.remove();

        },
        4500
    );

}


/* =========================================================
   GLOBAL INTERACTIONS
   ========================================================= */

function initializeGlobalInteractions() {

    if (window.__loveGlobalInteractionsInitialized) {
        return;
    }

    window.__loveGlobalInteractionsInitialized = true;

    initializeAudioSource();

    initializeSmoothLinks();

    initializeCopyButtons();

    initializeParallax();

    initializeHeartInteractions();

    initializeLoveQuestion();

    initializeOpeningExperience();

    initializeRestartStory();

}


/* =========================================================
   RESTART STORY
   ========================================================= */

function initializeRestartStory() {

    const button =
        $("#restart-story");

    if (!button) {
        return;
    }


    on(
        button,
        "click",
        () => {

            const home =
                $("#home") ||
                $(".hero");

            if (home) {

                scrollToElement(
                    home
                );

            } else {

                window.scrollTo(
                    {
                        top: 0,
                        behavior: "smooth"
                    }
                );

            }

        }
    );

}


/* =========================================================
   OPENING EXPERIENCE
   ========================================================= */

function initializeOpeningExperience() {

    const opening =
        $(
            "#opening, .opening"
        );

    const startButton =
        $(
            "#opening-enter, [data-action='enter-experience']"
        );

    if (!opening || !startButton) {
        return;
    }

    if (window.__loveOpeningExperienceBound) {
        return;
    }

    window.__loveOpeningExperienceBound = true;

    on(
        startButton,
        "click",
        () => {

            opening.classList.add(
                "opening-complete"
            );

            const hero =
                $(
                    "#home, .hero, [data-hero]"
                );

            if (hero) {

                setTimer(
                    () => {

                        hero.classList.add(
                            "hero-entered"
                        );

                    },
                    250
                );

            }

        }
    );

}


/* =========================================================
   STORAGE
   ========================================================= */

function storageKey(key) {

    return (
        "ghadeer_love_" +
        key
    );

}


function readStorage(key) {

    try {

        return window.localStorage.getItem(
            storageKey(key)
        );

    } catch {

        return null;

    }

}


function writeStorage(
    key,
    value
) {

    try {

        window.localStorage.setItem(
            storageKey(key),
            String(value)
        );


        return true;

    } catch {

        return false;

    }

}


function removeStorage(key) {

    try {

        window.localStorage.removeItem(
            storageKey(key)
        );


        return true;

    } catch {

        return false;

    }

}


/* =========================================================
   GLOBAL ERROR PROTECTION
   ========================================================= */

function initializeErrorProtection() {

    on(
        window,
        "error",
        (event) => {

            if (
                event.error
            ) {

                console.warn(
                    "Love website error:",
                    event.error
                );

            }

        }
    );


    on(
        window,
        "unhandledrejection",
        (event) => {

            console.warn(
                "Unhandled promise rejection:",
                event.reason
            );

        }
    );

}


/* =========================================================
   CLEANUP
   ========================================================= */

function cleanupLoveExperience() {

    LoveExperience.observers
        .forEach(
            (observer) => {

                try {

                    observer.disconnect();

                } catch {

                    /* Ignore cleanup errors. */

                }

            }
        );


    LoveExperience.observers =
        [];


    LoveExperience.listeners
        .forEach(
            ({
                target,
                event,
                handler,
                options
            }) => {

                try {

                    target.removeEventListener(
                        event,
                        handler,
                        options
                    );

                } catch {

                    /* Ignore cleanup errors. */

                }

            }
        );


    LoveExperience.listeners =
        [];


    LoveExperience.timers
        .forEach(
            (timer) => {

                window.clearTimeout(
                    timer
                );

                window.clearInterval(
                    timer
                );

            }
        );


    LoveExperience.timers.clear();


    LoveExperience.rafs
        .forEach(
            (id) => {

                window.cancelAnimationFrame(
                    id
                );

            }
        );


    LoveExperience.rafs.clear();

}


/* =========================================================
   BEFORE UNLOAD
   ========================================================= */

function initializeUnloadCleanup() {

    on(
        window,
        "beforeunload",
        () => {

            const audio =
                LoveExperience.elements.audio;


            if (audio) {

                try {

                    audio.pause();

                    audio.currentTime =
                        0;

                } catch {

                    /* Ignore cleanup errors. */

                }

            }


            cleanupLoveExperience();

        }
    );

}


/* =========================================================
   FINAL STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeWebsite();

        initializeErrorProtection();

        initializeUnloadCleanup();

    }
);


/* =========================================================
   PUBLIC DEBUG HANDLE
   ========================================================= */

window.LoveExperience =
    LoveExperience;


/* =========================================================
   END OF js/script.js
   ❤️ إلى غدير ❤️
   ========================================================= */