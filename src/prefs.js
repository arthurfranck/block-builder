// @ts-check
/* Display preferences kept on this device (BB-76): runs in km or minutes; theme and language panel. */

import { LANG, t, useLang, translateTypes } from "./i18n.js";
import { $$, $ } from "./dom.js";
import { setHtml, html } from "./html.js";
import { I18N } from "./strings.js";
import { defaultName, S, regen } from "./state.js";
import { toast } from "./modal.js";
import { markDirty, setStatus } from "./storage.js";
import { renderSetup } from "./setup.js";
import { renderPlan } from "./plan-view.js";
import { openQuick } from "./quick.js";

/* runs shown in km or minutes (BB-54): a display preference on this device; plans are still built and saved in km */
export let RUN_UNIT = (() => {
  try {
    if (localStorage.getItem("bb-run-unit") === "t") return "t";
  } catch (_) {}
  return "d";
})();
/** Show runs in km ("d") or minutes ("t"), kept on this device. */
function useRunUnit(u) {
  RUN_UNIT = u;
  try {
    localStorage.setItem("bb-run-unit", u);
  } catch (_) {}
}

export function applyStatic() {
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
export function initPrefs() {
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
}
