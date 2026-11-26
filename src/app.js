// @ts-check
/* Block Builder app (BB-66): interface, storage, exports. Was the inline script in index.html.
   An ES module (ADR 0008, BB-86): esbuild bundles it with the engine into ../app.js, a classic script,
   so the built page still opens from disk (file://). Run `npm run build` after editing. */
import { html, esc, htmlJoin, setHtml, clearHtml } from "./html.js";
import {
  TYPE_DEFS,
  PHASES,
  iso,
  distLabel,
  nextMonday,
  DEFAULT_DAYS,
  uid,
  longOf,
  DISTS,
  recWeeksOf,
  levelOf,
  LEVELS,
  paces,
  parseISO,
  missingSetup,
  SETUP_STEP,
  addDays,
  badRaceTime,
  badTimeMsg,
  clamp,
  raceTimeSec,
  fmtDur,
  SETUP_FIELDS,
  warningItems,
  weekChecks,
  watchPlan,
  fmtPace,
  dow,
  durSec,
  kmIn,
  workFor,
  distKm,
  fill,
  cat,
  r05,
  WEEK_PHASES,
  BBEngine,
} from "./engine-api.js";
import { RUN_UNIT, useRunUnit } from "./prefs.js";
import { $, $$, cardDetails } from "./dom.js";
import { I18N } from "./strings.js";
import {
  DEFAULT_TYPES,
  t,
  DAYS,
  fmtDate,
  cap,
  DAYS1,
  fmtDay,
  kindLbl,
  phaseLbl,
  fmtShort,
  LANG,
  LOC,
  useLang,
  translateTypes,
} from "./i18n.js";
import {
  defaultName,
  regen,
  volIsSuggested,
  S,
  suggestVolume,
  DEFAULT_INPUTS,
  BLANK_INPUTS,
  BLANK_TYPES,
} from "./state.js";

const VERSION = "1.14.3";
$("#appVersion").textContent = "Block Builder v" + VERSION;
/* ---------- plan engine: engine.js (BB-7) ---------- */
BBEngine.setLocale({ t, days: () => DAYS, fmtDate });
function renderVolHint() {
  $("#volHint").hidden = !volIsSuggested();
}
/* BB-72: an empty longest run shows the estimate the plan uses */
function renderLongPh() {
  const I = S.inputs;
  /** @type {HTMLInputElement} */ ($("#curLong")).placeholder = +I.curVol > 0 ? "≈ " + longOf(I) : "";
}

/* ---------- setup UI ---------- */
function renderSetup() {
  const I = S.inputs;
  setHtml(
    $("#distSeg"),
    htmlJoin(
      DISTS.map(
        (d) => html`<button type="button" data-dist="${d.k}" aria-pressed="${I.dist === d.k}">${t("d" + d.k)}</button>`,
      ),
    ),
  );
  $("#customRow").hidden = I.dist !== "custom";
  $("#customKm").value = I.customKm;
  $("#raceDate").value = I.raceDate;
  $("#weeks").value = I.weeks;
  $("#startDate").value = I.startDate || nextMonday();
  const fit = I.goal === "fitness";
  $$("#goalSeg button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.goal === (fit ? "fitness" : "race"))),
  );
  $("#recWeeksF").hidden = fit;
  const rw = recWeeksOf({ ...I, goal: "race" });
  setHtml(
    $("#recSeg"),
    htmlJoin(
      [0, 1, 2].map(
        (n) => html`<button type="button" data-rec="${n}" aria-pressed="${rw === n}">${t("rec" + n)}</button>`,
      ),
    ),
  );
  $("#recHint").textContent = t(rw ? "recHint" : "recHint0");
  $("#raceDateF").hidden = fit;
  $("#startDateF").hidden = !fit;
  $("#raceBox").hidden = fit;
  $("#focusHint").hidden = !fit;
  $("#distLbl").textContent = t(fit ? "focusDist" : "distance");
  $("#secRaceH").textContent = t(fit ? "secFocus" : "secRace");
  setHtml($("#introCards"), [
    htmlJoin(
      [
        ["race", "goalRace", "icRace"],
        ["fitness", "goalFit", "icFit"],
      ].map(
        ([g, a, b]) =>
          html`<button type="button" class="icard" data-goal="${g}" aria-pressed="${(fit ? "fitness" : "race") === g}"><b>${t(a)}</b><span>${t(b)}</span></button>`,
      ),
    ),
    html`<button type="button" class="icard" data-intro="quick"><b>${t("qwOpen")}</b><span>${t("icQuick")}</span></button>`,
  ]);
  $("#focusHint").textContent = t("focusHint");
  $("#curVol").value = I.curVol;
  renderVolHint();
  $("#curLong").value = I.curLong;
  renderLongPh();
  $("#recDist").value = I.recDist;
  $("#recTime").value = I.recTime;
  const lv = levelOf(I);
  setHtml(
    $("#levelSeg"),
    htmlJoin(
      LEVELS.map(
        (l) => html`<button type="button" data-level="${l}" aria-pressed="${lv === l}">${t("lv_" + l)}</button>`,
      ),
    ),
  );
  $("#levelHint").textContent = t("lvHint_" + lv);
  setHtml(
    $("#runsSeg"),
    htmlJoin(
      [1, 2, 3, 4, 5, 6, 7].map(
        (n) => html`<button type="button" data-runs="${n}" aria-pressed="${+I.runs === n}">${n}</button>`,
      ),
    ),
  );
  setHtml(
    $("#daysSeg"),
    htmlJoin(
      DAYS1.map(
        (d, i) =>
          html`<button type="button" data-day="${i}" aria-label="${DAYS[i]}" aria-pressed="${I.days.includes(i)}" class="${+I.longDay === i ? "long" : ""}">${d}</button>`,
      ),
    ),
  );
  $("#daysCount").textContent = t("daysCount", { a: I.days.length, b: I.runs || "-" });
  setHtml($("#longDay"), [
    +I.longDay < 0 ? html`<option value="-1" selected>-</option>` : "",
    htmlJoin(DAYS.map((d, i) => html`<option value="${i}" ${+I.longDay === i ? "selected" : ""}>${d}</option>`)),
  ]);
  renderTypes();
  renderHints();
  renderRaceBox();
  renderIntro();
}
function renderHints() {
  const I = S.inputs,
    P = paces(I);
  const start = parseISO(S.plan ? S.plan.meta.start : I.raceDate || I.startDate);
  const blank = missingSetup(I).some((k) => SETUP_STEP[k] === 2);
  $("#startHint").textContent = blank
    ? ""
    : I.goal === "fitness"
      ? t("fitHint", {
          s: fmtDate(start),
          e: fmtDate(addDays(start, 7 * (S.plan ? S.plan.weeks.length : I.weeks) - 1)),
        })
      : t("startHint", { d: fmtDate(start), r: fmtDay(parseISO(I.raceDate)) });
  $("#paceHint").textContent = P.vdot
    ? t("paceHint", { e: P.txt.easy, t: P.txt.tempo, i: P.txt.interval, lbl: distLabel(I), r: P.txt.race })
    : badRaceTime(I)
      ? badTimeMsg(I)
      : t("paceHintNone");
}
/* Effort scale, cool to hot: recovery, easy, long, tempo (steady quality), hard (intervals, hills, custom quality), race. */
const TEMPO_IDS = new Set(["tempo", "progression", "racepace", "fartlek"]);
const effort = (id, kind) =>
  kind === "hard"
    ? TEMPO_IDS.has(id)
      ? "tempo"
      : "hard"
    : ["recovery", "long", "race"].includes(kind)
      ? kind
      : "easy";
const sesEffort = (s) => effort(s.typeId, s.kind);
const effColor = (e) => `var(--${e})`;
const effText = (e) => `var(--${e}-t)`;
function renderChips() {
  const tt = t;
  const focusId =
    document.activeElement && document.activeElement.closest && document.activeElement.closest("#typeChips")
      ? document.activeElement.id
      : null;
  const chip = (t, i) =>
    html`<label class="tchip ${t.on ? "" : "off"}" data-i="${i}"><input type="checkbox" id="t-on-${t.id}" ${t.on ? "checked" : ""} ${t.locked ? "disabled" : ""} aria-label="${esc(tt("useType", { name: t.name }))}"><span class="kind-dot" style="background:${effColor(effort(t.id, t.kind))}" aria-hidden="true"></span>${esc(t.name)}${t.locked ? html`<svg class="lock" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><title>${tt("alwaysOn")}</title><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>` : ""}</label>`;
  const grp = (key, list) =>
    list.length
      ? html`<div class="tgrp"><span class="lbl" id="tg-${key}">${tt(key)}</span><div class="tchips" role="group" aria-labelledby="tg-${key}">${htmlJoin(list.map(([t, i]) => chip(t, i)))}</div></div>`
      : "";
  const idx = S.types.map((t, i) => [t, i]);
  setHtml($("#typeChips"), [
    grp(
      "grpEasy",
      idx.filter(([t]) => t.kind !== "hard"),
    ),
    grp(
      "grpQuality",
      idx.filter(([t]) => t.kind === "hard"),
    ),
  ]);
  $("#typesCount").textContent = tt("typesCount", { a: S.types.filter((t) => t.on).length, b: S.types.length });
  if (focusId) {
    const f = document.getElementById(focusId);
    if (f) f.focus();
  }
}
function renderTypes() {
  const tt = t;
  const openCards = [...document.querySelectorAll("#types .type details[open]")].map(
    (d) => /** @type {HTMLElement} */ (d.closest(".type")).dataset.i,
  );
  renderChips();
  setHtml(
    $("#types"),
    htmlJoin(
      S.types.map(
        (t, i) => html`
<div class="type ${t.on ? "" : "off"}" data-i="${i}">
  <div class="type-head">
    <span class="kind-dot" style="background:${effColor(effort(t.id, t.kind))}" title="${kindLbl(t.kind)}"></span>
    <input class="tname" id="t-name-${t.id}" data-f="name" value="${esc(t.name)}" aria-label="${tt("typeNameLbl")}">
    ${t.locked || DEFAULT_TYPES().some((d) => d.id === t.id) ? "" : html`<button class="icon-btn" data-del="${i}" aria-label="${tt("remove")} ${esc(t.name)}">${tt("remove")}</button>`}
  </div>
  <details><summary>${kindLbl(t.kind)}${t.kind === "hard" ? " · " + t.phases.map(phaseLbl).join(", ") : ""} · ${tt("editDesc")}</summary>
    <div class="opts">
      ${t.locked || t.id === "long" ? "" : html`<div class="field"><label for="t-kind-${t.id}">${tt("kind")}</label><select id="t-kind-${t.id}" data-f="kind">${htmlJoin(["easy", "recovery", "hard"].map((k) => html`<option value="${k}" ${t.kind === k ? "selected" : ""}>${kindLbl(k)}</option>`))}</select></div>`}
      ${t.kind === "hard" ? html`<div class="field"><span class="lbl">${tt("usedPhases")}</span><div class="chips">${htmlJoin(PHASES.map((p) => html`<button type="button" class="chip" data-phase="${p}" aria-pressed="${t.phases.includes(p)}">${phaseLbl(p)}</button>`))}</div></div>` : ""}
      <div class="field"><label for="t-tpl-${t.id}">${tt("tplLbl")}</label><textarea id="t-tpl-${t.id}" data-f="tpl" rows="3">${esc(t.tpl)}</textarea></div>
    </div>
  </details>
</div>`,
      ),
    ),
  );
  for (const i of openCards) {
    const d = cardDetails(`.type[data-i="${i}"] details`);
    if (d) d.open = true;
  }
}
function inputsChanged() {
  S.isExample = false;
  renderRaceBox();
  if (S.inputs.weeks !== "") S.inputs.weeks = clamp(Math.round(+S.inputs.weeks || 12), 3, 30);
  if (S.edited) {
    S.pendingRegen = true;
    renderPlan();
    renderHints();
    return;
  }
  regen();
  renderPlan();
  renderHints();
  markDirty();
}

$("#setup").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const I = S.inputs;
  if (b.dataset.goal) {
    const prevName = defaultName();
    I.goal = b.dataset.goal;
    if (S.nameAuto || S.name === prevName) {
      S.nameAuto = true;
      S.name = defaultName();
      $("#planName").value = S.name;
    }
    renderSetup();
    inputsChanged();
  } else if (b.dataset.dist) {
    const prevName = defaultName();
    I.dist = b.dataset.dist;
    if ((!S.savedAt && S.isExample) || (S.nameAuto && !S.savedAt) || S.name === prevName) S.name = defaultName();
    suggestVolume();
    renderSetup();
    $("#planName").value = S.name;
    inputsChanged();
  } else if (b.dataset.rec !== undefined) {
    I.recWeeks = +b.dataset.rec;
    renderSetup();
    inputsChanged();
  } else if (b.dataset.level) {
    I.level = b.dataset.level;
    suggestVolume();
    renderSetup();
    inputsChanged();
  } else if (b.dataset.runs) {
    I.runs = +b.dataset.runs;
    I.days = DEFAULT_DAYS[I.runs].slice();
    if (!I.days.includes(+I.longDay)) I.longDay = I.days[I.days.length - 1];
    renderSetup();
    inputsChanged();
  } else if (b.dataset.day !== undefined) {
    const d = +b.dataset.day;
    I.days = I.days.includes(d) ? I.days.filter((x) => x !== d) : [...I.days, d].sort((a, b) => a - b);
    renderSetup();
    inputsChanged();
  } else if (b.dataset.phase) {
    const t = S.types[+b.closest(".type").dataset.i];
    const p = b.dataset.phase;
    t.phases = t.phases.includes(p)
      ? t.phases.filter((x) => x !== p)
      : PHASES.filter((x) => x === p || t.phases.includes(x));
    if (!t.phases.length) t.phases = [p];
    const open = /** @type {HTMLDetailsElement} */ (b.closest("details")).open;
    renderTypes();
    if (open) cardDetails(`.type[data-i="${S.types.indexOf(t)}"] details`).open = true;
    inputsChanged();
  } else if (b.dataset.del !== undefined) {
    S.types.splice(+b.dataset.del, 1);
    renderTypes();
    inputsChanged();
  } else if (b.id === "btnAddType") {
    const id = "c" + uid();
    S.types.push({
      id,
      name: t("ty_custom"),
      kind: "hard",
      on: true,
      phases: ["build", "peak"],
      tpl: t("tp_custom"),
    });
    renderTypes();
    const el = cardDetails(`.type[data-i="${S.types.length - 1}"] details`);
    if (el) el.open = true;
    inputsChanged();
  }
});
$("#setup").addEventListener("change", (e) => {
  const el = e.target,
    I = S.inputs;
  const map = {
    startDate: "startDate",
    customKm: "customKm",
    raceDate: "raceDate",
    weeks: "weeks",
    curVol: "curVol",
    curLong: "curLong",
    recDist: "recDist",
    recTime: "recTime",
    longDay: "longDay",
  };
  if (map[el.id]) {
    if (el.id === "raceDate" && !el.value) {
      el.value = I.raceDate;
      return;
    }
    if (el.id === "startDate" && !el.value) {
      el.value = I.startDate;
      return;
    }
    const prevName = defaultName();
    I[map[el.id]] =
      el.type === "number" && el.value === "" ? "" : el.type === "number" || el.id === "longDay" ? +el.value : el.value;
    if (el.id === "longDay" && +el.value >= 0 && !I.days.includes(+el.value)) {
      I.days = [...I.days.filter((d) => d !== I.days[I.days.length - 1]), +el.value].sort((a, b) => a - b);
    }
    if (el.id === "longDay") renderSetup();
    if (el.id === "customKm") {
      suggestVolume();
      $("#curVol").value = I.curVol;
    }
    if (el.id === "customKm" || el.id === "curVol") renderVolHint();
    if (el.id === "customKm" || el.id === "curVol") renderLongPh();
    if (el.id === "recTime" || el.id === "recDist") {
      const sec = raceTimeSec(I.recTime, +I.recDist);
      if (sec) {
        I.recTime = fmtDur(sec);
        $("#recTime").value = I.recTime;
      }
    }
    if (S.name === prevName) {
      S.name = defaultName();
      $("#planName").value = S.name;
    }
    inputsChanged();
    return;
  }
  const cEl = el.closest(".tchip");
  if (cEl) {
    S.types[+cEl.dataset.i].on = el.checked;
    renderTypes();
    inputsChanged();
    return;
  }
  const tEl = el.closest(".type");
  if (tEl && el.dataset.f) {
    const t = S.types[+tEl.dataset.i];
    const f = el.dataset.f;
    if (f === "on") t.on = el.checked;
    else if (f === "kind") {
      t.kind = el.value;
      if (t.kind === "hard" && !t.phases.length) t.phases = ["build", "peak"];
    } else t[f] = el.value;
    if (f === "name") renderChips();
    if (f === "on" || f === "kind") {
      const open = /** @type {HTMLDetailsElement} */ (tEl.querySelector("details")).open;
      renderTypes();
      if (open) cardDetails(`.type[data-i="${tEl.dataset.i}"] details`).open = true;
    }
    inputsChanged();
  }
});

