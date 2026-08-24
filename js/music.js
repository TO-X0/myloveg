/*=========================================================
    music.js PRO v5.0
    Premium Music Engine
    Fade / Volume / Autoplay / Persistence / Visibility
=========================================================*/

"use strict";


/*=========================================================
DEFAULT CONFIG
=========================================================*/

const MusicConfig = {

    autoplay: false,

    volume: 0.4,

    fadeSpeed: 800,

    loop: true,

    persistVolume: true,

    persistState: true,

    pauseWhenHidden: false,

    resumeWhenVisible: true,

    fadeOnPlay: true,

    fadeOnPause: true,

    fadeOnVisibility: true,

    storageKey: "our-love-music",

    volumeKey: "our-love-music-volume",

    stateKey: "our-love-music-state"

};


/*=========================================================
LOAD PROJECT CONFIG
=========================================================*/

async function loadMusicConfig(){

    try{

        const module =
            await import("./config.js");


        if(
            module &&
            module.CONFIG &&
            module.CONFIG.music
        ){

            Object.assign(
                MusicConfig,
                module.CONFIG.music
            );

        }

    }catch(error){

        console.warn(
            "Music configuration could not be loaded. Using defaults.",
            error
        );

    }

}


/*=========================================================
MUSIC STATE
=========================================================*/

const Music = {

    audio: null,

    playBtn: null,

    pauseBtn: null,

    toggleBtn: null,

    volumeControl: null,

    muteButton: null,

    volumeValue: null,

    progress: null,

    currentTime: null,

    duration: null,

    trackTitle: null,

    status: null,

    initialized: false,

    initializing: false,

    playing: false,

    fading: false,

    fadeTimer: null,

    previousVolume: 0.4,

    targetVolume: 0.4,

    userPaused: false,

    wasPlayingBeforeHidden: false,

    listeners: [],

    previousVolumeBeforeMute: 0.4

};


/*=========================================================
GET ELEMENT
=========================================================*/

function get(id){

    return document.getElementById(
        id
    );

}


/*=========================================================
QUERY
=========================================================*/

function query(selector){

    return document.querySelector(
        selector
    );

}


/*=========================================================
ADD EVENT LISTENER
=========================================================*/

function addListener(
    target,
    event,
    handler,
    options
){

    if(
        !target ||
        typeof target.addEventListener !==
        "function"
    ){

        return;

    }


    target.addEventListener(
        event,
        handler,
        options
    );


    Music.listeners.push({

        target,

        event,

        handler,

        options

    });

}


/*=========================================================
REMOVE LISTENERS
=========================================================*/

function removeMusicListeners(){

    Music.listeners.forEach(
        listener => {

            listener.target.removeEventListener(
                listener.event,
                listener.handler,
                listener.options
            );

        }
    );


    Music.listeners = [];

}


/*=========================================================
GET AUDIO SOURCE
=========================================================*/

function getAudioSource(){

    /*
     * Prefer an existing audio element.
     */

    const existing =
        document.querySelector(
            "audio[data-music], #background-music, audio#music, audio"
        );


    if(
        existing
    ){

        return existing;

    }


    /*
     * Otherwise create an audio element.
     */

    const audio =
        document.createElement(
            "audio"
        );


    audio.id =
        "background-music";


    audio.dataset.music =
        "true";


    audio.preload =
        "auto";


    /*
     * If the HTML contains a source configured
     * through a data attribute, use it.
     */

    const source =
        document.body.dataset.music ||
        document.documentElement.dataset.music;


    if(
        source
    ){

        audio.src =
            source;

    }


    document.body.appendChild(
        audio
    );


    return audio;

}


/*=========================================================
COLLECT CONTROLS
=========================================================*/

function collectControls(){

    Music.playBtn =
        get("music-play") ||
        query("[data-music-play]");


    Music.pauseBtn =
        get("music-pause") ||
        query("[data-music-pause]");


    Music.toggleBtn =
        get("music-toggle") ||
        query("[data-music-toggle]");


    Music.volumeControl =
        get("music-volume-range") ||
        get("music-volume") ||
        query("[data-music-volume]");


    Music.muteButton =
        get("music-volume") ||
        query("[data-music-mute]");


    Music.volumeValue =
        get("music-volume-value") ||
        query("[data-music-volume-value]");


    Music.progress =
        get("music-progress") ||
        query("[data-music-progress]");


    Music.currentTime =
        get("music-current-time") ||
        query("[data-music-current]");


    Music.duration =
        get("music-duration") ||
        query("[data-music-duration]");


    Music.trackTitle =
        get("music-title") ||
        query("[data-music-title]");


    Music.status =
        get("music-status") ||
        query("[data-music-status]");

}


