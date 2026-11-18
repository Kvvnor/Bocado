/* Bocado: con internet carga siempre la versión más reciente; sin internet usa la copia guardada. */
const VERSION = "bocado-v21";
const FONTS = "bocado-fonts";
const CORE = ["./", "./index.html", "./app.js", "./zxing.min.js", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(CORE.map(u => fetch(new Request(u, { cache: "reload" })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); }
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("openfoodfacts.org") || url.hostname.endsWith("googleapis.com") && url.hostname !== "fonts.googleapis.com") return;
  if (url.origin === self.location.origin) {
    // Red primero (sin caché HTTP), con respaldo guardado si no hay conexión
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      try {
        const r = await withTimeout(fetch(req, { cache: "no-cache" }), 6000);
        if (r.ok) c.put(req, r.clone());
        return r;
      } catch (err) {
        return (await c.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? await c.match("./index.html") : Response.error());
      }
    })());
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === "opaque") c.put(req, r.clone());
      return r;
    }));
  }
});