/* ---------- plan UI ---------- */
const phaseColor = (p) => `var(--ph-${p})`;
const phaseText = (p) => `var(--ph-${p}-t)`;
function profileSVG(weeks, W) {
  W = Math.max(Math.round(W || 600), 240);
  const H = 186,
    pl = 30,
    pb = 22,
    pt = 34;
  const max = Math.max(...weeks.map((w) => w.sessions.reduce((a, s) => a + s.km, 0)), 10);
  const top = Math.ceil(max / 10) * 10;
  const bw = (W - pl - 4) / weeks.length;
  const every = bw >= 22 ? 1 : bw >= 12 ? 2 : 4;
  const y = (v) => pt + (H - pt - pb) * (1 - v / top);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nowI = weeks.findIndex((w) => {
    const st = parseISO(w.start);
    return today >= st && today < addDays(st, 7);
  });
  let g = [];
  /* phase bands behind the bars, labelled when there is room (BB-25: replaces the phase legend) */
  for (let i = 0; i < weeks.length;) {
    let j = i;
    while (j + 1 < weeks.length && weeks[j + 1].phase === weeks[i].phase) j++;
    const ph = weeks[i].phase,
      x0 = pl + i * bw,
      wd = (j - i + 1) * bw,
      lbl = phaseLbl(ph);
    g.push(
      html`<rect class="band" data-phase="${esc(ph)}" x="${x0 + 1}" y="${pt - 22}" width="${Math.max(0, wd - 2)}" height="${H - pb - pt + 22}" rx="4" fill="${phaseColor(ph)}" opacity=".13"/>`,
    );
    if (wd >= lbl.length * 6.6 + 10)
      g.push(
        html`<text class="band-lbl" x="${x0 + 6}" y="${pt - 9}" style="fill:${phaseText(ph)};font-weight:600">${esc(lbl)}</text>`,
      );
    i = j + 1;
  }
  for (let t = 0; t <= top; t += top > 60 ? 20 : 10) {
    g.push(
      html`<line x1="${pl}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`,
    );
  }
  weeks.forEach((w, i) => {
    const km = w.sessions.reduce((a, s) => a + s.km, 0);
    const x = pl + i * bw + bw * 0.14,
      bwi = bw * 0.72;
    const lk = (w.sessions.find((s) => s.kind === "long" || s.kind === "race") || {}).km || 0;
    const race = w.sessions.some((s) => s.kind === "race"),
      now = i === nowI;
    const lab = i % every === 0 || i === weeks.length - 1 || race || now;
    const extra = [w.cutback ? t("cutback") : "", now ? t("svgNow") : "", race ? t("svgRace") : ""]
      .filter(Boolean)
      .join(", ");
    g.push(html`<g${race ? html` class="race"` : ""}${now ? html` class="now"` : ""}><title>${esc(t("svgTitle", { n: w.n, km: km.toFixed(1), phase: phaseLbl(w.phase) }))}${extra ? " (" + esc(extra) + ")" : ""}</title><rect x="${x}" y="${y(km)}" width="${bwi}" height="${Math.max(0, y(0) - y(km))}" rx="2" fill="${phaseColor(w.phase)}" opacity="${w.cutback ? 0.55 : 1}"/>
  ${lk ? html`<rect x="${x}" y="${y(lk)}" width="${bwi}" height="2" fill="var(--ink)" opacity=".55"/>` : ""}
  ${lab ? html`<text x="${x + bwi / 2}" y="${y(km) - 5}" text-anchor="middle">${Math.round(km)}</text>` : ""}
  ${race ? html`<path class="flag" d="M${x + bwi / 2 - 4} ${y(km) - 16}v-14l10 4l-10 4" fill="var(--race)" stroke="var(--race)" stroke-width="1.5" stroke-linejoin="round"/>` : ""}
  ${lab ? html`<text x="${x + bwi / 2}" y="${H - 6}" text-anchor="middle"${now ? html` style="fill:var(--ink);font-weight:700"` : ""}>${w.n}</text>` : ""}</g>`);
  });
  /* where today falls inside the current week */
  if (nowI >= 0) {
    const st = parseISO(weeks[nowI].start),
      d = Math.round((+today - +st) / 864e5),
      xn = pl + nowI * bw + (bw * (d + 0.5)) / 7;
    g.push(
      html`<line class="today-mark" x1="${xn}" x2="${xn}" y1="${pt - 22}" y2="${H - pb}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="3 3" opacity=".8"><title>${esc(cap(t("svgToday")))}</title></line>`,
    );
  }
  return html`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("svgAria")}">${g}</svg>`;
}
let chartW = 0;
function drawProfile() {
  const el = $("#profileChart");
  if (!el || !S.plan) return;
  chartW = el.clientWidth;
  setHtml(el, profileSVG(S.plan.weeks, chartW));
}
try {
  new ResizeObserver(() => {
    const el = $("#profileChart");
    if (el && Math.abs(el.clientWidth - chartW) > 4) drawProfile();
  }).observe($("#plan"));
} catch (_) {}
/* BB-27: the setting a warning is about, by its label ("Weekly volume (km)" → "Weekly volume") */
function fieldLabel(f) {
  const k = {
    date: S.inputs.goal === "fitness" ? "startDate" : "raceDate",
    weeks: "weeks",
    curVol: "curVol",
    curLong: "curLong",
    runs: "runsPerWeek",
    days: "runningDays",
    longDay: "longDay",
    types: "secTypes",
    pace: "recTime",
  }[f];
  return t(k).replace(/\s*\(.*\)$/, "");
}
function renderFieldWarns(items) {
  for (const f of SETUP_FIELDS) {
    const el = $("#fw-" + f);
    if (!el) continue;
    const ms = items.filter((x) => x.f === f).map((x) => x.m);
    el.hidden = !ms.length;
    setHtml(el, htmlJoin(ms.map((m) => html`<p>${esc(m)}</p>`)));
  }
}
/* BB-32: the plan name field fits its text, so the ▾ switcher sits right after the name */
let nameCtx = null;
function fitName() {
  const el = /** @type {HTMLInputElement} */ ($("#planName"));
  if (!el) return;
  try {
    nameCtx = nameCtx || document.createElement("canvas").getContext("2d");
    const cs = getComputedStyle(el);
    nameCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    el.style.width = Math.min(320, Math.ceil(nameCtx.measureText(el.value || "").width) + 18) + "px";
  } catch (_) {}
}
function renderPlan() {
  fitName();
  const P = S.plan,
    I = S.inputs;
  if (!P) return;
  syncMode();
  const miss = missingSetup(I);
  if (miss.length) {
    renderFieldWarns([]);
    const h0 = $("#hello");
    if (h0) clearHtml(h0);
    setHtml(
      $("#plan"),
      html`<div class="banner info"><span>${esc(t("needTitle"))}</span><ul>${htmlJoin(miss.map((k) => html`<li>${esc(t(k))}</li>`))}</ul><button class="btn sm m-only" type="button" data-tabgo="setup">${t("editSettings")}</button></div><p class="qempty">${t("qwEmpty")} <button type="button" class="linkbtn" data-act="quick">${t("qwEmptyGo")}</button></p>`,
    );
    return;
  }
  renderHello();
  const weeks = P.weeks;
  const totals = weeks.map((w) => w.sessions.reduce((a, s) => a + s.km, 0));
  const longest = Math.max(...weeks.flatMap((w) => w.sessions.filter((s) => s.kind === "long").map((s) => s.km)), 0);
  const Pg = paces(I); /* BB-54: run times in the grid */
  /* BB-27: setup problems at their field (pace: the pace hint already says it), plan problems in the banner */
  const items = warningItems(I, S.types, P, S.edited);
  renderFieldWarns(items);
  const warns = items.filter((x) => !x.f).map((x) => x.m);
  const setupF = [...new Set(items.filter((x) => x.f && (x.f !== "pace" || badRaceTime(I))).map((x) => x.f))];
  let h = [];
  if (S.isExample)
    h.push(
      html`<div class="banner info"><span>${t("exampleBanner")}</span><button class="btn sm m-only" type="button" data-tabgo="setup">${t("editSettings")}</button></div>`,
    );
  if (!S.isExample && backupDue())
    h.push(
      html`<div class="banner info" id="bkBanner"><span>${t("bkBanner")}</span><button class="btn sm primary" data-act="bksave">${t("bkSave")}</button><button class="btn sm ghost" data-act="bklater">${t("bkLater")}</button></div>`,
    );
  if (S.pendingRegen)
    h.push(
      html`<div class="banner"><span>${t("pendingBanner")}</span><button class="btn sm primary" data-act="regen">${t("rebuildPlan")}</button><button class="btn sm ghost" data-act="keep">${t("keepEdits")}</button></div>`,
    );
  if (setupF.length)
    h.push(
      html`<div class="banner" id="setupWarn"><span>${esc(t("setupWarn", { f: setupF.map(fieldLabel).join(", ") }))}</span><button class="btn sm m-only" type="button" data-tabgo="setup">${t("editSettings")}</button></div>`,
    );
  if (warns.length)
    h.push(html`<div class="banner"><ul>${htmlJoin(warns.map((w) => html`<li>${esc(w)}</li>`))}</ul></div>`);
  /* summary (BB-26): what is left and what the plan builds to, with units; total km dropped (still in the PDF) */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raceI = weeks.findIndex((w) => w.sessions.some((s) => s.kind === "race")),
    endI = raceI >= 0 ? raceI : weeks.length - 1;
  const nowI = weeks.findIndex((w) => {
    const st = parseISO(w.start);
    return today >= st && today < addDays(st, 7);
  });
  const toGo = today < parseISO(weeks[0].start) ? endI + 1 : nowI >= 0 ? Math.max(0, endI - nowI + 1) : 0;
  const u = (x) => html`<small>${x}</small>`;
  const hm = (sec) => {
    sec = Math.round(sec / 60) * 60;
    const h = Math.floor(sec / 3600),
      m = Math.round((sec % 3600) / 60);
    return h ? html`${h}${u(t("uH"))}${String(m).padStart(2, "0")}` : html`${m}${u(t("uMin"))}`;
  };
  h.push(html`<div class="summary">
  <div class="stat" data-stat="togo"><b>${toGo}</b><span>${t(toGo === 1 ? "sToGo1" : "sToGo")}</span></div>
  <div class="stat" data-stat="peak"><b>${Math.round(Math.max(...totals))}${u("km")}</b><span>${t("sPeak")}</span></div>
  <div class="stat" data-stat="long"><b>${longest}${u("km")}</b><span>${t("sLongest")}</span></div>
  ${P.meta.raceSec ? html`<div class="stat" data-stat="target" title="${esc(fmtDur(P.meta.raceSec))}"><b>${hm(P.meta.raceSec)}</b><span>${esc(cap(t("sTarget", { lbl: distLabel(I) })))}</span></div>` : ""}
</div>`);
  h.push(renderToday());
  h.push(
    html`<div class="profile"><div class="profile-head"><h2>${t("loadProfile")}</h2><div class="legend"><span><i style="background:var(--ink);height:2px;opacity:.55;vertical-align:3px"></i>${t("longRunLeg")}</span></div></div><div class="chart" id="profileChart"></div></div>`,
  );
  h.push(html`<div class="toolbar">
  <span class="spacer"></span>
  <button class="btn sm" data-act="quick">${t("qwOpen")}</button>
  <button class="btn sm" data-act="allwatch">${t("sendAll")}</button>
  <button class="btn sm" data-act="ics">${t("exportCal")}</button>
  <span class="exp"><select id="expFmt" aria-label="${esc(t("exportFmt"))}"><option value="csv" ${S.exportFmt === "csv" ? "selected" : ""}>${t("fmtCsv")}</option><option value="pdf" ${S.exportFmt === "pdf" ? "selected" : ""}>${t("fmtPdf")}</option></select><button class="btn sm" data-act="export">${t("exportGo")}</button></span>
  <button class="btn sm ghost" data-act="rebuild">${t("rebuildFrom")}</button>
</div>`);
  /* BB-23: weeks before the current one fold away on phones; a finished plan shows them all */
  const pastN = nowI > 0 ? nowI : 0;
  if (pastN)
    h.push(
      html`<button type="button" class="btn sm ghost mpast" data-act="past" aria-expanded="${!!S.showPast}">${t(S.showPast ? "hidePast" : "showPast", { n: pastN })}</button>`,
    );
  h.push(
    html`<div class="grid-wrap${S.showPast ? " show-past" : ""}"><table class="grid"><thead><tr><th class="wk">${t("week")}</th>${htmlJoin(DAYS.map((d) => html`<th>${d}</th>`))}</tr></thead><tbody>`,
  );
  weeks.forEach((w, wi) => {
    const st = parseISO(w.start),
      en = addDays(st, 6);
    const rc = (wi < pastN ? " past" : "") + (wi === nowI ? " now" : "");
    h.push(html`<tr class="wrow${w.cutback ? " cutback" : ""}${rc}"><td class="wk"><div class="wkcell"><span class="bar" style="background:${phaseColor(w.phase)}"></span><div>
    <div class="n">${t("wAbbr")}${esc(w.n)}</div><div class="meta"><span>${fmtShort(st)} – ${fmtShort(en)}</span><span class="ph" data-cut="${t("cutback")}" style="color:${phaseText(w.phase)}">${phaseLbl(w.phase)}</span><span class="km">${RUN_UNIT === "t" ? estDur(w.sessions.reduce((a, s) => a + sesSec(s, Pg), 0)) : totals[wi].toFixed(1) + " km"}</span></div>
    <button class="btn sm ghost wbtn" data-act="wwatch" data-w="${wi}" aria-label="${esc(t("sendWatchWeek", { n: w.n }))}" title="${esc(t("sendWatchWeek", { n: w.n }))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-3h4l1 3M9 18l1 3h4l1-3M12 10v2l1.5 1"/></svg>${t("watchShort")}</button></div></div></td>`);
    for (let d = 0; d < 7; d++) {
      const ss = w.sessions.filter((s) => s.day === d);
      h.push(
        html`<td class="day" data-w="${wi}" data-d="${d}" data-dl="${esc(DAYS[d])}">${ss.length ? htmlJoin(ss.map((s) => html`<button type="button" class="ses ${s.kind === "race" ? "race" : ""}" draggable="true" data-w="${wi}" data-s="${s.id}" style="--k:${effColor(sesEffort(s))};--kt:${effText(sesEffort(s))}"><span class="t">${esc(s.name)}</span><span class="k">${sesAmt(s, Pg)}</span><span class="d">${esc(s.desc)}</span>${s.note ? html`<span class="nb">${t("noteBadge")}</span>` : ""}</button>`)) : html`<div class="empty" tabindex="0" role="button" aria-label="${esc(t("rest") + " " + t("addRun") + " · " + t("eTitle", { n: w.n, day: DAYS[d] }))}" data-act="add" data-w="${wi}" data-d="${d}"><span>${t("rest")}</span><span class="plus">${t("addRun")}</span></div>`}</td>`,
      );
    }
    h.push(html`</tr>`);
    weekChecks(w, I, weeks[wi - 1]).forEach((c) => {
      h.push(
        html`<tr class="wwarn${rc}" data-check="${c.k}"><td colspan="8"><p><b>${t("wkWarn")}</b>${esc(c.txt)}</p></td></tr>`,
      );
    });
    if (w.note) h.push(html`<tr class="wnote${rc}"><td colspan="8"><p><b>${t("note")}</b>${esc(w.note)}</p></td></tr>`);
  });
  h.push(html`</tbody></table></div>`);
  setHtml($("#plan"), h);
  drawProfile();
  renderWx();
  wxLoad(false);
}

