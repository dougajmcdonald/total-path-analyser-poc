import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";

/**
 * A shared ESLint configuration for JavaScript packages.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    rules: {
      // Standard.js rules
      indent: ["error", 2],
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "no-unused-vars": "error",
      "space-before-function-paren": ["error", "always"],
      eqeqeq: ["error", "always"],
      "space-infix-ops": "error",
      "comma-spacing": ["error", { after: true }],
      "brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "keyword-spacing": "error",
      "space-before-blocks": "error",
      camelcase: "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
];
