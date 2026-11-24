/* Safe HTML (BB-78). Every value put into an html`` template is escaped unless it is already marked safe,
   and setHtml is the only way to write markup into the page (ESLint forbids innerHTML elsewhere).

     html`<b>${name}</b>`        name is escaped; the result is SafeHtml
     html`<ul>${items}</ul>`     arrays are joined; null and undefined render nothing; booleans as text (aria-*)
     esc(s)                      escaped text, marked safe; keeps the original text for plain-text use
     htmlJoin(list)              joins SafeHtml pieces (escapes any plain string among them)
     trustedHtml(s)              marks a string written by us (translations with <b>) as safe: never user data
     setHtml(el, value)          writes SafeHtml (or an array of it); throws on a plain string */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escapeText = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

export class SafeHtml {
  /** @param {string} s markup that is safe to insert  @param {string} [text] the plain text it came from, if any */
  constructor(s, text) {
    this.s = s;
    this.text = text;
  }
  toString() {
    return this.s;
  }
}

/** @param {unknown} v @returns {string} */
function part(v) {
  if (v instanceof SafeHtml) return v.s;
  if (Array.isArray(v)) return v.map(part).join("");
  if (v === null || v === undefined) return "";
  return escapeText(v);
}

/** @param {TemplateStringsArray} strings @param {...unknown} values */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += part(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

/** Escaped text, marked safe. @param {unknown} s */
export function esc(s) {
  if (s instanceof SafeHtml) return s;
  const text = String(s ?? "");
  return new SafeHtml(escapeText(text), text);
}

/** @param {unknown[]} list @param {string} [sep] plain text between the pieces (escaped) */
export const htmlJoin = (list, sep = "") => new SafeHtml(list.map(part).join(part(sep)));

/** Our own markup (translations, constants). Never pass user data. @param {string} s */
export const trustedHtml = (s) => new SafeHtml(String(s));

/** Plain text of a value: the original text of esc(), else the value as a string. @param {unknown} v */
export const plainText = (v) => (v instanceof SafeHtml ? (v.text ?? v.s) : String(v));

/** @param {Element} el @param {SafeHtml | Array<SafeHtml | string | null | undefined | false> | ""} value  ("" empties the element; plain strings in an array are escaped) */
export function setHtml(el, value) {
  if (value === "") return clearHtml(el);
  if (!(value instanceof SafeHtml) && !Array.isArray(value))
    throw new TypeError("setHtml needs html`` output, not a plain string (BB-78)");
  el.innerHTML = part(value);
}

/** @param {Element} el */
export const clearHtml = (el) => el.replaceChildren();
