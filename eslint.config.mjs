// ESLint (BB-79). Flat config, ready for ES modules (ADR 0008): files under src/ will be linted as modules
// once BB-86 adds the build. Today's page scripts are classic scripts, so they are linted as scripts.
import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", "vendor/", "test-results/", "playwright-report/", "tests/**/*.ts"] },
  js.configs.recommended,
  {
    rules: {
      // House style: try { storage } catch (_) {} where a failure is fine to ignore.
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
    },
  },
  {
    files: ["app.js", "theme.js", "engine.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.browser, BBEngine: "readonly", module: "readonly" },
    },
  },
  {
    files: ["src/**/*.js", "**/*.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node } },
  },
];