/* ---------- today: session of the day + forecast (Open-Meteo, no key) ---------- */
const WX = {
  fails: 0,
  failAt: 0,
  loc: (() => {
    try {
      const v = JSON.parse(localStorage.getItem("bb-wx") || "null");
      return v && isFinite(v.lat) && isFinite(v.lon) ? v : null;
    } catch (_) {
      return null;
    }
  })(),
  data: null,
  at: 0,
  busy: false,
  err: "",
  editing: false,
  open: (() => {
    try {
      return localStorage.getItem("bb-wx-open") === "1";
    } catch (_) {
      return false;
    }
  })(),
  heat: null,
};
function wxSaveLoc(l) {
  WX.loc = l;
  WX.data = null;
  WX.at = 0;
  WX.err = "";
  WX.fails = 0;
  WX.failAt = 0;
  WX.editing = false;
  try {
    localStorage.setItem("bb-wx", JSON.stringify(l));
  } catch (_) {}
}
function wmoKey(c) {
  c = +c;
  if (c === 0) return 0;
  if (c === 1) return 1;
  if (c === 2) return 2;
  if (c === 3) return 3;
  if (c === 45 || c === 48) return 45;
  if (c >= 51 && c <= 55) return 51;
  if (c === 56 || c === 57) return 56;
  if (c === 61 || c === 63) return 61;
  if (c === 65) return 65;
  if (c === 66 || c === 67) return 66;
  if (c >= 71 && c <= 77) return 71;
  if (c >= 80 && c <= 82) return 80;
  if (c === 85 || c === 86) return 85;
  if (c >= 95) return 95;
  return 3;
}
function wxIcon(c) {
  const k = wmoKey(c);
  const sun = html`<circle cx="20" cy="20" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 4v4M20 32v4M4 20h4M32 20h4M8.7 8.7l2.8 2.8M28.5 28.5l2.8 2.8M8.7 31.3l2.8-2.8M28.5 11.5l2.8-2.8"/></g>`;
  const cloud = (y = 0) =>
    html`<path d="M12 ${30 + y}h17a6 6 0 0 0 0-12 9 9 0 0 0-17 2 5 5 0 0 0 0 10z" fill="var(--surface)" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`;
  let g;
  if (k === 0) g = sun;
  else if (k === 1 || k === 2) g = html`<g transform="translate(-5 -6) scale(.75)" opacity=".85">${sun}</g>${cloud(2)}`;
  else if (k === 3) g = cloud(-2);
  else if (k === 45)
    g = html`<g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 14h26M5 20h30M8 26h24M11 32h18"/></g>`;
  else if (k === 71 || k === 85)
    g = html`${cloud(-6)}<g fill="currentColor"><circle cx="14" cy="33" r="1.8"/><circle cx="21" cy="36" r="1.8"/><circle cx="28" cy="33" r="1.8"/></g>`;
  else if (k === 95)
    g = html`${cloud(-6)}<path d="M21 28l-4 7h5l-3 6" fill="none" stroke="var(--long)" stroke-width="2.4" stroke-linejoin="round"/>`;
  else
    g = html`${cloud(-6)}<g stroke="var(--recovery)" stroke-width="2.4" stroke-linecap="round"><path d="M14 30l-2 5M21 30l-2 5M28 30l-2 5"/></g>`;
  return html`<svg viewBox="0 0 40 40" aria-hidden="true">${g}</svg>`;
}
const hm = (s) => String(s).slice(11, 16);
/* BB-11: after a failed forecast request, automatic reloads (every redraw of Today) wait 30 s, doubling with each
 further failure up to 30 min. Choosing a city or the location (force) always tries at once. */
const wxWait = (n) => Math.min(30 * 60e3, 30e3 * 2 ** Math.max(0, n - 1));
async function wxLoad(force) {
  if (!WX.loc || WX.busy) return;
  if (!force && WX.data && Date.now() - WX.at < 30 * 60e3) return;
  if (!force && WX.fails && Date.now() - WX.failAt < wxWait(WX.fails)) return;
  WX.busy = true;
  WX.err = "";
  renderWx();
  const { lat, lon } = WX.loc;
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunset&timezone=auto&forecast_days=1`;
  try {
    const r = await fetch(u);
    if (!r.ok) throw new Error("http " + r.status);
    WX.data = await r.json();
    WX.at = Date.now();
    WX.fails = 0;
  } catch (_) {
    WX.err = "blocked";
    WX.fails = (WX.fails || 0) + 1;
    WX.failAt = Date.now();
  }
  WX.busy = false;
  renderWx();
}
async function wxFind(q) {
  q = q.trim();
  if (!q) return;
  WX.busy = true;
  WX.err = "";
  renderWx();
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=${LANG}&format=json`,
    );
    if (!r.ok) throw new Error();
    const j = await r.json();
    const h = j.results && j.results[0];
    WX.busy = false;
    if (!h) {
      WX.err = "nocity:" + q;
      renderWx();
      return;
    }
    wxSaveLoc({ name: h.name, lat: h.latitude, lon: h.longitude, country: h.country || "" });
    wxLoad(true);
  } catch (_) {
    WX.busy = false;
    WX.err = "blocked";
    renderWx();
  }
}
function wxGeo() {
  const fail = () => {
    WX.busy = false;
    WX.err = "geo";
    renderWx();
  };
  if (!navigator.geolocation) {
    fail();
    return;
  }
  WX.busy = true;
  WX.err = "";
  renderWx();
  try {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        WX.busy = false;
        wxSaveLoc({ name: "", lat: p.coords.latitude, lon: p.coords.longitude, country: "" });
        wxLoad(true);
      },
      fail,
      { timeout: 10000, maximumAge: 30 * 60e3 },
    );
  } catch (_) {
    fail();
  }
}
function wxBestSlot(D) {
  const c = D.current || {},
    H = D.hourly || {};
  const nowH = String(c.time || "").slice(0, 13);
  const idx = (H.time || [])
    .map((tm, i) => ({ tm, i }))
    .filter((o) => o.tm.slice(0, 13) >= nowH && +o.tm.slice(11, 13) <= 22);
  let best = null;
  if (idx.length > 1)
    for (const o of idx) {
      const p = H.precipitation_probability[o.i] ?? 0;
      if (!best || p < best.p || (p === best.p && H.temperature_2m[o.i] > best.tp))
        best = { i: o.i, p, tp: H.temperature_2m[o.i] };
    }
  return { idx, best };
}
/* heat: feels-like at the driest slot left today (or now). >=22° easy/tempo +10 s/km, >=28° +20 s/km */
function wxHeat(D) {
  if (!D) return null;
  const c = D.current || {},
    H = D.hourly || {};
  const { best } = wxBestSlot(D);
  const at = best && H.apparent_temperature ? H.apparent_temperature[best.i] : c.apparent_temperature;
  if (!isFinite(at)) return null;
  const add = at >= 28 ? 20 : at >= 22 ? 10 : 0;
  return add ? { feels: Math.round(at), add } : null;
}
function renderWx() {
  const el = document.getElementById("wx");
  if (!el) return;
  const D = WX.data;
  const errMsg =
    WX.err === "blocked"
      ? t("wxBlocked")
      : WX.err === "geo"
        ? t("wxGeoFail")
        : WX.err.startsWith("nocity:")
          ? t("wxNoCity", { q: esc(WX.err.slice(7)) })
          : "";
  const open = WX.open || WX.editing || !!errMsg;
  const city = WX.loc ? esc(WX.loc.name || `${WX.loc.lat.toFixed(2)}, ${WX.loc.lon.toFixed(2)}`) : "";
  const chev = html`<svg class="chev" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let sum, more;
  if (!WX.loc || WX.editing) {
    const sug = (S.inputs.race && S.inputs.race.city) || (WX.loc && WX.loc.name) || "";
    sum = html`${wxIcon(2)}<span>${WX.loc ? html`<b>${t("wxTitle")}</b> · ${city}` : t("wxAdd")}</span>`;
    more = html`<span class="hint">${t("wxSet")}</span>
    <form id="wxForm"><input id="wxQ" aria-label="${esc(t("wxCity"))}" placeholder="${esc(t("wxCityPh"))}" value="${esc(sug)}" autocomplete="address-level2"><button class="btn sm primary" type="submit" ${WX.busy ? "disabled" : ""}>${t("wxGo")}</button></form>
    <div class="wxloc">${navigator.geolocation ? html`<button type="button" class="icon-btn" data-act="wxgeo">${t("wxGeo")}</button>` : ""}${WX.busy ? html`<span>${t("wxLoading")}</span>` : ""}</div>
    ${errMsg ? html`<span class="hint">${errMsg}</span>` : ""}`;
  } else {
    const change = html`<div class="wxloc">${D ? html`<span>${t("wxUpd", { t: new Date(WX.at).toLocaleTimeString(LOC(), { hour: "2-digit", minute: "2-digit" }) })}</span>` : ""}<button type="button" class="icon-btn" data-act="wxedit">${t("wxChange")}</button></div>`;
    if (!D) {
      sum = html`${wxIcon(3)}<span><b>${t("wxTitle")}</b> · ${city}${WX.busy ? ` · ${t("wxLoading")}` : ""}</span>`;
      more = html`${errMsg ? html`<span class="hint">${errMsg}</span>` : ""}${change}`;
    } else {
      const c = D.current || {},
        dd = D.daily || {},
        H = D.hourly || {};
      const { idx, best } = wxBestSlot(D);
      const step = idx.length > 8 ? 2 : 1;
      const hrs = idx.filter((_, j) => j % step === 0);
      const wk = wmoKey(c.weather_code);
      sum = html`${wxIcon(c.weather_code)}<span><b>${Math.round(c.temperature_2m)}°</b> ${esc(t("wmo" + wk).toLowerCase())} · ${t("wxRain", { p: dd.precipitation_probability_max ? (dd.precipitation_probability_max[0] ?? 0) : 0 })}${best ? ` · ${t("wxDriest", { h: hm(H.time[best.i]) })}` : ""} · ${city}</span>`;
      more = html`<div class="wxnow">${wxIcon(c.weather_code)}<span class="tmp">${Math.round(c.temperature_2m)}°</span><span class="dsc"><b>${t("wmo" + wk)}</b><span>${t("wxFeels", { v: Math.round(c.apparent_temperature) })}</span></span></div>
  <div class="wxfacts"><span>${t("wxHiLo", { h: html`<b>${Math.round(dd.temperature_2m_max[0])}</b>`, l: html`<b>${Math.round(dd.temperature_2m_min[0])}</b>` })}</span><span>${t("wxRain", { p: html`<b>${dd.precipitation_probability_max[0] ?? 0}</b>` })}</span><span>${t("wxWind", { w: html`<b>${Math.round(c.wind_speed_10m)}</b>` })}</span>${dd.sunset ? html`<span>${t("wxSun", { t: html`<b>${hm(dd.sunset[0])}</b>` })}</span>` : ""}</div>
  ${hrs.length ? html`<div class="wxhours">${htmlJoin(hrs.map((o) => html`<div class="wxh ${best && best.i === o.i ? "best" : ""}"><span class="hr">${hm(o.tm)}</span><span class="tp">${Math.round(H.temperature_2m[o.i])}°</span><span class="pp">${H.precipitation_probability[o.i] ?? 0}%</span></div>`))}</div>` : ""}
  ${best ? html`<span class="wxbest">${t("wxBest", { h: hm(H.time[best.i]), p: best.p, tp: Math.round(best.tp) })}</span>` : ""}
  ${change}`;
    }
  }
  setHtml(
    el,
    html`<button type="button" class="wxline" data-act="wxtoggle" aria-expanded="${open}" aria-controls="wxMore">${sum}${chev}</button><div class="wxmore" id="wxMore" ${open ? "" : "hidden"}>${more}</div>`,
  );
  WX.heat = wxHeat(D);
  applyHeat();
}

/* ---------- workout shape: watchPlan() steps with estimated time and effort colour (Today bar now, BB-58 preview later) ---------- */
const PACE_EFF = { interval: "hard", rep: "hard", tempo: "tempo", mp: "tempo" };
function stepEffort(x, sesE) {
  if (x.p === "recovery") return "recovery";
  if (PACE_EFF[x.pace]) return PACE_EFF[x.pace];
  if (x.pace === "race") return sesE === "race" ? "race" : "tempo";
  if (x.pace === "easy") return sesE === "long" ? "long" : "easy";
  return sesE === "easy" || sesE === "long" ? "hard" : sesE;
}
/* seconds per km for a step: its pace, else a jog for recoveries, else by effort */
function stepSecKm(x, e, P) {
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
function estDur(sec) {
  const m = Math.max(1, Math.round(sec / 60));
  if (m < 60) return t("durMin", { m });
  const r = Math.round(m / 5) * 5;
  return t("durHM", { h: Math.floor(r / 60), m: String(r % 60).padStart(2, "0") });
}
/* a run's length for display (BB-54): its km, or its estimated time from its watch steps at the plan's paces, as on the Today card */
const sesWp = (s) => s.watch || watchPlan(s.kind, s.km);
/* races stay in km (the finish line is a distance); a 0 km run with no steps has no time */
const inTime = (s) => RUN_UNIT === "t" && s.kind !== "race" && (s.km > 0 || !!s.watch);
function sesSec(s, P) {
  if (!(s.km > 0) && !s.watch) return 0;
  return workoutSegs(sesWp(s), sesEffort(s), P || paces(S.inputs)).reduce((a, g) => a + g.sec, 0);
}
function sesAmt(s, P) {
  return inTime(s) ? estDur(sesSec(s, P)) : `${s.km} km`;
}
/* the main set in words ("<b>5 × 1 km</b> · 2 min jog"): Today bar labels and quick workout sizes */
function mainSetHtml(wp) {
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
function workoutBar(wp, sesE, P) {
  const segs = workoutSegs(wp, sesE, P);
  const bar = html`<div class="wbar" role="img" aria-label="${esc(watchSummary(wp, P))}">${htmlJoin(segs.map((g) => html`<i class="${g.role === "rec" ? "rec" : ""}" style="flex:${Math.max(1, Math.round(g.sec))} 1 0;background:${effColor(g.e)}"></i>`))}</div>`;
  const main = mainSetHtml(wp);
  const lbl = html`<div class="wbarlbl">${wp.wu ? html`<span><b>${gTxt(wp.wu)}</b> ${t("warmup").toLowerCase()}</span>` : ""}<span>${main}</span>${wp.cd ? html`<span><b>${gTxt(wp.cd)}</b> ${t("cooldown").toLowerCase()}</span>` : ""}</div>`;
  return { html: html`<div>${bar}${lbl}</div>`, sec: segs.reduce((a, g) => a + g.sec, 0), segs };
}
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
function applyHeat() {
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
function sendLbl(name) {
  const d = DEVICES.find((x) => x.k === getDevice()) || DEVICES[0];
  const b = d.k === "other" ? t("sendWatch") : t("sendTo", { dev: d.name() });
  return name ? `${b} · ${name}` : b;
}
function renderToday() {
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
$("#plan").addEventListener("submit", (e) => {
  if (e.target.id !== "wxForm") return;
  e.preventDefault();
  const q = $("#wxQ");
  if (q) wxFind(q.value);
});

/* ---------- quick workout (BB-58): one workout from the run types, sent to a watch, with or without a plan ---------- */
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
function wpInUnit(wp, unit, eff, P, wucdByPace) {
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
function openQuick(type) {
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

/* ---------- race picker (optional) ---------- */
function finishersUrl(I) {
  const m = Math.round(distKm(I) * 1000);
  return `https://www.finishers.com/courses?discipline=road&dmin=${m}&dmax=${m}&distanceUnit=meters`;
}
function nameFromUrl(u) {
  try {
    const x = new URL(u);
    if (!/finishers\.com$/.test(x.hostname.replace(/^www\./, ""))) return "";
    const seg = x.pathname.split("/").filter(Boolean);
    const i = seg.indexOf("course");
    const slug = i >= 0 ? seg[i + 1] : seg[seg.length - 1];
    if (!slug) return "";
    return decodeURIComponent(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\b(De|Du|Des|La|Le|Les|Et|D|L)\b/g, (w) => w.toLowerCase());
  } catch (_) {
    return "";
  }
}
function renderRaceBox() {
  const R = S.inputs.race,
    el = $("#raceBox");
  if (!el) return;
  if (R && R.name && !S.raceEditing) {
    el.className = "racebox set";
    setHtml(
      el,
      html`<div><div style="font-weight:600">${esc(R.name)}</div><div class="hint">${R.city ? esc(R.city) + " · " : ""}${fmtDate(parseISO(S.inputs.raceDate))} · ${esc(distLabel(S.inputs))}</div></div>
    <div class="acts"><button type="button" class="btn sm" data-race="edit">${t("editRace")}</button><button type="button" class="btn sm ghost" data-race="clear">${t("removeRace")}</button></div>`,
    );
    return;
  }
  el.className = "racebox";
  if (!S.raceEditing) {
    setHtml(
      el,
      html`<div class="hint">${t("raceOptional")}</div>
    <div class="acts"><a class="btn sm" href="${finishersUrl(S.inputs)}" target="_blank" rel="noopener">${esc(t("findOn", { lbl: distLabel(S.inputs).toLowerCase() }))}</a><button type="button" class="btn sm" data-race="edit">${t("addMyRace")}</button></div>`,
    );
    return;
  }
  const r = R || {};
  setHtml(
    el,
    html`<div class="field"><label for="rUrl">${t("raceUrl")}</label><input id="rUrl" type="url" placeholder="${esc(t("raceUrlPh"))}" value="${esc(r.url || "")}"></div>
  <div class="field"><label for="rName">${t("raceName")}</label><input id="rName" value="${esc(r.name || "")}" placeholder="${esc(t("raceNamePh"))}"></div>
  <div class="field"><label for="rCity">${t("city")}</label><input id="rCity" value="${esc(r.city || "")}"></div>
  <div class="hint">${t("raceMatch")}</div>
  <div class="acts"><button type="button" class="btn sm primary" data-race="save">${t("useRace")}</button><button type="button" class="btn sm ghost" data-race="cancel">${t("cancel")}</button><a class="btn sm ghost" href="${finishersUrl(S.inputs)}" target="_blank" rel="noopener">${t("searchFin")}</a></div>`,
  );
  const u = el.querySelector("#rUrl"),
    n = el.querySelector("#rName");
  u.addEventListener("input", () => {
    const g = nameFromUrl(u.value);
    if (g && (!n.value || n.dataset.auto === "1")) {
      n.value = g;
      n.dataset.auto = "1";
    }
  });
  n.addEventListener("input", () => {
    n.dataset.auto = "0";
  });
}
$("#raceBox").addEventListener("click", (e) => {
  const b = e.target.closest("[data-race]");
  if (!b) return;
  e.stopPropagation();
  const a = b.dataset.race;
  if (a === "edit") {
    S.raceEditing = true;
    renderRaceBox();
    const f = $("#rUrl");
    f && f.focus();
  } else if (a === "cancel") {
    S.raceEditing = false;
    renderRaceBox();
  } else if (a === "clear") {
    S.inputs.race = null;
    S.raceEditing = false;
    renderRaceBox();
    renderHello();
    markDirty();
  } else if (a === "save") {
    const name = $("#rName").value.trim(),
      city = $("#rCity").value.trim(),
      url = safeUrl($("#rUrl").value);
    if (!name) {
      $("#rName").focus();
      toast(t("needName"));
      return;
    }
    S.inputs.race = { name, city, url };
    S.raceEditing = false;
    if (S.isExample || !S.savedAt) {
      S.name = name;
      $("#planName").value = name;
    }
    S.isExample = false;
    renderRaceBox();
    renderPlan();
    markDirty();
  }
});
$("#raceBox").addEventListener("change", (e) => e.stopPropagation());

