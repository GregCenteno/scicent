"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icons";

// Barra inferior fija — Inicio / Explorar / Perfil — igual a la del
// artefacto (ver ICONS.home/search/user + .bottomnav/.navbtn allá).
// "active" indica cuál ítem se pinta resaltado; onExplore es opcional y se
// usa cuando ya estamos en /feed, para abrir la hoja de filtros ahí mismo
// en vez de navegar.
export default function BottomNav({ active, onExplore }) {
  const router = useRouter();

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
      <Link href="/profile" className={"navbtn" + (active === "profile" ? " active" : "")}>
        <span className="navico-wrap">
          <Icon name="user" />
        </span>
        Perfil
      </Link>
    </div>
  );
}
