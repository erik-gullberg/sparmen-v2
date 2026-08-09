import next from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next.config.mjs",
      "src/sw.js",
    ],
  },
  ...next,
];

export default config;
