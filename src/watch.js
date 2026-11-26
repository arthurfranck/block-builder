// @ts-check
/* Watch workouts: Apple Watch .workout files (WorkoutKit), zips, and sending to a device (BB-76). */

import { t, LOC, DAYS } from "./i18n.js";
import { paces, r05 } from "./engine-api.js";
import { S } from "./state.js";
import { inTime, sesAmt, sesWp } from "./workout.js";
import { wpInUnit } from "./quick.js";
import { modal, closeModal, toast } from "./modal.js";
import { html, esc, htmlJoin } from "./html.js";
import { $$ } from "./dom.js";
import { sendLbl } from "./today.js";
import { fitEncodeWorkout, fitSteps } from "./fit.js";
import { dlSave } from "./exports.js";
import { sesEffort } from "./effort.js";

export const PACE_TOL = { easy: 25, tempo: 8, interval: 8, rep: 6, race: 6, mp: 8, custom: 8 };
/* a step has a number pace when paces come from a race time, or when the runner typed that pace (quick workout fine-tune) */
export const hasPace = (P, k) => !!(k && (P.vdot || (P.fixed && P.fixed[k])));
export const paceLbl = (k) => t("pl_" + k);
export function gTxt(g) {
  if (g[0] === "d") {
    const m = Math.round(g[1] * 1000);
    return m < 1000 || m % 1000
      ? m >= 1000
        ? (m / 1000).toLocaleString(LOC(), { maximumFractionDigits: 1 }) + " km"
        : m + " m"
      : m / 1000 + " km";
  }
  const z = g[1];
  return z >= 60
    ? z % 60
      ? Math.floor(z / 60) + ":" + String(z % 60).padStart(2, "0") + " min"
      : z / 60 + " min"
    : z + " s";
}
function stepTxt(x, P) {
  return (
    gTxt(x.g) +
    (x.pace ? " @ " + (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : "") +
    (x.p === "recovery" ? t("recoverySfx") : "")
  );
}
export function watchSummary(wp, P) {
  P = P || paces(S.inputs);
  const parts = [];
  if (wp.wu) parts.push(t("warmup") + " " + gTxt(wp.wu));
  for (const b of wp.blocks) {
    const st = b.steps.map((x) => stepTxt(x, P)).join(", ");
    parts.push(b.n > 1 ? `${b.n} × (${st})` : st);
  }
  if (wp.cd) parts.push(t("cooldown") + " " + gTxt(wp.cd));
  return parts.join(" · ");
}
export function rescaleWatch(wp, delta) {
  wp = JSON.parse(JSON.stringify(wp));
  if (wp.wu && wp.cd) {
    wp.cd = ["d", r05(Math.max(0.5, wp.cd[1] + delta))];
    return wp;
  }
  const st = wp.blocks[0] && wp.blocks[0].n === 1 && wp.blocks[0].steps.find((x) => x.g[0] === "d");
  if (st) st.g = ["d", r05(Math.max(0.5, st.g[1] + delta))];
  return wp;
}
let WK = null;
function loadWK() {
  if (!WK)
    WK = Promise.all([
      // Loaded at runtime from the page's folder, not bundled (esbuild --external:./vendor/*), so tsc can't resolve it from src/.
      // @ts-expect-error
      import("./vendor/workoutkit-0.2.0/index.js"),
      // @ts-expect-error
      import("./vendor/workoutkit-0.2.0/encode.js"),
    ]).catch((e) => {
      WK = null;
      throw e;
    });
  return WK;
}
/* a workout to export: {title, fitTitle, file, wp, paces?}. Plan runs and BB-58 quick workouts share it, so export needs no plan week. */
function planWorkout(w, s) {
  const P = paces(S.inputs),
    tm = inTime(s); /* BB-54: in minutes, distance steps become time steps at the plan's paces (races stay in km) */
  return {
    title: `W${w.n} ${s.name} ${sesAmt(s, P)}`,
    fitTitle: `W${w.n} ${s.name} ${tm ? sesAmt(s, P).replace(/ /g, "") : s.km + "k"}`,
    file: `w${String(w.n).padStart(2, "0")}-${DAYS[s.day].toLowerCase()}-${slug(s.name)}`,
    wp: tm ? wpInUnit(sesWp(s), "t", sesEffort(s), P, true) : sesWp(s),
  };
}
export const planWorkouts = (list) => list.map(({ w, s }) => planWorkout(w, s));
async function workoutBlob(it) {
  const [K, E] = await loadWK();
  const P = it.paces || paces(S.inputs);
  const wp = it.wp;
  const plan = new K.WorkoutPlan({ referenceId: crypto.randomUUID() });
  const cw = plan.asCustom({ activity: "running", location: "outdoor", displayName: it.title.slice(0, 48) });
  const goal = (g) =>
    g[0] === "d"
      ? new K.DistanceGoal(new K.Distance(Math.round(g[1] * 1000), "meters"))
      : new K.TimeGoal(new K.Duration(Math.round(g[1]), "seconds"));
  const alert = (pace) => {
    if (!hasPace(P, pace)) return undefined;
    const sec = P.sec[pace],
      tol = PACE_TOL[pace];
    const sp = (x) => new K.Speed(new K.Distance(1, "kilometers"), new K.Duration(Math.round(x), "seconds"));
    return new K.SpeedRangeAlert(sp(sec + tol), sp(sec - tol), "current");
  };
  if (wp.wu) cw.warmup = new K.Step(goal(wp.wu), t("warmup"));
  for (const b of wp.blocks) {
    const blk = cw.addBlock(Math.max(1, b.n));
    for (const x of b.steps)
      blk.addStep(
        x.p,
        goal(x.g),
        x.pace ? (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : undefined,
        alert(x.pace),
      );
  }
  if (wp.cd) cw.cooldown = new K.Step(goal(wp.cd), t("cooldown"));
  return E.toBlob(plan);
}
/* minimal ZIP writer (stored, no compression): .workout and .ics aren't on the download allowlist, .zip is */
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function makeZip(files) {
  const enc = new TextEncoder(),
    parts = [],
    central = [];
  let off = 0;
  const d = new Date(),
    dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff,
    dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  for (const f of files) {
    const name = enc.encode(f.name),
      data = f.data,
      crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true);
    h.setUint16(8, 0, true);
    h.setUint16(10, dt, true);
    h.setUint16(12, dd, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true);
    h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, dt, true);
    c.setUint16(14, dd, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  }
  const csize = central.reduce((a, x) => a + x.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, csize, true);
  e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: "application/zip" });
}
export const slug = (t) =>
  String(t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const DEVICES = [
  { k: "apple", name: () => "Apple Watch", ext: "workout", help: () => t("helpApple") },
  { k: "garmin", name: () => "Garmin", ext: "fit", help: () => t("helpGarmin") },
  { k: "other", name: () => t("devOther"), ext: "fit", help: () => t("helpOther") },
];
export function getDevice() {
  try {
    return localStorage.getItem("bb-device") || "apple";
  } catch (_) {
    return "apple";
  }
}
export function setDevice(k) {
  try {
    localStorage.setItem("bb-device", k);
  } catch (_) {}
}
export function sendToWatch(items, title, zipBase) {
  let cur = getDevice();
  modal(
    html`<h2>${t("sendTitle")}</h2><p class="hint" style="margin:0">${esc(title)}</p>
  <div class="devices" role="radiogroup" aria-label="${t("device")}">${htmlJoin(DEVICES.map((d) => html`<button type="button" role="radio" class="device" data-dev="${d.k}" aria-checked="${d.k === cur}"><b>${esc(d.name())}</b><span>${t("devFiles", { ext: d.ext })}</span></button>`))}</div>
  <p class="hint" id="devHelp" style="margin:0"></p>
  <div class="actions"><button class="btn" id="dCancel">${t("cancel")}</button><button class="btn primary" id="dGo">${t("download")}</button></div>`,
    (m) => {
      const upd = () => {
        m.querySelectorAll(".device").forEach((b) => b.setAttribute("aria-checked", b.dataset.dev === cur));
        m.querySelector("#devHelp").textContent = DEVICES.find((d) => d.k === cur).help();
      };
      m.querySelector(".devices").onclick = (e) => {
        const b = e.target.closest(".device");
        if (b) {
          cur = b.dataset.dev;
          upd();
        }
      };
      m.querySelector("#dCancel").onclick = closeModal;
      m.querySelector("#dGo").onclick = () => {
        setDevice(cur);
        $$('#plan .today [data-act="twatch"]').forEach((b) => (b.textContent = sendLbl(b.dataset.n || "")));
        closeModal();
        exportWorkouts(cur, items, zipBase);
      };
      upd();
    },
  );
}
export async function exportWorkouts(dev, items, zipBase) {
  const D = DEVICES.find((d) => d.k === dev);
  if (dev === "apple") {
    try {
      await loadWK();
    } catch (_) {
      toast(t("wkLoadFail"));
      return;
    }
  }
  const files = [],
    seen = new Map();
  for (const it of items) {
    /* two workouts with the same file name (same day, same type) get -2, -3 instead of overwriting each other on unzip (BB-15) */
    const n = (seen.get(it.file) || 0) + 1;
    seen.set(it.file, n);
    const base = n > 1 ? `${it.file}-${n}` : it.file;
    try {
      const data =
        dev === "apple"
          ? new Uint8Array(await (await workoutBlob(it)).arrayBuffer())
          : fitEncodeWorkout(it.fitTitle || it.title, fitSteps(it.wp, it.paces));
      files.push({ name: `${base}.${D.ext}`, data });
    } catch (e) {
      console.error(e);
      toast(t("buildFail", { name: it.title, m: (e && e.message) || t("unknownErr") }));
      return;
    }
  }
  if (!files.length) return;
  const name = (zipBase || files[0].name.replace(/\.\w+$/, "")) + "-" + D.k;
  try {
    dlSave({ filename: name + ".zip", data: makeZip(files) });
    toast(t(files.length > 1 ? "savedMany" : "savedOne", { n: files.length, dev: D.name(), help: D.help() }));
  } catch (e) {
    toast(downloadErr(e));
  }
}
function downloadErr(e) {
  return e && e.message ? t("dlFailM", { m: e.message }) : t("dlFail");
}
