import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme } from "../utils/common-editor-theme.ts";

export default [
  {
    uuid: "access_block",
    application_id: "1",
    name: "access block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["access_label", "access_roles_select"]
  },
  {
    uuid: "access_label",
    name: "access label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Visible to Roles'
      }
    },
    style: {
      ...InputTextLabelTheme
    }
  },
  {
    uuid: "access_roles_select",
    application_id: "1",
    type: "select",
    ...COMMON_ATTRIBUTES,
    name: "access roles select",
    style: {
      width: "100%"
    },
    input: {
      multiple: {
        type: "boolean",
        value: true
      },
      placeholder: {
        type: "string",
        value: "All users (no restriction)"
      },
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          const accessInput = selectedComponent?.input?.access;

          if (accessInput?.type === 'object' && accessInput?.value?.roles) {
            return accessInput.value.roles;
          }

          return [];
        `
      },
      options: {
        type: "handler",
        value: /* js */ `
          // System roles that are always available
          const systemRoles = [
            { label: 'Owner', value: 'owner' },
            { label: 'Administrator', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Viewer', value: 'viewer' }
          ];

          // Get custom roles from the cached app roles
          const cachedRoles = GetVar("_appRoles") || [];
          if (cachedRoles.length > 0) {
            const customRoles = cachedRoles
              .filter(role => !role.isSystem)
              .map(role => ({
                label: role.displayName || role.name,
                value: role.name
              }));
            return [...systemRoles, ...customRoles];
          }

          return systemRoles;
        `
      }
    },
    event: {
      onChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        const selectedRoles = EventData.value || [];

        // Update the access input with the new roles
        updateInput(selectedComponent, 'access', 'object', {
          roles: selectedRoles
        });
      `
    }
  },
  {
    uuid: "access_divider",
    name: "divider",
    type: "divider",
    application_id: "1",
    ...COMMON_ATTRIBUTES
  }
];
