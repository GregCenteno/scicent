// Service worker mínimo. Su único propósito es que el navegador (sobre
// todo Chrome/Android) considere la app "instalable" — ese criterio exige
// un service worker con un listener de "fetch" registrado. A propósito NO
// cachea nada: el feed y el resto de la app dependen de datos frescos de
// la base de datos, así que cachear agresivamente serviría contenido
// desactualizado. Todas las peticiones simplemente pasan a la red tal cual.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
