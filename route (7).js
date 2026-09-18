import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reposts  { articleId, comment? }
// Toggles a repost of that article onto the current user's profile. A
// repost with no comment is a plain "reshare"; with a comment, it's a
// quote-repost. Followers read these back via /api/feed/following.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const articleId = body?.articleId;
  const comment = (body?.comment || "").trim().slice(0, 280) || null;
  if (!articleId) {
    return NextResponse.json({ error: "Falta articleId." }, { status: 400 });
  }

  const existing = await prisma.repost.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
  });

  if (existing) {
    await prisma.repost.delete({ where: { id: existing.id } });
    return NextResponse.json({ reposted: false });
  }

  await prisma.repost.create({ data: { userId: session.user.id, articleId, comment } });
  return NextResponse.json({ reposted: true });
}
