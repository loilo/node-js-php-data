if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const l=e=>i(e,t),u={module:{uri:t},exports:o,require:l};s[t]=Promise.all(r.map((e=>u[e]||l(e)))).then((e=>(n(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/encoding-worker-TT-MkBly.js",revision:null},{url:"assets/index-1jTZ8lkB.js",revision:null},{url:"assets/index-8iPuM7TY.css",revision:null},{url:"assets/transform-worker-43fj1yiK.js",revision:null},{url:"index.html",revision:"522cc3a298356bb390cba68b1497f462"},{url:"registerSW.js",revision:"ba8410adf2265b578fcbd8dbaf1b3230"},{url:"manifest.webmanifest",revision:"5787061c4090d631708b8074e4549663"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
