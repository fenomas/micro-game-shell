export class MicroGameShell {
    constructor(domElement?: any, pollTime?: number);
    /** When true, the shell will try to acquire pointerlock on click events */
    stickyPointerLock: boolean;
    /** When true, the shell will try to acquire fullscreen on click events */
    stickyFullscreen: boolean;
    /** Desired tick events per second */
    tickRate: number;
    /** Upper limit for render events per second - `0` means uncapped */
    maxRenderRate: number;
    /** Max time spent issuing tick events when behind schedule. If the shell spends this long on tick events, it will discard all pending ticks to catch up. */
    maxTickTime: number;
    /** Check or set whether the DOM element has pointerlock */
    pointerLock: boolean;
    /** Check or set whether the DOM element has fullscreen */
    fullscreen: boolean;
    /**
     * Tick event handler.
     * @param {number} dt: tick duration (ms) - this is a fixed value based on the tick rate, not the observed time elapsed
     */
    onTick: (dt: number) => void;
    /**
     * Render event handler.
     * @param {number} dt: elapsed time (ms) since previous render event
     * @param {number} framePart: fraction (0..1) corresponding to how much of the current tick has elapsed
     * @param {number} tickDur: tick duration (ms)
     */
    onRender: (dt: number, framePart: number, tickDur: number) => void;
    /** This event fires once after shell initializes. */
    onInit: () => void;
    /** This event fires when the domElement's window resizes */
    onResize: () => void;
    /** This event fires when pointerlock is gained or lost */
    onPointerLockChanged: (hasPL?: boolean) => void;
    /** This event fires when fullscreen is gained or lost */
    onFullscreenChanged: (hasFS?: boolean) => void;
    /** This event fires when a pointerLock error occurs */
    onPointerLockError: (err: any) => void;
    _data: Data;
}
declare function Data(pollTime?: number): void;
declare class Data {
    constructor(pollTime?: number);
    nowObject: DateConstructor | Performance;
    pollTime: number;
    renderAccum: number;
    lastTickStarted: number;
    lastFrameStarted: number;
    lastRenderStarted: number;
    avgTickTime: number;
    frameCB: any;
    intervalCB: any;
    intervalID: number;
}
export {};
