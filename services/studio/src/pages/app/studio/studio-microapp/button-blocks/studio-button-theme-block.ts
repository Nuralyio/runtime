import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

// Array of labels and corresponding CSS variables
const colorVariables = [
  { label: "Background Color", cssVar: "--hybrid-button-background-color", category: "general" },
  { label: "Text Color", cssVar: "--hybrid-button-text-color", category: "general" },
  { label: "Hover Border Color", cssVar: "--hybrid-button-hover-border-color", category: "hover" },
  { label: "Hover Color", cssVar: "--hybrid-button-hover-color", category: "hover" },
  { label: "Active Border Color", cssVar: "--hybrid-button-active-border-color", category: "active" },
  { label: "Active Color", cssVar: "--hybrid-button-active-color", category: "active" },
  { label: "Disabled Background Color", cssVar: "--hybrid-button-disabled-background-color", category: "disabled" },
  { label: "Disabled Text Color", cssVar: "--hybrid-button-disabled-text-color", category: "disabled" },
  { label: "Disabled Border Color", cssVar: "--hybrid-button-disabled-border-color", category: "disabled" },
  { label: "Danger Text Color", cssVar: "--hybrid-button-danger-text-color", category: "danger" },
  { label: "Danger Background Color", cssVar: "--hybrid-button-danger-background-color", category: "danger" },
  { label: "Danger Border Color", cssVar: "--hybrid-button-danger-border-color", category: "danger" },
  { label: "Danger Dashed Border Color", cssVar: "--hybrid-button-danger-dashed-border-color", category: "danger" },
  { label: "Danger Disabled Background Color", cssVar: "--hybrid-button-danger-disabled-background-color", category: "danger_disabled" },
  { label: "Danger Disabled Text Color", cssVar: "--hybrid-button-danger-disabled-text-color", category: "danger_disabled" },
  { label: "Danger Disabled Border Color", cssVar: "--hybrid-button-danger-disabled-border-color", category: "danger_disabled" },
  { label: "Danger Hover Background Color", cssVar: "--hybrid-button-danger-hover-background-color", category: "danger_hover" },
  { label: "Danger Hover Border Color", cssVar: "--hybrid-button-danger-hover-border-color", category: "danger_hover" },
  { label: "Danger Active Background Color", cssVar: "--hybrid-button-danger-active-background-color", category: "danger_active" },
  { label: "Danger Active Border Color", cssVar: "--hybrid-button-danger-active-border-color", category: "danger_active" }
];

// Define collapse containers for each category
const categories = ["general", "hover", "active", "disabled", "danger", "danger_disabled", "danger_hover", "danger_active"];

const collapseContainers = categories.map((category) => ({
  uuid: `${category}_collapse_container`,
  applicationId: "1",
  name: `${category} collapse container`,
  component_type: ComponentType.VerticalContainer,
  ...COMMON_ATTRIBUTES,
  style: {
  },
  childrenIds: [`${category}_collapse`],
}));

const collapseComponents = categories.map((category) => ({
  uuid: `${category}_collapse`,
  applicationId: "1",
  name: `${category} collapse`,
  component_type: ComponentType.Collapse,
  style: {
    "--hy-collapse-content-small-size-padding": "5px",
    "--hy-collapse-font-weight": "normal",
    "--hy-collapse-border-radius": "0px",
    "--hy-collapse-width": "292px",
    "--hy-collapse-border": "none",
    '--hy-collapse-border-bottom': '1px solid #ccc',
    '--hy-collapse-local-header-background-color': '#2d2d2d'

  },
  input: {
    size: {
      type: "handler",
      value: /* js */ `
        const size = "small";
        return size;
      `,
    },
    components: {
      type: "handler",
      value: /* js */ `
        return [{ blockName: "${category}_vertical_container", label: "${category.charAt(0).toUpperCase() + category.slice(1)}" }];
      `,
    },
  },
  childrenIds: [`${category}_vertical_container`],
}));

