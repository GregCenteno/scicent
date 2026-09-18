"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { CATEGORY_LIST } from "@/lib/categories";
import ArticleCard from "./ArticleCard";

export default function ReelFeed({ userName }) {
  const [articles, setArticles] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCats, setActiveCats] = useState(new Set());
  const [viewingSaved, setViewingSaved] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [progress, setProgress] = useState("0 / 0");

  const feedRef = useRef(null);
  const ioRef = useRef(null);

  const load = useCallback(async ({ reset = true } = {}) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams();
    if (viewingSaved) params.set("saved", "1");
    else if (activeCats.size === 1) params.set("category", Array.from(activeCats)[0]);
    if (!reset && cursor) params.set("cursor", cursor);

    try {
      const res = await fetch(`/api/articles?${params.toString()}`);
      if (res.status === 401) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      const data = await res.json();
      let list = data.articles || [];
      if (!viewingSaved && activeCats.size > 1) {
        list = list.filter((a) => activeCats.has(a.category));
      }
      setArticles((prev) => (reset ? list : [...prev, ...list]));
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCats, viewingSaved, cursor]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load({ reset: true });
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [activeCats, viewingSaved]);

  function toggleCat(key) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function onToggle(articleId, action) {
    const field = action === "like" ? "liked" : action === "save" ? "saved" : "reposted";
    setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, [field]: !a[field] } : a)));
    try {
      if (action === "repost") {
        const res = await fetch("/api/reposts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId }),
        });
        const result = await res.json();
        setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, reposted: result.reposted } : a)));
        return;
      }
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, action }),
      });
      const result = await res.json();
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, liked: result.liked, saved: result.saved } : a))
      );
      if (viewingSaved && action === "save" && !result.saved) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      }
    } catch {
      // best-effort — a failed toggle just leaves the optimistic state in place
    }
  }

  // Infinite scroll: load more once the viewer nears the end of the list.
  function onFeedScroll(e) {
    const el = e.target;
    if (el.scrollTop + el.clientHeight > el.scrollHeight - el.clientHeight * 1.5) {
      if (cursor && !loadingMore) load({ reset: false });
    }
  }

  useEffect(() => {
    if (ioRef.current) ioRef.current.disconnect();
    const cards = feedRef.current?.querySelectorAll(".card");
    if (!cards || !cards.length) {
      setProgress("0 / 0");
      return;
    }
    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Array.prototype.indexOf.call(cards, entry.target) + 1;
            setProgress(`${idx} / ${cards.length}`);
          }
        });
      },
      { root: feedRef.current, threshold: [0, 0.6, 1] }
    );
    cards.forEach((c) => ioRef.current.observe(c));
    return () => ioRef.current?.disconnect();
  }, [articles]);

  const savedCount = articles.filter((a) => a.saved).length;

  return (
    <div className="stage">
      <div className="app">
        <div className="topbar">
          <div className="brand">Scicent</div>
          <div className="topbar-actions">
            <button
              className={"iconbtn" + (viewingSaved ? " on" : "")}
              onClick={() => setViewingSaved((v) => !v)}
              title="Guardados"
              aria-label="Ver guardados"
            >
              🔖
            </button>
            <button className="iconbtn" onClick={() => setSheetOpen(true)} title="Filtrar" aria-label="Filtrar">
              ▤
            </button>
            <a className="iconbtn" href="/community" title="Comunidad" aria-label="Comunidad: seguir y ver reposts">
              👥
            </a>
            <button className="iconbtn" onClick={() => signOut({ callbackUrl: "/login" })} title="Salir" aria-label="Cerrar sesión">
              ⏻
            </button>
          </div>
        </div>

        {articles.length > 0 && <div className="progress">{progress}</div>}

        <div className="feed" ref={feedRef} onScroll={onFeedScroll}>
          {loading ? (
            <div className="loading">Cargando literatura reciente…</div>
          ) : articles.length === 0 ? (
            <div className="empty">
              <div className="em">{viewingSaved ? "🔖" : "🩺"}</div>
              <h3>{viewingSaved ? "Aún no guardas nada" : "Sin artículos por ahora"}</h3>
              <p>
                {viewingSaved
                  ? "Toca el ícono de guardar en cualquier artículo para armar tu colección."
                  : "El feed se actualiza automáticamente. Vuelve a intentar en unos minutos o ajusta los filtros."}
              </p>
            </div>
          ) : (
            articles.map((a) => <ArticleCard key={a.id} article={a} onToggle={onToggle} />)
          )}
        </div>

        <div className={"scrim" + (sheetOpen ? " open" : "")} onClick={() => setSheetOpen(false)} />
        <div className={"sheet" + (sheetOpen ? " open" : "")} role="dialog" aria-label="Filtrar por disciplina">
          <div className="sheet-handle" />
          <h3>Explorar por disciplina</h3>
          <p className="sub">Hola {userName || ""} — elige una o varias áreas de salud.</p>
          <div className="chips">
            {CATEGORY_LIST.map((c) => {
              const on = activeCats.has(c.key);
              return (
                <button
                  key={c.key}
                  className={"chip" + (on ? " active" : "")}
                  style={on ? { background: c.colors.accent, borderColor: "transparent" } : undefined}
                  onClick={() => toggleCat(c.key)}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
          <div className="sheet-actions">
            <button className="btn-ghost" onClick={() => setActiveCats(new Set())}>
              Quitar filtros
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setViewingSaved(false);
                setSheetOpen(false);
              }}
            >
              Ver feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
