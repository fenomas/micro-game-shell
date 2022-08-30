(()=>{"use strict";function e(e){for(var n=e._nowObject.now(),t=n+e._skipFramesAfter,r=1e3/e.tickRate;e._lastTick+r<n;)if(e.onTick(r),e._lastTick+=r,(n=e._nowObject.now())>t)return void(e._lastTick=n)}function n(n){requestAnimationFrame(n._frameCB),e(n);var t=n._nowObject.now(),r=t-n._lastRender;if(n._lastRender=t,n.maxRenderRate>0){n._renderAccum+=r;var o=1e3/n.maxRenderRate;if(n._renderAccum<o)return;n._renderAccum=Math.min(n._renderAccum-o,o)}var c=1e3/n.tickRate,i=(t-n._lastTick)/c;n.onRender(r,i,c)}var t=document.querySelector.bind(document),r=t(".game"),o=new class{constructor(t=null,r=10,o=100){this.stickyPointerLock=!1,this.stickyFullscreen=!1,this.tickRate=30,this.maxRenderRate=0,this.pointerLock=!1,this.fullscreen=!1,this.onTick=function(e){},this.onRender=function(){},this.onInit=function(){},this.onResize=function(){},this.onPointerLockChanged=function(e){},this.onFullscreenChanged=function(e){},this.onPointerLockError=function(e){},(e=>{if("loading"===document.readyState){var n=()=>{document.removeEventListener("readystatechange",n),e()};document.addEventListener("readystatechange",n)}else setTimeout(e,1)})((()=>{!function(t,r,o){t._nowObject=performance||Date,t._skipFramesAfter=o,t._renderAccum=0;var c=t._nowObject.now();t._lastTick=c,t._lastRender=c,t._frameCB=n.bind(null,t),requestAnimationFrame(t._frameCB),r>0&&(t._intervalCB=e.bind(null,t),t._interval=setInterval(t._intervalCB,r))}(this,r,o),function(e,n){if(n){var t=!1,r=!1,o=e=>{if(!!e!=(t=n===document.pointerLockElement))if(e){var r=n.requestPointerLock();r&&r.catch&&r.catch((e=>{}))}else document.exitPointerLock()},c=e=>{!!e!=(r=n===document.fullscreenElement)&&(e?n.requestFullscreen?n.requestFullscreen():n.webkitRequestFullscreen&&n.webkitRequestFullscreen():document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen&&document.webkitExitFullscreen())};document.addEventListener("pointerlockchange",(r=>{t=n===document.pointerLockElement,e.onPointerLockChanged(t)})),document.addEventListener("fullscreenchange",(t=>{r=n===document.fullscreenElement,e.onFullscreenChanged(r)})),document.addEventListener("pointerlockerror",(r=>{t=n===document.pointerLockElement,e.onPointerLockError(r)})),Object.defineProperty(e,"pointerLock",{get:()=>t,set:o}),Object.defineProperty(e,"fullscreen",{get:()=>r,set:c}),n.addEventListener("click",(n=>{e.stickyPointerLock&&o(!0),e.stickyFullscreen&&c(!0)}));var i=()=>e.onResize();window.ResizeObserver?new ResizeObserver(i).observe(n):window.addEventListener("resize",i)}}(this,t),this.onInit()}))}}(r,15),c=0,i=0;function a(e,n){var r=t(e);r.oninput=e=>{var t=parseInt(e.target.value);n(isNaN(t)?e.target.checked:t)},setTimeout((()=>{var e=parseInt(r.value);n(isNaN(e)?r.checked:e)}),1)}a("#PL",(e=>{o.stickyPointerLock=e})),a("#FS",(e=>{o.stickyFullscreen=e})),a("#TR",(e=>{o.tickRate=e})),a("#MRR",(e=>{o.maxRenderRate=e})),a("#WTT",(e=>{c=e})),a("#WTR",(e=>{i=e})),t(".spike").onclick=function(){for(var e=performance.now()+500;performance.now()<e;);};var s=C(),l=1,u=0;o.onTick=e=>{if(k){var n=performance.now();console.log("  tick","dt",n-u,"dur",e),u=n}var r;(p+=600*(r=e)/1e3)>L&&(p-=L),(w+=50*r/1e3)>g&&(w-=g);var o=s();0==--l&&(t("#OTR").textContent=Math.round(o),l=f(o));for(var i=performance.now()+c;performance.now()<i;);};var d=C(),m=1;o.onRender=(e,n,r)=>{if(k){var o=n*r;console.log("render","dt",e,"part",n,"ms in:",o)}!function(e,n){var t=(p+e*(R*n/1e3))%L,r=w+e*(50*n/1e3);if(0===_)E(1),y(t,30,40,40);else if(1===_){E(b++%10==0?.15:.05);y(t,r,2,30),r>g-30&&y(t,r-g,2,30)}else{var o=t-F;o<-L/2&&(o+=L),F=t,E(.02),h.globalCompositeOperation="copy",h.drawImage(h.canvas,-o,0),h.globalCompositeOperation="source-over",y(L-15,10,1,g-20)}}(n,r);var c=d();0==--m&&(t("#OFR").textContent=Math.round(c),m=f(c));for(var a=performance.now()+i;performance.now()<a;);};var f=e=>Math.ceil(e/5);o.onPointerLockChanged=e=>{console.log(e?"Gained":"Lost","pointerLock")},o.onFullscreenChanged=e=>{console.log(e?"Gained":"Lost","fullScreen")},o.onPointerLockError=e=>{console.log("PointerLock error:",e)};var k=!1;document.addEventListener("keydown",(e=>{"p"===e.key&&(k=!k)}));var v=t(".output"),h=v.getContext("2d"),p=0,R=600,w=0,L=v.width,g=v.height,_=0;v.onclick=()=>{_=(_+1)%3};var b=0,F=0,E=e=>{h.fillStyle=`rgba(255,255,255, ${e})`,h.fillRect(0,0,L,g)},y=(e,n,t,r)=>{h.fillStyle="red",h.fillRect(e,n,t,r)};function C(){var e=0,n=10;return()=>{var t=performance.now(),r=t-e;return e=t,1e3/(n=.95*n+r*(1-.95))}}})();