// Collection component that displays the list of available components
export const componentCollection = {
  uuid: "component_collection",
  name: "Component Collection",
  application_id: "1",
  component_type: "Collection",
  style: {
    "--columns": "9",
    "margin-left": "10px",
  },
  input: {
    data: {
      type: "handler",
      value: /* js */`
        const inputOptions = [
          { id: "text_input", icon: "text-cursor-input", label: "Text Input" },
          { id: "button", icon: "mouse", label: "Button" },
          { id: "checkbox", icon: "square-check", label: "Checkbox" },
          { id: "select", icon: "list-video", label: "Select" },
          { id: "dropdown", icon: "grip-vertical", label: "Dropdown" },
          { id: "menu", icon: "menu", label: "Menu" },
          { id: "file-upload", icon: "file-up", label: "File Upload" },
          { id: "datepicker", icon: "calendar", label: "DatePicker" },
          { id: "textarea", icon: "align-left", label: "Textarea" },
          { id: "slider", icon: "sliders", label: "Slider" }
        ];

        const displayOptions = [
          { id: "text_label", icon: "case-sensitive", label: "Text Label" },
          { id: "rich-text", icon: "whole-word", label: "Rich Text" },
          { id: "badge", icon: "badge", label: "Badge" },
          { id: "tag", icon: "tag", label: "Tag" },
          { id: "card", icon: "credit-card", label: "Card" },
          { id: "icon", icon: "badge", label: "Icon" },
          { id: "code-block", icon: "file-code", label: "Code" },
          { id: "embed-url", icon: "file-code", label: "Embed URL" },
          { id: "link", icon: "link", label: "Link" }
        ];

        const dataOptions = [
          { id: "table", icon: "table", label: "Table" },
          { id: "collection", icon: "database", label: "Collection" }
        ];

        const layoutOptions = [
          { id: "container", icon: "grip-vertical", label: "Container" },
          { id: "ref-component", icon: "asterisk", label: "Ref Component" }
        ];

        const mediaOptions = [
          { id: "image", icon: "image", label: "Image" },
          { id: "video", icon: "video", label: "Video" },
          { id: "document", icon: "asterisk", label: "Document" }
        ];

        const applicationOptions = [
          { id: "microapp", icon: "microchip", label: "MicroApp" }
        ];

        return [
          ...inputOptions,
          ...displayOptions,
          ...dataOptions,
          ...layoutOptions,
          ...mediaOptions,
          ...applicationOptions
        ];
      `
    }
  },
  childrenIds: ["component_item_container"]
};

// Container for each component item - card style
export const componentItemContainer = {
  uuid: "component_item_container",
  name: "Component Item Container",
  application_id: "1",
  component_type: "vertical-container-block",
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    "margin": "4px",
    "align-items": "center",
    "justify-content": "center",
    "cursor": "pointer",
    "border": "1px solid #e5e7eb",
    "border-radius": "8px",
    "background-color": "#ffffff",
    "transition": "all 0.2s",
    "min-height": "90px",
    "width": "122px",
    "height": "120px",
    "margin-bottom": "5px",
    ":hover": { // this is good try it
      "border-color": "#d1d5db",
      "box-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)"
    }
  },
  event: {
    onClick: /* js */`
      console.log("Component clicked:", Item.id);
      // Add component to canvas
      // AddComponentToCanvas(Item.id);
    `
  },
  childrenIds: ["component_item_icon", "component_item_label"]
};

// Icon for each component
export const componentItemIcon = {
  uuid: "component_item_icon",
  name: "Component Item Icon",
  application_id: "1",
  component_type: "Icon",
  input: {
    icon: {
      type: "handler",
      value: /* js */
      `return Item.icon`
    },
    size: {
      type: "string",
      value: "large"
    }
  },
  style: {
    "color": "#374151",
    "margin-bottom": "4px"
  }
};

// Label for each component
export const componentItemLabel = {
  uuid: "component_item_label",
  name: "Component Item Label",
  application_id: "1",
  component_type: "text_label",
  input: {
    value: {
      type: "handler",
      value: /* js */`return Item.label`
    }
  },
  style: {
    "font-size": "12px",
    "color": "#374151",
    "text-align": "center",
    "line-height": "1.2",
    "width": "100px",
    "--nuraly-font-weight-medium": "350"
  }
};

export const componentCollectionComponents = [
  componentCollection,
  componentItemContainer,
  componentItemIcon,
  componentItemLabel
];
