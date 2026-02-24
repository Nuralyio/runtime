import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

// Create box model components
const containerComponent = {
  uuid: "box_model_vertical_container",
  name: "Box Model Container",
  application_id: "1",
  type: "container",
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    width: "100%"
  },
  children_ids: ["box_model_label", "box_model_display_block"]
};

const labelComponent = {
  uuid: "box_model_label",
  name: "text_label",
  application_id: "1",
  type: "text_label",
  ...COMMON_ATTRIBUTES,
  parameters: { value: " " },
  input: {
    value: {
      type: "string",
      value: " "
    }
  },
  style: { width: "90px" }
};

const boxModelComponent = {
  uuid: "box_model_display_block",
  name: "box model display block",
  application_id: "1",
  type: "box_model",
  ...COMMON_ATTRIBUTES,
  style: { width: "100%", display: "block" },
  input: {
    value: {
      type: "handler",
      value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        if (!selectedComponent) return {};

        const propertiesToExtract = [
          "margin-left",
          "margin-top",
          "margin-bottom",
          "margin-right",
          "padding-left",
          "padding-right",
          "padding-top",
          "padding-bottom",
          "border",
          "width",
          "height"
        ];

        const extractedStyles = {};
        const componentStyle = selectedComponent.style || {};

        propertiesToExtract.forEach((prop) => {
          const propValue = componentStyle[prop];
          if (propValue) {
            const match = propValue.match(/^(\\d+(?:\\.\\d+)?)(.*)$/);
            const value = match && match[1] ? match[1] : '';
            const unit = match && match[2] ? match[2] : '';

            extractedStyles[prop] = {
              value: parseFloat(value) || 0,
              unit: unit || 'px'
            };
          } else {
            extractedStyles[prop] = {
              value: 0,
              unit: 'px'
            };
          }
        });

        return extractedStyles;
      `
    }
  },
  event: {
    onChange: /* js */`
      const selectedComponent = Utils.first($selectedComponents);
      if (!selectedComponent) return;

      const property = EventData.property;
      const value = EventData.value;

      // Update the component style with the new value
      updateStyle(selectedComponent, property, value);
    `
  }
};

const collapseComponent = {
  uuid: "box_model_collapse",
  name: "Box Model Collapse",
  application_id: "1",
  type: "collapse",
  ...COMMON_ATTRIBUTES,
  style: {
    marginTop: "16px",
    marginBottom: "16px",
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
        blockName: "box_model_vertical_container",
        label: "Box Model",
        open: true
      }]
    }
  },
  children_ids: ["box_model_vertical_container"]
};

export default [
  collapseComponent,
  containerComponent,
  labelComponent,
  boxModelComponent
];
