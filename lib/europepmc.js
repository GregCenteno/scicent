import { CATEGORY_QUERIES } from "./categories";

const BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

/**
 * Pulls recent results for one discipline from the Europe PMC REST API.
 * This runs server-side only (the refresh route / a cron job) — Europe PMC
 * does not send CORS headers, so this call would fail if it were ever made
 * from a browser. Server-to-server, CORS does not apply.
 *
 * Hace DOS búsquedas y las combina: una general (todos los idiomas) y una
 * específica en español (LANG:spa), para asegurar que siempre haya
 * literatura en español disponible aunque sea minoría en la fuente. La app
 * ya prioriza isSpanish=true al mostrar el feed (ver /api/articles), esto
 * solo asegura que haya de dónde elegir.
 */
export async function fetchCategoryArticles(categoryKey, { pageSize = 40, spanishPageSize = 20 } = {}) {
  const query = CATEGORY_QUERIES[categoryKey];
  if (!query) throw new Error(`Unknown category "${categoryKey}"`);

  const [general, spanish] = await Promise.all([
    search(query, pageSize),
    search(`${query} AND (LANG:spa)`, spanishPageSize),
  ]);

  const bySourceId = new Map();
  for (const r of [...spanish, ...general]) {
    // El orden [...spanish, ...general] hace que, si el mismo artículo
    // aparece en ambas búsquedas, se quede la versión ya vista primero —
    // en la práctica da igual, normalize() da el mismo resultado.
    const norm = normalize(r, categoryKey);
    if (!bySourceId.has(norm.sourceId)) bySourceId.set(norm.sourceId, norm);
  }
  return Array.from(bySourceId.values());
}

// Europe PMC a veces responde 503 (sobrecargado) sin que sea un error real
// de la app — unos reintentos cortos resuelven la mayoría de estos casos
// sin que la persona que dispara el refresh tenga que volver a intentarlo.
async function search(query, pageSize, attempt = 1) {
  const params = new URLSearchParams({
    query: `${query} AND (HAS_ABSTRACT:y)`,
    format: "json",
    resultType: "core",
    sort: "P_PDATE_D desc",
    pageSize: String(pageSize),
  });

  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { "User-Agent": "scicent-saas (health-literature-feed)" },
  });

  if (!res.ok) {
    if (res.status >= 500 && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 800));
      return search(query, pageSize, attempt + 1);
    }
    throw new Error(`Europe PMC request failed (pageSize ${pageSize}): ${res.status}`);
  }

  const data = await res.json();
  return data?.resultList?.result ?? [];
}

function normalize(result, categoryKey) {
  const sourceId = `${result.source}:${result.id}`;
  const url = result.doi
    ? `https://doi.org/${result.doi}`
    : `https://europepmc.org/article/${result.source}/${result.id}`;

  const abstract = (result.abstractText || "").replace(/<[^>]+>/g, "").trim();
  const hook = buildHook(abstract, result.title);
  const language = result.language || null;

  return {
    sourceId,
    category: categoryKey,
    title: cleanTitle(result.title),
    hook,
    abstract: abstract || null,
    journal: result.journalInfo?.journal?.title || result.journalTitle || null,
    authors: result.authorString || null,
    language,
    isSpanish: language === "spa",
    isOpenAccess: result.isOpenAccess === "Y",
    publishedAt: parseDate(result.firstPublicationDate) || parseDate(String(result.pubYear)),
    url,
  };
}

function cleanTitle(title) {
  return (title || "Sin título").replace(/<[^>]+>/g, "").replace(/\.$/, "").trim();
}

// The feed shows a short "hook" instead of the full abstract; fall back to
// the title if the abstract is too short to make a useful excerpt.
function buildHook(abstract, title) {
  if (abstract && abstract.length > 40) {
    const cut = abstract.slice(0, 220);
    return cut.length < abstract.length ? cut.replace(/\s+\S*$/, "") + "…" : cut;
  }
  return title || "";
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
