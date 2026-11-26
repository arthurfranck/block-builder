// @ts-check
/* A workout's shape: watchPlan() steps with time and effort colour, its amount in km or minutes (BB-76). */

import { t } from "./i18n.js";
import { watchPlan, paces } from "./engine-api.js";
import { RUN_UNIT } from "./prefs.js";
import { S } from "./state.js";
import { htmlJoin, html, esc } from "./html.js";
import { gTxt, paceLbl, watchSummary } from "./watch.js";
import { sesEffort, effColor } from "./effort.js";

const PACE_EFF = { interval: "hard", rep: "hard", tempo: "tempo", mp: "tempo" };
export function stepEffort(x, sesE) {
  if (x.p === "recovery") return "recovery";
  if (PACE_EFF[x.pace]) return PACE_EFF[x.pace];
  if (x.pace === "race") return sesE === "race" ? "race" : "tempo";
  if (x.pace === "easy") return sesE === "long" ? "long" : "easy";
  return sesE === "easy" || sesE === "long" ? "hard" : sesE;
}
/* seconds per km for a step: its pace, else a jog for recoveries, else by effort */
export function stepSecKm(x, e, P) {
  return x.pace
    ? P.sec[x.pace]
    : e === "recovery"
      ? P.sec.easy * 1.1
      : e === "hard"
        ? P.sec.interval
        : e === "tempo"
          ? P.sec.tempo
          : P.sec.easy;
}
function workoutSegs(wp, sesE, P) {
  const segs = [];
  const add = (x, e, role) => {
    const spk = stepSecKm(x, e, P);
    const sec = x.g[0] === "t" ? x.g[1] : x.g[1] * spk;
    const km = x.g[0] === "d" ? x.g[1] : sec / spk;
    segs.push({ e, sec, km, role, pace: x.pace || null });
  };
  if (wp.wu) add({ p: "work", g: wp.wu, pace: "easy" }, "easy", "wu");
  for (const b of wp.blocks)
    for (let r = 0; r < Math.max(1, b.n); r++)
      for (const x of b.steps) add(x, stepEffort(x, sesE), x.p === "recovery" ? "rec" : "main");
  if (wp.cd) add({ p: "work", g: wp.cd, pace: "easy" }, "easy", "cd");
  return segs;
}
export function estDur(sec) {
  const m = Math.max(1, Math.round(sec / 60));
  if (m < 60) return t("durMin", { m });
  const r = Math.round(m / 5) * 5;
  return t("durHM", { h: Math.floor(r / 60), m: String(r % 60).padStart(2, "0") });
}
/* a run's length for display (BB-54): its km, or its estimated time from its watch steps at the plan's paces, as on the Today card */
export const sesWp = (s) => s.watch || watchPlan(s.kind, s.km);
/* races stay in km (the finish line is a distance); a 0 km run with no steps has no time */
export const inTime = (s) => RUN_UNIT === "t" && s.kind !== "race" && (s.km > 0 || !!s.watch);
export function sesSec(s, P) {
  if (!(s.km > 0) && !s.watch) return 0;
  return workoutSegs(sesWp(s), sesEffort(s), P || paces(S.inputs)).reduce((a, g) => a + g.sec, 0);
}
export function sesAmt(s, P) {
  return inTime(s) ? estDur(sesSec(s, P)) : `${s.km} km`;
}
/* the main set in words ("<b>5 × 1 km</b> · 2 min jog"): Today bar labels and quick workout sizes */
export function mainSetHtml(wp) {
  return htmlJoin(
    wp.blocks.map((b) => {
      const w = b.steps.find((x) => x.p !== "recovery") || b.steps[0],
        rec = b.steps.find((x) => x.p === "recovery");
      if (b.n > 1) return html`<b>${b.n} × ${gTxt(w.g)}</b>${rec ? ` · ${gTxt(rec.g)} ${t("tdJog")}` : ""}`;
      return htmlJoin(
        b.steps.map((x) => html`<b>${gTxt(x.g)}</b>${x.pace ? " " + paceLbl(x.pace) : ""}`),
        " + ",
      );
    }),
    " + ",
  );
}
export function workoutBar(wp, sesE, P) {
  const segs = workoutSegs(wp, sesE, P);
  const bar = html`<div class="wbar" role="img" aria-label="${esc(watchSummary(wp, P))}">${htmlJoin(segs.map((g) => html`<i class="${g.role === "rec" ? "rec" : ""}" style="flex:${Math.max(1, Math.round(g.sec))} 1 0;background:${effColor(g.e)}"></i>`))}</div>`;
  const main = mainSetHtml(wp);
  const lbl = html`<div class="wbarlbl">${wp.wu ? html`<span><b>${gTxt(wp.wu)}</b> ${t("warmup").toLowerCase()}</span>` : ""}<span>${main}</span>${wp.cd ? html`<span><b>${gTxt(wp.cd)}</b> ${t("cooldown").toLowerCase()}</span>` : ""}</div>`;
  return { html: html`<div>${bar}${lbl}</div>`, sec: segs.reduce((a, g) => a + g.sec, 0), segs };
}