/* greeting */
function renderHello() {
  const el = $("#hello");
  if (!el) return;
  const P = S.plan,
    I = S.inputs;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const race = parseISO(I.raceDate);
  const days = Math.round((+race - +today) / 864e5);
  const lbl = distLabel(I);
  let line;
  if (I.goal === "fitness") {
    const st0 = parseISO(P.weeks[0].start),
      end = addDays(st0, 7 * P.weeks.length - 1);
    const wi = P.weeks.findIndex((w) => {
      const st = parseISO(w.start);
      return today >= st && today < addDays(st, 7);
    });
    if (today < st0) line = t("hFitStarts", { n: P.weeks.length, d: fmtDate(st0) });
    else if (wi < 0) line = t("hFitDone", { n: P.weeks.length, d: fmtDate(end) });
    else {
      const w = P.weeks[wi];
      const tdow = dow(today);
      const next = w.sessions.find((s) => s.day >= tdow) || (P.weeks[wi + 1] && P.weeks[wi + 1].sessions[0]);
      const when = next ? (next.day === tdow && w.sessions.includes(next) ? t("today") : DAYS[next.day]) : "";
      line = html`${t("hFitIn", { n: w.n, t: P.weeks.length, phase: phaseLbl(w.phase), cut: w.cutback ? t("hCut") : "" })}${
        next ? t("hNext", { when, name: esc(next.name.toLowerCase()), amt: sesAmt(next) }) : ""
      }`;
    }
  } else if (days < 0) {
    /* BB-42: in a recovery week after the race, say so and name the next run */
    const wi = P.weeks.findIndex((w) => {
      const st = parseISO(w.start);
      return today >= st && today < addDays(st, 7);
    });
    const w = wi >= 0 ? P.weeks[wi] : null;
    if (w && w.phase === "recovery") {
      const tdow = dow(today),
        rw = P.weeks.filter((x) => x.phase === "recovery");
      const next = w.sessions.find((s) => s.day >= tdow) || (P.weeks[wi + 1] && P.weeks[wi + 1].sessions[0]);
      const when = next ? (next.day === tdow && w.sessions.includes(next) ? t("today") : DAYS[next.day]) : "";
      line = html`${t("hRecIn", { lbl: esc(lbl), k: rw.indexOf(w) + 1, r: rw.length })}${
        next ? t("hNext", { when, name: esc(next.name.toLowerCase()), amt: sesAmt(next) }) : ""
      }`;
    } else line = t("hPast", { lbl: esc(lbl), d: fmtDate(race) });
  } else if (days === 0) line = t("hToday", { lbl: esc(lbl) });
  else {
    const wi = P.weeks.findIndex((w) => {
      const st = parseISO(w.start);
      return today >= st && today < addDays(st, 7);
    });
    const head = t(days === 1 ? "hDay1" : "hDays", { n: days, lbl: esc(lbl), d: fmtDate(race) });
    if (wi < 0) {
      line = html`${head} ${t("hStarts", { d: fmtDate(parseISO(P.weeks[0].start)) })}`;
    } else {
      const w = P.weeks[wi];
      const tdow = dow(today);
      const next = w.sessions.find((s) => s.day >= tdow) || (P.weeks[wi + 1] && P.weeks[wi + 1].sessions[0]);
      const when = next ? (next.day === tdow && w.sessions.includes(next) ? t("today") : DAYS[next.day]) : "";
      line = html`${head} ${t("hInWeek", {
        n: w.n,
        t: P.weeks.filter((x) => x.phase !== "recovery").length,
        phase: phaseLbl(w.phase),
        cut: w.cutback ? t("hCut") : "",
      })}${next ? t("hNext", { when, name: esc(next.name.toLowerCase()), amt: sesAmt(next) }) : ""}`;
    }
  }
  const R = I.race;
  let cd = html``;
  if (I.goal !== "fitness" && R && R.name && days >= 0) {
    const nm = R.url
      ? html`<a class="rn" href="${esc(R.url)}" target="_blank" rel="noopener">${esc(R.name)}</a>`
      : html`<span class="rn">${esc(R.name)}</span>`;
    cd = html`<div class="countdown"><div class="num">${days}<small>${days === 1 ? t("dayOne") : t("dayMany")}</small></div>${nm}<span class="rm">${R.city ? esc(R.city) + " · " : ""}${fmtDay(race)} · ${esc(lbl)}</span></div>`;
  }
  setHtml(el, html`<div class="txt"><p class="lead">${line}</p></div>${cd}`);
}

