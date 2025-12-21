import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

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
      title: {
        type: "string",
        value: "Access Control"
      },
      mode: {
        type: "string",
        value: "embedded"
      },
      size: {
        type: "string",
        value: "small"
      },
      closable: {
        type: "boolean",
        value: false
      },
      minimizable: {
        type: "boolean",
        value: true
      },
      resizable: {
        type: "boolean",
        value: false
      },
      draggable: {
        type: "boolean",
        value: false
      }
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
      direction: {
        type: "string",
        value: "vertical"
      }
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
          const currentPageId = Vars.currentPage;
          if (!currentPageId) return {};

          const currentEditingApplication = GetVar("currentEditingApplication");
          const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
          const currentPage = appPages?.find((page) => page.uuid == currentPageId);

          if (!currentPage) return {};

          return {
            is_public: currentPage.is_public || false,
            access_level: currentPage.access_level || 'public',
            allowed_roles: currentPage.allowed_roles || []
          };
        `
      }
    },
    event: {
      onChange: /* js */`
        const currentPageId = Vars.currentPage;
        if (!currentPageId) return;

        const currentEditingApplication = GetVar("currentEditingApplication");
        const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
        const currentPage = appPages?.find((page) => page.uuid == currentPageId);

        if (!currentPage) return;

        const property = EventData.property;
        const value = EventData.value;

        const newPage = {
          ...currentPage,
          [property]: value
        };

        UpdatePage(newPage, currentEditingApplication.uuid).catch((e) => {
          console.error('Error updating page access control:', e);
        });
      `
    }
  }
];
