import { ComponentType } from "$store/component/interface.ts";
import { CollapseHeaderTheme } from "../editor/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { allSizeBlocks } from "../config/size-configs.ts";

export default [
  {
    uuid: "size_collapse_container",
    application_id: "1",
    name: "position collapse container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      marginTop: "13px"
    },
    childrenIds: ["size_collapse"]
  },
  {
    uuid: "size_collapse",
    application_id: "1",
    name: "size collapse",
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
    childrenIds: ["divider", "size_text_label_collapse", "size_collapse_container_childrens"]
  },
  {
    uuid: "size_text_label_collapse",
    name: "size_text_label_collapse",
    application_id: "1",
    component_type: ComponentType.TextLabel,
    style: {
    ...CollapseHeaderTheme
    },
    input:{
      value:{
        type: "handler",
        value: `return "Size"`
      }
    }
  },
  {
    uuid: "size_collapse_container_childrens",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: [
      "width_vertical_container",
      "height_vertical_container", 
      "position_block",
      "inner_container_alignement_block",
      "cursor_block",
      "flex_font_size_vertical_container"
    ]
  },
  // Include all factory-generated size blocks
  ...allSizeBlocks
];

//clean up the childrenDIS component file = []