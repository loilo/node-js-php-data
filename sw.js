if(!self.define){let e,s={};const r=(r,i)=>(r=new URL(r+".js",i).href,s[r]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=s,document.head.appendChild(e)}else e=r,importScripts(r),s()})).then((()=>{let e=s[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(i,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const l=e=>r(e,t),d={module:{uri:t},exports:o,require:l};s[t]=Promise.all(i.map((e=>d[e]||l(e)))).then((e=>(n(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/encoding-worker-BDiZsKg7.js",revision:null},{url:"assets/index-BurtUM9b.css",revision:null},{url:"assets/index-DFGHY7RH.js",revision:null},{url:"assets/transform-worker-Ymh42SEy.js",revision:null},{url:"index.html",revision:"2d01d153ffbcc9bd0165adffcefdb538"},{url:"registerSW.js",revision:"ba8410adf2265b578fcbd8dbaf1b3230"},{url:"manifest.webmanifest",revision:"5787061c4090d631708b8074e4549663"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
