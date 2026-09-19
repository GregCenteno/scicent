import { CATEGORIES } from "./categories";

// Deterministic PRNG so the same article always renders the same background
// (no flash-of-different-art on re-render), without persisting an image.
function mulberry32(seed) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// One small vector "motif" per discipline, tiled at random positions/sizes.
// Kept purely geometric (no external images) so it renders instantly and
// never depends on an external asset host.
const MOTIFS = {
  ENFERMERIA: (rnd, c) => {
    // heartbeat pulse line + small cross ticks
    let d = "M -20 50 L 30 50 L 45 20 L 60 80 L 75 40 L 90 50 L 140 50";
    return `<path d="${d}" stroke="${c.accent}" stroke-width="3" fill="none" opacity="${0.22 + rnd() * 0.2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  },
  MEDICINA: (rnd, c) => {
    const r = 10 + rnd() * 26;
    return `<circle r="${r}" fill="${c.accent}" opacity="${0.1 + rnd() * 0.16}"/>`;
  },
  FARMACIA: (rnd, c) => {
    const w = 34 + rnd() * 20;
    const rot = rnd() * 360;
    return `<g transform="rotate(${rot})"><rect x="${-w / 2}" y="-9" width="${w}" height="18" rx="9" fill="${c.accent}" opacity="${0.14 + rnd() * 0.16}"/><rect x="${-w / 2}" y="-9" width="${w / 2}" height="18" rx="9" fill="#ffffff" opacity="0.14"/></g>`;
  },
  NUTRICION: (rnd, c) => {
    const s = 22 + rnd() * 20;
    const rot = rnd() * 360;
    return `<g transform="rotate(${rot})"><path d="M0 -${s} C ${s} -${s} ${s} ${s} 0 ${s} C -${s} ${s} -${s} -${s} 0 -${s} Z" fill="${c.accent}" opacity="${0.14 + rnd() * 0.16}"/></g>`;
  },
  REHABILITACION: (rnd, c) => {
    const r = 24 + rnd() * 30;
    const sweep = 90 + rnd() * 120;
    const start = rnd() * 360;
    const end = start + sweep;
    const p = (deg, radius) => [radius * Math.cos((deg * Math.PI) / 180), radius * Math.sin((deg * Math.PI) / 180)];
    const [sx, sy] = p(start, r);
    const [ex, ey] = p(end, r);
    const large = sweep > 180 ? 1 : 0;
    return `<path d="M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}" stroke="${c.accent}" stroke-width="5" fill="none" opacity="${0.16 + rnd() * 0.18}" stroke-linecap="round"/>`;
  },
  ODONTOLOGIA: (rnd, c) => {
    // a simple molar silhouette (two roots + crown) plus a shine sparkle
    const s = 16 + rnd() * 14;
    const rot = (rnd() - 0.5) * 30;
    const tooth = `M ${-s} ${-s * 0.5} C ${-s * 1.3} ${-s * 1.3} ${-s * 0.4} ${-s * 1.6} 0 ${-s * 1.1} C ${s * 0.4} ${-s * 1.6} ${s * 1.3} ${-s * 1.3} ${s} ${-s * 0.5} C ${s * 0.9} ${s * 0.6} ${s * 0.5} ${s * 1.6} ${s * 0.15} ${s * 0.7} C ${s * 0.05} ${s * 1.3} ${-s * 0.05} ${s * 1.3} ${-s * 0.15} ${s * 0.7} C ${-s * 0.5} ${s * 1.6} ${-s * 0.9} ${s * 0.6} ${-s} ${-s * 0.5} Z`;
    return `<g transform="rotate(${rot.toFixed(1)})"><path d="${tooth}" fill="${c.accent}" opacity="${0.14 + rnd() * 0.16}"/></g>`;
  },
  LABORATORIO_CLINICO: (rnd, c) => {
    // a small molecule: a few nodes joined by thin lines, like assay/petri data
    const n = 3 + Math.floor(rnd() * 2);
    const r = 14 + rnd() * 16;
    let pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd();
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    let lines = "";
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % n];
      lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c.accent}" stroke-width="1.5" opacity="${0.16 + rnd() * 0.14}"/>`;
    }
    const dots = pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${c.accent}" opacity="${0.2 + rnd() * 0.18}"/>`).join("");
    return lines + dots;
  },
};

/**
 * Builds a self-contained SVG background for a feed card: a colored gradient
 * specific to the article's discipline plus a scatter of category motifs, so
 * the feed never falls back to a flat black/empty card. Deterministic per
 * (category, seed) — pass the article id as the seed.
 */
export function buildBackgroundSVG(categoryKey, seed, { width = 480, height = 854 } = {}) {
  const c = CATEGORIES[categoryKey]?.colors ?? CATEGORIES.MEDICINA.colors;
  const rnd = mulberry32(hashString(String(seed) + categoryKey));
  const motif = MOTIFS[categoryKey] ?? MOTIFS.MEDICINA;

  const shapes = Array.from({ length: 16 })
    .map(() => {
      const x = rnd() * width;
      const y = rnd() * height;
      const scale = 0.5 + rnd() * 1.3;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(2)})">${motif(rnd, c)}</g>`;
    })
    .join("");

  const gx1 = 10 + rnd() * 20;
  const gy1 = 90 - rnd() * 20;

  return `
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="base-${seed}" cx="${gx1}%" cy="${gy1}%" r="90%">
      <stop offset="0%" stop-color="${c.mid}"/>
      <stop offset="100%" stop-color="${c.base}"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#base-${seed})"/>
  ${shapes}
</svg>`.trim();
}
