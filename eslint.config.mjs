import eslintConfigNext from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...eslintConfigNext,
  {
    rules: {
      // React Compiler preview rules: too strict for common Next.js patterns
      // (localStorage in useEffect, auth bootstrap, framer-motion, etc.).
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];

export default config;
