
# micro-game-shell

A small game shell. Provides reliable timing events, and manages pointerlock/fullscreen/resize.

[Live demo](https://fenomas.github.io/micro-game-shell/)

This library provides two sets of timing events: `tick`, which can fire at any specified rate, and `render`, which fires on browser frame updates (but can be throttled to a lower rate).`

The intention is that game clients can use these events to implement 
[fixed timesteps](https://gafferongames.com/post/fix_your_timestep/), where game logic (e.g. physics) runs at a different cadence than rendering.


----

## Usage

```sh
npm i --save micro-game-shell
```

```js
import { MicroGameShell } from 'micro-game-shell'

// instantiate
var document.querySelector('#game')     // optional
var pollRate = 10                       // optional
var shell = new MicroGameShell(domElement, pollRate)

// settings
shell.tickRate = 30               // ticks/second
shell.maxRenderRate = 0           // fps - 0 means uncapped
shell.stickyPointerLock = false   // whether to request pointerLock on click
shell.stickyFullscreen = false    // ditto for fullscreen
shell.maxTickProcessingTime = 25  // see below

// add event callbacks
shell.onTick = (tickDur)  => { /* ... */ }
shell.onRender = (dt, fp) => { /* ... */ }
// see below for rest of events
```


## API

Consctructor params:

 * `domElement` - a DOM element, for pointerLock/fullscreen. If none is specified, shell instance will ignore DOM features, and just issue timing events.
 * `pollTime` (10ms) - how often to poll for ticks. Set to `0` if you want to disable polling.

Instance properties:

 * `tickRate` - desired tick events per second. Default `30`
 * `maxRenderRate` - upper limit for the rate of render events. Default of `0` means uncapped.
 * `pointerLock` - check or set whether the DOM element has pointerlock
 * `fullscreen` - check or set whether the DOM element has fullscreen
 * `stickyPointerLock` - shell will request pointerLock when the domElement is clicked. default `false`
 * `stickyFullscreen` - shell will request fullscreen when the domElement is clicked. default `false`
 * `maxTickTime` - max time spent issuing tick events when behind schedule. If the shell spends this long on tick events, it will discard all pending ticks to catch up. Default `100`ms.

Events:

 * `onTick(tickDur)` - tick event handler. `tickDur` is a fixed constant value (ms), not the actual time elapsed.
 * `onRender(dt, framePart, tickTime)` - render event handler. `dt` is actual time since the last render (in ms), and `framepart` is the fractional number of game ticks (i.e. how far we are into the current tick).

 * `onInit()` - fires once, when shell is set up (after `DOMReady`)
 * `onResize()` - fires when dom element's window changes size
 * `onPointerLockChanged(hasPL)` - fires on gaining/losing pointerLock
 * `onFullscreenChanged(hasFS)` - fires on gaining/losing fullscreen
 * `onPointerLockError(err)` - fires when pointerLock is refused by the browser


----

## Credits

Made with 🍺 by [Andy Hall](https://twitter.com/fenomas), license is ISC.

