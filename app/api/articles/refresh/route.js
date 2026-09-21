import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { fetchCategoryArticles } from "@/lib/europepmc";
import { CATEGORIES } from "@/lib/categories";

export const maxDuration = 60; // seconds

// Pulled by Netlify Scheduled Functions (netlify/functions/refresh-articles.js)
// or any external scheduler — esto es lo que hace que el feed "se
// actualice solo" en vez de ser una lista curada de una sola vez. No es
// alcanzable desde el navegador: requiere el secreto de cron.
function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run wide open if misconfigured
  const auth = req.headers.get("authorization");
  const custom = req.headers.get("x-cron-secret");
  return auth === `Bearer ${secret}` || custom === secret;
}

// Un solo INSERT ... ON CONFLICT con varias filas, en vez de un
// upsert por artículo. Con decenas de artículos por categoría, hacer un
// upsert a la vez significaba decenas de viajes de ida y vuelta a
// Supabase — suficiente para superar el límite de tiempo de una función
// serverless (y el de herramientas como reqbin). Así es un solo viaje.
async function upsertBatch(items, chunkSize = 150) {
  let done = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    if (!chunk.length) continue;

    const rows = chunk.map(
      (item) => Prisma.sql`(
        ${randomUUID()}, ${item.sourceId}, ${item.category}::"Category", ${item.title}, ${item.hook},
        ${item.abstract}, ${item.journal}, ${item.authors}, ${item.language},
        ${item.isSpanish}, ${item.isOpenAccess}, ${item.publishedAt}, ${item.url}
      )`
    );

    await prisma.$executeRaw`
      INSERT INTO "Article"
        ("id","sourceId","category","title","hook","abstract","journal","authors","language","isSpanish","isOpenAccess","publishedAt","url")
      VALUES ${Prisma.join(rows)}
      ON CONFLICT ("sourceId") DO UPDATE SET
        "title" = EXCLUDED."title",
        "hook" = EXCLUDED."hook",
        "abstract" = EXCLUDED."abstract",
        "journal" = EXCLUDED."journal",
        "authors" = EXCLUDED."authors",
        "language" = EXCLUDED."language",
        "isSpanish" = EXCLUDED."isSpanish",
        "isOpenAccess" = EXCLUDED."isOpenAccess",
        "publishedAt" = EXCLUDED."publishedAt",
        "url" = EXCLUDED."url"
    `;
    done += chunk.length;
  }
  return done;
}

async function refreshOne(categoryKey) {
  const items = await fetchCategoryArticles(categoryKey);
  const done = await upsertBatch(items);
  return { fetched: items.length, processed: done };
}

// Procesa TODAS las categorías en una sola llamada — cómodo para probar a
// mano, pero con 7 categorías puede acercarse al límite de tiempo de una
// función serverless. La función programada de Netlify (ver
// netlify/functions/refresh-articles.js) ya no usa este camino: llama una
// vez por categoría (más abajo) para que cada llamada sea rápida y segura.
async function runRefreshAll() {
  const summary = {};
  let processed = 0;
  let failed = 0;

  for (const categoryKey of Object.keys(CATEGORIES)) {
    try {
      summary[categoryKey] = await refreshOne(categoryKey);
      processed += summary[categoryKey].processed;
    } catch (err) {
      failed++;
      summary[categoryKey] = { error: String(err?.message || err) };
    }
  }

  return { processed, failed, summary, ranAt: new Date().toISOString() };
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (category) {
    if (!CATEGORIES[category]) {
      return NextResponse.json({ error: "Categoría desconocida." }, { status: 400 });
    }
    try {
      const result = await refreshOne(category);
      return NextResponse.json({ category, ...result, ranAt: new Date().toISOString() });
    } catch (err) {
      return NextResponse.json({ category, error: String(err?.message || err) }, { status: 500 });
    }
  }

  const result = await runRefreshAll();
  return NextResponse.json(result);
}

// Allow POST too, so it's easy to trigger by hand with curl/reqbin while testing.
export async function POST(req) {
  return GET(req);
}
