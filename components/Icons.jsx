// Set de íconos minimalistas de un solo color (línea, sin relleno salvo el
// estado "activo"), para reemplazar los emojis que quedaron en el backend.
// viewBox 24x24, trazo uniforme — pensado para verse consistente sin
// depender del set de emojis del sistema operativo del usuario.

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const PATHS = {
  bookmark: (
    <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1Z" />
  ),
  "bookmark-filled": (
    <path
      d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1Z"
      fill="currentColor"
    />
  ),
  heart: (
    <path d="M12 20.2s-7.6-4.6-9.7-9.2C.9 7.7 2.6 4.6 5.8 4a4.9 4.9 0 0 1 6.2 2.1A4.9 4.9 0 0 1 18.2 4c3.2.6 4.9 3.7 3.5 7-2.1 4.6-9.7 9.2-9.7 9.2Z" />
  ),
  "heart-filled": (
    <path
      d="M12 20.2s-7.6-4.6-9.7-9.2C.9 7.7 2.6 4.6 5.8 4a4.9 4.9 0 0 1 6.2 2.1A4.9 4.9 0 0 1 18.2 4c3.2.6 4.9 3.7 3.5 7-2.1 4.6-9.7 9.2-9.7 9.2Z"
      fill="currentColor"
    />
  ),
  repeat: (
    <g>
      <path d="M4 7.5h12.5a3.5 3.5 0 0 1 3.5 3.5v1" />
      <path d="m14 4 3.5 3.5L14 11" />
      <path d="M20 16.5H7.5A3.5 3.5 0 0 1 4 13v-1" />
      <path d="m10 20-3.5-3.5L10 13" />
    </g>
  ),
  filter: (
    <g>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </g>
  ),
  users: (
    <g>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.4 3-5.4 5.5-5.4s4.9 2 5.5 5.4" />
      <path d="M16.2 5.3a3.2 3.2 0 0 1 0 6.2" />
      <path d="M14.8 14.7c2.3.3 4.2 2.2 4.7 5.3" />
    </g>
  ),
  power: (
    <g>
      <line x1="12" y1="3.5" x2="12" y2="11" />
      <path d="M7 6a7 7 0 1 0 10 0" />
    </g>
  ),
  "arrow-up-right": (
    <g>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="9 7 17 7 17 15" />
    </g>
  ),
  empty: (
    <g>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 14h6" />
    </g>
  ),
  syringe: (
    <g>
      <line x1="20" y1="4" x2="17" y2="7" />
      <path d="m17 7-9.5 9.5-3.5 4 4-3.5L17.5 7.5" />
      <line x1="14" y1="6" x2="18" y2="10" />
      <line x1="11.5" y1="8.5" x2="13.5" y2="10.5" />
      <line x1="9" y1="11" x2="11" y2="13" />
    </g>
  ),
  stethoscope: (
    <g>
      <path d="M6 4v6a4 4 0 0 0 8 0V4" />
      <line x1="6" y1="4" x2="4.5" y2="4" />
      <line x1="14" y1="4" x2="15.5" y2="4" />
      <path d="M10 14v2a5 5 0 0 0 10 0v-1.3" />
      <circle cx="20.5" cy="14.5" r="1.7" />
    </g>
  ),
  pill: (
    <g>
      <rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 13)" />
      <line x1="10.3" y1="9" x2="13.7" y2="17" transform="rotate(-35 12 13)" />
    </g>
  ),
  leaf: (
    <g>
      <path d="M5 19c8-1 12-6 13-14-8 1-12 6-13 14Z" />
      <path d="M6 18c2-4 4.5-7 9-10" />
    </g>
  ),
  activity: (
    <polyline points="3 12 8 12 10.5 6 14 18 16.5 12 21 12" />
  ),
  tooth: (
    <path d="M12 3c-2.5 0-4.3 1.6-5.3 1.6-1.3 0-2.2 1-2.2 2.6 0 3 1 6.4 1.8 9 .4 1.3.9 2.3 1.9 2.3.9 0 1-2.4 1.8-2.4s.9 2.4 1.8 2.4c1 0 1.5-1 1.9-2.3.8-2.6 1.8-6 1.8-9 0-1.6-.9-2.6-2.2-2.6-1 0-2.8-1.6-5.3-1.6Z" />
  ),
  sun: (
    <g>
      <circle cx="12" cy="12" r="4.2" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="4.2" y1="4.2" x2="6" y2="6" />
      <line x1="18" y1="18" x2="19.8" y2="19.8" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.2" y1="19.8" x2="6" y2="18" />
      <line x1="18" y1="6" x2="19.8" y2="4.2" />
    </g>
  ),
  moon: <path d="M20 14.5a8.5 8.5 0 1 1-9.5-13 7 7 0 0 0 9.5 13Z" />,
  home: (
    <g>
      <path d="M4 11.3 12 4l8 7.3" />
      <path d="M6 10v9.2a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1V10" />
    </g>
  ),
  search: (
    <g>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="20" y1="20" x2="15.7" y2="15.7" />
    </g>
  ),
  user: (
    <g>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </g>
  ),
  logout: (
    <g>
      <path d="M9.5 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3.5" />
      <path d="M14 8l4 4-4 4" />
      <line x1="18" y1="12" x2="9" y2="12" />
    </g>
  ),
  info: (
    <g>
      <circle cx="12" cy="12" r="8.3" />
      <line x1="12" y1="11.2" x2="12" y2="16.5" />
      <circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  flask: (
    <g>
      <path d="M10 3h4" />
      <path d="M11 3v6.5L5.8 18a2 2 0 0 0 1.7 3h9a2 2 0 0 0 1.7-3L13 9.5V3" />
      <line x1="8" y1="15" x2="16" y2="15" />
    </g>
  ),
};

export default function Icon({ name, filled, className, style, label }) {
  const key = filled && PATHS[name + "-filled"] ? name + "-filled" : name;
  const content = PATHS[key] || PATHS.empty;
  return (
    <svg
      {...base}
      className={className}
      style={style}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {content}
    </svg>
  );
}