/*=========================================================
STORAGE HELPERS
=========================================================*/

function storageGet(key){

    try{

        return localStorage.getItem(
            key
        );

    }catch(error){

        return null;

    }

}


function storageSet(
    key,
    value
){

    try{

        localStorage.setItem(
            key,
            value
        );

    }catch(error){

        /*
         * Storage may be blocked by browser privacy
         * settings. Music continues normally.
         */

    }

}


function storageRemove(key){

    try{

        localStorage.removeItem(
            key
        );

    }catch(error){

        /* Safe fallback. */

    }

}


/*=========================================================
NORMALIZE VOLUME
=========================================================*/

function normalizeVolume(value){

    let volume =
        Number(value);


    if(
        !Number.isFinite(
            volume
        )
    ){

        volume =
            MusicConfig.volume;

    }


    return Math.max(
        0,
        Math.min(
            1,
            volume
        )
    );

}


/*=========================================================
LOAD SAVED SETTINGS
=========================================================*/

function loadSavedSettings(){

    const configuredVolume =
        normalizeVolume(
            MusicConfig.volume
        );


    Music.targetVolume =
        configuredVolume;


    Music.previousVolume =
        configuredVolume;


    if(
        MusicConfig.persistVolume
    ){

        const savedVolume =
            storageGet(
                MusicConfig.volumeKey
            );


        if(
            savedVolume !== null
        ){

            const volume =
                Number(
                    savedVolume
                );


            if(
                Number.isFinite(
                    volume
                )
            ){

                Music.targetVolume =
                    normalizeVolume(
                        volume
                    );


                Music.previousVolume =
                    Music.targetVolume;

            }

        }

    }

}


/*=========================================================
SAVE SETTINGS
=========================================================*/

function saveVolume(){

    if(
        !MusicConfig.persistVolume
    ){

        return;

    }


    storageSet(
        MusicConfig.volumeKey,
        String(
            Music.targetVolume
        )
    );

}


/*=========================================================
SAVE PLAY STATE
=========================================================*/

function saveState(){

    if(
        !MusicConfig.persistState
    ){

        return;

    }


    storageSet(
        MusicConfig.stateKey,
        Music.playing
            ? "playing"
            : "paused"
    );

}


/*=========================================================
GET SAVED STATE
=========================================================*/

function getSavedState(){

    if(
        !MusicConfig.persistState
    ){

        return null;

    }


    return storageGet(
        MusicConfig.stateKey
    );

}


/*=========================================================
SET VOLUME
=========================================================*/

function setVolume(
    value,
    persist = true
){

    if(
        !Music.audio
    ){

        return;

    }


    const volume =
        normalizeVolume(
            value
        );


    Music.targetVolume =
        volume;


    Music.previousVolume =
        volume;


    Music.audio.volume =
        volume;


    if(
        persist
    ){

        saveVolume();

    }


    updateVolumeUI();

}


/*=========================================================
UPDATE VOLUME UI
=========================================================*/

function updateVolumeUI(){

    const volume =
        normalizeVolume(
            Music.targetVolume
        );


    if(
        Music.volumeControl
    ){

        Music.volumeControl.value =
            String(
                volume
            );

    }


    if(
        Music.volumeValue
    ){

        Music.volumeValue.textContent =
            `${Math.round(volume * 100)}%`;

    }


    if(
        Music.muteButton
    ){

        Music.muteButton.setAttribute(
            "aria-pressed",
            String(
                volume <= 0
            )
        );

    }


    if(
        Music.audio
    ){

        const muted =
            Music.audio.muted ||
            volume <= 0;


        if(
            Music.toggleBtn
        ){

            Music.toggleBtn.setAttribute(
                "aria-pressed",
                String(
                    Music.playing
                )
            );

        }

        Music.audio.setAttribute(
            "aria-label",
            muted
                ? "Music muted"
                : "Background music"
        );

    }

}


/*=========================================================
FADE
=========================================================*/

