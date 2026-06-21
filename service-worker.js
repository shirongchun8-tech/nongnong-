const CACHE_NAME = "language-word-studio-group-memory-curve-v3";

const OFFLINE_ASSETS = [
  "./",
  "./index.html?v=group-memory-curve",
  "./languages.html?v=group-memory-curve",
  "./languages-new.html?v=group-memory-curve",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css?v=group-memory-curve",
  "./src/languages.css?v=group-memory-curve",
  "./src/main.js?v=group-memory-curve",
  "./src/languages.js?v=group-memory-curve",
  "./src/languageData.js?v=group-memory-curve",
  "./src/languageStorage.js?v=group-memory-curve",
  "./src/languageSpeech.js?v=group-memory-curve",
  "./src/storage.js?v=group-memory-curve",
  "./src/speech.js?v=group-memory-curve",
  "./src/data/courseData.js?v=group-memory-curve",
  "./src/data/word1368Data.js?v=group-memory-curve",
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
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./languages.html?v=group-memory-curve")));
    return;
  }
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
          if (event.request.mode === "navigate") return caches.match("./languages-new.html?v=group-memory-curve");
          return undefined;
        });
    }),
  );
});
