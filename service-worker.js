const CACHE_NAME = "language-word-studio-natural-examples-v1-v3";

const OFFLINE_ASSETS = [
  "./",
  "./index.html?v=natural-examples-v1",
  "./languages.html?v=natural-examples-v1",
  "./languages-new.html?v=natural-examples-v1",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css?v=natural-examples-v1",
  "./src/languages.css?v=natural-examples-v1",
  "./src/main.js?v=natural-examples-v1",
  "./src/languages.js?v=natural-examples-v1",
  "./src/languageData.js?v=natural-examples-v1",
  "./src/languageStorage.js?v=natural-examples-v1",
  "./src/languageSpeech.js?v=natural-examples-v1",
  "./src/storage.js?v=natural-examples-v1",
  "./src/speech.js?v=natural-examples-v1",
  "./src/data/courseData.js?v=natural-examples-v1",
  "./src/data/word1368Data.js?v=natural-examples-v1",
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
    event.respondWith(fetch(event.request).catch(() => caches.match("./languages.html?v=natural-examples-v1")));
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
          if (event.request.mode === "navigate") return caches.match("./languages-new.html?v=natural-examples-v1");
          return undefined;
        });
    }),
  );
});