function fadeVolume(
    target,
    duration = MusicConfig.fadeSpeed
){

    if(
        !Music.audio
    ){

        return Promise.resolve();

    }


    if(
        Music.fadeTimer
    ){

        clearInterval(
            Music.fadeTimer
        );


        Music.fadeTimer =
            null;

    }


    const audio =
        Music.audio;


    const start =
        audio.volume;


    const end =
        normalizeVolume(
            target
        );


    const time =
        Math.max(
            0,
            Number(duration) || 0
        );


    if(
        time === 0 ||
        Math.abs(start - end) < 0.001
    ){

        audio.volume =
            end;

        return Promise.resolve();

    }


    Music.fading =
        true;


    const started =
        performance.now();


    return new Promise(
        resolve => {

            Music.fadeTimer =
                setInterval(
                    () => {

                        const elapsed =
                            performance.now() -
                            started;


                        const progress =
                            Math.min(
                                1,
                                elapsed / time
                            );


                        /*
                         * Smooth ease-in-out curve.
                         */

                        const eased =
                            progress < 0.5

                                ? 2 *
                                  progress *
                                  progress

                                : 1 -
                                  Math.pow(
                                      -2 *
                                      progress +
                                      2,
                                      2
                                  ) /
                                  2;


                        audio.volume =
                            start +
                            (
                                end -
                                start
                            ) *
                            eased;


                        if(
                            progress >= 1
                        ){

                            clearInterval(
                                Music.fadeTimer
                            );


                            Music.fadeTimer =
                                null;


                            audio.volume =
                                end;


                            Music.fading =
                                false;


                            resolve();

                        }

                    },

                    16

                );

        }
    );

}


/*=========================================================
PLAY
=========================================================*/

async function playMusic(){

    if(
        !Music.audio
    ){

        return false;

    }


    /*
     * Don't create duplicate play requests.
     */

    if(
        !Music.audio.paused
    ){

        Music.playing =
            true;


        updateMusicUI();


        return true;

    }


    Music.userPaused =
        false;


    try{

        /*
         * Start silently when fade-in is enabled.
         */

        if(
            MusicConfig.fadeOnPlay
        ){

            Music.audio.volume =
                0;

        }else{

            Music.audio.volume =
                Music.targetVolume;

        }


        const result =
            Music.audio.play();


        if(
            result &&
            typeof result.then ===
            "function"
        ){

            await result;

        }


        Music.playing =
            true;


        updateMusicUI();


        if(
            MusicConfig.fadeOnPlay
        ){

            await fadeVolume(
                Music.targetVolume,
                MusicConfig.fadeSpeed
            );

        }else{

            Music.audio.volume =
                Music.targetVolume;

        }


        saveState();


        return true;

    }catch(error){

        Music.playing =
            false;


        updateMusicUI();


        console.warn(
            "Music playback was blocked or failed.",
            error
        );


        return false;

    }

}


/*=========================================================
PAUSE
=========================================================*/

async function pauseMusic(
    userAction = true
){

    if(
        !Music.audio
    ){

        return;

    }


    if(
        userAction
    ){

        Music.userPaused =
            true;

    }


    if(
        Music.audio.paused
    ){

        Music.playing =
            false;


        updateMusicUI();


        saveState();


        return;

    }


    if(
        MusicConfig.fadeOnPause
    ){

        await fadeVolume(
            0,
            MusicConfig.fadeSpeed
        );

    }


    Music.audio.pause();


    Music.audio.volume =
        Music.targetVolume;


    Music.playing =
        false;


    updateMusicUI();


    saveState();

}


/*=========================================================
TOGGLE
=========================================================*/

async function toggleMusic(){

    if(
        !Music.audio
    ){

        return;

    }


    if(
        Music.audio.paused
    ){

        await playMusic();

    }else{

        await pauseMusic(
            true
        );

    }

}


/*=========================================================
MUTE
=========================================================*/

function muteMusic(){

    if(
        !Music.audio
    ){

        return;

    }


    if(
        Music.targetVolume > 0
    ){

        Music.previousVolumeBeforeMute =
            Music.targetVolume;

    }


    setVolume(
        0
    );

}


/*=========================================================
UNMUTE
=========================================================*/

