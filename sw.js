// Banc2Touche : fonctionnement hors connexion (version 2026-11-02-2)
const CACHE='banc2touche-2026-11-02-2';
const ASSETS=["./", "index.html", "manifest.webmanifest", "mehb-logo.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "barlow-400.woff2", "barlow-500.woff2", "barlow-600.woff2", "barlow-700.woff2", "barlow-condensed-600.woff2", "barlow-condensed-700.woff2", "barlow-condensed-800.woff2", "barlow-condensed-700-italic.woff2", "barlow-condensed-800-italic.woff2"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;if(res)return res;
    if(r.mode==='navigate'){const idx=await c.match('index.html');if(idx)return idx}
    return new Response('Hors connexion',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
