/* Service worker de Torneos Tenis: deja abrir la app sin conexión.
   - Páginas: primero la red (así siempre ves la versión nueva) y, si no hay internet o tarda, la última guardada.
   - Íconos, manifest y tipografías: se guardan y se actualizan solos.
   - Firebase/Firestore NO se toca: los datos se siguen sincronizando por su cuenta.
   Cuando cambies este archivo, subí el número de VERSION para limpiar lo guardado. */
const VERSION = "v1";
const CACHE = "torneos-" + VERSION;
const PRECACHE = ["./", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
const ESPERA_RED = 3500; // ms antes de mostrar la copia guardada si la red no contesta

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // uno por uno: si falta un archivo, los demás se guardan igual
    await Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k.startsWith("torneos-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Una respuesta con redirección no se puede usar para abrir una página: se copia limpia.
async function limpia(res){
  if(!res.redirected) return res;
  return new Response(await res.blob(), {status: res.status, statusText: res.statusText, headers: res.headers});
}

async function pagina(e){
  const url = new URL(e.request.url);
  const cache = await caches.open(CACHE);
  const clave = new Request(url.origin + url.pathname); // sin ?parámetros ni #: cualquier link abre la misma app
  const guardada = async () => (await cache.match(clave)) || (await cache.match("./")) || (await cache.match(url.origin + url.pathname + "index.html"));
  const red = fetch(e.request).then(async res => {
    if(res && res.ok) await cache.put(clave, await limpia(res.clone()));
    return res;
  });
  e.waitUntil(red.catch(() => {}));
  try{
    const res = await Promise.race([red, new Promise(ok => setTimeout(() => ok(null), ESPERA_RED))]);
    if(res) return res;
    return (await guardada()) || await red;
  }catch(err){
    return (await guardada()) || Response.error();
  }
}

async function siempreFresco(req, cors){
  const cache = await caches.open(CACHE);
  const vieja = await cache.match(req);
  const nueva = fetch(cors ? new Request(req.url, {mode: "cors", credentials: "omit"}) : req)
    .then(res => { if(res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  return vieja || (await nueva) || Response.error();
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(req.mode === "navigate"){ e.respondWith(pagina(e)); return; }
  if(url.origin === location.origin){ e.respondWith(siempreFresco(req, false)); return; }
  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){ e.respondWith(siempreFresco(req, true)); return; }
  // todo lo demás (Firebase, etc.) pasa directo a la red
});