/* plan interactions */
$("#plan").addEventListener("click", (e) => {
  const a = e.target.closest("[data-act]");
  const ses = e.target.closest(".ses");
  if (ses && !a) {
    openEditor(+ses.dataset.w, ses.dataset.s);
    return;
  }
  if (!a) return;
  const act = a.dataset.act;
  if (act === "regen" || act === "rebuild") {
    if (act === "rebuild" && S.edited) {
      confirmBox(t("rebuildQ"), t("rebuildT"), t("rebuild"), () => {
        S.pendingRegen = false;
        regen();
        renderPlan();
        markDirty();
      });
      return;
    }
    S.pendingRegen = false;
    regen();
    renderPlan();
    markDirty();
  } else if (act === "keep") {
    S.pendingRegen = false;
    renderPlan();
  } else if (act === "bksave") {
    exportAllPlans();
    renderPlan();
  } else if (act === "bklater") {
    const b = bkGet();
    b.snooze = Date.now() + 7 * BK_DAY;
    bkSet(b);
    renderPlan();
  } else if (act === "tedit") {
    openEditor(+a.dataset.w, a.dataset.s);
  } else if (act === "twatch") {
    const w = S.plan.weeks[+a.dataset.w],
      s = w.sessions.find((x) => x.id === a.dataset.s);
    if (s)
      sendToWatch(
        planWorkouts([{ w, s }]),
        t("tdWatchTitle", { name: s.name, d: fmtDay(sessionDate(w, s)) }),
        `${slug(S.name)}-${iso(sessionDate(w, s))}`,
      );
  } else if (act === "wxedit") {
    WX.editing = true;
    WX.err = "";
    renderWx();
    const q = $("#wxQ");
    q && q.focus();
  } else if (act === "wxtoggle") {
    WX.open = !(WX.open || WX.editing);
    if (!WX.open) WX.editing = false;
    try {
      localStorage.setItem("bb-wx-open", WX.open ? "1" : "0");
    } catch (_) {}
    renderWx();
    const q = $("#wxQ");
    if (WX.open && q && !WX.loc) q.focus();
  } else if (act === "wxgeo") {
    wxGeo();
  } else if (act === "add") {
    addSession(+a.dataset.w, +a.dataset.d);
  } else if (act === "wwatch") {
    const w = S.plan.weeks[+a.dataset.w];
    sendToWatch(
      planWorkouts(w.sessions.map((s) => ({ w, s }))),
      t("sendTitleWeek", { n: w.n, c: w.sessions.length }),
      `${slug(S.name)}-week-${String(w.n).padStart(2, "0")}`,
    );
  } else if (act === "quick") {
    openQuick(a.dataset.type);
  } else if (act === "allwatch") {
    sendToWatch(
      planWorkouts(S.plan.weeks.flatMap((w) => w.sessions.map((s) => ({ w, s })))),
      t("sendTitleAll", { c: S.plan.weeks.reduce((a, w) => a + w.sessions.length, 0) }),
      `${slug(S.name)}-all`,
    );
  } else if (act === "ics") exportICS();
  else if (act === "csv") exportCSV();
  else if (act === "past") {
    S.showPast = !S.showPast;
    renderPlan();
  } else if (act === "export") {
    const f = $("#expFmt");
    S.exportFmt = f ? f.value : "csv";
    if (S.exportFmt === "pdf") exportPDF(a);
    else exportCSV();
  }
});
$("#plan").addEventListener("change", (e) => {
  if (e.target.id === "expFmt") {
    S.exportFmt = e.target.value;
    try {
      localStorage.setItem("bb-export-fmt", S.exportFmt);
    } catch (_) {}
  }
});
$("#plan").addEventListener("keydown", (e) => {
  const a = e.target.closest(".empty");
  if (a && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    addSession(+a.dataset.w, +a.dataset.d);
  }
});
let drag = null;
$("#plan").addEventListener("dragstart", (e) => {
  const s = e.target.closest(".ses");
  if (!s) return;
  drag = { w: +s.dataset.w, id: s.dataset.s };
  s.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("text/plain", s.dataset.s);
  } catch (_) {}
});
$("#plan").addEventListener("dragend", () => {
  document.querySelectorAll(".dragging,.drop").forEach((x) => x.classList.remove("dragging", "drop"));
  drag = null;
});
$("#plan").addEventListener("dragover", (e) => {
  const td = e.target.closest("td.day");
  if (!td || !drag || +td.dataset.w !== drag.w) return;
  e.preventDefault();
  document.querySelectorAll(".drop").forEach((x) => x.classList.remove("drop"));
  td.classList.add("drop");
});
$("#plan").addEventListener("drop", (e) => {
  const td = e.target.closest("td.day");
  if (!td || !drag || +td.dataset.w !== drag.w) return;
  e.preventDefault();
  moveSession(drag.w, drag.id, +td.dataset.d);
});
function moveSession(wi, id, d) {
  const w = S.plan.weeks[wi];
  const s = w.sessions.find((x) => x.id === id);
  if (!s || s.day === d) return;
  const other = w.sessions.filter((x) => x.day === d);
  other.forEach((o) => (o.day = s.day));
  s.day = d;
  w.sessions.sort((a, b) => a.day - b.day);
  touched();
}
function touched() {
  S.edited = true;
  renderPlan();
  markDirty();
}
function addSession(wi, d) {
  const t = S.types.find((x) => x.id === "easy");
  const P = paces(S.inputs);
  const s = {
    id: uid(),
    day: d,
    typeId: "easy",
    name: t.name,
    kind: "easy",
    km: 5,
    desc: fill(t.tpl, { ...P.txt, km: 5, work: "" }),
    note: "",
  };
  S.plan.weeks[wi].sessions.push(s);
  S.plan.weeks[wi].sessions.sort((a, b) => a.day - b.day);
  touched();
  openEditor(wi, s.id);
}

/* ---------- modal helpers ---------- */
/* dialogs: named by their heading, Tab stays inside, focus goes back to the opener on close */
let modalOpener = null,
  lastTrigger = null;
