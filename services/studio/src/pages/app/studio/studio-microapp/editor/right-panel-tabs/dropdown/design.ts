import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
// import { StudioSelectInputs } from "./inputs";

export const StudioDropdowntDesign = [
  {
    uuid: "dropdown_blocks",
    application_id: "1",
    name: "Parent Select Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "center"
    },
    childrenIds: [
      "dropdown_collapse_container",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container"
    ]
  },
  // ...StudioSelectInputs
];