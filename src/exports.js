// @ts-check
/* Exports: calendar (ICS), spreadsheet (CSV), PDF (BB-76). */

import { toast } from "./modal.js";
import { t, phaseLbl, DAYS, fmtDay, fmtDate, fmtShort } from "./i18n.js";
import { S } from "./state.js";
import { addDays, parseISO, paces, iso, distLabel } from "./engine-api.js";
import { sesAmt, estDur, sesSec } from "./workout.js";
import { RUN_UNIT } from "./prefs.js";
import { whyOf } from "./editor.js";
import { sesEffort } from "./effort.js";

export function dlSave({ filename, data }) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function saveFile(filename, data) {
  try {
    dlSave({ filename, data });
  } catch (e) {
    toast(t("dlFail"));
  }
}
const fname = (ext) =>
  (S.name || t("trainingBlock"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() +
  "." +
  ext;
export function sessionDate(w, s) {
  return addDays(parseISO(w.start), s.day);
}
export function exportICS() {
  const Pe = paces(S.inputs);
  const e = (v) => String(v).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const fold = (l) => {
    let out = "";
    while (l.length > 73) {
      out += l.slice(0, 73) + "\r\n ";
      l = l.slice(73);
    }
    return out + l;
  };
  const ymd = (d) => iso(d).replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Block Builder//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:" + e(S.name),
  ];
  for (const w of S.plan.weeks)
    for (const s of w.sessions) {
      const d = sessionDate(w, s);
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + s.id + "-" + ymd(d) + "@blockbuilder",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + ymd(d),
        "DTEND;VALUE=DATE:" + ymd(addDays(d, 1)),
        fold("SUMMARY:" + e(`${s.name} · ${sesAmt(s, Pe)}`)),
        fold(
          "DESCRIPTION:" +
            e(
              t("icsDesc", { n: w.n, phase: phaseLbl(w.phase), desc: s.desc }) +
                (s.note ? "\n\n" + t("icsNote") + s.note : ""),
            ),
        ),
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
      );
    }
  lines.push("END:VCALENDAR");
  saveFile(fname("ics"), new Blob([lines.join("\r\n")], { type: "text/calendar" }));
}
export function exportCSV() {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [t("csvHead").split("|")];
  for (const w of S.plan.weeks)
    for (const s of w.sessions)
      rows.push([w.n, phaseLbl(w.phase), iso(sessionDate(w, s)), DAYS[s.day], s.name, s.km, s.desc, s.note]);
  saveFile(fname("csv"), new Blob(["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }));
}

/* PDF: jsPDF + AutoTable, loaded on first use only */
let PDFLIB = null;
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
        "sha512-plOdviVmws4Y3JAvbnpfKb2hVxKM1lCwsi3vmElYRj+tiDLffZ4FVUj5a8vyKJ9pIgl8JCAHEJ4D1iUKBecswg==",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/5.0.9/jspdf.plugin.autotable.min.js",
        "sha512-p73fJ+Q5sCDFsEa54+EWEEWYipUV2Dc7L+E+yp6jSud5Ht1zbEqiI3OuatH5EDdDLxnOW/UN+FwBu8l+4klwLQ==",
      );
      const J = window.jspdf && window.jspdf.jsPDF;
      if (!J) throw new Error("jsPDF missing");
      const P = window.jspdf_autotable || {};
      if (!J.API.autoTable && typeof P.applyPlugin === "function") P.applyPlugin(J);
      const run = (doc, o) =>
        typeof doc.autoTable === "function"
          ? doc.autoTable(o)
          : typeof P.autoTable === "function"
            ? P.autoTable(doc, o)
            : (() => {
                throw new Error("AutoTable missing");
              })();
      return { J, run };
    })().catch((e) => {
      PDFLIB = null;
      throw e;
    });
  return PDFLIB;
}
/* built-in PDF fonts are Latin-1: map the typographic characters the plan uses, drop the rest */
const pdfTxt = (v) =>
  String(v ?? "")
    .replace(/[–—−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/→/g, "->")
    .replace(/≈/g, "~")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/[\u00a0\u202f\u2009]/g, " ")
    .replace(/[^\n\x20-\xFF]/g, "");