/* Safari doesn't focus a button on click, so remember the last control pressed */
document.addEventListener(
  "pointerdown",
  (e) => {
    const el = /** @type {HTMLElement} */ (e.target);
    const c = el.closest && el.closest("button,a[href],[tabindex]");
    if (c && !c.closest("#modalRoot")) lastTrigger = c;
  },
  true,
);
function openerKey(el) {
  if (el.id) return "#" + CSS.escape(el.id);
  const at = ["data-act", "data-w", "data-s", "data-d"].filter((a) => el.hasAttribute(a));
  return at.length ? at.map((a) => `[${a}="${CSS.escape(el.getAttribute(a))}"]`).join("") : null;
}
function modal(body, onMount) {
  const root = $("#modalRoot");
  if (!root.firstChild) {
    const a = document.activeElement;
    const o = a && a !== document.body && !a.closest("#modalRoot") && a.id !== "setup" ? a : lastTrigger;
    /* the Edit plan sheet itself is no opener: Safari leaves focus on it when a button inside is tapped (BB-29) */ modalOpener =
      o ? { el: o, key: openerKey(o) } : null;
  }
  setHtml(root, html`<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true">${body}</div></div>`);
  const bg = root.firstChild;
  bg.addEventListener("click", (e) => {
    if (e.target === bg) closeModal();
  });
  const m = bg.firstChild;
  const h = m.querySelector("h2");
  if (h) {
    h.id = "modalTitle";
    m.setAttribute("aria-labelledby", "modalTitle");
  }
  onMount && onMount(m);
  m.tabIndex = -1;
  m.focus({ preventScroll: true });
  return m;
}
function closeModal() {
  clearHtml($("#modalRoot"));
  const o = modalOpener;
  modalOpener = null;
  if (!o) return;
  /* wait until the caller has redrawn the page, and skip if another dialog opened meanwhile */
  queueMicrotask(() => {
    if ($("#modalRoot").firstChild) return;
    const el = o.el.isConnected ? o.el : o.key && document.querySelector(o.key);
    if (el && typeof el.focus === "function") el.focus({ preventScroll: true });
  });
}
function modalFocusables(m) {
  return [...m.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(
    (el) => !el.disabled && el.getClientRects().length,
  );
}
document.addEventListener("keydown", (e) => {
  const m = $("#modalRoot .modal");
  if (!m) return;
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  if (e.key !== "Tab") return;
  const f = modalFocusables(m);
  if (!f.length) {
    e.preventDefault();
    m.focus();
    return;
  }
  /* move focus ourselves: Safari skips buttons on Tab, which would let focus leave the dialog */
  e.preventDefault();
  const i = f.indexOf(document.activeElement);
  const n = i < 0 ? (e.shiftKey ? f.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length;
  f[n].focus();
});
function confirmBox(title, text, okLabel, ok) {
  modal(
    html`<h2>${esc(title)}</h2><p style="margin:0">${esc(text)}</p><div class="actions"><button class="btn" id="cNo">${t("cancel")}</button><button class="btn primary" id="cYes">${esc(okLabel)}</button></div>`,
    (m) => {
      m.querySelector("#cNo").onclick = closeModal;
      m.querySelector("#cYes").onclick = () => {
        closeModal();
        ok();
      };
    },
  );
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  $("#toastRoot").appendChild(t);
  setTimeout(() => t.remove(), Math.max(2600, msg.length * 60));
}

/* "Why this run" (BB-43): purpose and how it should feel, for the built-in run types; custom types and race day have none */
const whyOf = (id) => (TYPE_DEFS.some((d) => d[0] === id) ? t("why_" + id) : "");
const whyHtml = (id) => {
  const w = whyOf(id);
  return w ? html`<b>${t("whyLbl")}</b> ${esc(w)}` : "";
};
function openEditor(wi, id) {
  const w = S.plan.weeks[wi];
  const s = w.sessions.find((x) => x.id === id);
  if (!s) return;
  const opts = htmlJoin([
    ...S.types
      .filter((t) => t.on || t.id === s.typeId)
      .map((t) => html`<option value="${esc(t.id)}" ${t.id === s.typeId ? "selected" : ""}>${esc(t.name)}</option>`),
    html`<option value="race" ${s.typeId === "race" ? "selected" : ""}>${t("raceDay")}</option>`,
  ]);
  modal(
    html`<h2>${t("eTitle", { n: w.n, day: DAYS[s.day] })}</h2>
  <div class="row"><div class="field"><label for="eType">${t("runType")}</label><select id="eType">${opts}</select></div>
  <div class="field"><label for="eDay">${t("dayLbl")}</label><select id="eDay">${htmlJoin(DAYS.map((d, i) => html`<option value="${i}" ${i === s.day ? "selected" : ""}>${d}</option>`))}</select></div></div>
  <p class="hint why" id="eWhy" ${whyOf(s.typeId) ? "" : "hidden"}>${whyHtml(s.typeId)}</p>
  <div class="row"><div class="field"><label for="eKm">${t("distKm")}</label><input id="eKm" type="number" min="0" step="0.5" value="${esc(s.km)}"></div><div></div></div>
  <div class="field"><label for="eDesc">${t("desc")}</label><textarea id="eDesc" rows="4">${esc(s.desc)}</textarea></div>
  <div class="field"><span class="lbl">${t("watchWorkout")}</span><div class="watchsum" id="eWatch">${esc(watchSummary(s.watch || watchPlan(s.kind, s.km)))}</div><div class="hint">${t("watchHint")}</div></div>
  <div class="field"><label for="eNote">${t("note")}</label><textarea id="eNote" rows="3" placeholder="${esc(t("notePhOwn"))}">${esc(s.note)}</textarea></div>
  <div class="actions"><button class="btn ghost left" id="eDel">${t("deleteRun")}</button><button class="btn" id="eWatchBtn">${t("sendWatch")}</button><button class="btn" id="eCancel">${t("cancel")}</button><button class="btn primary" id="eOk">${t("saveChanges")}</button></div>`,
    (m) => {
      m.querySelector("#eCancel").onclick = closeModal;
      m.querySelector("#eDel").onclick = () => {
        w.sessions = w.sessions.filter((x) => x.id !== id);
        closeModal();
        touched();
      };
      m.querySelector("#eType").onchange = (ev) => {
        const wy = m.querySelector("#eWhy");
        setHtml(wy, whyHtml(ev.target.value));
        wy.hidden = !whyOf(ev.target.value);
        const ty = S.types.find((x) => x.id === ev.target.value);
        if (ty) {
          const P = paces(S.inputs);
          const km = +m.querySelector("#eKm").value || s.km;
          const wk = workFor(ty, {
            p: 0.5,
            D: distKm(S.inputs),
            c: cat(distKm(S.inputs)),
            taper: w.phase === "taper",
            P,
            phase: w.phase,
          });
          m.querySelector("#eDesc").value = fill(ty.tpl, { ...P.txt, km, work: fill(wk.text || "", P.txt) });
        }
      };
      m.querySelector("#eWatchBtn").onclick = () => {
        closeModal();
        sendToWatch(
          planWorkouts([{ w, s }]),
          t("sendTitleRun", { n: w.n, day: DAYS[s.day], name: s.name, amt: sesAmt(s) }),
        );
      };
      m.querySelector("#eOk").onclick = () => {
        const tid = m.querySelector("#eType").value;
        const ty = S.types.find((x) => x.id === tid);
        const newKm = Math.max(0, +m.querySelector("#eKm").value || 0);
        if (tid !== s.typeId) {
          const P = paces(S.inputs);
          const D = distKm(S.inputs);
          s.watch = ty
            ? watchPlan(
                ty.kind,
                newKm,
                workFor(ty, { p: 0.5, D, c: cat(D), taper: w.phase === "taper", P, phase: w.phase }),
              )
            : watchPlan("race", newKm);
        } else if (newKm !== s.km) {
          s.watch = rescaleWatch(s.watch || watchPlan(s.kind, s.km), newKm - s.km);
        }
        s.typeId = tid;
        s.name = ty ? ty.name : t("raceDay");
        s.kind = ty ? ty.kind : "race";
        s.km = Math.max(0, +m.querySelector("#eKm").value || 0);
        s.desc = m.querySelector("#eDesc").value;
        s.note = m.querySelector("#eNote").value;
        const nd = +m.querySelector("#eDay").value;
        closeModal();
        if (nd !== s.day) moveSession(wi, id, nd);
        else touched();
      };
    },
  );
}

/* ---------- Apple Watch (.workout via WorkoutKit format) ---------- */
const PACE_TOL = { easy: 25, tempo: 8, interval: 8, rep: 6, race: 6, mp: 8, custom: 8 };
/* a step has a number pace when paces come from a race time, or when the runner typed that pace (quick workout fine-tune) */
const hasPace = (P, k) => !!(k && (P.vdot || (P.fixed && P.fixed[k])));
const paceLbl = (k) => t("pl_" + k);
function gTxt(g) {
  if (g[0] === "d") {
    const m = Math.round(g[1] * 1000);
    return m < 1000 || m % 1000
      ? m >= 1000
        ? (m / 1000).toLocaleString(LOC(), { maximumFractionDigits: 1 }) + " km"
        : m + " m"
      : m / 1000 + " km";
  }
  const z = g[1];
  return z >= 60
    ? z % 60
      ? Math.floor(z / 60) + ":" + String(z % 60).padStart(2, "0") + " min"
      : z / 60 + " min"
    : z + " s";
}
function stepTxt(x, P) {
  return (
    gTxt(x.g) +
    (x.pace ? " @ " + (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : "") +
    (x.p === "recovery" ? t("recoverySfx") : "")
  );
}
function watchSummary(wp, P) {
  P = P || paces(S.inputs);
  const parts = [];
  if (wp.wu) parts.push(t("warmup") + " " + gTxt(wp.wu));
  for (const b of wp.blocks) {
    const st = b.steps.map((x) => stepTxt(x, P)).join(", ");
    parts.push(b.n > 1 ? `${b.n} × (${st})` : st);
  }
  if (wp.cd) parts.push(t("cooldown") + " " + gTxt(wp.cd));
  return parts.join(" · ");
}
function rescaleWatch(wp, delta) {
  wp = JSON.parse(JSON.stringify(wp));
  if (wp.wu && wp.cd) {
    wp.cd = ["d", r05(Math.max(0.5, wp.cd[1] + delta))];
    return wp;
  }
  const st = wp.blocks[0] && wp.blocks[0].n === 1 && wp.blocks[0].steps.find((x) => x.g[0] === "d");
  if (st) st.g = ["d", r05(Math.max(0.5, st.g[1] + delta))];
  return wp;
}
let WK = null;
function loadWK() {
  if (!WK)
    WK = Promise.all([
      // Loaded at runtime from the page's folder, not bundled (esbuild --external:./vendor/*), so tsc can't resolve it from src/.
      // @ts-expect-error
      import("./vendor/workoutkit-0.2.0/index.js"),
      // @ts-expect-error
      import("./vendor/workoutkit-0.2.0/encode.js"),
    ]).catch((e) => {
      WK = null;
      throw e;
    });
  return WK;
}
/* a workout to export: {title, fitTitle, file, wp, paces?}. Plan runs and BB-58 quick workouts share it, so export needs no plan week. */
function planWorkout(w, s) {
  const P = paces(S.inputs),
    tm = inTime(s); /* BB-54: in minutes, distance steps become time steps at the plan's paces (races stay in km) */
  return {
    title: `W${w.n} ${s.name} ${sesAmt(s, P)}`,
    fitTitle: `W${w.n} ${s.name} ${tm ? sesAmt(s, P).replace(/ /g, "") : s.km + "k"}`,
    file: `w${String(w.n).padStart(2, "0")}-${DAYS[s.day].toLowerCase()}-${slug(s.name)}`,
    wp: tm ? wpInUnit(sesWp(s), "t", sesEffort(s), P, true) : sesWp(s),
  };
}
const planWorkouts = (list) => list.map(({ w, s }) => planWorkout(w, s));
async function workoutBlob(it) {
  const [K, E] = await loadWK();
  const P = it.paces || paces(S.inputs);
  const wp = it.wp;
  const plan = new K.WorkoutPlan({ referenceId: crypto.randomUUID() });
  const cw = plan.asCustom({ activity: "running", location: "outdoor", displayName: it.title.slice(0, 48) });
  const goal = (g) =>
    g[0] === "d"
      ? new K.DistanceGoal(new K.Distance(Math.round(g[1] * 1000), "meters"))
      : new K.TimeGoal(new K.Duration(Math.round(g[1]), "seconds"));
  const alert = (pace) => {
    if (!hasPace(P, pace)) return undefined;
    const sec = P.sec[pace],
      tol = PACE_TOL[pace];
    const sp = (x) => new K.Speed(new K.Distance(1, "kilometers"), new K.Duration(Math.round(x), "seconds"));
    return new K.SpeedRangeAlert(sp(sec + tol), sp(sec - tol), "current");
  };
  if (wp.wu) cw.warmup = new K.Step(goal(wp.wu), t("warmup"));
  for (const b of wp.blocks) {
    const blk = cw.addBlock(Math.max(1, b.n));
    for (const x of b.steps)
      blk.addStep(
        x.p,
        goal(x.g),
        x.pace ? (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : undefined,
        alert(x.pace),
      );
  }
  if (wp.cd) cw.cooldown = new K.Step(goal(wp.cd), t("cooldown"));
  return E.toBlob(plan);
}
/* minimal ZIP writer (stored, no compression): .workout and .ics aren't on the download allowlist, .zip is */
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function makeZip(files) {
  const enc = new TextEncoder(),
    parts = [],
    central = [];
  let off = 0;
  const d = new Date(),
    dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff,
    dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  for (const f of files) {
    const name = enc.encode(f.name),
      data = f.data,
      crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true);
    h.setUint16(8, 0, true);
    h.setUint16(10, dt, true);
    h.setUint16(12, dd, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true);
    h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, dt, true);
    c.setUint16(14, dd, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  }
  const csize = central.reduce((a, x) => a + x.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, csize, true);
  e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: "application/zip" });
}
const slug = (t) =>
  String(t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
/* ---------- Garmin FIT workout encoder ---------- */
const FIT_CRC = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401, 0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01,
  0x8801, 0x4400,
];
function fitCrc(bytes, crc = 0) {
  for (const b of bytes) {
    let t = FIT_CRC[crc & 0xf];
    crc = (crc >> 4) & 0x0fff;
    crc = crc ^ t ^ FIT_CRC[b & 0xf];
    t = FIT_CRC[crc & 0xf];
    crc = (crc >> 4) & 0x0fff;
    crc = crc ^ t ^ FIT_CRC[(b >> 4) & 0xf];
  }
  return crc;
}
function fitEncodeWorkout(name, steps) {
  // steps: [{name,dur:'time'|'distance'|'open'|'repeat',val,target:{lo,hi}|null,intensity,repeatFrom,reps}]
  const out = [];
  const push = (...a) => {
    for (const x of a) out.push(x & 0xff);
  };
  const u16 = (v) => [v & 0xff, (v >> 8) & 0xff],
    u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
  const str = (s, n) => {
    const b = Array.from(new TextEncoder().encode(String(s || ""))).slice(0, n - 1);
    while (b.length < n) b.push(0);
    return b;
  };
  // file_id (local 0)
  push(0x40, 0, 0, ...u16(0), 5, 0, 1, 0x00, 1, 2, 0x84, 2, 2, 0x84, 3, 4, 0x8c, 4, 4, 0x86);
  const created = Math.floor(Date.now() / 1000) - 631065600;
  push(0x00, 5, ...u16(255), ...u16(0), ...u32(Math.floor(Math.random() * 0xfffffff) + 1), ...u32(created));
  // workout (local 1)
  push(0x41, 0, 0, ...u16(26), 3, 8, 24, 0x07, 4, 1, 0x00, 6, 2, 0x84);
  push(0x01, ...str(name, 24), 1, ...u16(steps.length));
  // workout_step (local 2)
  push(
    0x42,
    0,
    0,
    ...u16(27),
    9,
    254,
    2,
    0x84,
    0,
    16,
    0x07,
    1,
    1,
    0x00,
    2,
    4,
    0x86,
    3,
    1,
    0x00,
    4,
    4,
    0x86,
    5,
    4,
    0x86,
    6,
    4,
    0x86,
    7,
    1,
    0x00,
  );
  const DUR = { time: 0, distance: 1, open: 5, repeat: 6 };
  steps.forEach((s, i) => {
    let dv = 0xffffffff,
      tt = 2,
      tv = 0,
      lo,
      hi;
    if (s.dur === "time") dv = Math.round(s.val * 1000);
    else if (s.dur === "distance") dv = Math.round(s.val * 100);
    else if (s.dur === "repeat") {
      dv = s.repeatFrom;
      tt = 2;
      tv = s.reps;
    }
    if (s.dur === "repeat") {
      tt = 0xff;
      lo = 0xffffffff;
      hi = 0xffffffff;
    } else if (s.target) {
      tt = 0;
      tv = 0;
      lo = Math.round(s.target.lo * 1000);
      hi = Math.round(s.target.hi * 1000);
    } else {
      lo = 0xffffffff;
      hi = 0xffffffff;
    }
    push(
      0x02,
      ...u16(i),
      ...str(s.name, 16),
      DUR[s.dur],
      ...u32(dv),
      tt,
      ...u32(tv),
      ...u32(lo),
      ...u32(hi),
      s.dur === "repeat" ? 0xff : s.intensity,
    );
  });
  const data = Uint8Array.from(out);
  const hdr = [14, 0x10, ...u16(2132), ...u32(data.length), 0x2e, 0x46, 0x49, 0x54];
  const hc = fitCrc(hdr);
  const header = Uint8Array.from([...hdr, ...u16(hc)]);
  const crc = fitCrc(data, fitCrc(header));
  const file = new Uint8Array(header.length + data.length + 2);
  file.set(header, 0);
  file.set(data, header.length);
  file.set(u16(crc), header.length + data.length);
  return file;
}

function fitSteps(wp, P) {
  P = P || paces(S.inputs);
  const out = [];
  const goal = (g) => (g[0] === "d" ? { dur: "distance", val: g[1] * 1000 } : { dur: "time", val: g[1] });
  const tgt = (pace) => {
    if (!hasPace(P, pace)) return null;
    const sec = P.sec[pace],
      tol = PACE_TOL[pace];
    return { lo: 1000 / (sec + tol), hi: 1000 / (sec - tol) };
  };
  const lbl = (x) =>
    x.pace ? (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : x.p === "recovery" ? t("recover") : t("run");
  if (wp.wu) out.push({ name: t("warmup"), ...goal(wp.wu), target: null, intensity: 2 });
  for (const b of wp.blocks) {
    const from = out.length;
    for (const x of b.steps)
      out.push({ name: lbl(x), ...goal(x.g), target: tgt(x.pace), intensity: x.p === "recovery" ? 4 : 0 });
    if (b.n > 1) out.push({ name: "", dur: "repeat", repeatFrom: from, reps: b.n });
  }
  if (wp.cd) out.push({ name: t("cooldown"), ...goal(wp.cd), target: null, intensity: 3 });
  return out;
}
const DEVICES = [
  { k: "apple", name: () => "Apple Watch", ext: "workout", help: () => t("helpApple") },
  { k: "garmin", name: () => "Garmin", ext: "fit", help: () => t("helpGarmin") },
  { k: "other", name: () => t("devOther"), ext: "fit", help: () => t("helpOther") },
];
function getDevice() {
  try {
    return localStorage.getItem("bb-device") || "apple";
  } catch (_) {
    return "apple";
  }
}
function setDevice(k) {
  try {
    localStorage.setItem("bb-device", k);
  } catch (_) {}
}
function sendToWatch(items, title, zipBase) {
  let cur = getDevice();
  modal(
    html`<h2>${t("sendTitle")}</h2><p class="hint" style="margin:0">${esc(title)}</p>
  <div class="devices" role="radiogroup" aria-label="${t("device")}">${htmlJoin(DEVICES.map((d) => html`<button type="button" role="radio" class="device" data-dev="${d.k}" aria-checked="${d.k === cur}"><b>${esc(d.name())}</b><span>${t("devFiles", { ext: d.ext })}</span></button>`))}</div>
  <p class="hint" id="devHelp" style="margin:0"></p>
  <div class="actions"><button class="btn" id="dCancel">${t("cancel")}</button><button class="btn primary" id="dGo">${t("download")}</button></div>`,
    (m) => {
      const upd = () => {
        m.querySelectorAll(".device").forEach((b) => b.setAttribute("aria-checked", b.dataset.dev === cur));
        m.querySelector("#devHelp").textContent = DEVICES.find((d) => d.k === cur).help();
      };
      m.querySelector(".devices").onclick = (e) => {
        const b = e.target.closest(".device");
        if (b) {
          cur = b.dataset.dev;
          upd();
        }
      };
      m.querySelector("#dCancel").onclick = closeModal;
      m.querySelector("#dGo").onclick = () => {
        setDevice(cur);
        $$('#plan .today [data-act="twatch"]').forEach((b) => (b.textContent = sendLbl(b.dataset.n || "")));
        closeModal();
        exportWorkouts(cur, items, zipBase);
      };
      upd();
    },
  );
}
async function exportWorkouts(dev, items, zipBase) {
  const D = DEVICES.find((d) => d.k === dev);
  if (dev === "apple") {
    try {
      await loadWK();
    } catch (_) {
      toast(t("wkLoadFail"));
      return;
    }
  }
  const files = [],
    seen = new Map();
  for (const it of items) {
    /* two workouts with the same file name (same day, same type) get -2, -3 instead of overwriting each other on unzip (BB-15) */
    const n = (seen.get(it.file) || 0) + 1;
    seen.set(it.file, n);
    const base = n > 1 ? `${it.file}-${n}` : it.file;
    try {
      const data =
        dev === "apple"
          ? new Uint8Array(await (await workoutBlob(it)).arrayBuffer())
          : fitEncodeWorkout(it.fitTitle || it.title, fitSteps(it.wp, it.paces));
      files.push({ name: `${base}.${D.ext}`, data });
    } catch (e) {
      console.error(e);
      toast(t("buildFail", { name: it.title, m: (e && e.message) || t("unknownErr") }));
      return;
    }
  }
  if (!files.length) return;
  const name = (zipBase || files[0].name.replace(/\.\w+$/, "")) + "-" + D.k;
  try {
    dlSave({ filename: name + ".zip", data: makeZip(files) });
    toast(t(files.length > 1 ? "savedMany" : "savedOne", { n: files.length, dev: D.name(), help: D.help() }));
  } catch (e) {
    toast(downloadErr(e));
  }
}
function downloadErr(e) {
  return e && e.message ? t("dlFailM", { m: e.message }) : t("dlFail");
}

/* ---------- exports ---------- */
function dlSave({ filename, data }) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function saveFile(filename, data) {
  try {
    dlSave({ filename, data });
  } catch (e) {
    toast(t("dlFail"));
  }
}
const fname = (ext) =>
  (S.name || t("trainingBlock"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() +
  "." +
  ext;
function sessionDate(w, s) {
  return addDays(parseISO(w.start), s.day);
}
function exportICS() {
  const Pe = paces(S.inputs);
  const e = (v) => String(v).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const fold = (l) => {
    let out = "";
    while (l.length > 73) {
      out += l.slice(0, 73) + "\r\n ";
      l = l.slice(73);
    }
    return out + l;
  };
  const ymd = (d) => iso(d).replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Block Builder//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:" + e(S.name),
  ];
  for (const w of S.plan.weeks)
    for (const s of w.sessions) {
      const d = sessionDate(w, s);
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + s.id + "-" + ymd(d) + "@blockbuilder",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + ymd(d),
        "DTEND;VALUE=DATE:" + ymd(addDays(d, 1)),
        fold("SUMMARY:" + e(`${s.name} · ${sesAmt(s, Pe)}`)),
        fold(
          "DESCRIPTION:" +
            e(
              t("icsDesc", { n: w.n, phase: phaseLbl(w.phase), desc: s.desc }) +
                (s.note ? "\n\n" + t("icsNote") + s.note : ""),
            ),
        ),
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
      );
    }
  lines.push("END:VCALENDAR");
  saveFile(fname("ics"), new Blob([lines.join("\r\n")], { type: "text/calendar" }));
}
function exportCSV() {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [t("csvHead").split("|")];
  for (const w of S.plan.weeks)
    for (const s of w.sessions)
      rows.push([w.n, phaseLbl(w.phase), iso(sessionDate(w, s)), DAYS[s.day], s.name, s.km, s.desc, s.note]);
  saveFile(fname("csv"), new Blob(["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }));
}
S.exportFmt =
  (() => {
    try {
      return localStorage.getItem("bb-export-fmt");
    } catch (_) {
      return null;
    }
  })() === "pdf"
    ? "pdf"
    : "csv";

/* PDF: jsPDF + AutoTable, loaded on first use only */
let PDFLIB = null;
function loadScript(src, integrity) {
  return new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.integrity = integrity;
    s.crossOrigin = "anonymous";
    s.onload = ok;
    s.onerror = () => ko(new Error("load " + src));
    document.head.appendChild(s);
  });
}
function loadPDF() {
  if (!PDFLIB)
    PDFLIB = (async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js",
        "sha512-plOdviVmws4Y3JAvbnpfKb2hVxKM1lCwsi3vmElYRj+tiDLffZ4FVUj5a8vyKJ9pIgl8JCAHEJ4D1iUKBecswg==",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/5.0.9/jspdf.plugin.autotable.min.js",
        "sha512-p73fJ+Q5sCDFsEa54+EWEEWYipUV2Dc7L+E+yp6jSud5Ht1zbEqiI3OuatH5EDdDLxnOW/UN+FwBu8l+4klwLQ==",
      );
      const J = window.jspdf && window.jspdf.jsPDF;
      if (!J) throw new Error("jsPDF missing");
      const P = window.jspdf_autotable || {};
      if (!J.API.autoTable && typeof P.applyPlugin === "function") P.applyPlugin(J);
      const run = (doc, o) =>
        typeof doc.autoTable === "function"
          ? doc.autoTable(o)
          : typeof P.autoTable === "function"
            ? P.autoTable(doc, o)
            : (() => {
                throw new Error("AutoTable missing");
              })();
      return { J, run };
    })().catch((e) => {
      PDFLIB = null;
      throw e;
    });
  return PDFLIB;
}
/* built-in PDF fonts are Latin-1: map the typographic characters the plan uses, drop the rest */
const pdfTxt = (v) =>
  String(v ?? "")
    .replace(/[–—−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/→/g, "->")
    .replace(/≈/g, "~")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/[\u00a0\u202f\u2009]/g, " ")
    .replace(/[^\n\x20-\xFF]/g, "");
const PDF_KIND = {
  recovery: [79, 126, 171],
  easy: [43, 135, 104],
  long: [158, 124, 8],
  tempo: [198, 91, 31],
  hard: [201, 64, 90],
  race: [176, 75, 168],
};
const PDF_PHASE = {
  base: [143, 178, 165],
  build: [108, 147, 200],
  peak: [212, 84, 44],
  taper: [201, 164, 71],
  recovery: [138, 164, 174],
};
async function exportPDF(btn) {
  if (btn) btn.disabled = true;
  let lib;
  try {
    toast(t("pdfBuilding"));
    lib = await loadPDF();
  } catch (_) {
    if (btn) btn.disabled = false;
    toast(t("pdfLoadFail"));
    return;
  }
  try {
    const { J, run } = lib,
      I = S.inputs,
      W = S.plan.weeks;
    const doc = new J({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth(),
      ph = doc.internal.pageSize.getHeight(),
      M = 10;
    const totals = W.map((w) => w.sessions.reduce((a, s) => a + s.km, 0));
    const Pe = paces(S.inputs);
    const longest = Math.max(0, ...W.flatMap((w) => w.sessions.filter((s) => s.kind === "long").map((s) => s.km)));
    const start = parseISO(W[0].start),
      end = addDays(start, 7 * W.length - 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 32, 39);
    doc.text(pdfTxt(S.name), M, M + 6);
    const R = I.race && I.race.name ? I.race : null;
    const line1 = [
      distLabel(I),
      R ? `${t("pdfRace")}: ${R.name}${R.city ? " (" + R.city + ")" : ""}` : "",
      I.goal !== "fitness" ? fmtDay(parseISO(I.raceDate)) : "",
      `${fmtDate(start)} - ${fmtDate(end)}`,
    ]
      .filter(Boolean)
      .join("  ·  ");
    const line2 = [
      `${W.length} ${t("stWeeks")}`,
      `${Math.round(totals.reduce((a, b) => a + b, 0))} ${t("stTotal")}`,
      `${Math.round(Math.max(...totals))} ${t("stPeak")}`,
      `${longest} ${t("stLongest")}`,
    ].join("  ·  ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 106, 111);
    doc.text(pdfTxt(line1), M, M + 12);
    doc.text(pdfTxt(line2), M, M + 16.5);
    const body = [],
      meta = [];
    W.forEach((w, wi) => {
      const st = parseISO(w.start);
      const row = [
        `${t("wAbbr")}${w.n}\n${fmtShort(st)} - ${fmtShort(addDays(st, 6))}\n${phaseLbl(w.phase)}${w.cutback ? " · " + t("cutback") : ""}\n${RUN_UNIT === "t" ? estDur(w.sessions.reduce((a, s) => a + sesSec(s, Pe), 0)) : totals[wi].toFixed(1) + " km"}`,
      ];
      const kinds = [w.phase];
      for (let d = 0; d < 7; d++) {
        const ss = w.sessions.filter((s) => s.day === d);
        row.push(
          ss
            .map((s) => `${s.name} · ${sesAmt(s, Pe)}\n${s.desc}${s.note ? "\n" + t("note") + ": " + s.note : ""}`)
            .join("\n\n"),
        );
        kinds.push(ss.length ? sesEffort(ss[0]) : null);
      }
      body.push(row.map(pdfTxt));
      meta.push({ type: "week", kinds });
      if (w.note) {
        body.push([{ content: pdfTxt(`${t("note")}: ${w.note}`), colSpan: 8 }]);
        meta.push({ type: "note" });
      }
    });
    const dayW = (pw - 2 * M - 30) / 7;
    run(doc, {
      startY: M + 21,
      margin: { left: M, right: M, top: M, bottom: M + 5 },
      head: [[t("week"), ...DAYS].map(pdfTxt)],
      body,
      theme: "grid",
      showHead: "everyPage",
      rowPageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: 7.2,
        cellPadding: { top: 1.6, right: 1.6, bottom: 1.6, left: 2.6 },
        valign: "top",
        lineColor: [213, 221, 219],
        lineWidth: 0.2,
        textColor: [20, 32, 39],
        overflow: "linebreak",
      },
      headStyles: { fillColor: [20, 32, 39], textColor: 255, fontStyle: "bold", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: "bold" },
        ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((i) => [i, { cellWidth: dayW }])),
      },
      didParseCell: (h) => {
        if (h.section !== "body") return;
        const m = meta[h.row.index];
        if (!m) return;
        if (m.type === "note") {
          h.cell.styles.fillColor = [233, 238, 236];
          h.cell.styles.fontStyle = "italic";
          return;
        }
        if (h.column.index > 0 && m.kinds[h.column.index] === "race") h.cell.styles.fillColor = [245, 229, 243];
      },
      didDrawCell: (h) => {
        if (h.section !== "body") return;
        const m = meta[h.row.index];
        if (!m || m.type !== "week") return;
        const k = m.kinds[h.column.index];
        const c = h.column.index === 0 ? PDF_PHASE[k] : PDF_KIND[k];
        if (!c) return;
        doc.setFillColor(...c);
        doc.rect(h.cell.x + 0.4, h.cell.y + 0.6, 1.1, h.cell.height - 1.2, "F");
      },
    });
    /* BB-43: one line per built-in run type the plan uses, in the order they first appear */
    const used = [...new Set(W.flatMap((w) => w.sessions.map((s) => s.typeId)))].filter((id) => whyOf(id));
    if (used.length)
      run(doc, {
        startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : M + 21) + 6,
        margin: { left: M, right: M, top: M, bottom: M + 5 },
        rowPageBreak: "avoid",
        head: [[t("pdfWhyHead"), t("pdfWhyCol")].map(pdfTxt)],
        body: used.map((id) => {
          const ty = S.types.find((x) => x.id === id);
          return [pdfTxt((ty && ty.name) || t("ty_" + id)), pdfTxt(whyOf(id))];
        }),
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 7.6,
          cellPadding: 1.8,
          valign: "top",
          lineColor: [213, 221, 219],
          lineWidth: 0.2,
          textColor: [20, 32, 39],
        },
        headStyles: { fillColor: [20, 32, 39], textColor: 255, fontStyle: "bold", fontSize: 8 },
        columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" } },
      });
    const n = doc.internal.getNumberOfPages(),
      gen = t("pdfGenerated", { d: fmtDate(new Date()) });
    for (let p = 1; p <= n; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(90, 106, 111);
      doc.text(pdfTxt(`Block Builder · ${gen}`), M, ph - 5);
      doc.text(pdfTxt(t("pdfPage", { p, n })), pw - M, ph - 5, { align: "right" });
    }
    saveFile(fname("pdf"), doc.output("blob"));
  } catch (e) {
    toast(t("pdfFail", { m: (e && e.message) || t("unknownErr") }));
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ---------- persistence ---------- */
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
const nStr = (v, n) => (typeof v === "string" ? v : typeof v === "number" && isFinite(v) ? String(v) : "").slice(0, n);
const nIso = (v, d) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(parseISO(v)) ? v : d);
const nId = (v) => (typeof v === "string" && /^[\w-]{1,64}$/.test(v) ? v : null);
function safeUrl(v) {
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
function normalizeSaved(p) {
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
function snapshot() {
  return { name: S.name, inputs: S.inputs, types: S.types, plan: S.plan, edited: S.edited, updatedAt: Date.now() };
}
function setStatus(t) {
  $("#saveStatus").textContent = t;
  syncSaveUi();
}
let saveTimer = null;
/* BB-32: every plan but the example saves itself once its setup is complete; the example only through Keep this plan */
const canAutosave = () => !S.fromExample && !missingSetup(S.inputs).length;
function syncSaveUi() {
  $("#btnSave").hidden = !S.fromExample;
}
function markDirty() {
  S.dirty = true;
  if (S.savedAt || canAutosave()) {
    setStatus(t("unsaved"));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      savePlan(true);
    }, 1500);
  }
}
async function savePlan(auto) {
  if (missingSetup(S.inputs).length) {
    if (!auto) toast(t("needTitle"));
    return;
  }
  cancelSave();
  const data = snapshot();
  try {
    setStatus(t("saving"));
    {
      const all = lsAll();
      all[S.planId] = data;
      localStorage.setItem("bb-plans", JSON.stringify(all));
      refreshLocalList();
    }
    S.savedAt = Date.now();
    S.dirty = false;
    S.isExample = false;
    S.fromExample = false;
    syncSaveUi();
    bkNoteSave();
    askPersist();
    rememberPlan();
    S.savedLbl = null;
    setStatus(t("savedLocal") + " · " + new Date().toLocaleTimeString(LOC(), { hour: "2-digit", minute: "2-digit" }));
    if (!auto) {
      toast(t("planSaved"));
      renderPlan();
    }
  } catch (e) {
    setStatus(t("notSaved"));
    toast(t("saveFail"));
  }
}
/* BB-84: plans live only in this browser (ADR 0003). "bb-backup" remembers when they were last saved to a file (at),
 the first save since then (since) and a Later (snooze). The plan view reminds at most once a week while changes
 were never saved to a file; the browser is also asked to keep the storage (it may say no, silently). */
