import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";

/**
 * A shared ESLint configuration for React applications.
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
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Standard.js rules
      indent: ["error", 2],
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
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
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
