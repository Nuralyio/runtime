import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { StudioInputCollapseContainer } from "./inputs/collapse-container.ts";

export const StudioDatepickerDesign = [
  {
    uuid: "datepicker_block",
    applicationId: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "datepicker_input_collapse_container",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container"
    ]
  },
  ...StudioInputCollapseContainer
];