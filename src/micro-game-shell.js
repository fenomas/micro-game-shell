
// single source of timing info
var nowObject = performance || Date


/*
 * 
 * 
 *      base class and API
 * 
 * 
*/

export class MicroGameShell {

    constructor(domElement, pollTime = 10) {
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

        // init
        domReady(() => {
            setupTimers(this, pollTime)
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

function setupTimers(shell, pollTime) {
    var tickAccum = 0
    var renderAccum = 0
    var lastTick = nowObject.now()
    var lastRender = lastTick

    var intervalHandler = () => {
        var now = nowObject.now()
        var dt = now - lastTick
        lastTick = now
        tickAccum += dt
        var tickDur = 1000 / shell.tickRate
        if (tickAccum < tickDur) return
        tickAccum = Math.min(tickAccum - tickDur, tickDur)
        shell.onTick(tickDur)
    }

    var frameHandler = () => {
        requestAnimationFrame(frameHandler)
        var now = nowObject.now()
        var dt = now - lastRender
        lastRender = now
        if (shell.maxRenderRate > 0) {
            renderAccum += dt
            var frameDur = 1000 / shell.maxRenderRate
            if (renderAccum < frameDur) return
            renderAccum = Math.min(renderAccum - frameDur, frameDur)
        }
        var tickDur = 1000 / shell.tickRate
        var framePart = (now - lastTick) / tickDur
        shell.onRender(dt, framePart)
    }

    setInterval(intervalHandler, pollTime || 10)
    requestAnimationFrame(frameHandler)
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
        set: (want) => {
            if (want && !hasPL) {
                el.requestPointerLock()
            } else if (hasPL && !want) {
                document.exitPointerLock()
            }
        }
    })
    Object.defineProperty(shell, 'fullscreen', {
        get: () => hasFS,
        set: (want) => {
            if (want && !hasFS) {
                el.requestFullscreen()
            } else if (hasFS && !want) {
                document.exitFullscreen()
            }
        }
    })


    // stickiness via click handler
    el.addEventListener('click', ev => {
        if (shell.stickyPointerLock && !hasPL) {
            el.requestPointerLock()
        }
        if (shell.stickyFullscreen && !hasFS) {
            el.requestFullscreen()
        }
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
