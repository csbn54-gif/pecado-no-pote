const CACHE = "pecado-no-pote-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-512.png"
];


self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())

  );

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))

      )

    ).then(() => self.clients.claim())

  );

});


self.addEventListener("fetch", event => {

  if(event.request.method !== "GET")
    return;


  /*
    Para HTML, tenta buscar a versão nova primeiro.
    Isso evita que o GitHub Pages fique preso
    mostrando uma versão antiga do cardápio.
  */

  if(
    event.request.mode === "navigate" ||
    event.request.destination === "document"
  ){

    event.respondWith(

      fetch(event.request)
        .then(response => {

          const copy=response.clone();

          caches
            .open(CACHE)
            .then(cache => cache.put(event.request,copy));

          return response;

        })
        .catch(() =>
          caches.match("./index.html")
        )

    );

    return;

  }


  event.respondWith(

    caches.match(event.request)
      .then(cached =>

        cached ||
        fetch(event.request)

      )

  );

});
