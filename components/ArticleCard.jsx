"use client";

import { useRef } from "react";
import { CATEGORIES } from "@/lib/categories";
import ThematicBackground from "./ThematicBackground";
import Icon from "./Icons";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "short" });
}

export default function ArticleCard({ article, onToggle }) {
  const cat = CATEGORIES[article.category] || CATEGORIES.MEDICINA;
  const lastTap = useRef(0);
  const tapZoneRef = useRef(null);

  function handleTap(e) {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      if (!article.liked) onToggle(article.id, "like");
      burst(e);
    }
    lastTap.current = now;
  }

  function burst(e) {
    const zone = tapZoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const x = (e.clientX || rect.width / 2) - rect.left;
    const y = (e.clientY || rect.height / 2) - rect.top;
    const el = document.createElement("div");
    el.className = "burst-heart";
    el.innerHTML =
      '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.2s-7.6-4.6-9.7-9.2C.9 7.7 2.6 4.6 5.8 4a4.9 4.9 0 0 1 6.2 2.1A4.9 4.9 0 0 1 18.2 4c3.2.6 4.9 3.7 3.5 7-2.1 4.6-9.7 9.2-9.7 9.2Z"/></svg>';
    el.style.left = x + "px";
    el.style.top = y + "px";
    zone.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  function share() {
    const text = `${article.title} — ${article.url}`;
    if (navigator.share) {
      navigator.share({ title: article.title, text: article.hook, url: article.url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <div className="card" data-id={article.id}>
      <ThematicBackground category={article.category} seed={article.id} />
      <div className="card-tapzone" ref={tapZoneRef} onClick={handleTap} />

      <div className="rail">
        <button
          className={"rail-btn" + (article.liked ? " liked" : "")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(article.id, "like");
          }}
          aria-label="Me gusta"
        >
          <span className="rail-ico"><Icon name="heart" filled={article.liked} /></span>
          <span className="rail-count">Me gusta</span>
        </button>
        <button
          className={"rail-btn" + (article.saved ? " saved" : "")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(article.id, "save");
          }}
          aria-label="Guardar"
        >
          <span className="rail-ico"><Icon name="bookmark" filled={article.saved} /></span>
          <span className="rail-count">Guardar</span>
        </button>
        <button
          className={"rail-btn" + (article.reposted ? " reposted" : "")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(article.id, "repost");
          }}
          aria-label="Repostear"
        >
          <span className="rail-ico"><Icon name="repeat" /></span>
          <span className="rail-count">{article.reposted ? "Reposteado" : "Repostear"}</span>
        </button>
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            share();
          }}
          aria-label="Compartir"
        >
          <span className="rail-ico"><Icon name="arrow-up-right" /></span>
          <span className="rail-count">Compartir</span>
        </button>
      </div>

      <div className="card-body">
        <span className="cat-chip" style={{ "--chip-accent": cat.colors.accent }}>
          <span className="cat-chip-ico"><Icon name={cat.icon} /></span>
          {cat.label}
        </span>
        <h2 className="card-title">{article.title}</h2>
        <p className="card-hook">{article.hook}</p>
        <span className={"oa-badge" + (article.isOpenAccess ? " open" : "")}>
          <Icon name={article.isOpenAccess ? "unlock" : "lock"} />
          {article.isOpenAccess ? "Acceso abierto" : "Acceso restringido"}
        </span>
        <div className="card-source">
          <span>{article.journal || "Europe PMC"}</span>
          <span className="sep">·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Leer original ↗
          </a>
        </div>
      </div>
    </div>
  );
}
