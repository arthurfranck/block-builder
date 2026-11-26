// @ts-check
/* The settings form: goal, race, your running now, run types; its hints and warnings (BB-76). */

import { $, $$, cardDetails } from "./dom.js";
import { volIsSuggested, S, regen, defaultName, suggestVolume } from "./state.js";
import {
  longOf,
  DISTS,
  nextMonday,
  recWeeksOf,
  levelOf,
  LEVELS,
  paces,
  parseISO,
  missingSetup,
  SETUP_STEP,
  addDays,
  distLabel,
  badRaceTime,
  badTimeMsg,
  PHASES,
  clamp,
  DEFAULT_DAYS,
  uid,
  raceTimeSec,
  fmtDur,
} from "./engine-api.js";
import { setHtml, htmlJoin, html, esc } from "./html.js";
import { t, DAYS1, DAYS, fmtDate, fmtDay, kindLbl, DEFAULT_TYPES, phaseLbl } from "./i18n.js";
import { renderPlan } from "./plan-view.js";
import { renderRaceBox } from "./race.js";
import { markDirty } from "./storage.js";
import { renderIntro } from "./intro.js";
import { effColor, effort } from "./effort.js";

function renderVolHint() {
  $("#volHint").hidden = !volIsSuggested();
}
/* BB-72: an empty longest run shows the estimate the plan uses */
function renderLongPh() {
  const I = S.inputs;
  /** @type {HTMLInputElement} */ ($("#curLong")).placeholder = +I.curVol > 0 ? "≈ " + longOf(I) : "";
}

export function renderSetup() {
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
export function initSetup() {
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
        el.type === "number" && el.value === ""
          ? ""
          : el.type === "number" || el.id === "longDay"
            ? +el.value
            : el.value;
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
}
