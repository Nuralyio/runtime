import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "access_control_panel_block",
    application_id: "1",
    name: "access control panel block",
    component_type: ComponentType.Panel,
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
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "12px",
      gap: "8px"
    },
    input: {
      direction: {
        type: "string",
        value: "vertical"
      }
    },
    childrenIds: ["access_control_label"]
  },
  {
    uuid: "access_control_label",
    name: "access control label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Configure page access permissions and authentication requirements.'
      }
    },
    style: {
      width: "100%",
      "font-size": "12px",
      color: "var(--nuraly-color-text-muted)",
      "line-height": "1.5"
    }
  }
];
