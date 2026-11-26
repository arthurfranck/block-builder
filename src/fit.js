// @ts-check
/* Garmin FIT workout encoder (BB-76). */

import { paces } from "./engine-api.js";
import { S } from "./state.js";
import { hasPace, PACE_TOL, paceLbl } from "./watch.js";
import { t } from "./i18n.js";

const FIT_CRC = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401, 0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01,
  0x8801, 0x4400,
];
function fitCrc(bytes, crc = 0) {
  for (const b of bytes) {
    let t = FIT_CRC[crc & 0xf];
    crc = (crc >> 4) & 0x0fff;
    crc = crc ^ t ^ FIT_CRC[b & 0xf];
    t = FIT_CRC[crc & 0xf];
    crc = (crc >> 4) & 0x0fff;
    crc = crc ^ t ^ FIT_CRC[(b >> 4) & 0xf];
  }
  return crc;
}
export function fitEncodeWorkout(name, steps) {
  // steps: [{name,dur:'time'|'distance'|'open'|'repeat',val,target:{lo,hi}|null,intensity,repeatFrom,reps}]
  const out = [];
  const push = (...a) => {
    for (const x of a) out.push(x & 0xff);
  };
  const u16 = (v) => [v & 0xff, (v >> 8) & 0xff],
    u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
  const str = (s, n) => {
    const b = Array.from(new TextEncoder().encode(String(s || ""))).slice(0, n - 1);
    while (b.length < n) b.push(0);
    return b;
  };
  // file_id (local 0)
  push(0x40, 0, 0, ...u16(0), 5, 0, 1, 0x00, 1, 2, 0x84, 2, 2, 0x84, 3, 4, 0x8c, 4, 4, 0x86);
  const created = Math.floor(Date.now() / 1000) - 631065600;
  push(0x00, 5, ...u16(255), ...u16(0), ...u32(Math.floor(Math.random() * 0xfffffff) + 1), ...u32(created));
  // workout (local 1)
  push(0x41, 0, 0, ...u16(26), 3, 8, 24, 0x07, 4, 1, 0x00, 6, 2, 0x84);
  push(0x01, ...str(name, 24), 1, ...u16(steps.length));
  // workout_step (local 2)
  push(
    0x42,
    0,
    0,
    ...u16(27),
    9,
    254,
    2,
    0x84,
    0,
    16,
    0x07,
    1,
    1,
    0x00,
    2,
    4,
    0x86,
    3,
    1,
    0x00,
    4,
    4,
    0x86,
    5,
    4,
    0x86,
    6,
    4,
    0x86,
    7,
    1,
    0x00,
  );
  const DUR = { time: 0, distance: 1, open: 5, repeat: 6 };
  steps.forEach((s, i) => {
    let dv = 0xffffffff,
      tt = 2,
      tv = 0,
      lo,
      hi;
    if (s.dur === "time") dv = Math.round(s.val * 1000);
    else if (s.dur === "distance") dv = Math.round(s.val * 100);
    else if (s.dur === "repeat") {
      dv = s.repeatFrom;
      tt = 2;
      tv = s.reps;
    }
    if (s.dur === "repeat") {
      tt = 0xff;
      lo = 0xffffffff;
      hi = 0xffffffff;
    } else if (s.target) {
      tt = 0;
      tv = 0;
      lo = Math.round(s.target.lo * 1000);
      hi = Math.round(s.target.hi * 1000);
    } else {
      lo = 0xffffffff;
      hi = 0xffffffff;
    }
    push(
      0x02,
      ...u16(i),
      ...str(s.name, 16),
      DUR[s.dur],
      ...u32(dv),
      tt,
      ...u32(tv),
      ...u32(lo),
      ...u32(hi),
      s.dur === "repeat" ? 0xff : s.intensity,
    );
  });
  const data = Uint8Array.from(out);
  const hdr = [14, 0x10, ...u16(2132), ...u32(data.length), 0x2e, 0x46, 0x49, 0x54];
  const hc = fitCrc(hdr);
  const header = Uint8Array.from([...hdr, ...u16(hc)]);
  const crc = fitCrc(data, fitCrc(header));
  const file = new Uint8Array(header.length + data.length + 2);
  file.set(header, 0);
  file.set(data, header.length);
  file.set(u16(crc), header.length + data.length);
  return file;
}

export function fitSteps(wp, P) {
  P = P || paces(S.inputs);
  const out = [];
  const goal = (g) => (g[0] === "d" ? { dur: "distance", val: g[1] * 1000 } : { dur: "time", val: g[1] });
  const tgt = (pace) => {
    if (!hasPace(P, pace)) return null;
    const sec = P.sec[pace],
      tol = PACE_TOL[pace];
    return { lo: 1000 / (sec + tol), hi: 1000 / (sec - tol) };
  };
  const lbl = (x) =>
    x.pace ? (hasPace(P, x.pace) ? P.txt[x.pace] : paceLbl(x.pace)) : x.p === "recovery" ? t("recover") : t("run");
  if (wp.wu) out.push({ name: t("warmup"), ...goal(wp.wu), target: null, intensity: 2 });
  for (const b of wp.blocks) {
    const from = out.length;
    for (const x of b.steps)
      out.push({ name: lbl(x), ...goal(x.g), target: tgt(x.pace), intensity: x.p === "recovery" ? 4 : 0 });
    if (b.n > 1) out.push({ name: "", dur: "repeat", repeatFrom: from, reps: b.n });
  }
  if (wp.cd) out.push({ name: t("cooldown"), ...goal(wp.cd), target: null, intensity: 3 });
  return out;
}
