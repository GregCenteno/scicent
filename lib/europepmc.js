import { CATEGORY_QUERIES } from "./categories";

const BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

/**
 * Pulls recent results for one discipline from the Europe PMC REST API.
 * This runs server-side only (the refresh route / a cron job) — Europe PMC
 * does not send CORS headers, so this call would fail if it were ever made
 * from a browser. Server-to-server, CORS does not apply.
 */
export async function fetchCategoryArticles(categoryKey, { pageSize = 15 } = {}) {
  const query = CATEGORY_QUERIES[categoryKey];
  if (!query) throw new Error(`Unknown category "${categoryKey}"`);

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
    throw new Error(`Europe PMC request failed for ${categoryKey}: ${res.status}`);
  }

  const data = await res.json();
  const results = data?.resultList?.result ?? [];
  return results.map((r) => normalize(r, categoryKey));
}

function normalize(result, categoryKey) {
  const sourceId = `${result.source}:${result.id}`;
  const url = result.doi
    ? `https://doi.org/${result.doi}`
    : `https://europepmc.org/article/${result.source}/${result.id}`;

  const abstract = (result.abstractText || "").replace(/<[^>]+>/g, "").trim();
  const hook = buildHook(abstract, result.title);

  return {
    sourceId,
    category: categoryKey,
    title: cleanTitle(result.title),
    hook,
    abstract: abstract || null,
    journal: result.journalInfo?.journal?.title || result.journalTitle || null,
    authors: result.authorString || null,
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
