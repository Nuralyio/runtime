import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "button_collapse_container",
    application_id: "1",
    name: "position collapse container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      marginTop: "15px"
    },
    childrenIds: ["button_label_collapse"]
  },
  {
    uuid: "button_label_collapse",
    application_id: "1",
    name: "button collapse",
    component_type: ComponentType.Collapse,
    style: {
      "--hy-collapse-content-small-size-padding": "5px",
      "--hy-collapse-font-weight": "normal",
      "--hy-collapse-border-radius": "0px",
      "--hy-collapse-width": "292px",
      "--hy-collapse-border": "none",
      "--hy-collapse-border-bottom": "1px solid #ccc",
      "--hy-collapse-local-header-background-color": "#3d3d3d"
    },
    input: {
      size: {
        type: "handler",
        value: /* js */ `
                return 'small';
                `
      },
      components: {
        type: "handler",
        value: /* js */ `
                return [{ blockName: 'button_collapse_container_childrens', label: 'Buttons', open: true }];
                `
      }
    }
  },
  {
    uuid: "button_collapse_container_childrens",
    application_id: "1",
    name: "Button panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["button_type_block", "button_icon_position_block"]
  }
];