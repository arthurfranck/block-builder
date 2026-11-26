// @ts-check
/* Phones: plan mode, the Edit plan sheet and the tabs (BB-29, BB-76). */

import { S } from "./state.js";
import { missingSetup } from "./engine-api.js";
import { $$, $ } from "./dom.js";
import { phoneLayout, newPlan } from "./intro.js";
import { lastTrigger } from "./modal.js";
import { openPlans } from "./storage.js";
import { openQuick } from "./quick.js";

let sheetOpener = null;
export function syncMode() {
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
export function setTab(tab) {
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
export function initSheet() {
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
  document.addEventListener("click", (e) => {
    const b = /** @type {HTMLElement|null} */ (
      /** @type {HTMLElement} */ (e.target).closest("[data-tab],[data-tabgo]")
    );
    if (b && (b.closest("#mtabs") || b.dataset.tabgo)) setTab(b.dataset.tab || b.dataset.tabgo);
  });
  $("#btnPlans").onclick = openPlans;
  $("#btnNew").onclick = newPlan;
  $("#btnQuick").onclick = () => openQuick();
}
