/*=========================================================
    gallery.js PRO MAX v6.0
    Premium Gallery Engine
    -------------------------------------------------------
    Features:
    - Dynamic image collection
    - Lightbox
    - Previous / Next
    - Keyboard navigation
    - Touch swipe
    - Mouse drag
    - Pinch-to-zoom
    - Wheel zoom
    - Double-click zoom
    - Zoom controls
    - Fullscreen
    - Image preloading
    - Lazy loading
    - Loading state
    - Error handling
    - Focus trap
    - Accessibility
    - Reduced motion
    - Body scroll locking
    - Resize handling
    - Visibility handling
    - Safe cleanup
    - Public API
=========================================================*/

"use strict";


/*=========================================================
CONFIG
=========================================================*/

const GalleryConfig = {

    zoom: true,

    swipe: true,

    keyboard: true,

    preload: true,

    fullscreen: true,

    lazy: true,

    maxZoom: 5,

    zoomStep: 0.25,

    swipeThreshold: 70,

    animationDuration: 280,

    doubleClickZoom: 2,

    enablePinchZoom: true,

    enableWheelZoom: true,

    closeOnOverlay: true

};


/*=========================================================
LOAD PROJECT CONFIG
=========================================================*/

async function loadGalleryConfig(){

    try{

        const module =
            await import("./config.js");


        if(
            module &&
            module.CONFIG &&
            module.CONFIG.gallery
        ){

            Object.assign(
                GalleryConfig,
                module.CONFIG.gallery
            );

        }

    }catch(error){

        console.warn(
            "Gallery config unavailable. Using defaults.",
            error
        );

    }

}


/*=========================================================
STATE
=========================================================*/

const Gallery = {

    images: [],

    current: 0,

    lightbox: null,

    stage: null,

    image: null,

    caption: null,

    counter: null,

    loader: null,

    error: null,

    closeBtn: null,

    nextBtn: null,

    prevBtn: null,

    zoomInBtn: null,

    zoomOutBtn: null,

    resetBtn: null,

    fullscreenBtn: null,

    opened: false,

    initialized: false,

    initializing: false,

    globalEventsInitialized: false,

    previousActiveElement: null,

    previousBodyOverflow: "",

    previousBodyPaddingRight: "",

    zoom: 1,

    translateX: 0,

    translateY: 0,

    dragging: false,

    dragPointerId: null,

    dragStartX: 0,

    dragStartY: 0,

    dragOriginX: 0,

    dragOriginY: 0,

    swipeStartX: 0,

    swipeStartY: 0,

    swipeStartTime: 0,

    pinchActive: false,

    pinchStartDistance: 0,

    pinchStartZoom: 1,

    pointers: new Map(),

    imageRequest: 0,

    listeners: [],

    reducedMotion: false

};


/*=========================================================
HELPERS
=========================================================*/

function get(id){

    return document.getElementById(id);

}


function query(selector){

    if(
        !Gallery.lightbox
    ){

        return null;

    }


    return Gallery.lightbox.querySelector(
        selector
    );

}


function addListener(
    target,
    event,
    handler,
    options
){

    if(
        !target ||
        typeof target.addEventListener !== "function"
    ){

        return;

    }


    target.addEventListener(
        event,
        handler,
        options
    );


    Gallery.listeners.push({

        target,

        event,

        handler,

        options

    });

}


function removeListeners(){

    Gallery.listeners.forEach(
        item => {

            item.target.removeEventListener(
                item.event,
                item.handler,
                item.options
            );

        }
    );


    Gallery.listeners = [];

}


/*=========================================================
REDUCED MOTION
=========================================================*/

function detectReducedMotion(){

    if(
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ){

        return false;

    }


    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

}


/*=========================================================
COLLECT IMAGES
=========================================================*/

function collectImages(){

    const selector =
        ".gallery-grid img, .gallery-item img, [data-gallery-image]";


    Gallery.images =
        Array.from(
            document.querySelectorAll(
                selector
            )
        ).filter(
            (image, index, array) =>
                array.indexOf(image) === index
        );


    Gallery.images.forEach(
        (image, index) => {

            image.dataset.galleryIndex =
                String(index);


            image.draggable =
                false;


            if(
                GalleryConfig.lazy !== false
            ){

                image.loading =
                    "lazy";

            }

        }
    );

}


/*=========================================================
CREATE LIGHTBOX
=========================================================*/

