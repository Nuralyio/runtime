import { ComponentType } from "$store/component/interface.ts";
import { CollapseHeaderTheme } from "../editor/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "border_collapse_container",
    applicationId: "1",
    name: "position collapse container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      marginTop: "13px"
    },
    childrenIds: ["divider","border_text_label_collapse", "border_collapse"]
  },
  {
    uuid: "border_text_label_collapse",
    name: "border_text_label_collapse",
    applicationId: "1",
    component_type: ComponentType.TextLabel,
    style: {
    ...CollapseHeaderTheme
    },
    input:{
      value:{
        type: "handler",
        value: `return "Inputs"`
      }
    }
  },
  {
    uuid: "border_collapse",
    applicationId: "1",
    name: "border collapse",
    component_type: ComponentType.Container,
    style: {
    },
    childrenIds: ["border_collapse_container_childrens"]
  },
  {
    uuid: "border_collapse_container_childrens",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["border_radius_vertical_container", "box_shadow_block"]
  }
];