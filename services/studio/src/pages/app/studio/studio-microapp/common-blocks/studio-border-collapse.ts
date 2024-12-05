import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "border_collapse_container",
    applicationId: "1",
    name: "position collapse container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      marginTop: "13px",
    },
    childrenIds: ["border_collapse"]
  },
  {
    uuid: "border_collapse",
    applicationId: "1",
    name: "border collapse",
    component_type: ComponentType.Collapse,
    style: {
      "--hy-collapse-content-small-size-padding": "5px",
      "--hy-collapse-font-weight": "normal",
      "--hy-collapse-border-radius": "0px",
      "--hy-collapse-width": "292px",
      "--hy-collapse-border": "none",
      '--hy-collapse-border-bottom': '1px solid #ccc',
      '--hy-collapse-local-header-background-color': '#3d3d3d'
    },
    input: {
      size: {
        type: 'handler',
        value: /* js */ `
                const size = 'small';
                return size;
                `
      },
      components: {
        type: 'handler',
        value: /* js */ `
                return [{ blockName: 'border_collapse_container_childrens', label: 'Border' , open : false}];
                `
      }
    }
  },
  {
    uuid: "border_collapse_container_childrens",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {

    },
    childrenIds: ["border_radius_vertical_container", "box_shadow_block", ],
  },
]