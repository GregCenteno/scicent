import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { check as rateLimitCheck, requestIp } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/i;

export async function POST(req) {
  const ip = requestIp(req);
  const limit = rateLimitCheck(`register:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const name = (body?.name || "").trim();
  const username = (body?.username || "").trim();
  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });
  }
  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: 'El usuario debe tener 3 a 20 caracteres: letras, números, "." o "_", sin espacios.' },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const usernameNorm = username.toLowerCase();
  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username: usernameNorm } }),
  ]);
  if (existingEmail) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }
  if (existingUsername) {
    return NextResponse.json({ error: "Ese nombre de usuario ya está en uso." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await prisma.user.create({
      data: { name, username: usernameNorm, email, passwordHash },
      select: { id: true, name: true, username: true, email: true },
    });
  } catch (err) {
    // Race condition: two requests passed the findUnique checks above at
    // the same time. The DB-level @unique constraint is the real guard;
    // this just turns that into a friendly error instead of a 500.
    if (err?.code === "P2002") {
      const field = err?.meta?.target?.includes("username") ? "usuario" : "correo";
      return NextResponse.json({ error: `Ese ${field} ya está en uso.` }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ user }, { status: 201 });
}
