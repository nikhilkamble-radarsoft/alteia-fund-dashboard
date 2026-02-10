// Even if you use JS, VS Code will pick this up for intellisense
import "i18next";
import common from "./locales/en/common.json";
import table from "./locales/en/table.json";
import form from "./locales/en/form.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      table: typeof table;
      form: typeof form;
    };
  }
}