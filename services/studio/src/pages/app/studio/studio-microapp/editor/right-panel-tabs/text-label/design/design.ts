import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";


export const StudioTextLabelDesign = [{
  uuid: "text_label_bocks",
  applicationId: "1",
  name: "Parent Color Container",
  component_type: ComponentType.Container,
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    "flex-direction": "column"
  },
  childrenIds: [
    "text_label_collapse_container",
    "typography_collapse_container",
    "size_collapse_container",
    "border_collapse_container"
  ]
}
];