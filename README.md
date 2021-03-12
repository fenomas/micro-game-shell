
# micro-game-shell

A small game shell. Provides reliable timing events, and manages pointerlock/fullscreen/resize.

[Live demo](https://andyhall.github.io/micro-game-shell/)

This library provides two sets of timing events: `tick`, which can fire at any specified rate, and `render`, which fire as often as the browser redraws (but can be throttled to a lower rate).`

The intention is that game clients can use these events to implement 
[fixed timesteps](https://gafferongames.com/post/fix_your_timestep/), where game logic (e.g. physics) runs at a different cadence than rendering.


----

## Usage

```sh
npm i --save micro-game-shell
```

```js
import { MicroGameShell } from 'micro-game-shell'

var $ = document.querySelector.bind(document)
var domElement = $('.game-container')   // optional
var pollRate = 10                       // optional, default 10ms (0 disables polling)

// instantiate
var shell = new MicroGameShell(domElement, pollRate)

// set settings
shell.tickRate = 30               // ticks/second
shell.maxRenderRate = 0           // 0 means uncapped
shell.stickyPointerLock = true    // requests pointerLock on click
shell.stickyFullscreen = false    // ditto for fullscreen

// add event callbacks
shell.onTick = (tickDur) => { /* ... */ }
// see below for rest of events
```


## API

Settings:

 * `tickRate` - tick events per second. Default `30`
 * `maxRenderRate` - upper limit for the rate of render events. Default of `0` means uncapped.
 * `stickyPointerLock` - shell will request pointerLock when the domElement is clicked. default `false`
 * `stickyFullscreen` - shell will request fullscreen when the domElement is clicked. default `false`

Properties:

 * `pointerLock` - manage whether the DOM element has pointerlock
 * `fullscreen` - manage whether the DOM element has fullscreen

Events:

 * `onTick(tickTime)` - tick event handler. `tickTime` is a fixed constant value (in ms), not the actual time elapsed.
 * `onRender(dt, framePart, tickTime)` - render event handler. `dt` is actual time since the last render (in ms), and `framepart` is the fractional number of game ticks (i.e. how far we are into the current tick).

 * `onInit()` - fires once, when shell is set up (after `DOMReady` if necessary)
 * `onResize()` - fires when dom element changes size
 * `onPointerLockChanged(hasPL)` - fires on gaining/losing pointerLock
 * `onFullscreenChanged(hasFS)` - fires on gaining/losing fullscreen


----

## Credits

Made with 🍺 by [Andy Hall](https://twitter.com/fenomas), license is ISC.

