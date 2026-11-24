// ESLint (BB-79). src/ holds ES modules (ADR 0008, BB-86); app.js is the esbuild bundle of them and is not linted.
// theme.js stays a classic script, loaded in <head> before the page paints.
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/",
      "vendor/",
      "test-results/",
      "playwright-report/",
      "tests/**/*.ts",
      "app.js",
      "app.js.map",
    ],
  },
  js.configs.recommended,
  {
    rules: {
      // House style: try { storage } catch (_) {} where a failure is fine to ignore.
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
    },
  },
  {
    files: ["theme.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: { ...globals.browser } },
  },
  {
    files: ["src/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser } },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node } },
  },
];
