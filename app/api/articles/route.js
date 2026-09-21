import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

// GET /api/articles?category=MEDICINA&saved=1&cursor=<id>&limit=20
// Requires a signed-in user (middleware also enforces this for /api/*).
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const savedOnly = searchParams.get("saved") === "1";
  const likedOnly = searchParams.get("liked") === "1";
  const repostedOnly = searchParams.get("reposted") === "1";
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  if (category && !CATEGORIES[category]) {
    return NextResponse.json({ error: "Categoría desconocida." }, { status: 400 });
  }

  const where = {
    ...(category ? { category } : {}),
    ...(savedOnly
      ? { interactions: { some: { userId: session.user.id, saved: true } } }
      : {}),
    ...(likedOnly
      ? { interactions: { some: { userId: session.user.id, liked: true } } }
      : {}),
    ...(repostedOnly ? { reposts: { some: { userId: session.user.id } } } : {}),
  };

  const articles = await prisma.article.findMany({
    where,
    // Primero lo que está en español, y dentro de cada grupo, lo más
    // reciente — pedido explícito: priorizar literatura en español.
    orderBy: [{ isSpanish: "desc" }, { publishedAt: "desc" }],
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      interactions: { where: { userId: session.user.id }, select: { liked: true, saved: true } },
      reposts: { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  const hasMore = articles.length > limit;
  const page = articles.slice(0, limit).map((a) => ({
    id: a.id,
    category: a.category,
    title: a.title,
    hook: a.hook,
    journal: a.journal,
    authors: a.authors,
    language: a.language,
    isOpenAccess: a.isOpenAccess,
    publishedAt: a.publishedAt,
    url: a.url,
    liked: a.interactions[0]?.liked ?? false,
    saved: a.interactions[0]?.saved ?? false,
    reposted: a.reposts.length > 0,
  }));

  return NextResponse.json({
    articles: page,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  });
}
