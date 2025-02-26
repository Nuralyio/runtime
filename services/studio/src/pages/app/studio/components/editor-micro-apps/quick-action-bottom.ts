import { COMMON_ATTRIBUTES } from "../../studio-microapp/helper/common_attributes.ts";
import { ComponentType } from "$store/component/interface.ts";

export default [
  {
    uuid: "quick-action-wrapper-bottom",
    application_id: "1",
    name: "helper text block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: {
        type: "string",
        value: "horizontal"
      }
    },
    ...COMMON_ATTRIBUTES,
    style: {
    },
    childrenIds: [ "dropdonwn-context"]
  },
  {
    name: "name",
    application_id: "1",
    component_type: ComponentType.AI
  },
  {
    uuid: "export-import-block-wrapper",
    application_id: "1",
    name: "export-import-block-wrapper",
    component_type: ComponentType.ExportImport
  },
  {
    uuid: "dropdonwn-context",
    application_id: "1",
    name: "dropdonwn-context",
    component_type: ComponentType.Dropdown,
  }
];