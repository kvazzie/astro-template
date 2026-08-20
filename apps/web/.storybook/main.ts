import { defineMain } from "@storybook-astro/framework/node";

export default defineMain({
  stories: ["../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "@storybook-astro/framework",
    options: {},
  },
});
