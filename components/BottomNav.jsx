"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icons";

// Barra inferior fija — Inicio / Explorar / Comunidad / Perfil.
// "active" indica cuál ítem se pinta resaltado; onExplore es opcional y se
// usa cuando ya estamos en /feed, para abrir la hoja de filtros ahí mismo
// en vez de navegar.
export default function BottomNav({ active, onExplore }) {
  const router = useRouter();
  const [followerCount, setFollowerCount] = useState(0);

  // Solo para el globito de "Perfil" — cuántas cuentas te siguen a ti.
  useEffect(() => {
    fetch("/api/followers")
      .then((r) => r.json())
      .then((d) => setFollowerCount((d.followers || []).length))
      .catch(() => {});
  }, []);

  function handleExplore() {
    if (onExplore) onExplore();
    else router.push("/feed?explorar=1");
  }

  return (
    <div className="bottomnav">
      <Link href="/feed" className={"navbtn" + (active === "home" ? " active" : "")}>
        <span className="navico-wrap">
          <Icon name="home" />
        </span>
        Inicio
      </Link>
      <button
        type="button"
        className={"navbtn" + (active === "explore" ? " active" : "")}
        onClick={handleExplore}
      >
        <span className="navico-wrap">
          <Icon name="search" />
        </span>
        Explorar
      </button>
      <Link href="/community" className={"navbtn" + (active === "community" ? " active" : "")}>
        <span className="navico-wrap">
          <Icon name="users" />
        </span>
        Comunidad
      </Link>
      <Link href="/profile" className={"navbtn" + (active === "profile" ? " active" : "")}>
        <span className="navico-wrap">
          <Icon name="user" />
          {followerCount > 0 && (
            <span className="badge-count">{followerCount > 99 ? "99+" : followerCount}</span>
          )}
        </span>
        Perfil
      </Link>
    </div>
  );
}
