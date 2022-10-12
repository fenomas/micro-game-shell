


/*
 * 
 * 
 *      base class and API
 * 
 * 
*/

export class MicroGameShell {

    constructor(domElement = null, pollTime = 10) {

        /** When true, the shell will try to acquire pointerlock on click events */
        this.stickyPointerLock = false
        /** When true, the shell will try to acquire fullscreen on click events */
        this.stickyFullscreen = false

        /** Desired tick events per second */
        this.tickRate = 30
        /** Upper limit for render events per second - `0` means uncapped */
        this.maxRenderRate = 0
        /** Max time spent issuing tick events when behind schedule. If the shell spends this long on tick events, it will discard all pending ticks to catch up. */
        this.maxTickTime = 100


        /** Check or set whether the DOM element has pointerlock */
        this.pointerLock = false
        /** Check or set whether the DOM element has fullscreen */
        this.fullscreen = false

        /**
         * Tick event handler.
         * @param {number} dt: tick duration (ms) - this is a fixed value based on the tick rate, not the observed time elapsed
         */
        this.onTick = function (dt) { }

        /**
         * Render event handler.
         * @param {number} dt: elapsed time (ms) since previous render event
         * @param {number} framePart: fraction (0..1) corresponding to how much of the current tick has elapsed
         * @param {number} tickDur: tick duration (ms)
         */
        this.onRender = function (dt, framePart, tickDur) { }


        /** This event fires once after shell initializes. */
        this.onInit = function () { }
        /** This event fires when the domElement's window resizes */
        this.onResize = function () { }
        /** This event fires when pointerlock is gained or lost */
        this.onPointerLockChanged = function (hasPL = false) { }
        /** This event fires when fullscreen is gained or lost */
        this.onFullscreenChanged = function (hasFS = false) { }
        /** This event fires when a pointerLock error occurs */
        this.onPointerLockError = function (err) { }



        // hide internals in a data object
        this._data = new Data(pollTime)

        // init
        domReady(() => {
            setupTimers(this)
            setupDomElement(this, domElement)
            this.onInit()
        })
    }
}


// internal data structure
function Data(pollTime = 10) {
    this.nowObject = performance || Date
    this.pollTime = pollTime
    this.renderAccum = 0
    this.lastTickStarted = 0
    this.lastFrameStarted = 0
    this.lastRenderStarted = 0
    this.avgTickTime = 2
    this.frameCB = null
    this.intervalCB = null
    this.intervalID = -1
}







/*
 * 
 *      tick- and render events
 * 
*/

/** @param {MicroGameShell} shell */
function setupTimers(shell) {
    var dat = shell._data
    var now = dat.nowObject.now()
    dat.lastTickStarted = now
    dat.lastFrameStarted = now
    dat.lastRenderStarted = now

    dat.frameCB = () => frameHandler(shell)
    dat.intervalCB = () => intervalHandler(shell)
    requestAnimationFrame(dat.frameCB)

    if (dat.pollTime > 0) {
        dat.intervalID = setInterval(dat.intervalCB, dat.pollTime)
    }
}




/** 
 * RAF handler - triggers render events
 * @param {MicroGameShell} shell
*/
function frameHandler(shell) {
    var dat = shell._data
    requestAnimationFrame(dat.frameCB)
    // first catch up on ticks if we're behind schedule
    intervalHandler(shell)
    // now decide whether to do a render, if rate is capped
    var now = dat.nowObject.now()
    var dt = now - dat.lastFrameStarted
    dat.lastFrameStarted = now
    if (shell.maxRenderRate > 0) {
        dat.renderAccum += dt
        var frameDur = 1000 / shell.maxRenderRate
        if (dat.renderAccum < frameDur) return
        dat.renderAccum -= frameDur
        // don't save up more than one pending frame
        if (dat.renderAccum > frameDur) dat.renderAccum = frameDur
    }
    // issue the render event
    var renderDt = now - dat.lastRenderStarted
    dat.lastRenderStarted = now
    var tickDur = 1000 / shell.tickRate
    var framePart = (now - dat.lastTickStarted) / tickDur
    if (framePart < 0) framePart = 0

    // issue render, and optimistically schedule lookahead interval handler
    shell.onRender(renderDt, framePart, tickDur)
    setTimeout(intervalHandler, 0, shell, true)
}




