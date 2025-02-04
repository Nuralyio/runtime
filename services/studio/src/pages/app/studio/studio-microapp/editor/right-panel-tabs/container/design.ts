import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";

export const StudioContainerDesign = [
  {
    uuid: "container_blocks",
    application_id: "1",
    name: "Parent Checkbox Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "container_collapse_container",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container",
    ]
  },
];