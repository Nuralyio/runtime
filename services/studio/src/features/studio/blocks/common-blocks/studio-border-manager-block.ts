import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

// Create border manager components following the theme block pattern
// Uses Editor.getComponentStyleForState for pseudo-state support (:hover, :focus, :active, etc.)
const containerComponent = {
  uuid: "border_manager_vertical_container",
  name: "Border Manager Container",
  application_id: "1",
  component_type: "vertical-container-block",
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    width: "100%"
  },
  childrenIds: ["border_manager_label", "border_manager_display_block"]
};

const labelComponent = {
  uuid: "border_manager_label",
  name: "text_label",
  application_id: "1",
  component_type: "text_label",
  ...COMMON_ATTRIBUTES,
  parameters: { value: " " },
  input: {
    value: {
      type: "string",
      value: " "
    }
  },
  style: { width: "0px", display: "none" }
};

const borderManagerComponent = {
  uuid: "border_manager_display_block",
  name: "border manager display block",
  application_id: "1",
  component_type: "border_manager",
  ...COMMON_ATTRIBUTES,
  style: { width: "100%", display: "block" },
  input: {
    value: {
      type: "handler",
      value: /* js */`
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (!selectedComponent) return {};

        // Use Editor.getComponentStyleForState to support pseudo-states (:hover, :focus, :active)
        // This respects Vars.selected_component_style_state
        return {
          style: {
            'border': Editor.getComponentStyleForState(selectedComponent, 'border') || '',
            'border-top': Editor.getComponentStyleForState(selectedComponent, 'border-top') || '',
            'border-right': Editor.getComponentStyleForState(selectedComponent, 'border-right') || '',
            'border-bottom': Editor.getComponentStyleForState(selectedComponent, 'border-bottom') || '',
            'border-left': Editor.getComponentStyleForState(selectedComponent, 'border-left') || '',
            'border-top-left-radius': Editor.getComponentStyleForState(selectedComponent, 'border-top-left-radius') || '',
            'border-top-right-radius': Editor.getComponentStyleForState(selectedComponent, 'border-top-right-radius') || '',
            'border-bottom-left-radius': Editor.getComponentStyleForState(selectedComponent, 'border-bottom-left-radius') || '',
            'border-bottom-right-radius': Editor.getComponentStyleForState(selectedComponent, 'border-bottom-right-radius') || '',
          },
          // Pass the current state for UI feedback
          currentState: Vars.selected_component_style_state || 'default'
        };
      `
    }
  },
  event: {
    onChange: /* js */`
      const selectedComponent = Utils.first(Vars.selectedComponents);
      if (!selectedComponent) return;

      const property = EventData.property;
      const value = EventData.value;

      // updateStyle automatically handles pseudo-states via Vars.selected_component_style_state
      // If :hover is selected, it will update style[':hover'][property] instead of style[property]
      updateStyle(selectedComponent, property, value);
    `
  }
};

const collapseComponent = {
  uuid: "border_manager_collapse",
  name: "Border Manager Collapse",
  application_id: "1",
  component_type: "Collapse",
  ...COMMON_ATTRIBUTES,
  style: {
    marginTop: "8px",
    marginBottom: "8px",
    "--nuraly-spacing-collapse-padding": "0px",
    "--nuraly-spacing-collapse-content-padding": "0px",
    "--nuraly-shadow-collapse-hover": "none",
    "--nuraly-border-radius-collapse": "0",
    "--nuraly-border-radius-collapse-header": "0"
  },
  input: {
    size: {
      type: "string",
      value: "small"
    },
    components: {
      type: "array",
      value: [{
        blockName: "border_manager_vertical_container",
        label: "Border",
        open: false
      }]
    }
  },
  childrenIds: ["border_manager_vertical_container"]
};

export const studioBorderManagerBlock = [
  collapseComponent,
  containerComponent,
  labelComponent,
  borderManagerComponent
];

export default studioBorderManagerBlock;
