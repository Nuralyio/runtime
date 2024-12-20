import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { StudioIconInputs } from "./inputs";

export const StudioIconDesign = [
  {
    uuid: "icon_blocks",
    applicationId: "1",
    name: "Parent Icon Container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "center",
    },
    childrenIds: [
      "icon_collapse_container",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container"
    ],
  },
  ...StudioIconInputs,
];