import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "size_collapse_container",
    applicationId: "1",
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
    applicationId: "1",
    name: "size collapse",
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
                const size = 'small';
                return size;
                `
      },
      components: {
        type: "handler",
        value: /* js */ `
                return [{ blockName: 'size_collapse_container_childrens', label: 'size' , open : true}];
                `
      }
    }
  },
  {
    uuid: "size_collapse_container_childrens",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["height_vertical_container", "width_vertical_container", "position_block","inner_container_alignement_block"]
  }
];