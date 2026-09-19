import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/follows  { targetUserId }
// Toggles the follow relationship: creates it if missing, removes it if
// present. Yes — this is the piece that makes "follow other users and see
// what they repost" possible; see app/api/feed/following/route.js for the
// read side.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const targetUserId = body?.targetUserId;
  if (!targetUserId) {
    return NextResponse.json({ error: "Falta targetUserId." }, { status: 400 });
  }
  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "No puedes seguirte a ti mismo." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: session.user.id, followingId: targetUserId },
  });
  return NextResponse.json({ following: true });
}
