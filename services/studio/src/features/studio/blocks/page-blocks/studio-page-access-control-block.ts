import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * Access Control Panel Block
 *
 * UI-only component for managing resource permissions.
 * Works with any resource type (page, component, application).
 * Backend handles permission logic with inheritance.
 *
 * Events emitted:
 * - toggle_public: { is_public, grantee_type: 'public', permission }
 * - toggle_anonymous: { is_anonymous, grantee_type: 'anonymous', permission }
 * - add_role_permission: { grantee_type: 'role', role_name, role_id, permission, is_system }
 * - update_role_permission: { role_name, permission }
 * - remove_role_permission: { role_name }
 */

export default [
  {
    uuid: "access_control_panel_block",
    application_id: "1",
    name: "access control panel block",
    component_type: "Panel",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      height: "auto",
      display: "flex",
      "flex-direction": "column",
      "background-color": "var(--nuraly-color-background)",
      "border-radius": "var(--nuraly-border-radius-medium)",
      "--nuraly-border-radius-small": "0px",
      "--nuraly-label-font-weight": "350",
      "--nuraly-panel-header-background": "#fcfcfc",
      "--nuraly-panel-body-padding-small": "0px",
      "padding": "0px",
      "--nuraly-panel-shadow": "none"
    },
    input: {
      title: { type: "string", value: "Access Control" },
      mode: { type: "string", value: "embedded" },
      size: { type: "string", value: "small" },
      closable: { type: "boolean", value: false },
      minimizable: { type: "boolean", value: true },
      resizable: { type: "boolean", value: false },
      draggable: { type: "boolean", value: false }
    },
    childrenIds: ["access_control_content_container"]
  },
  {
    uuid: "access_control_content_container",
    application_id: "1",
    name: "access control content container",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "0px",
      gap: "0px"
    },
    input: {
      direction: { type: "string", value: "vertical" }
    },
    childrenIds: ["access_roles_display_block"]
  },
  {
    uuid: "access_roles_display_block",
    name: "access roles display block",
    application_id: "1",
    component_type: "access_roles",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          // Get current resource context (page, component, or application)
          const currentPageId = Vars.currentPage;
          const selectedComponent = Utils.first(Vars.selectedComponents);
          const currentEditingApplication = GetVar("currentEditingApplication");

          // Determine resource type and id
          let resourceType = 'page';
          let resourceId = currentPageId;

          if (selectedComponent) {
            resourceType = 'component';
            resourceId = selectedComponent.uuid;
          }

          // Return current permission state
          // This data should come from API response stored in context
          const permissionsKey = resourceType + '_' + resourceId + '_permissions';
          const permissions = GetVar(permissionsKey) || {};

          return {
            resource_type: resourceType,
            resource_id: resourceId,
            application_id: currentEditingApplication?.uuid,
            is_public: permissions.is_public || false,
            is_anonymous: permissions.is_anonymous || false,
            role_permissions: permissions.role_permissions || [],
            available_roles: currentEditingApplication?.roles || []
          };
        `
      }
    },
    event: {
      onChange: /* js */`
        // Emit event data for parent to handle API call
        // Backend handles permission logic with inheritance
        console.log('Access control change:', EventData);
      `
    }
  }
];
