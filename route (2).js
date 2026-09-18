import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users?q=ana — directory used by the "follow" UI. Deliberately
// small: name + email + whether the current user already follows them.
// A real launch would paginate this and probably not expose raw email.
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    take: 25,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      followers: { where: { followerId: session.user.id }, select: { id: true } },
      _count: { select: { followers: true, reposts: true } },
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      followersCount: u._count.followers,
      repostsCount: u._count.reposts,
      isFollowing: u.followers.length > 0,
    })),
  });
}
