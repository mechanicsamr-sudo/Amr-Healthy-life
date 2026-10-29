/* Service Worker - يتم توليده تلقائيًا من scripts/sw-template.js عند البناء */
const VERSION = "__VERSION__";
const CACHE = "gym-app-" + VERSION;
const PRECACHE = __PRECACHE__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })))),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("gym-app-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function pageKey(url) {
  let p = url.pathname;
  if (!p.endsWith("/") && !p.split("/").pop().includes(".")) p += "/";
  return p;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // الروابط الخارجية (البحث والصور) تعمل فقط مع الاتصال

  if (req.mode === "navigate") {
    // الشبكة أولًا للصفحات حتى تظهر التحديثات، ثم النسخة المخزنة دون اتصال
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(pageKey(url), copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(pageKey(url), { ignoreSearch: true })) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // باقي الملفات (JS/CSS/الخطوط/بيانات RSC): من التخزين أولًا
  event.respondWith(
    caches.match(req, { ignoreSearch: url.pathname.endsWith(".txt") }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
