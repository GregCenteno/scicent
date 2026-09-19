"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (result?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/feed");
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Inicia sesión</h1>
        <p className="sub">Entra para seguir explorando ciencia de la salud.</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <div className="pass-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="pass-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <p className="auth-switch">
          ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
