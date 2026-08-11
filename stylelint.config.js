import configTailwindcss from "@dreamsicle.io/stylelint-config-tailwindcss/dist/stylelint.config.mjs";

/** @type {import("stylelint").Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-html",
    "stylelint-config-html/astro",
    "@dreamsicle.io/stylelint-config-tailwindcss",
  ],
  allowEmptyInput: true,
  languageOptions: {
    syntax: {
      atRules: {
        plugin: { prelude: "<string>" },
        ...configTailwindcss.languageOptions.syntax.atRules,
      },
    },
  },
  overrides: [
    {
      files: ["**/*.astro", "**/*.mdx"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.mdx"],
      rules: {
        "selector-type-no-unknown": null,
        "value-keyword-case": null,
      },
    },
  ],
};
