import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";

export const StudioFileUploadDesign = [
  {
    uuid: "FileUpload_blocks",
    application_id: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "FileUpload_input_collapse_container",
      "size_collapse_container",
      "border_collapse_container"
    ]
  }
];
