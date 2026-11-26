/* Block Builder: built from src/ by esbuild (npm run build). Edit src/, not this file. */
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/engine.js
  var engine_exports = {};
  __export(engine_exports, {
    CUT_EVERY: () => CUT_EVERY,
    DEFAULT_DAYS: () => DEFAULT_DAYS,
    DISTS: () => DISTS,
    LEVELS: () => LEVELS,
    LONG_MAX_MIN: () => LONG_MAX_MIN,
    LONG_SHARE: () => LONG_SHARE,
    PHASES: () => PHASES,
    REC_EX: () => REC_EX,
    REC_LBL: () => REC_LBL,
    SETUP_FIELDS: () => SETUP_FIELDS,
    SETUP_STEP: () => SETUP_STEP,
    TYPE_DEFS: () => TYPE_DEFS,
    VOL_SUGGEST: () => VOL_SUGGEST,
    WEEK_PHASES: () => WEEK_PHASES,
    addDays: () => addDays,
    badRaceTime: () => badRaceTime,
    badTimeMsg: () => badTimeMsg,
    cat: () => cat,
    clamp: () => clamp,
    cyc: () => cyc,
    distKm: () => distKm,
    distLabel: () => distLabel,
    dow: () => dow,
    durSec: () => durSec,
    effectiveDays: () => effectiveDays,
    fill: () => fill,
    fmtDur: () => fmtDur,
    fmtPace: () => fmtPace,
    genInputs: () => genInputs,
    generate: () => generate,
    iso: () => iso,
    kmIn: () => kmIn,
    levelOf: () => levelOf,
    longBoxedIn: () => longBoxedIn,
    longOf: () => longOf,
    longTyped: () => longTyped,
    maxHardRuns: () => maxHardRuns,
    missingSetup: () => missingSetup,
    nextMonday: () => nextMonday,
    paces: () => paces,
    parseISO: () => parseISO,
    pickHardDays: () => pickHardDays,
    r05: () => r05,
    raceDesc: () => raceDesc,
    raceTimeMin: () => raceTimeMin,
    raceTimeSec: () => raceTimeSec,
    recWeeksOf: () => recWeeksOf,
    setLocale: () => setLocale,
    suggestVol: () => suggestVol,
    uid: () => uid,
    vdotOf: () => vdotOf,
    velAt: () => velAt,
    warningItems: () => warningItems,
    warnings: () => warnings,
    watchPlan: () => watchPlan,
    weekCheckSummary: () => weekCheckSummary,
    weekChecks: () => weekChecks,
    workFor: () => workFor
  });
  var LOCALE = {
    t: (k, v) => v ? k + " " + JSON.stringify(v) : k,
    days: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    fmtDate: (d) => d.toISOString().slice(0, 10)
  };
  function t(k, v) {
    return LOCALE.t(k, v);
  }
  var dayName = (d) => LOCALE.days()[d];
  var fmtDate = (d) => LOCALE.fmtDate(d);
  var cap = (x) => String(x).charAt(0).toUpperCase() + String(x).slice(1);
  var DISTS = [
    { k: "5k", km: 5 },
    { k: "10k", km: 10 },
    { k: "hm", km: 21.0975 },
    { k: "m", km: 42.195 },
    { k: "custom", km: null }
  ];
  var PHASES = ["base", "build", "peak", "taper"];
  var WEEK_PHASES = [
    ...PHASES,
    "recovery"
  ];
  var DEFAULT_DAYS = {
    1: [6],
    2: [3, 6],
    3: [1, 3, 6],
    4: [1, 2, 4, 6],
    5: [0, 1, 3, 4, 6],
    6: [0, 1, 2, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6]
  };
  var uid = () => Math.random().toString(36).slice(2, 10);
  var clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  var r05 = (v) => Math.round(v * 2) / 2;
  var TYPE_DEFS = [
    ["easy", "easy", true, true, null],
    ["long", "long", true, false, null],
    ["recovery", "recovery", true, false, null],
    ["strides", "easy", true, false, null],
    ["tempo", "hard", true, false, ["build", "peak"]],
    ["intervals", "hard", true, false, ["build", "peak"]],
    ["hills", "hard", true, false, ["base", "build"]],
    ["fartlek", "hard", false, false, ["base", "build"]],
    ["progression", "hard", false, false, ["base", "build", "peak"]],
    ["racepace", "hard", true, false, ["peak", "taper"]]
  ];
  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseISO(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  }
  function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }
  function dow(d) {
    return (d.getDay() + 6) % 7;
  }
  function raceTimeSec(s, km) {
    if (s == null || !(km > 0)) return null;
    const p = String(s).trim().split(":");
    if (!p.length || p.length > 3 || p.some((x) => !/^\d{1,3}$/.test(x))) return null;
    const n = p.map(Number);
    if (n.slice(1).some((x) => x > 59)) return null;
    const cands = n.length === 3 ? [n[0] * 3600 + n[1] * 60 + n[2]] : n.length === 2 ? [n[0] * 60 + n[1], n[0] * 3600 + n[1] * 60] : [n[0] * 60];
    for (const sec of cands) {
      if (sec <= 0) continue;
      const vd = vdotOf(km * 1e3, sec / 60);
      if (vd > 15 && vd < 90) return sec;
    }
    return null;
  }
  var REC_LBL = { 5: "l5k", 10: "l10k", 21.0975: "lhm", 42.195: "lm" };
  var REC_EX = { 5: "25:00", 10: "52:00", 21.0975: "1:55:00", 42.195: "4:00:00" };
  var badRaceTime = (inp) => +inp.recDist > 0 && String(inp.recTime || "").trim() !== "" && raceTimeSec(inp.recTime, +inp.recDist) == null;
  function badTimeMsg(inp) {
    const k = String(+inp.recDist);
    return t("wa_badTime", {
      time: String(inp.recTime).trim(),
      lbl: t(REC_LBL[k] || "l10k"),
      ex: REC_EX[k] || "52:00"
    });
  }
  var vo2 = (v) => -4.6 + 0.182258 * v + 104e-6 * v * v;
  var pctMax = (t3) => 0.8 + 0.1894393 * Math.exp(-0.012778 * t3) + 0.2989558 * Math.exp(-0.1932605 * t3);
  var vdotOf = (m, tmin) => vo2(m / tmin) / pctMax(tmin);
  var velAt = (o) => (-0.182258 + Math.sqrt(0.182258 ** 2 + 4 * 104e-6 * (4.6 + o))) / (2 * 104e-6);
  function raceTimeMin(vd, m) {
    let lo = 3, hi = 900;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (vdotOf(m, mid) > vd) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }
  var fmtPace = (sec) => {
    const s = Math.round(sec);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + "/km";
  };
  function fmtDur(sec) {
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }
  var durSec = (km, secKm) => km * secKm;
  var kmIn = (sec, secKm) => sec / secKm;
  var LONG_SHARE = (runs) => runs <= 1 ? 1 : runs === 2 ? 0.5 : runs === 3 ? 0.45 : 0.4;
  var LONG_MAX_MIN = { hm: 150, m: 180 };
  var LONG_STEP_KM = 2;
  var LONG_STEP_MIN = 15;
  var LEVELS = ["new", "regular", "experienced"];
  function levelOf(inp) {
    return LEVELS.includes(inp && inp.level) ? inp.level : "regular";
  }
  var CUT_EVERY = (lv) => lv === "new" ? 3 : 4;
  var recWeeksOf = (inp) => inp && inp.goal !== "fitness" ? clamp(Math.round(+inp.recWeeks || 0), 0, 2) : 0;
  function distKm(inp) {
    const d = DISTS.find((x) => x.k === inp.dist);
    return d && d.km ? d.km : clamp(+inp.customKm || 10, 3, 100);
  }
  var longTyped = (inp) => +inp.curLong > 0;
  function longOf(inp) {
    return longTyped(inp) ? +inp.curLong : clamp(r05(0.35 * (+inp.curVol || 25)), 3, 45);
  }
  var VOL_SUGGEST = { new: [12, 20, 30, 40], regular: [30, 40, 55, 70], experienced: [50, 65, 80, 100] };
  function suggestVol(inp) {
    if (!inp || !DISTS.some((d) => d.k === inp.dist)) return null;
    const row = VOL_SUGGEST[levelOf(inp)], kms = [5, 10, 21.0975, 42.195], k = clamp(distKm(inp), 5, 42.195);
    let i = 0;
    while (i < kms.length - 2 && k > kms[i + 1]) i++;
    const f = (k - kms[i]) / (kms[i + 1] - kms[i]);
    return Math.round(row[i] + f * (row[i + 1] - row[i]));
  }
  var SETUP_STEP = { needDist: 2, needDate: 2, needWeeks: 2, needVol: 3, needRuns: 4 };
  function missingSetup(I) {
    const m = [];
    if (!DISTS.some((d) => d.k === I.dist)) m.push("needDist");
    if (I.goal !== "fitness" && !I.raceDate) m.push("needDate");
    if (!(+I.weeks >= 3)) m.push("needWeeks");
    if (!(+I.curVol > 0)) m.push("needVol");
    if (!(+I.runs >= 1)) m.push("needRuns");
    return m;
  }
  function nextMonday() {
    const d = /* @__PURE__ */ new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    return iso(d);
  }
  function nextSundayIn(weeks) {
    const d = /* @__PURE__ */ new Date();
    d.setHours(12, 0, 0, 0);
    return iso(addDays(d, (7 - d.getDay()) % 7 + 7 * weeks));
  }
  function genInputs(I) {
    return {
      ...I,
      dist: DISTS.some((d) => d.k === I.dist) ? I.dist : "hm",
      raceDate: I.raceDate || nextSundayIn(12),
      weeks: +I.weeks >= 3 ? +I.weeks : 12,
      runs: +I.runs >= 1 ? +I.runs : 5,
      days: +I.runs >= 1 ? I.days : [],
      curVol: +I.curVol > 0 ? I.curVol : 30,
      curLong: +I.curLong > 0 ? I.curLong : ""
    };
  }
  function distLabel(inp) {
    if (!inp.dist) return "";
    return inp.dist === "custom" ? (+inp.customKm || 10) + " km" : t("l" + inp.dist);
  }
  function cat(D) {
    return D <= 6 ? "5k" : D <= 12 ? "10k" : D <= 25 ? "hm" : "m";
  }
  function paces(inp) {
    const D = distKm(inp) * 1e3, rd = +inp.recDist, rt = raceTimeSec(inp.recTime, rd);
    if (rd > 0 && rt) {
      const vd = vdotOf(rd * 1e3, rt / 60);
      if (vd > 15 && vd < 90) {
        const sp = (f) => 6e4 / velAt(vd * f);
        const raceMin = raceTimeMin(vd, D), mMin = raceTimeMin(vd, 42195);
        const s = {
          easy: sp(0.7),
          tempo: sp(0.88),
          interval: sp(0.975),
          rep: sp(1.04),
          race: raceMin * 60 / (D / 1e3),
          mp: mMin * 60 / 42.195
        };
        return {
          vdot: vd,
          raceSec: raceMin * 60,
          sec: s,
          txt: Object.fromEntries(Object.entries(s).map(([k, v]) => [k, fmtPace(v)]))
        };
      }
    }
    const sec = { easy: 400, tempo: 330, interval: 305, rep: 290, race: 330, mp: 345 };
    return {
      vdot: null,
      sec,
      txt: Object.fromEntries(["easy", "tempo", "interval", "rep", "race", "mp"].map((k) => [k, t("pe_" + k)]))
    };
  }
  function effectiveDays(inp) {
    const d = [...new Set(inp.days)].filter((x) => x >= 0 && x < 7).sort((a, b) => a - b);
    return d.length === inp.runs ? d : DEFAULT_DAYS[inp.runs].slice();
  }
  function cyc(a, b) {
    const x = Math.abs(a - b);
    return Math.min(x, 7 - x);
  }
  function* combos(arr, k, start = 0, acc = []) {
    if (acc.length === k) {
      yield acc.slice();
      return;
    }
    for (let i = start; i < arr.length; i++) {
      acc.push(arr[i]);
      yield* combos(arr, k, i + 1, acc);
      acc.pop();
    }
  }
  function pickHardDays(cands, k, longD, raceWeek) {
    if (k <= 0) return [];
    let best = null, bp = Infinity;
    for (const c of combos(cands, Math.min(k, cands.length))) {
      let p = 0;
      for (let i = 0; i < c.length; i++) {
        if (cyc(c[i], longD) <= 1) p += c[i] === (longD + 6) % 7 ? 6 : 10;
        for (let j = i + 1; j < c.length; j++) if (cyc(c[i], c[j]) <= 1) p += 12;
        if (raceWeek) {
          const before = (longD - c[i] + 7) % 7;
          if (before < 3) p += 30;
          p += Math.abs(before - 4);
        }
      }
      if (p < bp) {
        bp = p;
        best = c;
      }
    }
    return best || [];
  }
  function workFor(ty, ctx) {
    const { p, c, taper, P } = ctx;
    const tf = (taper ? 0.65 : 1) * (ctx.scale || 1);
    const S2 = P.sec;
    switch (ty.id) {
      case "tempo": {
        let mins = Math.round((15 + 15 * p) * tf);
        if (c === "5k") mins = Math.min(mins, 24);
        if (p < 0.35 && !taper) {
          const n = Math.max(2, Math.round(mins / 8));
          return {
            text: t("w_tempoCruise", { n }),
            km: n * 8 * 60 / S2.tempo + n * 0.25,
            wucd: 4,
            main: [
              {
                n,
                steps: [
                  { p: "work", g: ["t", 480], pace: "tempo" },
                  { p: "recovery", g: ["t", 90], pace: null }
                ]
              }
            ]
          };
        }
        return {
          text: t("w_tempoCont", { mins }),
          km: mins * 60 / S2.tempo,
          wucd: 4,
          main: [{ n: 1, steps: [{ p: "work", g: ["t", mins * 60], pace: "tempo" }] }]
        };
      }
      case "intervals": {
        const sets = {
          "5k": [400, 800, 1e3],
          "10k": [800, 1e3, 1200],
          hm: [1e3, 1200, 1600],
          m: [1e3, 1600, 2e3]
        }[c];
        const rep = sets[p < 0.34 ? 0 : p < 0.67 ? 1 : 2];
        const tot = (c === "5k" || c === "10k" ? 3 + 2.5 * p : 4 + 3 * p) * tf;
        const n = clamp(Math.round(tot * 1e3 / rep), 3, 12);
        const rec = t(rep <= 800 ? "jog90" : rep <= 1200 ? "jog120" : "jog180");
        const recS = rep <= 800 ? 90 : rep <= 1200 ? 120 : 180;
        return {
          text: t("w_int", { n, rep, rec }),
          km: n * rep / 1e3 + n * 0.3,
          wucd: 4,
          main: [
            {
              n,
              steps: [
                { p: "work", g: ["d", rep / 1e3], pace: rep <= 400 ? "rep" : "interval" },
                { p: "recovery", g: ["t", recS], pace: null }
              ]
            }
          ]
        };
      }
      case "hills": {
        const n = Math.round((6 + 4 * p) * tf);
        return {
          text: t("w_hills", { n }),
          km: n * 0.55,
          wucd: 4,
          main: [
            {
              n,
              steps: [
                { p: "work", g: ["t", 75], pace: null },
                { p: "recovery", g: ["t", 120], pace: null }
              ]
            }
          ]
        };
      }
      case "fartlek": {
        if (p < 0.5) {
          const n2 = Math.round((8 + 4 * p * 2) * tf);
          return {
            text: t("w_fart1", { n: n2 }),
            km: n2 * 2 * 60 / S2.easy * 1.15,
            wucd: 4,
            main: [
              {
                n: n2,
                steps: [
                  { p: "work", g: ["t", 60], pace: null },
                  { p: "recovery", g: ["t", 60], pace: null }
                ]
              }
            ]
          };
        }
        const n = Math.round(6 * tf);
        return {
          text: t("w_fart2", { n }),
          km: n * 3 * 60 / S2.easy * 1.2,
          wucd: 4,
          main: [
            {
              n,
              steps: [
                { p: "work", g: ["t", 120], pace: "interval" },
                { p: "recovery", g: ["t", 60], pace: null }
              ]
            }
          ]
        };
      }
      case "progression": {
        const x = Math.round(2 + 3 * p);
        return { text: t("w_prog", { x }), km: null, wucd: 0, fast: x, fastPace: "tempo" };
      }
      case "racepace": {
        if (c === "m") {
          const k = Math.max(5, Math.round((8 + 8 * p) * (taper ? 0.5 : 1) * (ctx.scale || 1)));
          return {
            text: t("w_rpM", { k }),
            km: k,
            wucd: 4,
            main: [{ n: 1, steps: [{ p: "work", g: ["d", k], pace: "mp" }] }]
          };
        }
        const blk = { "5k": [1, 3, 2, t("jog90")], "10k": [2, 2, 2, t("jog120")], hm: [3, 2, 1, t("jog120")] }[c];
        const n = Math.max(2, Math.round((blk[1] + blk[2] * p) * tf));
        return {
          text: t("w_rp", { n, b: blk[0], rec: blk[3] }),
          km: n * blk[0] + n * 0.3,
          wucd: 4,
          main: [
            {
              n,
              steps: [
                { p: "work", g: ["d", blk[0]], pace: "race" },
                { p: "recovery", g: ["t", blk[0] === 1 ? 90 : 120], pace: null }
              ]
            }
          ]
        };
      }
      case "strides": {
        const n = 6 + Math.round(2 * p);
        return { text: t("w_strides", { n }), km: 0, wucd: 0, strides: n };
      }
      case "long": {
        if (ctx.phase === "peak" && (c === "hm" || c === "m") && !ctx.cut) {
          const x = c === "hm" ? Math.round(3 + 2 * p) : Math.round(6 + 4 * p);
          return { text: t("w_longFast", { x }), fast: x, fastPace: "race" };
        }
        if (c === "m" || c === "hm") return { text: t("w_longFuel") };
        return { text: ctx.phase === "peak" ? t("w_longPick") : "" };
      }
    }
    return { text: "", km: null, wucd: 0 };
  }
  function fill(tpl, tok) {
    return String(tpl || "").replace(/\{(\w+)\}/g, (m, k) => tok[k] !== void 0 ? tok[k] : m).replace(/\s+/g, " ").replace(/\s+([.,])/g, "$1").replace(/,\s*,/g, ",").trim();
  }
  function watchPlan(kind, km, w) {
    w = w || {};
    const easy = (k, pace) => ({ p: "work", g: ["d", r05(Math.max(0.5, k))], pace });
    if (kind === "race") return { blocks: [{ n: 1, steps: [{ p: "work", g: ["d", km], pace: "race" }] }] };
    if (w.main) {
      const plan = { blocks: w.main.map((b) => ({ n: b.n, steps: b.steps.map((x) => ({ ...x, g: [...x.g] })) })) };
      if (w.wucd) {
        plan.wu = ["d", w.wucd / 2];
        plan.cd = ["d", w.wucd / 2];
      }
      return plan;
    }
    if (w.strides)
      return {
        blocks: [
          { n: 1, steps: [easy(km, "easy")] },
          {
            n: w.strides,
            steps: [
              { p: "work", g: ["t", 20], pace: null },
              { p: "recovery", g: ["t", 60], pace: null }
            ]
          }
        ]
      };
    if (w.fast && km > w.fast)
      return { blocks: [{ n: 1, steps: [easy(km - w.fast, "easy"), easy(w.fast, w.fastPace)] }] };
    return { blocks: [{ n: 1, steps: [easy(km, kind === "recovery" ? null : "easy")] }] };
  }
  function generate(inp, types) {
    const D = distKm(inp), c = cat(D), P = paces(inp);
    const W = clamp(Math.round(+inp.weeks || 12), 3, 30);
    const runs = clamp(+inp.runs || 5, 1, 7);
    const noRace = inp.goal === "fitness";
    const taperN = noRace ? 0 : Math.min({ "5k": 1, "10k": 1, hm: 2, m: 3 }[c], Math.max(1, Math.floor(W / 4)));
    const nb = W - taperN;
    const nBase = Math.max(1, Math.round(nb * 0.4)), nPeak = Math.max(1, Math.round(nb * 0.25)), nBuild = Math.max(0, nb - nBase - nPeak);
    const phaseOf = (i) => i >= nb ? "taper" : i < nBase ? "base" : i < nBase + nBuild ? "build" : "peak";
    const lv = levelOf(inp), every = CUT_EVERY(lv);
    const cut = (i) => i < nb - 1 && nb >= 5 && (i + 1) % every === 0;
    const V0 = clamp(+inp.curVol || 25, 5, 200);
    const fac = { "5k": 1.25, "10k": 1.3, hm: 1.4, m: 1.55 }[c], floor = { "5k": 20, "10k": 25, hm: 32, m: 45 }[c], perRun = c === "m" ? 16 : 13;
    let peakV = Math.max(V0, Math.min(Math.max(V0 * fac, floor), runs * perRun));
    let nNC = 0;
    for (let i = 0; i < nb; i++) if (!cut(i)) nNC++;
    const g = nNC > 1 ? Math.min(0.1, Math.pow(peakV / V0, 1 / (nNC - 1)) - 1) : 0;
    peakV = Math.min(peakV, V0 * Math.pow(1 + g, Math.max(0, nNC - 1)));
    const vols = [];
    let k = 0, last = V0;
    for (let i = 0; i < nb; i++) {
      if (cut(i)) {
        vols.push(last * 0.8);
      } else {
        last = Math.min(peakV, V0 * Math.pow(1 + g, k));
        k++;
        vols.push(last);
      }
    }
    const tm = { 0: [], 1: [0.6], 2: [0.75, 0.55], 3: [0.8, 0.65, 0.5] }[taperN];
    for (let j = 0; j < taperN; j++) vols.push(peakV * tm[j]);
    const L0 = clamp(longOf(inp), 3, 45);
    const Lpk = Math.max(L0, { "5k": 12, "10k": 16, hm: 19, m: 32 }[c]);
    const lfrac = Math.max({ "5k": 0.33, "10k": 0.33, hm: 0.38, m: 0.48 }[c], 1.25 / runs);
    const on = types.filter((t3) => t3.on);
    const hardTypes = on.filter((t3) => t3.kind === "hard");
    const recT = on.find((t3) => t3.kind === "recovery"), stridesT = on.find((t3) => t3.id === "strides");
    const easyT = types.find((t3) => t3.id === "easy"), longT = types.find((t3) => t3.id === "long");
    const raceD = parseISO(inp.raceDate), raceDow = dow(raceD);
    const start = noRace ? ((d) => addDays(d, (7 - dow(d)) % 7))(parseISO(inp.startDate || nextMonday())) : addDays(raceD, -raceDow - 7 * (W - 1));
    const rot = {};
    const weeks = [];
    let refKm = null;
    let longPk = 0;
    let lastLong = null;
    for (let i = 0; i < W; i++) {
      const phase = phaseOf(i), isCut = cut(i), raceWeek = !noRace && i === W - 1;
      const p = nb > 1 ? clamp(i / (nb - 1), 0, 1) : 1;
      let days = effectiveDays({ ...inp, runs });
      let longD = +inp.longDay;
      if (!days.includes(longD)) longD = days[days.length - 1];
      if (raceWeek) {
        if (!days.includes(raceDow)) {
          const idx = days.indexOf(longD);
          days[idx] = raceDow;
          days.sort((a, b) => a - b);
        }
        longD = raceDow;
      }
      let hk = Math.min(maxHardRuns(inp), phase === "base" || phase === "taper" ? 1 : 2);
      if (isCut) hk = Math.max(1, hk - 1);
      if (lv === "new" && phase === "base") hk = 0;
      if (!hardTypes.length) hk = 0;
      if (raceWeek && runs <= 3) hk = 0;
      const others = days.filter((d) => d !== longD);
      let hardDays = pickHardDays(others, Math.min(hk, others.length), longD, raceWeek);
      if (lv === "experienced" && hardDays.length > 1 && hardDays.some((d, j) => cyc(d, longD) <= 1 || hardDays.some((e, m) => m > j && cyc(d, e) <= 1)))
        hardDays = pickHardDays(others, 1, longD, raceWeek);
      const target = vols[i];
      const ctxBase = { p: phase === "taper" ? 0.5 : p, D, c, taper: phase === "taper", P, phase, cut: isCut };
      const sessions = [];
      let longKm, mkLong = null;
      if (raceWeek) {
        sessions.push({
          id: uid(),
          day: longD,
          typeId: "race",
          name: t("raceDay"),
          kind: "race",
          km: +D.toFixed(1),
          desc: raceDesc(inp, P),
          note: "",
          watch: watchPlan("race", +D.toFixed(1))
        });
      } else {
        if (phase === "taper") {
          const pk = longPk || Lpk;
          longKm = pk * ([0.75, 0.6][i - nb] || 0.6);
        } else {
          const nbNC = Math.max(1, nb - 1);
          longKm = L0 + (Lpk - L0) * Math.min(1, i / nbNC);
          longKm = Math.min(longKm, Math.max(L0 * 0.9, target * lfrac));
          const prevL = lastLong ?? L0;
          longKm = Math.min(longKm, prevL + Math.max(LONG_STEP_KM, kmIn(LONG_STEP_MIN * 60, P.sec.easy)));
          if (isCut) longKm *= 0.75;
        }
        longKm = Math.min(longKm, target * LONG_SHARE(runs));
        if (LONG_MAX_MIN[c]) longKm = Math.min(longKm, kmIn(LONG_MAX_MIN[c] * 60, P.sec.easy));
        longKm = r05(Math.max(longKm, 4));
        const lt = longT.on ? longT : easyT;
        const w = longT.on ? workFor(longT, ctxBase) : { text: "" };
        mkLong = (km) => ({
          id: uid(),
          day: longD,
          typeId: lt.id,
          name: lt.name,
          kind: lt.kind,
          km,
          desc: fill(lt.tpl, { ...P.txt, km, work: fill(w.text, P.txt) }),
          note: "",
          watch: watchPlan(lt.kind, km, w)
        });
        sessions.push(mkLong(longKm));
      }
      const elig = hardTypes.filter((t3) => t3.phases.includes(phase));
      let pool = elig.length ? elig : hardTypes;
      if (raceWeek) {
        const rp = hardTypes.filter((t3) => t3.id === "racepace" || t3.id === "tempo");
        if (rp.length) pool = rp;
      }
      if (phase === "peak") {
        pool = [...pool].sort((a, b) => (b.id === "racepace") - (a.id === "racepace"));
      }
      const used = /* @__PURE__ */ new Set();
      const picks = [];
      for (const d of hardDays) {
        let t3 = null;
        rot[phase] = rot[phase] || 0;
        for (let tries = 0; tries < pool.length; tries++) {
          const cand = pool[rot[phase]++ % pool.length];
          if (!used.has(cand.id) || pool.length <= used.size) {
            t3 = cand;
            break;
          }
        }
        if (!t3) t3 = pool[0];
        used.add(t3.id);
        picks.push({ d, t: t3 });
      }
      const easyN = days.length - 1 - picks.length;
      const build = (scale) => picks.map(({ d, t: t3 }) => {
        const w = workFor(t3, { ...ctxBase, scale, taper: phase === "taper" || raceWeek });
        let km;
        if (w.km == null) {
          km = clamp(Math.round(target * 0.17 * scale), 6, 16);
          if (raceWeek) km = Math.min(km, 8);
        } else km = w.wucd + w.km;
        if (raceWeek) km = Math.min(km, c === "m" ? 14 : 9);
        km = r05(Math.max(km, lv === "new" ? 4 : 5));
        return {
          id: uid(),
          day: d,
          typeId: t3.id,
          name: t3.name,
          kind: "hard",
          km,
          desc: fill(t3.tpl, { ...P.txt, km, work: fill(w.text, P.txt) }),
          note: "",
          watch: watchPlan("hard", km, w)
        };
      });
      let hs = build(1), hScale = 1;
      let hardKm = hs.reduce((a, x) => a + x.km, 0);
      const room = target * 1.04 - (longKm || 0) - easyN * 4;
      if (!raceWeek && hardKm > room && hardKm > 0) {
        hScale = clamp(room / hardKm, 0.55, 1);
        hs = build(hScale);
        hardKm = hs.reduce((a, x) => a + x.km, 0);
      }
      const easyDays = others.filter((d) => !hardDays.includes(d));
      const roles = easyDays.map((d) => ({ d, t: easyT }));
      const afterLong = (longD + 1) % 7;
      if (recT && runs >= 5 && !raceWeek) {
        const r = roles.find((x) => x.d === afterLong) || (roles.length > 1 ? roles.find((x) => cyc(x.d, longD) === 1) : null);
        if (r) r.t = recT;
      }
      if (stridesT) {
        const s = (raceWeek ? roles.find((x) => x.d === (longD + 6) % 7) : null) || roles.find((x) => x.t === easyT && x.d !== afterLong) || roles.find((x) => x.t === easyT);
        if (s) s.t = stridesT;
      }
      const wt = (x) => x.t.kind === "recovery" ? 0.7 : 1;
      const sumW = roles.reduce((a, x) => a + wt(x), 0) || 1;
      const rem = Math.max(0, target - (longKm || 0) - hardKm);
      const minKm = (x) => lv === "new" ? x.t.kind === "recovery" ? 2.5 : 3 : x.t.kind === "recovery" ? 3 : 4;
      const easyKm = roles.map((x) => {
        let km;
        if (raceWeek) {
          km = x.d === (longD + 6) % 7 ? c === "m" ? 5 : 4 : clamp(Math.round(peakV * 0.09), 4, 8);
        } else km = Math.max(minKm(x), rem * wt(x) / sumW);
        if (!raceWeek && x.t.kind !== "recovery") km = Math.min(km, Math.max(longKm - 1, 6));
        return r05(km);
      });
      if (!raceWeek && !isCut && phase !== "taper" && (refKm != null || i === 0)) {
        const cap3 = (i === 0 ? V0 : refKm * 1.1) + 0.01;
        const total = () => (longKm || 0) + hardKm + easyKm.reduce((a, b) => a + b, 0);
        while (total() > cap3) {
          let j = -1;
          easyKm.forEach((k2, i2) => {
            if (k2 - 0.5 >= minKm(roles[i2]) && (j < 0 || k2 > easyKm[j])) j = i2;
          });
          if (j < 0) break;
          easyKm[j] -= 0.5;
        }
        for (let sc = hScale - 0.05; total() > cap3 && hs.length && sc >= 0.549; sc -= 0.05) {
          const h2 = build(sc), k2 = h2.reduce((a, x) => a + x.km, 0);
          if (k2 < hardKm) {
            hs = h2;
            hardKm = k2;
          }
        }
        if (total() > cap3 && mkLong) {
          const nl = Math.max(4, Math.floor((longKm - (total() - cap3)) * 2) / 2);
          if (nl < longKm) {
            longKm = nl;
            sessions[0] = mkLong(longKm);
          }
        }
      }
      sessions.push(...hs);
      roles.forEach((x, i2) => {
        const km = easyKm[i2];
        const w = workFor(x.t, ctxBase);
        sessions.push({
          id: uid(),
          day: x.d,
          typeId: x.t.id,
          name: x.t.name,
          kind: x.t.kind,
          km,
          desc: fill(x.t.tpl, { ...P.txt, km, work: fill(w.text || "", P.txt) }),
          note: "",
          watch: watchPlan(x.t.kind, km, w)
        });
      });
      if (mkLong && runs > 1) {
        const rest = sessions.reduce((a, x) => a + x.km, 0) - longKm, sh = LONG_SHARE(runs), mx = Math.floor(sh / (1 - sh) * rest * 2) / 2;
        if (longKm > mx && mx >= 4) {
          longKm = mx;
          const li = sessions.findIndex((x) => x.day === longD);
          sessions[li] = mkLong(longKm);
        }
      }
      if (!isCut && phase !== "taper" && longKm) lastLong = longKm;
      if (!isCut && phase !== "taper") refKm = sessions.reduce((a, x) => a + x.km, 0);
      if (phase !== "taper" && longKm) longPk = Math.max(longPk, longKm);
      sessions.sort((a, b) => a.day - b.day);
      weeks.push({
        n: i + 1,
        phase,
        cutback: isCut,
        start: iso(addDays(start, 7 * i)),
        target: Math.round(target),
        note: "",
        sessions
      });
    }
    const RW = recWeeksOf(inp);
    if (RW) {
      const all = effectiveDays({ ...inp, runs }), fr = c === "m" ? [0.3, 0.5] : [0.4, 0.6];
      for (let r = 0; r < RW; r++) {
        const i = W + r, target = peakV * fr[r];
        const n = Math.max(Math.min(runs, 2), runs - (r === 0 ? 2 : 1));
        const free = all.filter((d) => 7 * (r + 1) + d - raceDow >= 3);
        const pool = free.length >= n ? free : [0, 1, 2, 3, 4, 5, 6].filter((d) => 7 * (r + 1) + d - raceDow >= 3);
        let best = pool.slice(0, n), bg = -1;
        for (const cmb of combos(pool, Math.min(n, pool.length))) {
          let g2 = 7;
          for (let a = 0; a < cmb.length; a++)
            for (let b = a + 1; b < cmb.length; b++) g2 = Math.min(g2, cyc(cmb[a], cmb[b]));
          if (g2 > bg) {
            bg = g2;
            best = cmb;
          }
        }
        const lD = best.includes(+inp.longDay) ? +inp.longDay : best[best.length - 1];
        const roles = best.map((d) => ({ d, t: easyT, w: r > 0 && d === lD && best.length > 1 ? 1.5 : 1 }));
        if (r === 0 && recT && roles.length) roles[0].t = recT;
        if (r > 0 && stridesT) {
          const s = roles.find((x) => x.d !== lD) || roles[0];
          if (s) s.t = stridesT;
        }
        const sumW = roles.reduce((a, x) => a + x.w, 0) || 1;
        const sessions = roles.map((x) => {
          const km = r05(clamp(target * x.w / sumW, 3, r === 0 ? 10 : 14));
          const w = workFor(x.t, { p: 0.3, D, c, taper: false, P, phase: "recovery" });
          return {
            id: uid(),
            day: x.d,
            typeId: x.t.id,
            name: x.t.name,
            kind: x.t.kind,
            km,
            desc: fill(x.t.tpl, { ...P.txt, km, work: fill(w.text || "", P.txt) }),
            note: "",
            watch: watchPlan(x.t.kind, km, w)
          };
        });
        sessions.sort((a, b) => a.day - b.day);
        weeks.push({
          n: i + 1,
          phase: "recovery",
          cutback: false,
          start: iso(addDays(start, 7 * i)),
          target: Math.round(target),
          note: "",
          sessions
        });
      }
    }
    return {
      weeks,
      meta: {
        noRace,
        D,
        c,
        taperN,
        recN: RW,
        peakV: Math.round(peakV),
        start: iso(start),
        vdot: P.vdot,
        raceSec: P.raceSec || null,
        racePace: P.vdot ? P.txt.race : null
      }
    };
  }
  function raceDesc(inp, P) {
    const lbl = distLabel(inp);
    if (P.vdot) return cap(t("raceDescV", { lbl, time: fmtDur(P.raceSec), pace: P.txt.race }));
    return cap(t("raceDescE", { lbl }));
  }
  var SETUP_FIELDS = ["date", "weeks", "curVol", "curLong", "runs", "days", "longDay", "types", "pace"];
  function warnings(inp, types, plan, edited) {
    return warningItems(inp, types, plan, edited).map((x) => x.m);
  }
  function warningItems(inp, types, plan, edited) {
    const w = [];
    const at = (f, m) => ({ f, m });
    const D = distKm(inp), c = cat(D), lbl = distLabel(inp);
    const minW = { "5k": 6, "10k": 8, hm: 10, m: 14 }[c];
    if (inp.goal !== "fitness" && inp.weeks < minW) w.push(at("weeks", t("wa_short", { w: inp.weeks, lbl, min: minW })));
    if (inp.weeks > 24) w.push(at("weeks", t("wa_long", { n: Math.min(20, inp.weeks) })));
    const lowVol = { "5k": 12, "10k": 18, hm: 22, m: 32 }[c];
    if (inp.goal !== "fitness" && +inp.curVol < lowVol) w.push(at("curVol", t("wa_lowVol", { v: inp.curVol, lbl })));
    if (inp.goal !== "fitness" && c === "m" && longTyped(inp) && +inp.curLong < 14)
      w.push(at("curLong", t("wa_mLong")));
    if (inp.goal !== "fitness" && (c === "hm" || c === "m") && plan.weeks.length) {
      const ri = plan.weeks.findIndex((x) => x.sessions.some((s) => s.kind === "race"));
      const pre = (ri >= 0 ? plan.weeks.slice(0, ri) : plan.weeks).filter((x) => x.phase !== "recovery");
      const lr = Math.max(0, ...pre.flatMap((x) => x.sessions.map((s) => +s.km || 0)));
      const pk = Math.max(0, ...pre.map((x) => x.sessions.reduce((a, s) => a + (+s.km || 0), 0)));
      const tl = D * (c === "m" ? 0.75 : 0.6), tp = c === "m" ? 45 : 30;
      if (lr < tl - 0.05 || pk < tp - 0.05)
        w.push(at(null, t("wa_ready", { long: +lr.toFixed(1), peak: Math.round(pk), lbl, tl: Math.round(tl), tp })));
    }
    const days = [...new Set(inp.days)];
    if (days.length !== +inp.runs) w.push(at("days", t("wa_days", { d: days.length, r: inp.runs })));
    else if (+inp.runs >= 3 && +inp.runs <= 4) {
      const on = new Set(days);
      let best = [];
      for (const d0 of days) {
        if (on.has((d0 + 6) % 7)) continue;
        const run = [];
        for (let d = d0; on.has(d % 7) && run.length < 7; d++) run.push(d % 7);
        if (run.length > best.length) best = run;
      }
      if (best.length >= 3)
        w.push(at("days", t("wa_row", { days: best.map((d) => dayName(d)).join(", "), n: best.length })));
    }
    if (+inp.runs === 7) w.push(at("runs", t("wa_noRest7")));
    const hard = types.filter((x) => x.on && x.kind === "hard");
    const maxHard = maxHardRuns(inp);
    if (hard.length > maxHard * 2)
      w.push(
        at(
          "types",
          t("wa_tooMany", { h: hard.length, r: inp.runs, m: maxHard, sess: t(maxHard > 1 ? "sessMany" : "sessOne") })
        )
      );
    if (!hard.length) w.push(at("types", t("wa_noHard")));
    if (hard.length && longBoxedIn(inp)) {
      const ds = [...new Set(inp.days)], dd = ds.length === +inp.runs ? ds : DEFAULT_DAYS[+inp.runs];
      w.push(
        at("longDay", t("wa_noGap", { long: dayName(dd.includes(+inp.longDay) ? +inp.longDay : dd[dd.length - 1]) }))
      );
    }
    const wk = plan.weeks.map((x) => x.sessions.reduce((a, s) => a + (+s.km || 0), 0));
    const steep = [];
    plan.weeks.forEach((x, i) => {
      if (i === 0 || x.cutback || x.phase === "taper" || x.phase === "recovery") return;
      const r = plan.weeks[i - 1].cutback ? wk[i - 2] : wk[i - 1];
      if (r > 0 && wk[i] > r * 1.1 + 0.05) steep.push(x.n);
    });
    if (steep.length)
      w.push(
        at(
          null,
          t(edited ? "wa_steepEdit" : "wa_steep", {
            w: t(steep.length > 1 ? "wkMany" : "wkOne", { n: steep.join(", ") })
          })
        )
      );
    if (wk.length && +inp.curVol > 0 && wk[0] > +inp.curVol + 0.05)
      w.push(
        at(
          null,
          t(edited ? "wa_w1Edit" : levelOf(inp) === "new" ? "wa_w1New" : "wa_w1", {
            km: +wk[0].toFixed(1),
            v: +inp.curVol,
            r: inp.runs
          })
        )
      );
    w.push(...weekCheckSummary(plan, inp).map((m) => at(null, m)));
    if (badRaceTime(inp)) w.push(at("pace", badTimeMsg(inp)));
    else if (!(+inp.recDist > 0 && raceTimeSec(inp.recTime, +inp.recDist))) w.push(at("pace", t("wa_noPace")));
    const startD = parseISO(plan.meta.start);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    if (startD < addDays(today, -6))
      w.push(at("date", t(inp.goal === "fitness" ? "wa_pastFit" : "wa_past", { d: fmtDate(startD) })));
    return w;
  }
  function maxHardRuns(inp) {
    const r = +inp.runs, lv = levelOf(inp);
    return lv === "new" ? 1 : r <= (lv === "experienced" ? 3 : 4) ? 1 : 2;
  }
  function longBoxedIn(inp) {
    const r = +inp.runs;
    if (r < 2 || r > 4) return false;
    const ds = [...new Set(inp.days)], days = ds.length === r ? ds : DEFAULT_DAYS[r];
    const L = days.includes(+inp.longDay) ? +inp.longDay : days[days.length - 1];
    return !days.some((d) => d !== L && cyc(d, L) >= 2);
  }
  function weekChecks(w, inp, prev) {
    const out = [], ss = w.sessions.filter((s) => s.kind !== "race");
    const nHard = ss.filter((s) => s.kind === "hard").length, m = maxHardRuns(inp);
    if (nHard > m)
      out.push({
        k: "tooHard",
        txt: t(levelOf(inp) === "new" ? "wk_tooHardNew" : "wk_tooHard", { n: nHard, r: inp.runs, m })
      });
    const key = (s) => s.kind === "hard" ? "hard" : s.kind === "long" || s.kind === "race" ? "long" : null;
    const pts = [
      ...prev ? prev.sessions.filter((s) => s.day === 6 && key(s)).map((s) => ({ d: -1, s })) : [],
      ...w.sessions.filter(key).map((s) => ({ d: s.day, s }))
    ].sort((a, b) => a.d - b.d);
    const pairs = [], boxed = longBoxedIn(inp);
    pts.forEach(
      (a, i) => pts.slice(i + 1).forEach((b) => {
        if (b.d - a.d <= 1 && b.d >= 0 && (key(a.s) === "hard" || key(b.s) === "hard") && !(boxed && key(a.s) !== key(b.s)))
          pairs.push(t("wk_pair", { a: a.s.name, da: dayName((a.d + 7) % 7), b: b.s.name, db: dayName(b.d) }));
      })
    );
    if (pairs.length) out.push({ k: "b2b", txt: t("wk_b2b", { pairs: pairs.join(", ") }) });
    if (+inp.runs < 7 && new Set(w.sessions.map((s) => s.day)).size >= 7) out.push({ k: "noRest", txt: t("wk_noRest") });
    return out;
  }
  function weekCheckSummary(plan, inp) {
    const by = {};
    plan.weeks.forEach(
      (w, i) => weekChecks(w, inp, plan.weeks[i - 1]).forEach((c) => (by[c.k] = by[c.k] || []).push(w.n))
    );
    const wl = (a) => t(a.length > 1 ? "wkLn" : "wkL1", { n: a.join(", ") });
    const out = [];
    if (by.tooHard)
      out.push(t(levelOf(inp) === "new" ? "wa_wkTooHardNew" : "wa_wkTooHard", { w: wl(by.tooHard), r: inp.runs }));
    if (by.b2b) out.push(t("wa_wkB2B", { w: wl(by.b2b) }));
    if (by.noRest) out.push(t("wa_wkNoRest", { w: wl(by.noRest) }));
    return out;
  }
  function setLocale(o) {
    Object.assign(LOCALE, o);
  }

  // src/engine-api.js
  var BBEngine = engine_exports;
  var {
    SETUP_FIELDS: SETUP_FIELDS2,
    warningItems: warningItems2,
    SETUP_STEP: SETUP_STEP2,
    WEEK_PHASES: WEEK_PHASES2,
    recWeeksOf: recWeeksOf2,
    LEVELS: LEVELS2,
    levelOf: levelOf2,
    suggestVol: suggestVol2,
    longOf: longOf2,
    durSec: durSec2,
    kmIn: kmIn2,
    DISTS: DISTS2,
    PHASES: PHASES2,
    DEFAULT_DAYS: DEFAULT_DAYS2,
    TYPE_DEFS: TYPE_DEFS2,
    uid: uid2,
    clamp: clamp2,
    r05: r052,
    iso: iso2,
    parseISO: parseISO2,
    addDays: addDays2,
    dow: dow2,
    raceTimeSec: raceTimeSec2,
    badRaceTime: badRaceTime2,
    badTimeMsg: badTimeMsg2,
    fmtPace: fmtPace2,
    fmtDur: fmtDur2,
    distKm: distKm2,
    missingSetup: missingSetup2,
    genInputs: genInputs2,
    distLabel: distLabel2,
    cat: cat2,
    paces: paces2,
    workFor: workFor2,
    fill: fill2,
    watchPlan: watchPlan2,
    generate: generate2,
    weekChecks: weekChecks2,
    nextMonday: nextMonday2
  } = BBEngine;

  // src/strings.js
  var I18N = {
    en: {
      planNameLabel: "Plan name",
      editPlan: "Edit plan",
      done: "Done",
      secGoal: "Goal",
      secRace: "Race",
      secFocus: "Focus and dates",
      secYourWeek: "Your week",
      icRace: "A plan that builds to race day and tapers into it.",
      icFit: "Get fitter week by week, no race date.",
      icQuick: "One workout for your watch, no plan needed.",
      introStep: "Step {n} of 4 \xB7 {name}",
      introNext: "Next",
      introBack: "Back",
      introDone: "Build my plan",
      introSkip: "Show all settings",
      introNeed: "Before going on:",
      introWait: "Your plan's shape shows here once the steps are filled in.",
      needDist: "Choose a distance.",
      needDate: "Pick the race date.",
      needWeeks: "Enter the weeks of training (3 to 30).",
      goalRace: "Train for a race",
      goalFit: "Personal plan",
      focusDist: "Focus distance",
      startDate: "Start date",
      focusHint: "Sets the paces and how long the long runs get. No race, no taper: the plan just builds week by week.",
      fitHint: "Starts Monday {s}, ends Sunday {e}.",
      fitBlock: "{n}-week personal plan",
      hFitStarts: "Your {n}-week plan starts Monday {d}.",
      hFitIn: "Week {n} of {t}, {phase} phase{cut}.",
      hFitDone: "Your {n}-week plan finished on {d}. Set a new start date to plan the next block.",
      wa_pastFit: "Week 1 started on {d}. Move the start date if you want the plan to begin now.",
      planMetaFit: "{lbl} focus \xB7 {w} weeks \xB7 starts {d}",
      myPlans: "My plans",
      newPlan: "New plan",
      savePlan: "Save plan",
      keepPlan: "Keep this plan",
      language: "Language",
      theme: "Theme",
      thDark: "Dark",
      thLight: "Light",
      thAuto: "Auto",
      thHint: "Auto follows your device.",
      runUnit: "Runs shown in",
      ruKm: "km",
      ruMin: "minutes",
      ruHint: "Minutes are estimated from your paces. The plan is still built in km.",
      prefs: "Display and language",
      distance: "Distance",
      customKm: "Custom distance (km)",
      raceDate: "Race date",
      weeks: "Weeks of training",
      secNow: "Your running now",
      curVol: "Weekly volume (km)",
      volHint: "Suggested for your experience and distance. Change it to what you run now.",
      curLong: "Longest recent run (km, optional)",
      recDist: "Recent race",
      none: "None",
      halfMarathon: "Half marathon",
      marathon: "Marathon",
      recTime: "Finish time",
      recTimePh: "h:mm:ss or mm:ss",
      level: "Experience",
      lv_new: "New to running",
      lv_regular: "Regular",
      lv_experienced: "Experienced",
      lvHint_new: "No hard runs in the first phase, then one a week at most. A lighter week every 3rd week, shorter easy runs.",
      lvHint_regular: "Up to 2 hard runs a week from 5 runs a week. A lighter week every 4th week.",
      lvHint_experienced: "Up to 2 hard runs a week from 4 runs a week. A lighter week every 4th week.",
      wk_tooHardNew: "{n} hard runs this week: new runners do best with {m}. Change one to an easy run.",
      wa_wkTooHardNew: "{w}: more hard runs than suit a new runner. Details on the week.",
      secWeek: "Week shape",
      runsPerWeek: "Runs per week",
      runningDays: "Running days",
      longDay: "Long run day",
      secTypes: "Run types",
      typesHint: "Description templates accept <code>{km}</code> <code>{easy}</code> <code>{tempo}</code> <code>{interval}</code> <code>{rep}</code> <code>{race}</code> <code>{mp}</code> and <code>{work}</code>, the main set that progresses through the block.",
      addType: "Add run type",
      typesCount: "Tap a session to switch it on or off. {a} of {b} on.",
      grpEasy: "Easy",
      grpQuality: "Quality",
      customise: "Customise workouts",
      customiseSub: "Phases, descriptions, add your own",
      alwaysOn: "Always on",
      d5k: "5K",
      d10k: "10K",
      dhm: "Half",
      dm: "Marathon",
      dcustom: "Custom",
      l5k: "5K",
      l10k: "10K",
      lhm: "half marathon",
      lm: "marathon",
      kEasy: "Easy",
      kRecovery: "Recovery",
      kLong: "Long",
      kHard: "Quality",
      ph_base: "base",
      ph_build: "build",
      ph_peak: "peak",
      ph_taper: "taper",
      cutback: "cutback",
      days: "Mon|Tue|Wed|Thu|Fri|Sat|Sun",
      days1: "M|T|W|T|F|S|S",
      whyLbl: "Why this run:",
      pdfWhyHead: "Run types in this plan",
      pdfWhyCol: "Why, and how it should feel",
      why_easy: "Builds your aerobic base and lets you recover between harder days. Easy: about 3-4 out of 10, you can talk in full sentences.",
      why_long: "Builds endurance: legs, heart and fuelling get used to long time on your feet. Steady: about 4-5 out of 10, you can still talk in sentences.",
      why_recovery: "Loosens your legs after a hard day or the long run without adding fatigue. Very easy: 2-3 out of 10, slower than feels natural.",
      why_strides: "Keeps your legs quick and your form relaxed without tiring you. Easy run, then short bursts at about 8 out of 10 with full recovery.",
      why_tempo: "Raises the pace you can hold for a long time (your threshold). Comfortably hard: about 7 out of 10, a few words at a time.",
      why_intervals: "Raises your top aerobic engine (VO2max) and your speed. Hard: about 8-9 out of 10, no talking during the reps.",
      why_hills: "Builds leg strength and power with less pounding than flat speed work. Hard uphill: about 8 out of 10, jog or walk back down.",
      why_fartlek: "Brings in speed by feel, without a fixed pace. Faster bits at about 7-8 out of 10, easy running in between.",
      why_progression: "Teaches you to finish strong on tired legs. Starts easy (3-4 out of 10) and ends comfortably hard (about 7 out of 10).",
      why_racepace: "Rehearses the exact pace and rhythm of your race. Race effort: about 7-8 out of 10 for a half or marathon, 8-9 for a 5K or 10K.",
      ty_easy: "Easy run",
      tp_easy: "{km} km relaxed at {easy}. You should be able to talk in full sentences.",
      ty_long: "Long run",
      tp_long: "{km} km steady at {easy}. {work}",
      ty_recovery: "Recovery run",
      tp_recovery: "{km} km very easy, slower than {easy}. Short and loose.",
      ty_strides: "Easy + strides",
      tp_strides: "{km} km at {easy}, then {work}.",
      ty_tempo: "Tempo",
      tp_tempo: "2 km warm-up, {work}, 2 km cool-down.",
      ty_intervals: "Intervals",
      tp_intervals: "2 km warm-up with strides, {work}, 2 km cool-down.",
      ty_hills: "Hill repeats",
      tp_hills: "2 km warm-up, {work}, 2 km cool-down.",
      ty_fartlek: "Fartlek",
      tp_fartlek: "2 km warm-up, {work}, 2 km cool-down.",
      ty_progression: "Progression run",
      tp_progression: "{km} km starting at {easy}, {work}.",
      ty_racepace: "Race pace",
      tp_racepace: "2 km warm-up, {work}, 2 km cool-down.",
      ty_custom: "Custom run",
      tp_custom: "2 km warm-up, describe the main set here, 2 km cool-down.",
      pe_easy: "conversational pace",
      pe_tempo: "comfortably hard effort",
      pe_interval: "hard 5K effort",
      pe_rep: "fast, relaxed effort",
      pe_race: "goal race effort",
      pe_mp: "marathon effort",
      w_tempoCruise: "{n} \xD7 8 min at {tempo} with 90 s jog",
      w_tempoCont: "{mins} min continuous at {tempo}",
      w_int: "{n} \xD7 {rep} m at {interval}, {rec}",
      jog90: "90 s jog",
      jog120: "2 min jog",
      jog180: "3 min jog",
      w_hills: "{n} \xD7 75 s uphill at hard effort, jog back down",
      w_fart1: "{n} \xD7 1 min fast / 1 min easy",
      w_fart2: "{n} \xD7 2 min at {interval} effort / 1 min easy",
      w_prog: "last {x} km building to {tempo}",
      w_rpM: "{k} km continuous at {mp}",
      w_rp: "{n} \xD7 {b} km at {race}, {rec}",
      w_strides: "{n} \xD7 20 s strides with full walk-back recovery",
      w_longFast: "Run the last {x} km at {race}.",
      w_longFuel: "Practise race-day fuelling and drinking.",
      w_longPick: "Pick up to {tempo} for the final 10 minutes.",
      raceDay: "Race day",
      raceDescV: "{lbl} race. Your recent result points to about {time} ({pace}). Start the first km 5 to 10 s/km slower than that, settle, then race the second half.",
      raceDescE: "{lbl} race. Start controlled for the first km, settle into goal effort, then race the final quarter.",
      wa_short: "{w} weeks is short for a {lbl}. {min} or more lets volume build without big jumps.",
      wa_long: "Blocks over 24 weeks tend to go stale. Consider a general base phase first, then {n} focused weeks.",
      wa_lowVol: "{v} km/week is a low starting point for a {lbl}. The plan ramps carefully, so expect a conservative peak.",
      wa_mLong: "A longest recent run under 14 km makes 32 km long runs hard to reach safely in one block.",
      wa_ready: "This plan peaks at a {long} km long run and {peak} km in a week. A {lbl} usually calls for a long run of about {tl} km and weeks of about {tp} km. Add weeks, or set the goal to Personal plan.",
      wa_days: "You picked {d} running days for {r} runs a week. Using a default pattern until those match.",
      wa_tooMany: "{h} quality run types with {r} runs a week leaves room for {m} {sess} per week. Types will rotate, so each appears less often.",
      sessOne: "hard session",
      sessMany: "hard sessions",
      wa_noHard: "No quality run types are ticked, so the plan has no hard sessions.",
      wa_w1: "Week 1 comes to {km} km, more than the {v} km a week you run now: {r} runs at their shortest already add up to that. Fewer runs a week, or the New to running level (shorter runs), would start lower.",
      wa_w1New: "Week 1 comes to {km} km, more than the {v} km a week you run now: {r} runs at their shortest already add up to that. Fewer runs a week would start lower.",
      wa_w1Edit: "Week 1 comes to {km} km, more than the {v} km a week you run now.",
      wa_steep: "{w} more than 10% bigger than the last full week before. Every run is already at its shortest: fewer runs per week would keep the build gentler.",
      wa_steepEdit: "{w} more than 10% bigger than the last full week before. Shortening a run would keep the build gentler.",
      wkL1: "Week {n}",
      wkLn: "Weeks {n}",
      wkWarn: "Check",
      wa_wkTooHard: "{w}: more hard runs than suit {r} runs a week. Details on the week.",
      wa_wkB2B: "{w}: a hard run right next to another hard run or the long run. Details on the week.",
      wa_wkNoRest: "{w}: no rest day. Details on the week.",
      wk_b2b: "{pairs} back to back. Keep an easy day or a rest day between hard runs and the long run.",
      wk_pair: "{a} ({da}) and {b} ({db})",
      wk_noRest: "Runs on all 7 days this week: keep at least one rest day.",
      wa_row: "{days} are {n} days in a row. Keep the middle one easy, or spread your running days.",
      wa_noGap: "Every other running day is next to the long run ({long}), so the hard run lands next to it. Add a running day further from it, or move the long run.",
      wa_noRest7: "7 runs a week leaves no rest day. Make one of them a short recovery run, or run 6 days.",
      wk_tooHard: "{n} hard runs this week: at {r} runs a week, keep it to {m}. Change one to an easy run.",
      wkOne: "Week {n} is",
      wkMany: "Weeks {n} are",
      wa_noPace: "Without a recent race time, sessions use effort descriptions instead of paces.",
      wa_badTime: "Couldn't read {time} as a {lbl} finish time, so sessions use effort descriptions. Write it as h:mm:ss or mm:ss, for example {ex}.",
      wa_past: "With this race date and length, week 1 started on {d}. Shorten the block or move the race date.",
      blockName: "{lbl} block",
      trainingBlock: "Training block",
      daysCount: "({a} of {b})",
      useType: "Use {name}",
      typeNameLbl: "Run type name",
      remove: "Remove",
      editDesc: "edit description",
      kind: "Kind",
      usedPhases: "Used in phases",
      tplLbl: "Description template",
      startHint: "Week 1 starts Monday {d}. Race on {r}.",
      paceHint: "Paces: easy {e}, tempo {t}, intervals {i}, {lbl} pace {r}.",
      paceHintNone: "Add a recent race and time to get paces.",
      exampleBanner: "Example settings. Change the race, your current running and the run types in the settings; the plan rebuilds as you go.",
      pendingBanner: "You edited sessions by hand, so new settings aren't applied yet.",
      rebuildPlan: "Rebuild plan",
      keepEdits: "Keep my edits",
      stWeeks: "weeks",
      stTotal: "total km",
      stPeak: "peak week km",
      stLongest: "longest run km",
      stEquiv: "{lbl} equivalent",
      sToGo: "weeks to go",
      sToGo1: "week to go",
      sPeak: "peak week",
      sLongest: "longest run",
      sTarget: "{lbl} target",
      uH: "h",
      uMin: "min",
      loadProfile: "Load profile",
      longRunLeg: "long run",
      sendAll: "Send all runs to watch",
      exportCal: "Export calendar",
      exportCsv: "Export CSV",
      exportFmt: "Export format",
      fmtCsv: "CSV (spreadsheet)",
      fmtPdf: "PDF (printable)",
      exportGo: "Export",
      pdfBuilding: "Building PDF\u2026",
      pdfLoadFail: "Couldn't load the PDF builder. Check your connection and try again.",
      pdfFail: "Couldn't build the PDF: {m}",
      pdfGenerated: "Generated {d}",
      pdfPage: "Page {p} of {n}",
      pdfRace: "Race",
      rebuildFrom: "Rebuild from settings",
      week: "Week",
      showPast: "Show {n} earlier week(s)",
      hidePast: "Hide {n} earlier week(s)",
      wAbbr: "W",
      sendWatch: "Send to watch",
      sendWatchWeek: "Send week {n} to watch",
      watchShort: "Watch",
      rest: "Rest",
      tabPlan: "Plan",
      tabSetup: "Settings",
      seePlan: "See the plan",
      editSettings: "Edit settings",
      addRun: "+ Add run",
      noteBadge: "NOTE",
      svgTitle: "Week {n}: {km} km, {phase}",
      svgNow: "this week",
      svgToday: "today",
      svgRace: "race week",
      svgAria: "Weekly kilometres by week",
      editRace: "Edit race",
      removeRace: "Remove race",
      raceOptional: "Optional: name your race so it shows in the header with a countdown.",
      findOn: "Find {lbl} races on Finishers",
      addMyRace: "Add my race",
      raceUrl: "Race page link (optional)",
      raceUrlPh: "Paste the race's Finishers page",
      raceName: "Race name",
      raceNamePh: "e.g. Semi-marathon de Boulogne",
      city: "City",
      raceMatch: "The race date and distance come from the fields above, so set those to match.",
      useRace: "Use this race",
      cancel: "Cancel",
      searchFin: "Search Finishers",
      needName: "Give the race a name.",
      hello: "Hello",
      hPast: "Your {lbl} was on {d}. Set a new race date to plan the next block.",
      hToday: "Race day. Enjoy your <b>{lbl}</b>: settle early and race the second half.",
      hDays: "<b>{n} days</b> to your {lbl} on {d}.",
      hDay1: "<b>1 day</b> to your {lbl} on {d}.",
      hRaceComing: "<b>{name}</b> is coming up.",
      hRecIn: "Recovery after your {lbl}: week {k} of {r}.",
      recWeeks: "Recovery after the race",
      rec0: "None",
      rec1: "1 week",
      rec2: "2 weeks",
      recHint0: "The plan ends on race day.",
      recHint: "Easy weeks after race day: no hard runs, fewer and shorter runs, nothing in the two days after the race.",
      ph_recovery: "recovery",
      hStarts: "Week 1 starts Monday {d}.",
      hInWeek: "You're in week {n} of {t}, {phase} phase{cut}.",
      hCut: ", a cutback week",
      hNext: " Next up {when}: <b>{name}, {amt}</b>.",
      today: "today",
      dayOne: "day",
      dayMany: "days",
      eTitle: "Week {n} \xB7 {day}",
      runType: "Run type",
      dayLbl: "Day",
      distKm: "Distance (km)",
      desc: "Description",
      watchWorkout: "Watch workout",
      watchHint: "Built from the session structure. Changing the distance updates it; editing the description does not.",
      note: "Note",
      notePhOwn: "Your own note",
      deleteRun: "Delete run",
      saveChanges: "Save changes",
      sendTitleRun: "Week {n}, {day}: {name}, {amt}",
      sendTitleWeek: "Week {n}: {c} runs",
      sendTitleAll: "Whole plan: {c} runs",
      rebuildQ: "Rebuild the plan?",
      rebuildT: "This replaces your hand edits and notes with a fresh plan from the current settings.",
      rebuild: "Rebuild",
      unknownErr: "unknown error",
      pl_easy: "easy",
      pl_tempo: "tempo",
      pl_interval: "interval",
      pl_rep: "rep",
      pl_race: "race pace",
      pl_mp: "marathon pace",
      recoverySfx: " recovery",
      warmup: "Warm-up",
      cooldown: "Cool-down",
      recover: "Recover",
      run: "Run",
      devOther: "Other watch or app",
      devFiles: ".{ext} files",
      helpApple: "On your iPhone, open the zip in Files, then tap each .workout file to add it to the Workout app. Needs a recent iOS and watchOS.",
      helpGarmin: "Unzip on a computer, plug the watch in by USB and copy the .fit files into GARMIN/NewFiles. They appear under Training > Workouts. Some recent models only take workouts through Garmin Connect.",
      helpOther: "Structured .fit workout files. Import them into an app that accepts workout files, such as intervals.icu, then sync to your watch from there.",
      sendTitle: "Send to your watch",
      device: "Device",
      download: "Download",
      noDownloads: "Downloads aren't available in this view.",
      wkLoadFail: "Couldn't load the Apple Watch workout builder. Check your connection and try again.",
      buildFail: "Couldn't build the workout for {name}: {m}",
      savedOne: "Saved 1 {dev} workout. {help}",
      savedMany: "Saved {n} {dev} workouts. {help}",
      dlFail: "Couldn't save the file.",
      dlFailM: "Couldn't save the file: {m}",
      icsDesc: "Week {n} ({phase}). {desc}",
      icsNote: "Note: ",
      csvHead: "Week|Phase|Date|Day|Run|Km|Description|Note",
      unsaved: "Unsaved changes",
      saving: "Saving\u2026",
      saved: "Saved",
      savedLocal: "Saved in this browser",
      planSaved: "Plan saved.",
      notSaved: "Not saved",
      saveFail: "Save failed. Your plan is still here; try again.",
      localOnly: "Plans are kept in this browser only. Use Save plan to keep a copy in a file or move them to another device.",
      bkSave: "Save plan",
      bkLater: "Later",
      bkBanner: "Your plans are only kept in this browser, which can delete them. Save a copy to a file.",
      bkLast: "Last saved to a file: {d}.",
      bkNever: "Last saved to a file: never.",
      importPlans: "Import\u2026",
      imported: "Imported {n} plan(s).",
      impCopy: "{n} added as a copy, because the plan here was changed more recently.",
      impSame: "{n} already up to date.",
      impNone: "Nothing new: {n} plan(s) already up to date.",
      copyName: "{name} (imported)",
      importFail: "That file isn't a Block Builder export.",
      planMeta: "{lbl} \xB7 {w} weeks \xB7 race {d}",
      open: "Open",
      del: "Delete",
      noPlans: "No saved plans yet. Build one and press Save plan.",
      close: "Close",
      delQ: "Delete plan?",
      delT: '"{name}" will be removed for good.',
      deleted: "Plan deleted.",
      delFail: "Couldn't delete that plan.",
      newQ: "Start a new plan?",
      newT: "This plan hasn't been saved.",
      startNew: "Start new",
      langEdited: "Hand-edited sessions keep their current text. Use Rebuild from settings to translate them.",
      tdToday: "Today",
      tdWeek: "Week {n} \xB7 {phase}",
      tdRest: "Rest day",
      tdRestT: "No run planned today.",
      tdNext: "Next: <b>{when}</b>, {name} {amt}",
      tdBefore: "Plan starts {d}",
      tdBeforeT: "First run: <b>{when}</b>, {name} {amt}",
      tdDone: "Plan finished",
      tdDoneT: "The last week ended on {d}.",
      tdEdit: "Edit",
      tdWatchTitle: "{name} \xB7 {d}",
      qwOpen: "Quick workout",
      qwTitle: "Quick workout",
      qwAnyway: "Run anyway? Build a quick workout",
      qwType: "Type",
      qwUnit: "Measure by",
      qwUnitD: "Distance",
      qwUnitT: "Time",
      qwDist: "Distance",
      qwDur: "Duration",
      qwLess: "Less",
      qwMore: "More",
      qwSize: "Size",
      qwSize_s: "Short",
      qwSize_m: "Medium",
      qwSize_l: "Long",
      qwRace: "Target race",
      qwWucd: "Warm-up and cool-down",
      qwPacesPlan: "Paces from your plan, {plan}.",
      qwPacesEffort: "No race time: the watch shows effort, not pace.",
      qwPaces: "Your paces",
      qwPacesOwn: "Paces from this race, kept for quick workouts only.",
      qwPacesBad: "That time doesn't fit the race. Try mm:ss or h:mm:ss.",
      qwFt: "Fine-tune",
      qwFtShort: "tuned",
      qwFtTag: "Tuned",
      qwFtSub: "Reps, rep length, recovery, target pace",
      qwFtReset: "Reset fine-tune",
      qwPace: "Target pace",
      qwPaceHint: "For the reps, as min:sec per km. The watch alerts you around it.",
      qwPaceBad: "Type a pace like 4:30 (between 2:30 and 10:00 per km).",
      pl_custom: "target pace",
      qwReps: "Reps",
      qwRepD: "Rep distance",
      qwRepT: "Rep time",
      qwRecD: "Recovery distance",
      qwRecT: "Recovery time",
      qwRecent: "Recent",
      qwEmpty: "Just want one session?",
      qwAdd: "Also add it to {plan}",
      qwAddOn: "On",
      qwAddHint: "It then counts in the plan's weekly checks, like any run you add.",
      qwEmptyGo: "Build a quick workout",
      tdEst: "\u2248 {d}",
      durMin: "{m} min",
      durHM: "{h} h {m}",
      tdJog: "jog",
      sendTo: "Send to {dev}",
      tdHeat: "<b>Hot today (feels {v}\xB0).</b> Easy and tempo paces {s} s/km slower.",
      tdHeatHard: " Run the hard parts by effort, not pace.",
      wxAdd: "Add a city for today's weather",
      wxDriest: "driest {h}",
      wxTitle: "Weather",
      wxSet: "Add a city to see today's forecast for your run.",
      wxCity: "City",
      wxCityPh: "e.g. Paris",
      wxGo: "Show forecast",
      wxGeo: "Use my location",
      wxChange: "Change",
      wxLoading: "Loading forecast\u2026",
      wxNoCity: "No city called \u201C{q}\u201D. Try adding the country, like \u201CDeauville, France\u201D.",
      wxBlocked: "The forecast couldn't load. Check your connection, then use Change to try again.",
      wxGeoFail: "Location isn't available here. Type a city instead.",
      wxFeels: "feels {v}\xB0",
      wxHiLo: "high {h}\xB0 \xB7 low {l}\xB0",
      wxRain: "rain {p}%",
      wxWind: "wind {w} km/h",
      wxSun: "sunset {t}",
      wxBest: "Driest slot left today: <b>{h}</b>, {p}% rain, {tp}\xB0",
      wxUpd: "Updated {t}",
      wmo0: "Clear",
      wmo1: "Mostly clear",
      wmo2: "Partly cloudy",
      wmo3: "Overcast",
      wmo45: "Fog",
      wmo51: "Drizzle",
      wmo56: "Freezing drizzle",
      wmo61: "Rain",
      wmo65: "Heavy rain",
      wmo66: "Freezing rain",
      wmo71: "Snow",
      wmo80: "Showers",
      wmo85: "Snow showers",
      wmo95: "Thunderstorm"
    },
    fr: {
      planNameLabel: "Nom du plan",
      editPlan: "Modifier le plan",
      done: "OK",
      secGoal: "Objectif",
      secRace: "Course",
      secFocus: "Distance et dates",
      secYourWeek: "Votre semaine",
      icRace: "Un plan qui monte jusqu'\xE0 la course puis s'all\xE8ge avant.",
      icFit: "Progresser semaine apr\xE8s semaine, sans date de course.",
      icQuick: "Une s\xE9ance pour votre montre, sans plan.",
      introStep: "\xC9tape {n} sur 4 \xB7 {name}",
      introNext: "Suivant",
      introBack: "Retour",
      introDone: "Cr\xE9er mon plan",
      introSkip: "Voir tous les r\xE9glages",
      introNeed: "Avant de continuer :",
      introWait: "La forme de votre plan s'affiche ici une fois les \xE9tapes remplies.",
      needDist: "Choisissez une distance.",
      needDate: "Choisissez la date de la course.",
      needWeeks: "Indiquez les semaines d'entra\xEEnement (3 \xE0 30).",
      goalRace: "Pr\xE9parer une course",
      goalFit: "Plan perso",
      focusDist: "Distance de r\xE9f\xE9rence",
      startDate: "Date de d\xE9but",
      focusHint: "Elle fixe les allures et la longueur des sorties longues. Pas de course, pas d'aff\xFBtage : le plan progresse simplement semaine apr\xE8s semaine.",
      fitHint: "Du lundi {s} au dimanche {e}.",
      fitBlock: "Plan perso {n} semaines",
      hFitStarts: "Votre plan de {n} semaines commence le lundi {d}.",
      hFitIn: "Semaine {n} sur {t}, phase {phase}{cut}.",
      hFitDone: "Votre plan de {n} semaines s'est termin\xE9 le {d}. Indiquez une nouvelle date de d\xE9but pour pr\xE9parer la suite.",
      wa_pastFit: "La semaine 1 a commenc\xE9 le {d}. D\xE9placez la date de d\xE9but pour que le plan d\xE9marre maintenant.",
      planMetaFit: "Base {lbl} \xB7 {w} semaines \xB7 d\xE9but le {d}",
      myPlans: "Mes plans",
      newPlan: "Nouveau plan",
      savePlan: "Enregistrer",
      keepPlan: "Garder ce plan",
      language: "Langue",
      theme: "Th\xE8me",
      thDark: "Sombre",
      thLight: "Clair",
      thAuto: "Auto",
      thHint: "Auto suit le r\xE9glage de l'appareil.",
      runUnit: "Sorties affich\xE9es en",
      ruKm: "km",
      ruMin: "minutes",
      ruHint: "Les minutes sont estim\xE9es d'apr\xE8s vos allures. Le plan reste construit en km.",
      prefs: "Affichage et langue",
      distance: "Distance",
      customKm: "Distance personnalis\xE9e (km)",
      raceDate: "Date de la course",
      weeks: "Semaines d'entra\xEEnement",
      secNow: "Votre niveau actuel",
      curVol: "Volume hebdo (km)",
      volHint: "Suggestion selon votre exp\xE9rience et votre distance. Remplacez-la par ce que vous courez aujourd'hui.",
      curLong: "Plus longue sortie r\xE9cente (km, facultatif)",
      recDist: "Course r\xE9cente",
      none: "Aucune",
      halfMarathon: "Semi-marathon",
      marathon: "Marathon",
      recTime: "Temps final",
      recTimePh: "h:mm:ss ou mm:ss",
      level: "Exp\xE9rience",
      lv_new: "D\xE9butant",
      lv_regular: "R\xE9gulier",
      lv_experienced: "Confirm\xE9",
      lvHint_new: "Pas de s\xE9ance difficile dans la premi\xE8re phase, puis une par semaine au plus. Une semaine all\xE9g\xE9e toutes les 3 semaines, des footings plus courts.",
      lvHint_regular: "Jusqu'\xE0 2 s\xE9ances difficiles par semaine \xE0 partir de 5 sorties. Une semaine all\xE9g\xE9e toutes les 4 semaines.",
      lvHint_experienced: "Jusqu'\xE0 2 s\xE9ances difficiles par semaine \xE0 partir de 4 sorties. Une semaine all\xE9g\xE9e toutes les 4 semaines.",
      wk_tooHardNew: "{n} s\xE9ances difficiles cette semaine : pour un d\xE9butant, restez \xE0 {m}. Passez-en une en footing.",
      wa_wkTooHardNew: "{w} : plus de s\xE9ances difficiles que n'en supporte un d\xE9butant. D\xE9tails sur la semaine.",
      secWeek: "Semaine type",
      runsPerWeek: "Sorties par semaine",
      runningDays: "Jours de course",
      longDay: "Jour de la sortie longue",
      secTypes: "Types de s\xE9ances",
      typesHint: "Les mod\xE8les de description acceptent <code>{km}</code> <code>{easy}</code> <code>{tempo}</code> <code>{interval}</code> <code>{rep}</code> <code>{race}</code> <code>{mp}</code> et <code>{work}</code>, le corps de s\xE9ance qui progresse au fil du plan.",
      addType: "Ajouter un type de s\xE9ance",
      typesCount: "Touchez une s\xE9ance pour l\u2019activer ou la d\xE9sactiver. {a} sur {b} activ\xE9es.",
      grpEasy: "Faciles",
      grpQuality: "Qualit\xE9",
      customise: "Personnaliser les s\xE9ances",
      customiseSub: "Phases, descriptions, vos propres s\xE9ances",
      alwaysOn: "Toujours activ\xE9e",
      d5k: "5 km",
      d10k: "10 km",
      dhm: "Semi",
      dm: "Marathon",
      dcustom: "Autre",
      l5k: "5 km",
      l10k: "10 km",
      lhm: "semi-marathon",
      lm: "marathon",
      kEasy: "Facile",
      kRecovery: "R\xE9cup\xE9ration",
      kLong: "Longue",
      kHard: "Qualit\xE9",
      ph_base: "foncier",
      ph_build: "d\xE9veloppement",
      ph_peak: "sp\xE9cifique",
      ph_taper: "aff\xFBtage",
      cutback: "all\xE9g\xE9e",
      days: "Lun|Mar|Mer|Jeu|Ven|Sam|Dim",
      days1: "L|M|M|J|V|S|D",
      whyLbl: "Pourquoi cette s\xE9ance :",
      pdfWhyHead: "Types de s\xE9ances du plan",
      pdfWhyCol: "Pourquoi, et quelles sensations",
      why_easy: "Construit votre fond et vous laisse r\xE9cup\xE9rer entre les s\xE9ances plus dures. Facile : environ 3-4 sur 10, vous parlez en phrases compl\xE8tes.",
      why_long: "D\xE9veloppe l'endurance : jambes, c\u0153ur et ravitaillement s'habituent \xE0 courir longtemps. R\xE9gulier : environ 4-5 sur 10, vous pouvez encore parler en phrases.",
      why_recovery: "D\xE9lie les jambes apr\xE8s une s\xE9ance dure ou la sortie longue sans ajouter de fatigue. Tr\xE8s facile : 2-3 sur 10, plus lent que naturellement.",
      why_strides: "Garde des jambes vives et une foul\xE9e rel\xE2ch\xE9e sans vous fatiguer. Footing, puis courtes acc\xE9l\xE9rations \xE0 environ 8 sur 10, r\xE9cup\xE9ration compl\xE8te.",
      why_tempo: "Rel\xE8ve l'allure que vous tenez longtemps (votre seuil). Soutenu mais contr\xF4l\xE9 : environ 7 sur 10, quelques mots \xE0 la fois.",
      why_intervals: "D\xE9veloppe votre moteur a\xE9robie maximal (VMA) et votre vitesse. Dur : environ 8-9 sur 10, impossible de parler pendant les r\xE9p\xE9titions.",
      why_hills: "Renforce les jambes et la puissance avec moins de chocs que la vitesse sur le plat. Dur en mont\xE9e : environ 8 sur 10, descente en trottinant ou en marchant.",
      why_fartlek: "Introduit la vitesse aux sensations, sans allure fixe. Passages rapides \xE0 environ 7-8 sur 10, footing entre les deux.",
      why_progression: "Apprend \xE0 finir fort sur des jambes fatigu\xE9es. Commence facile (3-4 sur 10) et finit soutenu (environ 7 sur 10).",
      why_racepace: "R\xE9p\xE8te l'allure et le rythme exacts de votre course. Effort de course : environ 7-8 sur 10 pour un semi ou un marathon, 8-9 pour un 5 ou 10 km.",
      ty_easy: "Sortie facile",
      tp_easy: "{km} km tranquille \xE0 {easy}. Vous devez pouvoir parler en phrases compl\xE8tes.",
      ty_long: "Sortie longue",
      tp_long: "{km} km r\xE9gulier \xE0 {easy}. {work}",
      ty_recovery: "Footing de r\xE9cup\xE9ration",
      tp_recovery: "{km} km tr\xE8s facile, plus lent que {easy}. Court et rel\xE2ch\xE9.",
      ty_strides: "Footing + lignes droites",
      tp_strides: "{km} km \xE0 {easy}, puis {work}.",
      ty_tempo: "Tempo",
      tp_tempo: "2 km d'\xE9chauffement, {work}, 2 km de retour au calme.",
      ty_intervals: "Fractionn\xE9",
      tp_intervals: "2 km d'\xE9chauffement avec lignes droites, {work}, 2 km de retour au calme.",
      ty_hills: "C\xF4tes",
      tp_hills: "2 km d'\xE9chauffement, {work}, 2 km de retour au calme.",
      ty_fartlek: "Fartlek",
      tp_fartlek: "2 km d'\xE9chauffement, {work}, 2 km de retour au calme.",
      ty_progression: "Sortie progressive",
      tp_progression: "{km} km en partant \xE0 {easy}, {work}.",
      ty_racepace: "Allure course",
      tp_racepace: "2 km d'\xE9chauffement, {work}, 2 km de retour au calme.",
      ty_custom: "S\xE9ance perso",
      tp_custom: "2 km d'\xE9chauffement, d\xE9crivez le corps de s\xE9ance ici, 2 km de retour au calme.",
      pe_easy: "allure conversation",
      pe_tempo: "effort soutenu mais contr\xF4l\xE9",
      pe_interval: "effort de 5 km",
      pe_rep: "rapide et rel\xE2ch\xE9",
      pe_race: "allure objectif",
      pe_mp: "allure marathon",
      w_tempoCruise: "{n} \xD7 8 min \xE0 {tempo}, r\xE9cup 90 s trot",
      w_tempoCont: "{mins} min en continu \xE0 {tempo}",
      w_int: "{n} \xD7 {rep} m \xE0 {interval}, {rec}",
      jog90: "r\xE9cup 90 s trot",
      jog120: "r\xE9cup 2 min trot",
      jog180: "r\xE9cup 3 min trot",
      w_hills: "{n} \xD7 75 s en c\xF4te \xE0 effort soutenu, retour en trottinant",
      w_fart1: "{n} \xD7 1 min vite / 1 min facile",
      w_fart2: "{n} \xD7 2 min \xE0 {interval} / 1 min facile",
      w_prog: "les {x} derniers km en acc\xE9l\xE9rant jusqu'\xE0 {tempo}",
      w_rpM: "{k} km en continu \xE0 {mp}",
      w_rp: "{n} \xD7 {b} km \xE0 {race}, {rec}",
      w_strides: "{n} lignes droites de 20 s, retour en marchant",
      w_longFast: "Courez les {x} derniers km \xE0 {race}.",
      w_longFuel: "Testez votre ravitaillement du jour J.",
      w_longPick: "Acc\xE9l\xE9rez \xE0 {tempo} sur les 10 derni\xE8res minutes.",
      raceDay: "Jour de course",
      raceDescV: "Course : {lbl}. Votre r\xE9sultat r\xE9cent annonce environ {time} ({pace}). Partez 5 \xE0 10 s/km plus lentement sur le premier km, calez-vous, puis faites la course en seconde moiti\xE9.",
      raceDescE: "Course : {lbl}. Partez sur la retenue le premier km, calez-vous \xE0 l'allure objectif, puis donnez tout sur le dernier quart.",
      wa_short: "{w} semaines, c'est court pour un {lbl}. {min} semaines ou plus permettent d'augmenter le volume sans \xE0-coups.",
      wa_long: "Au-del\xE0 de 24 semaines, un plan s'essouffle. Faites d'abord une phase de foncier g\xE9n\xE9rale, puis {n} semaines cibl\xE9es.",
      wa_lowVol: "{v} km/semaine, c'est un point de d\xE9part bas pour un {lbl}. Le plan progresse prudemment, attendez-vous \xE0 un pic modeste.",
      wa_mLong: "Avec une plus longue sortie r\xE9cente sous 14 km, atteindre des sorties de 32 km en s\xE9curit\xE9 dans un seul plan est difficile.",
      wa_ready: "Ce plan culmine \xE0 une sortie longue de {long} km et {peak} km sur une semaine. Un {lbl} demande en g\xE9n\xE9ral une sortie longue d'environ {tl} km et des semaines d'environ {tp} km. Ajoutez des semaines, ou choisissez l'objectif Plan perso.",
      wa_days: "Vous avez choisi {d} jours pour {r} sorties par semaine. Une r\xE9partition par d\xE9faut s'applique tant que les deux ne correspondent pas.",
      wa_tooMany: "{h} types de s\xE9ances de qualit\xE9 pour {r} sorties par semaine : la place ne permet que {m} {sess} par semaine. Les types tournent, chacun revient donc moins souvent.",
      sessOne: "s\xE9ance difficile",
      sessMany: "s\xE9ances difficiles",
      wa_noHard: "Aucun type de s\xE9ance de qualit\xE9 n'est coch\xE9 : le plan n'a aucune s\xE9ance difficile.",
      wa_w1: "La semaine 1 fait {km} km, plus que les {v} km par semaine que vous courez aujourd'hui : {r} sorties \xE0 leur distance minimale y arrivent d\xE9j\xE0. Moins de sorties par semaine, ou le niveau D\xE9butant (sorties plus courtes), commenceraient plus bas.",
      wa_w1New: "La semaine 1 fait {km} km, plus que les {v} km par semaine que vous courez aujourd'hui : {r} sorties \xE0 leur distance minimale y arrivent d\xE9j\xE0. Moins de sorties par semaine commenceraient plus bas.",
      wa_w1Edit: "La semaine 1 fait {km} km, plus que les {v} km par semaine que vous courez aujourd'hui.",
      wa_steep: "{w} plus de 10 % au-dessus de la derni\xE8re semaine compl\xE8te. Chaque sortie est d\xE9j\xE0 \xE0 sa distance minimale : moins de sorties par semaine rendrait la progression plus douce.",
      wa_steepEdit: "{w} plus de 10 % au-dessus de la derni\xE8re semaine compl\xE8te. Raccourcir une sortie rendrait la progression plus douce.",
      wkL1: "Semaine {n}",
      wkLn: "Semaines {n}",
      wkWarn: "\xC0 revoir",
      wa_wkTooHard: "{w} : plus de s\xE9ances difficiles que n'en supportent {r} sorties par semaine. D\xE9tails sur la semaine.",
      wa_wkB2B: "{w} : une s\xE9ance difficile coll\xE9e \xE0 une autre s\xE9ance difficile ou \xE0 la sortie longue. D\xE9tails sur la semaine.",
      wa_wkNoRest: "{w} : aucun jour de repos. D\xE9tails sur la semaine.",
      wk_b2b: "{pairs} s'encha\xEEnent. Gardez un jour facile ou de repos entre les s\xE9ances difficiles et la sortie longue.",
      wk_pair: "{a} ({da}) et {b} ({db})",
      wk_noRest: "Des sorties les 7 jours de la semaine : gardez au moins un jour de repos.",
      wa_row: "{days} : {n} jours d'affil\xE9e. Gardez celui du milieu facile, ou espacez vos jours de course.",
      wa_noGap: "Tous vos autres jours de course touchent la sortie longue ({long}) : la s\xE9ance difficile tombera juste \xE0 c\xF4t\xE9. Ajoutez un jour plus \xE9loign\xE9, ou d\xE9placez la sortie longue.",
      wa_noRest7: "7 sorties par semaine ne laissent aucun jour de repos. Faites de l'une d'elles une courte sortie de r\xE9cup\xE9ration, ou courez 6 jours.",
      wk_tooHard: "{n} s\xE9ances difficiles cette semaine : \xE0 {r} sorties par semaine, restez \xE0 {m}. Passez-en une en footing.",
      wkOne: "La semaine {n} est",
      wkMany: "Les semaines {n} sont",
      wa_noPace: "Sans temps de course r\xE9cent, les s\xE9ances sont d\xE9crites en effort plut\xF4t qu'en allure.",
      wa_badTime: "Impossible de lire {time} comme temps sur {lbl} : les s\xE9ances sont d\xE9crites en effort. \xC9crivez-le en h:mm:ss ou mm:ss, par exemple {ex}.",
      wa_past: "Avec cette date et cette dur\xE9e, la semaine 1 a commenc\xE9 le {d}. Raccourcissez le plan ou d\xE9placez la date.",
      blockName: "Plan {lbl}",
      trainingBlock: "Plan d'entra\xEEnement",
      daysCount: "({a} sur {b})",
      useType: "Utiliser {name}",
      typeNameLbl: "Nom du type de s\xE9ance",
      remove: "Retirer",
      editDesc: "modifier la description",
      kind: "Cat\xE9gorie",
      usedPhases: "Utilis\xE9 dans les phases",
      tplLbl: "Mod\xE8le de description",
      startHint: "La semaine 1 commence le lundi {d}. Course le {r}.",
      paceHint: "Allures : facile {e}, tempo {t}, fractionn\xE9 {i}, allure {lbl} {r}.",
      paceHintNone: "Ajoutez une course r\xE9cente et son temps pour obtenir des allures.",
      exampleBanner: "R\xE9glages d'exemple. Modifiez la course, votre niveau et les types de s\xE9ances dans les r\xE9glages : le plan se recalcule au fur et \xE0 mesure.",
      pendingBanner: "Vous avez modifi\xE9 des s\xE9ances \xE0 la main, les nouveaux r\xE9glages ne sont donc pas encore appliqu\xE9s.",
      rebuildPlan: "Recalculer le plan",
      keepEdits: "Garder mes modifications",
      stWeeks: "semaines",
      stTotal: "km au total",
      stPeak: "km semaine max",
      stLongest: "km sortie la plus longue",
      stEquiv: "\xE9quivalent {lbl}",
      sToGo: "semaines restantes",
      sToGo1: "semaine restante",
      sPeak: "semaine max",
      sLongest: "sortie la plus longue",
      sTarget: "objectif {lbl}",
      uH: "h",
      uMin: "min",
      loadProfile: "Profil de charge",
      longRunLeg: "sortie longue",
      sendAll: "Envoyer toutes les s\xE9ances \xE0 la montre",
      exportCal: "Exporter le calendrier",
      exportCsv: "Exporter en CSV",
      exportFmt: "Format d'export",
      fmtCsv: "CSV (tableur)",
      fmtPdf: "PDF (imprimable)",
      exportGo: "Exporter",
      pdfBuilding: "Cr\xE9ation du PDF\u2026",
      pdfLoadFail: "Impossible de charger le g\xE9n\xE9rateur de PDF. V\xE9rifiez votre connexion et r\xE9essayez.",
      pdfFail: "Impossible de cr\xE9er le PDF : {m}",
      pdfGenerated: "Cr\xE9\xE9 le {d}",
      pdfPage: "Page {p} sur {n}",
      pdfRace: "Course",
      rebuildFrom: "Recalculer depuis les r\xE9glages",
      week: "Semaine",
      showPast: "Afficher {n} semaine(s) pass\xE9e(s)",
      hidePast: "Masquer {n} semaine(s) pass\xE9e(s)",
      wAbbr: "S",
      sendWatch: "Envoyer \xE0 la montre",
      sendWatchWeek: "Envoyer la semaine {n} \xE0 la montre",
      watchShort: "Montre",
      rest: "Repos",
      tabPlan: "Plan",
      tabSetup: "R\xE9glages",
      seePlan: "Voir le plan",
      editSettings: "Modifier les r\xE9glages",
      addRun: "+ Ajouter une sortie",
      noteBadge: "NOTE",
      svgTitle: "Semaine {n} : {km} km, {phase}",
      svgNow: "cette semaine",
      svgToday: "aujourd'hui",
      svgRace: "semaine de course",
      svgAria: "Kilom\xE8tres par semaine",
      editRace: "Modifier la course",
      removeRace: "Retirer la course",
      raceOptional: "Facultatif : indiquez votre course pour l'afficher en haut de page avec un compte \xE0 rebours.",
      findOn: "Trouver des courses ({lbl}) sur Finishers",
      addMyRace: "Ajouter ma course",
      raceUrl: "Lien de la page de la course (facultatif)",
      raceUrlPh: "Collez la page Finishers de la course",
      raceName: "Nom de la course",
      raceNamePh: "ex. Semi-marathon de Boulogne",
      city: "Ville",
      raceMatch: "La date et la distance de la course viennent des champs ci-dessus : r\xE9glez-les en cons\xE9quence.",
      useRace: "Choisir cette course",
      cancel: "Annuler",
      searchFin: "Chercher sur Finishers",
      needName: "Donnez un nom \xE0 la course.",
      hello: "Bonjour",
      hPast: "Votre {lbl} a eu lieu le {d}. Indiquez une nouvelle date pour pr\xE9parer le prochain plan.",
      hToday: "Jour de course. Profitez de votre <b>{lbl}</b> : calez-vous vite et faites la course en seconde moiti\xE9.",
      hDays: "<b>J-{n}</b> avant votre {lbl} le {d}.",
      hDay1: "<b>J-1</b> avant votre {lbl} le {d}.",
      hRaceComing: "<b>{name}</b> approche.",
      hRecIn: "R\xE9cup\xE9ration apr\xE8s votre {lbl} : semaine {k} sur {r}.",
      recWeeks: "R\xE9cup\xE9ration apr\xE8s la course",
      rec0: "Aucune",
      rec1: "1 semaine",
      rec2: "2 semaines",
      recHint0: "Le plan s'arr\xEAte le jour de la course.",
      recHint: "Des semaines faciles apr\xE8s la course : pas de s\xE9ance difficile, des sorties moins nombreuses et plus courtes, rien les deux jours qui suivent la course.",
      ph_recovery: "r\xE9cup\xE9ration",
      hStarts: "La semaine 1 commence le lundi {d}.",
      hInWeek: "Vous \xEAtes en semaine {n} sur {t}, phase {phase}{cut}.",
      hCut: ", semaine all\xE9g\xE9e",
      hNext: " Prochaine s\xE9ance {when} : <b>{name}, {amt}</b>.",
      today: "aujourd'hui",
      dayOne: "jour",
      dayMany: "jours",
      eTitle: "Semaine {n} \xB7 {day}",
      runType: "Type de s\xE9ance",
      dayLbl: "Jour",
      distKm: "Distance (km)",
      desc: "Description",
      watchWorkout: "S\xE9ance pour la montre",
      watchHint: "Construite \xE0 partir de la structure de la s\xE9ance. Changer la distance la met \xE0 jour, modifier la description non.",
      note: "Note",
      notePhOwn: "Votre note",
      deleteRun: "Supprimer la sortie",
      saveChanges: "Enregistrer",
      sendTitleRun: "Semaine {n}, {day} : {name}, {amt}",
      sendTitleWeek: "Semaine {n} : {c} sorties",
      sendTitleAll: "Plan complet : {c} sorties",
      rebuildQ: "Recalculer le plan ?",
      rebuildT: "Cela remplace vos modifications et vos notes par un nouveau plan bas\xE9 sur les r\xE9glages actuels.",
      rebuild: "Recalculer",
      unknownErr: "erreur inconnue",
      pl_easy: "facile",
      pl_tempo: "tempo",
      pl_interval: "fractionn\xE9",
      pl_rep: "vitesse",
      pl_race: "allure course",
      pl_mp: "allure marathon",
      recoverySfx: " r\xE9cup",
      warmup: "\xC9chauffement",
      cooldown: "Retour au calme",
      recover: "R\xE9cup",
      run: "Course",
      devOther: "Autre montre ou appli",
      devFiles: "fichiers .{ext}",
      helpApple: "Sur votre iPhone, ouvrez le zip dans Fichiers, puis touchez chaque fichier .workout pour l'ajouter \xE0 l'app Exercice. N\xE9cessite une version r\xE9cente d'iOS et de watchOS.",
      helpGarmin: "D\xE9compressez sur un ordinateur, branchez la montre en USB et copiez les fichiers .fit dans GARMIN/NewFiles. Ils apparaissent dans Entra\xEEnement > Entra\xEEnements. Certains mod\xE8les r\xE9cents n'acceptent les s\xE9ances que via Garmin Connect.",
      helpOther: "Fichiers de s\xE9ances structur\xE9es .fit. Importez-les dans une appli qui accepte ces fichiers, comme intervals.icu, puis synchronisez votre montre depuis celle-ci.",
      sendTitle: "Envoyer \xE0 votre montre",
      device: "Appareil",
      download: "T\xE9l\xE9charger",
      noDownloads: "Les t\xE9l\xE9chargements ne sont pas disponibles dans cette vue.",
      wkLoadFail: "Impossible de charger le g\xE9n\xE9rateur de s\xE9ances Apple Watch. V\xE9rifiez votre connexion et r\xE9essayez.",
      buildFail: "Impossible de cr\xE9er la s\xE9ance \xAB {name} \xBB : {m}",
      savedOne: "1 s\xE9ance {dev} enregistr\xE9e. {help}",
      savedMany: "{n} s\xE9ances {dev} enregistr\xE9es. {help}",
      dlFail: "Impossible d'enregistrer le fichier.",
      dlFailM: "Impossible d'enregistrer le fichier : {m}",
      icsDesc: "Semaine {n} ({phase}). {desc}",
      icsNote: "Note : ",
      csvHead: "Semaine|Phase|Date|Jour|S\xE9ance|Km|Description|Note",
      unsaved: "Modifications non enregistr\xE9es",
      saving: "Enregistrement\u2026",
      saved: "Enregistr\xE9",
      savedLocal: "Enregistr\xE9 dans ce navigateur",
      planSaved: "Plan enregistr\xE9.",
      notSaved: "Non enregistr\xE9",
      saveFail: "\xC9chec de l'enregistrement. Votre plan est toujours l\xE0, r\xE9essayez.",
      localOnly: "Les plans sont conserv\xE9s dans ce navigateur uniquement. Utilisez Enregistrer le plan pour en garder une copie dans un fichier ou les passer sur un autre appareil.",
      bkSave: "Enregistrer le plan",
      bkLater: "Plus tard",
      bkBanner: "Vos plans ne sont conserv\xE9s que dans ce navigateur, qui peut les effacer. Enregistrez-en une copie dans un fichier.",
      bkLast: "Dernier enregistrement dans un fichier : {d}.",
      bkNever: "Dernier enregistrement dans un fichier : jamais.",
      importPlans: "Importer\u2026",
      imported: "{n} plan(s) import\xE9(s).",
      impCopy: "{n} ajout\xE9(s) en copie, car le plan d'ici a \xE9t\xE9 modifi\xE9 plus r\xE9cemment.",
      impSame: "{n} d\xE9j\xE0 \xE0 jour.",
      impNone: "Rien de nouveau : {n} plan(s) d\xE9j\xE0 \xE0 jour.",
      copyName: "{name} (import\xE9)",
      importFail: "Ce fichier n'est pas un export Block Builder.",
      planMeta: "{lbl} \xB7 {w} semaines \xB7 course le {d}",
      open: "Ouvrir",
      del: "Supprimer",
      noPlans: "Aucun plan enregistr\xE9. Cr\xE9ez-en un puis cliquez sur Enregistrer.",
      close: "Fermer",
      delQ: "Supprimer le plan ?",
      delT: "\xAB {name} \xBB sera supprim\xE9 d\xE9finitivement.",
      deleted: "Plan supprim\xE9.",
      delFail: "Impossible de supprimer ce plan.",
      newQ: "Commencer un nouveau plan ?",
      newT: "Ce plan n'a pas \xE9t\xE9 enregistr\xE9.",
      startNew: "Nouveau plan",
      langEdited: "Les s\xE9ances modifi\xE9es \xE0 la main gardent leur texte. Utilisez \xAB Recalculer depuis les r\xE9glages \xBB pour les traduire.",
      tdToday: "Aujourd'hui",
      tdWeek: "Semaine {n} \xB7 {phase}",
      tdRest: "Repos",
      tdRestT: "Pas de sortie pr\xE9vue aujourd'hui.",
      tdNext: "Prochaine : <b>{when}</b>, {name} {amt}",
      tdBefore: "Le plan commence le {d}",
      tdBeforeT: "Premi\xE8re sortie : <b>{when}</b>, {name} {amt}",
      tdDone: "Plan termin\xE9",
      tdDoneT: "La derni\xE8re semaine s'est termin\xE9e le {d}.",
      tdEdit: "Modifier",
      tdWatchTitle: "{name} \xB7 {d}",
      qwOpen: "S\xE9ance rapide",
      qwTitle: "S\xE9ance rapide",
      qwAnyway: "Envie de courir ? Cr\xE9ez une s\xE9ance rapide",
      qwType: "Type",
      qwUnit: "Mesurer en",
      qwUnitD: "Distance",
      qwUnitT: "Temps",
      qwDist: "Distance",
      qwDur: "Dur\xE9e",
      qwLess: "Moins",
      qwMore: "Plus",
      qwSize: "Format",
      qwSize_s: "Court",
      qwSize_m: "Moyen",
      qwSize_l: "Long",
      qwRace: "Course vis\xE9e",
      qwWucd: "\xC9chauffement et retour au calme",
      qwPacesPlan: "Allures de votre plan, {plan}.",
      qwPacesEffort: "Pas de temps de course : la montre indique l'effort, pas l'allure.",
      qwPaces: "Vos allures",
      qwPacesOwn: "Allures tir\xE9es de cette course, gard\xE9es pour les s\xE9ances rapides seulement.",
      qwPacesBad: "Ce temps ne correspond pas \xE0 la course. Essayez mm:ss ou h:mm:ss.",
      qwFt: "Ajuster",
      qwFtShort: "ajust\xE9e",
      qwFtTag: "Ajust\xE9e",
      qwFtSub: "R\xE9p\xE9titions, longueur, r\xE9cup, allure cible",
      qwFtReset: "Annuler les ajustements",
      qwPace: "Allure cible",
      qwPaceHint: "Pour les r\xE9p\xE9titions, en min:s par km. La montre vous alerte autour.",
      qwPaceBad: "Saisissez une allure comme 4:30 (entre 2:30 et 10:00 au km).",
      pl_custom: "allure cible",
      qwReps: "R\xE9p\xE9titions",
      qwRepD: "Distance par r\xE9p\xE9tition",
      qwRepT: "Dur\xE9e par r\xE9p\xE9tition",
      qwRecD: "Distance de r\xE9cup",
      qwRecT: "Dur\xE9e de r\xE9cup",
      qwRecent: "R\xE9centes",
      qwEmpty: "Juste une s\xE9ance ?",
      qwAdd: "L'ajouter aussi \xE0 {plan}",
      qwAddOn: "Le",
      qwAddHint: "Elle compte alors dans les v\xE9rifications hebdo du plan, comme toute s\xE9ance ajout\xE9e.",
      qwEmptyGo: "Cr\xE9ez une s\xE9ance rapide",
      tdEst: "\u2248 {d}",
      durMin: "{m} min",
      durHM: "{h} h {m}",
      tdJog: "r\xE9cup",
      sendTo: "Envoyer sur {dev}",
      tdHeat: "<b>Chaud aujourd'hui (ressenti {v}\xB0).</b> Allures facile et tempo {s} s/km plus lentes.",
      tdHeatHard: " Faites les parties dures \xE0 l'effort, pas \xE0 l'allure.",
      wxAdd: "Ajoutez une ville pour la m\xE9t\xE9o du jour",
      wxDriest: "plus sec {h}",
      wxTitle: "M\xE9t\xE9o",
      wxSet: "Ajoutez une ville pour voir la m\xE9t\xE9o du jour pour votre sortie.",
      wxCity: "Ville",
      wxCityPh: "ex. Paris",
      wxGo: "Voir la m\xE9t\xE9o",
      wxGeo: "Utiliser ma position",
      wxChange: "Changer",
      wxLoading: "Chargement de la m\xE9t\xE9o\u2026",
      wxNoCity: "Aucune ville nomm\xE9e \xAB {q} \xBB. Ajoutez le pays, par exemple \xAB Deauville, France \xBB.",
      wxBlocked: "La m\xE9t\xE9o n'a pas pu se charger. V\xE9rifiez votre connexion, puis utilisez Changer pour r\xE9essayer.",
      wxGeoFail: "La position n'est pas disponible ici. Saisissez une ville.",
      wxFeels: "ressenti {v}\xB0",
      wxHiLo: "max {h}\xB0 \xB7 min {l}\xB0",
      wxRain: "pluie {p} %",
      wxWind: "vent {w} km/h",
      wxSun: "coucher {t}",
      wxBest: "Cr\xE9neau le plus sec aujourd'hui : <b>{h}</b>, {p} % de pluie, {tp}\xB0",
      wxUpd: "Mis \xE0 jour \xE0 {t}",
      wmo0: "Ciel clair",
      wmo1: "Plut\xF4t d\xE9gag\xE9",
      wmo2: "Partiellement nuageux",
      wmo3: "Couvert",
      wmo45: "Brouillard",
      wmo51: "Bruine",
      wmo56: "Bruine vergla\xE7ante",
      wmo61: "Pluie",
      wmo65: "Forte pluie",
      wmo66: "Pluie vergla\xE7ante",
      wmo71: "Neige",
      wmo80: "Averses",
      wmo85: "Averses de neige",
      wmo95: "Orage"
    }
  };
  Object.assign(I18N.en, {
    setupWarn: "Some settings need a look: {f}.",
    needTitle: "Fill in the setup to build your plan:",
    needRuns: "Choose how many runs per week.",
    needVol: "Enter your current weekly volume."
  });
  Object.assign(I18N.fr, {
    setupWarn: "Des r\xE9glages sont \xE0 revoir : {f}.",
    needTitle: "Compl\xE9tez les r\xE9glages pour cr\xE9er votre plan :",
    needRuns: "Choisissez le nombre de sorties par semaine.",
    needVol: "Indiquez votre volume hebdo actuel."
  });

  // src/html.js
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  var escapeText = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
  var SafeHtml = class {
    /** @param {string} s markup that is safe to insert  @param {string} [text] the plain text it came from, if any */
    constructor(s, text) {
      this.s = s;
      this.text = text;
    }
    toString() {
      return this.s;
    }
  };
  function part(v) {
    if (v instanceof SafeHtml) return v.s;
    if (Array.isArray(v)) return v.map(part).join("");
    if (v === null || v === void 0) return "";
    return escapeText(v);
  }
  function html(strings, ...values) {
    let out = strings[0];
    for (let i = 0; i < values.length; i++) out += part(values[i]) + strings[i + 1];
    return new SafeHtml(out);
  }
  function esc(s) {
    if (s instanceof SafeHtml) return s;
    const text = String(s ?? "");
    return new SafeHtml(escapeText(text), text);
  }
  var htmlJoin = (list, sep = "") => new SafeHtml(list.map(part).join(part(sep)));
  var trustedHtml = (s) => new SafeHtml(String(s));
  var plainText = (v) => v instanceof SafeHtml ? v.text ?? v.s : String(v);
  function setHtml(el, value) {
    if (value === "") return clearHtml(el);
    if (!(value instanceof SafeHtml) && !Array.isArray(value))
      throw new TypeError("setHtml needs html`` output, not a plain string (BB-78)");
    el.innerHTML = part(value);
  }
  var clearHtml = (el) => el.replaceChildren();

  // src/i18n.js
  var LANG = (() => {
    try {
      const s = localStorage.getItem("bb-lang");
      if (s === "fr" || s === "en") return s;
    } catch (_) {
    }
    return /^fr/i.test(navigator.language || "") ? "fr" : "en";
  })();
  function t2(k, v) {
    let s = I18N[LANG] && I18N[LANG][k];
    if (s == null) s = I18N.en[k] != null ? I18N.en[k] : k;
    const has = (x) => v && v[x] !== void 0;
    if (/[<&]/.test(s)) return trustedHtml(v ? s.replace(/\{(\w+)\}/g, (m, x) => has(x) ? String(esc(v[x])) : m) : s);
    if (v && Object.values(v).some((x) => x instanceof SafeHtml && x.text === void 0))
      return trustedHtml(
        s.split(/(\{\w+\})/).map((p) => {
          const x = /^\{(\w+)\}$/.exec(p);
          return String(esc(x && has(x[1]) ? v[x[1]] : p));
        }).join("")
      );
    return v ? s.replace(/\{(\w+)\}/g, (m, x) => has(x) ? plainText(v[x]) : m) : s;
  }
  var cap2 = (x) => String(x).charAt(0).toUpperCase() + String(x).slice(1);
  var LOC = () => LANG === "fr" ? "fr-FR" : "en-GB";
  var DAYS = t2("days").split("|");
  var DAYS1 = t2("days1").split("|");
  function useLang(l) {
    LANG = l;
    try {
      localStorage.setItem("bb-lang", l);
    } catch (_) {
    }
    DAYS = t2("days").split("|");
    DAYS1 = t2("days1").split("|");
  }
  var phaseLbl = (p) => t2("ph_" + p);
  var KINDS_KEYS = { easy: "kEasy", recovery: "kRecovery", long: "kLong", hard: "kHard" };
  var kindLbl = (k) => t2(KINDS_KEYS[k] || "kHard");
  var DEFAULT_TYPES = () => TYPE_DEFS2.map(([id, kind, on, locked, ph]) => ({
    id,
    name: t2("ty_" + id),
    kind,
    on,
    ...locked ? { locked: true } : {},
    phases: ph ? ph.slice() : PHASES2.slice(),
    tpl: t2("tp_" + id)
  }));
  function translateTypes(types, from, to) {
    for (const ty of types) {
      const id = TYPE_DEFS2.some((d) => d[0] === ty.id) ? ty.id : "custom";
      if (ty.name === I18N[from]["ty_" + id]) ty.name = I18N[to]["ty_" + id];
      if (ty.tpl === I18N[from]["tp_" + id]) ty.tpl = I18N[to]["tp_" + id];
    }
  }
  function nextSundayWeeks(n) {
    const d = /* @__PURE__ */ new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + (7 - d.getDay()) % 7 + 7 * n);
    return iso2(d);
  }
  var fmtDate2 = (d) => d.toLocaleDateString(LOC(), { day: "numeric", month: LANG === "fr" ? "long" : "short" });
  var fmtShort = (d) => d.toLocaleDateString(LOC(), { day: "numeric", month: "short" });
  var fmtDay = (d) => d.toLocaleDateString(
    LOC(),
    LANG === "fr" ? { weekday: "long", day: "numeric", month: "long" } : { weekday: "short", day: "numeric", month: "short" }
  );

  // src/dom.js
  var $ = (s) => document.querySelector(s);
  var $$ = (s) => document.querySelectorAll(s);
  var cardDetails = (s) => document.querySelector(s);

  // src/state.js
  var DEFAULT_INPUTS = () => ({
    goal: "race",
    startDate: nextMonday2(),
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
    days: DEFAULT_DAYS2[5].slice(),
    longDay: 6,
    race: null
  });
  var BLANK_INPUTS = () => ({
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
    race: null
  });
  var BLANK_TYPES = () => DEFAULT_TYPES().map((x) => ({ ...x, on: x.id === "easy" }));
  var S = {
    nameAuto: true,
    inputs: (
      /** @type {Record<string, any>} */
      DEFAULT_INPUTS()
    ),
    types: DEFAULT_TYPES(),
    plan: null,
    planId: uid2(),
    name: cap2(t2("blockName", { lbl: t2("lhm") })),
    edited: false,
    savedAt: null,
    isExample: true,
    saved: [],
    saving: false,
    dirty: false,
    volSug: null,
    fromExample: true
  };
  var volIsSuggested = () => S.volSug != null && S.inputs.curVol !== "" && +S.inputs.curVol === S.volSug;
  function suggestVolume() {
    const I = S.inputs;
    if (I.curVol !== "" && !volIsSuggested()) return;
    const v = suggestVol2(I);
    if (v == null) return;
    I.curVol = v;
    S.volSug = v;
  }
  function regen() {
    const g = generate2(genInputs2(S.inputs), S.types);
    S.plan = g;
    S.edited = false;
  }
  function defaultName() {
    const I = S.inputs;
    return I.goal === "fitness" ? cap2(t2("fitBlock", { n: I.weeks })) : cap2(t2("blockName", { lbl: distLabel2(I) }));
  }

  // src/modal.js
  var modalOpener = null;
  var lastTrigger = null;
  function openerKey(el) {
    if (el.id) return "#" + CSS.escape(el.id);
    const at = ["data-act", "data-w", "data-s", "data-d"].filter((a) => el.hasAttribute(a));
    return at.length ? at.map((a) => `[${a}="${CSS.escape(el.getAttribute(a))}"]`).join("") : null;
  }
  function modal(body, onMount) {
    const root = $("#modalRoot");
    if (!root.firstChild) {
      const a = document.activeElement;
      const o = a && a !== document.body && !a.closest("#modalRoot") && a.id !== "setup" ? a : lastTrigger;
      modalOpener = o ? { el: o, key: openerKey(o) } : null;
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
  function closeModal() {
    clearHtml($("#modalRoot"));
    const o = modalOpener;
    modalOpener = null;
    if (!o) return;
    queueMicrotask(() => {
      if ($("#modalRoot").firstChild) return;
      const el = o.el.isConnected ? o.el : o.key && document.querySelector(o.key);
      if (el && typeof el.focus === "function") el.focus({ preventScroll: true });
    });
  }
  function modalFocusables(m) {
    return [...m.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.disabled && el.getClientRects().length
    );
  }
  function confirmBox(title, text, okLabel, ok) {
    modal(
      html`<h2>${esc(title)}</h2><p style="margin:0">${esc(text)}</p><div class="actions"><button class="btn" id="cNo">${t2("cancel")}</button><button class="btn primary" id="cYes">${esc(okLabel)}</button></div>`,
      (m) => {
        m.querySelector("#cNo").onclick = closeModal;
        m.querySelector("#cYes").onclick = () => {
          closeModal();
          ok();
        };
      }
    );
  }
  function toast(msg) {
    const t3 = document.createElement("div");
    t3.className = "toast";
    t3.textContent = msg;
    $("#toastRoot").appendChild(t3);
    setTimeout(() => t3.remove(), Math.max(2600, msg.length * 60));
  }
  function initModal() {
    document.addEventListener(
      "pointerdown",
      (e) => {
        const el = (
          /** @type {HTMLElement} */
          e.target
        );
        const c = el.closest && el.closest("button,a[href],[tabindex]");
        if (c && !c.closest("#modalRoot")) lastTrigger = c;
      },
      true
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
      e.preventDefault();
      const i = f.indexOf(document.activeElement);
      const n = i < 0 ? e.shiftKey ? f.length - 1 : 0 : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length;
      f[n].focus();
    });
  }

  // src/editor.js
  var whyOf = (id) => TYPE_DEFS2.some((d) => d[0] === id) ? t2("why_" + id) : "";
  var whyHtml = (id) => {
    const w = whyOf(id);
    return w ? html`<b>${t2("whyLbl")}</b> ${esc(w)}` : "";
  };
  function openEditor(wi, id) {
    const w = S.plan.weeks[wi];
    const s = w.sessions.find((x) => x.id === id);
    if (!s) return;
    const opts = htmlJoin([
      ...S.types.filter((t3) => t3.on || t3.id === s.typeId).map((t3) => html`<option value="${esc(t3.id)}" ${t3.id === s.typeId ? "selected" : ""}>${esc(t3.name)}</option>`),
      html`<option value="race" ${s.typeId === "race" ? "selected" : ""}>${t2("raceDay")}</option>`
    ]);
    modal(
      html`<h2>${t2("eTitle", { n: w.n, day: DAYS[s.day] })}</h2>
  <div class="row"><div class="field"><label for="eType">${t2("runType")}</label><select id="eType">${opts}</select></div>
  <div class="field"><label for="eDay">${t2("dayLbl")}</label><select id="eDay">${htmlJoin(DAYS.map((d, i) => html`<option value="${i}" ${i === s.day ? "selected" : ""}>${d}</option>`))}</select></div></div>
  <p class="hint why" id="eWhy" ${whyOf(s.typeId) ? "" : "hidden"}>${whyHtml(s.typeId)}</p>
  <div class="row"><div class="field"><label for="eKm">${t2("distKm")}</label><input id="eKm" type="number" min="0" step="0.5" value="${esc(s.km)}"></div><div></div></div>
  <div class="field"><label for="eDesc">${t2("desc")}</label><textarea id="eDesc" rows="4">${esc(s.desc)}</textarea></div>
  <div class="field"><span class="lbl">${t2("watchWorkout")}</span><div class="watchsum" id="eWatch">${esc(watchSummary(s.watch || watchPlan2(s.kind, s.km)))}</div><div class="hint">${t2("watchHint")}</div></div>
  <div class="field"><label for="eNote">${t2("note")}</label><textarea id="eNote" rows="3" placeholder="${esc(t2("notePhOwn"))}">${esc(s.note)}</textarea></div>
  <div class="actions"><button class="btn ghost left" id="eDel">${t2("deleteRun")}</button><button class="btn" id="eWatchBtn">${t2("sendWatch")}</button><button class="btn" id="eCancel">${t2("cancel")}</button><button class="btn primary" id="eOk">${t2("saveChanges")}</button></div>`,
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
            const P = paces2(S.inputs);
            const km = +m.querySelector("#eKm").value || s.km;
            const wk = workFor2(ty, {
              p: 0.5,
              D: distKm2(S.inputs),
              c: cat2(distKm2(S.inputs)),
              taper: w.phase === "taper",
              P,
              phase: w.phase
            });
            m.querySelector("#eDesc").value = fill2(ty.tpl, { ...P.txt, km, work: fill2(wk.text || "", P.txt) });
          }
        };
        m.querySelector("#eWatchBtn").onclick = () => {
          closeModal();
          sendToWatch(
            planWorkouts([{ w, s }]),
            t2("sendTitleRun", { n: w.n, day: DAYS[s.day], name: s.name, amt: sesAmt(s) })
          );
        };
        m.querySelector("#eOk").onclick = () => {
          const tid = m.querySelector("#eType").value;
          const ty = S.types.find((x) => x.id === tid);
          const newKm = Math.max(0, +m.querySelector("#eKm").value || 0);
          if (tid !== s.typeId) {
            const P = paces2(S.inputs);
            const D = distKm2(S.inputs);
            s.watch = ty ? watchPlan2(
              ty.kind,
              newKm,
              workFor2(ty, { p: 0.5, D, c: cat2(D), taper: w.phase === "taper", P, phase: w.phase })
            ) : watchPlan2("race", newKm);
          } else if (newKm !== s.km) {
            s.watch = rescaleWatch(s.watch || watchPlan2(s.kind, s.km), newKm - s.km);
          }
          s.typeId = tid;
          s.name = ty ? ty.name : t2("raceDay");
          s.kind = ty ? ty.kind : "race";
          s.km = Math.max(0, +m.querySelector("#eKm").value || 0);
          s.desc = m.querySelector("#eDesc").value;
          s.note = m.querySelector("#eNote").value;
          const nd = +m.querySelector("#eDay").value;
          closeModal();
          if (nd !== s.day) moveSession(wi, id, nd);
          else touched();
        };
      }
    );
  }

  // src/effort.js
  var TEMPO_IDS = /* @__PURE__ */ new Set(["tempo", "progression", "racepace", "fartlek"]);
  var effort = (id, kind) => kind === "hard" ? TEMPO_IDS.has(id) ? "tempo" : "hard" : ["recovery", "long", "race"].includes(kind) ? kind : "easy";
  var sesEffort = (s) => effort(s.typeId, s.kind);
  var effColor = (e) => `var(--${e})`;
  var effText = (e) => `var(--${e}-t)`;

  // src/exports.js
  function dlSave({ filename, data }) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 6e4);
  }
  function saveFile(filename, data) {
    try {
      dlSave({ filename, data });
    } catch (e) {
      toast(t2("dlFail"));
    }
  }
  var fname = (ext) => (S.name || t2("trainingBlock")).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() + "." + ext;
  function sessionDate(w, s) {
    return addDays2(parseISO2(w.start), s.day);
  }
  function exportICS() {
    const Pe = paces2(S.inputs);
    const e = (v) => String(v).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const fold = (l) => {
      let out = "";
      while (l.length > 73) {
        out += l.slice(0, 73) + "\r\n ";
        l = l.slice(73);
      }
      return out + l;
    };
    const ymd = (d) => iso2(d).replace(/-/g, "");
    const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Block Builder//EN",
      "CALSCALE:GREGORIAN",
      "X-WR-CALNAME:" + e(S.name)
    ];
    for (const w of S.plan.weeks)
      for (const s of w.sessions) {
        const d = sessionDate(w, s);
        lines.push(
          "BEGIN:VEVENT",
          "UID:" + s.id + "-" + ymd(d) + "@blockbuilder",
          "DTSTAMP:" + stamp,
          "DTSTART;VALUE=DATE:" + ymd(d),
          "DTEND;VALUE=DATE:" + ymd(addDays2(d, 1)),
          fold("SUMMARY:" + e(`${s.name} \xB7 ${sesAmt(s, Pe)}`)),
          fold(
            "DESCRIPTION:" + e(
              t2("icsDesc", { n: w.n, phase: phaseLbl(w.phase), desc: s.desc }) + (s.note ? "\n\n" + t2("icsNote") + s.note : "")
            )
          ),
          "TRANSP:TRANSPARENT",
          "END:VEVENT"
        );
      }
    lines.push("END:VCALENDAR");
    saveFile(fname("ics"), new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  }
  function exportCSV() {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [t2("csvHead").split("|")];
    for (const w of S.plan.weeks)
      for (const s of w.sessions)
        rows.push([w.n, phaseLbl(w.phase), iso2(sessionDate(w, s)), DAYS[s.day], s.name, s.km, s.desc, s.note]);
    saveFile(fname("csv"), new Blob(["\uFEFF" + rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }));
  }
  var PDFLIB = null;
  function loadScript(src, integrity) {
    return new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.integrity = integrity;
      s.crossOrigin = "anonymous";
      s.onload = ok;
      s.onerror = () => ko(new Error("load " + src));
      document.head.appendChild(s);
    });
  }
  function loadPDF() {
    if (!PDFLIB)
      PDFLIB = (async () => {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js",
          "sha512-plOdviVmws4Y3JAvbnpfKb2hVxKM1lCwsi3vmElYRj+tiDLffZ4FVUj5a8vyKJ9pIgl8JCAHEJ4D1iUKBecswg=="
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/5.0.9/jspdf.plugin.autotable.min.js",
          "sha512-p73fJ+Q5sCDFsEa54+EWEEWYipUV2Dc7L+E+yp6jSud5Ht1zbEqiI3OuatH5EDdDLxnOW/UN+FwBu8l+4klwLQ=="
        );
        const J = window.jspdf && window.jspdf.jsPDF;
        if (!J) throw new Error("jsPDF missing");
        const P = window.jspdf_autotable || {};
        if (!J.API.autoTable && typeof P.applyPlugin === "function") P.applyPlugin(J);
        const run = (doc, o) => typeof doc.autoTable === "function" ? doc.autoTable(o) : typeof P.autoTable === "function" ? P.autoTable(doc, o) : (() => {
          throw new Error("AutoTable missing");
        })();
        return { J, run };
      })().catch((e) => {
        PDFLIB = null;
        throw e;
      });
    return PDFLIB;
  }
  var pdfTxt = (v) => String(v ?? "").replace(/[–—−]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, "...").replace(/→/g, "->").replace(/≈/g, "~").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/[\u00a0\u202f\u2009]/g, " ").replace(/[^\n\x20-\xFF]/g, "");
  var PDF_KIND = {
    recovery: [79, 126, 171],
    easy: [43, 135, 104],
    long: [158, 124, 8],
    tempo: [198, 91, 31],
    hard: [201, 64, 90],
    race: [176, 75, 168]
  };
  var PDF_PHASE = {
    base: [143, 178, 165],
    build: [108, 147, 200],
    peak: [212, 84, 44],
    taper: [201, 164, 71],
    recovery: [138, 164, 174]
  };
  async function exportPDF(btn) {
    if (btn) btn.disabled = true;
    let lib;
    try {
      toast(t2("pdfBuilding"));
      lib = await loadPDF();
    } catch (_) {
      if (btn) btn.disabled = false;
      toast(t2("pdfLoadFail"));
      return;
    }
    try {
      const { J, run } = lib, I = S.inputs, W = S.plan.weeks;
      const doc = new J({ orientation: "landscape", unit: "mm", format: "a4" });
      const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), M = 10;
      const totals = W.map((w) => w.sessions.reduce((a, s) => a + s.km, 0));
      const Pe = paces2(S.inputs);
      const longest = Math.max(0, ...W.flatMap((w) => w.sessions.filter((s) => s.kind === "long").map((s) => s.km)));
      const start = parseISO2(W[0].start), end = addDays2(start, 7 * W.length - 1);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 32, 39);
      doc.text(pdfTxt(S.name), M, M + 6);
      const R = I.race && I.race.name ? I.race : null;
      const line1 = [
        distLabel2(I),
        R ? `${t2("pdfRace")}: ${R.name}${R.city ? " (" + R.city + ")" : ""}` : "",
        I.goal !== "fitness" ? fmtDay(parseISO2(I.raceDate)) : "",
        `${fmtDate2(start)} - ${fmtDate2(end)}`
      ].filter(Boolean).join("  \xB7  ");
      const line2 = [
        `${W.length} ${t2("stWeeks")}`,
        `${Math.round(totals.reduce((a, b) => a + b, 0))} ${t2("stTotal")}`,
        `${Math.round(Math.max(...totals))} ${t2("stPeak")}`,
        `${longest} ${t2("stLongest")}`
      ].join("  \xB7  ");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(90, 106, 111);
      doc.text(pdfTxt(line1), M, M + 12);
      doc.text(pdfTxt(line2), M, M + 16.5);
      const body = [], meta = [];
      W.forEach((w, wi) => {
        const st = parseISO2(w.start);
        const row = [
          `${t2("wAbbr")}${w.n}
${fmtShort(st)} - ${fmtShort(addDays2(st, 6))}
${phaseLbl(w.phase)}${w.cutback ? " \xB7 " + t2("cutback") : ""}
${RUN_UNIT === "t" ? estDur(w.sessions.reduce((a, s) => a + sesSec(s, Pe), 0)) : totals[wi].toFixed(1) + " km"}`
        ];
        const kinds = [w.phase];
        for (let d = 0; d < 7; d++) {
          const ss = w.sessions.filter((s) => s.day === d);
          row.push(
            ss.map((s) => `${s.name} \xB7 ${sesAmt(s, Pe)}
${s.desc}${s.note ? "\n" + t2("note") + ": " + s.note : ""}`).join("\n\n")
          );
          kinds.push(ss.length ? sesEffort(ss[0]) : null);
        }
        body.push(row.map(pdfTxt));
        meta.push({ type: "week", kinds });
        if (w.note) {
          body.push([{ content: pdfTxt(`${t2("note")}: ${w.note}`), colSpan: 8 }]);
          meta.push({ type: "note" });
        }
      });
      const dayW = (pw - 2 * M - 30) / 7;
      run(doc, {
        startY: M + 21,
        margin: { left: M, right: M, top: M, bottom: M + 5 },
        head: [[t2("week"), ...DAYS].map(pdfTxt)],
        body,
        theme: "grid",
        showHead: "everyPage",
        rowPageBreak: "avoid",
        styles: {
          font: "helvetica",
          fontSize: 7.2,
          cellPadding: { top: 1.6, right: 1.6, bottom: 1.6, left: 2.6 },
          valign: "top",
          lineColor: [213, 221, 219],
          lineWidth: 0.2,
          textColor: [20, 32, 39],
          overflow: "linebreak"
        },
        headStyles: { fillColor: [20, 32, 39], textColor: 255, fontStyle: "bold", fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: "bold" },
          ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((i) => [i, { cellWidth: dayW }]))
        },
        didParseCell: (h) => {
          if (h.section !== "body") return;
          const m = meta[h.row.index];
          if (!m) return;
          if (m.type === "note") {
            h.cell.styles.fillColor = [233, 238, 236];
            h.cell.styles.fontStyle = "italic";
            return;
          }
          if (h.column.index > 0 && m.kinds[h.column.index] === "race") h.cell.styles.fillColor = [245, 229, 243];
        },
        didDrawCell: (h) => {
          if (h.section !== "body") return;
          const m = meta[h.row.index];
          if (!m || m.type !== "week") return;
          const k = m.kinds[h.column.index];
          const c = h.column.index === 0 ? PDF_PHASE[k] : PDF_KIND[k];
          if (!c) return;
          doc.setFillColor(...c);
          doc.rect(h.cell.x + 0.4, h.cell.y + 0.6, 1.1, h.cell.height - 1.2, "F");
        }
      });
      const used = [...new Set(W.flatMap((w) => w.sessions.map((s) => s.typeId)))].filter((id) => whyOf(id));
      if (used.length)
        run(doc, {
          startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : M + 21) + 6,
          margin: { left: M, right: M, top: M, bottom: M + 5 },
          rowPageBreak: "avoid",
          head: [[t2("pdfWhyHead"), t2("pdfWhyCol")].map(pdfTxt)],
          body: used.map((id) => {
            const ty = S.types.find((x) => x.id === id);
            return [pdfTxt(ty && ty.name || t2("ty_" + id)), pdfTxt(whyOf(id))];
          }),
          theme: "grid",
          styles: {
            font: "helvetica",
            fontSize: 7.6,
            cellPadding: 1.8,
            valign: "top",
            lineColor: [213, 221, 219],
            lineWidth: 0.2,
            textColor: [20, 32, 39]
          },
          headStyles: { fillColor: [20, 32, 39], textColor: 255, fontStyle: "bold", fontSize: 8 },
          columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" } }
        });
      const n = doc.internal.getNumberOfPages(), gen = t2("pdfGenerated", { d: fmtDate2(/* @__PURE__ */ new Date()) });
      for (let p = 1; p <= n; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(90, 106, 111);
        doc.text(pdfTxt(`Block Builder \xB7 ${gen}`), M, ph - 5);
        doc.text(pdfTxt(t2("pdfPage", { p, n })), pw - M, ph - 5, { align: "right" });
      }
      saveFile(fname("pdf"), doc.output("blob"));
    } catch (e) {
      toast(t2("pdfFail", { m: e && e.message || t2("unknownErr") }));
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  function initExports() {
    S.exportFmt = (() => {
      try {
        return localStorage.getItem("bb-export-fmt");
      } catch (_) {
        return null;
      }
    })() === "pdf" ? "pdf" : "csv";
  }

  // src/plan-edit.js
  var drag = null;
  function moveSession(wi, id, d) {
    const w = S.plan.weeks[wi];
    const s = w.sessions.find((x) => x.id === id);
    if (!s || s.day === d) return;
    const other = w.sessions.filter((x) => x.day === d);
    other.forEach((o) => o.day = s.day);
    s.day = d;
    w.sessions.sort((a, b) => a.day - b.day);
    touched();
  }
  function touched() {
    S.edited = true;
    renderPlan();
    markDirty();
  }
  function addSession(wi, d) {
    const t3 = S.types.find((x) => x.id === "easy");
    const P = paces2(S.inputs);
    const s = {
      id: uid2(),
      day: d,
      typeId: "easy",
      name: t3.name,
      kind: "easy",
      km: 5,
      desc: fill2(t3.tpl, { ...P.txt, km: 5, work: "" }),
      note: ""
    };
    S.plan.weeks[wi].sessions.push(s);
    S.plan.weeks[wi].sessions.sort((a, b) => a.day - b.day);
    touched();
    openEditor(wi, s.id);
  }
  function initPlanEdit() {
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
          confirmBox(t2("rebuildQ"), t2("rebuildT"), t2("rebuild"), () => {
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
        const w = S.plan.weeks[+a.dataset.w], s = w.sessions.find((x) => x.id === a.dataset.s);
        if (s)
          sendToWatch(
            planWorkouts([{ w, s }]),
            t2("tdWatchTitle", { name: s.name, d: fmtDay(sessionDate(w, s)) }),
            `${slug(S.name)}-${iso2(sessionDate(w, s))}`
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
        } catch (_) {
        }
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
          t2("sendTitleWeek", { n: w.n, c: w.sessions.length }),
          `${slug(S.name)}-week-${String(w.n).padStart(2, "0")}`
        );
      } else if (act === "quick") {
        openQuick(a.dataset.type);
      } else if (act === "allwatch") {
        sendToWatch(
          planWorkouts(S.plan.weeks.flatMap((w) => w.sessions.map((s) => ({ w, s })))),
          t2("sendTitleAll", { c: S.plan.weeks.reduce((a2, w) => a2 + w.sessions.length, 0) }),
          `${slug(S.name)}-all`
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
        } catch (_) {
        }
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
      } catch (_) {
      }
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

  // src/quick.js
  var QW_EASY = {
    easy: { km: 8, min: 45 },
    recovery: { km: 5, min: 30 },
    long: { km: 16, min: 90 },
    strides: { km: 6, min: 35 },
    progression: { km: 10, min: 55 }
  };
  var QW_QUALITY = ["tempo", "intervals", "hills", "fartlek", "racepace"];
  var QW_SIZES = { s: 0.15, m: 0.5, l: 0.85 };
  var QW_RACES = [
    ["5k", 5],
    ["10k", 10],
    ["hm", 21.0975],
    ["m", 42.195]
  ];
  var QW = {};
  function qwLoadPaces() {
    try {
      const v = JSON.parse(localStorage.getItem("bb-quick-paces") || "null");
      return v && typeof v === "object" ? { recDist: String(v.recDist || "0"), recTime: String(v.recTime || "") } : { recDist: "0", recTime: "" };
    } catch (_) {
      return { recDist: "0", recTime: "" };
    }
  }
  function qwSavePaces(v) {
    try {
      localStorage.setItem("bb-quick-paces", JSON.stringify(v));
    } catch (_) {
    }
  }
  var planHasPaces = () => !!paces2(S.inputs).vdot && !missingSetup2(S.inputs).length;
  function qwPaces(Q) {
    const src = planHasPaces() ? S.inputs : qwLoadPaces();
    return paces2({ dist: Q.race || "10k", customKm: 10, recDist: src.recDist, recTime: src.recTime });
  }
  var QW_KEYS = ["type", "size", "race", "unit", "amt", "wucd", "ft"];
  function qwLoadRecent() {
    try {
      const v = JSON.parse(localStorage.getItem("bb-quick-recent") || "[]");
      return Array.isArray(v) ? v.filter((x) => x && typeof x === "object" && TYPE_DEFS2.some((d) => d[0] === x.type)).slice(0, 5) : [];
    } catch (_) {
      return [];
    }
  }
  function qwPushRecent(Q) {
    const c = {};
    for (const k of QW_KEYS) c[k] = Q[k] ?? null;
    const key = JSON.stringify(c);
    const list = [
      c,
      ...qwLoadRecent().filter((x) => JSON.stringify(Object.fromEntries(QW_KEYS.map((k) => [k, x[k] ?? null]))) !== key)
    ].slice(0, 5);
    try {
      localStorage.setItem("bb-quick-recent", JSON.stringify(list));
    } catch (_) {
    }
  }
  function qwRecentLbl(c) {
    const name = qwTypeName(c.type);
    if (QW_EASY[c.type]) return `${name} \xB7 ${(+c.amt).toLocaleString(LOC())} ${c.unit === "t" ? "min" : "km"}`;
    return `${name} \xB7 ${t2("qwSize_" + (c.size || "m"))} \xB7 ${cap2(t2("l" + (c.race || "10k")))}${c.ft ? " \xB7 " + t2("qwFtShort") : ""}`;
  }
  function qwMainIdx(wp) {
    const i = wp.blocks.findIndex((b) => b.n > 1);
    return i < 0 ? 0 : i;
  }
  function parsePace(v) {
    const m = /^\s*(\d{1,2})[:.,](\d{2})\s*$/.exec(String(v || ""));
    if (!m || +m[2] > 59) return null;
    const s = +m[1] * 60 + +m[2];
    return s >= 150 && s <= 600 ? s : null;
  }
  function qwLoadUnit() {
    try {
      return localStorage.getItem("bb-quick-unit") === "t" ? "t" : "d";
    } catch (_) {
      return "d";
    }
  }
  function roundSec(x) {
    const st = x < 60 ? 5 : x < 120 ? 15 : x < 600 ? 30 : 60;
    return Math.max(st, Math.round(x / st) * st);
  }
  function roundKm(x) {
    const st = x < 1 ? 0.05 : x < 5 ? 0.1 : 0.5;
    return Math.max(0.05, +(Math.round(x / st) * st).toFixed(2));
  }
  function wpInUnit(wp, unit, eff, P, wucdByPace) {
    const conv = (x, e) => {
      if (x.p === "recovery") return x;
      const spk = stepSecKm(x, e, P);
      if (unit === "t" && x.g[0] === "d") return { ...x, g: ["t", roundSec(durSec2(x.g[1], spk))] };
      if (unit === "d" && x.g[0] === "t") return { ...x, g: ["d", roundKm(kmIn2(x.g[1], spk))] };
      return x;
    };
    const out = { blocks: wp.blocks.map((b) => ({ n: b.n, steps: b.steps.map((x) => conv(x, stepEffort(x, eff))) })) };
    const wc = (g) => wucdByPace ? conv({ p: "work", g, pace: "easy" }, "easy").g : unit === "t" ? g[0] === "t" ? g : ["t", 600] : g[0] === "d" ? g : ["d", 2];
    if (wp.wu) out.wu = wc(wp.wu);
    if (wp.cd) out.cd = wc(wp.cd);
    return out;
  }
  function qwTypeName(id) {
    const ty = (S.types || []).find((x) => x.id === id);
    return ty && ty.name ? ty.name : t2("ty_" + id);
  }
  function qwBuild(Q) {
    const P = qwPaces(Q);
    const def = TYPE_DEFS2.find((d) => d[0] === Q.type);
    const kind = def ? def[1] : "easy", eff = effort(Q.type, kind);
    let wp;
    if (QW_EASY[Q.type]) {
      const spk = Q.type === "recovery" ? P.sec.easy * 1.1 : P.sec.easy;
      const km2 = Q.unit === "t" ? kmIn2(Q.amt * 60, spk) : Q.amt;
      if (Q.type === "strides") wp = watchPlan2("easy", km2, { strides: 6 });
      else if (Q.type === "progression") {
        const x = clamp2(Math.round(km2 * 0.3), 1, 5);
        wp = watchPlan2("hard", km2, { fast: x, fastPace: "tempo" });
      } else wp = watchPlan2(kind, km2);
      if (Q.unit === "t") {
        const b = wp.blocks[0];
        if (b.n === 1 && b.steps.length === 1) b.steps[0] = { ...b.steps[0], g: ["t", Q.amt * 60] };
      }
    } else {
      const rk = QW_RACES.find((r) => r[0] === Q.race) || QW_RACES[1];
      const w = workFor2({ id: Q.type }, { p: QW_SIZES[Q.size], D: rk[1], c: rk[0], taper: false, P, phase: "build" });
      wp = watchPlan2("hard", (w.wucd || 0) + (w.km || 0), w);
      if (!Q.wucd) {
        delete wp.wu;
        delete wp.cd;
      }
    }
    wp = wpInUnit(wp, Q.unit, eff, P);
    const mi = qwMainIdx(wp), repeated = wp.blocks[mi].n > 1;
    let Pq = P;
    if (Q.ft && !QW_EASY[Q.type]) {
      const b = wp.blocks[mi], w = b.steps.find((x) => x.p !== "recovery"), r = b.steps.find((x) => x.p === "recovery");
      if (repeated && Q.ft.n) b.n = Q.ft.n;
      if (w && Q.ft.rep) w.g = [w.g[0], Q.ft.rep];
      if (r && Q.ft.rec) r.g = [r.g[0], Q.ft.rec];
      if (w && Q.ft.pace) {
        w.pace = "custom";
        Pq = {
          ...P,
          sec: { ...P.sec, custom: Q.ft.pace },
          txt: { ...P.txt, custom: fmtPace2(Q.ft.pace) },
          fixed: { custom: true }
        };
      }
    }
    const bar = workoutBar(wp, eff, Pq);
    const km = bar.segs.reduce((a, g) => a + g.km, 0);
    return { wp, eff, P: Pq, name: qwTypeName(Q.type), bar, km, main: mainSetHtml(wp), mi, repeated };
  }
  function openQuick(type) {
    const unit = qwLoadUnit();
    Object.assign(QW, {
      type: type || QW.type || "tempo",
      size: QW.size || "m",
      unit,
      wucd: QW.wucd !== false,
      dev: getDevice(),
      ft: null,
      ftOpen: false,
      add: false,
      addDate: qwDefaultDate(),
      race: QW.race || (S.inputs.goal !== "fitness" && QW_RACES.some((r) => r[0] === S.inputs.dist) ? S.inputs.dist : "10k")
    });
    qwSetAmt();
    modal(html`<h2>${t2("qwTitle")}</h2><div class="qw" id="qwBody"></div>`, (m) => {
      m.addEventListener("click", (e) => {
        const b = e.target.closest("[data-qk]");
        if (!b) return;
        const [k, v] = b.dataset.qk.split(":");
        if (["type", "unit", "size", "race"].includes(k)) QW.paceErr = false;
        if (k === "type") {
          QW.type = v;
          QW.ft = null;
          qwSetAmt();
        } else if (k === "unit") {
          if (QW.unit !== v) {
            QW.unit = v;
            QW.ft = null;
            try {
              localStorage.setItem("bb-quick-unit", v);
            } catch (_) {
            }
            qwSetAmt();
          }
        } else if (k === "size") {
          QW.size = v;
          QW.ft = null;
        } else if (k === "race") {
          QW.race = v;
          QW.ft = null;
        } else if (k === "recent") {
          const c = qwLoadRecent()[+v];
          if (c) {
            for (const kk of QW_KEYS) QW[kk] = c[kk] ?? QW[kk];
            QW.ft = c.ft || null;
            QW.ftOpen = !!c.ft;
          }
        } else if (k === "ftreset") {
          QW.ft = null;
          QW.paceErr = false;
        } else if (k === "ft") {
          const [f, dir] = v.split(",");
          const R = qwBuild(QW), b2 = R.wp.blocks[R.mi], w = b2.steps.find((x) => x.p !== "recovery"), r = b2.steps.find((x) => x.p === "recovery");
          const ft = QW.ft || { n: b2.n, rep: w.g[1], rec: r ? r.g[1] : null }, sg = dir === "+" ? 1 : -1;
          if (f === "n") ft.n = clamp2(ft.n + sg, 1, 30);
          else if (f === "rep")
            ft.rep = w.g[0] === "t" ? Math.max(10, ft.rep + 15 * sg) : Math.max(0.05, +(ft.rep + 0.1 * sg).toFixed(2));
          else if (f === "rec" && r)
            ft.rec = r.g[0] === "t" ? Math.max(10, ft.rec + 15 * sg) : Math.max(0.05, +(ft.rec + 0.05 * sg).toFixed(2));
          QW.ft = ft;
        } else if (k === "dev") QW.dev = v;
        else if (k === "amt") {
          const st = QW.unit === "t" ? 5 : 0.5, lo = QW.unit === "t" ? 10 : 2, hi = QW.unit === "t" ? 240 : 42;
          QW.amt = clamp2(+(QW.amt + (v === "+" ? st : -st)).toFixed(1), lo, hi);
        } else if (k === "cancel") {
          closeModal();
          return;
        } else if (k === "send") {
          qwSend();
          return;
        }
        qwRender(m, b.dataset.qk);
      });
      m.addEventListener("change", (e) => {
        const id = e.target.id;
        if (id === "qwWucd") {
          QW.wucd = e.target.checked;
          qwRender(m, "wucd");
        } else if (id === "qwPace") {
          const v = e.target.value.trim(), sec = parsePace(v);
          if (!v) {
            if (QW.ft) delete QW.ft.pace;
            QW.paceErr = false;
          } else if (sec == null) QW.paceErr = true;
          else {
            const R = qwBuild(QW), b = R.wp.blocks[R.mi], w = b.steps.find((x) => x.p !== "recovery"), r = b.steps.find((x) => x.p === "recovery");
            QW.ft = QW.ft || { n: b.n, rep: w.g[1], rec: r ? r.g[1] : null };
            QW.ft.pace = sec;
            QW.paceErr = false;
          }
          qwRender(m, "qwPace");
        } else if (id === "qwAdd") {
          QW.add = e.target.checked;
          qwRender(m, "qwAdd");
        } else if (id === "qwAddDate") {
          if (e.target.value) QW.addDate = e.target.value;
        } else if (id === "qwRecDist" || id === "qwRecTime") {
          qwSavePaces({
            recDist: m.querySelector("#qwRecDist").value,
            recTime: m.querySelector("#qwRecTime").value.trim()
          });
          qwRender(m, id);
        }
      });
      m.addEventListener(
        "toggle",
        (e) => {
          if (e.target.id === "qwFt") QW.ftOpen = e.target.open;
        },
        true
      );
      qwRender(m);
    });
  }
  var qwPlanOpen = () => !!(S.plan && S.plan.weeks.length && !missingSetup2(S.inputs).length);
  function qwPlanRange() {
    const st = parseISO2(S.plan.weeks[0].start);
    return [st, addDays2(st, 7 * S.plan.weeks.length - 1)];
  }
  function qwDefaultDate() {
    if (!qwPlanOpen()) return "";
    const [a, b] = qwPlanRange(), d = /* @__PURE__ */ new Date();
    d.setHours(12, 0, 0, 0);
    return iso2(d < a ? a : d > b ? b : d);
  }
  function qwAddToPlan(R, dateIso) {
    const [st] = qwPlanRange(), d = parseISO2(dateIso), wi = Math.floor(Math.round((d - st) / 864e5) / 7), w = S.plan.weeks[wi];
    if (!w) return false;
    const def = TYPE_DEFS2.find((x) => x[0] === QW.type) || ["easy", "easy"];
    const s = {
      id: uid2(),
      day: dow2(d),
      typeId: QW.type,
      name: R.name,
      kind: def[1],
      km: Math.round(R.km * 2) / 2,
      desc: watchSummary(R.wp, R.P),
      note: "",
      watch: JSON.parse(JSON.stringify(R.wp))
    };
    w.sessions.push(s);
    w.sessions.sort((a, b) => a.day - b.day);
    touched();
    return true;
  }
  function qwSetAmt() {
    const d = QW_EASY[QW.type];
    if (d) QW.amt = QW.unit === "t" ? d.min : d.km;
  }
  function qwRender(m, focusKey) {
    const Q = QW, R = qwBuild(Q), body = m.querySelector("#qwBody");
    const radio = (k, v, on, label, cls = "") => html`<button type="button" role="radio" class="${cls}" aria-checked="${on}" data-qk="${k}:${v}">${label}</button>`;
    const typeBtn = (id) => {
      const def = TYPE_DEFS2.find((d) => d[0] === id);
      return radio(
        "type",
        id,
        Q.type === id,
        html`<span class="kind-dot" style="background:${effColor(effort(id, def[1]))}" aria-hidden="true"></span>${esc(qwTypeName(id))}`,
        "qt"
      );
    };
    const easyIds = Object.keys(QW_EASY).filter((id) => id !== "progression"), qIds = [...QW_QUALITY, "progression"];
    let shape;
    if (QW_EASY[Q.type]) {
      const u = Q.unit === "t" ? "min" : "km";
      shape = html`<div class="qrow"><span class="lbl" id="qwAmtL">${t2(Q.unit === "t" ? "qwDur" : "qwDist")}</span>
    <div class="qstep" role="group" aria-labelledby="qwAmtL"><button type="button" class="btn" data-qk="amt:-" aria-label="${esc(t2("qwLess"))}">−</button><output aria-live="polite">${Q.amt.toLocaleString(LOC())} ${u}</output><button type="button" class="btn" data-qk="amt:+" aria-label="${esc(t2("qwMore"))}">+</button></div></div>`;
    } else {
      const sizes = htmlJoin(
        Object.keys(QW_SIZES).map((k) => {
          const r2 = qwBuild({ ...Q, size: k });
          return radio(
            "size",
            k,
            Q.size === k,
            html`<b>${t2("qwSize_" + k)}</b><span>${String(r2.main).replace(/<\/?b>/g, "")}</span>`,
            "qsz"
          );
        })
      );
      shape = html`<div class="qrow"><span class="lbl" id="qwSizeL">${t2("qwSize")}</span><div class="qsizes" role="radiogroup" aria-labelledby="qwSizeL">${sizes}</div></div>
    <div class="qrow"><span class="lbl" id="qwRaceL">${t2("qwRace")}</span><div class="seg" role="radiogroup" aria-labelledby="qwRaceL">${htmlJoin(QW_RACES.map(([k]) => radio("race", k, Q.race === k, esc(cap2(t2("l" + k))))))}</div></div>
    <label class="qcheck"><input type="checkbox" id="qwWucd" ${Q.wucd ? "checked" : ""}> ${t2("qwWucd")}</label>`;
      const b = R.wp.blocks[R.mi], w = b.steps.find((x) => x.p !== "recovery"), r = b.steps.find((x) => x.p === "recovery");
      const stepper = (f, lbl, val) => html`<div class="qft"><span id="qwFt_${f}">${lbl}</span><div class="qstep" role="group" aria-labelledby="qwFt_${f}"><button type="button" class="btn" data-qk="ft:${f},-" aria-label="${esc(t2("qwLess") + " \xB7 " + lbl)}">−</button><output aria-live="polite">${val}</output><button type="button" class="btn" data-qk="ft:${f},+" aria-label="${esc(t2("qwMore") + " \xB7 " + lbl)}">+</button></div></div>`;
      const isT = w.g[0] === "t";
      const paceVal = Q.ft && Q.ft.pace ? fmtPace2(Q.ft.pace).replace("/km", "") : w.pace && hasPace(R.P, w.pace) ? fmtPace2(R.P.sec[w.pace]).replace("/km", "") : "";
      const icon = html`<svg class="qfi" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></g></svg>`;
      const chev = html`<svg class="chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      shape = html`${shape}${html`<details class="qfine" id="qwFt" ${Q.ftOpen ? "open" : ""}><summary>${icon}<span class="qfs"><b>${t2("qwFt")}</b><small>${t2("qwFtSub")}</small></span>${Q.ft ? html`<span class="qtag">${t2("qwFtTag")}</span>` : ""}${chev}</summary><div class="qfts">
    ${R.repeated ? stepper("n", t2("qwReps"), b.n) : ""}
    ${stepper("rep", t2(isT ? "qwRepT" : "qwRepD"), gTxt(w.g))}
    ${r ? stepper("rec", t2(r.g[0] === "t" ? "qwRecT" : "qwRecD"), gTxt(r.g)) : ""}
    <div class="qft"><label for="qwPace">${t2("qwPace")}</label><span class="qpace"><input id="qwPace" inputmode="decimal" autocomplete="off" placeholder="4:30" value="${esc(paceVal)}" aria-describedby="qwPaceHint"> /km</span></div>
    <p class="hint" id="qwPaceHint">${Q.paceErr ? t2("qwPaceBad") : t2("qwPaceHint")}</p>
    ${Q.ft ? html`<button type="button" class="linkbtn" data-qk="ftreset:1">${t2("qwFtReset")}</button>` : ""}</div></details>`}`;
    }
    let pacesLine;
    if (planHasPaces()) pacesLine = html`<p class="hint qpaces">${t2("qwPacesPlan", { plan: esc(S.name) })}</p>`;
    else {
      const qp = qwLoadPaces(), bad = +qp.recDist > 0 && qp.recTime && raceTimeSec2(qp.recTime, +qp.recDist) == null;
      const opts = [
        ["0", "none"],
        ["5", "l5k"],
        ["10", "l10k"],
        ["21.0975", "halfMarathon"],
        ["42.195", "marathon"]
      ];
      pacesLine = html`<div class="qrow"><span class="lbl">${t2("qwPaces")}</span><div class="qpacef">
    <label>${t2("recDist")}<select id="qwRecDist">${htmlJoin(opts.map(([v, k]) => html`<option value="${v}" ${qp.recDist === v ? "selected" : ""}>${esc(t2(k))}</option>`))}</select></label>
    <label>${t2("recTime")}<input id="qwRecTime" inputmode="numeric" placeholder="${esc(t2("recTimePh"))}" value="${esc(qp.recTime)}"></label></div>
    <p class="hint qpaces">${bad ? t2("qwPacesBad") : R.P.vdot ? t2("qwPacesOwn") : t2("qwPacesEffort")}</p></div>`;
    }
    const dev = DEVICES.find((d) => d.k === Q.dev) || DEVICES[0];
    const recent = qwLoadRecent();
    setHtml(
      body,
      html`
  ${recent.length ? html`<div class="qrow"><span class="lbl" id="qwRecL">${t2("qwRecent")}</span><div class="qgrp" role="group" aria-labelledby="qwRecL">${htmlJoin(recent.map((c, i) => html`<button type="button" class="qt qrec" data-qk="recent:${i}">${esc(qwRecentLbl(c))}</button>`))}</div></div>` : ""}
  <div class="qrow"><span class="lbl" id="qwTypeL">${t2("qwType")}</span><div class="qtypes" role="radiogroup" aria-labelledby="qwTypeL">
    <div class="qgrp"><span class="qglbl">${t2("grpEasy")}</span>${htmlJoin(easyIds.map(typeBtn))}</div>
    <div class="qgrp"><span class="qglbl">${t2("grpQuality")}</span>${htmlJoin(qIds.map(typeBtn))}</div></div>
    ${whyOf(Q.type) ? html`<p class="hint why" id="qwWhy">${whyHtml(Q.type)}</p>` : ""}</div>
  <div class="qrow"><span class="lbl" id="qwUnitL">${t2("qwUnit")}</span><div class="seg" role="radiogroup" aria-labelledby="qwUnitL">${radio("unit", "d", Q.unit === "d", t2("qwUnitD"))}${radio("unit", "t", Q.unit === "t", t2("qwUnitT"))}</div></div>
  ${shape}
  ${pacesLine}
  ${qwPlanOpen() ? (() => {
        const [a, b] = qwPlanRange();
        return html`<div class="qrow"><label class="qcheck"><input type="checkbox" id="qwAdd" ${Q.add ? "checked" : ""}> ${t2("qwAdd", { plan: esc(S.name) })}</label>
    ${Q.add ? html`<label class="qadd">${t2("qwAddOn")} <input type="date" id="qwAddDate" min="${iso2(a)}" max="${iso2(b)}" value="${esc(Q.addDate)}"></label><p class="hint qpaces">${t2("qwAddHint")}</p>` : ""}</div>`;
      })() : ""}
  <div class="qprev" style="--k:${effColor(R.eff)};--kt:${effText(R.eff)}">
    <div class="tses"><div class="tn"><b>${esc(R.name)}</b></div>
    <div class="tbig"><b id="qwKm">${(Math.round(R.km * 10) / 10).toLocaleString(LOC())}<small> km</small></b><span>${t2("tdEst", { d: estDur(R.bar.sec) })}</span></div>${R.bar.html}
    <p id="qwSteps">${esc(watchSummary(R.wp, R.P))}</p></div>
    <div class="seg qdev" role="radiogroup" aria-label="${esc(t2("device"))}">${htmlJoin(DEVICES.map((d) => radio("dev", d.k, Q.dev === d.k, esc(d.name()))))}</div>
    <div class="actions"><button type="button" class="btn" data-qk="cancel">${t2("cancel")}</button><button type="button" class="btn primary" id="qwSend" data-qk="send">${esc(dev.k === "other" ? t2("sendWatch") : t2("sendTo", { dev: dev.name() }))}</button></div>
  </div>`
    );
    if (focusKey) {
      const f = body.querySelector(`[data-qk="${focusKey}"]`) || body.querySelector("#" + focusKey) || (focusKey === "wucd" ? body.querySelector("#qwWucd") : null);
      f && f.focus();
    }
  }
  function qwSend() {
    const R = qwBuild(QW);
    const day = iso2(/* @__PURE__ */ new Date());
    const tag = QW_EASY[QW.type] ? `${String(QW.amt).replace(".", "-")}${QW.unit === "t" ? "min" : "km"}` : t2("qwSize_" + QW.size).toLowerCase();
    const file = `quick-${day}-${slug(R.name)}-${slug(tag)}`;
    const title = `${R.name} \xB7 ${String(R.main).replace(/<\/?b>/g, "")}`;
    qwPushRecent(QW);
    if (QW.add && qwPlanOpen()) qwAddToPlan(R, QW.addDate);
    setDevice(QW.dev);
    $$('#plan .today [data-act="twatch"]').forEach((b) => b.textContent = sendLbl(b.dataset.n || ""));
    closeModal();
    exportWorkouts(QW.dev, [{ title, fitTitle: title, file, wp: R.wp, paces: R.P }], file);
  }

  // src/fit.js
  var FIT_CRC = [
    0,
    52225,
    55297,
    5120,
    61441,
    15360,
    10240,
    58369,
    40961,
    27648,
    30720,
    46081,
    20480,
    39937,
    34817,
    17408
  ];
  function fitCrc(bytes, crc = 0) {
    for (const b of bytes) {
      let t3 = FIT_CRC[crc & 15];
      crc = crc >> 4 & 4095;
      crc = crc ^ t3 ^ FIT_CRC[b & 15];
      t3 = FIT_CRC[crc & 15];
      crc = crc >> 4 & 4095;
      crc = crc ^ t3 ^ FIT_CRC[b >> 4 & 15];
    }
    return crc;
  }
  function fitEncodeWorkout(name, steps) {
    const out = [];
    const push = (...a) => {
      for (const x of a) out.push(x & 255);
    };
    const u16 = (v) => [v & 255, v >> 8 & 255], u32 = (v) => [v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255];
    const str = (s, n) => {
      const b = Array.from(new TextEncoder().encode(String(s || ""))).slice(0, n - 1);
      while (b.length < n) b.push(0);
      return b;
    };
    push(64, 0, 0, ...u16(0), 5, 0, 1, 0, 1, 2, 132, 2, 2, 132, 3, 4, 140, 4, 4, 134);
    const created = Math.floor(Date.now() / 1e3) - 631065600;
    push(0, 5, ...u16(255), ...u16(0), ...u32(Math.floor(Math.random() * 268435455) + 1), ...u32(created));
    push(65, 0, 0, ...u16(26), 3, 8, 24, 7, 4, 1, 0, 6, 2, 132);
    push(1, ...str(name, 24), 1, ...u16(steps.length));
    push(
      66,
      0,
      0,
      ...u16(27),
      9,
      254,
      2,
      132,
      0,
      16,
      7,
      1,
      1,
      0,
      2,
      4,
      134,
      3,
      1,
      0,
      4,
      4,
      134,
      5,
      4,
      134,
      6,
      4,
      134,
      7,
      1,
      0
    );
    const DUR = { time: 0, distance: 1, open: 5, repeat: 6 };
    steps.forEach((s, i) => {
      let dv = 4294967295, tt = 2, tv = 0, lo, hi;
      if (s.dur === "time") dv = Math.round(s.val * 1e3);
      else if (s.dur === "distance") dv = Math.round(s.val * 100);
      else if (s.dur === "repeat") {
        dv = s.repeatFrom;
        tt = 2;
        tv = s.reps;
      }
      if (s.dur === "repeat") {
        tt = 255;
        lo = 4294967295;
        hi = 4294967295;
      } else if (s.target) {
        tt = 0;
        tv = 0;
        lo = Math.round(s.target.lo * 1e3);
        hi = Math.round(s.target.hi * 1e3);
      } else {
        lo = 4294967295;
        hi = 4294967295;
      }
      push(
        2,
        ...u16(i),
        ...str(s.name, 16),
        DUR[s.dur],
        ...u32(dv),
        tt,
        ...u32(tv),
        ...u32(lo),
        ...u32(hi),
        s.dur === "repeat" ? 255 : s.intensity
      );
    });
    const data = Uint8Array.from(out);
    const hdr = [14, 16, ...u16(2132), ...u32(data.length), 46, 70, 73, 84];
    const hc = fitCrc(hdr);
    const header = Uint8Array.from([...hdr, ...u16(hc)]);
    const crc = fitCrc(data, fitCrc(header));
    const file = new Uint8Array(header.length + data.length + 2);
    file.set(header, 0);
    file.set(data, header.length);
    file.set(u16(crc), header.length + data.length);
    return file;
  }
  function fitSteps(wp, P) {
    P = P || paces2(S.inputs);
    const out = [];
    const goal = (g) => g[0] === "d" ? { dur: "distance", val: g[1] * 1e3 } : { dur: "time", val: g[1] };
    const tgt = (pace) => {
      if (!hasPace(P, pace)) return null;
      const sec = P.sec[pace], tol = PACE_TOL[pace];
      return { lo: 1e3 / (sec + tol), hi: 1e3 / (sec - tol) };
    };
    const lbl = (x) => x.pace ? hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace) : x.p === "recovery" ? t2("recover") : t2("run");
    if (wp.wu) out.push({ name: t2("warmup"), ...goal(wp.wu), target: null, intensity: 2 });
    for (const b of wp.blocks) {
      const from = out.length;
      for (const x of b.steps)
        out.push({ name: lbl(x), ...goal(x.g), target: tgt(x.pace), intensity: x.p === "recovery" ? 4 : 0 });
      if (b.n > 1) out.push({ name: "", dur: "repeat", repeatFrom: from, reps: b.n });
    }
    if (wp.cd) out.push({ name: t2("cooldown"), ...goal(wp.cd), target: null, intensity: 3 });
    return out;
  }

  // src/watch.js
  var PACE_TOL = { easy: 25, tempo: 8, interval: 8, rep: 6, race: 6, mp: 8, custom: 8 };
  var hasPace = (P, k) => !!(k && (P.vdot || P.fixed && P.fixed[k]));
  var paceLbl = (k) => t2("pl_" + k);
  function gTxt(g) {
    if (g[0] === "d") {
      const m = Math.round(g[1] * 1e3);
      return m < 1e3 || m % 1e3 ? m >= 1e3 ? (m / 1e3).toLocaleString(LOC(), { maximumFractionDigits: 1 }) + " km" : m + " m" : m / 1e3 + " km";
    }
    const z = g[1];
    return z >= 60 ? z % 60 ? Math.floor(z / 60) + ":" + String(z % 60).padStart(2, "0") + " min" : z / 60 + " min" : z + " s";
  }
  function stepTxt(x, P) {
    return gTxt(x.g) + (x.pace ? " @ " + (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : "") + (x.p === "recovery" ? t2("recoverySfx") : "");
  }
  function watchSummary(wp, P) {
    P = P || paces2(S.inputs);
    const parts = [];
    if (wp.wu) parts.push(t2("warmup") + " " + gTxt(wp.wu));
    for (const b of wp.blocks) {
      const st = b.steps.map((x) => stepTxt(x, P)).join(", ");
      parts.push(b.n > 1 ? `${b.n} \xD7 (${st})` : st);
    }
    if (wp.cd) parts.push(t2("cooldown") + " " + gTxt(wp.cd));
    return parts.join(" \xB7 ");
  }
  function rescaleWatch(wp, delta) {
    wp = JSON.parse(JSON.stringify(wp));
    if (wp.wu && wp.cd) {
      wp.cd = ["d", r052(Math.max(0.5, wp.cd[1] + delta))];
      return wp;
    }
    const st = wp.blocks[0] && wp.blocks[0].n === 1 && wp.blocks[0].steps.find((x) => x.g[0] === "d");
    if (st) st.g = ["d", r052(Math.max(0.5, st.g[1] + delta))];
    return wp;
  }
  var WK = null;
  function loadWK() {
    if (!WK)
      WK = Promise.all([
        // Loaded at runtime from the page's folder, not bundled (esbuild --external:./vendor/*), so tsc can't resolve it from src/.
        // @ts-expect-error
        import("./vendor/workoutkit-0.2.0/index.js"),
        // @ts-expect-error
        import("./vendor/workoutkit-0.2.0/encode.js")
      ]).catch((e) => {
        WK = null;
        throw e;
      });
    return WK;
  }
  function planWorkout(w, s) {
    const P = paces2(S.inputs), tm = inTime(s);
    return {
      title: `W${w.n} ${s.name} ${sesAmt(s, P)}`,
      fitTitle: `W${w.n} ${s.name} ${tm ? sesAmt(s, P).replace(/ /g, "") : s.km + "k"}`,
      file: `w${String(w.n).padStart(2, "0")}-${DAYS[s.day].toLowerCase()}-${slug(s.name)}`,
      wp: tm ? wpInUnit(sesWp(s), "t", sesEffort(s), P, true) : sesWp(s)
    };
  }
  var planWorkouts = (list) => list.map(({ w, s }) => planWorkout(w, s));
  async function workoutBlob(it) {
    const [K, E] = await loadWK();
    const P = it.paces || paces2(S.inputs);
    const wp = it.wp;
    const plan = new K.WorkoutPlan({ referenceId: crypto.randomUUID() });
    const cw = plan.asCustom({ activity: "running", location: "outdoor", displayName: it.title.slice(0, 48) });
    const goal = (g) => g[0] === "d" ? new K.DistanceGoal(new K.Distance(Math.round(g[1] * 1e3), "meters")) : new K.TimeGoal(new K.Duration(Math.round(g[1]), "seconds"));
    const alert = (pace) => {
      if (!hasPace(P, pace)) return void 0;
      const sec = P.sec[pace], tol = PACE_TOL[pace];
      const sp = (x) => new K.Speed(new K.Distance(1, "kilometers"), new K.Duration(Math.round(x), "seconds"));
      return new K.SpeedRangeAlert(sp(sec + tol), sp(sec - tol), "current");
    };
    if (wp.wu) cw.warmup = new K.Step(goal(wp.wu), t2("warmup"));
    for (const b of wp.blocks) {
      const blk = cw.addBlock(Math.max(1, b.n));
      for (const x of b.steps)
        blk.addStep(
          x.p,
          goal(x.g),
          x.pace ? hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace) : void 0,
          alert(x.pace)
        );
    }
    if (wp.cd) cw.cooldown = new K.Step(goal(wp.cd), t2("cooldown"));
    return E.toBlob(plan);
  }
  var CRC_T = (() => {
    const t3 = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      t3[n] = c >>> 0;
    }
    return t3;
  })();
  var crc32 = (b) => {
    let c = 4294967295;
    for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ c >>> 8;
    return (c ^ 4294967295) >>> 0;
  };
  function makeZip(files) {
    const enc = new TextEncoder(), parts = [], central = [];
    let off = 0;
    const d = /* @__PURE__ */ new Date(), dt = (d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1) & 65535, dd = (d.getFullYear() - 1980 << 9 | d.getMonth() + 1 << 5 | d.getDate()) & 65535;
    for (const f of files) {
      const name = enc.encode(f.name), data = f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 67324752, true);
      h.setUint16(4, 20, true);
      h.setUint16(6, 2048, true);
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
      c.setUint32(0, 33639248, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 2048, true);
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
    e.setUint32(0, 101010256, true);
    e.setUint16(8, files.length, true);
    e.setUint16(10, files.length, true);
    e.setUint32(12, csize, true);
    e.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: "application/zip" });
  }
  var slug = (t3) => String(t3).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  var DEVICES = [
    { k: "apple", name: () => "Apple Watch", ext: "workout", help: () => t2("helpApple") },
    { k: "garmin", name: () => "Garmin", ext: "fit", help: () => t2("helpGarmin") },
    { k: "other", name: () => t2("devOther"), ext: "fit", help: () => t2("helpOther") }
  ];
  function getDevice() {
    try {
      return localStorage.getItem("bb-device") || "apple";
    } catch (_) {
      return "apple";
    }
  }
  function setDevice(k) {
    try {
      localStorage.setItem("bb-device", k);
    } catch (_) {
    }
  }
  function sendToWatch(items, title, zipBase) {
    let cur = getDevice();
    modal(
      html`<h2>${t2("sendTitle")}</h2><p class="hint" style="margin:0">${esc(title)}</p>
  <div class="devices" role="radiogroup" aria-label="${t2("device")}">${htmlJoin(DEVICES.map((d) => html`<button type="button" role="radio" class="device" data-dev="${d.k}" aria-checked="${d.k === cur}"><b>${esc(d.name())}</b><span>${t2("devFiles", { ext: d.ext })}</span></button>`))}</div>
  <p class="hint" id="devHelp" style="margin:0"></p>
  <div class="actions"><button class="btn" id="dCancel">${t2("cancel")}</button><button class="btn primary" id="dGo">${t2("download")}</button></div>`,
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
          $$('#plan .today [data-act="twatch"]').forEach((b) => b.textContent = sendLbl(b.dataset.n || ""));
          closeModal();
          exportWorkouts(cur, items, zipBase);
        };
        upd();
      }
    );
  }
  async function exportWorkouts(dev, items, zipBase) {
    const D = DEVICES.find((d) => d.k === dev);
    if (dev === "apple") {
      try {
        await loadWK();
      } catch (_) {
        toast(t2("wkLoadFail"));
        return;
      }
    }
    const files = [], seen = /* @__PURE__ */ new Map();
    for (const it of items) {
      const n = (seen.get(it.file) || 0) + 1;
      seen.set(it.file, n);
      const base = n > 1 ? `${it.file}-${n}` : it.file;
      try {
        const data = dev === "apple" ? new Uint8Array(await (await workoutBlob(it)).arrayBuffer()) : fitEncodeWorkout(it.fitTitle || it.title, fitSteps(it.wp, it.paces));
        files.push({ name: `${base}.${D.ext}`, data });
      } catch (e) {
        console.error(e);
        toast(t2("buildFail", { name: it.title, m: e && e.message || t2("unknownErr") }));
        return;
      }
    }
    if (!files.length) return;
    const name = (zipBase || files[0].name.replace(/\.\w+$/, "")) + "-" + D.k;
    try {
      dlSave({ filename: name + ".zip", data: makeZip(files) });
      toast(t2(files.length > 1 ? "savedMany" : "savedOne", { n: files.length, dev: D.name(), help: D.help() }));
    } catch (e) {
      toast(downloadErr(e));
    }
  }
  function downloadErr(e) {
    return e && e.message ? t2("dlFailM", { m: e.message }) : t2("dlFail");
  }

  // src/workout.js
  var PACE_EFF = { interval: "hard", rep: "hard", tempo: "tempo", mp: "tempo" };
  function stepEffort(x, sesE) {
    if (x.p === "recovery") return "recovery";
    if (PACE_EFF[x.pace]) return PACE_EFF[x.pace];
    if (x.pace === "race") return sesE === "race" ? "race" : "tempo";
    if (x.pace === "easy") return sesE === "long" ? "long" : "easy";
    return sesE === "easy" || sesE === "long" ? "hard" : sesE;
  }
  function stepSecKm(x, e, P) {
    return x.pace ? P.sec[x.pace] : e === "recovery" ? P.sec.easy * 1.1 : e === "hard" ? P.sec.interval : e === "tempo" ? P.sec.tempo : P.sec.easy;
  }
  function workoutSegs(wp, sesE, P) {
    const segs = [];
    const add = (x, e, role) => {
      const spk = stepSecKm(x, e, P);
      const sec = x.g[0] === "t" ? x.g[1] : x.g[1] * spk;
      const km = x.g[0] === "d" ? x.g[1] : sec / spk;
      segs.push({ e, sec, km, role, pace: x.pace || null });
    };
    if (wp.wu) add({ p: "work", g: wp.wu, pace: "easy" }, "easy", "wu");
    for (const b of wp.blocks)
      for (let r = 0; r < Math.max(1, b.n); r++)
        for (const x of b.steps) add(x, stepEffort(x, sesE), x.p === "recovery" ? "rec" : "main");
    if (wp.cd) add({ p: "work", g: wp.cd, pace: "easy" }, "easy", "cd");
    return segs;
  }
  function estDur(sec) {
    const m = Math.max(1, Math.round(sec / 60));
    if (m < 60) return t2("durMin", { m });
    const r = Math.round(m / 5) * 5;
    return t2("durHM", { h: Math.floor(r / 60), m: String(r % 60).padStart(2, "0") });
  }
  var sesWp = (s) => s.watch || watchPlan2(s.kind, s.km);
  var inTime = (s) => RUN_UNIT === "t" && s.kind !== "race" && (s.km > 0 || !!s.watch);
  function sesSec(s, P) {
    if (!(s.km > 0) && !s.watch) return 0;
    return workoutSegs(sesWp(s), sesEffort(s), P || paces2(S.inputs)).reduce((a, g) => a + g.sec, 0);
  }
  function sesAmt(s, P) {
    return inTime(s) ? estDur(sesSec(s, P)) : `${s.km} km`;
  }
  function mainSetHtml(wp) {
    return htmlJoin(
      wp.blocks.map((b) => {
        const w = b.steps.find((x) => x.p !== "recovery") || b.steps[0], rec = b.steps.find((x) => x.p === "recovery");
        if (b.n > 1) return html`<b>${b.n} × ${gTxt(w.g)}</b>${rec ? ` \xB7 ${gTxt(rec.g)} ${t2("tdJog")}` : ""}`;
        return htmlJoin(
          b.steps.map((x) => html`<b>${gTxt(x.g)}</b>${x.pace ? " " + paceLbl(x.pace) : ""}`),
          " + "
        );
      }),
      " + "
    );
  }
  function workoutBar(wp, sesE, P) {
    const segs = workoutSegs(wp, sesE, P);
    const bar = html`<div class="wbar" role="img" aria-label="${esc(watchSummary(wp, P))}">${htmlJoin(segs.map((g) => html`<i class="${g.role === "rec" ? "rec" : ""}" style="flex:${Math.max(1, Math.round(g.sec))} 1 0;background:${effColor(g.e)}"></i>`))}</div>`;
    const main = mainSetHtml(wp);
    const lbl = html`<div class="wbarlbl">${wp.wu ? html`<span><b>${gTxt(wp.wu)}</b> ${t2("warmup").toLowerCase()}</span>` : ""}<span>${main}</span>${wp.cd ? html`<span><b>${gTxt(wp.cd)}</b> ${t2("cooldown").toLowerCase()}</span>` : ""}</div>`;
    return { html: html`<div>${bar}${lbl}</div>`, sec: segs.reduce((a, g) => a + g.sec, 0), segs };
  }

  // src/today.js
  var TD = { keys: [], eff: {}, hard: false };
  var HEAT_KEYS = /* @__PURE__ */ new Set(["easy", "tempo", "mp"]);
  function paceChips() {
    const P = paces2(S.inputs), add = WX.heat ? WX.heat.add : 0;
    return htmlJoin(
      TD.keys.map((k) => {
        const e = TD.eff[k] || "easy";
        const val = P.vdot ? add && HEAT_KEYS.has(k) ? html`<b>${fmtPace2(P.sec[k] + add).replace("/km", "")}</b>/km <s>${P.txt[k].replace("/km", "")}</s>` : html`<b>${P.txt[k].replace("/km", "")}</b>/km` : html`<b>${esc(P.txt[k])}</b>`;
        return html`<span class="pc" data-k="${k}" style="--c:${effColor(e)}">${esc(cap2(paceLbl(k)))} ${val}</span>`;
      })
    );
  }
  function applyHeat() {
    const pe = document.getElementById("tdPaces"), he = document.getElementById("tdHeat");
    if (pe) setHtml(pe, paceChips());
    if (he) {
      const h = WX.heat;
      setHtml(
        he,
        h && (TD.keys.length || TD.hard) ? html`${t2("tdHeat", { v: h.feels, s: h.add })}${TD.hard ? t2("tdHeatHard") : ""}` : ""
      );
    }
  }
  function sendLbl(name) {
    const d = DEVICES.find((x) => x.k === getDevice()) || DEVICES[0];
    const b = d.k === "other" ? t2("sendWatch") : t2("sendTo", { dev: d.name() });
    return name ? `${b} \xB7 ${name}` : b;
  }
  function renderToday() {
    TD = { keys: [], eff: {}, hard: false };
    const P = S.plan;
    if (!P || !P.weeks.length) return "";
    const today = /* @__PURE__ */ new Date();
    today.setHours(12, 0, 0, 0);
    const td = dow2(today);
    const st0 = parseISO2(P.weeks[0].start), end = addDays2(st0, 7 * P.weeks.length - 1);
    const wi = P.weeks.findIndex((w) => {
      const st = parseISO2(w.start);
      return today >= st && today < addDays2(st, 7);
    });
    const whenOf = (w, s) => fmtDay(sessionDate(w, s));
    const nextAfter = (wi0, d0) => {
      for (let i = Math.max(wi0, 0); i < P.weeks.length; i++) {
        const ss = P.weeks[i].sessions.filter((s) => i > wi0 || s.day > d0).sort((a, b) => a.day - b.day);
        if (ss.length) return { w: P.weeks[i], s: ss[0] };
      }
      return null;
    };
    let eb = [html`<b>${t2("tdToday")}</b><span>${cap2(fmtDay(today))}</span>`], body, cta = html``;
    if (today < st0) {
      const n = nextAfter(0, -1);
      body = html`<div class="rest"><b>${t2("tdBefore", { d: fmtDate2(st0) })}</b>${n ? html`<p class="tnext">${t2("tdBeforeT", { when: whenOf(n.w, n.s), name: esc(n.s.name.toLowerCase()), amt: sesAmt(n.s) })}</p>` : ""}</div>`;
    } else if (wi < 0 || today > end) {
      body = html`<div class="rest"><b>${t2("tdDone")}</b><p>${t2("tdDoneT", { d: fmtDate2(end) })}</p></div>`;
    } else {
      const w = P.weeks[wi];
      eb.push(
        html`<span style="color:${phaseText(w.phase)}">${t2("tdWeek", { n: w.n, phase: phaseLbl(w.phase) })}</span>`
      );
      const ss = w.sessions.filter((s) => s.day === td);
      if (ss.length) {
        const Pc = paces2(S.inputs);
        const hard = [], easy = [];
        body = htmlJoin(
          ss.map((s) => {
            const e = sesEffort(s), wp = s.watch || watchPlan2(s.kind, s.km), wb = workoutBar(wp, e, Pc);
            for (const g of wb.segs) {
              if (g.role === "main" && (g.e === "hard" || g.e === "race")) TD.hard = true;
            }
            for (const g of wb.segs)
              if (g.pace && !TD.eff[g.pace]) {
                TD.eff[g.pace] = g.e;
                (g.pace === "easy" ? easy : hard).push(g.pace);
              }
            return html`<div class="tses" style="--k:${effColor(e)};--kt:${effText(e)}"><div class="tn"><b>${esc(s.name)}</b></div>
      <div class="tbig">${inTime(s) ? html`<b>${t2("tdEst", { d: estDur(wb.sec) })}</b><span>${esc(s.km)} km</span>` : html`<b>${esc(s.km)}<small> km</small></b><span>${t2("tdEst", { d: estDur(wb.sec) })}</span>`}</div>${wb.html}${s.desc ? html`<p>${esc(s.desc)}</p>` : ""}</div>`;
          })
        );
        TD.keys = [...hard, ...easy];
        cta = html`<div class="tcta">${htmlJoin(ss.map((s) => html`<button type="button" class="btn primary" data-act="twatch" data-w="${wi}" data-s="${s.id}" data-n="${ss.length > 1 ? esc(s.name) : ""}">${esc(sendLbl(ss.length > 1 ? s.name : ""))}</button><button type="button" class="btn" data-act="tedit" data-w="${wi}" data-s="${s.id}">${t2("tdEdit")}${ss.length > 1 ? html`<span class="sr"> ${esc(s.name)}</span>` : ""}</button>`))}</div>`;
      } else {
        const n = nextAfter(wi, td);
        body = html`<div class="rest"><b>${t2("tdRest")}</b><p>${t2("tdRestT")}</p></div>${n ? html`<p class="tnext">${t2("tdNext", { when: whenOf(n.w, n.s), name: esc(n.s.name.toLowerCase()), amt: sesAmt(n.s) })}</p>` : ""}<p class="tnext"><button type="button" class="linkbtn" data-act="quick" data-type="easy">${t2("qwAnyway")}</button></p>`;
      }
    }
    return html`<section class="today" aria-label="${esc(t2("tdToday"))}"><div class="tmain"><div class="eyebrow">${eb}</div>${body}</div><div class="tside"><div><div class="tpaces" id="tdPaces"></div><div class="theat" id="tdHeat" role="note"></div><div class="wxp" id="wx" aria-live="polite"></div></div>${cta}</div></section>`;
  }
  function initToday() {
    $("#plan").addEventListener("submit", (e) => {
      if (e.target.id !== "wxForm") return;
      e.preventDefault();
      const q = $("#wxQ");
      if (q) wxFind(q.value);
    });
  }

  // src/weather.js
  var WX = {
    fails: 0,
    failAt: 0,
    loc: (() => {
      try {
        const v = JSON.parse(localStorage.getItem("bb-wx") || "null");
        return v && isFinite(v.lat) && isFinite(v.lon) ? v : null;
      } catch (_) {
        return null;
      }
    })(),
    data: null,
    at: 0,
    busy: false,
    err: "",
    editing: false,
    open: (() => {
      try {
        return localStorage.getItem("bb-wx-open") === "1";
      } catch (_) {
        return false;
      }
    })(),
    heat: null
  };
  function wxSaveLoc(l) {
    WX.loc = l;
    WX.data = null;
    WX.at = 0;
    WX.err = "";
    WX.fails = 0;
    WX.failAt = 0;
    WX.editing = false;
    try {
      localStorage.setItem("bb-wx", JSON.stringify(l));
    } catch (_) {
    }
  }
  function wmoKey(c) {
    c = +c;
    if (c === 0) return 0;
    if (c === 1) return 1;
    if (c === 2) return 2;
    if (c === 3) return 3;
    if (c === 45 || c === 48) return 45;
    if (c >= 51 && c <= 55) return 51;
    if (c === 56 || c === 57) return 56;
    if (c === 61 || c === 63) return 61;
    if (c === 65) return 65;
    if (c === 66 || c === 67) return 66;
    if (c >= 71 && c <= 77) return 71;
    if (c >= 80 && c <= 82) return 80;
    if (c === 85 || c === 86) return 85;
    if (c >= 95) return 95;
    return 3;
  }
  function wxIcon(c) {
    const k = wmoKey(c);
    const sun = html`<circle cx="20" cy="20" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 4v4M20 32v4M4 20h4M32 20h4M8.7 8.7l2.8 2.8M28.5 28.5l2.8 2.8M8.7 31.3l2.8-2.8M28.5 11.5l2.8-2.8"/></g>`;
    const cloud = (y = 0) => html`<path d="M12 ${30 + y}h17a6 6 0 0 0 0-12 9 9 0 0 0-17 2 5 5 0 0 0 0 10z" fill="var(--surface)" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`;
    let g;
    if (k === 0) g = sun;
    else if (k === 1 || k === 2) g = html`<g transform="translate(-5 -6) scale(.75)" opacity=".85">${sun}</g>${cloud(2)}`;
    else if (k === 3) g = cloud(-2);
    else if (k === 45)
      g = html`<g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 14h26M5 20h30M8 26h24M11 32h18"/></g>`;
    else if (k === 71 || k === 85)
      g = html`${cloud(-6)}<g fill="currentColor"><circle cx="14" cy="33" r="1.8"/><circle cx="21" cy="36" r="1.8"/><circle cx="28" cy="33" r="1.8"/></g>`;
    else if (k === 95)
      g = html`${cloud(-6)}<path d="M21 28l-4 7h5l-3 6" fill="none" stroke="var(--long)" stroke-width="2.4" stroke-linejoin="round"/>`;
    else
      g = html`${cloud(-6)}<g stroke="var(--recovery)" stroke-width="2.4" stroke-linecap="round"><path d="M14 30l-2 5M21 30l-2 5M28 30l-2 5"/></g>`;
    return html`<svg viewBox="0 0 40 40" aria-hidden="true">${g}</svg>`;
  }
  var hm = (s) => String(s).slice(11, 16);
  var wxWait = (n) => Math.min(30 * 6e4, 3e4 * 2 ** Math.max(0, n - 1));
  async function wxLoad(force) {
    if (!WX.loc || WX.busy) return;
    if (!force && WX.data && Date.now() - WX.at < 30 * 6e4) return;
    if (!force && WX.fails && Date.now() - WX.failAt < wxWait(WX.fails)) return;
    WX.busy = true;
    WX.err = "";
    renderWx();
    const { lat, lon } = WX.loc;
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunset&timezone=auto&forecast_days=1`;
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error("http " + r.status);
      WX.data = await r.json();
      WX.at = Date.now();
      WX.fails = 0;
    } catch (_) {
      WX.err = "blocked";
      WX.fails = (WX.fails || 0) + 1;
      WX.failAt = Date.now();
    }
    WX.busy = false;
    renderWx();
  }
  async function wxFind(q) {
    q = q.trim();
    if (!q) return;
    WX.busy = true;
    WX.err = "";
    renderWx();
    try {
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=${LANG}&format=json`
      );
      if (!r.ok) throw new Error();
      const j = await r.json();
      const h = j.results && j.results[0];
      WX.busy = false;
      if (!h) {
        WX.err = "nocity:" + q;
        renderWx();
        return;
      }
      wxSaveLoc({ name: h.name, lat: h.latitude, lon: h.longitude, country: h.country || "" });
      wxLoad(true);
    } catch (_) {
      WX.busy = false;
      WX.err = "blocked";
      renderWx();
    }
  }
  function wxGeo() {
    const fail = () => {
      WX.busy = false;
      WX.err = "geo";
      renderWx();
    };
    if (!navigator.geolocation) {
      fail();
      return;
    }
    WX.busy = true;
    WX.err = "";
    renderWx();
    try {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          WX.busy = false;
          wxSaveLoc({ name: "", lat: p.coords.latitude, lon: p.coords.longitude, country: "" });
          wxLoad(true);
        },
        fail,
        { timeout: 1e4, maximumAge: 30 * 6e4 }
      );
    } catch (_) {
      fail();
    }
  }
  function wxBestSlot(D) {
    const c = D.current || {}, H = D.hourly || {};
    const nowH = String(c.time || "").slice(0, 13);
    const idx = (H.time || []).map((tm, i) => ({ tm, i })).filter((o) => o.tm.slice(0, 13) >= nowH && +o.tm.slice(11, 13) <= 22);
    let best = null;
    if (idx.length > 1)
      for (const o of idx) {
        const p = H.precipitation_probability[o.i] ?? 0;
        if (!best || p < best.p || p === best.p && H.temperature_2m[o.i] > best.tp)
          best = { i: o.i, p, tp: H.temperature_2m[o.i] };
      }
    return { idx, best };
  }
  function wxHeat(D) {
    if (!D) return null;
    const c = D.current || {}, H = D.hourly || {};
    const { best } = wxBestSlot(D);
    const at = best && H.apparent_temperature ? H.apparent_temperature[best.i] : c.apparent_temperature;
    if (!isFinite(at)) return null;
    const add = at >= 28 ? 20 : at >= 22 ? 10 : 0;
    return add ? { feels: Math.round(at), add } : null;
  }
  function renderWx() {
    const el = document.getElementById("wx");
    if (!el) return;
    const D = WX.data;
    const errMsg = WX.err === "blocked" ? t2("wxBlocked") : WX.err === "geo" ? t2("wxGeoFail") : WX.err.startsWith("nocity:") ? t2("wxNoCity", { q: esc(WX.err.slice(7)) }) : "";
    const open = WX.open || WX.editing || !!errMsg;
    const city = WX.loc ? esc(WX.loc.name || `${WX.loc.lat.toFixed(2)}, ${WX.loc.lon.toFixed(2)}`) : "";
    const chev = html`<svg class="chev" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    let sum, more;
    if (!WX.loc || WX.editing) {
      const sug = S.inputs.race && S.inputs.race.city || WX.loc && WX.loc.name || "";
      sum = html`${wxIcon(2)}<span>${WX.loc ? html`<b>${t2("wxTitle")}</b> · ${city}` : t2("wxAdd")}</span>`;
      more = html`<span class="hint">${t2("wxSet")}</span>
    <form id="wxForm"><input id="wxQ" aria-label="${esc(t2("wxCity"))}" placeholder="${esc(t2("wxCityPh"))}" value="${esc(sug)}" autocomplete="address-level2"><button class="btn sm primary" type="submit" ${WX.busy ? "disabled" : ""}>${t2("wxGo")}</button></form>
    <div class="wxloc">${navigator.geolocation ? html`<button type="button" class="icon-btn" data-act="wxgeo">${t2("wxGeo")}</button>` : ""}${WX.busy ? html`<span>${t2("wxLoading")}</span>` : ""}</div>
    ${errMsg ? html`<span class="hint">${errMsg}</span>` : ""}`;
    } else {
      const change = html`<div class="wxloc">${D ? html`<span>${t2("wxUpd", { t: new Date(WX.at).toLocaleTimeString(LOC(), { hour: "2-digit", minute: "2-digit" }) })}</span>` : ""}<button type="button" class="icon-btn" data-act="wxedit">${t2("wxChange")}</button></div>`;
      if (!D) {
        sum = html`${wxIcon(3)}<span><b>${t2("wxTitle")}</b> · ${city}${WX.busy ? ` \xB7 ${t2("wxLoading")}` : ""}</span>`;
        more = html`${errMsg ? html`<span class="hint">${errMsg}</span>` : ""}${change}`;
      } else {
        const c = D.current || {}, dd = D.daily || {}, H = D.hourly || {};
        const { idx, best } = wxBestSlot(D);
        const step = idx.length > 8 ? 2 : 1;
        const hrs = idx.filter((_, j) => j % step === 0);
        const wk = wmoKey(c.weather_code);
        sum = html`${wxIcon(c.weather_code)}<span><b>${Math.round(c.temperature_2m)}°</b> ${esc(t2("wmo" + wk).toLowerCase())} · ${t2("wxRain", { p: dd.precipitation_probability_max ? dd.precipitation_probability_max[0] ?? 0 : 0 })}${best ? ` \xB7 ${t2("wxDriest", { h: hm(H.time[best.i]) })}` : ""} · ${city}</span>`;
        more = html`<div class="wxnow">${wxIcon(c.weather_code)}<span class="tmp">${Math.round(c.temperature_2m)}°</span><span class="dsc"><b>${t2("wmo" + wk)}</b><span>${t2("wxFeels", { v: Math.round(c.apparent_temperature) })}</span></span></div>
  <div class="wxfacts"><span>${t2("wxHiLo", { h: html`<b>${Math.round(dd.temperature_2m_max[0])}</b>`, l: html`<b>${Math.round(dd.temperature_2m_min[0])}</b>` })}</span><span>${t2("wxRain", { p: html`<b>${dd.precipitation_probability_max[0] ?? 0}</b>` })}</span><span>${t2("wxWind", { w: html`<b>${Math.round(c.wind_speed_10m)}</b>` })}</span>${dd.sunset ? html`<span>${t2("wxSun", { t: html`<b>${hm(dd.sunset[0])}</b>` })}</span>` : ""}</div>
  ${hrs.length ? html`<div class="wxhours">${htmlJoin(hrs.map((o) => html`<div class="wxh ${best && best.i === o.i ? "best" : ""}"><span class="hr">${hm(o.tm)}</span><span class="tp">${Math.round(H.temperature_2m[o.i])}°</span><span class="pp">${H.precipitation_probability[o.i] ?? 0}%</span></div>`))}</div>` : ""}
  ${best ? html`<span class="wxbest">${t2("wxBest", { h: hm(H.time[best.i]), p: best.p, tp: Math.round(best.tp) })}</span>` : ""}
  ${change}`;
      }
    }
    setHtml(
      el,
      html`<button type="button" class="wxline" data-act="wxtoggle" aria-expanded="${open}" aria-controls="wxMore">${sum}${chev}</button><div class="wxmore" id="wxMore" ${open ? "" : "hidden"}>${more}</div>`
    );
    WX.heat = wxHeat(D);
    applyHeat();
  }

  // src/plan-file.js
  var KINDS = ["easy", "recovery", "hard", "long", "race"];
  var PACES = ["easy", "tempo", "interval", "rep", "race", "mp"];
  var nNum = (v, a, b, d) => {
    if (v === "" || v == null || typeof v === "boolean") return d;
    v = +v;
    return isFinite(v) ? clamp2(v, a, b) : d;
  };
  var nStr = (v, n) => (typeof v === "string" ? v : typeof v === "number" && isFinite(v) ? String(v) : "").slice(0, n);
  var nIso = (v, d) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(parseISO2(v)) ? v : d;
  var nId = (v) => typeof v === "string" && /^[\w-]{1,64}$/.test(v) ? v : null;
  function safeUrl(v) {
    v = nStr(v, 500).trim();
    if (!v) return "";
    if (!/^[a-z][\w+.-]*:/i.test(v)) v = "https://" + v;
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch (_) {
      return "";
    }
  }
  function nGoal(g) {
    return Array.isArray(g) && (g[0] === "d" || g[0] === "t") && isFinite(+g[1]) && +g[1] > 0 ? [g[0], clamp2(+g[1], 0.01, g[0] === "d" ? 500 : 86400)] : null;
  }
  function nWatch(wp) {
    if (!wp || typeof wp !== "object" || !Array.isArray(wp.blocks) || !wp.blocks.length) return void 0;
    const blocks = [];
    for (const b of wp.blocks.slice(0, 50)) {
      if (!b || !Array.isArray(b.steps) || !b.steps.length) return void 0;
      const steps = [];
      for (const x of b.steps.slice(0, 20)) {
        const g = x && nGoal(x.g);
        if (!g) return void 0;
        steps.push({ p: x.p === "recovery" ? "recovery" : "work", g, pace: PACES.includes(x.pace) ? x.pace : null });
      }
      blocks.push({ n: Math.round(nNum(b.n, 1, 50, 1)), steps });
    }
    const out = { blocks };
    const wu = nGoal(wp.wu), cd = nGoal(wp.cd);
    if (wu) out.wu = wu;
    if (cd) out.cd = cd;
    return out;
  }
  function normalizeSaved(p) {
    if (!p || typeof p !== "object" || !p.inputs || typeof p.inputs !== "object" || !Array.isArray(p.types) || !p.plan || !Array.isArray(p.plan.weeks))
      return null;
    const d = DEFAULT_INPUTS(), I = p.inputs;
    const opt = (v, a, b) => v === "" ? "" : nNum(v, a, b, "");
    const inputs = {
      ...d,
      goal: I.goal === "fitness" ? "fitness" : "race",
      startDate: nIso(I.startDate, d.startDate),
      dist: DISTS2.some((x) => x.k === I.dist) ? I.dist : d.dist,
      customKm: nNum(I.customKm, 3, 100, d.customKm),
      raceDate: nIso(I.raceDate, d.raceDate),
      weeks: Math.round(nNum(I.weeks, 3, 30, d.weeks)),
      curVol: opt(I.curVol, 0, 200),
      curLong: opt(I.curLong, 0, 45),
      recDist: ["0", "5", "10", "21.0975", "42.195"].includes(String(I.recDist)) ? String(I.recDist) : "0",
      recTime: nStr(I.recTime, 12),
      level: levelOf2(I),
      recWeeks: recWeeksOf2({ goal: "race", recWeeks: I.recWeeks }),
      runs: Math.round(nNum(I.runs, 0, 7, 0)),
      days: Array.isArray(I.days) ? [...new Set(I.days.map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x < 7))].sort((a, b) => a - b) : [],
      longDay: Math.round(nNum(I.longDay, -1, 6, -1)),
      race: null
    };
    if (I.race && typeof I.race === "object" && nStr(I.race.name, 200).trim())
      inputs.race = {
        name: nStr(I.race.name, 200).trim(),
        city: nStr(I.race.city, 200).trim(),
        url: safeUrl(I.race.url)
      };
    const seenT = /* @__PURE__ */ new Set(), types = [];
    for (const x of p.types) {
      if (!x || typeof x !== "object") continue;
      let id = nId(x.id);
      if (!id || seenT.has(id)) id = "c" + uid2();
      seenT.add(id);
      const kind = ["easy", "recovery", "hard", "long"].includes(x.kind) ? x.kind : "hard";
      const ph = Array.isArray(x.phases) ? PHASES2.filter((q) => x.phases.includes(q)) : [];
      types.push({
        id,
        name: nStr(x.name, 80).trim() || t2("ty_custom"),
        kind,
        on: id === "easy" || !!x.on,
        ...x.locked ? { locked: true } : {},
        phases: ph.length ? ph : PHASES2.slice(),
        tpl: nStr(x.tpl, 2e3)
      });
    }
    for (const def of DEFAULT_TYPES())
      if ((def.id === "easy" || def.id === "long") && !seenT.has(def.id))
        types.unshift({ ...def, on: def.id === "easy" });
    const weeks = [], seenS = /* @__PURE__ */ new Set();
    for (const w of p.plan.weeks.slice(0, 30)) {
      if (!w || typeof w !== "object") return null;
      const start = nIso(w.start, weeks.length ? iso2(addDays2(parseISO2(weeks[weeks.length - 1].start), 7)) : null);
      if (!start) return null;
      const sessions = [];
      for (const s of Array.isArray(w.sessions) ? w.sessions.slice(0, 14) : []) {
        const day = +(s && s.day);
        if (!Number.isInteger(day) || day < 0 || day > 6) continue;
        let id = nId(s.id);
        if (!id || seenS.has(id)) id = uid2();
        seenS.add(id);
        const typeId = s.typeId === "race" ? "race" : nId(s.typeId) || "easy";
        const watch = nWatch(s.watch);
        sessions.push({
          id,
          day,
          typeId,
          name: nStr(s.name, 80) || t2("ty_easy"),
          kind: KINDS.includes(s.kind) ? s.kind : "easy",
          km: Math.round(nNum(s.km, 0, 500, 0) * 100) / 100,
          desc: nStr(s.desc, 4e3),
          note: nStr(s.note, 4e3),
          ...watch ? { watch } : {}
        });
      }
      sessions.sort((a, b) => a.day - b.day);
      weeks.push({
        n: weeks.length + 1,
        phase: WEEK_PHASES2.includes(w.phase) ? w.phase : "base",
        cutback: !!w.cutback,
        start,
        target: Math.round(nNum(w.target, 0, 2e3, 0)),
        note: nStr(w.note, 4e3),
        sessions
      });
    }
    if (!weeks.length) return null;
    const M = p.plan.meta && typeof p.plan.meta === "object" ? p.plan.meta : {};
    const vdot = nNum(M.vdot, 15, 90, null), raceSec = nNum(M.raceSec, 60, 86400, null);
    const meta = {
      noRace: inputs.goal === "fitness",
      D: distKm2(inputs),
      c: ["5k", "10k", "hm", "m"].includes(M.c) ? M.c : cat2(distKm2(inputs)),
      taperN: Math.round(nNum(M.taperN, 0, 3, 0)),
      peakV: Math.round(nNum(M.peakV, 0, 2e3, 0)),
      start: nIso(M.start, weeks[0].start),
      vdot,
      raceSec,
      racePace: vdot && raceSec ? nStr(M.racePace, 16) : null
    };
    return {
      name: nStr(p.name, 120).trim() || t2("trainingBlock"),
      inputs,
      types,
      plan: { weeks, meta },
      edited: !!p.edited,
      updatedAt: nNum(p.updatedAt, 0, 864e13, 0)
    };
  }

  // src/race.js
  function finishersUrl(I) {
    const m = Math.round(distKm2(I) * 1e3);
    return `https://www.finishers.com/courses?discipline=road&dmin=${m}&dmax=${m}&distanceUnit=meters`;
  }
  function nameFromUrl(u) {
    try {
      const x = new URL(u);
      if (!/finishers\.com$/.test(x.hostname.replace(/^www\./, ""))) return "";
      const seg = x.pathname.split("/").filter(Boolean);
      const i = seg.indexOf("course");
      const slug2 = i >= 0 ? seg[i + 1] : seg[seg.length - 1];
      if (!slug2) return "";
      return decodeURIComponent(slug2).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\b(De|Du|Des|La|Le|Les|Et|D|L)\b/g, (w) => w.toLowerCase());
    } catch (_) {
      return "";
    }
  }
  function renderRaceBox() {
    const R = S.inputs.race, el = $("#raceBox");
    if (!el) return;
    if (R && R.name && !S.raceEditing) {
      el.className = "racebox set";
      setHtml(
        el,
        html`<div><div style="font-weight:600">${esc(R.name)}</div><div class="hint">${R.city ? esc(R.city) + " \xB7 " : ""}${fmtDate2(parseISO2(S.inputs.raceDate))} · ${esc(distLabel2(S.inputs))}</div></div>
    <div class="acts"><button type="button" class="btn sm" data-race="edit">${t2("editRace")}</button><button type="button" class="btn sm ghost" data-race="clear">${t2("removeRace")}</button></div>`
      );
      return;
    }
    el.className = "racebox";
    if (!S.raceEditing) {
      setHtml(
        el,
        html`<div class="hint">${t2("raceOptional")}</div>
    <div class="acts"><a class="btn sm" href="${finishersUrl(S.inputs)}" target="_blank" rel="noopener">${esc(t2("findOn", { lbl: distLabel2(S.inputs).toLowerCase() }))}</a><button type="button" class="btn sm" data-race="edit">${t2("addMyRace")}</button></div>`
      );
      return;
    }
    const r = R || {};
    setHtml(
      el,
      html`<div class="field"><label for="rUrl">${t2("raceUrl")}</label><input id="rUrl" type="url" placeholder="${esc(t2("raceUrlPh"))}" value="${esc(r.url || "")}"></div>
  <div class="field"><label for="rName">${t2("raceName")}</label><input id="rName" value="${esc(r.name || "")}" placeholder="${esc(t2("raceNamePh"))}"></div>
  <div class="field"><label for="rCity">${t2("city")}</label><input id="rCity" value="${esc(r.city || "")}"></div>
  <div class="hint">${t2("raceMatch")}</div>
  <div class="acts"><button type="button" class="btn sm primary" data-race="save">${t2("useRace")}</button><button type="button" class="btn sm ghost" data-race="cancel">${t2("cancel")}</button><a class="btn sm ghost" href="${finishersUrl(S.inputs)}" target="_blank" rel="noopener">${t2("searchFin")}</a></div>`
    );
    const u = el.querySelector("#rUrl"), n = el.querySelector("#rName");
    u.addEventListener("input", () => {
      const g = nameFromUrl(u.value);
      if (g && (!n.value || n.dataset.auto === "1")) {
        n.value = g;
        n.dataset.auto = "1";
      }
    });
    n.addEventListener("input", () => {
      n.dataset.auto = "0";
    });
  }
  function initRaceBox() {
    $("#raceBox").addEventListener("click", (e) => {
      const b = e.target.closest("[data-race]");
      if (!b) return;
      e.stopPropagation();
      const a = b.dataset.race;
      if (a === "edit") {
        S.raceEditing = true;
        renderRaceBox();
        const f = $("#rUrl");
        f && f.focus();
      } else if (a === "cancel") {
        S.raceEditing = false;
        renderRaceBox();
      } else if (a === "clear") {
        S.inputs.race = null;
        S.raceEditing = false;
        renderRaceBox();
        renderHello();
        markDirty();
      } else if (a === "save") {
        const name = $("#rName").value.trim(), city = $("#rCity").value.trim(), url = safeUrl($("#rUrl").value);
        if (!name) {
          $("#rName").focus();
          toast(t2("needName"));
          return;
        }
        S.inputs.race = { name, city, url };
        S.raceEditing = false;
        if (S.isExample || !S.savedAt) {
          S.name = name;
          $("#planName").value = name;
        }
        S.isExample = false;
        renderRaceBox();
        renderPlan();
        markDirty();
      }
    });
    $("#raceBox").addEventListener("change", (e) => e.stopPropagation());
  }

  // src/setup.js
  function renderVolHint() {
    $("#volHint").hidden = !volIsSuggested();
  }
  function renderLongPh() {
    const I = S.inputs;
    $("#curLong").placeholder = +I.curVol > 0 ? "\u2248 " + longOf2(I) : "";
  }
  function renderSetup() {
    const I = S.inputs;
    setHtml(
      $("#distSeg"),
      htmlJoin(
        DISTS2.map(
          (d) => html`<button type="button" data-dist="${d.k}" aria-pressed="${I.dist === d.k}">${t2("d" + d.k)}</button>`
        )
      )
    );
    $("#customRow").hidden = I.dist !== "custom";
    $("#customKm").value = I.customKm;
    $("#raceDate").value = I.raceDate;
    $("#weeks").value = I.weeks;
    $("#startDate").value = I.startDate || nextMonday2();
    const fit = I.goal === "fitness";
    $$("#goalSeg button").forEach(
      (b) => b.setAttribute("aria-pressed", String(b.dataset.goal === (fit ? "fitness" : "race")))
    );
    $("#recWeeksF").hidden = fit;
    const rw = recWeeksOf2({ ...I, goal: "race" });
    setHtml(
      $("#recSeg"),
      htmlJoin(
        [0, 1, 2].map(
          (n) => html`<button type="button" data-rec="${n}" aria-pressed="${rw === n}">${t2("rec" + n)}</button>`
        )
      )
    );
    $("#recHint").textContent = t2(rw ? "recHint" : "recHint0");
    $("#raceDateF").hidden = fit;
    $("#startDateF").hidden = !fit;
    $("#raceBox").hidden = fit;
    $("#focusHint").hidden = !fit;
    $("#distLbl").textContent = t2(fit ? "focusDist" : "distance");
    $("#secRaceH").textContent = t2(fit ? "secFocus" : "secRace");
    setHtml($("#introCards"), [
      htmlJoin(
        [
          ["race", "goalRace", "icRace"],
          ["fitness", "goalFit", "icFit"]
        ].map(
          ([g, a, b]) => html`<button type="button" class="icard" data-goal="${g}" aria-pressed="${(fit ? "fitness" : "race") === g}"><b>${t2(a)}</b><span>${t2(b)}</span></button>`
        )
      ),
      html`<button type="button" class="icard" data-intro="quick"><b>${t2("qwOpen")}</b><span>${t2("icQuick")}</span></button>`
    ]);
    $("#focusHint").textContent = t2("focusHint");
    $("#curVol").value = I.curVol;
    renderVolHint();
    $("#curLong").value = I.curLong;
    renderLongPh();
    $("#recDist").value = I.recDist;
    $("#recTime").value = I.recTime;
    const lv = levelOf2(I);
    setHtml(
      $("#levelSeg"),
      htmlJoin(
        LEVELS2.map(
          (l) => html`<button type="button" data-level="${l}" aria-pressed="${lv === l}">${t2("lv_" + l)}</button>`
        )
      )
    );
    $("#levelHint").textContent = t2("lvHint_" + lv);
    setHtml(
      $("#runsSeg"),
      htmlJoin(
        [1, 2, 3, 4, 5, 6, 7].map(
          (n) => html`<button type="button" data-runs="${n}" aria-pressed="${+I.runs === n}">${n}</button>`
        )
      )
    );
    setHtml(
      $("#daysSeg"),
      htmlJoin(
        DAYS1.map(
          (d, i) => html`<button type="button" data-day="${i}" aria-label="${DAYS[i]}" aria-pressed="${I.days.includes(i)}" class="${+I.longDay === i ? "long" : ""}">${d}</button>`
        )
      )
    );
    $("#daysCount").textContent = t2("daysCount", { a: I.days.length, b: I.runs || "-" });
    setHtml($("#longDay"), [
      +I.longDay < 0 ? html`<option value="-1" selected>-</option>` : "",
      htmlJoin(DAYS.map((d, i) => html`<option value="${i}" ${+I.longDay === i ? "selected" : ""}>${d}</option>`))
    ]);
    renderTypes();
    renderHints();
    renderRaceBox();
    renderIntro();
  }
  function renderHints() {
    const I = S.inputs, P = paces2(I);
    const start = parseISO2(S.plan ? S.plan.meta.start : I.raceDate || I.startDate);
    const blank = missingSetup2(I).some((k) => SETUP_STEP2[k] === 2);
    $("#startHint").textContent = blank ? "" : I.goal === "fitness" ? t2("fitHint", {
      s: fmtDate2(start),
      e: fmtDate2(addDays2(start, 7 * (S.plan ? S.plan.weeks.length : I.weeks) - 1))
    }) : t2("startHint", { d: fmtDate2(start), r: fmtDay(parseISO2(I.raceDate)) });
    $("#paceHint").textContent = P.vdot ? t2("paceHint", { e: P.txt.easy, t: P.txt.tempo, i: P.txt.interval, lbl: distLabel2(I), r: P.txt.race }) : badRaceTime2(I) ? badTimeMsg2(I) : t2("paceHintNone");
  }
  function renderChips() {
    const tt = t2;
    const focusId = document.activeElement && document.activeElement.closest && document.activeElement.closest("#typeChips") ? document.activeElement.id : null;
    const chip = (t3, i) => html`<label class="tchip ${t3.on ? "" : "off"}" data-i="${i}"><input type="checkbox" id="t-on-${t3.id}" ${t3.on ? "checked" : ""} ${t3.locked ? "disabled" : ""} aria-label="${esc(tt("useType", { name: t3.name }))}"><span class="kind-dot" style="background:${effColor(effort(t3.id, t3.kind))}" aria-hidden="true"></span>${esc(t3.name)}${t3.locked ? html`<svg class="lock" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><title>${tt("alwaysOn")}</title><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>` : ""}</label>`;
    const grp = (key, list) => list.length ? html`<div class="tgrp"><span class="lbl" id="tg-${key}">${tt(key)}</span><div class="tchips" role="group" aria-labelledby="tg-${key}">${htmlJoin(list.map(([t3, i]) => chip(t3, i)))}</div></div>` : "";
    const idx = S.types.map((t3, i) => [t3, i]);
    setHtml($("#typeChips"), [
      grp(
        "grpEasy",
        idx.filter(([t3]) => t3.kind !== "hard")
      ),
      grp(
        "grpQuality",
        idx.filter(([t3]) => t3.kind === "hard")
      )
    ]);
    $("#typesCount").textContent = tt("typesCount", { a: S.types.filter((t3) => t3.on).length, b: S.types.length });
    if (focusId) {
      const f = document.getElementById(focusId);
      if (f) f.focus();
    }
  }
  function renderTypes() {
    const tt = t2;
    const openCards = [...document.querySelectorAll("#types .type details[open]")].map(
      (d) => (
        /** @type {HTMLElement} */
        d.closest(".type").dataset.i
      )
    );
    renderChips();
    setHtml(
      $("#types"),
      htmlJoin(
        S.types.map(
          (t3, i) => html`
<div class="type ${t3.on ? "" : "off"}" data-i="${i}">
  <div class="type-head">
    <span class="kind-dot" style="background:${effColor(effort(t3.id, t3.kind))}" title="${kindLbl(t3.kind)}"></span>
    <input class="tname" id="t-name-${t3.id}" data-f="name" value="${esc(t3.name)}" aria-label="${tt("typeNameLbl")}">
    ${t3.locked || DEFAULT_TYPES().some((d) => d.id === t3.id) ? "" : html`<button class="icon-btn" data-del="${i}" aria-label="${tt("remove")} ${esc(t3.name)}">${tt("remove")}</button>`}
  </div>
  <details><summary>${kindLbl(t3.kind)}${t3.kind === "hard" ? " \xB7 " + t3.phases.map(phaseLbl).join(", ") : ""} · ${tt("editDesc")}</summary>
    <div class="opts">
      ${t3.locked || t3.id === "long" ? "" : html`<div class="field"><label for="t-kind-${t3.id}">${tt("kind")}</label><select id="t-kind-${t3.id}" data-f="kind">${htmlJoin(["easy", "recovery", "hard"].map((k) => html`<option value="${k}" ${t3.kind === k ? "selected" : ""}>${kindLbl(k)}</option>`))}</select></div>`}
      ${t3.kind === "hard" ? html`<div class="field"><span class="lbl">${tt("usedPhases")}</span><div class="chips">${htmlJoin(PHASES2.map((p) => html`<button type="button" class="chip" data-phase="${p}" aria-pressed="${t3.phases.includes(p)}">${phaseLbl(p)}</button>`))}</div></div>` : ""}
      <div class="field"><label for="t-tpl-${t3.id}">${tt("tplLbl")}</label><textarea id="t-tpl-${t3.id}" data-f="tpl" rows="3">${esc(t3.tpl)}</textarea></div>
    </div>
  </details>
</div>`
        )
      )
    );
    for (const i of openCards) {
      const d = cardDetails(`.type[data-i="${i}"] details`);
      if (d) d.open = true;
    }
  }
  function inputsChanged() {
    S.isExample = false;
    renderRaceBox();
    if (S.inputs.weeks !== "") S.inputs.weeks = clamp2(Math.round(+S.inputs.weeks || 12), 3, 30);
    if (S.edited) {
      S.pendingRegen = true;
      renderPlan();
      renderHints();
      return;
    }
    regen();
    renderPlan();
    renderHints();
    markDirty();
  }
  function initSetup() {
    $("#setup").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const I = S.inputs;
      if (b.dataset.goal) {
        const prevName = defaultName();
        I.goal = b.dataset.goal;
        if (S.nameAuto || S.name === prevName) {
          S.nameAuto = true;
          S.name = defaultName();
          $("#planName").value = S.name;
        }
        renderSetup();
        inputsChanged();
      } else if (b.dataset.dist) {
        const prevName = defaultName();
        I.dist = b.dataset.dist;
        if (!S.savedAt && S.isExample || S.nameAuto && !S.savedAt || S.name === prevName) S.name = defaultName();
        suggestVolume();
        renderSetup();
        $("#planName").value = S.name;
        inputsChanged();
      } else if (b.dataset.rec !== void 0) {
        I.recWeeks = +b.dataset.rec;
        renderSetup();
        inputsChanged();
      } else if (b.dataset.level) {
        I.level = b.dataset.level;
        suggestVolume();
        renderSetup();
        inputsChanged();
      } else if (b.dataset.runs) {
        I.runs = +b.dataset.runs;
        I.days = DEFAULT_DAYS2[I.runs].slice();
        if (!I.days.includes(+I.longDay)) I.longDay = I.days[I.days.length - 1];
        renderSetup();
        inputsChanged();
      } else if (b.dataset.day !== void 0) {
        const d = +b.dataset.day;
        I.days = I.days.includes(d) ? I.days.filter((x) => x !== d) : [...I.days, d].sort((a, b2) => a - b2);
        renderSetup();
        inputsChanged();
      } else if (b.dataset.phase) {
        const t3 = S.types[+b.closest(".type").dataset.i];
        const p = b.dataset.phase;
        t3.phases = t3.phases.includes(p) ? t3.phases.filter((x) => x !== p) : PHASES2.filter((x) => x === p || t3.phases.includes(x));
        if (!t3.phases.length) t3.phases = [p];
        const open = (
          /** @type {HTMLDetailsElement} */
          b.closest("details").open
        );
        renderTypes();
        if (open) cardDetails(`.type[data-i="${S.types.indexOf(t3)}"] details`).open = true;
        inputsChanged();
      } else if (b.dataset.del !== void 0) {
        S.types.splice(+b.dataset.del, 1);
        renderTypes();
        inputsChanged();
      } else if (b.id === "btnAddType") {
        const id = "c" + uid2();
        S.types.push({
          id,
          name: t2("ty_custom"),
          kind: "hard",
          on: true,
          phases: ["build", "peak"],
          tpl: t2("tp_custom")
        });
        renderTypes();
        const el = cardDetails(`.type[data-i="${S.types.length - 1}"] details`);
        if (el) el.open = true;
        inputsChanged();
      }
    });
    $("#setup").addEventListener("change", (e) => {
      const el = e.target, I = S.inputs;
      const map = {
        startDate: "startDate",
        customKm: "customKm",
        raceDate: "raceDate",
        weeks: "weeks",
        curVol: "curVol",
        curLong: "curLong",
        recDist: "recDist",
        recTime: "recTime",
        longDay: "longDay"
      };
      if (map[el.id]) {
        if (el.id === "raceDate" && !el.value) {
          el.value = I.raceDate;
          return;
        }
        if (el.id === "startDate" && !el.value) {
          el.value = I.startDate;
          return;
        }
        const prevName = defaultName();
        I[map[el.id]] = el.type === "number" && el.value === "" ? "" : el.type === "number" || el.id === "longDay" ? +el.value : el.value;
        if (el.id === "longDay" && +el.value >= 0 && !I.days.includes(+el.value)) {
          I.days = [...I.days.filter((d) => d !== I.days[I.days.length - 1]), +el.value].sort((a, b) => a - b);
        }
        if (el.id === "longDay") renderSetup();
        if (el.id === "customKm") {
          suggestVolume();
          $("#curVol").value = I.curVol;
        }
        if (el.id === "customKm" || el.id === "curVol") renderVolHint();
        if (el.id === "customKm" || el.id === "curVol") renderLongPh();
        if (el.id === "recTime" || el.id === "recDist") {
          const sec = raceTimeSec2(I.recTime, +I.recDist);
          if (sec) {
            I.recTime = fmtDur2(sec);
            $("#recTime").value = I.recTime;
          }
        }
        if (S.name === prevName) {
          S.name = defaultName();
          $("#planName").value = S.name;
        }
        inputsChanged();
        return;
      }
      const cEl = el.closest(".tchip");
      if (cEl) {
        S.types[+cEl.dataset.i].on = el.checked;
        renderTypes();
        inputsChanged();
        return;
      }
      const tEl = el.closest(".type");
      if (tEl && el.dataset.f) {
        const t3 = S.types[+tEl.dataset.i];
        const f = el.dataset.f;
        if (f === "on") t3.on = el.checked;
        else if (f === "kind") {
          t3.kind = el.value;
          if (t3.kind === "hard" && !t3.phases.length) t3.phases = ["build", "peak"];
        } else t3[f] = el.value;
        if (f === "name") renderChips();
        if (f === "on" || f === "kind") {
          const open = (
            /** @type {HTMLDetailsElement} */
            tEl.querySelector("details").open
          );
          renderTypes();
          if (open) cardDetails(`.type[data-i="${tEl.dataset.i}"] details`).open = true;
        }
        inputsChanged();
      }
    });
  }

  // src/intro.js
  var phoneLayout = () => {
    try {
      return matchMedia("(max-width:900px)").matches;
    } catch (_) {
      return false;
    }
  };
  var STEP_NAMES = () => ["secGoal", S.inputs.goal === "fitness" ? "secFocus" : "secRace", "secNow", "secYourWeek"];
  function renderIntro() {
    syncMode();
    const A = $("#setup"), nav = $("#introNav"), n = S.intake || 0;
    if (!A || !nav) return;
    if (n) A.dataset.step = n;
    else delete A.dataset.step;
    nav.hidden = !n;
    if (!n) {
      clearHtml(nav);
      return;
    }
    const ready = !missingSetup2(S.inputs).length && S.plan;
    const prev = n >= 3 ? ready ? html`<div class="intro-prev"><span class="lbl">${t2("loadProfile")}</span><div class="chart">${profileSVG(S.plan.weeks, Math.max(260, (A.clientWidth || 340) - 8))}</div></div>` : html`<p class="hint intro-wait">${t2("introWait")}</p>` : "";
    setHtml(
      nav,
      html`${prev}<p class="intro-err" id="introErr" role="alert">${esc(S.introErr || "")}</p>
  <div class="intro-bar"><button type="button" class="btn" data-intro="back" ${n === 1 ? "hidden" : ""}>${t2("introBack")}</button>
  <span class="intro-step">${t2("introStep", { n, name: t2(STEP_NAMES()[n - 1]) })}</span>
  <button type="button" class="btn primary" data-intro="next">${t2(n === 4 ? "introDone" : "introNext")}</button></div>
  <button type="button" class="linkbtn intro-skip" data-intro="skip">${t2("introSkip")}</button>`
    );
  }
  function introGo(n) {
    S.intake = n;
    S.introErr = "";
    renderSetup();
    const A = $("#setup");
    if (A && A.scrollIntoView) A.scrollIntoView({ block: "start" });
  }
  function newPlan() {
    flushSave();
    const go = () => {
      S.nameAuto = true;
      S.volSug = null;
      S.fromExample = false;
      S.inputs = BLANK_INPUTS();
      S.types = BLANK_TYPES();
      S.planId = uid2();
      S.savedAt = null;
      S.isExample = false;
      S.dirty = false;
      S.pendingRegen = false;
      S.name = cap2(t2("blockName", { lbl: t2("lhm") }));
      $("#planName").value = S.name;
      S.intake = phoneLayout() ? 1 : 0;
      S.introErr = "";
      regen();
      renderSetup();
      renderPlan();
      setStatus(t2("notSaved"));
      if (S.intake) setTab("setup");
    };
    if (S.dirty && S.savedAt === null && !S.isExample) confirmBox(t2("newQ"), t2("newT"), t2("startNew"), go);
    else go();
  }
  function initIntro() {
    $("#setup").addEventListener("click", (e) => {
      const c = e.target.closest(".icard"), b = e.target.closest("[data-intro]");
      if (c && c.dataset.goal && S.intake === 1) {
        introGo(2);
        return;
      }
      if (!b) return;
      const a = b.dataset.intro, n = S.intake || 0;
      if (a === "quick") {
        openQuick();
        return;
      }
      if (a === "back" && n > 1) introGo(n - 1);
      else if (a === "skip") {
        S.intake = 0;
        S.introErr = "";
        renderSetup();
      } else if (a === "next") {
        const need = missingSetup2(S.inputs).filter((k) => SETUP_STEP2[k] === n);
        if (need.length) {
          S.introErr = t2("introNeed") + " " + need.map((k) => t2(k)).join(" ");
          renderIntro();
          return;
        }
        if (n < 4) introGo(n + 1);
        else {
          S.intake = 0;
          S.introErr = "";
          renderSetup();
          renderPlan();
          setTab("plan");
        }
      }
    });
  }

  // src/sheet.js
  var sheetOpener = null;
  function syncMode() {
    const on = !S.intake && !missingSetup2(S.inputs).length;
    document.body.classList.toggle("planmode", on);
    if (!on && document.body.classList.contains("sheet")) closeSheet(true);
  }
  var INERT = () => [...$$("header.top,#mtabs,#mbar,main.plan,footer.ver,.hello")];
  function openSheet() {
    if (!document.body.classList.contains("planmode") || !phoneLayout()) return false;
    if (document.body.classList.contains("sheet")) return true;
    const a = document.activeElement;
    sheetOpener = a && a !== document.body ? a : lastTrigger && lastTrigger.isConnected && !lastTrigger.closest("#setup") ? lastTrigger : $("#btnEditPlan");
    const A = $("#setup");
    document.body.classList.add("sheet");
    $("#sheetBg").hidden = false;
    A.setAttribute("role", "dialog");
    A.setAttribute("aria-modal", "true");
    A.setAttribute("aria-labelledby", "sheetTitle");
    A.tabIndex = -1;
    A.scrollTop = 0;
    INERT().forEach((el) => el.inert = true);
    A.focus({ preventScroll: true });
    return true;
  }
  function closeSheet(quiet) {
    if (!document.body.classList.contains("sheet")) return;
    const A = $("#setup");
    document.body.classList.remove("sheet");
    $("#sheetBg").hidden = true;
    ["role", "aria-modal", "aria-labelledby"].forEach((k) => A.removeAttribute(k));
    A.removeAttribute("tabindex");
    INERT().forEach((el) => el.inert = false);
    const o = sheetOpener;
    sheetOpener = null;
    if (!quiet && o && o.isConnected) o.focus({ preventScroll: true });
  }
  function setTab(tab) {
    if (document.body.classList.contains("planmode") && phoneLayout()) {
      if (tab === "setup") openSheet();
      else closeSheet();
      return;
    }
    document.body.dataset.tab = tab;
    $$("#mtabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    const L = $(".layout"), m = $("#mtabs");
    if (L && m) {
      const top = L.getBoundingClientRect().top;
      const h = m.offsetHeight + 12;
      if (top < h) window.scrollTo({ top: Math.max(0, top + scrollY - h) });
    }
  }
  function initSheet() {
    $("#btnEditPlan").addEventListener("click", openSheet);
    $("#btnSheetDone").addEventListener("click", () => closeSheet());
    $("#sheetBg").addEventListener("click", () => closeSheet());
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Escape" || !document.body.classList.contains("sheet") || $("#modalRoot").firstChild) return;
        closeSheet();
      },
      true
    );
    document.addEventListener("click", (e) => {
      const b = (
        /** @type {HTMLElement|null} */
        /** @type {HTMLElement} */
        e.target.closest("[data-tab],[data-tabgo]")
      );
      if (b && (b.closest("#mtabs") || b.dataset.tabgo)) setTab(b.dataset.tab || b.dataset.tabgo);
    });
    $("#btnPlans").onclick = openPlans;
    $("#btnNew").onclick = newPlan;
    $("#btnQuick").onclick = () => openQuick();
  }

  // src/plan-view.js
  var phaseColor = (p) => `var(--ph-${p})`;
  var phaseText = (p) => `var(--ph-${p}-t)`;
  function profileSVG(weeks, W) {
    W = Math.max(Math.round(W || 600), 240);
    const H = 186, pl = 30, pb = 22, pt = 34;
    const max = Math.max(...weeks.map((w) => w.sessions.reduce((a, s) => a + s.km, 0)), 10);
    const top = Math.ceil(max / 10) * 10;
    const bw = (W - pl - 4) / weeks.length;
    const every = bw >= 22 ? 1 : bw >= 12 ? 2 : 4;
    const y = (v) => pt + (H - pt - pb) * (1 - v / top);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const nowI = weeks.findIndex((w) => {
      const st = parseISO2(w.start);
      return today >= st && today < addDays2(st, 7);
    });
    let g = [];
    for (let i = 0; i < weeks.length; ) {
      let j = i;
      while (j + 1 < weeks.length && weeks[j + 1].phase === weeks[i].phase) j++;
      const ph = weeks[i].phase, x0 = pl + i * bw, wd = (j - i + 1) * bw, lbl = phaseLbl(ph);
      g.push(
        html`<rect class="band" data-phase="${esc(ph)}" x="${x0 + 1}" y="${pt - 22}" width="${Math.max(0, wd - 2)}" height="${H - pb - pt + 22}" rx="4" fill="${phaseColor(ph)}" opacity=".13"/>`
      );
      if (wd >= lbl.length * 6.6 + 10)
        g.push(
          html`<text class="band-lbl" x="${x0 + 6}" y="${pt - 9}" style="fill:${phaseText(ph)};font-weight:600">${esc(lbl)}</text>`
        );
      i = j + 1;
    }
    for (let t3 = 0; t3 <= top; t3 += top > 60 ? 20 : 10) {
      g.push(
        html`<line x1="${pl}" x2="${W}" y1="${y(t3)}" y2="${y(t3)}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${y(t3) + 4}" text-anchor="end">${t3}</text>`
      );
    }
    weeks.forEach((w, i) => {
      const km = w.sessions.reduce((a, s) => a + s.km, 0);
      const x = pl + i * bw + bw * 0.14, bwi = bw * 0.72;
      const lk = (w.sessions.find((s) => s.kind === "long" || s.kind === "race") || {}).km || 0;
      const race = w.sessions.some((s) => s.kind === "race"), now = i === nowI;
      const lab = i % every === 0 || i === weeks.length - 1 || race || now;
      const extra = [w.cutback ? t2("cutback") : "", now ? t2("svgNow") : "", race ? t2("svgRace") : ""].filter(Boolean).join(", ");
      g.push(html`<g${race ? html` class="race"` : ""}${now ? html` class="now"` : ""}><title>${esc(t2("svgTitle", { n: w.n, km: km.toFixed(1), phase: phaseLbl(w.phase) }))}${extra ? " (" + esc(extra) + ")" : ""}</title><rect x="${x}" y="${y(km)}" width="${bwi}" height="${Math.max(0, y(0) - y(km))}" rx="2" fill="${phaseColor(w.phase)}" opacity="${w.cutback ? 0.55 : 1}"/>
  ${lk ? html`<rect x="${x}" y="${y(lk)}" width="${bwi}" height="2" fill="var(--ink)" opacity=".55"/>` : ""}
  ${lab ? html`<text x="${x + bwi / 2}" y="${y(km) - 5}" text-anchor="middle">${Math.round(km)}</text>` : ""}
  ${race ? html`<path class="flag" d="M${x + bwi / 2 - 4} ${y(km) - 16}v-14l10 4l-10 4" fill="var(--race)" stroke="var(--race)" stroke-width="1.5" stroke-linejoin="round"/>` : ""}
  ${lab ? html`<text x="${x + bwi / 2}" y="${H - 6}" text-anchor="middle"${now ? html` style="fill:var(--ink);font-weight:700"` : ""}>${w.n}</text>` : ""}</g>`);
    });
    if (nowI >= 0) {
      const st = parseISO2(weeks[nowI].start), d = Math.round((+today - +st) / 864e5), xn = pl + nowI * bw + bw * (d + 0.5) / 7;
      g.push(
        html`<line class="today-mark" x1="${xn}" x2="${xn}" y1="${pt - 22}" y2="${H - pb}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="3 3" opacity=".8"><title>${esc(cap2(t2("svgToday")))}</title></line>`
      );
    }
    return html`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t2("svgAria")}">${g}</svg>`;
  }
  var chartW = 0;
  function drawProfile() {
    const el = $("#profileChart");
    if (!el || !S.plan) return;
    chartW = el.clientWidth;
    setHtml(el, profileSVG(S.plan.weeks, chartW));
  }
  function fieldLabel(f) {
    const k = {
      date: S.inputs.goal === "fitness" ? "startDate" : "raceDate",
      weeks: "weeks",
      curVol: "curVol",
      curLong: "curLong",
      runs: "runsPerWeek",
      days: "runningDays",
      longDay: "longDay",
      types: "secTypes",
      pace: "recTime"
    }[f];
    return t2(k).replace(/\s*\(.*\)$/, "");
  }
  function renderFieldWarns(items) {
    for (const f of SETUP_FIELDS2) {
      const el = $("#fw-" + f);
      if (!el) continue;
      const ms = items.filter((x) => x.f === f).map((x) => x.m);
      el.hidden = !ms.length;
      setHtml(el, htmlJoin(ms.map((m) => html`<p>${esc(m)}</p>`)));
    }
  }
  var nameCtx = null;
  function fitName() {
    const el = (
      /** @type {HTMLInputElement} */
      $("#planName")
    );
    if (!el) return;
    try {
      nameCtx = nameCtx || document.createElement("canvas").getContext("2d");
      const cs = getComputedStyle(el);
      nameCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      el.style.width = Math.min(320, Math.ceil(nameCtx.measureText(el.value || "").width) + 18) + "px";
    } catch (_) {
    }
  }
  function renderPlan() {
    fitName();
    const P = S.plan, I = S.inputs;
    if (!P) return;
    syncMode();
    const miss = missingSetup2(I);
    if (miss.length) {
      renderFieldWarns([]);
      const h0 = $("#hello");
      if (h0) clearHtml(h0);
      setHtml(
        $("#plan"),
        html`<div class="banner info"><span>${esc(t2("needTitle"))}</span><ul>${htmlJoin(miss.map((k) => html`<li>${esc(t2(k))}</li>`))}</ul><button class="btn sm m-only" type="button" data-tabgo="setup">${t2("editSettings")}</button></div><p class="qempty">${t2("qwEmpty")} <button type="button" class="linkbtn" data-act="quick">${t2("qwEmptyGo")}</button></p>`
      );
      return;
    }
    renderHello();
    const weeks = P.weeks;
    const totals = weeks.map((w) => w.sessions.reduce((a, s) => a + s.km, 0));
    const longest = Math.max(...weeks.flatMap((w) => w.sessions.filter((s) => s.kind === "long").map((s) => s.km)), 0);
    const Pg = paces2(I);
    const items = warningItems2(I, S.types, P, S.edited);
    renderFieldWarns(items);
    const warns = items.filter((x) => !x.f).map((x) => x.m);
    const setupF = [...new Set(items.filter((x) => x.f && (x.f !== "pace" || badRaceTime2(I))).map((x) => x.f))];
    let h = [];
    if (S.isExample)
      h.push(
        html`<div class="banner info"><span>${t2("exampleBanner")}</span><button class="btn sm m-only" type="button" data-tabgo="setup">${t2("editSettings")}</button></div>`
      );
    if (!S.isExample && backupDue())
      h.push(
        html`<div class="banner info" id="bkBanner"><span>${t2("bkBanner")}</span><button class="btn sm primary" data-act="bksave">${t2("bkSave")}</button><button class="btn sm ghost" data-act="bklater">${t2("bkLater")}</button></div>`
      );
    if (S.pendingRegen)
      h.push(
        html`<div class="banner"><span>${t2("pendingBanner")}</span><button class="btn sm primary" data-act="regen">${t2("rebuildPlan")}</button><button class="btn sm ghost" data-act="keep">${t2("keepEdits")}</button></div>`
      );
    if (setupF.length)
      h.push(
        html`<div class="banner" id="setupWarn"><span>${esc(t2("setupWarn", { f: setupF.map(fieldLabel).join(", ") }))}</span><button class="btn sm m-only" type="button" data-tabgo="setup">${t2("editSettings")}</button></div>`
      );
    if (warns.length)
      h.push(html`<div class="banner"><ul>${htmlJoin(warns.map((w) => html`<li>${esc(w)}</li>`))}</ul></div>`);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const raceI = weeks.findIndex((w) => w.sessions.some((s) => s.kind === "race")), endI = raceI >= 0 ? raceI : weeks.length - 1;
    const nowI = weeks.findIndex((w) => {
      const st = parseISO2(w.start);
      return today >= st && today < addDays2(st, 7);
    });
    const toGo = today < parseISO2(weeks[0].start) ? endI + 1 : nowI >= 0 ? Math.max(0, endI - nowI + 1) : 0;
    const u = (x) => html`<small>${x}</small>`;
    const hm2 = (sec) => {
      sec = Math.round(sec / 60) * 60;
      const h2 = Math.floor(sec / 3600), m = Math.round(sec % 3600 / 60);
      return h2 ? html`${h2}${u(t2("uH"))}${String(m).padStart(2, "0")}` : html`${m}${u(t2("uMin"))}`;
    };
    h.push(html`<div class="summary">
  <div class="stat" data-stat="togo"><b>${toGo}</b><span>${t2(toGo === 1 ? "sToGo1" : "sToGo")}</span></div>
  <div class="stat" data-stat="peak"><b>${Math.round(Math.max(...totals))}${u("km")}</b><span>${t2("sPeak")}</span></div>
  <div class="stat" data-stat="long"><b>${longest}${u("km")}</b><span>${t2("sLongest")}</span></div>
  ${P.meta.raceSec ? html`<div class="stat" data-stat="target" title="${esc(fmtDur2(P.meta.raceSec))}"><b>${hm2(P.meta.raceSec)}</b><span>${esc(cap2(t2("sTarget", { lbl: distLabel2(I) })))}</span></div>` : ""}
</div>`);
    h.push(renderToday());
    h.push(
      html`<div class="profile"><div class="profile-head"><h2>${t2("loadProfile")}</h2><div class="legend"><span><i style="background:var(--ink);height:2px;opacity:.55;vertical-align:3px"></i>${t2("longRunLeg")}</span></div></div><div class="chart" id="profileChart"></div></div>`
    );
    h.push(html`<div class="toolbar">
  <span class="spacer"></span>
  <button class="btn sm" data-act="quick">${t2("qwOpen")}</button>
  <button class="btn sm" data-act="allwatch">${t2("sendAll")}</button>
  <button class="btn sm" data-act="ics">${t2("exportCal")}</button>
  <span class="exp"><select id="expFmt" aria-label="${esc(t2("exportFmt"))}"><option value="csv" ${S.exportFmt === "csv" ? "selected" : ""}>${t2("fmtCsv")}</option><option value="pdf" ${S.exportFmt === "pdf" ? "selected" : ""}>${t2("fmtPdf")}</option></select><button class="btn sm" data-act="export">${t2("exportGo")}</button></span>
  <button class="btn sm ghost" data-act="rebuild">${t2("rebuildFrom")}</button>
</div>`);
    const pastN = nowI > 0 ? nowI : 0;
    if (pastN)
      h.push(
        html`<button type="button" class="btn sm ghost mpast" data-act="past" aria-expanded="${!!S.showPast}">${t2(S.showPast ? "hidePast" : "showPast", { n: pastN })}</button>`
      );
    h.push(
      html`<div class="grid-wrap${S.showPast ? " show-past" : ""}"><table class="grid"><thead><tr><th class="wk">${t2("week")}</th>${htmlJoin(DAYS.map((d) => html`<th>${d}</th>`))}</tr></thead><tbody>`
    );
    weeks.forEach((w, wi) => {
      const st = parseISO2(w.start), en = addDays2(st, 6);
      const rc = (wi < pastN ? " past" : "") + (wi === nowI ? " now" : "");
      h.push(html`<tr class="wrow${w.cutback ? " cutback" : ""}${rc}"><td class="wk"><div class="wkcell"><span class="bar" style="background:${phaseColor(w.phase)}"></span><div>
    <div class="n">${t2("wAbbr")}${esc(w.n)}</div><div class="meta"><span>${fmtShort(st)} – ${fmtShort(en)}</span><span class="ph" data-cut="${t2("cutback")}" style="color:${phaseText(w.phase)}">${phaseLbl(w.phase)}</span><span class="km">${RUN_UNIT === "t" ? estDur(w.sessions.reduce((a, s) => a + sesSec(s, Pg), 0)) : totals[wi].toFixed(1) + " km"}</span></div>
    <button class="btn sm ghost wbtn" data-act="wwatch" data-w="${wi}" aria-label="${esc(t2("sendWatchWeek", { n: w.n }))}" title="${esc(t2("sendWatchWeek", { n: w.n }))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-3h4l1 3M9 18l1 3h4l1-3M12 10v2l1.5 1"/></svg>${t2("watchShort")}</button></div></div></td>`);
      for (let d = 0; d < 7; d++) {
        const ss = w.sessions.filter((s) => s.day === d);
        h.push(
          html`<td class="day" data-w="${wi}" data-d="${d}" data-dl="${esc(DAYS[d])}">${ss.length ? htmlJoin(ss.map((s) => html`<button type="button" class="ses ${s.kind === "race" ? "race" : ""}" draggable="true" data-w="${wi}" data-s="${s.id}" style="--k:${effColor(sesEffort(s))};--kt:${effText(sesEffort(s))}"><span class="t">${esc(s.name)}</span><span class="k">${sesAmt(s, Pg)}</span><span class="d">${esc(s.desc)}</span>${s.note ? html`<span class="nb">${t2("noteBadge")}</span>` : ""}</button>`)) : html`<div class="empty" tabindex="0" role="button" aria-label="${esc(t2("rest") + " " + t2("addRun") + " \xB7 " + t2("eTitle", { n: w.n, day: DAYS[d] }))}" data-act="add" data-w="${wi}" data-d="${d}"><span>${t2("rest")}</span><span class="plus">${t2("addRun")}</span></div>`}</td>`
        );
      }
      h.push(html`</tr>`);
      weekChecks2(w, I, weeks[wi - 1]).forEach((c) => {
        h.push(
          html`<tr class="wwarn${rc}" data-check="${c.k}"><td colspan="8"><p><b>${t2("wkWarn")}</b>${esc(c.txt)}</p></td></tr>`
        );
      });
      if (w.note) h.push(html`<tr class="wnote${rc}"><td colspan="8"><p><b>${t2("note")}</b>${esc(w.note)}</p></td></tr>`);
    });
    h.push(html`</tbody></table></div>`);
    setHtml($("#plan"), h);
    drawProfile();
    renderWx();
    wxLoad(false);
  }
  function initPlanView() {
    try {
      new ResizeObserver(() => {
        const el = $("#profileChart");
        if (el && Math.abs(el.clientWidth - chartW) > 4) drawProfile();
      }).observe($("#plan"));
    } catch (_) {
    }
  }
  function renderHello() {
    const el = $("#hello");
    if (!el) return;
    const P = S.plan, I = S.inputs;
    const today = /* @__PURE__ */ new Date();
    today.setHours(12, 0, 0, 0);
    const race = parseISO2(I.raceDate);
    const days = Math.round((+race - +today) / 864e5);
    const lbl = distLabel2(I);
    let line;
    if (I.goal === "fitness") {
      const st0 = parseISO2(P.weeks[0].start), end = addDays2(st0, 7 * P.weeks.length - 1);
      const wi = P.weeks.findIndex((w) => {
        const st = parseISO2(w.start);
        return today >= st && today < addDays2(st, 7);
      });
      if (today < st0) line = t2("hFitStarts", { n: P.weeks.length, d: fmtDate2(st0) });
      else if (wi < 0) line = t2("hFitDone", { n: P.weeks.length, d: fmtDate2(end) });
      else {
        const w = P.weeks[wi];
        const tdow = dow2(today);
        const next = w.sessions.find((s) => s.day >= tdow) || P.weeks[wi + 1] && P.weeks[wi + 1].sessions[0];
        const when = next ? next.day === tdow && w.sessions.includes(next) ? t2("today") : DAYS[next.day] : "";
        line = html`${t2("hFitIn", { n: w.n, t: P.weeks.length, phase: phaseLbl(w.phase), cut: w.cutback ? t2("hCut") : "" })}${next ? t2("hNext", { when, name: esc(next.name.toLowerCase()), amt: sesAmt(next) }) : ""}`;
      }
    } else if (days < 0) {
      const wi = P.weeks.findIndex((w2) => {
        const st = parseISO2(w2.start);
        return today >= st && today < addDays2(st, 7);
      });
      const w = wi >= 0 ? P.weeks[wi] : null;
      if (w && w.phase === "recovery") {
        const tdow = dow2(today), rw = P.weeks.filter((x) => x.phase === "recovery");
        const next = w.sessions.find((s) => s.day >= tdow) || P.weeks[wi + 1] && P.weeks[wi + 1].sessions[0];
        const when = next ? next.day === tdow && w.sessions.includes(next) ? t2("today") : DAYS[next.day] : "";
        line = html`${t2("hRecIn", { lbl: esc(lbl), k: rw.indexOf(w) + 1, r: rw.length })}${next ? t2("hNext", { when, name: esc(next.name.toLowerCase()), amt: sesAmt(next) }) : ""}`;
      } else line = t2("hPast", { lbl: esc(lbl), d: fmtDate2(race) });
    } else if (days === 0) line = t2("hToday", { lbl: esc(lbl) });
    else {
      const wi = P.weeks.findIndex((w) => {
        const st = parseISO2(w.start);
        return today >= st && today < addDays2(st, 7);
      });
      const head = t2(days === 1 ? "hDay1" : "hDays", { n: days, lbl: esc(lbl), d: fmtDate2(race) });
      if (wi < 0) {
        line = html`${head} ${t2("hStarts", { d: fmtDate2(parseISO2(P.weeks[0].start)) })}`;
      } else {
        const w = P.weeks[wi];
        const tdow = dow2(today);
        const next = w.sessions.find((s) => s.day >= tdow) || P.weeks[wi + 1] && P.weeks[wi + 1].sessions[0];
        const when = next ? next.day === tdow && w.sessions.includes(next) ? t2("today") : DAYS[next.day] : "";
        line = html`${head} ${t2("hInWeek", {
          n: w.n,
          t: P.weeks.filter((x) => x.phase !== "recovery").length,
          phase: phaseLbl(w.phase),
          cut: w.cutback ? t2("hCut") : ""
        })}${next ? t2("hNext", { when, name: esc(next.name.toLowerCase()), amt: sesAmt(next) }) : ""}`;
      }
    }
    const R = I.race;
    let cd = html``;
    if (I.goal !== "fitness" && R && R.name && days >= 0) {
      const nm = R.url ? html`<a class="rn" href="${esc(R.url)}" target="_blank" rel="noopener">${esc(R.name)}</a>` : html`<span class="rn">${esc(R.name)}</span>`;
      cd = html`<div class="countdown"><div class="num">${days}<small>${days === 1 ? t2("dayOne") : t2("dayMany")}</small></div>${nm}<span class="rm">${R.city ? esc(R.city) + " \xB7 " : ""}${fmtDay(race)} · ${esc(lbl)}</span></div>`;
    }
    setHtml(el, html`<div class="txt"><p class="lead">${line}</p></div>${cd}`);
  }

  // src/storage.js
  function snapshot() {
    return { name: S.name, inputs: S.inputs, types: S.types, plan: S.plan, edited: S.edited, updatedAt: Date.now() };
  }
  function setStatus(t3) {
    $("#saveStatus").textContent = t3;
    syncSaveUi();
  }
  var saveTimer = null;
  var canAutosave = () => !S.fromExample && !missingSetup2(S.inputs).length;
  function syncSaveUi() {
    $("#btnSave").hidden = !S.fromExample;
  }
  function markDirty() {
    S.dirty = true;
    if (S.savedAt || canAutosave()) {
      setStatus(t2("unsaved"));
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        savePlan(true);
      }, 1500);
    }
  }
  async function savePlan(auto) {
    if (missingSetup2(S.inputs).length) {
      if (!auto) toast(t2("needTitle"));
      return;
    }
    cancelSave();
    const data = snapshot();
    try {
      setStatus(t2("saving"));
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
      setStatus(t2("savedLocal") + " \xB7 " + (/* @__PURE__ */ new Date()).toLocaleTimeString(LOC(), { hour: "2-digit", minute: "2-digit" }));
      if (!auto) {
        toast(t2("planSaved"));
        renderPlan();
      }
    } catch (e) {
      setStatus(t2("notSaved"));
      toast(t2("saveFail"));
    }
  }
  var BK_DAY = 864e5;
  function bkGet() {
    try {
      const o = JSON.parse(localStorage.getItem("bb-backup") || "null");
      return o && typeof o === "object" ? o : {};
    } catch (_) {
      return {};
    }
  }
  function bkSet(o) {
    try {
      localStorage.setItem("bb-backup", JSON.stringify(o));
    } catch (_) {
    }
  }
  function bkNoteSave() {
    const b = bkGet();
    if (!(b.since > 0)) {
      b.since = Date.now();
      bkSet(b);
    }
  }
  function backupDue() {
    const b = bkGet(), now = Date.now();
    return S.saved.length > 0 && b.since > 0 && now - b.since >= 7 * BK_DAY && !(b.snooze > now);
  }
  function exportAllPlans() {
    saveFile(
      "block-builder-plans-" + iso2(/* @__PURE__ */ new Date()) + ".json",
      new Blob([JSON.stringify({ app: "block-builder", version: 1, plans: lsAll() }, null, 1)], {
        type: "application/json"
      })
    );
    bkSet({ at: Date.now() });
  }
  var persistAsked = false;
  function askPersist() {
    if (persistAsked) return;
    persistAsked = true;
    try {
      const st = navigator.storage;
      if (st && st.persist) st.persist().catch(() => {
      });
    } catch (_) {
    }
  }
  function lsAll() {
    try {
      return JSON.parse(localStorage.getItem("bb-plans") || "{}") || {};
    } catch (_) {
      return {};
    }
  }
  function refreshLocalList() {
    const all = lsAll();
    S.saved = Object.entries(all).filter(([id]) => nId(id)).map(([id, d]) => {
      const n = normalizeSaved(d);
      return n && { id, ...n };
    }).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  function flushSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    if (S.dirty && (S.savedAt || canAutosave())) savePlan(true);
  }
  function cancelSave() {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  function loadPlan(p) {
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
      t2("savedLocal") + " \xB7 " + new Date(p.updatedAt).toLocaleDateString(LOC(), { day: "numeric", month: "short" })
    );
    rememberPlan();
  }
  function rememberPlan() {
    try {
      localStorage.setItem("bb-last", S.planId);
    } catch (_) {
    }
  }
  function lastPlan() {
    let id = null;
    try {
      id = localStorage.getItem("bb-last");
    } catch (_) {
    }
    return S.saved.find((x) => x.id === id) || S.saved[0] || null;
  }
  function openPlans() {
    const list = S.saved;
    const bkAt = bkGet().at;
    modal(
      html`<h2>${t2("myPlans")}</h2><p class="hint" style="margin:0">${t2("localOnly")}</p><p class="hint" id="bkLast" style="margin:0">${bkAt > 0 ? t2("bkLast", { d: new Date(bkAt).toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" }) }) : t2("bkNever")}</p>
<div class="plans-list">${list.length ? htmlJoin(list.map((p) => html`<div class="pl ${p.id === S.planId ? "cur" : ""}"><div class="info"><b>${esc(p.name)}</b><span>${esc(cap2(t2(p.inputs && p.inputs.goal === "fitness" ? "planMetaFit" : "planMeta", { lbl: p.inputs ? distLabel2(p.inputs) : "", w: p.plan ? p.plan.weeks.length : "?", d: p.inputs ? fmtDate2(parseISO2(p.inputs.goal === "fitness" ? p.plan && p.plan.meta.start || p.inputs.startDate : p.inputs.raceDate)) : "" })))}</span></div><button class="btn sm" data-open="${p.id}">${t2("open")}</button><button class="btn sm ghost" data-delp="${p.id}">${t2("del")}</button></div>`)) : html`<p class="hint" style="margin:0">${t2("noPlans")}</p>`}</div>
<div class="actions"><button class="btn left" id="pImport">${t2("importPlans")}</button><button class="btn" id="pExport" ${list.length ? "" : "disabled"}>${t2("bkSave")}</button><button class="btn" id="pClose">${t2("close")}</button></div>`,
      (m) => {
        m.querySelector("#pClose").onclick = closeModal;
        m.querySelector("#pExport").onclick = () => {
          exportAllPlans();
          const l = m.querySelector("#bkLast");
          if (l)
            l.textContent = t2("bkLast", {
              d: (/* @__PURE__ */ new Date()).toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" })
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
              const all = lsAll();
              let n = 0, copies = 0, same = 0, valid = 0, reopen = false;
              for (const [id0, p] of Object.entries(src)) {
                const c = normalizeSaved(p);
                if (!c) continue;
                valid++;
                const id = nId(id0) || uid2();
                const here = all[id] ? normalizeSaved(all[id]) : null;
                if (!here || c.updatedAt > here.updatedAt) {
                  all[id] = c;
                  n++;
                  if (here && id === S.planId) reopen = true;
                } else if (c.updatedAt === here.updatedAt && JSON.stringify(c) === JSON.stringify(here)) same++;
                else {
                  all[uid2()] = { ...c, name: nStr(t2("copyName", { name: c.name }), 120) };
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
                n ? t2("imported", { n }) + (copies ? " " + t2("impCopy", { n: copies }) : "") + (same ? " " + t2("impSame", { n: same }) : "") : t2("impNone", { n: same })
              );
              openPlans();
            } catch (_) {
              toast(t2("importFail"));
            }
          };
          inp.click();
        };
        m.addEventListener("click", (e) => {
          const o = e.target.closest("[data-open]"), d = e.target.closest("[data-delp]");
          if (o) {
            flushSave();
            const p = S.saved.find((x) => x.id === o.dataset.open);
            closeModal();
            if (p) loadPlan(p);
          }
          if (d) {
            const p = S.saved.find((x) => x.id === d.dataset.delp);
            closeModal();
            confirmBox(t2("delQ"), t2("delT", { name: p.name }), t2("del"), async () => {
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
                  S.planId = uid2();
                  setStatus(t2("notSaved"));
                }
                toast(t2("deleted"));
              } catch (_) {
                toast(t2("delFail"));
              }
            });
          }
        });
      }
    );
  }
  function initStorage() {
    addEventListener("pagehide", flushSave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushSave();
    });
    addEventListener("beforeunload", (e) => {
      flushSave();
      if (S.dirty && !S.savedAt && !S.isExample && !missingSetup2(S.inputs).length) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  // src/prefs.js
  var RUN_UNIT = (() => {
    try {
      if (localStorage.getItem("bb-run-unit") === "t") return "t";
    } catch (_) {
    }
    return "d";
  })();
  function useRunUnit(u) {
    RUN_UNIT = u;
    try {
      localStorage.setItem("bb-run-unit", u);
    } catch (_) {
    }
  }
  function applyStatic() {
    document.documentElement.lang = LANG;
    $$("[data-i18n]").forEach((el) => {
      el.textContent = t2(el.dataset.i18n);
    });
    $$("[data-i18n-html]").forEach((el) => {
      setHtml(el, html`${t2(el.dataset.i18nHtml)}`);
    });
    $$("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t2(el.dataset.i18nPh);
    });
    $$("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t2(el.dataset.i18nAria));
    });
    $("#langSel").value = LANG;
    syncTheme();
    syncRunUnit();
  }
  function syncRunUnit() {
    $$("#runUnitSeg [data-run-unit]").forEach(
      (b) => b.setAttribute("aria-pressed", String(b.dataset.runUnit === RUN_UNIT))
    );
  }
  function syncTheme() {
    const v = document.documentElement.dataset.theme || "dark";
    $$("#themeSeg [data-theme-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeV === v)));
  }
  function setLang(l) {
    if (l === LANG || !I18N[l]) return;
    const prevName = defaultName();
    const from = LANG;
    useLang(l);
    translateTypes(S.types, from, l);
    if (S.name === prevName || S.name === I18N[from].trainingBlock) {
      S.name = S.name === prevName ? defaultName() : t2("trainingBlock");
      $("#planName").value = S.name;
    }
    if (S.edited) {
      toast(t2("langEdited"));
    } else {
      const wasDirty = S.dirty;
      regen();
      if (S.savedAt) markDirty();
      else S.dirty = wasDirty;
    }
    applyStatic();
    renderSetup();
    renderPlan();
    const st = $("#saveStatus");
    if (st && !S.savedAt) setStatus(t2("notSaved"));
  }
  function setPrefs(open, focusBack) {
    const P = $("#prefsPanel"), B = $("#btnPrefs");
    P.hidden = !open;
    B.setAttribute("aria-expanded", String(open));
    if (open) {
      placePrefs();
      (P.querySelector('[aria-pressed="true"]') || P.querySelector("button,select")).focus({ preventScroll: true });
    } else if (focusBack) B.focus({ preventScroll: true });
  }
  function placePrefs() {
    const P = $("#prefsPanel");
    P.style.right = "";
    const r = P.getBoundingClientRect(), vw = document.documentElement.clientWidth, m = 8;
    const dx = r.left < m ? m - r.left : r.right > vw - m ? vw - m - r.right : 0;
    if (dx) P.style.right = `${-dx}px`;
  }
  var replacePrefs = () => {
    if (!$("#prefsPanel").hidden) placePrefs();
  };
  function initPrefs() {
    $("#langSel").addEventListener("change", (e) => setLang(e.target.value));
    $("#themeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("[data-theme-v]");
      if (!b) return;
      const v = b.dataset.themeV;
      document.documentElement.dataset.theme = v;
      try {
        localStorage.setItem("bb-theme", v);
      } catch (_) {
      }
      syncTheme();
    });
    $("#runUnitSeg").addEventListener("click", (e) => {
      const b = (
        /** @type {HTMLElement | null} */
        /** @type {HTMLElement} */
        e.target.closest("[data-run-unit]")
      );
      if (!b || b.dataset.runUnit === RUN_UNIT) return;
      useRunUnit(b.dataset.runUnit === "t" ? "t" : "d");
      syncRunUnit();
      renderPlan();
    });
    window.addEventListener("resize", replacePrefs);
    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver(replacePrefs);
      for (const el of $("header.top").children) if (el.id !== "prefs") ro.observe(el);
    }
    $("#btnQuickGoal").addEventListener("click", () => openQuick());
    $("#btnPrefs").addEventListener("click", () => setPrefs($("#prefsPanel").hidden));
    $("#prefs").addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#prefsPanel").hidden) {
        e.stopPropagation();
        setPrefs(false, true);
      }
    });
    $("#prefs").addEventListener("focusout", (e) => {
      if (e.relatedTarget && !$("#prefs").contains(e.relatedTarget)) setPrefs(false);
    });
    document.addEventListener("click", (e) => {
      if (!$("#prefsPanel").hidden && !/** @type {HTMLElement} */
      e.target.closest("#prefs")) setPrefs(false);
    });
  }

  // src/app.js
  var VERSION = "1.14.3";
  $("#appVersion").textContent = "Block Builder v" + VERSION;
  BBEngine.setLocale({ t: t2, days: () => DAYS, fmtDate: fmtDate2 });
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
  } catch (_) {
  }
  $("#planName").addEventListener("change", (e) => {
    S.nameAuto = !e.target.value.trim();
    S.name = e.target.value.trim() || t2("trainingBlock");
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
  setStatus(t2("notSaved"));
  refreshLocalList();
  if (S.saved.length && !(bkGet().since > 0) && !(bkGet().at > 0)) bkNoteSave();
  {
    const last = lastPlan();
    if (last) loadPlan(last);
  }
})();
//# sourceMappingURL=app.js.map
