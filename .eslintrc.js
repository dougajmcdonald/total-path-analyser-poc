// Root ESLint configuration for the monorepo
module.exports = {
  root: true,
  extends: ["@total-path/eslint-config/javascript"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    "*.config.js",
    "*.config.mjs",
  ],
  overrides: [
    {
      files: ["apps/**/*.{js,jsx}"],
      extends: ["@total-path/eslint-config/react"],
    },
    {
      files: ["packages/**/*.{js,jsx}"],
      extends: ["@total-path/eslint-config/javascript"],
    },
  ],
};
