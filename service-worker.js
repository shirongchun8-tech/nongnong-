const CACHE_NAME = "language-word-studio-pwa-offline-v1";

const OFFLINE_ASSETS = [
  "./",
  "./index.html?v=pwa-offline",
  "./languages.html?v=pwa-offline",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css?v=pwa-offline",
  "./src/languages.css?v=pwa-offline",
  "./src/main.js?v=pwa-offline",
  "./src/languages.js?v=pwa-offline",
  "./src/languageData.js?v=pwa-offline",
  "./src/languageStorage.js?v=pwa-offline",
  "./src/languageSpeech.js?v=pwa-offline",
  "./src/storage.js?v=pwa-offline",
  "./src/speech.js?v=pwa-offline",
  "./src/data/courseData.js?v=pwa-offline",
  "./src/data/word1368Data.js?v=pwa-offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match("./languages.html?v=pwa-offline");
          return undefined;
        });
    }),
  );
});
