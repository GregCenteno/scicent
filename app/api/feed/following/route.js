import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/feed/following?cursor=<repostId>&limit=20
// The "siguiendo" feed: reposts made by people the current user follows,
// newest first — this is the read side of the follow feature. Each row
// carries who reposted it, their optional comment, and the underlying
// article, so the UI can render it as "Dra. Ceballos reposteó — <card>".
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  if (!followingIds.length) {
    return NextResponse.json({ reposts: [], nextCursor: null });
  }

  const reposts = await prisma.repost.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      user: { select: { id: true, name: true } },
      article: true,
    },
  });

  const hasMore = reposts.length > limit;
  const page = reposts.slice(0, limit).map((r) => ({
    repostId: r.id,
    comment: r.comment,
    createdAt: r.createdAt,
    repostedBy: r.user,
    article: {
      id: r.article.id,
      category: r.article.category,
      title: r.article.title,
      hook: r.article.hook,
      journal: r.article.journal,
      publishedAt: r.article.publishedAt,
      url: r.article.url,
    },
  }));

  return NextResponse.json({
    reposts: page,
    nextCursor: hasMore ? page[page.length - 1]?.repostId ?? null : null,
  });
}
