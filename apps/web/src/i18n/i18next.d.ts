import "i18next";

import type Resources from "./resources.generated";

declare module "i18next" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- The extension contributes every CLI-generated namespace to i18next declaration merging.
  interface ResourceNamespaceMap extends Resources {}

  interface CustomTypeOptions {
    defaultNS: "common";
  }
}
