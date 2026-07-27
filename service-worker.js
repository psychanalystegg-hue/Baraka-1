// نظام البركة — Service Worker
// ⚠️ عند تحديث index.html، غيّر الرقم بالأسفل (مثلاً v2 → v3)
// حتى يجبر التطبيق المستخدمين على تحميل النسخة الجديدة بدل النسخة المخزنة مسبقاً.
var CACHE_NAME = "baraka-cache-v1";
var FILES_TO_CACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية: الشبكة أولاً (لتحديث تلقائي إن توفر إنترنت) ثم التخزين المؤقت (للعمل بدون إنترنت)
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match("./index.html");
        });
      })
  );
});
