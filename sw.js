// Street-Ride service worker · by Natange
const V='sr-3.0';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET') return;
  const own=u.origin===location.origin, lib=u.hostname==='unpkg.com';
  if(!own && !lib) return;               // maps, photos, routing: always live
  if(own){                                // app files: network first, cache fallback
    e.respondWith(fetch(r).then(x=>{ const y=x.clone(); caches.open(V).then(c=>c.put(r,y)); return x; }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  } else {                                // libraries: cache first
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{ if(x.ok){ const y=x.clone(); caches.open(V).then(c=>c.put(r,y)); } return x; })));
  }
});
