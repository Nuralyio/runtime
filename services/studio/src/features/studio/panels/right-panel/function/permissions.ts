import { COMMON_ATTRIBUTES } from '../../../core/helpers/common_attributes.ts';

export default [
  {
    uuid: "right_panel_function_permissions",
    application_id: "1",
    name: "Function Permissions Container",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "0"
    },
    children_ids: ["function_permissions_block"]
  },
  {
    uuid: "function_permissions_block",
    name: "function_permissions_block",
    type: "access_roles",
    style: {
      width: "100%"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const currentFunction = $currentFunction;
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
