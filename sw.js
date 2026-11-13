// Banc2Touche : hors connexion et mises à jour (version 2026-11-13-2)
const CACHE='banc2touche-2026-11-13-2';
const ASSETS=["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "jspdf.umd.min.js", "archivo.woff2"];
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
