/* Modo Zona — service worker.
   O app não depende de rede para funcionar: todo o som é sintetizado.
   A única coisa externa são as fontes do Google, que ficam em cache
   depois da primeira visita (e têm fallback de sistema se faltarem). */

const VERSION = 'zona-v1';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== RUNTIME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navegação: rede primeiro (para pegar uma versão nova), casca em cache se offline.
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(SHELL).then(c => c.put('./index.html', clone));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Fontes: serve do cache e revalida em segundo plano.
  if(FONT_HOSTS.includes(url.hostname)){
    event.respondWith(
      caches.open(RUNTIME).then(cache =>
        cache.match(req).then(hit => {
          const net = fetch(req)
            .then(res => { cache.put(req, res.clone()); return res; })
            .catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  // Resto do mesmo domínio: cache primeiro.
  if(url.origin === self.location.origin){
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if(res.ok){
          const clone = res.clone();
          caches.open(SHELL).then(c => c.put(req, clone));
        }
        return res;
      }))
    );
  }
});
