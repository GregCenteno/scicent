import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { check as rateLimitCheck, requestIp } from "./rateLimit";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      // NextAuth passes a second arg with the raw request (headers, etc.)
      // — that's how a Credentials provider gets at the caller's IP for
      // rate limiting without a full custom route.
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        // Keyed by IP *and* email so one bad actor can't lock out someone
        // else's account by spamming login attempts against their email
        // from a different IP, while still throttling brute-forcing a
        // single account from one machine.
        const ip = requestIp(req || { headers: {} });
        const byIp = rateLimitCheck(`login-ip:${ip}`);
        const byEmail = rateLimitCheck(`login-email:${email}`);
        if (!byIp.ok || !byEmail.ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, username: user.username };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
