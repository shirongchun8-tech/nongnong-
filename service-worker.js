const CACHE_NAME = "language-word-studio-multilingual-comparison-v3";

const OFFLINE_ASSETS = [
  "./",
  "./index.html?v=multilingual-comparison",
  "./languages.html?v=multilingual-comparison",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css?v=multilingual-comparison",
  "./src/languages.css?v=multilingual-comparison",
  "./src/main.js?v=multilingual-comparison",
  "./src/languages.js?v=multilingual-comparison",
  "./src/languageData.js?v=multilingual-comparison",
  "./src/languageStorage.js?v=multilingual-comparison",
  "./src/languageSpeech.js?v=multilingual-comparison",
  "./src/storage.js?v=multilingual-comparison",
  "./src/speech.js?v=multilingual-comparison",
  "./src/data/courseData.js?v=multilingual-comparison",
  "./src/data/word1368Data.js?v=multilingual-comparison",
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
    event.respondWith(fetch(event.request).catch(() => caches.match("./languages.html?v=multilingual-comparison")));
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
          if (event.request.mode === "navigate") return caches.match("./languages.html?v=multilingual-comparison");
          return undefined;
        });
    }),
  );
});
