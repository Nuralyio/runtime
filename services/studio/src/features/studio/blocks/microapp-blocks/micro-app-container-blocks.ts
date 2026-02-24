import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "micro_app_container_blocks",
    application_id: "1",
    name: "micro_app_container_blocks",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    children_ids: ["micro_app_selection"]
  }

];