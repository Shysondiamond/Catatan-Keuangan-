// Nama cache dan daftar file yang ingin disimpan offline
const CACHE_NAME = "catatan-keuangan-v1";
const urlsToCache = [
  "/Catatan-Keuangan-/",
  "/Catatan-Keuangan-/index.html",
  "/Catatan-Keuangan-/manifest.json",
  "/Catatan-Keuangan-/icons/icon-192.png",
  "/Catatan-Keuangan-/icons/icon-512.png"
];

// Install Service Worker dan simpan file ke cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: caching files");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Aktifkan SW baru dan hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: deleting old cache", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Tangani fetch (ambil dari cache dulu, kalau gagal baru ke jaringan)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("/Catatan-Keuangan-/index.html")
        )
      );
    })
  );
});