const BK_DAY = 864e5;
function bkGet() {
  try {
    const o = JSON.parse(localStorage.getItem("bb-backup") || "null");
    return o && typeof o === "object" ? o : {};
  } catch (_) {
    return {};
  }
}
function bkSet(o) {
  try {
    localStorage.setItem("bb-backup", JSON.stringify(o));
  } catch (_) {}
}
function bkNoteSave() {
  const b = bkGet();
  if (!(b.since > 0)) {
    b.since = Date.now();
    bkSet(b);
  }
}
function backupDue() {
  const b = bkGet(),
    now = Date.now();
  return S.saved.length > 0 && b.since > 0 && now - b.since >= 7 * BK_DAY && !(b.snooze > now);
}
function exportAllPlans() {
  saveFile(
    "block-builder-plans-" + iso(new Date()) + ".json",
    new Blob([JSON.stringify({ app: "block-builder", version: 1, plans: lsAll() }, null, 1)], {
      type: "application/json",
    }),
  );
  bkSet({ at: Date.now() });
}
let persistAsked = false;
function askPersist() {
  if (persistAsked) return;
  persistAsked = true;
  try {
    const st = navigator.storage;
    if (st && st.persist) st.persist().catch(() => {});
  } catch (_) {}
}
function lsAll() {
  try {
    return JSON.parse(localStorage.getItem("bb-plans") || "{}") || {};
  } catch (_) {
    return {};
  }
}
function refreshLocalList() {
  const all = lsAll();
  S.saved = Object.entries(all)
    .filter(([id]) => nId(id))
    .map(([id, d]) => {
      const n = normalizeSaved(d);
      return n && { id, ...n };
    })
    .filter(Boolean)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
/* autosave waits 1.5 s after the last change: write it now before anything replaces the current plan */
function flushSave() {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  if (S.dirty && (S.savedAt || canAutosave())) savePlan(true);
}
function cancelSave() {
  clearTimeout(saveTimer);
  saveTimer = null;
}
addEventListener("pagehide", flushSave);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushSave();
});
addEventListener("beforeunload", (e) => {
  flushSave();
  if (S.dirty && !S.savedAt && !S.isExample && !missingSetup(S.inputs).length) {
    e.preventDefault();
    e.returnValue = "";
  }
});
function loadPlan(p) {
  S.intake = 0;
  S.planId = p.id;
  S.name = p.name;
  S.nameAuto = false;
  S.volSug = null;
  S.fromExample = false;
  S.inputs = { ...DEFAULT_INPUTS(), ...JSON.parse(JSON.stringify(p.inputs)) };
  S.types = JSON.parse(JSON.stringify(p.types));
  S.plan = JSON.parse(JSON.stringify(p.plan));
  S.edited = !!p.edited;
  S.savedAt = p.updatedAt;
  S.isExample = false;
  S.pendingRegen = false;
  S.dirty = false;
  $("#planName").value = S.name;
  renderSetup();
  renderPlan();
  setStatus(
    t("savedLocal") + " · " + new Date(p.updatedAt).toLocaleDateString(LOC(), { day: "numeric", month: "short" }),
  );
  rememberPlan();
}
/* BB-88: the next visit reopens the plan open last ("bb-last"), or the most recently changed one if it is gone;
 the example only shows on a first visit or with no saved plans */
