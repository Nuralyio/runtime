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
    type: "panel",
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
    children_ids: ["app_settings_content_container"]
  },
  {
    uuid: "app_settings_content_container",
    application_id: "1",
    name: "app settings content container",
    type: "container",
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
    children_ids: ["app_subdomain_block", "app_access_settings_block", "app_i18n_settings_block"]
  },
  // Subdomain input row
  {
    uuid: "app_subdomain_block",
    application_id: "1",
    name: "app subdomain block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "4px",
      width: "100%"
    },
    children_ids: ["app_subdomain_label", "app_subdomain_input_row"]
  },
  {
    uuid: "app_subdomain_label",
    name: "app subdomain label",
    type: "text_label",
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
    type: "container",
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
    children_ids: ["app_subdomain_input", "app_subdomain_suffix"]
  },
  {
    uuid: "app_subdomain_input",
    name: "app subdomain input",
    application_id: "1",
    type: "text_input",
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
    type: "text_label",
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
  },
  // Access Settings Block
  {
    uuid: "app_access_settings_block",
    application_id: "1",
    name: "app access settings block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "8px",
      width: "100%",
      "margin-top": "8px",
      "padding-top": "12px",
      "border-top": "1px solid var(--nuraly-color-border)"
    },
    children_ids: ["app_access_settings_label", "app_access_settings_row"]
  },
  {
    uuid: "app_access_settings_label",
    name: "app access settings label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Access Settings"
      }
    },
    style: {
      width: "100%",
      "font-size": "12px",
      "font-weight": "600",
      color: "var(--nuraly-color-text-primary)"
    }
  },
  {
    uuid: "app_access_settings_row",
    application_id: "1",
    name: "app access settings row",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      "justify-content": "space-between",
      gap: "8px",
      width: "100%",
      padding: "8px",
      "background-color": "var(--nuraly-color-background-secondary)",
      "border-radius": "6px"
    },
    children_ids: ["app_access_settings_text", "app_access_settings_toggle"]
  },
  {
    uuid: "app_access_settings_text",
    application_id: "1",
    name: "app access settings text",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "2px",
      flex: "1"
    },
    children_ids: ["app_access_settings_title", "app_access_settings_description"]
  },
  {
    uuid: "app_access_settings_title",
    name: "app access settings title",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Allow all authenticated users"
      }
    },
    style: {
      "font-size": "12px",
      "font-weight": "500",
      color: "var(--nuraly-color-text-primary)"
    }
  },
  {
    uuid: "app_access_settings_description",
    name: "app access settings description",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Any logged-in user can view this app without being a member"
      }
    },
    style: {
      "font-size": "11px",
      color: "var(--nuraly-color-text-secondary)",
      "line-height": "1.4"
    }
  },
  {
    uuid: "app_access_settings_toggle",
    name: "app access settings toggle",
    type: "checkbox",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "--nuraly-checkbox-size": "18px"
    },
    input: {
      checked: {
        type: "handler",
        value: /* js */ `
          const currentEditingApplication = GetVar("currentEditingApplication");
          return currentEditingApplication?.requiresAuthOnly || false;
        `
      },
      toggle: { type: "boolean", value: true }
    },
    event: {
      onChange: /* js */ `
        const currentEditingApplication = GetVar("currentEditingApplication");
        if (currentEditingApplication) {
          UpdateApplication({
            ...currentEditingApplication,
            requiresAuthOnly: EventData.checked
          });
        }
      `
    }
  }
];