const verticalContainers = categories.map((category) => ({
  uuid: `${category}_vertical_container`,
  applicationId: "1",
  name: `${category} vertical container`,
  component_type: ComponentType.VerticalContainer,
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    "flex-direction": "column",
    gap: "10px",
  },
  childrenIds: colorVariables
    .filter((item) => item.category === category)
    .map((item) => `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_block`),
}));

// Generate individual blocks
const generatedBlocks = colorVariables.flatMap((item) => [
  {
    uuid: `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_block`,
    applicationId: "1",
    name: `${item.label} block`,
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center",
      "margin-top": "10px",
    },
    childrenIds: [`${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_input_block`, `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_handler_block`],
  },
  {
    uuid: `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_input_block`,
    applicationId: "1",
    name: `${item.label} input block`,
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
    },
    childrenIds: [`${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_label`, `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_input`],
  },
  {
    uuid: `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_label`,
    name: `${item.label} label`,
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const label = "${item.label}";
          return label;
        `,
      },
    },
    style: {
      width: "90px",
      display: "block",
    },
  },
  {
    uuid: `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_input`,
    name: `${item.label} input`,
    applicationId: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
        try {
          const selectedComponents = GetVar("selectedComponents") || [];
          if (selectedComponents.length) {
            const selectedComponent = selectedComponents[0];
            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
            updateStyle(currentComponent, "${item.cssVar}", EventData.value);
          }
        } catch (error) {
          console.log(error);
        }
      `,
    },
    ...COMMON_ATTRIBUTES,
    style: {
      width: "50px",
      display: "block",
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          try {
            const selectedComponents = GetVar("selectedComponents") || [];
            if (selectedComponents.length) {
              const selectedComponent = selectedComponents[0];
              const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
              return currentComponent.style?.["${item.cssVar}"] || "black";
            }
          } catch (e) {
            console.log(e);
          }
        `,
      },
      state: {
        type: "handler",
        value: /* js */ `
          try {
            const selectedComponents = GetVar("selectedComponents") || [];
            if (selectedComponents.length) {
              const selectedComponent = selectedComponents[0];
              const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
              let state = "enabled";
              if (currentComponent?.styleHandlers && currentComponent.styleHandlers["${item.cssVar}"]) {
                state = "disabled";
              }
              return state;
            }
          } catch (e) {
            console.log(e);
          }
        `,
      },
    },
  },
  {
    uuid: `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_handler_block`,
    applicationId: "1",
    name: `${item.label} handler block`,
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      width: "50px",
      display: "flex",
      "justify-content": "space-between",
    },
    childrenIds: [`${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_handler`],
  },
  {
    uuid: `${item.cssVar.replace(/[^a-z0-9]/gi, "_")}_handler`,
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: `${item.label} handler`,
    style: {
      display: "block",
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const parameter = "${item.cssVar}";
          let handler = "";
          try {
            const selectedComponents = GetVar("selectedComponents") || [];
            if (selectedComponents.length) {
              const selectedComponent = selectedComponents[0];
              const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
              handler = currentComponent?.styleHandlers && currentComponent?.styleHandlers["${item.cssVar}"] || "";
            }
          } catch (error) {
            console.log(error);
          }
          return [parameter, handler];
        `,
      },
    },
    event: {
      codeChange: /* js */ `
        try {
          const selectedComponents = GetVar("selectedComponents") || [];
          if (selectedComponents.length) {
            const selectedComponent = selectedComponents[0];
            let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
            updateStyleHandlers(currentComponent, "${item.cssVar}", EventData.value);
          }
        } catch (error) {
          console.log(error);
        }
      `,
    },
  },
])

// Wrap all blocks in the parent container
export default [
  {
    uuid: "parent_color_container",
    applicationId: "1",
    name: "Parent Color Container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "10px",
    },
    childrenIds: [ ...collapseContainers.map((container) => container.uuid),'test-test-label'],
  },
  {
    uuid: `test-test-label`,
    name: `test-test-label`,
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const label = "test label";
          return label;
        `,
      },
    },
    style: {
      width: "90px",
      display: "block",
    },
  },
  ...collapseContainers,
  ...collapseComponents,
  ...verticalContainers,
  ...generatedBlocks,
];
