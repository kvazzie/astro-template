import WorkbenchSmoke from "./WorkbenchSmoke.astro";
import preview from "../../../.storybook/preview";

const meta = preview.meta({
  title: "Private/Workbench smoke",
  component: WorkbenchSmoke,
  args: {
    locale: "en",
    message: "The component workbench is ready.",
    siteUrl: "https://example.com",
  },
});

export const Default = meta.story({});
