"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

// Two halves: who you can follow, and — the actual point of the follow
// feature — what the people you already follow have reposted, newest
// first. Both read/write the real Follow and Repost tables via the API
// routes, there is nothing mocked here.
export default function CommunityPanel() {
  const [users, setUsers] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoadingUsers(false));
    loadFollowingFeed();
  }, []);

  function loadFollowingFeed() {
    setLoadingFeed(true);
    fetch("/api/feed/following")
      .then((r) => r.json())
      .then((d) => setReposts(d.reposts || []))
      .finally(() => setLoadingFeed(false));
  }

  async function toggleFollow(userId) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u)));
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const result = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFollowing: result.following } : u)));
    loadFollowingFeed();
  }

  return (
    <div className="community-shell">
      <div className="community-topbar">
        <Link href="/feed" className="iconbtn" aria-label="Volver al feed">
          ←
        </Link>
        <h1>Comunidad</h1>
        <span style={{ width: 38 }} />
      </div>

      <section className="community-section">
        <h2>Cuentas para seguir</h2>
        {loadingUsers ? (
          <p className="community-muted">Cargando…</p>
        ) : users.length === 0 ? (
          <p className="community-muted">
            Todavía no hay otras cuentas registradas — invita a alguien más de tu equipo a crear la suya.
          </p>
        ) : (
          <ul className="user-list">
            {users.map((u) => (
              <li key={u.id} className="user-row">
                <div className="user-avatar">{(u.name || "?").slice(0, 1).toUpperCase()}</div>
                <div className="user-info">
                  <strong>{u.name}</strong>
                  <span className="community-muted">
                    @{u.username} · {u.followersCount} seguidores · {u.repostsCount} reposts
                  </span>
                </div>
                <button
                  className={"btn-follow" + (u.isFollowing ? " following" : "")}
                  onClick={() => toggleFollow(u.id)}
                >
                  {u.isFollowing ? "Siguiendo" : "Seguir"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="community-section">
        <h2>Lo que repostearon las cuentas que sigues</h2>
        {loadingFeed ? (
          <p className="community-muted">Cargando…</p>
        ) : reposts.length === 0 ? (
          <p className="community-muted">
            Sigue a alguien arriba, o pide a alguien que siga tu cuenta y reposte algo — en cuanto haya un repost
            de una cuenta que sigues, aparece aquí.
          </p>
        ) : (
          <ul className="repost-list">
            {reposts.map((r) => {
              const cat = CATEGORIES[r.article.category];
              return (
                <li key={r.repostId} className="repost-row">
                  <div className="repost-meta">
                    🔁 <strong>{r.repostedBy.name}</strong> reposteó · {formatDate(r.createdAt)}
                  </div>
                  {r.comment && <p className="repost-comment">“{r.comment}”</p>}
                  <a className="repost-card" href={r.article.url} target="_blank" rel="noopener noreferrer">
                    <span className="cat-chip" style={{ background: cat.colors.accent + "26", color: cat.colors.accent }}>
                      {cat.emoji} {cat.label}
                    </span>
                    <strong>{r.article.title}</strong>
                    <span className="community-muted">{r.article.hook}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
