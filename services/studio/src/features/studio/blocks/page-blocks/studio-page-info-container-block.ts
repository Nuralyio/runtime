import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "page_info_container_block",
    application_id: "1",
    name: "page info container block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "8px",
      width: "100%",
      padding: "8px",
      "margin-bottom" : "8px"
    },
    children_ids: ["page_name_block", "page_url_block", "description_block", "page_default_checkbox_block"]
  }
];
