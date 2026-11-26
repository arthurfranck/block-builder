// @ts-check
/* The plan being edited (S), its defaults, and rebuilding it from the settings (BB-76). */

import { distLabel, generate, genInputs, uid, suggestVol, nextMonday, DEFAULT_DAYS } from "./engine-api.js";
import { cap, t, nextSundayWeeks, DEFAULT_TYPES } from "./i18n.js";

export const DEFAULT_INPUTS = () => ({
  goal: "race",
  startDate: nextMonday(),
  dist: "hm",
  customKm: 15,
  raceDate: nextSundayWeeks(12),
  weeks: 12,
  curVol: 30,
  curLong: 12,
  recDist: "10",
  recTime: "52:00",
  level: "regular",
  recWeeks: 0,
  runs: 5,
  days: DEFAULT_DAYS[5].slice(),
  longDay: 6,
  race: null,
});

/* New plan starts empty; the plan only builds once runs per week, weekly volume and longest run are filled in. */
export const BLANK_INPUTS = () => ({
  ...DEFAULT_INPUTS(),
  dist: "",
  raceDate: "",
  weeks: "",
  curVol: "",
  curLong: "",
  recDist: "0",
  recTime: "",
  runs: 0,
  days: [],
  longDay: -1,
  race: null,
});
export const BLANK_TYPES = () => DEFAULT_TYPES().map((x) => ({ ...x, on: x.id === "easy" }));

export const S = {
  nameAuto: true,
  inputs: /** @type {Record<string, any>} */ (DEFAULT_INPUTS()),
  types: DEFAULT_TYPES(),
  plan: null,
  planId: uid(),
  name: cap(t("blockName", { lbl: t("lhm") })),
  edited: false,
  savedAt: null,
  isExample: true,
  saved: [],
  saving: false,
  dirty: false,
  volSug: null,
  fromExample: true,
};
/* BB-71: Weekly volume follows the suggestion for the level and distance while it is empty or still holds the last
 suggestion (S.volSug). A typed value, a loaded plan's and the example's are never replaced. */
export const volIsSuggested = () => S.volSug != null && S.inputs.curVol !== "" && +S.inputs.curVol === S.volSug;
export function suggestVolume() {
  const I = S.inputs;
  if (I.curVol !== "" && !volIsSuggested()) return;
  const v = suggestVol(I);
  if (v == null) return;
  I.curVol = v;
  S.volSug = v;
}

export function regen() {
  const g = generate(genInputs(S.inputs), S.types);
  S.plan = g;
  S.edited = false;
}

export function defaultName() {
  const I = S.inputs;
  return I.goal === "fitness" ? cap(t("fitBlock", { n: I.weeks })) : cap(t("blockName", { lbl: distLabel(I) }));
}
