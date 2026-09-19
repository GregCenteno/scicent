import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCategoryArticles } from "@/lib/europepmc";
import { CATEGORIES } from "@/lib/categories";

export const maxDuration = 60; // seconds — Europe PMC is called 5x sequentially below

// Pulled by Vercel Cron (see vercel.json) or any external scheduler, on the
// interval you set there — this is what makes the feed "refresh itself"
// instead of the one-time curated list in the prototype. Not reachable from
// a browser tab: it requires the cron secret.
function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run wide open if misconfigured
  const auth = req.headers.get("authorization");
  const custom = req.headers.get("x-cron-secret");
  return auth === `Bearer ${secret}` || custom === secret;
}

async function runRefresh() {
  const summary = {};
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const categoryKey of Object.keys(CATEGORIES)) {
    try {
      const items = await fetchCategoryArticles(categoryKey, { pageSize: 15 });
      let catInserted = 0;
      let catUpdated = 0;

      for (const item of items) {
        const existing = await prisma.article.findUnique({
          where: { sourceId: item.sourceId },
          select: { id: true },
        });

        await prisma.article.upsert({
          where: { sourceId: item.sourceId },
          create: item,
          update: {
            title: item.title,
            hook: item.hook,
            abstract: item.abstract,
            journal: item.journal,
            authors: item.authors,
            publishedAt: item.publishedAt,
            url: item.url,
          },
        });

        if (existing) catUpdated++;
        else catInserted++;
      }

      inserted += catInserted;
      updated += catUpdated;
      summary[categoryKey] = { fetched: items.length, inserted: catInserted, updated: catUpdated };
    } catch (err) {
      failed++;
      summary[categoryKey] = { error: String(err?.message || err) };
    }
  }

  return { inserted, updated, failed, summary, ranAt: new Date().toISOString() };
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const result = await runRefresh();
  return NextResponse.json(result);
}

// Allow POST too, so it's easy to trigger by hand with curl while testing.
export async function POST(req) {
  return GET(req);
}
