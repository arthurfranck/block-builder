// @ts-check
/* Language: the current one, t() to look strings up, day names and date formats (BB-76). */

import { I18N } from "./strings.js";
import { trustedHtml, esc, SafeHtml, plainText } from "./html.js";
import { TYPE_DEFS, PHASES, iso } from "./engine-api.js";

export let LANG = (() => {
  try {
    const s = localStorage.getItem("bb-lang");
    if (s === "fr" || s === "en") return s;
  } catch (_) {}
  return /^fr/i.test(navigator.language || "") ? "fr" : "en";
})();
export function t(k, v) {
  let s = I18N[LANG] && I18N[LANG][k];
  if (s == null) s = I18N.en[k] != null ? I18N.en[k] : k;
  /* BB-78: a string with markup (<b>, <code>) comes back as safe HTML with its values escaped, and so does a plain
     string given a markup value (html`<b>…</b>`), its own text escaped. Every other string is plain text; a value
     pre-escaped with esc() goes in as its original text. */
  const has = (x) => v && v[x] !== undefined;
  if (/[<&]/.test(s)) return trustedHtml(v ? s.replace(/\{(\w+)\}/g, (m, x) => (has(x) ? String(esc(v[x])) : m)) : s);
  if (v && Object.values(v).some((x) => x instanceof SafeHtml && x.text === undefined))
    return trustedHtml(
      s
        .split(/(\{\w+\})/)
        .map((p) => {
          const x = /^\{(\w+)\}$/.exec(p);
          return String(esc(x && has(x[1]) ? v[x[1]] : p));
        })
        .join(""),
    );
  return v ? s.replace(/\{(\w+)\}/g, (m, x) => (has(x) ? plainText(v[x]) : m)) : s;
}
export const cap = (x) => String(x).charAt(0).toUpperCase() + String(x).slice(1);
export const LOC = () => (LANG === "fr" ? "fr-FR" : "en-GB");
export let DAYS = t("days").split("|"),
  DAYS1 = t("days1").split("|");
/** Switch the interface language: strings, day names, and the choice kept on this device. */
export function useLang(l) {
  LANG = l;
  try {
    localStorage.setItem("bb-lang", l);
  } catch (_) {}
  DAYS = t("days").split("|");
  DAYS1 = t("days1").split("|");
}
export const phaseLbl = (p) => t("ph_" + p);
const KINDS_KEYS = { easy: "kEasy", recovery: "kRecovery", long: "kLong", hard: "kHard" };
export const kindLbl = (k) => t(KINDS_KEYS[k] || "kHard");

export const DEFAULT_TYPES = () =>
  TYPE_DEFS.map(([id, kind, on, locked, ph]) => ({
    id,
    name: t("ty_" + id),
    kind,
    on,
    ...(locked ? { locked: true } : {}),
    phases: ph ? ph.slice() : PHASES.slice(),
    tpl: t("tp_" + id),
  }));
export function translateTypes(types, from, to) {
  for (const ty of types) {
    const id = TYPE_DEFS.some((d) => d[0] === ty.id) ? ty.id : "custom";
    if (ty.name === I18N[from]["ty_" + id]) ty.name = I18N[to]["ty_" + id];
    if (ty.tpl === I18N[from]["tp_" + id]) ty.tpl = I18N[to]["tp_" + id];
  }
}

export function nextSundayWeeks(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7) + 7 * n);
  return iso(d);
}
export const fmtDate = (d) => d.toLocaleDateString(LOC(), { day: "numeric", month: LANG === "fr" ? "long" : "short" });
export const fmtShort = (d) => d.toLocaleDateString(LOC(), { day: "numeric", month: "short" });
export const fmtDay = (d) =>
  d.toLocaleDateString(
    LOC(),
    LANG === "fr"
      ? { weekday: "long", day: "numeric", month: "long" }
      : { weekday: "short", day: "numeric", month: "short" },
  );
