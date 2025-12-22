import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * Application Settings Block
 *
 * UI component for managing application-level settings like subdomain.
 * Allows users to configure custom subdomain for their applications.
 */

export default [
  {
    uuid: "app_settings_container_block",
    application_id: "1",
    name: "app settings container block",
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
      padding: "0px",
      "--nuraly-panel-shadow": "none"
    },
    input: {
      title: { type: "string", value: "Application Settings" },
      mode: { type: "string", value: "embedded" },
      size: { type: "string", value: "small" },
      closable: { type: "boolean", value: false },
      minimizable: { type: "boolean", value: true },
      resizable: { type: "boolean", value: false },
      draggable: { type: "boolean", value: false }
    },
    childrenIds: ["app_settings_content_container"]
  },
  {
    uuid: "app_settings_content_container",
    application_id: "1",
    name: "app settings content container",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "8px",
      gap: "12px"
    },
    input: {
      direction: { type: "string", value: "vertical" }
    },
    childrenIds: ["app_subdomain_block"]
  },
  // Subdomain input row
  {
    uuid: "app_subdomain_block",
    application_id: "1",
    name: "app subdomain block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "4px",
      width: "100%"
    },
    childrenIds: ["app_subdomain_label", "app_subdomain_input_row"]
  },
  {
    uuid: "app_subdomain_label",
    name: "app subdomain label",
    component_type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Subdomain"
      }
    },
    style: {
      width: "100%",
      "font-size": "12px",
      "font-weight": "500",
      color: "var(--nuraly-color-text-secondary)"
    }
  },
  {
    uuid: "app_subdomain_input_row",
    application_id: "1",
    name: "app subdomain input row",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      gap: "4px",
      width: "100%"
    },
    input: {
      direction: { type: "string", value: "horizontal" }
    },
    childrenIds: ["app_subdomain_input", "app_subdomain_suffix"]
  },
  {
    uuid: "app_subdomain_input",
    name: "app subdomain input",
    application_id: "1",
    component_type: "text_input",
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small",
      width: "140px",
      "flex-grow": "1"
    },
    event: {
      valueChange: /* js */ `
        const newSubdomain = EventData.value?.toLowerCase().replace(/[^a-z0-9-]/g, '') || '';
        const currentEditingApplication = GetVar("currentEditingApplication");

        if (currentEditingApplication) {
          // Update application with new subdomain
          UpdateApplication({
            ...currentEditingApplication,
            subdomain: newSubdomain || null
          });
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const currentEditingApplication = GetVar("currentEditingApplication");
          return currentEditingApplication?.subdomain || '';
        `
      },
      placeholder: {
        type: "string",
        value: "my-app"
      }
    }
  },
  {
    uuid: "app_subdomain_suffix",
    name: "app subdomain suffix",
    component_type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: ".localhost"
      }
    },
    style: {
      "font-size": "12px",
      color: "var(--nuraly-color-text-secondary)",
      "white-space": "nowrap"
    }
  }
];
