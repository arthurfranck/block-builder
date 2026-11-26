// @ts-check
/* DOM shortcuts (BB-76). */

export const $ = (s) => document.querySelector(s);
/** @type {(s: string) => NodeListOf<HTMLElement>} */
export const $$ = (s) => document.querySelectorAll(s);
/** @type {(s: string) => HTMLDetailsElement | null} */
export const cardDetails = (s) => document.querySelector(s);
