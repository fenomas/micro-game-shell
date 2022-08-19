export class MicroGameShell {
    constructor(domElement?: any, pollTime?: number, skipFramesAfter?: number);
    stickyPointerLock: boolean;
    stickyFullscreen: boolean;
    tickRate: number;
    maxRenderRate: number;
    pointerLock: boolean;
    fullscreen: boolean;
    onTick: (dt: any) => void;
    onRender: () => void;
    onInit: () => void;
    onResize: () => void;
    onPointerLockChanged: (hasPL: any) => void;
    onFullscreenChanged: (hasFS: any) => void;
    onPointerLockError: (err: any) => void;
}