function unmuteMusic(){

    if(
        !Music.audio
    ){

        return;

    }


    const volume =
        Music.previousVolumeBeforeMute > 0

            ? Music.previousVolumeBeforeMute

            : normalizeVolume(
                MusicConfig.volume
            );


    setVolume(
        volume
    );

}


/*=========================================================
SEEK
=========================================================*/

function seekMusic(
    seconds
){

    if(
        !Music.audio ||
        !Number.isFinite(
            seconds
        )
    ){

        return;

    }


    if(
        !Number.isFinite(
            Music.audio.duration
        )
    ){

        return;

    }


    Music.audio.currentTime =
        Math.max(
            0,
            Math.min(
                Music.audio.duration,
                seconds
            )
        );

}


/*=========================================================
SET PROGRESS
=========================================================*/

function setProgress(
    value
){

    if(
        !Music.audio
    ){

        return;

    }


    const duration =
        Music.audio.duration;


    if(
        !Number.isFinite(
            duration
        )
    ){

        return;

    }


    const percent =
        Math.max(
            0,
            Math.min(
                100,
                Number(value)
            )
        );


    Music.audio.currentTime =
        duration *
        (
            percent / 100
        );

}


/*=========================================================
FORMAT TIME
=========================================================*/

function formatTime(
    seconds
){

    if(
        !Number.isFinite(
            seconds
        )
    ){

        return "0:00";

    }


    const total =
        Math.max(
            0,
            Math.floor(seconds)
        );


    const minutes =
        Math.floor(
            total / 60
        );


    const remaining =
        total % 60;


    return `${minutes}:${String(
        remaining
    ).padStart(
        2,
        "0"
    )}`;

}


/*=========================================================
UPDATE PROGRESS UI
=========================================================*/

function updateProgressUI(){

    if(
        !Music.audio
    ){

        return;

    }


    const current =
        Music.audio.currentTime || 0;


    const duration =
        Music.audio.duration;


    if(
        Music.currentTime
    ){

        Music.currentTime.textContent =
            formatTime(
                current
            );

    }


    if(
        Music.duration
    ){

        Music.duration.textContent =
            formatTime(
                duration
            );

    }


    if(
        Music.progress
    ){

        const percent =
            Number.isFinite(
                duration
            ) &&
            duration > 0

                ? (
                    current /
                    duration
                ) * 100

                : 0;


        Music.progress.value =
            String(
                percent
            );

    }

}


/*=========================================================
UPDATE MUSIC UI
=========================================================*/

function updateMusicUI(){

    const playing =
        Boolean(
            Music.audio &&
            !Music.audio.paused
        );


    Music.playing =
        playing;


    if(
        Music.playBtn
    ){

        Music.playBtn.hidden =
            playing;


        Music.playBtn.setAttribute(
            "aria-label",
            "Play music"
        );

    }


    if(
        Music.pauseBtn
    ){

        Music.pauseBtn.hidden =
            !playing;


        Music.pauseBtn.setAttribute(
            "aria-label",
            "Pause music"
        );

    }


    if(
        Music.toggleBtn
    ){

        Music.toggleBtn.classList.toggle(
            "is-playing",
            playing
        );


        Music.toggleBtn.setAttribute(
            "aria-pressed",
            String(
                playing
            )
        );


        Music.toggleBtn.setAttribute(
            "aria-label",
            playing
                ? "Pause music"
                : "Play music"
        );


        /*
         * Supports icon systems using CSS.
         */

        Music.toggleBtn.dataset.state =
            playing
                ? "playing"
                : "paused";

    }


    if(
        Music.status
    ){

        Music.status.textContent =
            playing
                ? "Playing"
                : "Paused";

    }


    updateVolumeUI();

    updateProgressUI();

}


/*=========================================================
AUDIO EVENTS
=========================================================*/