function rememberPlan() {
  try {
    localStorage.setItem("bb-last", S.planId);
  } catch (_) {}
}
function lastPlan() {
  let id = null;
  try {
    id = localStorage.getItem("bb-last");
  } catch (_) {}
  return S.saved.find((x) => x.id === id) || S.saved[0] || null;
}
function openPlans() {
  const list = S.saved;
  const bkAt = bkGet().at;
  modal(
    html`<h2>${t("myPlans")}</h2><p class="hint" style="margin:0">${t("localOnly")}</p><p class="hint" id="bkLast" style="margin:0">${bkAt > 0 ? t("bkLast", { d: new Date(bkAt).toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" }) }) : t("bkNever")}</p>
<div class="plans-list">${list.length ? htmlJoin(list.map((p) => html`<div class="pl ${p.id === S.planId ? "cur" : ""}"><div class="info"><b>${esc(p.name)}</b><span>${esc(cap(t(p.inputs && p.inputs.goal === "fitness" ? "planMetaFit" : "planMeta", { lbl: p.inputs ? distLabel(p.inputs) : "", w: p.plan ? p.plan.weeks.length : "?", d: p.inputs ? fmtDate(parseISO(p.inputs.goal === "fitness" ? (p.plan && p.plan.meta.start) || p.inputs.startDate : p.inputs.raceDate)) : "" })))}</span></div><button class="btn sm" data-open="${p.id}">${t("open")}</button><button class="btn sm ghost" data-delp="${p.id}">${t("del")}</button></div>`)) : html`<p class="hint" style="margin:0">${t("noPlans")}</p>`}</div>
<div class="actions"><button class="btn left" id="pImport">${t("importPlans")}</button><button class="btn" id="pExport" ${list.length ? "" : "disabled"}>${t("bkSave")}</button><button class="btn" id="pClose">${t("close")}</button></div>`,
    (m) => {
      m.querySelector("#pClose").onclick = closeModal;
      m.querySelector("#pExport").onclick = () => {
        exportAllPlans();
        const l = m.querySelector("#bkLast");
        if (l)
          l.textContent = t("bkLast", {
            d: new Date().toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" }),
          });
      };
      m.querySelector("#pImport").onclick = () => {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = ".json,application/json";
        inp.onchange = async () => {
          const f = inp.files && inp.files[0];
          if (!f) return;
          try {
            const j = JSON.parse(await f.text());
            const src = j && j.app === "block-builder" && j.plans && typeof j.plans === "object" ? j.plans : null;
            if (!src) throw 0;
            flushSave();
            /* BB-4: a plan already here (same id) is replaced only by a newer copy. The same version is skipped;
           when the copy here changed more recently, the file's version is added beside it as "(imported)". Nothing is lost. */
            const all = lsAll();
            let n = 0,
              copies = 0,
              same = 0,
              valid = 0,
              reopen = false;
            for (const [id0, p] of Object.entries(src)) {
              const c = normalizeSaved(p);
              if (!c) continue;
              valid++;
              const id = nId(id0) || uid();
              const here = all[id] ? normalizeSaved(all[id]) : null;
              if (!here || c.updatedAt > here.updatedAt) {
                all[id] = c;
                n++;
                if (here && id === S.planId) reopen = true;
              } else if (c.updatedAt === here.updatedAt && JSON.stringify(c) === JSON.stringify(here)) same++;
              else {
                all[uid()] = { ...c, name: nStr(t("copyName", { name: c.name }), 120) };
                n++;
                copies++;
              }
            }
            if (!valid) throw 0;
            localStorage.setItem("bb-plans", JSON.stringify(all));
            refreshLocalList();
            if (n) bkNoteSave();
            closeModal();
            if (reopen) {
              const cur = S.saved.find((x) => x.id === S.planId);
              if (cur) loadPlan(cur);
            }
            toast(
              n
                ? t("imported", { n }) +
                    (copies ? " " + t("impCopy", { n: copies }) : "") +
                    (same ? " " + t("impSame", { n: same }) : "")
                : t("impNone", { n: same }),
            );
            openPlans();
          } catch (_) {
            toast(t("importFail"));
          }
        };
        inp.click();
      };
      m.addEventListener("click", (e) => {
        const o = e.target.closest("[data-open]"),
          d = e.target.closest("[data-delp]");
        if (o) {
          flushSave();
          const p = S.saved.find((x) => x.id === o.dataset.open);
          closeModal();
          if (p) loadPlan(p);
        }
        if (d) {
          const p = S.saved.find((x) => x.id === d.dataset.delp);
          closeModal();
          confirmBox(t("delQ"), t("delT", { name: p.name }), t("del"), async () => {
            try {
              if (p.id === S.planId) cancelSave();
              {
                const all = lsAll();
                delete all[p.id];
                localStorage.setItem("bb-plans", JSON.stringify(all));
                refreshLocalList();
              }
              if (p.id === S.planId) {
                S.savedAt = null;
                S.planId = uid();
                setStatus(t("notSaved"));
              }
              toast(t("deleted"));
            } catch (_) {
              toast(t("delFail"));
            }
          });
        }
      });
    },
  );
}
/* ---------- setup steps on phones (BB-34) ----------
 A new plan on a phone walks Goal, Race (or Focus), Running now and Week one at a time, each checked before Next.
 The sections are the same ones the full form shows; "Show all settings" leaves the steps. */
const phoneLayout = () => {
  try {
    return matchMedia("(max-width:900px)").matches;
  } catch (_) {
    return false;
  }
};
const STEP_NAMES = () => ["secGoal", S.inputs.goal === "fitness" ? "secFocus" : "secRace", "secNow", "secYourWeek"];
function renderIntro() {
  syncMode();
  const A = $("#setup"),
    nav = $("#introNav"),
    n = S.intake || 0;
  if (!A || !nav) return;
  if (n) A.dataset.step = n;
  else delete A.dataset.step;
  nav.hidden = !n;
  if (!n) {
    clearHtml(nav);
    return;
  }
  const ready = !missingSetup(S.inputs).length && S.plan;
  const prev =
    n >= 3
      ? ready
        ? html`<div class="intro-prev"><span class="lbl">${t("loadProfile")}</span><div class="chart">${profileSVG(S.plan.weeks, Math.max(260, (A.clientWidth || 340) - 8))}</div></div>`
        : html`<p class="hint intro-wait">${t("introWait")}</p>`
      : "";
  setHtml(
    nav,
    html`${prev}<p class="intro-err" id="introErr" role="alert">${esc(S.introErr || "")}</p>
  <div class="intro-bar"><button type="button" class="btn" data-intro="back" ${n === 1 ? "hidden" : ""}>${t("introBack")}</button>
  <span class="intro-step">${t("introStep", { n, name: t(STEP_NAMES()[n - 1]) })}</span>
  <button type="button" class="btn primary" data-intro="next">${t(n === 4 ? "introDone" : "introNext")}</button></div>
  <button type="button" class="linkbtn intro-skip" data-intro="skip">${t("introSkip")}</button>`,
  );
}
function introGo(n) {
  S.intake = n;
  S.introErr = "";
  renderSetup();
  const A = $("#setup");
  if (A && A.scrollIntoView) A.scrollIntoView({ block: "start" });
}
$("#setup").addEventListener("click", (e) => {
  const c = e.target.closest(".icard"),
    b = e.target.closest("[data-intro]");
  if (c && c.dataset.goal && S.intake === 1) {
    introGo(2);
    return;
  }
  if (!b) return;
  const a = b.dataset.intro,
    n = S.intake || 0;
  if (a === "quick") {
    openQuick();
    return;
  }
  if (a === "back" && n > 1) introGo(n - 1);
  else if (a === "skip") {
    S.intake = 0;
    S.introErr = "";
    renderSetup();
  } else if (a === "next") {
    const need = missingSetup(S.inputs).filter((k) => SETUP_STEP[k] === n);
    if (need.length) {
      S.introErr = t("introNeed") + " " + need.map((k) => t(k)).join(" ");
      renderIntro();
      return;
    }
    if (n < 4) introGo(n + 1);
    else {
      S.intake = 0;
      S.introErr = "";
      renderSetup();
      renderPlan();
      setTab("plan");
    }
  }
});
function newPlan() {
  flushSave();
  const go = () => {
    S.nameAuto = true;
    S.volSug = null;
    S.fromExample = false;
    S.inputs = BLANK_INPUTS();
    S.types = BLANK_TYPES();
    S.planId = uid();
    S.savedAt = null;
    S.isExample = false;
    S.dirty = false;
    S.pendingRegen = false;
    S.name = cap(t("blockName", { lbl: t("lhm") }));
    $("#planName").value = S.name;
    S.intake = phoneLayout() ? 1 : 0;
    S.introErr = "";
    regen();
    renderSetup();
    renderPlan();
    setStatus(t("notSaved"));
    if (S.intake) setTab("setup");
  };
  if (S.dirty && S.savedAt === null && !S.isExample) confirmBox(t("newQ"), t("newT"), t("startNew"), go);
  else go();
}

/* ---------- header ---------- */
$("#planName").addEventListener("input", fitName);
try {
  document.fonts.ready.then(fitName);
} catch (_) {}
$("#planName").addEventListener("change", (e) => {
  S.nameAuto = !e.target.value.trim();
  S.name = e.target.value.trim() || t("trainingBlock");
  e.target.value = S.name;
  markDirty();
});
$("#btnSave").onclick = () => savePlan(false);
/* ---------- phones: plan mode and the Edit plan sheet (BB-29) ---------- */
let sheetOpener = null;
function syncMode() {
  const on = !S.intake && !missingSetup(S.inputs).length;
  document.body.classList.toggle("planmode", on);
  if (!on && document.body.classList.contains("sheet")) closeSheet(true);
}
const INERT = () => [...$$("header.top,#mtabs,#mbar,main.plan,footer.ver,.hello")];
function openSheet() {
  if (!document.body.classList.contains("planmode") || !phoneLayout()) return false;
  if (document.body.classList.contains("sheet")) return true;
  const a = document.activeElement;
  sheetOpener =
    a && a !== document.body
      ? a
      : lastTrigger && lastTrigger.isConnected && !lastTrigger.closest("#setup")
        ? lastTrigger
        : $("#btnEditPlan"); /* Safari doesn't focus a tapped button */
  const A = $("#setup");
  document.body.classList.add("sheet");
  $("#sheetBg").hidden = false;
  A.setAttribute("role", "dialog");
  A.setAttribute("aria-modal", "true");
  A.setAttribute("aria-labelledby", "sheetTitle");
  A.tabIndex = -1;
  A.scrollTop = 0;
  INERT().forEach((el) => (el.inert = true));
  A.focus({ preventScroll: true });
  return true;
}
function closeSheet(quiet) {
  if (!document.body.classList.contains("sheet")) return;
  const A = $("#setup");
  document.body.classList.remove("sheet");
  $("#sheetBg").hidden = true;
  ["role", "aria-modal", "aria-labelledby"].forEach((k) => A.removeAttribute(k));
  A.removeAttribute("tabindex");
  INERT().forEach((el) => (el.inert = false));
  const o = sheetOpener;
  sheetOpener = null;
  if (!quiet && o && o.isConnected) o.focus({ preventScroll: true });
}
$("#btnEditPlan").addEventListener("click", openSheet);
$("#btnSheetDone").addEventListener("click", () => closeSheet());
$("#sheetBg").addEventListener("click", () => closeSheet());
/* capture phase: runs before the dialog's own Escape handler, so Escape on a dialog opened from the sheet closes only that dialog */
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Escape" || !document.body.classList.contains("sheet") || $("#modalRoot").firstChild) return;
    closeSheet();
  },
  true,
);
function setTab(tab) {
  if (document.body.classList.contains("planmode") && phoneLayout()) {
    if (tab === "setup") openSheet();
    else closeSheet();
    return;
  }
  document.body.dataset.tab = tab;
  $$("#mtabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
  const L = $(".layout"),
    m = $("#mtabs");
  if (L && m) {
    const top = L.getBoundingClientRect().top;
    const h = m.offsetHeight + 12;
    if (top < h) window.scrollTo({ top: Math.max(0, top + scrollY - h) });
  }
}
document.addEventListener("click", (e) => {
  const b = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-tab],[data-tabgo]"));
  if (b && (b.closest("#mtabs") || b.dataset.tabgo)) setTab(b.dataset.tab || b.dataset.tabgo);
});
$("#btnPlans").onclick = openPlans;
$("#btnNew").onclick = newPlan;
$("#btnQuick").onclick = () => openQuick();

function applyStatic() {
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $$("[data-i18n-html]").forEach((el) => {
    setHtml(el, html`${t(el.dataset.i18nHtml)}`);
  });
  $$("[data-i18n-ph]").forEach((el) => {
    /** @type {HTMLInputElement} */ (el).placeholder = t(el.dataset.i18nPh);
  });
  $$("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  $("#langSel").value = LANG;
  syncTheme();
  syncRunUnit();
}
function syncRunUnit() {
  $$("#runUnitSeg [data-run-unit]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.runUnit === RUN_UNIT)),
  );
}
function syncTheme() {
  const v = document.documentElement.dataset.theme || "dark";
  $$("#themeSeg [data-theme-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeV === v)));
}
function setLang(l) {
  if (l === LANG || !I18N[l]) return;
  const prevName = defaultName();
  const from = LANG;
  useLang(l);
  translateTypes(S.types, from, l);
  if (S.name === prevName || S.name === I18N[from].trainingBlock) {
    S.name = S.name === prevName ? defaultName() : t("trainingBlock");
    $("#planName").value = S.name;
  }
  if (S.edited) {
    toast(t("langEdited"));
  } else {
    const wasDirty = S.dirty;
    regen();
    if (S.savedAt) markDirty();
    else S.dirty = wasDirty;
  }
  applyStatic();
  renderSetup();
  renderPlan();
  const st = $("#saveStatus");
  if (st && !S.savedAt) setStatus(t("notSaved"));
}
$("#langSel").addEventListener("change", (e) => setLang(e.target.value));
$("#themeSeg").addEventListener("click", (e) => {
  const b = e.target.closest("[data-theme-v]");
  if (!b) return;
  const v = b.dataset.themeV;
  document.documentElement.dataset.theme = v;
  try {
    localStorage.setItem("bb-theme", v);
  } catch (_) {}
  syncTheme();
});
$("#runUnitSeg").addEventListener("click", (e) => {
  const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-run-unit]"));
  if (!b || b.dataset.runUnit === RUN_UNIT) return;
  useRunUnit(b.dataset.runUnit === "t" ? "t" : "d");
  syncRunUnit();
  renderPlan();
});
/* Display and language panel: opens from the gear, closes on Escape (focus back to the gear) or a tap outside */
function setPrefs(open, focusBack) {
  const P = $("#prefsPanel"),
    B = $("#btnPrefs");
  P.hidden = !open;
  B.setAttribute("aria-expanded", String(open));
  if (open) {
    placePrefs();
    (P.querySelector('[aria-pressed="true"]') || P.querySelector("button,select")).focus({ preventScroll: true });
  } else if (focusBack) B.focus({ preventScroll: true });
}
/* BB-92: the header wraps, so the gear can sit at the left of a line, where the right-aligned panel would hang off
   the screen (864-1056 px wide). Measure it once open and shift it to stay 8 px inside the viewport. */
function placePrefs() {
  const P = $("#prefsPanel");
  P.style.right = "";
  const r = P.getBoundingClientRect(),
    vw = document.documentElement.clientWidth,
    m = 8;
  const dx = r.left < m ? m - r.left : r.right > vw - m ? vw - m - r.right : 0;
  if (dx) P.style.right = `${-dx}px`;
}
/* and again whenever the gear may have moved while it is open: a window resize, or anything in the header changing
   size (language switch, save status text, plan name), which re-wraps the header without a resize event */
const replacePrefs = () => {
  if (!$("#prefsPanel").hidden) placePrefs();
};
window.addEventListener("resize", replacePrefs);
if (typeof ResizeObserver === "function") {
  const ro = new ResizeObserver(replacePrefs);
  for (const el of $("header.top").children) if (el.id !== "prefs") ro.observe(el);
}
/* Quick workout from the Goal row (BB-58): an action next to the goal, not a third goal; the plan is left as it is */
$("#btnQuickGoal").addEventListener("click", () => openQuick());
$("#btnPrefs").addEventListener("click", () => setPrefs($("#prefsPanel").hidden));
$("#prefs").addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#prefsPanel").hidden) {
    e.stopPropagation();
    setPrefs(false, true);
  }
});
$("#prefs").addEventListener("focusout", (e) => {
  if (e.relatedTarget && !$("#prefs").contains(e.relatedTarget)) setPrefs(false);
});
document.addEventListener("click", (e) => {
  if (!$("#prefsPanel").hidden && !(/** @type {HTMLElement} */ (e.target).closest("#prefs"))) setPrefs(false);
});

applyStatic();
regen();
renderSetup();
$("#planName").value = S.name;
renderPlan();
setStatus(t("notSaved"));
refreshLocalList();
if (S.saved.length && !(bkGet().since > 0) && !(bkGet().at > 0)) bkNoteSave();
{
  const last = lastPlan();
  if (last) loadPlan(last);
}