const PDF_KIND = {
  recovery: [79, 126, 171],
  easy: [43, 135, 104],
  long: [158, 124, 8],
  tempo: [198, 91, 31],
  hard: [201, 64, 90],
  race: [176, 75, 168],
};
const PDF_PHASE = {
  base: [143, 178, 165],
  build: [108, 147, 200],
  peak: [212, 84, 44],
  taper: [201, 164, 71],
  recovery: [138, 164, 174],
};
export async function exportPDF(btn) {
  if (btn) btn.disabled = true;
  let lib;
  try {
    toast(t("pdfBuilding"));
    lib = await loadPDF();
  } catch (_) {
    if (btn) btn.disabled = false;
    toast(t("pdfLoadFail"));
    return;
  }
  try {
    const { J, run } = lib,
      I = S.inputs,
      W = S.plan.weeks;
    const doc = new J({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth(),
      ph = doc.internal.pageSize.getHeight(),
      M = 10;
    const totals = W.map((w) => w.sessions.reduce((a, s) => a + s.km, 0));
    const Pe = paces(S.inputs);
    const longest = Math.max(0, ...W.flatMap((w) => w.sessions.filter((s) => s.kind === "long").map((s) => s.km)));
    const start = parseISO(W[0].start),
      end = addDays(start, 7 * W.length - 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 32, 39);
    doc.text(pdfTxt(S.name), M, M + 6);
    const R = I.race && I.race.name ? I.race : null;
    const line1 = [
      distLabel(I),
      R ? `${t("pdfRace")}: ${R.name}${R.city ? " (" + R.city + ")" : ""}` : "",
      I.goal !== "fitness" ? fmtDay(parseISO(I.raceDate)) : "",
      `${fmtDate(start)} - ${fmtDate(end)}`,
    ]
      .filter(Boolean)
      .join("  ·  ");
    const line2 = [
      `${W.length} ${t("stWeeks")}`,
      `${Math.round(totals.reduce((a, b) => a + b, 0))} ${t("stTotal")}`,
      `${Math.round(Math.max(...totals))} ${t("stPeak")}`,
      `${longest} ${t("stLongest")}`,
    ].join("  ·  ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 106, 111);
    doc.text(pdfTxt(line1), M, M + 12);
    doc.text(pdfTxt(line2), M, M + 16.5);
    const body = [],
      meta = [];
    W.forEach((w, wi) => {
      const st = parseISO(w.start);
      const row = [
        `${t("wAbbr")}${w.n}\n${fmtShort(st)} - ${fmtShort(addDays(st, 6))}\n${phaseLbl(w.phase)}${w.cutback ? " · " + t("cutback") : ""}\n${RUN_UNIT === "t" ? estDur(w.sessions.reduce((a, s) => a + sesSec(s, Pe), 0)) : totals[wi].toFixed(1) + " km"}`,
      ];
      const kinds = [w.phase];
      for (let d = 0; d < 7; d++) {
        const ss = w.sessions.filter((s) => s.day === d);
        row.push(
          ss
            .map((s) => `${s.name} · ${sesAmt(s, Pe)}\n${s.desc}${s.note ? "\n" + t("note") + ": " + s.note : ""}`)
            .join("\n\n"),
        );
        kinds.push(ss.length ? sesEffort(ss[0]) : null);
      }
      body.push(row.map(pdfTxt));
      meta.push({ type: "week", kinds });
      if (w.note) {
        body.push([{ content: pdfTxt(`${t("note")}: ${w.note}`), colSpan: 8 }]);
        meta.push({ type: "note" });
      }
    });
    const dayW = (pw - 2 * M - 30) / 7;
    run(doc, {
      startY: M + 21,
      margin: { left: M, right: M, top: M, bottom: M + 5 },
      head: [[t("week"), ...DAYS].map(pdfTxt)],
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
        overflow: "linebreak",
      },
      headStyles: { fillColor: [20, 32, 39], textColor: 255, fontStyle: "bold", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: "bold" },
        ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((i) => [i, { cellWidth: dayW }])),
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
      },
    });
    /* BB-43: one line per built-in run type the plan uses, in the order they first appear */
    const used = [...new Set(W.flatMap((w) => w.sessions.map((s) => s.typeId)))].filter((id) => whyOf(id));
    if (used.length)
      run(doc, {
        startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : M + 21) + 6,
        margin: { left: M, right: M, top: M, bottom: M + 5 },
        rowPageBreak: "avoid",
        head: [[t("pdfWhyHead"), t("pdfWhyCol")].map(pdfTxt)],
        body: used.map((id) => {
          const ty = S.types.find((x) => x.id === id);
          return [pdfTxt((ty && ty.name) || t("ty_" + id)), pdfTxt(whyOf(id))];
        }),
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 7.6,
          cellPadding: 1.8,
          valign: "top",
          lineColor: [213, 221, 219],
          lineWidth: 0.2,
          textColor: [20, 32, 39],
        },
        headStyles: { fillColor: [20, 32, 39], textColor: 255, fontStyle: "bold", fontSize: 8 },
        columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" } },
      });
    const n = doc.internal.getNumberOfPages(),
      gen = t("pdfGenerated", { d: fmtDate(new Date()) });
    for (let p = 1; p <= n; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(90, 106, 111);
      doc.text(pdfTxt(`Block Builder · ${gen}`), M, ph - 5);
      doc.text(pdfTxt(t("pdfPage", { p, n })), pw - M, ph - 5, { align: "right" });
    }
    saveFile(fname("pdf"), doc.output("blob"));
  } catch (e) {
    toast(t("pdfFail", { m: (e && e.message) || t("unknownErr") }));
  } finally {
    if (btn) btn.disabled = false;
  }
}
export function initExports() {
  S.exportFmt =
    (() => {
      try {
        return localStorage.getItem("bb-export-fmt");
      } catch (_) {
        return null;
      }
    })() === "pdf"
      ? "pdf"
      : "csv";
}
