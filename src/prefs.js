// @ts-check
/* Display preferences kept on this device (BB-76): runs in km or minutes; theme and language panel. */

/* runs shown in km or minutes (BB-54): a display preference on this device; plans are still built and saved in km */
export let RUN_UNIT = (() => {
  try {
    if (localStorage.getItem("bb-run-unit") === "t") return "t";
  } catch (_) {}
  return "d";
})();
/** Show runs in km ("d") or minutes ("t"), kept on this device. */
export function useRunUnit(u) {
  RUN_UNIT = u;
  try {
    localStorage.setItem("bb-run-unit", u);
  } catch (_) {}
}
