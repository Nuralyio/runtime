import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * Translations Panel Block
 *
 * UI component for managing component-level translations in the Studio editor.
 * Shows translation inputs for translatable properties of the selected component.
 *
 * Note: Translatable properties are now read dynamically from each component's
 * config.json file (properties with `translatable: true`).
 */

export default [
  // Translations Panel Container
  {
    uuid: "translations_panel_block",
    application_id: "1",
    name: "translations panel block",
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
      "--nuraly-panel-shadow": "none",
      "margin-top": "8px"
    },
    input: {
      title: { type: "string", value: "Translations" },
      mode: { type: "string", value: "embedded" },
      size: { type: "string", value: "small" },
      closable: { type: "boolean", value: false },
      minimizable: { type: "boolean", value: true },
      resizable: { type: "boolean", value: false },
      draggable: { type: "boolean", value: false },
      visible: {
        type: "handler",
        value: /* js */ `
          // Only show if i18n is enabled for the app
          const currentEditingApplication = GetVar("currentEditingApplication");
          const i18nEnabled = currentEditingApplication?.i18n?.enabled === true &&
                             currentEditingApplication?.i18n?.supportedLocales?.length > 1;

          // And a component is selected
          const selectedComponent = Utils.first($selectedComponents);

          // TranslationsEditor component handles showing "no translatable properties" message
          return i18nEnabled && !!selectedComponent;
        `
      }
    },
    children_ids: ["translations_panel_content"]
  },
  {
    uuid: "translations_panel_content",
    application_id: "1",
    name: "translations panel content",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "8px",
      gap: "8px"
    },
    input: {
      direction: { type: "string", value: "vertical" }
    },
    children_ids: ["translations_panel_properties"]
  },
  // Properties container - dynamically shows TranslationsInput for each property
  {
    uuid: "translations_panel_properties",
    application_id: "1",
    name: "translations panel properties",
    type: "translations_editor",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      gap: "8px"
    },
    input: {
      componentUuid: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.uuid || null;
        `
      }
    }
  }
];
