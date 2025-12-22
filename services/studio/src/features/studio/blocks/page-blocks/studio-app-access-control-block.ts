import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * Application Access Control Panel Block
 *
 * UI component for managing application-level permissions.
 * Controls default access for the entire application.
 * Backend handles permission logic with inheritance to pages/components.
 */

export default [
  {
    uuid: "app_access_control_panel_block",
    application_id: "1",
    name: "app access control panel block",
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
      title: { type: "string", value: "Application Access" },
      mode: { type: "string", value: "embedded" },
      size: { type: "string", value: "small" },
      closable: { type: "boolean", value: false },
      minimizable: { type: "boolean", value: true },
      resizable: { type: "boolean", value: false },
      draggable: { type: "boolean", value: false }
    },
    childrenIds: ["app_access_control_content_container"]
  },
  {
    uuid: "app_access_control_content_container",
    application_id: "1",
    name: "app access control content container",
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
    childrenIds: ["app_access_roles_display_block"]
  },
  {
    uuid: "app_access_roles_display_block",
    name: "app access roles display block",
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
          const currentEditingApplication = GetVar("currentEditingApplication");

          return {
            resource_type: 'application',
            resource_id: currentEditingApplication?.uuid,
            application_id: currentEditingApplication?.uuid,
            is_public: false,
            is_anonymous: false,
            role_permissions: [],
            available_roles: currentEditingApplication?.roles || []
          };
        `
      }
    }
  }
];
