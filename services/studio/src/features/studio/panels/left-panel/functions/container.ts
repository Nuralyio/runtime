import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "@studio/core/helpers/common_attributes.ts";

export const StudioFunctionContainer = [
  {
    uuid: "studio_function_container",
    application_id: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "studio_function_collection"
    ]
  }
];