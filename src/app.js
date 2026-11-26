// @ts-check
/* Block Builder app, the entry module (BB-76): imports each feature module, wires its events in the page's
   original order and starts the page. The features live in their own modules (ADR 0008); esbuild bundles them with
   the engine into ../app.js, a classic script, so the built page still opens from disk (file://).
   Run `npm run build` after editing. */
import { BBEngine } from "./engine-api.js";
import { initPrefs, applyStatic } from "./prefs.js";
import { $ } from "./dom.js";
import { t, DAYS, fmtDate } from "./i18n.js";
import { regen, S } from "./state.js";
import { initSetup, renderSetup } from "./setup.js";
import { initPlanView, renderPlan, fitName } from "./plan-view.js";
import { initToday } from "./today.js";
import { initRaceBox } from "./race.js";
import { initPlanEdit } from "./plan-edit.js";
import { initModal } from "./modal.js";
import { initExports } from "./exports.js";
import {
  initStorage,
  setStatus,
  markDirty,
  savePlan,
  refreshLocalList,
  bkGet,
  bkNoteSave,
  lastPlan,
  loadPlan,
} from "./storage.js";
import { initIntro } from "./intro.js";
import { initSheet } from "./sheet.js";

const VERSION = "1.14.3";
$("#appVersion").textContent = "Block Builder v" + VERSION;
BBEngine.setLocale({ t, days: () => DAYS, fmtDate });
initSetup();
initPlanView();
initToday();
initRaceBox();
initPlanEdit();
initModal();
initExports();
initStorage();
initIntro();

$("#planName").addEventListener("input", fitName);
try {
  document.fonts.ready.then(fitName);
} catch (_) {}
$("#planName").addEventListener("change", (e) => {
  S.nameAuto = !e.target.value.trim();
  S.name = e.target.value.trim() || t("trainingBlock");
  e.target.value = S.name;
  markDirty();
});
$("#btnSave").onclick = () => savePlan(false);
initSheet();
initPrefs();

applyStatic();
regen();
renderSetup();
$("#planName").value = S.name;
renderPlan();
setStatus(t("notSaved"));
refreshLocalList();
if (S.saved.length && !(bkGet().since > 0) && !(bkGet().at > 0)) bkNoteSave();
{
  const last = lastPlan();
  if (last) loadPlan(last);
}
