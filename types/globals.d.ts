// Globals the page scripts share, for `// @ts-check` (BB-66). No runtime effect.
interface Window {
  /** jsPDF and its AutoTable plugin, loaded from cdnjs on the first PDF export. */
  jspdf?: any;
  jspdf_autotable?: any;
}
