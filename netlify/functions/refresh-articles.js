// Netlify Scheduled Function — sustituye al cron de Vercel (vercel.json,
// que Netlify simplemente ignora). El horario vive en netlify.toml
// ([functions."refresh-articles"].schedule), no aquí.
//
// No duplica la lógica de ingestión: llama a la misma ruta protegida por
// CRON_SECRET que ya existe en app/api/articles/refresh/route.js — pero
// UNA VEZ POR CATEGORÍA en vez de una sola llamada gigante, para que cada
// llamada individual sea rápida y no se acerque al límite de tiempo de
// una función serverless.
const CATEGORY_KEYS = [
  "ENFERMERIA",
  "MEDICINA",
  "FARMACIA",
  "NUTRICION",
  "REHABILITACION",
  "ODONTOLOGIA",
  "LABORATORIO_CLINICO",
];

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

  const results = {};
  let anyFailed = false;

  for (const category of CATEGORY_KEYS) {
    try {
      const res = await fetch(`${base}/api/articles/refresh?category=${category}`, {
        method: "POST",
        headers: { "x-cron-secret": process.env.CRON_SECRET },
      });
      const body = await res.json().catch(() => ({}));
      results[category] = body;
      if (!res.ok) {
        anyFailed = true;
        console.error(`Refresh de ${category} falló:`, res.status, body);
      }
    } catch (err) {
      anyFailed = true;
      results[category] = { error: String(err?.message || err) };
      console.error(`Refresh de ${category} lanzó un error:`, err);
    }
  }

  return { statusCode: anyFailed ? 207 : 200, body: JSON.stringify(results) };
};
