// @ts-check
/* Editing the plan in place: clicks, drag and drop of runs, adding runs (BB-76). */

import { S, regen } from "./state.js";
import { renderPlan } from "./plan-view.js";
import { paces, uid, fill, iso } from "./engine-api.js";
import { $ } from "./dom.js";
import { t, fmtDay } from "./i18n.js";
import { WX, renderWx, wxGeo } from "./weather.js";
import { openQuick } from "./quick.js";
import { confirmBox } from "./modal.js";
import { openEditor } from "./editor.js";
import { sendToWatch, planWorkouts, slug } from "./watch.js";
import { sessionDate, exportICS, exportCSV, exportPDF } from "./exports.js";
import { markDirty, exportAllPlans, bkGet, BK_DAY, bkSet } from "./storage.js";

let drag = null;
export function moveSession(wi, id, d) {
  const w = S.plan.weeks[wi];
  const s = w.sessions.find((x) => x.id === id);
  if (!s || s.day === d) return;
  const other = w.sessions.filter((x) => x.day === d);
  other.forEach((o) => (o.day = s.day));
  s.day = d;
  w.sessions.sort((a, b) => a.day - b.day);
  touched();
}
export function touched() {
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
export function initPlanEdit() {
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
}
