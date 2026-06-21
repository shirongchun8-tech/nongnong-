const CACHE_NAME = "language-word-studio-daily-plan-study-v3";

const OFFLINE_ASSETS = [
  "./",
  "./index.html?v=daily-plan-study",
  "./languages.html?v=daily-plan-study",
  "./languages-new.html?v=daily-plan-study",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css?v=daily-plan-study",
  "./src/languages.css?v=daily-plan-study",
  "./src/main.js?v=daily-plan-study",
  "./src/languages.js?v=daily-plan-study",
  "./src/languageData.js?v=daily-plan-study",
  "./src/languageStorage.js?v=daily-plan-study",
  "./src/languageSpeech.js?v=daily-plan-study",
  "./src/storage.js?v=daily-plan-study",
  "./src/speech.js?v=daily-plan-study",
  "./src/data/courseData.js?v=daily-plan-study",
  "./src/data/word1368Data.js?v=daily-plan-study",
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
    event.respondWith(fetch(event.request).catch(() => caches.match("./languages.html?v=daily-plan-study")));
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
          if (event.request.mode === "navigate") return caches.match("./languages-new.html?v=daily-plan-study");
          return undefined;
        });
    }),
  );
});
