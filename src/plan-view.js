// @ts-check
/* The plan view: load profile chart, warnings, week grid; the hello card (BB-76). */

import {
  dow,
  parseISO,
  addDays,
  SETUP_FIELDS,
  missingSetup,
  paces,
  warningItems,
  badRaceTime,
  fmtDur,
  distLabel,
  weekChecks,
} from "./engine-api.js";
import { fmtDate, fmtDay, phaseLbl, t, cap, DAYS, fmtShort } from "./i18n.js";
import { html, esc, setHtml, htmlJoin, clearHtml } from "./html.js";
import { $ } from "./dom.js";
import { S } from "./state.js";
import { RUN_UNIT } from "./prefs.js";
import { renderWx, wxLoad } from "./weather.js";
import { estDur, sesSec, sesAmt } from "./workout.js";
import { renderToday } from "./today.js";
import { backupDue } from "./storage.js";
import { syncMode } from "./sheet.js";
import { effColor, sesEffort, effText } from "./effort.js";

const phaseColor = (p) => `var(--ph-${p})`;
export const phaseText = (p) => `var(--ph-${p}-t)`;
export function profileSVG(weeks, W) {
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
export function fitName() {
  const el = /** @type {HTMLInputElement} */ ($("#planName"));
  if (!el) return;
  try {
    nameCtx = nameCtx || document.createElement("canvas").getContext("2d");
    const cs = getComputedStyle(el);
    nameCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    el.style.width = Math.min(320, Math.ceil(nameCtx.measureText(el.value || "").width) + 18) + "px";
  } catch (_) {}
}
export function renderPlan() {
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
export function initPlanView() {
  try {
    new ResizeObserver(() => {
      const el = $("#profileChart");
      if (el && Math.abs(el.clientWidth - chartW) > 4) drawProfile();
    }).observe($("#plan"));
  } catch (_) {}
}

/* greeting */
export function renderHello() {
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