function bindAudioEvents(){

    if(
        !Music.audio
    ){

        return;

    }


    addListener(
        Music.audio,
        "play",
        () => {

            Music.playing =
                true;

            updateMusicUI();

        }
    );


    addListener(
        Music.audio,
        "pause",
        () => {

            Music.playing =
                false;

            updateMusicUI();

        }
    );


    addListener(
        Music.audio,
        "timeupdate",
        updateProgressUI
    );


    addListener(
        Music.audio,
        "loadedmetadata",
        updateProgressUI
    );


    addListener(
        Music.audio,
        "durationchange",
        updateProgressUI
    );


    addListener(
        Music.audio,
        "volumechange",
        updateVolumeUI
    );


    addListener(
        Music.audio,
        "ended",
        () => {

            if(
                MusicConfig.loop
            ){

                Music.playing =
                    false;

                /*
                 * Browser loop normally handles this,
                 * but this keeps state synchronized.
                 */

                updateMusicUI();

            }else{

                Music.playing =
                    false;


                updateMusicUI();


                saveState();

            }

        }
    );


    addListener(
        Music.audio,
        "error",
        () => {

            Music.playing =
                false;


            updateMusicUI();


            console.warn(
                "Unable to load music source."
            );

        }
    );

}


/*=========================================================
CONTROL EVENTS
=========================================================*/

function bindControlEvents(){

    addListener(
        Music.playBtn,
        "click",
        () => {

            playMusic();

        }
    );


    addListener(
        Music.pauseBtn,
        "click",
        () => {

            pauseMusic(
                true
            );

        }
    );


    addListener(
        Music.toggleBtn,
        "click",
        () => {

            toggleMusic();

        }
    );


    addListener(
        Music.volumeControl,
        "input",
        event => {

            setVolume(
                event.target.value
            );

        }
    );


    addListener(
        Music.muteButton,
        "click",
        () => {

            if(
                Music.targetVolume > 0
            ){

                muteMusic();

            }else{

                unmuteMusic();

            }

        }
    );


    addListener(
        Music.progress,
        "input",
        event => {

            setProgress(
                event.target.value
            );

        }
    );

}


/*=========================================================
KEYBOARD SHORTCUTS
=========================================================*/

function handleKeyboard(event){

    /*
     * Avoid interfering with text fields.
     */

    const active =
        document.activeElement;


    if(
        active &&
        (
            active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.tagName === "SELECT" ||
            active.isContentEditable
        )
    ){

        return;

    }


    switch(
        event.key
    ){

        case "m":

        case "M":

            event.preventDefault();


            if(
                Music.targetVolume > 0
            ){

                muteMusic();

            }else{

                unmuteMusic();

            }

            break;


        case " ":

            /*
             * Only handle space when the user
             * isn't interacting with a button.
             */

            if(
                active &&
                active.tagName === "BUTTON"
            ){

                return;

            }


            event.preventDefault();


            toggleMusic();

            break;

    }

}


/*=========================================================
VISIBILITY
=========================================================*/

async function handleVisibilityChange(){

    if(
        !Music.audio
    ){

        return;

    }


    if(
        document.hidden
    ){

        Music.wasPlayingBeforeHidden =
            !Music.audio.paused;


        if(
            MusicConfig.pauseWhenHidden &&
            Music.wasPlayingBeforeHidden
        ){

            await pauseMusic(
                false
            );

        }


        return;

    }


    /*
     * Resume only when the configuration allows it
     * and the user did not manually pause the music.
     */

    if(
        MusicConfig.resumeWhenVisible &&
        Music.wasPlayingBeforeHidden &&
        !Music.userPaused
    ){

        await playMusic();

    }


    Music.wasPlayingBeforeHidden =
        false;

}


/*=========================================================
CONFIGURE AUDIO
=========================================================*/

function configureAudio(){

    if(
        !Music.audio
    ){

        return;

    }


    Music.audio.loop =
        Boolean(
            MusicConfig.loop
        );


    Music.audio.preload =
        "auto";


    Music.audio.volume =
        normalizeVolume(
            Music.targetVolume
        );


    Music.audio.controls =
        false;


    Music.audio.setAttribute(
        "aria-label",
        "Background music"
    );

}


/*=========================================================
AUTOPLAY
=========================================================*/

async function attemptAutoplay(){

    if(
        !MusicConfig.autoplay
    ){

        return false;

    }


    /*
     * Modern browsers may reject autoplay.
     * This is expected and not treated as an error.
     */

    const success =
        await playMusic();


    if(
        !success
    ){

        console.info(
            "Autoplay was blocked. Waiting for user interaction."
        );

    }


    return success;

}


/*=========================================================
USER INTERACTION FALLBACK
=========================================================*/

