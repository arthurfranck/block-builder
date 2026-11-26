// @ts-check
/* Setup steps on phones (BB-34) and starting a new plan (BB-76). */

import { S, BLANK_INPUTS, BLANK_TYPES, regen } from "./state.js";
import { $ } from "./dom.js";
import { clearHtml, html, setHtml, esc } from "./html.js";
import { missingSetup, uid, SETUP_STEP } from "./engine-api.js";
import { t, cap } from "./i18n.js";
import { profileSVG, renderPlan } from "./plan-view.js";
import { renderSetup } from "./setup.js";
import { flushSave, setStatus } from "./storage.js";
import { confirmBox } from "./modal.js";
import { openQuick } from "./quick.js";
import { syncMode, setTab } from "./sheet.js";

/* ---------- setup steps on phones (BB-34) ----------
 A new plan on a phone walks Goal, Race (or Focus), Running now and Week one at a time, each checked before Next.
 The sections are the same ones the full form shows; "Show all settings" leaves the steps. */
export const phoneLayout = () => {
  try {
    return matchMedia("(max-width:900px)").matches;
  } catch (_) {
    return false;
  }
};
const STEP_NAMES = () => ["secGoal", S.inputs.goal === "fitness" ? "secFocus" : "secRace", "secNow", "secYourWeek"];
export function renderIntro() {
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
export function newPlan() {
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
export function initIntro() {
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
}
