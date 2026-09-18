"use client";

import { useMemo } from "react";
import { buildBackgroundSVG } from "@/lib/thematicBackground";

// Renders the generated-art background for a card. Same generator the
// Europe PMC refresh job's category is drawn from, so it stays consistent
// even though nothing is stored as an image — it's re-derived from
// (category, article id) every time, instantly and with no external host.
export default function ThematicBackground({ category, seed }) {
  const svg = useMemo(() => buildBackgroundSVG(category, seed), [category, seed]);
  return <div className="card-bg" dangerouslySetInnerHTML={{ __html: svg }} />;
}
