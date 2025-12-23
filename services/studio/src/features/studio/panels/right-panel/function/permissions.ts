import { COMMON_ATTRIBUTES } from '../../../core/helpers/common_attributes.ts';

export default [
  {
    uuid: "right_panel_function_permissions",
    application_id: "1",
    name: "Function Permissions Container",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "0"
    },
    childrenIds: ["function_permissions_block"]
  },
  {
    uuid: "function_permissions_block",
    name: "function_permissions_block",
    component_type: "access_roles",
    style: {
      width: "100%"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const currentFunction = Vars.currentFunction;
          if (!currentFunction?.id) {
            return { resource_id: null, resource_type: 'function' };
          }
          return {
            resource_id: String(currentFunction.id),
            resource_type: 'function'
          };
        `
      }
    }
  }
];
