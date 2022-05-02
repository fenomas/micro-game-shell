


/*
 * 
 * 
 *      base class and API
 * 
 * 
*/

export class MicroGameShell {

    constructor(domElement = null, pollTime = 10, skipFramesAfter = 100) {
        // settings
        this.stickyPointerLock = false
        this.stickyFullscreen = false

        this.tickRate = 30
        this.maxRenderRate = 0

        // API
        this.pointerLock = false
        this.fullscreen = false

        // for client to override
        this.onTick = function (dt) { }
        this.onRender = function () { }

        this.onInit = function () { }
        this.onResize = function () { }
        this.onPointerLockChanged = function (hasPL) { }
        this.onFullscreenChanged = function (hasFS) { }
        this.onPointerLockerror = function (err) { }

        // init
        domReady(() => {
            setupTimers(this, pollTime, skipFramesAfter)
            setupDomElement(this, domElement)
            this.onInit()
        })
    }
}





/*
 * 
 *      tick- and render events
 * 
*/

function setupTimers(shell, pollTime, skipFramesAfter) {
    shell._nowObject = performance || Date
    shell._skipFramesAfter = skipFramesAfter
    shell._renderAccum = 0
    // these are when the last tick/render _started_
    var now = shell._nowObject.now()
    shell._lastTick = now
    shell._lastRender = now

    shell._frameCB = frameHandler.bind(null, shell)
    requestAnimationFrame(shell._frameCB)
    if (pollTime > 0) {
        shell._intervalCB = intervalHandler.bind(null, shell)
        shell._interval = setInterval(shell._intervalCB, pollTime)
    }
}


function intervalHandler(shell) {
    var now = shell._nowObject.now()
    var cutoffTime = now + shell._skipFramesAfter
    var tickDur = 1000 / shell.tickRate
    // tick until we're up to date
    while (shell._lastTick + tickDur < now) {
        shell.onTick(tickDur)
        shell._lastTick += tickDur
        now = shell._nowObject.now()
        // skip frames if we've exceeded max processing time
        if (now > cutoffTime) {
            shell._lastTick = now
            return
        }
    }
}

function frameHandler(shell) {
    requestAnimationFrame(shell._frameCB)
    intervalHandler(shell)
    var now = shell._nowObject.now()
    var dt = now - shell._lastRender
    shell._lastRender = now
    if (shell.maxRenderRate > 0) {
        shell._renderAccum += dt
        var frameDur = 1000 / shell.maxRenderRate
        if (shell._renderAccum < frameDur) return
        shell._renderAccum = Math.min(shell._renderAccum - frameDur, frameDur)
    }
    var tickDur = 1000 / shell.tickRate
    var framePart = (now - shell._lastTick) / tickDur
    shell.onRender(dt, framePart, tickDur)
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
        if (!el.requestPointerLock) return
        if (!!want === hasPL) return
        if (want) {
            var prom = el.requestPointerLock()
            if (prom.catch) prom.catch(err => {
                if (shell.onPointerLockerror) shell.onPointerLockerror(err)
            })
        }
        else { document.exitPointerLock() }
    }
    var setFS = (want) => {
        if (!el.requestFullscreen) return
        if (!!want === hasFS) return
        if (want) { el.requestFullscreen() }
        else { document.exitFullscreen() }
    }

    // track whether we actually have PL/FS, and send events
    document.addEventListener('pointerlockchange', ev => {
        hasPL = (document.pointerLockElement === el)
        shell.onPointerLockChanged(hasPL)
    })
    document.addEventListener('fullscreenchange', ev => {
        hasFS = (document.fullscreenElement === el)
        shell.onFullscreenChanged(hasFS)
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
        if (shell.stickyPointerLock && !hasPL) setPL(true)
        if (shell.stickyFullscreen && !hasFS) setFS(true)
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

var domReady = (fn) => {
    if (document.readyState === 'loading') {
        var handler = () => {
            document.removeEventListener('readystatechange', handler)
            fn()
        }
        document.addEventListener('readystatechange', handler)
    } else {
        setTimeout(fn, 1)
    }
}
