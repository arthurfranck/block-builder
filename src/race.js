// @ts-check
/* The optional race card: name, link and countdown (BB-76). */

import { distKm, parseISO, distLabel } from "./engine-api.js";
import { S } from "./state.js";
import { $ } from "./dom.js";
import { setHtml, html, esc } from "./html.js";
import { fmtDate, t } from "./i18n.js";
import { renderHello, renderPlan } from "./plan-view.js";
import { toast } from "./modal.js";
import { safeUrl } from "./plan-file.js";
import { markDirty } from "./storage.js";

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
export function renderRaceBox() {
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
export function initRaceBox() {
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
}
