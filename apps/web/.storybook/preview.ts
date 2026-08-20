import { definePreview } from "@storybook-astro/framework";

import "../src/styles/app.css";

export default definePreview({
  parameters: {
    layout: "centered",
  },
});
