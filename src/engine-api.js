// @ts-check
/* The plan engine as the interface uses it: every name app code takes from engine.js (BB-76). Typed any until the engine has JSDoc types (BB-70). */

import * as engine from "./engine.js";

/** Typed as any for now, as before the move to modules: the engine has no JSDoc types yet (BB-70). @type {any} */
export const BBEngine = engine;

export const {
  SETUP_FIELDS,
  warningItems,
  SETUP_STEP,
  WEEK_PHASES,
  recWeeksOf,
  LEVELS,
  levelOf,
  suggestVol,
  longOf,
  durSec,
  kmIn,
  DISTS,
  PHASES,
  DEFAULT_DAYS,
  TYPE_DEFS,
  uid,
  clamp,
  r05,
  iso,
  parseISO,
  addDays,
  dow,
  raceTimeSec,
  badRaceTime,
  badTimeMsg,
  fmtPace,
  fmtDur,
  distKm,
  missingSetup,
  genInputs,
  distLabel,
  cat,
  paces,
  workFor,
  fill,
  watchPlan,
  generate,
  weekChecks,
  nextMonday,
} = BBEngine;
