// import globals from "globals";
// import pluginJs from "@eslint/js";
// import tseslint from "typescript-eslint";
// import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
// import { fixupConfigRules } from "@eslint/compat";

// export default [
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
//   ...fixupConfigRules(pluginReactConfig),
// ];

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import { fixupConfigRules } from "@eslint/compat";
import reactAppConfig from "eslint-config-react-app";

export default [
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
    },
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  fixupConfigRules(pluginReact.configs.recommended),
  reactAppConfig, // Add the react-app config here
  {
    rules: {
      // Customize your ESLint rules here
    },
  },
];
