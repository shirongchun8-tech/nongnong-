const CACHE_NAME = "language-word-studio-visual-status-study-v3";

const OFFLINE_ASSETS = [
  "./",
  "./index.html?v=visual-status-study",
  "./languages.html?v=visual-status-study",
  "./languages-new.html?v=visual-status-study",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css?v=visual-status-study",
  "./src/languages.css?v=visual-status-study",
  "./src/main.js?v=visual-status-study",
  "./src/languages.js?v=visual-status-study",
  "./src/languageData.js?v=visual-status-study",
  "./src/languageStorage.js?v=visual-status-study",
  "./src/languageSpeech.js?v=visual-status-study",
  "./src/storage.js?v=visual-status-study",
  "./src/speech.js?v=visual-status-study",
  "./src/data/courseData.js?v=visual-status-study",
  "./src/data/word1368Data.js?v=visual-status-study",
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
    event.respondWith(fetch(event.request).catch(() => caches.match("./languages.html?v=visual-status-study")));
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
          if (event.request.mode === "navigate") return caches.match("./languages-new.html?v=visual-status-study");
          return undefined;
        });
    }),
  );
});
