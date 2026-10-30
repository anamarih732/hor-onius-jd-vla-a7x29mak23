const CACHE_NAME = "meu-app-v10";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./CSS/style.css",
  "./JS/proximo.js",
  "./img/bus.png",
  "./img/icone-app.png",
  "./HTML/549.html",
  "./HTML/607.html",
  "./HTML/614.html",
  "./HTML/626.html",
  "./HTML/646.html",
  "./HTML/701.html",
  "./HTML/702.html",
  "./HTML/709.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(
        chaves
          .filter((chave) => chave !== CACHE_NAME)
          .map((chave) => caches.delete(chave))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requisicao = event.request;
  const url = new URL(requisicao.url);

  if (
    requisicao.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    caches.match(requisicao).then(async (arquivoSalvo) => {
      if (arquivoSalvo) {
        return arquivoSalvo;
      }

      try {
        return await fetch(requisicao);
      } catch {
        if (requisicao.mode === "navigate") {
          return await caches.match("./index.html")
            || Response.error();
        }

        return Response.error();
      }
    })
  );
});