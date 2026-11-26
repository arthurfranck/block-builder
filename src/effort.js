// @ts-check
/* Effort of a run type and its colour tokens, shared by the setup chips, plan grid, Today card and exports (BB-76). */

/* Effort scale, cool to hot: recovery, easy, long, tempo (steady quality), hard (intervals, hills, custom quality), race. */
const TEMPO_IDS = new Set(["tempo", "progression", "racepace", "fartlek"]);
export const effort = (id, kind) =>
  kind === "hard"
    ? TEMPO_IDS.has(id)
      ? "tempo"
      : "hard"
    : ["recovery", "long", "race"].includes(kind)
      ? kind
      : "easy";
export const sesEffort = (s) => effort(s.typeId, s.kind);
export const effColor = (e) => `var(--${e})`;
export const effText = (e) => `var(--${e}-t)`;
