// Netlify Scheduled Function — sustituye al cron de Vercel (vercel.json,
// que Netlify simplemente ignora). El horario vive en netlify.toml
// ([functions."refresh-articles"].schedule), no aquí.
//
// No duplica la lógica de ingestión: llama a la misma ruta protegida por
// CRON_SECRET que ya existe en app/api/articles/refresh/route.js, igual que
// harías a mano con curl (ver README).
exports.handler = async () => {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;

  if (!base) {
    console.error("No se encontró la URL del sitio (process.env.URL).");
    return { statusCode: 500, body: "Falta process.env.URL" };
  }
  if (!process.env.CRON_SECRET) {
    console.error("Falta la variable de entorno CRON_SECRET.");
    return { statusCode: 500, body: "Falta CRON_SECRET" };
  }

  const res = await fetch(`${base}/api/articles/refresh`, {
    method: "POST",
    headers: { "x-cron-secret": process.env.CRON_SECRET },
  });
  const body = await res.text();

  if (!res.ok) {
    console.error("Refresh del feed falló:", res.status, body);
  }

  return { statusCode: res.status, body };
};
