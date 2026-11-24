/* Block Builder theme (BB-66): sets data-theme before the page paints, so a light theme never flashes dark.
   Loaded in <head> as a classic script; kept out of index.html so the CSP needs no 'unsafe-inline'. */
document.documentElement.dataset.theme = (() => {
  try {
    const t = localStorage.getItem("bb-theme");
    if (t === "light" || t === "auto") return t;
  } catch (_) {}
  return "dark";
})();
