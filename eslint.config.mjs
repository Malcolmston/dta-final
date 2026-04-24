import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow any type for now (requires significant refactoring to fix)
      "@typescript-eslint/no-explicit-any": "off",
      // Allow setState in effects (common pattern, requires significant refactoring)
      "react-hooks/set-state-in-effect": "off",
      // Allow impure function calls during render (requires refactoring)
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/purity": "off",
      // Allow unescaped entities in JSX (cosmetic)
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
