// @ts-check
/* Weather on the Today card: Open-Meteo forecast for the run's hour, no key (BB-76). */

import { html, esc, htmlJoin, setHtml } from "./html.js";
import { LANG, t, LOC } from "./i18n.js";
import { S } from "./state.js";
import { applyHeat } from "./today.js";

export const WX = {
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
  heat: null,
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
  } catch (_) {}
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
  const cloud = (y = 0) =>
    html`<path d="M12 ${30 + y}h17a6 6 0 0 0 0-12 9 9 0 0 0-17 2 5 5 0 0 0 0 10z" fill="var(--surface)" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`;
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
const hm = (s) => String(s).slice(11, 16);
/* BB-11: after a failed forecast request, automatic reloads (every redraw of Today) wait 30 s, doubling with each
 further failure up to 30 min. Choosing a city or the location (force) always tries at once. */
const wxWait = (n) => Math.min(30 * 60e3, 30e3 * 2 ** Math.max(0, n - 1));
export async function wxLoad(force) {
  if (!WX.loc || WX.busy) return;
  if (!force && WX.data && Date.now() - WX.at < 30 * 60e3) return;
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
export async function wxFind(q) {
  q = q.trim();
  if (!q) return;
  WX.busy = true;
  WX.err = "";
  renderWx();
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=${LANG}&format=json`,
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
export function wxGeo() {
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
      { timeout: 10000, maximumAge: 30 * 60e3 },
    );
  } catch (_) {
    fail();
  }
}
function wxBestSlot(D) {
  const c = D.current || {},
    H = D.hourly || {};
  const nowH = String(c.time || "").slice(0, 13);
  const idx = (H.time || [])
    .map((tm, i) => ({ tm, i }))
    .filter((o) => o.tm.slice(0, 13) >= nowH && +o.tm.slice(11, 13) <= 22);
  let best = null;
  if (idx.length > 1)
    for (const o of idx) {
      const p = H.precipitation_probability[o.i] ?? 0;
      if (!best || p < best.p || (p === best.p && H.temperature_2m[o.i] > best.tp))
        best = { i: o.i, p, tp: H.temperature_2m[o.i] };
    }
  return { idx, best };
}
/* heat: feels-like at the driest slot left today (or now). >=22° easy/tempo +10 s/km, >=28° +20 s/km */
function wxHeat(D) {
  if (!D) return null;
  const c = D.current || {},
    H = D.hourly || {};
  const { best } = wxBestSlot(D);
  const at = best && H.apparent_temperature ? H.apparent_temperature[best.i] : c.apparent_temperature;
  if (!isFinite(at)) return null;
  const add = at >= 28 ? 20 : at >= 22 ? 10 : 0;
  return add ? { feels: Math.round(at), add } : null;
}
export function renderWx() {
  const el = document.getElementById("wx");
  if (!el) return;
  const D = WX.data;
  const errMsg =
    WX.err === "blocked"
      ? t("wxBlocked")
      : WX.err === "geo"
        ? t("wxGeoFail")
        : WX.err.startsWith("nocity:")
          ? t("wxNoCity", { q: esc(WX.err.slice(7)) })
          : "";
  const open = WX.open || WX.editing || !!errMsg;
  const city = WX.loc ? esc(WX.loc.name || `${WX.loc.lat.toFixed(2)}, ${WX.loc.lon.toFixed(2)}`) : "";
  const chev = html`<svg class="chev" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let sum, more;
  if (!WX.loc || WX.editing) {
    const sug = (S.inputs.race && S.inputs.race.city) || (WX.loc && WX.loc.name) || "";
    sum = html`${wxIcon(2)}<span>${WX.loc ? html`<b>${t("wxTitle")}</b> · ${city}` : t("wxAdd")}</span>`;
    more = html`<span class="hint">${t("wxSet")}</span>
    <form id="wxForm"><input id="wxQ" aria-label="${esc(t("wxCity"))}" placeholder="${esc(t("wxCityPh"))}" value="${esc(sug)}" autocomplete="address-level2"><button class="btn sm primary" type="submit" ${WX.busy ? "disabled" : ""}>${t("wxGo")}</button></form>
    <div class="wxloc">${navigator.geolocation ? html`<button type="button" class="icon-btn" data-act="wxgeo">${t("wxGeo")}</button>` : ""}${WX.busy ? html`<span>${t("wxLoading")}</span>` : ""}</div>
    ${errMsg ? html`<span class="hint">${errMsg}</span>` : ""}`;
  } else {
    const change = html`<div class="wxloc">${D ? html`<span>${t("wxUpd", { t: new Date(WX.at).toLocaleTimeString(LOC(), { hour: "2-digit", minute: "2-digit" }) })}</span>` : ""}<button type="button" class="icon-btn" data-act="wxedit">${t("wxChange")}</button></div>`;
    if (!D) {
      sum = html`${wxIcon(3)}<span><b>${t("wxTitle")}</b> · ${city}${WX.busy ? ` · ${t("wxLoading")}` : ""}</span>`;
      more = html`${errMsg ? html`<span class="hint">${errMsg}</span>` : ""}${change}`;
    } else {
      const c = D.current || {},
        dd = D.daily || {},
        H = D.hourly || {};
      const { idx, best } = wxBestSlot(D);
      const step = idx.length > 8 ? 2 : 1;
      const hrs = idx.filter((_, j) => j % step === 0);
      const wk = wmoKey(c.weather_code);
      sum = html`${wxIcon(c.weather_code)}<span><b>${Math.round(c.temperature_2m)}°</b> ${esc(t("wmo" + wk).toLowerCase())} · ${t("wxRain", { p: dd.precipitation_probability_max ? (dd.precipitation_probability_max[0] ?? 0) : 0 })}${best ? ` · ${t("wxDriest", { h: hm(H.time[best.i]) })}` : ""} · ${city}</span>`;
      more = html`<div class="wxnow">${wxIcon(c.weather_code)}<span class="tmp">${Math.round(c.temperature_2m)}°</span><span class="dsc"><b>${t("wmo" + wk)}</b><span>${t("wxFeels", { v: Math.round(c.apparent_temperature) })}</span></span></div>
  <div class="wxfacts"><span>${t("wxHiLo", { h: html`<b>${Math.round(dd.temperature_2m_max[0])}</b>`, l: html`<b>${Math.round(dd.temperature_2m_min[0])}</b>` })}</span><span>${t("wxRain", { p: html`<b>${dd.precipitation_probability_max[0] ?? 0}</b>` })}</span><span>${t("wxWind", { w: html`<b>${Math.round(c.wind_speed_10m)}</b>` })}</span>${dd.sunset ? html`<span>${t("wxSun", { t: html`<b>${hm(dd.sunset[0])}</b>` })}</span>` : ""}</div>
  ${hrs.length ? html`<div class="wxhours">${htmlJoin(hrs.map((o) => html`<div class="wxh ${best && best.i === o.i ? "best" : ""}"><span class="hr">${hm(o.tm)}</span><span class="tp">${Math.round(H.temperature_2m[o.i])}°</span><span class="pp">${H.precipitation_probability[o.i] ?? 0}%</span></div>`))}</div>` : ""}
  ${best ? html`<span class="wxbest">${t("wxBest", { h: hm(H.time[best.i]), p: best.p, tp: Math.round(best.tp) })}</span>` : ""}
  ${change}`;
    }
  }
  setHtml(
    el,
    html`<button type="button" class="wxline" data-act="wxtoggle" aria-expanded="${open}" aria-controls="wxMore">${sum}${chev}</button><div class="wxmore" id="wxMore" ${open ? "" : "hidden"}>${more}</div>`,
  );
  WX.heat = wxHeat(D);
  applyHeat();
}
