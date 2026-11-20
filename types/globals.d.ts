// Globals the page scripts share, for `// @ts-check` (BB-66). No runtime effect.
/** Plan engine from engine.js (classic script, sets window.BBEngine). */
declare const BBEngine: any;
interface Window {
  /** jsPDF and its AutoTable plugin, loaded from cdnjs on the first PDF export. */
  jspdf?: any;
  jspdf_autotable?: any;
}
