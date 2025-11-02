// Versi cache - ubah setiap kali kamu update situs
const CACHE_NAME = "catatan-keuangan-v2";

// Daftar file yang mau disimpan offline
const urlsToCache = [
  "/Catatan-Keuangan-/",
  "/Catatan-Keuangan-/index.html",
  "/Catatan-Keuangan-/manifest.json",
  "/Catatan-Keuangan-/192x192.png",
  "/Catatan-Keuangan-/512x512.png"
];

// Install SW dan cache file awal
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate SW baru dan hapus cache lama
self.addEventListener("activate", event => {
  console.log("[SW] Activating new version...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler - offline fallback + auto update
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan ke cache versi terbaru
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Kalau offline, coba ambil dari cache
        return caches.match(event.request).then(response => {
          if (response) return response;
          // Fallback ke index.html untuk halaman utama
          if (event.request.mode === "navigate") {
            return caches.match("/Catatan-Keuangan-/index.html");
          }
        });
      })
  );
});

// Kirim notifikasi kecil kalau user offline
self.addEventListener("message", event => {
  if (event.data === "offline-notice") {
    self.registration.showNotification("Catatan Keuangan", {
      body: "Kamu sedang offline. Beberapa fitur mungkin tidak tersedia.",
      icon: "/Catatan-Keuangan-/192x192.png"
    });
  }
});
