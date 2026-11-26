// @ts-check
/* Saving plans in this browser: autosave, backups reminder, My plans (BB-76). */

import { S, DEFAULT_INPUTS } from "./state.js";
import { $ } from "./dom.js";
import { missingSetup, iso, distLabel, parseISO, uid } from "./engine-api.js";
import { t, LOC, cap, fmtDate } from "./i18n.js";
import { toast, modal, closeModal, confirmBox } from "./modal.js";
import { renderPlan } from "./plan-view.js";
import { saveFile } from "./exports.js";
import { nId, normalizeSaved, nStr } from "./plan-file.js";
import { renderSetup } from "./setup.js";
import { html, htmlJoin, esc } from "./html.js";

function snapshot() {
  return { name: S.name, inputs: S.inputs, types: S.types, plan: S.plan, edited: S.edited, updatedAt: Date.now() };
}
export function setStatus(t) {
  $("#saveStatus").textContent = t;
  syncSaveUi();
}
let saveTimer = null;
/* BB-32: every plan but the example saves itself once its setup is complete; the example only through Keep this plan */
const canAutosave = () => !S.fromExample && !missingSetup(S.inputs).length;
function syncSaveUi() {
  $("#btnSave").hidden = !S.fromExample;
}
export function markDirty() {
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
export async function savePlan(auto) {
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
export const BK_DAY = 864e5;
export function bkGet() {
  try {
    const o = JSON.parse(localStorage.getItem("bb-backup") || "null");
    return o && typeof o === "object" ? o : {};
  } catch (_) {
    return {};
  }
}
export function bkSet(o) {
  try {
    localStorage.setItem("bb-backup", JSON.stringify(o));
  } catch (_) {}
}
export function bkNoteSave() {
  const b = bkGet();
  if (!(b.since > 0)) {
    b.since = Date.now();
    bkSet(b);
  }
}
export function backupDue() {
  const b = bkGet(),
    now = Date.now();
  return S.saved.length > 0 && b.since > 0 && now - b.since >= 7 * BK_DAY && !(b.snooze > now);
}
export function exportAllPlans() {
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
export function refreshLocalList() {
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
export function flushSave() {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  if (S.dirty && (S.savedAt || canAutosave())) savePlan(true);
}
function cancelSave() {
  clearTimeout(saveTimer);
  saveTimer = null;
}
export function loadPlan(p) {
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
export function lastPlan() {
  let id = null;
  try {
    id = localStorage.getItem("bb-last");
  } catch (_) {}
  return S.saved.find((x) => x.id === id) || S.saved[0] || null;
}
export function openPlans() {
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
export function initStorage() {
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
}
