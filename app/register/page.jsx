"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!acceptedTerms) {
      setError("Acepta los términos y el aviso de privacidad para continuar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) {
        setError("Cuenta creada. Inicia sesión.");
        router.push("/login");
        return;
      }
      router.push("/feed");
    } catch {
      setError("Algo salió mal. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Crea tu cuenta</h1>
        <p className="sub">Regístrate para guardar tus artículos y personalizar tu feed de salud.</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_.]{3,20}"
            autoCapitalize="off"
            autoComplete="off"
            placeholder="usuario_unico"
          />
        </div>
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
              minLength={8}
              placeholder="Mínimo 8 caracteres"
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
        <label className="check-row">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>
            Acepto los <Link href="/terms">términos de uso</Link> y el{" "}
            <Link href="/privacy">aviso de privacidad</Link>.
          </span>
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
