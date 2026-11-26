// @ts-check
/* Dialogs, confirm boxes and toasts, with focus kept and given back (BB-76). */

import { $ } from "./dom.js";
import { setHtml, html, clearHtml, esc } from "./html.js";
import { t } from "./i18n.js";

/* dialogs: named by their heading, Tab stays inside, focus goes back to the opener on close */
export let modalOpener = null,
  lastTrigger = null;
function openerKey(el) {
  if (el.id) return "#" + CSS.escape(el.id);
  const at = ["data-act", "data-w", "data-s", "data-d"].filter((a) => el.hasAttribute(a));
  return at.length ? at.map((a) => `[${a}="${CSS.escape(el.getAttribute(a))}"]`).join("") : null;
}
export function modal(body, onMount) {
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
export function closeModal() {
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
export function confirmBox(title, text, okLabel, ok) {
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
export function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  $("#toastRoot").appendChild(t);
  setTimeout(() => t.remove(), Math.max(2600, msg.length * 60));
}
export function initModal() {
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
}
