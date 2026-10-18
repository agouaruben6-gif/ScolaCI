/* ScolACI — fonctionnement hors ligne.
   - Pages du site : réseau d'abord (les mises à jour arrivent dès qu'il y a internet), cache en secours.
   - Polices : cache d'abord.
   Fonctionne uniquement en https:// ou sur localhost. */
const V = 'scolaci-v1';
const FILES = ['./', 'index.html', 'login.html', 'admin-scolaci.html', 'prof-scolaci.html', 'eleve-scolaci.html', 'superadmin-scolaci.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const keep = (req, res) => { if (res && res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(req, c)); } return res; };

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => keep(r, res)).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('login.html'))));
  } else if (/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => keep(r, res)).catch(() => m)));
  }
});
