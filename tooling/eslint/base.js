/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@stylistic/disable-legacy",

    "prettier",
  ],
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "import", "@stylistic", "@stylistic/migrate"],
  rules: {
    "turbo/no-undeclared-env-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],
    "@typescript-eslint/no-misused-promises": [
      2,
      { checksVoidReturn: { attributes: false } },
    ],
    "import/consistent-type-specifier-style": ["off", "prefer-top-level"],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/require-await": "warn",
    "@stylistic/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "export" },
      { blankLine: "never", prev: "export", next: "export" },
      {
        blankLine: "always",
        prev: "*",
        next: ["interface", "type"],
      },
      {
        blankLine: "always",
        prev: ["interface", "type"],
        next: ["const", "let"],
      },
      { blankLine: "always", prev: "*", next: "for" },
      { blankLine: "always", prev: "*", next: "multiline-block-like" },
      { blankLine: "always", prev: "*", next: "multiline-expression" },
      {
        blankLine: "always",
        prev: [
          "block",
          "block-like",
          "const",
          "expression",
          "function",
          "let",
          "multiline-block-like",
          "multiline-expression",
          "throw",
          "try",
          "var",
        ],
        next: "function",
      },
      { blankLine: "always", prev: "*", next: "if" },
      { blankLine: "always", prev: "*", next: "try" },
      { blankLine: "always", prev: "*", next: "return" },
    ],
  },
  ignorePatterns: [
    "**/.eslintrc.cjs",
    "**/*.config.js",
    "**/*.config.cjs",
    ".next",
    "dist",
    "pnpm-lock.yaml",
  ],
  reportUnusedDisableDirectives: true,
};

module.exports = config;
