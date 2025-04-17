import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { StudioRefComponentInputs } from "./inputs";

export const StudioRefComponentDesign = [
  {
    uuid: "ref_component_blocks",
    application_id: "1",
    name: "Parent Icon Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "center"
    },
    childrenIds: [
      "refcomponent_collapse_container",
    ]
  },
  ...StudioRefComponentInputs
];