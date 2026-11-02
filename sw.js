// Banc2Touche : hors connexion et mises à jour (version 2026-11-02-3)
const CACHE='banc2touche-2026-11-02-3';
const ASSETS=["./", "index.html", "manifest.webmanifest", "mehb-logo.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "barlow-400.woff2", "barlow-500.woff2", "barlow-600.woff2", "barlow-700.woff2", "barlow-condensed-600.woff2", "barlow-condensed-700.woff2", "barlow-condensed-800.woff2", "barlow-condensed-700-italic.woff2", "barlow-condensed-800-italic.woff2"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const offline=()=>new Response('Hors connexion',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==self.location.origin)return;
  const page=r.mode==='navigate'||u.pathname.endsWith('/index.html');
  e.respondWith(caches.open(CACHE).then(async c=>{
    if(page){
      // La page : la dernière version en ligne d'abord (4 s max), sinon celle gardée en mémoire
      try{
        const res=await Promise.race([fetch(r,{cache:'no-cache'}),new Promise((_,no)=>setTimeout(()=>no(new Error('lent')),4000))]);
        if(res&&res.ok){c.put('index.html',res.clone());return res}
      }catch(err){}
      return (await c.match('index.html'))||(await c.match('./'))||offline();
    }
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||offline();
  }));
});
