import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "typography_collapse_container",
    applicationId: "1",
    name: "position collapse container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["typography_collapse"]
  },
  {
    uuid: "typography_collapse",
    applicationId: "1",
    name: "typography collapse",
    component_type: ComponentType.Container,
    style: {
      "--hy-collapse-content-small-size-padding": "5px",
      "--hy-collapse-font-weight": "normal",
      "--hy-collapse-border-radius": "0px",
      "--hy-collapse-width": "292px",
      "--hy-collapse-border": "none",
      "--hy-collapse-border-bottom": "1px solid #ccc",
      "--hy-collapse-local-header-background-color": "#3d3d3d"
    },
   childrenIds: ["typography_collapse_container_childrens"]
  },
  {
    uuid: "typography_collapse_container_childrens",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: [
      "font_size_vertical_container",
      "font_family_block",
      "font_style_block",
      "font_weight_block",
      "letter_spacing_block",
      "line_height_block",
      "text_alignement_block",
      "text_vertical_alignement_block",
      "text_decoration_block"
    ]
  }
];