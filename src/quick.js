// @ts-check
/* Quick workout (BB-58): one workout from the run types, sent to a watch, with or without a plan (BB-76). */

import {
  paces,
  missingSetup,
  TYPE_DEFS,
  durSec,
  kmIn,
  watchPlan,
  clamp,
  workFor,
  fmtPace,
  parseISO,
  addDays,
  iso,
  uid,
  dow,
  raceTimeSec,
} from "./engine-api.js";
import { S } from "./state.js";
import { LOC, t, cap } from "./i18n.js";
import { stepSecKm, stepEffort, workoutBar, mainSetHtml, estDur } from "./workout.js";
import { html, esc, htmlJoin, setHtml } from "./html.js";
import { $$ } from "./dom.js";
import { sendLbl } from "./today.js";
import { touched } from "./plan-edit.js";
import { modal, closeModal } from "./modal.js";
import { whyOf, whyHtml } from "./editor.js";
import { getDevice, DEVICES, setDevice, exportWorkouts, watchSummary, hasPace, gTxt, slug } from "./watch.js";
import { effort, effColor, effText } from "./effort.js";

const QW_EASY = {
  easy: { km: 8, min: 45 },
  recovery: { km: 5, min: 30 },
  long: { km: 16, min: 90 },
  strides: { km: 6, min: 35 },
  progression: { km: 10, min: 55 },
};
const QW_QUALITY = ["tempo", "intervals", "hills", "fartlek", "racepace"];
const QW_SIZES = { s: 0.15, m: 0.5, l: 0.85 };
const QW_RACES = [
  ["5k", 5],
  ["10k", 10],
  ["hm", 21.0975],
  ["m", 42.195],
];
const QW = {};
/* paces for quick workouts: the plan's recent race when it has one, else the sheet's own (bb-quick-paces, never written into a plan) */
function qwLoadPaces() {
  try {
    const v = JSON.parse(localStorage.getItem("bb-quick-paces") || "null");
    return v && typeof v === "object"
      ? { recDist: String(v.recDist || "0"), recTime: String(v.recTime || "") }
      : { recDist: "0", recTime: "" };
  } catch (_) {
    return { recDist: "0", recTime: "" };
  }
}
function qwSavePaces(v) {
  try {
    localStorage.setItem("bb-quick-paces", JSON.stringify(v));
  } catch (_) {}
}
const planHasPaces = () => !!paces(S.inputs).vdot && !missingSetup(S.inputs).length;
function qwPaces(Q) {
  const src = planHasPaces() ? S.inputs : qwLoadPaces();
  return paces({ dist: Q.race || "10k", customKm: 10, recDist: src.recDist, recTime: src.recTime });
}
/* recent quick workouts (bb-quick-recent): the last 5 sent, newest first */
const QW_KEYS = ["type", "size", "race", "unit", "amt", "wucd", "ft"];
function qwLoadRecent() {
  try {
    const v = JSON.parse(localStorage.getItem("bb-quick-recent") || "[]");
    return Array.isArray(v)
      ? v.filter((x) => x && typeof x === "object" && TYPE_DEFS.some((d) => d[0] === x.type)).slice(0, 5)
      : [];
  } catch (_) {
    return [];
  }
}
function qwPushRecent(Q) {
  const c = {};
  for (const k of QW_KEYS) c[k] = Q[k] ?? null;
  const key = JSON.stringify(c);
  const list = [
    c,
    ...qwLoadRecent().filter((x) => JSON.stringify(Object.fromEntries(QW_KEYS.map((k) => [k, x[k] ?? null]))) !== key),
  ].slice(0, 5);
  try {
    localStorage.setItem("bb-quick-recent", JSON.stringify(list));
  } catch (_) {}
}
function qwRecentLbl(c) {
  const name = qwTypeName(c.type);
  if (QW_EASY[c.type]) return `${name} · ${(+c.amt).toLocaleString(LOC())} ${c.unit === "t" ? "min" : "km"}`;
  return `${name} · ${t("qwSize_" + (c.size || "m"))} · ${cap(t("l" + (c.race || "10k")))}${c.ft ? " · " + t("qwFtShort") : ""}`;
}
/* the repeated (or only) main set of a quality workout, the one fine-tune changes */
function qwMainIdx(wp) {
  const i = wp.blocks.findIndex((b) => b.n > 1);
  return i < 0 ? 0 : i;
}
/* "4:30" -> 270 s/km; 2:30 to 10:00 */
function parsePace(v) {
  const m = /^\s*(\d{1,2})[:.,](\d{2})\s*$/.exec(String(v || ""));
  if (!m || +m[2] > 59) return null;
  const s = +m[1] * 60 + +m[2];
  return s >= 150 && s <= 600 ? s : null;
}
function qwLoadUnit() {
  try {
    return localStorage.getItem("bb-quick-unit") === "t" ? "t" : "d";
  } catch (_) {
    return "d";
  }
}
/* clean values when switching Distance <-> Time: 5 s under 1 min, 15 s under 2, 30 s under 10, then whole minutes; 50 m under 1 km, 0.1 km to 5 km, then 0.5 km */
function roundSec(x) {
  const st = x < 60 ? 5 : x < 120 ? 15 : x < 600 ? 30 : 60;
  return Math.max(st, Math.round(x / st) * st);
}
function roundKm(x) {
  const st = x < 1 ? 0.05 : x < 5 ? 0.1 : 0.5;
  return Math.max(0.05, +(Math.round(x / st) * st).toFixed(2));
}
/* wucdByPace (BB-54, plan runs): convert warm-up and cool-down at easy pace instead of the quick workout's defaults (10 min, 2 km) */
export function wpInUnit(wp, unit, eff, P, wucdByPace) {
  const conv = (x, e) => {
    if (x.p === "recovery") return x; /* jog recoveries stay in time, whatever the unit */
    const spk = stepSecKm(x, e, P);
    if (unit === "t" && x.g[0] === "d") return { ...x, g: ["t", roundSec(durSec(x.g[1], spk))] };
    if (unit === "d" && x.g[0] === "t") return { ...x, g: ["d", roundKm(kmIn(x.g[1], spk))] };
    return x;
  };
  const out = { blocks: wp.blocks.map((b) => ({ n: b.n, steps: b.steps.map((x) => conv(x, stepEffort(x, eff))) })) };
  const wc = (g) =>
    wucdByPace
      ? conv({ p: "work", g, pace: "easy" }, "easy").g
      : unit === "t"
        ? g[0] === "t"
          ? g
          : ["t", 600]
        : g[0] === "d"
          ? g
          : ["d", 2];
  if (wp.wu) out.wu = wc(wp.wu);
  if (wp.cd) out.cd = wc(wp.cd);
  return out;
}
function qwTypeName(id) {
  const ty = (S.types || []).find((x) => x.id === id);
  return ty && ty.name ? ty.name : t("ty_" + id);
}
function qwBuild(Q) {
  const P = qwPaces(Q);
  const def = TYPE_DEFS.find((d) => d[0] === Q.type);
  const kind = def ? def[1] : "easy",
    eff = effort(Q.type, kind);
  let wp;
  if (QW_EASY[Q.type]) {
    const spk = Q.type === "recovery" ? P.sec.easy * 1.1 : P.sec.easy;
    const km = Q.unit === "t" ? kmIn(Q.amt * 60, spk) : Q.amt;
    if (Q.type === "strides") wp = watchPlan("easy", km, { strides: 6 });
    else if (Q.type === "progression") {
      const x = clamp(Math.round(km * 0.3), 1, 5);
      wp = watchPlan("hard", km, { fast: x, fastPace: "tempo" });
    } else wp = watchPlan(kind, km);
    if (Q.unit === "t") {
      const b = wp.blocks[0];
      if (b.n === 1 && b.steps.length === 1) b.steps[0] = { ...b.steps[0], g: ["t", Q.amt * 60] };
    }
  } else {
    const rk = QW_RACES.find((r) => r[0] === Q.race) || QW_RACES[1];
    const w = workFor({ id: Q.type }, { p: QW_SIZES[Q.size], D: rk[1], c: rk[0], taper: false, P, phase: "build" });
    wp = watchPlan("hard", (w.wucd || 0) + (w.km || 0), w);
    if (!Q.wucd) {
      delete wp.wu;
      delete wp.cd;
    }
  }
  wp = wpInUnit(wp, Q.unit, eff, P);
  /* fine-tune: reps, rep length and recovery on the main set (found before tuning, so 1 rep stays tunable), and a typed target pace */
  const mi = qwMainIdx(wp),
    repeated = wp.blocks[mi].n > 1;
  let Pq = P;
  if (Q.ft && !QW_EASY[Q.type]) {
    const b = wp.blocks[mi],
      w = b.steps.find((x) => x.p !== "recovery"),
      r = b.steps.find((x) => x.p === "recovery");
    if (repeated && Q.ft.n) b.n = Q.ft.n;
    if (w && Q.ft.rep) w.g = [w.g[0], Q.ft.rep];
    if (r && Q.ft.rec) r.g = [r.g[0], Q.ft.rec];
    if (w && Q.ft.pace) {
      w.pace = "custom";
      Pq = {
        ...P,
        sec: { ...P.sec, custom: Q.ft.pace },
        txt: { ...P.txt, custom: fmtPace(Q.ft.pace) },
        fixed: { custom: true },
      };
    }
  }
  const bar = workoutBar(wp, eff, Pq);
  const km = bar.segs.reduce((a, g) => a + g.km, 0);
  return { wp, eff, P: Pq, name: qwTypeName(Q.type), bar, km, main: mainSetHtml(wp), mi, repeated };
}
export function openQuick(type) {
  const unit = qwLoadUnit();
  Object.assign(QW, {
    type: type || QW.type || "tempo",
    size: QW.size || "m",
    unit,
    wucd: QW.wucd !== false,
    dev: getDevice(),
    ft: null,
    ftOpen: false,
    add: false,
    addDate: qwDefaultDate(),
    race:
      QW.race || (S.inputs.goal !== "fitness" && QW_RACES.some((r) => r[0] === S.inputs.dist) ? S.inputs.dist : "10k"),
  });
  qwSetAmt();
  modal(html`<h2>${t("qwTitle")}</h2><div class="qw" id="qwBody"></div>`, (m) => {
    m.addEventListener("click", (e) => {
      const b = e.target.closest("[data-qk]");
      if (!b) return;
      const [k, v] = b.dataset.qk.split(":");
      if (["type", "unit", "size", "race"].includes(k)) QW.paceErr = false;
      if (k === "type") {
        QW.type = v;
        QW.ft = null;
        qwSetAmt();
      } else if (k === "unit") {
        if (QW.unit !== v) {
          QW.unit = v;
          QW.ft = null;
          try {
            localStorage.setItem("bb-quick-unit", v);
          } catch (_) {}
          qwSetAmt();
        }
      } else if (k === "size") {
        QW.size = v;
        QW.ft = null;
      } else if (k === "race") {
        QW.race = v;
        QW.ft = null;
      } else if (k === "recent") {
        const c = qwLoadRecent()[+v];
        if (c) {
          for (const kk of QW_KEYS) QW[kk] = c[kk] ?? QW[kk];
          QW.ft = c.ft || null;
          QW.ftOpen = !!c.ft;
        }
      } else if (k === "ftreset") {
        QW.ft = null;
        QW.paceErr = false;
      } else if (k === "ft") {
        const [f, dir] = v.split(",");
        const R = qwBuild(QW),
          b = R.wp.blocks[R.mi],
          w = b.steps.find((x) => x.p !== "recovery"),
          r = b.steps.find((x) => x.p === "recovery");
        const ft = QW.ft || { n: b.n, rep: w.g[1], rec: r ? r.g[1] : null },
          sg = dir === "+" ? 1 : -1;
        if (f === "n") ft.n = clamp(ft.n + sg, 1, 30);
        else if (f === "rep")
          ft.rep = w.g[0] === "t" ? Math.max(10, ft.rep + 15 * sg) : Math.max(0.05, +(ft.rep + 0.1 * sg).toFixed(2));
        else if (f === "rec" && r)
          ft.rec = r.g[0] === "t" ? Math.max(10, ft.rec + 15 * sg) : Math.max(0.05, +(ft.rec + 0.05 * sg).toFixed(2));
        QW.ft = ft;
      } else if (k === "dev") QW.dev = v;
      else if (k === "amt") {
        const st = QW.unit === "t" ? 5 : 0.5,
          lo = QW.unit === "t" ? 10 : 2,
          hi = QW.unit === "t" ? 240 : 42;
        QW.amt = clamp(+(QW.amt + (v === "+" ? st : -st)).toFixed(1), lo, hi);
      } else if (k === "cancel") {
        closeModal();
        return;
      } else if (k === "send") {
        qwSend();
        return;
      }
      qwRender(m, b.dataset.qk);
    });
    m.addEventListener("change", (e) => {
      const id = e.target.id;
      if (id === "qwWucd") {
        QW.wucd = e.target.checked;
        qwRender(m, "wucd");
      } else if (id === "qwPace") {
        const v = e.target.value.trim(),
          sec = parsePace(v);
        if (!v) {
          if (QW.ft) delete QW.ft.pace;
          QW.paceErr = false;
        } else if (sec == null) QW.paceErr = true;
        else {
          const R = qwBuild(QW),
            b = R.wp.blocks[R.mi],
            w = b.steps.find((x) => x.p !== "recovery"),
            r = b.steps.find((x) => x.p === "recovery");
          QW.ft = QW.ft || { n: b.n, rep: w.g[1], rec: r ? r.g[1] : null };
          QW.ft.pace = sec;
          QW.paceErr = false;
        }
        qwRender(m, "qwPace");
      } else if (id === "qwAdd") {
        QW.add = e.target.checked;
        qwRender(m, "qwAdd");
      } else if (id === "qwAddDate") {
        if (e.target.value) QW.addDate = e.target.value;
      } else if (id === "qwRecDist" || id === "qwRecTime") {
        qwSavePaces({
          recDist: m.querySelector("#qwRecDist").value,
          recTime: m.querySelector("#qwRecTime").value.trim(),
        });
        qwRender(m, id);
      }
    });
    m.addEventListener(
      "toggle",
      (e) => {
        if (e.target.id === "qwFt") QW.ftOpen = e.target.open;
      },
      true,
    );
    qwRender(m);
  });
}
/* add to plan (BB-58 step 4): off by default; the run then counts in the plan's +10% and spacing checks like any hand edit */
const qwPlanOpen = () => !!(S.plan && S.plan.weeks.length && !missingSetup(S.inputs).length);
function qwPlanRange() {
  const st = parseISO(S.plan.weeks[0].start);
  return [st, addDays(st, 7 * S.plan.weeks.length - 1)];
}
function qwDefaultDate() {
  if (!qwPlanOpen()) return "";
  const [a, b] = qwPlanRange(),
    d = new Date();
  d.setHours(12, 0, 0, 0);
  return iso(d < a ? a : d > b ? b : d);
}
function qwAddToPlan(R, dateIso) {
  const [st] = qwPlanRange(),
    d = parseISO(dateIso),
    wi = Math.floor(Math.round((d - st) / 864e5) / 7),
    w = S.plan.weeks[wi];
  if (!w) return false;
  const def = TYPE_DEFS.find((x) => x[0] === QW.type) || ["easy", "easy"];
  const s = {
    id: uid(),
    day: dow(d),
    typeId: QW.type,
    name: R.name,
    kind: def[1],
    km: Math.round(R.km * 2) / 2,
    desc: watchSummary(R.wp, R.P),
    note: "",
    watch: JSON.parse(JSON.stringify(R.wp)),
  };
  w.sessions.push(s);
  w.sessions.sort((a, b) => a.day - b.day);
  touched();
  return true;
}
function qwSetAmt() {
  const d = QW_EASY[QW.type];
  if (d) QW.amt = QW.unit === "t" ? d.min : d.km;
}
function qwRender(m, focusKey) {
  const Q = QW,
    R = qwBuild(Q),
    body = m.querySelector("#qwBody");
  const radio = (k, v, on, label, cls = "") =>
    html`<button type="button" role="radio" class="${cls}" aria-checked="${on}" data-qk="${k}:${v}">${label}</button>`;
  const typeBtn = (id) => {
    const def = TYPE_DEFS.find((d) => d[0] === id);
    return radio(
      "type",
      id,
      Q.type === id,
      html`<span class="kind-dot" style="background:${effColor(effort(id, def[1]))}" aria-hidden="true"></span>${esc(qwTypeName(id))}`,
      "qt",
    );
  };
  const easyIds = Object.keys(QW_EASY).filter((id) => id !== "progression"),
    qIds = [...QW_QUALITY, "progression"];
  let shape;
  if (QW_EASY[Q.type]) {
    const u = Q.unit === "t" ? "min" : "km";
    shape = html`<div class="qrow"><span class="lbl" id="qwAmtL">${t(Q.unit === "t" ? "qwDur" : "qwDist")}</span>
    <div class="qstep" role="group" aria-labelledby="qwAmtL"><button type="button" class="btn" data-qk="amt:-" aria-label="${esc(t("qwLess"))}">−</button><output aria-live="polite">${Q.amt.toLocaleString(LOC())} ${u}</output><button type="button" class="btn" data-qk="amt:+" aria-label="${esc(t("qwMore"))}">+</button></div></div>`;
  } else {
    const sizes = htmlJoin(
      Object.keys(QW_SIZES).map((k) => {
        const r = qwBuild({ ...Q, size: k });
        return radio(
          "size",
          k,
          Q.size === k,
          html`<b>${t("qwSize_" + k)}</b><span>${String(r.main).replace(/<\/?b>/g, "")}</span>`,
          "qsz",
        );
      }),
    );
    shape = html`<div class="qrow"><span class="lbl" id="qwSizeL">${t("qwSize")}</span><div class="qsizes" role="radiogroup" aria-labelledby="qwSizeL">${sizes}</div></div>
    <div class="qrow"><span class="lbl" id="qwRaceL">${t("qwRace")}</span><div class="seg" role="radiogroup" aria-labelledby="qwRaceL">${htmlJoin(QW_RACES.map(([k]) => radio("race", k, Q.race === k, esc(cap(t("l" + k))))))}</div></div>
    <label class="qcheck"><input type="checkbox" id="qwWucd" ${Q.wucd ? "checked" : ""}> ${t("qwWucd")}</label>`;
    const b = R.wp.blocks[R.mi],
      w = b.steps.find((x) => x.p !== "recovery"),
      r = b.steps.find((x) => x.p === "recovery");
    const stepper = (f, lbl, val) =>
      html`<div class="qft"><span id="qwFt_${f}">${lbl}</span><div class="qstep" role="group" aria-labelledby="qwFt_${f}"><button type="button" class="btn" data-qk="ft:${f},-" aria-label="${esc(t("qwLess") + " · " + lbl)}">−</button><output aria-live="polite">${val}</output><button type="button" class="btn" data-qk="ft:${f},+" aria-label="${esc(t("qwMore") + " · " + lbl)}">+</button></div></div>`;
    const isT = w.g[0] === "t";
    const paceVal =
      Q.ft && Q.ft.pace
        ? fmtPace(Q.ft.pace).replace("/km", "")
        : w.pace && hasPace(R.P, w.pace)
          ? fmtPace(R.P.sec[w.pace]).replace("/km", "")
          : "";
    const icon = html`<svg class="qfi" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></g></svg>`;
    const chev = html`<svg class="chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    shape = html`${shape}${html`<details class="qfine" id="qwFt" ${Q.ftOpen ? "open" : ""}><summary>${icon}<span class="qfs"><b>${t("qwFt")}</b><small>${t("qwFtSub")}</small></span>${Q.ft ? html`<span class="qtag">${t("qwFtTag")}</span>` : ""}${chev}</summary><div class="qfts">
    ${R.repeated ? stepper("n", t("qwReps"), b.n) : ""}
    ${stepper("rep", t(isT ? "qwRepT" : "qwRepD"), gTxt(w.g))}
    ${r ? stepper("rec", t(r.g[0] === "t" ? "qwRecT" : "qwRecD"), gTxt(r.g)) : ""}
    <div class="qft"><label for="qwPace">${t("qwPace")}</label><span class="qpace"><input id="qwPace" inputmode="decimal" autocomplete="off" placeholder="4:30" value="${esc(paceVal)}" aria-describedby="qwPaceHint"> /km</span></div>
    <p class="hint" id="qwPaceHint">${Q.paceErr ? t("qwPaceBad") : t("qwPaceHint")}</p>
    ${Q.ft ? html`<button type="button" class="linkbtn" data-qk="ftreset:1">${t("qwFtReset")}</button>` : ""}</div></details>`}`;
  }
  let pacesLine;
  if (planHasPaces()) pacesLine = html`<p class="hint qpaces">${t("qwPacesPlan", { plan: esc(S.name) })}</p>`;
  else {
    const qp = qwLoadPaces(),
      bad = +qp.recDist > 0 && qp.recTime && raceTimeSec(qp.recTime, +qp.recDist) == null;
    const opts = [
      ["0", "none"],
      ["5", "l5k"],
      ["10", "l10k"],
      ["21.0975", "halfMarathon"],
      ["42.195", "marathon"],
    ];
    pacesLine = html`<div class="qrow"><span class="lbl">${t("qwPaces")}</span><div class="qpacef">
    <label>${t("recDist")}<select id="qwRecDist">${htmlJoin(opts.map(([v, k]) => html`<option value="${v}" ${qp.recDist === v ? "selected" : ""}>${esc(t(k))}</option>`))}</select></label>
    <label>${t("recTime")}<input id="qwRecTime" inputmode="numeric" placeholder="${esc(t("recTimePh"))}" value="${esc(qp.recTime)}"></label></div>
    <p class="hint qpaces">${bad ? t("qwPacesBad") : R.P.vdot ? t("qwPacesOwn") : t("qwPacesEffort")}</p></div>`;
  }
  const dev = DEVICES.find((d) => d.k === Q.dev) || DEVICES[0];
  const recent = qwLoadRecent();
  setHtml(
    body,
    html`
  ${recent.length ? html`<div class="qrow"><span class="lbl" id="qwRecL">${t("qwRecent")}</span><div class="qgrp" role="group" aria-labelledby="qwRecL">${htmlJoin(recent.map((c, i) => html`<button type="button" class="qt qrec" data-qk="recent:${i}">${esc(qwRecentLbl(c))}</button>`))}</div></div>` : ""}
  <div class="qrow"><span class="lbl" id="qwTypeL">${t("qwType")}</span><div class="qtypes" role="radiogroup" aria-labelledby="qwTypeL">
    <div class="qgrp"><span class="qglbl">${t("grpEasy")}</span>${htmlJoin(easyIds.map(typeBtn))}</div>
    <div class="qgrp"><span class="qglbl">${t("grpQuality")}</span>${htmlJoin(qIds.map(typeBtn))}</div></div>
    ${whyOf(Q.type) ? html`<p class="hint why" id="qwWhy">${whyHtml(Q.type)}</p>` : ""}</div>
  <div class="qrow"><span class="lbl" id="qwUnitL">${t("qwUnit")}</span><div class="seg" role="radiogroup" aria-labelledby="qwUnitL">${radio("unit", "d", Q.unit === "d", t("qwUnitD"))}${radio("unit", "t", Q.unit === "t", t("qwUnitT"))}</div></div>
  ${shape}
  ${pacesLine}
  ${
    qwPlanOpen()
      ? (() => {
          const [a, b] = qwPlanRange();
          return html`<div class="qrow"><label class="qcheck"><input type="checkbox" id="qwAdd" ${Q.add ? "checked" : ""}> ${t("qwAdd", { plan: esc(S.name) })}</label>
    ${Q.add ? html`<label class="qadd">${t("qwAddOn")} <input type="date" id="qwAddDate" min="${iso(a)}" max="${iso(b)}" value="${esc(Q.addDate)}"></label><p class="hint qpaces">${t("qwAddHint")}</p>` : ""}</div>`;
        })()
      : ""
  }
  <div class="qprev" style="--k:${effColor(R.eff)};--kt:${effText(R.eff)}">
    <div class="tses"><div class="tn"><b>${esc(R.name)}</b></div>
    <div class="tbig"><b id="qwKm">${(Math.round(R.km * 10) / 10).toLocaleString(LOC())}<small> km</small></b><span>${t("tdEst", { d: estDur(R.bar.sec) })}</span></div>${R.bar.html}
    <p id="qwSteps">${esc(watchSummary(R.wp, R.P))}</p></div>
    <div class="seg qdev" role="radiogroup" aria-label="${esc(t("device"))}">${htmlJoin(DEVICES.map((d) => radio("dev", d.k, Q.dev === d.k, esc(d.name()))))}</div>
    <div class="actions"><button type="button" class="btn" data-qk="cancel">${t("cancel")}</button><button type="button" class="btn primary" id="qwSend" data-qk="send">${esc(dev.k === "other" ? t("sendWatch") : t("sendTo", { dev: dev.name() }))}</button></div>
  </div>`,
  );
  if (focusKey) {
    const f =
      body.querySelector(`[data-qk="${focusKey}"]`) ||
      body.querySelector("#" + focusKey) ||
      (focusKey === "wucd" ? body.querySelector("#qwWucd") : null);
    f && f.focus();
  }
}
function qwSend() {
  const R = qwBuild(QW);
  const day = iso(new Date());
  const tag = QW_EASY[QW.type]
    ? `${String(QW.amt).replace(".", "-")}${QW.unit === "t" ? "min" : "km"}`
    : t("qwSize_" + QW.size).toLowerCase();
  const file = `quick-${day}-${slug(R.name)}-${slug(tag)}`;
  const title = `${R.name} · ${String(R.main).replace(/<\/?b>/g, "")}`;
  qwPushRecent(QW);
  if (QW.add && qwPlanOpen()) qwAddToPlan(R, QW.addDate);
  setDevice(QW.dev);
  $$('#plan .today [data-act="twatch"]').forEach((b) => (b.textContent = sendLbl(b.dataset.n || "")));
  closeModal();
  exportWorkouts(QW.dev, [{ title, fitTitle: title, file, wp: R.wp, paces: R.P }], file);
}