function bindAutoplayFallback(){

    if(
        !MusicConfig.autoplay
    ){

        return;

    }


    const interactionEvents = [

        "pointerdown",

        "touchstart",

        "keydown"

    ];


    const startAfterInteraction =
        async () => {

            if(
                Music.playing
            ){

                cleanup();

                return;

            }


            const success =
                await playMusic();


            if(
                success
            ){

                cleanup();

            }

        };


    const cleanup =
        () => {

            interactionEvents.forEach(
                event => {

                    document.removeEventListener(
                        event,
                        startAfterInteraction
                    );

                }
            );

        };


    interactionEvents.forEach(
        event => {

            document.addEventListener(
                event,
                startAfterInteraction,
                {
                    passive: true
                }
            );

        }
    );

}


/*=========================================================
INITIALIZE
=========================================================*/

async function initMusic(){

    if(
        Music.initialized
    ){

        return;

    }


    if(
        Music.initializing
    ){

        return;

    }


    Music.initializing =
        true;


    try{

        await loadMusicConfig();


        Music.audio =
            getAudioSource();


        if(
            !Music.audio
        ){

            return;

        }


        collectControls();


        loadSavedSettings();


        configureAudio();


        bindAudioEvents();


        bindControlEvents();


        addListener(
            document,
            "keydown",
            handleKeyboard
        );


        addListener(
            document,
            "visibilitychange",
            handleVisibilityChange
        );


        Music.initialized =
            true;


        updateMusicUI();


        bindAutoplayFallback();


        await attemptAutoplay();


    }finally{

        Music.initializing =
            false;

    }

}


/*=========================================================
SET SOURCE
=========================================================*/

function setMusicSource(
    source,
    autoplay = false
){

    if(
        !Music.audio ||
        !source
    ){

        return false;

    }


    const wasPlaying =
        !Music.audio.paused;


    Music.audio.pause();


    Music.audio.src =
        source;


    Music.audio.load();


    Music.playing =
        false;


    updateMusicUI();


    if(
        autoplay ||
        wasPlaying
    ){

        playMusic();

    }


    return true;

}


/*=========================================================
RESTART
=========================================================*/

function restartMusic(){

    if(
        !Music.audio
    ){

        return;

    }


    Music.audio.currentTime =
        0;


    playMusic();

}


/*=========================================================
STOP
=========================================================*/

async function stopMusic(){

    if(
        !Music.audio
    ){

        return;

    }


    await pauseMusic(
        true
    );


    try{

        Music.audio.currentTime =
            0;

    }catch(error){

        /* Safe fallback. */

    }


    updateProgressUI();

}


/*=========================================================
DESTROY
=========================================================*/

function destroyMusic(){

    if(
        Music.fadeTimer
    ){

        clearInterval(
            Music.fadeTimer
        );


        Music.fadeTimer =
            null;

    }


    removeMusicListeners();


    if(
        Music.audio
    ){

        Music.audio.pause();

    }


    Music.audio =
        null;


    Music.playBtn =
        null;


    Music.pauseBtn =
        null;


    Music.toggleBtn =
        null;


    Music.volumeControl =
        null;


    Music.muteButton =
        null;


    Music.volumeValue =
        null;


    Music.progress =
        null;


    Music.currentTime =
        null;


    Music.duration =
        null;


    Music.trackTitle =
        null;


    Music.status =
        null;


    Music.initialized =
        false;


    Music.initializing =
        false;


    Music.playing =
        false;


    Music.fading =
        false;


    Music.userPaused =
        false;


    Music.wasPlayingBeforeHidden =
        false;

}


/*=========================================================
PUBLIC API
=========================================================*/

window.initMusic =
    initMusic;


window.playMusic =
    playMusic;


window.pauseMusic =
    pauseMusic;


window.toggleMusic =
    toggleMusic;


window.muteMusic =
    muteMusic;


window.unmuteMusic =
    unmuteMusic;


window.setMusicVolume =
    setVolume;


window.seekMusic =
    seekMusic;


window.restartMusic =
    restartMusic;


window.stopMusic =
    stopMusic;


window.setMusicSource =
    setMusicSource;


window.destroyMusic =
    destroyMusic;


/*=========================================================
AUTO INIT
=========================================================*/

async function autoInitializeMusic(){

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                initMusic();

            },
            {
                once: true
            }
        );

        return;

    }


    await initMusic();

}


autoInitializeMusic();


/*=========================================================
END OF MUSIC.JS
=========================================================*/