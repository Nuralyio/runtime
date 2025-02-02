import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";

export const StudioButtonDesign = [
  {
    uuid: "collection_blocks",
    applicationId: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "collection_collapse_container",
      "size_collapse_container",
    ]
  },
];