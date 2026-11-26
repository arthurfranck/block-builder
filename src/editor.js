// @ts-check
/* The run editor dialog (BB-76). */

import { TYPE_DEFS, watchPlan, paces, workFor, distKm, cat, fill } from "./engine-api.js";
import { t, DAYS } from "./i18n.js";
import { html, esc, htmlJoin, setHtml } from "./html.js";
import { S } from "./state.js";
import { modal, closeModal } from "./modal.js";
import { touched, moveSession } from "./plan-edit.js";
import { sesAmt } from "./workout.js";
import { sendToWatch, watchSummary, planWorkouts, rescaleWatch } from "./watch.js";

/* "Why this run" (BB-43): purpose and how it should feel, for the built-in run types; custom types and race day have none */
export const whyOf = (id) => (TYPE_DEFS.some((d) => d[0] === id) ? t("why_" + id) : "");
export const whyHtml = (id) => {
  const w = whyOf(id);
  return w ? html`<b>${t("whyLbl")}</b> ${esc(w)}` : "";
};
export function openEditor(wi, id) {
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
