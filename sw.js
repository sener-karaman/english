const C='eng-68d983cb';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:'reload'}).then(r=>{if(r.ok)return c.put(f,r);}).catch(()=>{})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const isPage=req.mode==='navigate'||/\/(index\.html)?(\?.*)?$/.test(new URL(req.url).pathname);
  if(isPage){
    // Network first: the newest version whenever there is internet, the saved copy in the metro
    e.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('index.html',cp));return res;})
      .catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(req,cp));return res;})));
});
