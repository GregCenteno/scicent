# Scicent — backend desplegable

Versión "de verdad" del prototipo: cuentas con correo y contraseña, base de
datos propia, y un feed que se **actualiza solo** jalando literatura real de
[Europe PMC](https://europepmc.org/) (PubMed/MEDLINE + preprints), filtrada a
siete disciplinas de salud: enfermería, medicina, farmacia, nutrición,
rehabilitación, odontología y laboratorio clínico. También incluye un grafo
social real (seguir cuentas, repostear artículos, ver lo que repostean las
cuentas que sigues).

## Por qué esto es un proyecto aparte del artifact

El prototipo interactivo vive en un *artifact* de Claude: una página estática
sin servidor propio. Eso es perfecto para explorar la idea, pero tiene un
techo real:

- No puede llamar APIs externas en vivo (política de seguridad de la
  plataforma) — por eso ahí los artículos son un dataset curado, no un feed
  que se refresca.
- No puede guardar contraseñas de forma segura — no existe ahí un lugar para
  hacer hash con bcrypt ni para emitir sesiones firmadas.

Este proyecto sí puede hacer ambas cosas porque corre como una app normal:
servidor propio, base de datos propia, y un cron que se ejecuta donde tú lo
despliegues.

## Qué incluye

- **Cuentas reales**: registro con nombre/correo/contraseña (`bcryptjs`,
  hash con salt), sesión con `next-auth` (JWT, sin contraseñas en el
  cliente).
- **Feed que se refresca solo — sin el tope de 23 artículos del demo**:
  `app/api/articles/refresh/route.js` llama a Europe PMC por cada disciplina
  (`lib/categories.js` define las 7 consultas) y guarda los artículos nuevos
  en Postgres; cada corrida trae hasta 15 por disciplina (`pageSize: 15` en
  ese archivo — súbelo si quieres un catálogo inicial más grande) y los que
  ya existen simplemente se actualizan, así que la tabla `Article` crece sin
  límite fijo con cada ejecución del cron. `vercel.json` lo programa cada 6
  horas si despliegas en Vercel; en cualquier otro proveedor, apunta tu
  propio cron (GitHub Actions, un `node-cron`, lo que uses) a esa misma
  ruta.
- **Fondos generativos por temática**: `lib/thematicBackground.js` dibuja un
  SVG distinto por disciplina (paleta y motivo propios: pulso para
  enfermería, cápsulas para farmacia, hojas para nutrición, arcos de
  movimiento para rehabilitación, células para medicina) — determinístico por
  artículo, así que nunca hay fondo negro ni depende de un servicio de
  imágenes externo.
- **Me gusta / guardar** persistentes por usuario (`Interaction` en Prisma),
  con un feed filtrable por disciplina y una vista de guardados.
- **Seguir cuentas y repostear** (`Follow` y `Repost` en Prisma): cualquier
  usuario puede repostear un artículo a su perfil (con o sin comentario) y
  seguir a otros usuarios; `/community` muestra a quién puedes seguir y el
  feed de reposts de las cuentas que ya sigues (`/api/feed/following`). Es
  la respuesta en código a "¿es posible seguir a otros usuarios y ver lo que
  repostean?" — sí, y ya está implementado end-to-end (esquema + API +
  pantalla), no es solo una maqueta visual.
- **Nombre de usuario único**: el registro pide `username` además de nombre y
  correo (`app/api/auth/register/route.js` valida formato y unicidad, y el
  `@unique` de Prisma es el guardarraíl real contra condiciones de carrera).
  Se usa como `@handle` en `/community` y en el directorio de `/api/users`.
- **Mostrar/ocultar contraseña** en registro e inicio de sesión.
- **Límite de intentos en `/api/auth/*`** (`lib/rateLimit.js`): bloquea
  ráfagas de registro/login por IP (y por correo, en login) para frenar
  scripts de fuerza bruta. Es una implementación simple en memoria — lee el
  comentario del archivo, porque en serverless con múltiples instancias el
  límite real es "por instancia tibia", no un tope global; para eso necesitas
  un backend compartido como Redis (Upstash es la opción típica en Vercel).
