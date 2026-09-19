import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/interactions  { articleId, action: "like" | "save" }
// Toggles the flag for the current user and returns the new state.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const articleId = body?.articleId;
  const action = body?.action;
  if (!articleId || !["like", "save"].includes(action)) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const field = action === "like" ? "liked" : "saved";

  const existing = await prisma.interaction.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
  });

  const nextValue = !existing?.[field];

  const result = await prisma.interaction.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    create: { userId: session.user.id, articleId, [field]: nextValue },
    update: { [field]: nextValue },
    select: { liked: true, saved: true },
  });

  return NextResponse.json(result);
}
