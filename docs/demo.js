
/*
 * 
 *          setup
 * 
*/



import { MicroGameShell } from '..'
var $ = document.querySelector.bind(document)

var domElement = $('.game')
var pollRate = 15
var shell = new MicroGameShell(domElement, pollRate)

var wasteTimeTick = 0
var wasteTimeRender = 0






/*
 * 
 *          inputs
 * 
*/

setupInput('#PL', val => { shell.stickyPointerLock = val })
setupInput('#FS', val => { shell.stickyFullscreen = val })

setupInput('#TR', val => { shell.tickRate = val })
setupInput('#MRR', val => { shell.maxRenderRate = val })

setupInput('#WTT', val => { wasteTimeTick = val })
setupInput('#WTR', val => { wasteTimeRender = val })


function setupInput(id, handler) {
    var el = $(id)
    el.oninput = (ev => {
        var val = parseInt(ev.target.value)
        handler(isNaN(val) ? ev.target.checked : val)
    })
    setTimeout(() => {
        var val = parseInt(el.value)
        handler(isNaN(val) ? el.checked : val)
    }, 1)
}


$('.spike').onclick = function () {
    var t = performance.now() + 500
    while (performance.now() < t) { }
}



/*
 * 
 *          logic
 * 
*/

var tickTimer = makeTimer()
var tickUpdate = 1
var lastTick = 0
shell.onTick = (tickTime) => {
    if (log) {
        var t = performance.now()
        console.log('  tick', 'dt', t - lastTick, 'dur', tickTime)
        lastTick = t
    }
    tickOutput(tickTime)
    var rate = tickTimer()
    if (--tickUpdate === 0) {
        $('#OTR').textContent = Math.round(rate)
        tickUpdate = debounce(rate)
    }
    var tgt = performance.now() + wasteTimeTick
    while (performance.now() < tgt) { }
}

var renderTimer = makeTimer()
var renderUpdate = 1
shell.onRender = (dt, framePart, tickTime) => {
    if (log) {
        var msIn = framePart * tickTime
        console.log('render', 'dt', dt, 'part', framePart, 'ms in:', msIn)
    }
    renderOutput(framePart, tickTime)
    var rate = renderTimer()
    if (--renderUpdate === 0) {
        $('#OFR').textContent = Math.round(rate)
        renderUpdate = debounce(rate)
    }
    var tgt = performance.now() + wasteTimeRender
    while (performance.now() < tgt) { }
}

var debounce = rate => Math.ceil(rate / 5)


shell.onPointerLockChanged = (hasPL) => {
    console.log(hasPL ? 'Gained' : 'Lost', 'pointerLock')
}
shell.onFullscreenChanged = (hasFS) => {
    console.log(hasFS ? 'Gained' : 'Lost', 'fullScreen')
}
shell.onPointerLockError = (err) => {
    console.log('PointerLock error:', err)
}


var log = false
document.addEventListener('keydown', ev => {
    if (ev.key === 'p') log = !log
})



/*
 * 
 *          visual timing check
 * 
*/

var canvas = $('.output')
var ctx = canvas.getContext('2d')
var pos = 0
var vel = 600
var ypos = 0
var yvel = 50
var cw = canvas.width
var ch = canvas.height
var mode = 0
canvas.onclick = () => { mode = (mode + 1) % 3 }

function tickOutput(dt) {
    pos += vel * dt / 1000
    if (pos > cw) pos -= cw
    ypos += yvel * dt / 1000
    if (ypos > ch) ypos -= ch
}

var ct = 0
var lx = 0
function renderOutput(framePart, dt) {
    var velPerTick = vel * dt / 1000
    var x = (pos + framePart * velPerTick) % cw
    var y = (ypos + framePart * (yvel * dt / 1000))
    if (mode === 0) {
        // ctx.clearRect(0, 0, cw, ch)
        fade(1)
        drawBox(x, 30, 40, 40)
    } else if (mode === 1) {
        fade(((ct++ % 10) === 0) ? 0.15 : 0.05)
        var h = 30
        drawBox(x, y, 2, h)
        if (y > ch - h) drawBox(x, y - ch, 2, h)
    } else {
        var dx = x - lx
        if (dx < -cw / 2) dx += cw
        lx = x
        fade(0.02)
        ctx.globalCompositeOperation = 'copy'
        ctx.drawImage(ctx.canvas, -dx, 0)
        ctx.globalCompositeOperation = 'source-over'
        drawBox(cw - 15, 10, 1, ch - 20)
    }
}

var fade = (amt) => {
    ctx.fillStyle = `rgba(255,255,255, ${amt})`
    ctx.fillRect(0, 0, cw, ch)
}

var drawBox = (x, y, w, h) => {
    ctx.fillStyle = 'red'
    ctx.fillRect(x, y, w, h)
}



/*
 * 
 *          helpers
 * 
*/

function makeTimer() {
    var last = 0
    var avg = 10
    var moving = 0.95
    return () => {
        var now = performance.now()
        var dt = now - last
        last = now
        avg = moving * avg + dt * (1 - moving)
        return 1000 / avg
    }
}