/** 
 * setInterval handler - triggers tick events
 * @param {MicroGameShell} shell
*/
function intervalHandler(shell, lookAhead = false) {
    var dat = shell._data
    var now = dat.nowObject.now()
    // decide base and cutoff times until which we issue ticks
    var tickUntil = now
    if (lookAhead) tickUntil += dat.avgTickTime
    var cutoffTime = now + shell.maxTickTime
    if (!(cutoffTime > now)) cutoffTime = now + 1
    var tickDur = 1000 / shell.tickRate

    // issue ticks until we're up to date or out of time
    while (dat.lastTickStarted + tickDur < tickUntil) {
        shell.onTick(tickDur)
        dat.lastTickStarted += tickDur
        var after = dat.nowObject.now()
        dat.avgTickTime = runningAverage(dat.avgTickTime, after - now)

        // and track the approx processing time, and close loop
        now = after
        if (now > cutoffTime) {
            dat.lastTickStarted = now
            return
        }
    }
}







/*
 * 
 *      DOM element and sticky fullscreen/pointerlock
 * 
*/

function setupDomElement(shell, el) {
    if (!el) return
    var hasPL = false
    var hasFS = false

    var setPL = (want) => {
        hasPL = (el === document.pointerLockElement)
        if (!!want === hasPL) return
        if (want) {
            // chrome returns a promise here, others don't
            var res = el.requestPointerLock()
            if (res && res.catch) res.catch(err => {
                // error already handled in `pointerlockerror`
            })
        } else {
            document.exitPointerLock()
        }
    }
    var setFS = (want) => {
        hasFS = (el === document.fullscreenElement)
        if (!!want === hasFS) return
        if (want) {
            if (el.requestFullscreen) {
                el.requestFullscreen()
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document['webkitExitFullscreen']) {
                document['webkitExitFullscreen']()
            }
        }
    }

    // track whether we actually have PL/FS, and send events
    document.addEventListener('pointerlockchange', ev => {
        hasPL = (el === document.pointerLockElement)
        shell.onPointerLockChanged(hasPL)
    })
    document.addEventListener('fullscreenchange', ev => {
        hasFS = (el === document.fullscreenElement)
        shell.onFullscreenChanged(hasFS)
    })
    document.addEventListener('pointerlockerror', err => {
        hasPL = (el === document.pointerLockElement)
        shell.onPointerLockError(err)
    })


    // decorate shell with getter/setters that request FS/PL
    Object.defineProperty(shell, 'pointerLock', {
        get: () => hasPL,
        set: setPL,
    })
    Object.defineProperty(shell, 'fullscreen', {
        get: () => hasFS,
        set: setFS,
    })


    // stickiness via click handler
    el.addEventListener('click', ev => {
        if (shell.stickyPointerLock) setPL(true)
        if (shell.stickyFullscreen) setFS(true)
    })


    // resize events via ResizeObserver
    var resizeHandler = () => shell.onResize()
    if (window.ResizeObserver) {
        var observer = new ResizeObserver(resizeHandler)
        observer.observe(el)
    } else {
        window.addEventListener('resize', resizeHandler)
    }
}





/*
 * 
 *      util 
 * 
*/

function runningAverage(avg, newVal) {
    // squash effects of large one-off spikes
    if (newVal > avg * 4) newVal = avg * 4
    if (newVal < avg * 0.25) newVal = avg * 0.25
    return 0.9 * avg + 0.1 * newVal
}

function domReady(fn) {
    if (document.readyState === 'loading') {
        var handler = () => {
            document.removeEventListener('readystatechange', handler)
            fn()
        }
        document.addEventListener('readystatechange', handler)
    } else {
        setTimeout(fn, 0)
    }
}
