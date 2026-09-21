"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { CATEGORIES } from "@/lib/categories";
import Icon from "./Icons";
import BottomNav from "./BottomNav";

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

const TABS = [
  { key: "seguidores", label: "Seguidores", icon: "users" },
  { key: "siguiendo", label: "Siguiendo", icon: "user" },
  { key: "reposts", label: "Reposteado", icon: "repeat" },
  { key: "favoritos", label: "Favoritos", icon: "heart" },
  { key: "guardados", label: "Guardados", icon: "bookmark" },
];

function RowEmpty({ children }) {
  return <div className="row-empty">{children}</div>;
}

// Lista de artículos (reposts / favoritos / guardados) — cada fila abre el
// artículo original en una pestaña nueva, igual que el enlace "Leer
// original" de la tarjeta.
function ArticleRowList({ articles, emptyMessage }) {
  if (!articles.length) return <RowEmpty>{emptyMessage}</RowEmpty>;
  return (
    <ul className="row-list">
      {articles.map((a) => {
        const cat = CATEGORIES[a.category];
        return (
          <li key={a.id}>
            <a className="row-item" href={a.url} target="_blank" rel="noopener noreferrer">
              <span className="row-dot" style={{ background: cat?.colors.accent }} />
              <span className="row-text">
                <strong>{a.title}</strong>
                <span>
                  {cat?.label} · {a.journal || "Europe PMC"} · {formatDate(a.publishedAt)}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function ProfilePanel({ user }) {
  const [tab, setTab] = useState("seguidores");
  const [theme, setTheme] = useState(null);

  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [reposts, setReposts] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setTheme(current);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  function applyTheme(next) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("scicent-theme", next);
    } catch {}
  }

  // Carga perezosa: cada pestaña trae sus datos la primera vez que se abre.
  useEffect(() => {
    if (tab === "seguidores" && followers === null) {
      fetch("/api/followers")
        .then((r) => r.json())
        .then((d) => setFollowers(d.followers || []));
    } else if (tab === "siguiendo" && following === null) {
      fetch("/api/users")
        .then((r) => r.json())
        .then((d) => setFollowing(d.users || []));
    } else if (tab === "reposts" && reposts === null) {
      fetch("/api/articles?reposted=1")
        .then((r) => r.json())
        .then((d) => setReposts(d.articles || []));
    } else if (tab === "favoritos" && favorites === null) {
      fetch("/api/articles?liked=1")
        .then((r) => r.json())
        .then((d) => setFavorites(d.articles || []));
    } else if (tab === "guardados" && saved === null) {
      fetch("/api/articles?saved=1")
        .then((r) => r.json())
        .then((d) => setSaved(d.articles || []));
    }
  }, [tab, followers, following, reposts, favorites, saved]);

  async function toggleFollowBack(userId) {
    setFollowers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u))
    );
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const result = await res.json();
    setFollowers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: result.following } : u))
    );
  }

  async function toggleFollow(userId) {
    setFollowing((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u))
    );
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const result = await res.json();
    setFollowing((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: result.following } : u))
    );
  }

  function renderBody() {
    if (tab === "seguidores") {
      if (followers === null) return <RowEmpty>Cargando…</RowEmpty>;
      if (!followers.length) {
        return <RowEmpty>Todavía nadie te sigue. Comparte tu usuario con tus colegas para que te encuentren.</RowEmpty>;
      }
      return (
        <ul className="user-list">
          {followers.map((u) => (
            <li key={u.id} className="user-row">
              <div className="user-avatar">{initials(u.name)}</div>
              <div className="user-info">
                <strong>{u.name}</strong>
                <span className="community-muted">@{u.username}</span>
              </div>
              <button
                className={"btn-follow" + (u.isFollowing ? " following" : "")}
                onClick={() => toggleFollowBack(u.id)}
              >
                {u.isFollowing ? "Siguiendo" : "Seguir de vuelta"}
              </button>
            </li>
          ))}
        </ul>
      );
    }

    if (tab === "siguiendo") {
      if (following === null) return <RowEmpty>Cargando…</RowEmpty>;
      const list = following.filter((u) => u.isFollowing);
      const rest = following.filter((u) => !u.isFollowing);
      return (
        <>
          {list.length === 0 ? (
            <RowEmpty>Aún no sigues a nadie. Elige alguna cuenta de la lista de abajo.</RowEmpty>
          ) : (
            <ul className="user-list">
              {list.map((u) => (
                <li key={u.id} className="user-row">
                  <div className="user-avatar">{initials(u.name)}</div>
                  <div className="user-info">
                    <strong>{u.name}</strong>
                    <span className="community-muted">@{u.username} · {u.followersCount} seguidores</span>
                  </div>
                  <button className="btn-follow following" onClick={() => toggleFollow(u.id)}>
                    Siguiendo
                  </button>
                </li>
              ))}
            </ul>
          )}
          {rest.length > 0 && (
            <>
              <div className="subhead">Cuentas para seguir</div>
              <ul className="user-list">
                {rest.map((u) => (
                  <li key={u.id} className="user-row">
                    <div className="user-avatar">{initials(u.name)}</div>
                    <div className="user-info">
                      <strong>{u.name}</strong>
                      <span className="community-muted">@{u.username} · {u.followersCount} seguidores</span>
                    </div>
                    <button className="btn-follow" onClick={() => toggleFollow(u.id)}>
                      Seguir
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="sheet-note">
            <Icon name="info" />
            <span>Para ver lo que han reposteado las cuentas que sigues, entra a la pestaña Comunidad de la barra inferior.</span>
          </div>
        </>
      );
    }

    if (tab === "reposts") {
      if (reposts === null) return <RowEmpty>Cargando…</RowEmpty>;
      return (
        <ArticleRowList
          articles={reposts}
          emptyMessage={
            <>
              Aún no reposteas nada.
              <br />
              Toca el ícono de repostear en cualquier tarjeta del feed.
            </>
          }
        />
      );
    }

    if (tab === "favoritos") {
      if (favorites === null) return <RowEmpty>Cargando…</RowEmpty>;
      return (
        <>
          <div className="sheet-note">
            <Icon name="info" />
            <span>Dale like a temas que te interesan — te ayuda a priorizar esas disciplinas en Inicio.</span>
          </div>
          <ArticleRowList
            articles={favorites}
            emptyMessage={
              <>
                Aún no le das like a ningún artículo.
                <br />
                Tócalo en cualquier tarjeta del feed.
              </>
            }
          />
        </>
      );
    }

    if (tab === "guardados") {
      if (saved === null) return <RowEmpty>Cargando…</RowEmpty>;
      return (
        <>
          <div className="sheet-note">
            <Icon name="info" />
            <span>Tu lista para leer después — nada se borra hasta que tú lo quites.</span>
          </div>
          <ArticleRowList
            articles={saved}
            emptyMessage={
              <>
                Aún no guardas ningún artículo.
                <br />
                Tócalo en cualquier tarjeta del feed.
              </>
            }
          />
        </>
      );
    }

    return null;
  }

  return (
    <div className="stage">
      <div className="app">
        <div className="profile-shell">
          <h1>Perfil</h1>

          <div className="profile-head">
            <div className="avatar-lg">{initials(user?.name)}</div>
            <div className="profile-head-info">
              <strong>{user?.name || "—"}</strong>
              {user?.username && <span id="profileUsername">@{user.username}</span>}
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <div className="tab-row">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={"tab-btn" + (tab === t.key ? " active" : "")}
                onClick={() => setTab(t.key)}
              >
                <Icon name={t.icon} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="profile-body">{renderBody()}</div>

          <div className="theme-row">
            <span className="theme-row-label">Apariencia</span>
            <div className="theme-switch">
              <button
                className={"theme-opt" + (theme === "light" ? " active" : "")}
                onClick={() => applyTheme("light")}
              >
                <Icon name="sun" />
                <span>Claro</span>
              </button>
              <button
                className={"theme-opt" + (theme === "dark" ? " active" : "")}
                onClick={() => applyTheme("dark")}
              >
                <Icon name="moon" />
                <span>Oscuro</span>
              </button>
            </div>
          </div>

          <button className="btn-logout" onClick={() => signOut({ callbackUrl: "/login" })}>
            <Icon name="logout" />
            Cerrar sesión
          </button>
        </div>

        <BottomNav active="profile" />
      </div>
    </div>
  );
}
