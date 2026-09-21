import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/followers — cuentas que siguen al usuario actual (lo opuesto de
// /api/users, que lista cuentas que el usuario actual puede seguir). Usado
// por la pestaña "Seguidores" del perfil. isFollowing indica si ya sigues
// de vuelta a esa cuenta, para poder ofrecer "Seguir de vuelta".
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const rows = await prisma.follow.findMany({
    where: { followingId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          // Filas donde ESE usuario es el "followee" y yo soy el "follower"
          // — es decir, si yo ya lo sigo de vuelta.
          followers: { where: { followerId: session.user.id }, select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json({
    followers: rows.map((r) => ({
      id: r.follower.id,
      name: r.follower.name,
      username: r.follower.username,
      isFollowing: r.follower.followers.length > 0,
    })),
  });
}
