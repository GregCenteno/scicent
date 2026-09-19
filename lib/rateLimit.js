// Minimal in-memory sliding-window rate limiter for the auth endpoints
// (/api/auth/register, and login through lib/auth.js's authorize()).
//
// This is deliberately simple: it keeps counters in a Map that lives as
// long as the Node process does. On a single long-running server (a VPS,
// Render, Railway) that's exactly right. On serverless platforms (Vercel)
// each function instance gets its own Map, so the *effective* limit is
// "N attempts per warm instance" rather than a hard global ceiling — still
// enough to blunt a casual credential-stuffing script, but NOT a
// substitute for a shared store if you expect real abuse traffic. Before a
// public launch that needs a hard guarantee, swap this for a Redis-backed
// limiter (Upstash's @upstash/ratelimit is the usual pick on Vercel) — the
// call sites (register route, lib/auth.js) only need `check()` to keep its
// signature.
const buckets = new Map();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8; // per key, per window

// Keep the map from growing forever on a long-lived process.
function sweep(now) {
  for (const [key, entry] of buckets) {
    if (now - entry.start > WINDOW_MS) buckets.delete(key);
  }
}

/**
 * @param {string} key - usually `${routeName}:${ip}` or `${routeName}:${email}`
 * @returns {{ok: boolean, remaining: number, retryAfterMs: number}}
 */
export function check(key) {
  const now = Date.now();
  if (buckets.size > 5000) sweep(now);

  let entry = buckets.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { start: now, count: 0 };
    buckets.set(key, entry);
  }

  entry.count += 1;
  const ok = entry.count <= MAX_ATTEMPTS;
  const retryAfterMs = Math.max(0, WINDOW_MS - (now - entry.start));
  return { ok, remaining: Math.max(0, MAX_ATTEMPTS - entry.count), retryAfterMs };
}

// Best-effort caller IP from the headers a proxy (Vercel, Render, etc.) sets.
// Never trust this for anything security-critical beyond rate limiting.
export function requestIp(req) {
  const fwd = req.headers.get?.("x-forwarded-for") || req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get?.("x-real-ip") || req.headers["x-real-ip"];
  if (real) return real;
  return "unknown";
}
