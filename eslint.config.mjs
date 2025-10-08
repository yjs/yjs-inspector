// @ts-check

import react from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
// @ts-expect-error missing type info
import reactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import * as globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist",
      "**/.eslintrc.cjs",
      "vite.config.ts",
      // shadcn ui
      "src/components/ui/**",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": pluginReactRefresh,
    },
    extends: [react.configs["recommended"]],
    languageOptions: {
      parser: tseslint.parser,
      globals: { ...globals.browser },
      parserOptions: {
        projectService: {
          // See https://typescript-eslint.io/packages/parser#allowdefaultproject
          allowDefaultProject: ["*.ts"],
        },
      },
    },
    rules: {
      // Put rules you want to override here
      // eslint-plugin-react-hooks
      // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@eslint-react/dom/no-missing-button-type": "off",

      // eslint-plugin-react-refresh
      // https://github.com/ArnaudBarre/eslint-plugin-react-refresh
      "react-refresh/only-export-components": "off",

      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
