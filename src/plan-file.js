// @ts-check
/* Checking and cleaning saved or imported plans field by field (BB-76). */

import {
  clamp,
  parseISO,
  DISTS,
  levelOf,
  recWeeksOf,
  uid,
  PHASES,
  iso,
  addDays,
  WEEK_PHASES,
  distKm,
  cat,
} from "./engine-api.js";
import { DEFAULT_INPUTS } from "./state.js";
import { t, DEFAULT_TYPES } from "./i18n.js";

/* Every plan read from storage or an imported file goes through normalizeSaved before it reaches the page:
 numbers become numbers, names come from fixed lists, links must be http(s). A file that someone else made
 can then never inject markup or script, and a half-broken file can't crash the page when opened. */
const KINDS = ["easy", "recovery", "hard", "long", "race"],
  PACES = ["easy", "tempo", "interval", "rep", "race", "mp"];
const nNum = (v, a, b, d) => {
  if (v === "" || v == null || typeof v === "boolean") return d;
  v = +v;
  return isFinite(v) ? clamp(v, a, b) : d;
};
export const nStr = (v, n) =>
  (typeof v === "string" ? v : typeof v === "number" && isFinite(v) ? String(v) : "").slice(0, n);
const nIso = (v, d) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(parseISO(v)) ? v : d);
export const nId = (v) => (typeof v === "string" && /^[\w-]{1,64}$/.test(v) ? v : null);
export function safeUrl(v) {
  v = nStr(v, 500).trim();
  if (!v) return "";
  if (!/^[a-z][\w+.-]*:/i.test(v)) v = "https://" + v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch (_) {
    return "";
  }
}
function nGoal(g) {
  return Array.isArray(g) && (g[0] === "d" || g[0] === "t") && isFinite(+g[1]) && +g[1] > 0
    ? [g[0], clamp(+g[1], 0.01, g[0] === "d" ? 500 : 86400)]
    : null;
}
function nWatch(wp) {
  if (!wp || typeof wp !== "object" || !Array.isArray(wp.blocks) || !wp.blocks.length) return undefined;
  const blocks = [];
  for (const b of wp.blocks.slice(0, 50)) {
    if (!b || !Array.isArray(b.steps) || !b.steps.length) return undefined;
    const steps = [];
    for (const x of b.steps.slice(0, 20)) {
      const g = x && nGoal(x.g);
      if (!g) return undefined;
      steps.push({ p: x.p === "recovery" ? "recovery" : "work", g, pace: PACES.includes(x.pace) ? x.pace : null });
    }
    blocks.push({ n: Math.round(nNum(b.n, 1, 50, 1)), steps });
  }
  const out = { blocks };
  const wu = nGoal(wp.wu),
    cd = nGoal(wp.cd);
  if (wu) out.wu = wu;
  if (cd) out.cd = cd;
  return out;
}
export function normalizeSaved(p) {
  if (
    !p ||
    typeof p !== "object" ||
    !p.inputs ||
    typeof p.inputs !== "object" ||
    !Array.isArray(p.types) ||
    !p.plan ||
    !Array.isArray(p.plan.weeks)
  )
    return null;
  const d = DEFAULT_INPUTS(),
    I = p.inputs;
  const opt = (v, a, b) => (v === "" ? "" : nNum(v, a, b, ""));
  const inputs = {
    ...d,
    goal: I.goal === "fitness" ? "fitness" : "race",
    startDate: nIso(I.startDate, d.startDate),
    dist: DISTS.some((x) => x.k === I.dist) ? I.dist : d.dist,
    customKm: nNum(I.customKm, 3, 100, d.customKm),
    raceDate: nIso(I.raceDate, d.raceDate),
    weeks: Math.round(nNum(I.weeks, 3, 30, d.weeks)),
    curVol: opt(I.curVol, 0, 200),
    curLong: opt(I.curLong, 0, 45),
    recDist: ["0", "5", "10", "21.0975", "42.195"].includes(String(I.recDist)) ? String(I.recDist) : "0",
    recTime: nStr(I.recTime, 12),
    level: levelOf(I),
    recWeeks: recWeeksOf({ goal: "race", recWeeks: I.recWeeks }),
    runs: Math.round(nNum(I.runs, 0, 7, 0)),
    days: Array.isArray(I.days)
      ? [...new Set(I.days.map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x < 7))].sort((a, b) => a - b)
      : [],
    longDay: Math.round(nNum(I.longDay, -1, 6, -1)),
    race: null,
  };
  if (I.race && typeof I.race === "object" && nStr(I.race.name, 200).trim())
    inputs.race = {
      name: nStr(I.race.name, 200).trim(),
      city: nStr(I.race.city, 200).trim(),
      url: safeUrl(I.race.url),
    };
  const seenT = new Set(),
    types = [];
  for (const x of p.types) {
    if (!x || typeof x !== "object") continue;
    let id = nId(x.id);
    if (!id || seenT.has(id)) id = "c" + uid();
    seenT.add(id);
    const kind = ["easy", "recovery", "hard", "long"].includes(x.kind) ? x.kind : "hard";
    const ph = Array.isArray(x.phases) ? PHASES.filter((q) => x.phases.includes(q)) : [];
    types.push({
      id,
      name: nStr(x.name, 80).trim() || t("ty_custom"),
      kind,
      on: id === "easy" || !!x.on,
      ...(x.locked ? { locked: true } : {}),
      phases: ph.length ? ph : PHASES.slice(),
      tpl: nStr(x.tpl, 2000),
    });
  }
  for (const def of DEFAULT_TYPES())
    if ((def.id === "easy" || def.id === "long") && !seenT.has(def.id))
      types.unshift({ ...def, on: def.id === "easy" });
  const weeks = [],
    seenS = new Set();
  for (const w of p.plan.weeks.slice(0, 30)) {
    if (!w || typeof w !== "object") return null;
    const start = nIso(w.start, weeks.length ? iso(addDays(parseISO(weeks[weeks.length - 1].start), 7)) : null);
    if (!start) return null;
    const sessions = [];
    for (const s of Array.isArray(w.sessions) ? w.sessions.slice(0, 14) : []) {
      const day = +(s && s.day);
      if (!Number.isInteger(day) || day < 0 || day > 6) continue;
      let id = nId(s.id);
      if (!id || seenS.has(id)) id = uid();
      seenS.add(id);
      const typeId = s.typeId === "race" ? "race" : nId(s.typeId) || "easy";
      const watch = nWatch(s.watch);
      sessions.push({
        id,
        day,
        typeId,
        name: nStr(s.name, 80) || t("ty_easy"),
        kind: KINDS.includes(s.kind) ? s.kind : "easy",
        km: Math.round(nNum(s.km, 0, 500, 0) * 100) / 100,
        desc: nStr(s.desc, 4000),
        note: nStr(s.note, 4000),
        ...(watch ? { watch } : {}),
      });
    }
    sessions.sort((a, b) => a.day - b.day);
    weeks.push({
      n: weeks.length + 1,
      phase: WEEK_PHASES.includes(w.phase) ? w.phase : "base",
      cutback: !!w.cutback,
      start,
      target: Math.round(nNum(w.target, 0, 2000, 0)),
      note: nStr(w.note, 4000),
      sessions,
    });
  }
  if (!weeks.length) return null;
  const M = p.plan.meta && typeof p.plan.meta === "object" ? p.plan.meta : {};
  const vdot = nNum(M.vdot, 15, 90, null),
    raceSec = nNum(M.raceSec, 60, 86400, null);
  const meta = {
    noRace: inputs.goal === "fitness",
    D: distKm(inputs),
    c: ["5k", "10k", "hm", "m"].includes(M.c) ? M.c : cat(distKm(inputs)),
    taperN: Math.round(nNum(M.taperN, 0, 3, 0)),
    peakV: Math.round(nNum(M.peakV, 0, 2000, 0)),
    start: nIso(M.start, weeks[0].start),
    vdot,
    raceSec,
    racePace: vdot && raceSec ? nStr(M.racePace, 16) : null,
  };
  return {
    name: nStr(p.name, 120).trim() || t("trainingBlock"),
    inputs,
    types,
    plan: { weeks, meta },
    edited: !!p.edited,
    updatedAt: nNum(p.updatedAt, 0, 8.64e15, 0),
  };
}
