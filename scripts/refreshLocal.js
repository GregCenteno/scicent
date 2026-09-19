/**
 * Run the same Europe PMC ingestion the /api/articles/refresh route runs,
 * without going through HTTP — handy for a first local seed or for testing
 * the query strings in lib/categories.js.
 *
 *   npm run refresh:local
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Lazy-require the ESM-flavored lib files via dynamic import since this
  // script runs under plain Node, not Next's bundler.
  const { fetchCategoryArticles } = await import("../lib/europepmc.js");
  const { CATEGORIES } = await import("../lib/categories.js");

  for (const categoryKey of Object.keys(CATEGORIES)) {
    process.stdout.write(`Fetching ${categoryKey}… `);
    const items = await fetchCategoryArticles(categoryKey, { pageSize: 15 });
    let inserted = 0;
    for (const item of items) {
      const existing = await prisma.article.findUnique({ where: { sourceId: item.sourceId } });
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
      if (!existing) inserted++;
    }
    console.log(`${items.length} fetched, ${inserted} new.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
