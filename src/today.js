// @ts-check
/* The Today card: today's run, its pace chips, heat advice and Send (BB-76). */

import { paces, fmtPace, dow, parseISO, addDays, watchPlan } from "./engine-api.js";
import { S } from "./state.js";
import { WX, wxFind } from "./weather.js";
import { htmlJoin, html, esc, setHtml } from "./html.js";
import { cap, t, fmtDay, fmtDate, phaseLbl } from "./i18n.js";
import { sesAmt, workoutBar, inTime, estDur } from "./workout.js";
import { phaseText } from "./plan-view.js";
import { $ } from "./dom.js";
import { DEVICES, getDevice, paceLbl } from "./watch.js";
import { sessionDate } from "./exports.js";
import { effColor, sesEffort, effText } from "./effort.js";

/* paces used by today's run(s), hard ones first; heat slows easy, tempo and marathon pace */
let TD = { keys: [], eff: {}, hard: false };
const HEAT_KEYS = new Set(["easy", "tempo", "mp"]);
function paceChips() {
  const P = paces(S.inputs),
    add = WX.heat ? WX.heat.add : 0;
  return htmlJoin(
    TD.keys.map((k) => {
      const e = TD.eff[k] || "easy";
      const val = P.vdot
        ? add && HEAT_KEYS.has(k)
          ? html`<b>${fmtPace(P.sec[k] + add).replace("/km", "")}</b>/km <s>${P.txt[k].replace("/km", "")}</s>`
          : html`<b>${P.txt[k].replace("/km", "")}</b>/km`
        : html`<b>${esc(P.txt[k])}</b>`;
      return html`<span class="pc" data-k="${k}" style="--c:${effColor(e)}">${esc(cap(paceLbl(k)))} ${val}</span>`;
    }),
  );
}
export function applyHeat() {
  const pe = document.getElementById("tdPaces"),
    he = document.getElementById("tdHeat");
  if (pe) setHtml(pe, paceChips());
  if (he) {
    const h = WX.heat;
    setHtml(
      he,
      h && (TD.keys.length || TD.hard)
        ? html`${t("tdHeat", { v: h.feels, s: h.add })}${TD.hard ? t("tdHeatHard") : ""}`
        : "",
    );
  }
}
export function sendLbl(name) {
  const d = DEVICES.find((x) => x.k === getDevice()) || DEVICES[0];
  const b = d.k === "other" ? t("sendWatch") : t("sendTo", { dev: d.name() });
  return name ? `${b} · ${name}` : b;
}
export function renderToday() {
  TD = { keys: [], eff: {}, hard: false };
  const P = S.plan;
  if (!P || !P.weeks.length) return "";
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const td = dow(today);
  const st0 = parseISO(P.weeks[0].start),
    end = addDays(st0, 7 * P.weeks.length - 1);
  const wi = P.weeks.findIndex((w) => {
    const st = parseISO(w.start);
    return today >= st && today < addDays(st, 7);
  });
  const whenOf = (w, s) => fmtDay(sessionDate(w, s));
  const nextAfter = (wi0, d0) => {
    for (let i = Math.max(wi0, 0); i < P.weeks.length; i++) {
      const ss = P.weeks[i].sessions.filter((s) => i > wi0 || s.day > d0).sort((a, b) => a.day - b.day);
      if (ss.length) return { w: P.weeks[i], s: ss[0] };
    }
    return null;
  };
  let eb = [html`<b>${t("tdToday")}</b><span>${cap(fmtDay(today))}</span>`],
    body,
    cta = html``;
  if (today < st0) {
    const n = nextAfter(0, -1);
    body = html`<div class="rest"><b>${t("tdBefore", { d: fmtDate(st0) })}</b>${n ? html`<p class="tnext">${t("tdBeforeT", { when: whenOf(n.w, n.s), name: esc(n.s.name.toLowerCase()), amt: sesAmt(n.s) })}</p>` : ""}</div>`;
  } else if (wi < 0 || today > end) {
    body = html`<div class="rest"><b>${t("tdDone")}</b><p>${t("tdDoneT", { d: fmtDate(end) })}</p></div>`;
  } else {
    const w = P.weeks[wi];
    eb.push(
      html`<span style="color:${phaseText(w.phase)}">${t("tdWeek", { n: w.n, phase: phaseLbl(w.phase) })}</span>`,
    );
    const ss = w.sessions.filter((s) => s.day === td);
    if (ss.length) {
      const Pc = paces(S.inputs);
      const hard = [],
        easy = [];
      body = htmlJoin(
        ss.map((s) => {
          const e = sesEffort(s),
            wp = s.watch || watchPlan(s.kind, s.km),
            wb = workoutBar(wp, e, Pc);
          for (const g of wb.segs) {
            if (g.role === "main" && (g.e === "hard" || g.e === "race")) TD.hard = true;
          }
          for (const g of wb.segs)
            if (g.pace && !TD.eff[g.pace]) {
              TD.eff[g.pace] = g.e;
              (g.pace === "easy" ? easy : hard).push(g.pace);
            }
          return html`<div class="tses" style="--k:${effColor(e)};--kt:${effText(e)}"><div class="tn"><b>${esc(s.name)}</b></div>
      <div class="tbig">${inTime(s) ? html`<b>${t("tdEst", { d: estDur(wb.sec) })}</b><span>${esc(s.km)} km</span>` : html`<b>${esc(s.km)}<small> km</small></b><span>${t("tdEst", { d: estDur(wb.sec) })}</span>`}</div>${wb.html}${s.desc ? html`<p>${esc(s.desc)}</p>` : ""}</div>`;
        }),
      );
      TD.keys = [...hard, ...easy];
      cta = html`<div class="tcta">${htmlJoin(ss.map((s) => html`<button type="button" class="btn primary" data-act="twatch" data-w="${wi}" data-s="${s.id}" data-n="${ss.length > 1 ? esc(s.name) : ""}">${esc(sendLbl(ss.length > 1 ? s.name : ""))}</button><button type="button" class="btn" data-act="tedit" data-w="${wi}" data-s="${s.id}">${t("tdEdit")}${ss.length > 1 ? html`<span class="sr"> ${esc(s.name)}</span>` : ""}</button>`))}</div>`;
    } else {
      const n = nextAfter(wi, td);
      body = html`<div class="rest"><b>${t("tdRest")}</b><p>${t("tdRestT")}</p></div>${n ? html`<p class="tnext">${t("tdNext", { when: whenOf(n.w, n.s), name: esc(n.s.name.toLowerCase()), amt: sesAmt(n.s) })}</p>` : ""}<p class="tnext"><button type="button" class="linkbtn" data-act="quick" data-type="easy">${t("qwAnyway")}</button></p>`;
    }
  }
  return html`<section class="today" aria-label="${esc(t("tdToday"))}"><div class="tmain"><div class="eyebrow">${eb}</div>${body}</div><div class="tside"><div><div class="tpaces" id="tdPaces"></div><div class="theat" id="tdHeat" role="note"></div><div class="wxp" id="wx" aria-live="polite"></div></div>${cta}</div></section>`;
}
export function initToday() {
  $("#plan").addEventListener("submit", (e) => {
    if (e.target.id !== "wxForm") return;
    e.preventDefault();
    const q = $("#wxQ");
    if (q) wxFind(q.value);
  });
}
