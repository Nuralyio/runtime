import { COMMON_ATTRIBUTES } from "../../studio-microapp/helper/common_attributes.ts";
import { ComponentType } from "$store/component/interface.ts";

export default [
  {
    uuid: "quick-action-wrapper",
    applicationId: "1",
    name: "helper text block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "horizontal"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "width": "380px"
    },

    childrenIds: ["font_color_block", "font_family_block", "ask-ai", "export-import-block-wrapper"]
  },
  {
    uuid: "ask-ai",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.AI
  },
  {
    uuid: "export-import-block-wrapper",
    applicationId: "1",
    name: "export-import-block-wrapper",
    component_type: ComponentType.ExportImport,
   }
];