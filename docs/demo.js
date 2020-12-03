
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






/*
 * 
 *          logic
 * 
*/

var tickTimer = makeTimer()
var tickUpdate = 1
shell.onTick = (dt) => {
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
shell.onRender = (dt, framePart) => {
    var rate = renderTimer()
    if (--renderUpdate === 0) {
        $('#OFR').textContent = Math.round(rate)
        renderUpdate = debounce(rate)
    }
    var tgt = performance.now() + wasteTimeRender
    while (performance.now() < tgt) { }
}

var debounce = rate => Math.ceil(rate / 5)




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