- **`/terms` y `/privacy`**: páginas de plantilla, enlazadas desde el
  registro con una casilla de aceptación obligatoria. Son un punto de
  partida, no un documento legal terminado — tienen un aviso visible arriba
  y corchetes `[ASÍ]` marcando lo que falta completar (razón social, correo
  de contacto, jurisdicción) antes de lanzarlas de verdad.

## Lo que NO incluye todavía

Esto es un cimiento sólido y cada vez más cercano a lanzamiento, pero no un
producto terminado. Antes de cobrarle a usuarios reales, todavía te
faltaría: verificación de correo, recuperación de contraseña ("olvidé mi
contraseña"), un rate limiter compartido entre instancias si despliegas a
escala (ver nota de `lib/rateLimit.js` arriba), monitoreo/alertas del cron,
moderación de contenido en los comentarios de repost, que un abogado revise
`/terms` y `/privacy`, y probablemente paginación/caché más agresiva si el
feed crece mucho. Nada de eso es difícil, pero es trabajo real y vale la
pena priorizarlo según qué tan pública vaya a ser el lanzamiento.

## Cómo correrlo

1. **Base de datos.** Crea una Postgres gratis en
   [Neon](https://neon.tech) o [Supabase](https://supabase.com) y copia su
   cadena de conexión.
2. **Variables de entorno.**
   ```bash
   cp .env.example .env
   # pega DATABASE_URL
   # genera NEXTAUTH_SECRET: openssl rand -base64 32
   # genera CRON_SECRET:    openssl rand -hex 24
   ```
3. **Instalar y migrar.**
   ```bash
   npm install
   npm run db:migrate   # crea las tablas
   ```
4. **(Opcional) primer llenado del feed**, antes de tener el cron corriendo:
   ```bash
   npm run refresh:local
   ```
5. **Desarrollo local.**
   ```bash
   npm run dev
   # http://localhost:3000 → te manda a /register
   ```

## Desplegar a producción (Vercel + Neon/Supabase)

1. Sube este proyecto a un repo de GitHub y conéctalo en
   [vercel.com/new](https://vercel.com/new).
2. En **Project Settings → Environment Variables** agrega `DATABASE_URL`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (tu dominio de Vercel) y `CRON_SECRET`.
3. `vercel.json` ya declara el cron (`/api/articles/refresh` cada 6 horas).
   Vercel firma esa llamada automáticamente con
   `Authorization: Bearer $CRON_SECRET` cuando la variable se llama
   exactamente `CRON_SECRET` — no hay que hacer nada más.
4. Primer deploy → entra a `/register`, crea tu cuenta, y dispara el primer
   refresco a mano mientras esperas el cron:
   ```bash
   curl -X POST https://tu-dominio.vercel.app/api/articles/refresh \
     -H "x-cron-secret: TU_CRON_SECRET"
   ```

Si prefieres otro hosting (Render, Railway, un VPS), todo aquí es Next.js
estándar (`npm run build && npm run start`); solo reemplaza el cron de Vercel
por el programador que uses en esa plataforma, apuntando a la misma ruta.

## Desplegar a producción (Netlify + Neon/Supabase)

El proyecto ya trae `netlify.toml` y el plugin oficial de Next.js
(`@netlify/plugin-nextjs`), así que no hay que tocar nada de la app: App
Router, API routes y `middleware.js` funcionan igual que en Vercel. La única
diferencia real es el cron — Netlify ignora `vercel.json`, así que ese mismo
refresco cada 6 horas se dispara con una **Netlify Scheduled Function**
(`netlify/functions/refresh-articles.js`, programada en `netlify.toml`), que
simplemente llama a `/api/articles/refresh` con el `CRON_SECRET`, igual que
harías a mano con `curl`.

1. **Base de datos.** Igual que con Vercel: Postgres gratis en
   [Neon](https://neon.tech) o [Supabase](https://supabase.com), copia su
   cadena de conexión. Netlify no da base de datos propia.

2. **Sube el proyecto a GitHub** (o GitLab/Bitbucket) si aún no está en un
   repo:
   ```bash
   cd scrollience-saas
   git init
   git add .
   git commit -m "Scicent — listo para Netlify"
   git remote add origin TU_REPO_GIT
   git push -u origin main
   ```

3. **Conecta el repo en Netlify.**
   - Entra a [app.netlify.com](https://app.netlify.com) → **Add new site →
     Import an existing project** → elige tu repo.
   - Netlify detecta `netlify.toml` solo (build command y plugin ya están
     declarados ahí) — no cambies nada en el asistente.

4. **Variables de entorno.** En **Site configuration → Environment
   variables**, agrega las mismas cuatro que en local:
   - `DATABASE_URL` — la cadena de Neon/Supabase.
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — la URL que te da Netlify, p. ej.
     `https://scicent.netlify.app` (o tu dominio propio una vez lo
     conectes).
   - `CRON_SECRET` — `openssl rand -hex 24`. Es el mismo valor que usa la
     Scheduled Function para autorizarse, así que con ponerlo aquí basta
     (no hay que configurarlo aparte).

5. **Primer deploy.** Netlify corre `npm run build` (que ya incluye
   `prisma generate` vía `postinstall`), pero las tablas no se crean solas:
   corre la migración una vez contra tu base de datos de producción desde tu
   máquina, apuntando `DATABASE_URL` a la cadena de Neon/Supabase:
   ```bash
   DATABASE_URL="tu-cadena-de-produccion" npx prisma migrate deploy
   ```

6. **Primer llenado del feed**, mientras esperas la primera corrida
   programada de la Scheduled Function:
   ```bash
   curl -X POST https://tu-sitio.netlify.app/api/articles/refresh \
     -H "x-cron-secret: TU_CRON_SECRET"
   ```

7. Entra a `https://tu-sitio.netlify.app/register`, crea tu cuenta y ya
   está en vivo.

**Nota sobre el cron:** las Scheduled Functions de Netlify están pensadas
para trabajos cortos — en el plan gratuito el límite típico de ejecución es
de unos 10 segundos (26s en planes de pago), y `refresh-articles` puede
tardar más si Europe PMC responde lento en alguna de las 7 disciplinas. Si
ves timeouts en **Netlify → Functions → refresh-articles → Logs**, la
alternativa más simple es no usar la Scheduled Function y en su lugar
apuntar un cron externo gratuito (por ejemplo
[cron-job.org](https://cron-job.org)) directo a
`POST https://tu-sitio.netlify.app/api/articles/refresh` con el header
`x-cron-secret: TU_CRON_SECRET` — mismo efecto, sin el límite de tiempo de
las funciones.

## Estructura

```
app/
  api/auth/[...nextauth]/route.js   sesión (next-auth, credentials + JWT)
  api/auth/register/route.js        alta de usuario (bcrypt, username único, rate limit)
  api/articles/route.js             GET feed (filtros, cursor, requiere sesión)
  api/articles/refresh/route.js     ingestión desde Europe PMC (protegida por CRON_SECRET)
  api/interactions/route.js         like/save por usuario
  api/reposts/route.js              repostear/quitar repost
  api/follows/route.js              seguir/dejar de seguir
  api/feed/following/route.js       reposts de las cuentas que sigues
  api/users/route.js                directorio simple para "a quién seguir"
  login/, register/, feed/, community/   páginas
  terms/, privacy/                  plantillas — revisar con un abogado antes de lanzar
components/
  ReelFeed.jsx        contenedor del feed: scroll, filtros, infinite scroll
  ArticleCard.jsx      una tarjeta: doble-tap, rail de acciones, fuente
  ThematicBackground.jsx  fondo generativo por disciplina
  CommunityPanel.jsx   a quién seguir + feed de reposts de tus seguidos
lib/
  categories.js        las 7 disciplinas + sus consultas de Europe PMC + paletas
  europepmc.js          fetch + normalización de resultados
  thematicBackground.js SVG generativo determinístico
  rateLimit.js          límite de intentos en memoria para /api/auth/*
  auth.js, prisma.js
prisma/schema.prisma    User (con username único), Article, Interaction, Follow, Repost
scripts/refreshLocal.js  correr la ingestión sin HTTP, para el primer llenado
netlify.toml             build + plugin de Next.js + horario del cron (Netlify)
netlify/functions/refresh-articles.js   Scheduled Function — dispara el refresh en Netlify
vercel.json              cron equivalente, solo si despliegas en Vercel
```