function createLightbox(){

    if(
        Gallery.lightbox
    ){

        return;

    }


    Gallery.lightbox =
        document.createElement("div");


    Gallery.lightbox.className =
        "gallery-lightbox";


    Gallery.lightbox.setAttribute(
        "role",
        "dialog"
    );


    Gallery.lightbox.setAttribute(
        "aria-modal",
        "true"
    );


    Gallery.lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    Gallery.lightbox.setAttribute(
        "aria-label",
        "Image gallery"
    );


    Gallery.lightbox.innerHTML = `

        <div
            class="gallery-overlay"
            aria-hidden="true">
        </div>

        <div
            class="gallery-window"
            role="document"
            tabindex="-1">

            <button
                class="gallery-close"
                type="button"
                aria-label="Close gallery">
                ✕
            </button>

            <button
                class="gallery-prev"
                type="button"
                aria-label="Previous image">
                ❮
            </button>

            <div
                class="gallery-stage"
                tabindex="0"
                aria-label="Image viewer">

                <div
                    class="gallery-loader"
                    role="status"
                    aria-label="Loading image">
                </div>

                <div
                    class="gallery-error"
                    role="alert"
                    aria-live="polite"
                    hidden>
                    Unable to load image.
                </div>

                <img
                    class="gallery-image"
                    draggable="false"
                    decoding="async"
                    alt="">

            </div>

            <button
                class="gallery-next"
                type="button"
                aria-label="Next image">
                ❯
            </button>

            <div class="gallery-bottom">

                <div
                    class="gallery-counter"
                    aria-live="polite">

                    <span class="current">
                        1
                    </span>

                    /

                    <span class="total">
                        1
                    </span>

                </div>

                <div
                    class="gallery-caption">
                </div>

                <div class="gallery-tools">

                    <button
                        type="button"
                        class="gallery-zoom-in"
                        aria-label="Zoom in">
                        ＋
                    </button>

                    <button
                        type="button"
                        class="gallery-zoom-out"
                        aria-label="Zoom out">
                        －
                    </button>

                    <button
                        type="button"
                        class="gallery-reset"
                        aria-label="Reset zoom">
                        ⟳
                    </button>

                    <button
                        type="button"
                        class="gallery-fullscreen"
                        aria-label="Enter fullscreen">
                        ⛶
                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        Gallery.lightbox
    );


    Gallery.stage =
        query(".gallery-stage");


    Gallery.image =
        query(".gallery-image");


    Gallery.caption =
        query(".gallery-caption");


    Gallery.counter =
        query(".gallery-counter");


    Gallery.loader =
        query(".gallery-loader");


    Gallery.error =
        query(".gallery-error");


    Gallery.closeBtn =
        query(".gallery-close");


    Gallery.prevBtn =
        query(".gallery-prev");


    Gallery.nextBtn =
        query(".gallery-next");


    Gallery.zoomInBtn =
        query(".gallery-zoom-in");


    Gallery.zoomOutBtn =
        query(".gallery-zoom-out");


    Gallery.resetBtn =
        query(".gallery-reset");


    Gallery.fullscreenBtn =
        query(".gallery-fullscreen");


    applyFeatureVisibility();


    bindLightboxEvents();

}


/*=========================================================
FEATURE VISIBILITY
=========================================================*/

function applyFeatureVisibility(){

    if(
        Gallery.zoomInBtn
    ){

        Gallery.zoomInBtn.hidden =
            !GalleryConfig.zoom;

    }


    if(
        Gallery.zoomOutBtn
    ){

        Gallery.zoomOutBtn.hidden =
            !GalleryConfig.zoom;

    }


    if(
        Gallery.resetBtn
    ){

        Gallery.resetBtn.hidden =
            !GalleryConfig.zoom;

    }


    if(
        Gallery.fullscreenBtn
    ){

        Gallery.fullscreenBtn.hidden =
            !GalleryConfig.fullscreen;

    }

}


/*=========================================================
BIND LIGHTBOX EVENTS
=========================================================*/

function bindLightboxEvents(){

    addListener(
        Gallery.closeBtn,
        "click",
        closeGallery
    );


    addListener(
        Gallery.prevBtn,
        "click",
        showPrevious
    );


    addListener(
        Gallery.nextBtn,
        "click",
        showNext
    );


    addListener(
        Gallery.zoomInBtn,
        "click",
        zoomIn
    );


    addListener(
        Gallery.zoomOutBtn,
        "click",
        zoomOut
    );


    addListener(
        Gallery.resetBtn,
        "click",
        () => resetZoom()
    );


    addListener(
        Gallery.fullscreenBtn,
        "click",
        toggleFullscreen
    );


    const overlay =
        query(".gallery-overlay");


    addListener(
        overlay,
        "click",
        () => {

            if(
                GalleryConfig.closeOnOverlay
            ){

                closeGallery();

            }

        }
    );


    addListener(
        Gallery.image,
        "dblclick",
        handleDoubleClick
    );


    if(
        GalleryConfig.enableWheelZoom
    ){

        addListener(
            Gallery.stage,
            "wheel",
            handleWheel,
            {
                passive: false
            }
        );

    }


    addListener(
        Gallery.image,
        "pointerdown",
        handlePointerDown
    );


    addListener(
        Gallery.image,
        "pointermove",
        handlePointerMove
    );


    addListener(
        Gallery.image,
        "pointerup",
        handlePointerUp
    );


    addListener(
        Gallery.image,
        "pointercancel",
        handlePointerCancel
    );


    addListener(
        Gallery.image,
        "dragstart",
        event => {

            event.preventDefault();

        }
    );


    if(
        GalleryConfig.keyboard
    ){

        addListener(
            document,
            "keydown",
            handleKeyboard
        );

    }


    addListener(
        Gallery.lightbox,
        "keydown",
        handleFocusTrap
    );


    addListener(
        document,
        "fullscreenchange",
        updateFullscreenButton
    );

}


/*=========================================================
INIT
=========================================================*/

async function initGallery(){

    if(
        Gallery.initialized ||
        Gallery.initializing
    ){

        return;

    }


    Gallery.initializing =
        true;


    try{

        await loadGalleryConfig();


        Gallery.reducedMotion =
            detectReducedMotion();


        collectImages();


        if(
            !Gallery.images.length
        ){

            return;

        }


        createLightbox();


        bindThumbnailEvents();


        updateNavigation();


        updateSlideCounter();


        Gallery.initialized =
            true;

    }finally{

        Gallery.initializing =
            false;

    }

}


/*=========================================================
THUMBNAIL EVENTS
=========================================================*/

function bindThumbnailEvents(){

    Gallery.images.forEach(
        (image, index) => {

            if(
                image.dataset.galleryBound === "true"
            ){

                return;

            }


            image.dataset.galleryBound =
                "true";


            addListener(
                image,
                "click",
                event => {

                    event.preventDefault();

                    openGallery(index);

                }
            );

        }
    );

}


/*=========================================================
OPEN
=========================================================*/

function openGallery(index = 0){

    if(
        !Gallery.lightbox ||
        !Gallery.images.length
    ){

        return;

    }


    index =
        Math.max(
            0,
            Math.min(
                index,
                Gallery.images.length - 1
            )
        );


    Gallery.previousActiveElement =
        document.activeElement;


    Gallery.current =
        index;


    Gallery.opened =
        true;


    lockBody();


    Gallery.lightbox.classList.add(
        "show"
    );


    Gallery.lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    resetZoom(false);


    updateGallery();


    updateNavigation();


    window.requestAnimationFrame(
        () => {

            if(
                Gallery.closeBtn
            ){

                Gallery.closeBtn.focus();

            }

        }
    );

}


/*=========================================================
CLOSE
=========================================================*/

function closeGallery(){

    if(
        !Gallery.opened
    ){

        return;

    }


    Gallery.opened =
        false;


    Gallery.dragging =
        false;


    Gallery.pinchActive =
        false;


    Gallery.pointers.clear();


    Gallery.lightbox.classList.remove(
        "show"
    );


    Gallery.lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    unlockBody();


    if(
        document.fullscreenElement
    ){

        document.exitFullscreen()
            .catch(
                () => {}
            );

    }


    const element =
        Gallery.previousActiveElement;


    Gallery.previousActiveElement =
        null;


    if(
        element &&
        typeof element.focus === "function"
    ){

        window.requestAnimationFrame(
            () => element.focus()
        );

    }

}


/*=========================================================
BODY LOCK
=========================================================*/

function lockBody(){

    Gallery.previousBodyOverflow =
        document.body.style.overflow;


    Gallery.previousBodyPaddingRight =
        document.body.style.paddingRight;


    const scrollbarWidth =
        window.innerWidth -
        document.documentElement.clientWidth;


    document.body.style.overflow =
        "hidden";


    if(
        scrollbarWidth > 0
    ){

        document.body.style.paddingRight =
            `${scrollbarWidth}px`;

    }

}


/*=========================================================
BODY UNLOCK
=========================================================*/

function unlockBody(){

    document.body.style.overflow =
        Gallery.previousBodyOverflow;


    document.body.style.paddingRight =
        Gallery.previousBodyPaddingRight;

}


/*=========================================================
UPDATE GALLERY
=========================================================*/

function updateGallery(){

    const source =
        Gallery.images[
            Gallery.current
        ];


    if(
        !source ||
        !Gallery.image
    ){

        return;

    }


    const src =
        source.currentSrc ||
        source.src ||
        source.dataset.src;


    const alt =
        source.alt ||
        "";


    const caption =
        source.dataset.caption ||
        source.getAttribute("data-caption") ||
        source.title ||
        alt;


    const requestId =
        ++Gallery.imageRequest;


    Gallery.image.onload =
        () => {

            if(
                requestId !== Gallery.imageRequest
            ){

                return;

            }


            hideLoader();

            hideError();


            Gallery.image.style.opacity =
                "";


            Gallery.image.classList.add(
                "loaded"
            );


            resetZoom();


            preloadAdjacent();

        };


    Gallery.image.onerror =
        () => {

            if(
                requestId !== Gallery.imageRequest
            ){

                return;

            }


            hideLoader();

            showGalleryError();

        };


    Gallery.image.classList.remove(
        "loaded"
    );


    Gallery.image.style.opacity =
        "0";


    showLoader();

    hideError();


    Gallery.image.alt =
        alt;


    if(
        Gallery.caption
    ){

        Gallery.caption.textContent =
            caption;

    }


    updateSlideCounter();


    Gallery.image.src =
        src;


    if(
        Gallery.image.complete
    ){

        if(
            Gallery.image.naturalWidth > 0
        ){

            Gallery.image.onload();

        }else{

            Gallery.image.onerror();

        }

    }

}


/*=========================================================
COUNTER
=========================================================*/

function updateSlideCounter(){

    if(
        !Gallery.counter
    ){

        return;

    }


    const current =
        Gallery.counter.querySelector(
            ".current"
        );


    const total =
        Gallery.counter.querySelector(
            ".total"
        );


    if(
        current
    ){

        current.textContent =
            String(
                Gallery.current + 1
            );

    }


    if(
        total
    ){

        total.textContent =
            String(
                Gallery.images.length
            );

    }

}


/*=========================================================
NAVIGATION
=========================================================*/

function updateNavigation(){

    const multiple =
        Gallery.images.length > 1;


    if(
        Gallery.prevBtn
    ){

        Gallery.prevBtn.hidden =
            !multiple;

        Gallery.prevBtn.disabled =
            !multiple;

    }


    if(
        Gallery.nextBtn
    ){

        Gallery.nextBtn.hidden =
            !multiple;

        Gallery.nextBtn.disabled =
            !multiple;

    }

}


/*=========================================================
NEXT
=========================================================*/

function showNext(){

    if(
        Gallery.images.length < 2
    ){

        return;

    }


    Gallery.current =
        (
            Gallery.current + 1
        ) %
        Gallery.images.length;


    updateGallery();

}


/*=========================================================
PREVIOUS
=========================================================*/

function showPrevious(){

    if(
        Gallery.images.length < 2
    ){

        return;

    }


    Gallery.current =
        (
            Gallery.current -
            1 +
            Gallery.images.length
        ) %
        Gallery.images.length;


    updateGallery();

}


/*=========================================================
LOADER
=========================================================*/

function showLoader(){

    if(
        Gallery.loader
    ){

        Gallery.loader.hidden =
            false;

    }

}


function hideLoader(){

    if(
        Gallery.loader
    ){

        Gallery.loader.hidden =
            true;

    }

}


/*=========================================================
ERROR
=========================================================*/

function showGalleryError(){

    if(
        Gallery.error
    ){

        Gallery.error.hidden =
            false;

        Gallery.error.textContent =
            "Unable to load image.";

    }


    if(
        Gallery.image
    ){

        Gallery.image.style.opacity =
            "0";

    }

}


function hideError(){

    if(
        Gallery.error
    ){

        Gallery.error.hidden =
            true;

    }

}


/*=========================================================
PRELOAD
=========================================================*/

function preloadAdjacent(){

    if(
        !GalleryConfig.preload ||
        Gallery.images.length < 2
    ){

        return;

    }


    const next =
        (
            Gallery.current + 1
        ) %
        Gallery.images.length;


    const previous =
        (
            Gallery.current -
            1 +
            Gallery.images.length
        ) %
        Gallery.images.length;


    preloadImage(
        Gallery.images[next]
    );


    preloadImage(
        Gallery.images[previous]
    );

}


function preloadImage(source){

    if(
        !source
    ){

        return;

    }


    const src =
        source.currentSrc ||
        source.src ||
        source.dataset.src;


    if(
        !src
    ){

        return;

    }


    if(
        source.dataset.galleryPreloaded === "true"
    ){

        return;

    }


    source.dataset.galleryPreloaded =
        "true";


    const image =
        new Image();


    image.decoding =
        "async";


    image.src =
        src;

}


/*=========================================================
ZOOM
=========================================================*/

function zoomIn(){

    setZoom(
        Gallery.zoom +
        Number(
            GalleryConfig.zoomStep
        )
    );

}


function zoomOut(){

    setZoom(
        Gallery.zoom -
        Number(
            GalleryConfig.zoomStep
        )
    );

}


function setZoom(
    value,
    centerX = null,
    centerY = null
){

    if(
        !GalleryConfig.zoom
    ){

        return;

    }


    const max =
        Number(
            GalleryConfig.maxZoom
        ) || 5;


    const step =
        Number(
            GalleryConfig.zoomStep
        ) || 0.25;


    let next =
        Number(value);


    if(
        !Number.isFinite(next)
    ){

        next =
            1;

    }


    next =
        Math.max(
            1,
            Math.min(
                max,
                next
            )
        );


    next =
        Math.round(
            next / step
        ) * step;


    next =
        Math.max(
            1,
            Math.min(
                max,
                next
            )
        );


    if(
        centerX !== null &&
        centerY !== null &&
        Gallery.zoom !== next
    ){

        const ratio =
            next /
            Gallery.zoom;


        Gallery.translateX =
            centerX -
            (
                centerX -
                Gallery.translateX
            ) *
            ratio;


        Gallery.translateY =
            centerY -
            (
                centerY -
                Gallery.translateY
            ) *
            ratio;

    }


    Gallery.zoom =
        next;


    if(
        Gallery.zoom <= 1
    ){

        Gallery.translateX =
            0;

        Gallery.translateY =
            0;

    }


    constrainPan();

    applyTransform();

    updateZoomControls();

}


/*=========================================================
RESET
=========================================================*/

function resetZoom(
    apply = true
){

    Gallery.zoom =
        1;


    Gallery.translateX =
        0;


    Gallery.translateY =
        0;


    if(
        apply
    ){

        applyTransform();

        updateZoomControls();

    }

}


/*=========================================================
ZOOM CONTROLS
=========================================================*/

function updateZoomControls(){

    const max =
        Number(
            GalleryConfig.maxZoom
        ) || 5;


    if(
        Gallery.zoomInBtn
    ){

        Gallery.zoomInBtn.disabled =
            Gallery.zoom >= max;

    }


    if(
        Gallery.zoomOutBtn
    ){

        Gallery.zoomOutBtn.disabled =
            Gallery.zoom <= 1;

    }


    if(
        Gallery.resetBtn
    ){

        Gallery.resetBtn.disabled =
            Gallery.zoom === 1 &&
            Gallery.translateX === 0 &&
            Gallery.translateY === 0;

    }


    if(
        Gallery.stage
    ){

        Gallery.stage.dataset.zoom =
            String(
                Gallery.zoom
            );

    }

}


/*=========================================================
TRANSFORM
=========================================================*/

function applyTransform(){

    if(
        !Gallery.image
    ){

        return;

    }


    Gallery.image.style.transform =
        `translate3d(
            ${Gallery.translateX}px,
            ${Gallery.translateY}px,
            0
        ) scale(${Gallery.zoom})`;

}


/*=========================================================
PAN LIMIT
=========================================================*/

function constrainPan(){

    if(
        !Gallery.image ||
        !Gallery.stage ||
        Gallery.zoom <= 1
    ){

        Gallery.translateX =
            0;

        Gallery.translateY =
            0;

        return;

    }


    const stage =
        Gallery.stage.getBoundingClientRect();


    const width =
        Gallery.image.offsetWidth *
        Gallery.zoom;


    const height =
        Gallery.image.offsetHeight *
        Gallery.zoom;


    const maxX =
        Math.max(
            0,
            (
                width -
                stage.width
            ) / 2
        );


    const maxY =
        Math.max(
            0,
            (
                height -
                stage.height
            ) / 2
        );


    Gallery.translateX =
        Math.max(
            -maxX,
            Math.min(
                maxX,
                Gallery.translateX
            )
        );


    Gallery.translateY =
        Math.max(
            -maxY,
            Math.min(
                maxY,
                Gallery.translateY
            )
        );

}


/*=========================================================
DOUBLE CLICK
=========================================================*/

function handleDoubleClick(event){

    if(
        !GalleryConfig.zoom ||
        !Gallery.opened
    ){

        return;

    }


    event.preventDefault();


    if(
        Gallery.zoom > 1
    ){

        resetZoom();

        return;

    }


    const rect =
        Gallery.stage.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left -
        rect.width / 2;


    const y =
        event.clientY -
        rect.top -
        rect.height / 2;


    setZoom(
        GalleryConfig.doubleClickZoom,
        x,
        y
    );

}


/*=========================================================
WHEEL
=========================================================*/

function handleWheel(event){

    if(
        !Gallery.opened ||
        !GalleryConfig.zoom
    ){

        return;

    }


    event.preventDefault();


    const rect =
        Gallery.stage.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left -
        rect.width / 2;


    const y =
        event.clientY -
        rect.top -
        rect.height / 2;


    const direction =
        event.deltaY < 0
            ? 1
            : -1;


    setZoom(
        Gallery.zoom +
        (
            direction *
            Number(
                GalleryConfig.zoomStep
            )
        ),
        x,
        y
    );

}


/*=========================================================
POINTER DOWN
=========================================================*/

function handlePointerDown(event){

    if(
        !Gallery.opened
    ){

        return;

    }


    Gallery.pointers.set(
        event.pointerId,
        {
            x: event.clientX,
            y: event.clientY
        }
    );


    if(
        GalleryConfig.enablePinchZoom &&
        Gallery.pointers.size === 2
    ){

        startPinch();

        return;

    }


    Gallery.swipeStartX =
        event.clientX;


    Gallery.swipeStartY =
        event.clientY;


    Gallery.swipeStartTime =
        Date.now();


    if(
        Gallery.zoom <= 1
    ){

        return;

    }


    Gallery.dragging =
        true;


    Gallery.dragPointerId =
        event.pointerId;


    Gallery.dragStartX =
        event.clientX;


    Gallery.dragStartY =
        event.clientY;


    Gallery.dragOriginX =
        Gallery.translateX;


    Gallery.dragOriginY =
        Gallery.translateY;


    try{

        Gallery.image.setPointerCapture(
            event.pointerId
        );

    }catch(error){}


    Gallery.image.classList.add(
        "is-dragging"
    );


    event.preventDefault();

}


/*=========================================================
POINTER MOVE
=========================================================*/

function handlePointerMove(event){

    if(
        !Gallery.opened
    ){

        return;

    }


    if(
        Gallery.pointers.has(
            event.pointerId
        )
    ){

        Gallery.pointers.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
            }
        );

    }


    if(
        Gallery.pinchActive &&
        Gallery.pointers.size === 2
    ){

        updatePinch();

        event.preventDefault();

        return;

    }


    if(
        Gallery.dragging &&
        Gallery.dragPointerId === event.pointerId
    ){

        const dx =
            event.clientX -
            Gallery.dragStartX;


        const dy =
            event.clientY -
            Gallery.dragStartY;


        Gallery.translateX =
            Gallery.dragOriginX +
            dx;


        Gallery.translateY =
            Gallery.dragOriginY +
            dy;


        constrainPan();

        applyTransform();

        event.preventDefault();

    }

}


/*=========================================================
POINTER UP
=========================================================*/

function handlePointerUp(event){

    if(
        !Gallery.opened
    ){

        return;

    }


    Gallery.pointers.delete(
        event.pointerId
    );


    if(
        Gallery.pinchActive
    ){

        if(
            Gallery.pointers.size < 2
        ){

            Gallery.pinchActive =
                false;

        }

        return;

    }


    if(
        Gallery.dragging &&
        Gallery.dragPointerId === event.pointerId
    ){

        Gallery.dragging =
            false;


        Gallery.dragPointerId =
            null;


        Gallery.image.classList.remove(
            "is-dragging"
        );


        applyTransform();

        return;

    }


    if(
        Gallery.zoom <= 1 &&
        GalleryConfig.swipe
    ){

        handleSwipe(event);

    }

}


/*=========================================================
POINTER CANCEL
=========================================================*/

function handlePointerCancel(event){

    Gallery.pointers.delete(
        event.pointerId
    );


    Gallery.dragging =
        false;


    Gallery.pinchActive =
        false;


    Gallery.dragPointerId =
        null;


    if(
        Gallery.image
    ){

        Gallery.image.classList.remove(
            "is-dragging"
        );

    }


    applyTransform();

}


/*=========================================================
PINCH START
=========================================================*/

function startPinch(){

    if(
        !GalleryConfig.enablePinchZoom
    ){

        return;

    }


    const points =
        Array.from(
            Gallery.pointers.values()
        );


    if(
        points.length !== 2
    ){

        return;

    }


    Gallery.pinchStartDistance =
        distance(
            points[0],
            points[1]
        );


    Gallery.pinchStartZoom =
        Gallery.zoom;


    Gallery.pinchActive =
        true;


    Gallery.dragging =
        false;

}


/*=========================================================
PINCH UPDATE
=========================================================*/

function updatePinch(){

    const points =
        Array.from(
            Gallery.pointers.values()
        );


    if(
        points.length !== 2
    ){

        return;

    }


    const currentDistance =
        distance(
            points[0],
            points[1]
        );


    if(
        Gallery.pinchStartDistance <= 0
    ){

        return;

    }


    const scale =
        currentDistance /
        Gallery.pinchStartDistance;


    setZoom(
        Gallery.pinchStartZoom *
        scale
    );

}


/*=========================================================
DISTANCE
=========================================================*/

function distance(a,b){

    return Math.hypot(
        b.x - a.x,
        b.y - a.y
    );

}


/*=========================================================
SWIPE
=========================================================*/

function handleSwipe(event){

    const dx =
        event.clientX -
        Gallery.swipeStartX;


    const dy =
        event.clientY -
        Gallery.swipeStartY;


    const elapsed =
        Date.now() -
        Gallery.swipeStartTime;


    const threshold =
        Number(
            GalleryConfig.swipeThreshold
        ) || 70;


    if(
        Math.abs(dx) < threshold
    ){

        applyTransform();

        return;

    }


    if(
        Math.abs(dx) <= Math.abs(dy)
    ){

        applyTransform();

        return;

    }


    if(
        elapsed > 800
    ){

        applyTransform();

        return;

    }


    if(
        dx < 0
    ){

        showNext();

    }else{

        showPrevious();

    }


    applyTransform();

}


/*=========================================================
KEYBOARD
=========================================================*/

function handleKeyboard(event){

    if(
        !Gallery.opened
    ){

        return;

    }


    switch(event.key){

        case "Escape":

            event.preventDefault();

            closeGallery();

            break;


        case "ArrowRight":

            event.preventDefault();

            showNext();

            break;


        case "ArrowLeft":

            event.preventDefault();

            showPrevious();

            break;


        case "+":

        case "=":

            event.preventDefault();

            zoomIn();

            break;


        case "-":

        case "_":

            event.preventDefault();

            zoomOut();

            break;


        case "0":

            event.preventDefault();

            resetZoom();

            break;


        case "f":

        case "F":

            if(
                GalleryConfig.fullscreen
            ){

                event.preventDefault();

                toggleFullscreen();

            }

            break;

    }

}


/*=========================================================
FOCUS TRAP
=========================================================*/

function handleFocusTrap(event){

    if(
        event.key !== "Tab" ||
        !Gallery.opened
    ){

        return;

    }


    const focusable =
        Gallery.lightbox.querySelectorAll(
            `
            button:not([disabled]),
            [href],
            input:not([disabled]),
            select:not([disabled]),
            textarea:not([disabled]),
            [tabindex]:not([tabindex="-1"])
            `
        );


    if(
        !focusable.length
    ){

        return;

    }


    const first =
        focusable[0];


    const last =
        focusable[
            focusable.length - 1
        ];


    if(
        event.shiftKey &&
        document.activeElement === first
    ){

        event.preventDefault();

        last.focus();

    }else if(
        !event.shiftKey &&
        document.activeElement === last
    ){

        event.preventDefault();

        first.focus();

    }

}


/*=========================================================
FULLSCREEN
=========================================================*/

async function toggleFullscreen(){

    if(
        !GalleryConfig.fullscreen ||
        !Gallery.lightbox
    ){

        return;

    }


    try{

        if(
            document.fullscreenElement
        ){

            await document.exitFullscreen();

        }else{

            await Gallery.lightbox.requestFullscreen();

        }

    }catch(error){

        console.warn(
            "Fullscreen unavailable.",
            error
        );

    }


    updateFullscreenButton();

}


/*=========================================================
FULLSCREEN STATE
=========================================================*/

function updateFullscreenButton(){

    if(
        !Gallery.fullscreenBtn
    ){

        return;

    }


    const active =
        Boolean(
            document.fullscreenElement
        );


    Gallery.fullscreenBtn.setAttribute(
        "aria-pressed",
        String(active)
    );


    Gallery.fullscreenBtn.setAttribute(
        "aria-label",
        active
            ? "Exit fullscreen"
            : "Enter fullscreen"
    );

}


/*=========================================================
GLOBAL EVENTS
=========================================================*/

function initGlobalEvents(){

    if(
        Gallery.globalEventsInitialized
    ){

        return;

    }


    Gallery.globalEventsInitialized =
        true;


    addListener(
        window,
        "resize",
        () => {

            if(
                Gallery.opened
            ){

                constrainPan();

                applyTransform();

            }

        },
        {
            passive: true
        }
    );


    addListener(
        window,
        "orientationchange",
        () => {

            window.requestAnimationFrame(
                () => {

                    if(
                        Gallery.opened
                    ){

                        constrainPan();

                        applyTransform();

                    }

                }
            );

        },
        {
            passive: true
        }
    );


    addListener(
        document,
        "visibilitychange",
        () => {

            if(
                document.hidden
            ){

                Gallery.dragging =
                    false;

                Gallery.pinchActive =
                    false;

                Gallery.pointers.clear();

                if(
                    Gallery.image
                ){

                    Gallery.image.classList.remove(
                        "is-dragging"
                    );

                }

            }

        }
    );

}


/*=========================================================
REFRESH
=========================================================*/

async function refreshGalleryImages(){

    const wasOpen =
        Gallery.opened;


    const currentImage =
        Gallery.images[
            Gallery.current
        ];


    collectImages();


    bindThumbnailEvents();


    if(
        currentImage
    ){

        const newIndex =
            Gallery.images.indexOf(
                currentImage
            );


        if(
            newIndex !== -1
        ){

            Gallery.current =
                newIndex;

        }else{

            Gallery.current =
                Math.min(
                    Gallery.current,
                    Math.max(
                        0,
                        Gallery.images.length - 1
                    )
                );

        }

    }


    updateSlideCounter();

    updateNavigation();


    if(
        wasOpen &&
        Gallery.images.length
    ){

        updateGallery();

    }

}


/*=========================================================
DESTROY
=========================================================*/

function destroyGallery(){

    closeGallery();


    removeListeners();


    if(
        Gallery.lightbox
    ){

        Gallery.lightbox.remove();

    }


    Gallery.lightbox =
        null;


    Gallery.stage =
        null;


    Gallery.image =
        null;


    Gallery.caption =
        null;


    Gallery.counter =
        null;


    Gallery.loader =
        null;


    Gallery.error =
        null;


    Gallery.closeBtn =
        null;


    Gallery.prevBtn =
        null;


    Gallery.nextBtn =
        null;


    Gallery.zoomInBtn =
        null;


    Gallery.zoomOutBtn =
        null;


    Gallery.resetBtn =
        null;


    Gallery.fullscreenBtn =
        null;


    Gallery.images =
        [];


    Gallery.current =
        0;


    Gallery.opened =
        false;


    Gallery.initialized =
        false;


    Gallery.initializing =
        false;


    Gallery.globalEventsInitialized =
        false;


    Gallery.previousActiveElement =
        null;


    Gallery.pointers.clear();


    Gallery.zoom =
        1;


    Gallery.translateX =
        0;


    Gallery.translateY =
        0;

}


/*=========================================================
REFRESH
=========================================================*/

async function refreshGallery(){

    destroyGallery();

    await initGallery();

}


/*=========================================================
PUBLIC API
=========================================================*/

window.initGallery =
    initGallery;


window.openGallery =
    openGallery;


window.closeGallery =
    closeGallery;


window.nextGalleryImage =
    showNext;


window.previousGalleryImage =
    showPrevious;


window.galleryNext =
    showNext;


window.galleryPrevious =
    showPrevious;


window.galleryOpen =
    openGallery;


window.galleryClose =
    closeGallery;


window.galleryZoomIn =
    zoomIn;


window.galleryZoomOut =
    zoomOut;


window.galleryResetZoom =
    resetZoom;


window.galleryFullscreen =
    toggleFullscreen;


window.toggleGalleryFullscreen =
    toggleFullscreen;


window.refreshGallery =
    refreshGallery;


window.refreshGalleryImages =
    refreshGalleryImages;


window.destroyGallery =
    destroyGallery;


/*=========================================================
AUTO INIT
=========================================================*/

async function autoInitialize(){

    initGlobalEvents();


    if(
        document.readyState === "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                initGallery();

            },
            {
                once: true
            }
        );

        return;

    }


    await initGallery();

}


autoInitialize();


/*=========================================================
END OF GALLERY.JS
=========================================================*/
