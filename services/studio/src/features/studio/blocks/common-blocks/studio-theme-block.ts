import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";
import { v4 as uuidv4 } from "uuid";


const COLLAPSE_COMMON_STYLE = {
  "--nuraly-spacing-collapse-padding": "0px",
  "--nuraly-spacing-collapse-content-padding": "0px",
  "margin-left": "5px",
  "--nuraly-shadow-collapse-hover": "none",
  "--nuraly-border-radius-collapse": "0",
  "--nuraly-border-radius-collapse-header": "0",
};
// Define interfaces for clarity
interface Item {
  label: string;
  cssVar: string;
  type?: "color" | "text" | "number" | "select";  // Input type (defaults to "color")
  defaultValue?: string;  // Default value for the input
  placeholder?: string;  // Placeholder for text/number inputs
  options?: Array<{ label: string; value: string; htmlContent?: string }>;  // Options for select inputs
}

interface Category {
  name: string;
  open?: boolean;
  items: Array<Category | Item>;
}

interface Mode {
  name: string;
  open?: boolean;
  items: Array<Category | Item>;
}

// Function to generate components
export const generateComponents = (colorVariables2: Mode[], mainContainerName: string) => {
  const components = [];

  // Generate parent container
  const parentContainer = {
    uuid: mainContainerName,
    application_id: "1",
    name: mainContainerName,
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: []
  };
  components.push(parentContainer);

  // Recursive function to handle categories
  const processCategory = (category: Category, parentUuid: string) => {
    const categoryCollapseUuid = uuidv4();
    const categoryCollapse = {
      uuid: categoryCollapseUuid,
      application_id: "1",
      name: `${category.name} Collapse`,
      component_type: "Collapse",
      style: {
        ...COLLAPSE_COMMON_STYLE
      },
      input: {
        size: {
          type: "string",
          value: "small"
        },
        components: {
          type: "array",
          value: [{
            blockName: `${categoryCollapseUuid}_vertical_container`,
            label: category.name,
            open: !!category.open
          }]
        }
      },
      childrenIds: [`${categoryCollapseUuid}_vertical_container`]
    };
    components.push(categoryCollapse);
    // Add category collapse to parent
    const parent = components.find(comp => comp.uuid === parentUuid);
    if (parent) {
      parent.childrenIds.push(categoryCollapseUuid);
    }

    // Category vertical container
    const categoryVerticalContainer = {
      uuid: `${categoryCollapseUuid}_vertical_container`,
      application_id: "1",
      name: `${category.name} Vertical Container`,
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column"
      },
      childrenIds: []
    };
    components.push(categoryVerticalContainer);

    // Process each item or subcategory
    category.items.forEach((itemOrCategory) => {
      if ("name" in itemOrCategory && "items" in itemOrCategory) {
        // It's a subcategory
        processCategory(itemOrCategory as Category, categoryVerticalContainer.uuid);
      } else {
        // It's a direct item
        processItem(itemOrCategory as Item, categoryVerticalContainer.uuid);
      }
    });
  };

  // Function to process individual items
  const processItem = (item: Item, parentUuid: string) => {
    const blockUuid = uuidv4();
    const inputBlockUuid = uuidv4();
    const handlerBlockUuid = uuidv4();
    const labelUuid = uuidv4();
    const inputUuid = uuidv4();
    const handlerUuid = uuidv4();

    // Determine input type (default to color)
    const inputType = item.type || "color";
    const defaultValue = item.defaultValue || (inputType === "color" ? "black" : "");
    const placeholder = item.placeholder || "";
    const options = item.options || [];

    // Set component type based on input type
    let componentType = "color_picker";
    let inputStyle: any = {};
    let inputConfig: any = {};

    if (inputType === "text") {
      componentType = "text_input";
      inputStyle = {
        width: "120px",
        "--nuraly-input-background-color": "#2a2a2a",
        "--nuraly-input-text-color": "#ffffff",
        "--nuraly-input-border-bottom": "1px solid #444"
      };
      inputConfig = {
        placeholder: {
          type: "string",
          value: placeholder
        }
      };
    } else if (inputType === "number") {
      componentType = "text_input";
      inputStyle = {
        width: "80px",
        "--nuraly-input-background-color": "#2a2a2a",
        "--nuraly-input-text-color": "#ffffff",
        "--nuraly-input-border-bottom": "1px solid #444"
      };
      inputConfig = {
        type: {
          type: "string",
          value: "number"
        },
        placeholder: {
          type: "string",
          value: placeholder
        }
      };
    } else if (inputType === "select") {
      componentType = "select";
      inputStyle = {
        width: "140px",
        "--nuraly-select-dropdown-max-height": "auto",
        "--nuraly-select-background-color": "#2a2a2a",
        "--nuraly-select-text-color": "#ffffff",
        "--nuraly-select-border": "1px solid #444",
        "--nuraly-select-hover-background": "#3a3a3a",
         "position": "relative",
      };
      // Set options and value in inputConfig for select
      inputConfig = {
        size:{
          type: "string",
          value: "small"
        },
        searchable: {
          type: "boolean",
          value: true
        },
        searchPlaceholder: {
          type: "string",
          value: "Search options..."
        },
        options: {
          type: "handler",
          value: /* js */ `return ${JSON.stringify(options)};`
        }
      };
    }

    // Create value handler based on input type
    let valueHandler = "";
    let eventUpdate = "";
    let eventType = "onChange";

    if (inputType === "color") {
      valueHandler = /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        return Editor.getComponentStyleForState(selectedComponent, "${item.cssVar}") ?? "${defaultValue}";
      `;
      eventUpdate = /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        
        updateStyle(selectedComponent, "${item.cssVar}", EventData.value);
      `;
    } else if (inputType === "select") {
      valueHandler = /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        return Editor.getComponentStyleForState(selectedComponent, "${item.cssVar}") ?? "${defaultValue}";
      `;
      eventUpdate = /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        updateStyle(selectedComponent, "${item.cssVar}", EventData.value);
      `;
      eventType = "onChange";
    } else {
      // For text and number inputs
      valueHandler = /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        return Editor.getComponentStyleForState(selectedComponent, "${item.cssVar}") ?? "${defaultValue}";
      `;
      eventUpdate = /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        updateStyle(selectedComponent, "${item.cssVar}", EventData.value);
      `;
    }

    const blockComponents = [
      {
        uuid: blockUuid,
        application_id: "1",
        name: `${item.label} block`,
        component_type: "vertical-container-block",
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          height: "40px",
          width: "290px"
        },
        childrenIds: [inputBlockUuid, handlerBlockUuid]
      },
      {
        uuid: inputBlockUuid,
        application_id: "1",
        name: `${item.label} input block`,
        component_type: "vertical-container-block",
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "flex-direction": "column",
          marginLeft: "18px"
        },
        childrenIds: [labelUuid]
      },
      {
        uuid: handlerBlockUuid,
        application_id: "1",
        name: `${item.label} handler block`,
        component_type: "vertical-container-block",
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "height": "40px",
          "vertical-align": "middle",
          "align-items": "center"
        },
        childrenIds: [inputUuid, handlerUuid]
      },
      {
        uuid: labelUuid,
        application_id: "1",
        name: `${item.label} label`,
        component_type: "text_label",
        ...COMMON_ATTRIBUTES,
        style: {
        },
        input: {
          size : {
            type: "string",
            value: "small"
          },
          value: {
            type: "handler",
            value: /* js */ `
              return "${item.label}";
            `
          }
        }
      },
      {
        uuid: inputUuid,
        application_id: "1",
        name: `${item.label} input`,
        component_type: componentType,
        ...COMMON_ATTRIBUTES,
        style: inputStyle,
        event: {
          [eventType]: eventUpdate
        },
        input: {
          ...inputConfig,
          value: {
            type: "handler",
            value: valueHandler
          }
        }
      },
      {
        uuid: handlerUuid,
        application_id: "1",
        name: `${item.label} handler`,
        component_type: "event",
        ...COMMON_ATTRIBUTES,
        input: {
          value: {
            type: "handler",
            value: /* js */ `
              const cssVarValue = "${item.cssVar}";
              const selectedComponent = Utils.first($selectedComponents);
              const handler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers[cssVarValue] || "";
              return [cssVarValue, handler];
            `
          }
        },
        event: {
          codeChange: /* js */ `
              const selectedComponent = Utils.first($selectedComponents);
              updateStyleHandlers(selectedComponent, "${item.cssVar}", EventData.value);
          `
        }

      }
    ];

    // Add block UUIDs to the parent container's children
    const parent = components.find(comp => comp.uuid === parentUuid);
    if (parent) {
      parent.childrenIds.push(blockUuid);
    }

    components.push(...blockComponents);
  };

  // Iterate through modes
  colorVariables2.forEach((mode) => {
    // Create mode collapse
    const modeCollapseUuid = uuidv4();
    const modeCollapse = {
      uuid: modeCollapseUuid,
      application_id: "1",
      name: `${mode.name} Collapse`,
      component_type: "Collapse",
      style: {
       ...COLLAPSE_COMMON_STYLE
      },
      input: {
        size: {
          type: "string",
          value: "small"
        },
        components: {
          type: "array",
          value: [{
            blockName: `${modeCollapseUuid}_vertical_container`,
            label: mode.name,
            open: !!mode.open
          }]
        }
      },
      childrenIds: [`${modeCollapseUuid}_vertical_container`]
    };
    components.push(modeCollapse);
    parentContainer.childrenIds.push(modeCollapseUuid);

    // Generate vertical containers for each mode
    const modeVerticalContainerUuid = `${modeCollapseUuid}_vertical_container`;
    const modeVerticalContainer = {
      uuid: modeVerticalContainerUuid,
      application_id: "1",
      name: `${mode.name} Vertical Container`,
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column"
      },
      childrenIds: []
    };
    components.push(modeVerticalContainer);
    modeCollapse.childrenIds = [modeVerticalContainerUuid];

    // Process each item or category in the mode
    mode.items.forEach((itemOrCategory) => {
      if ("name" in itemOrCategory && "items" in itemOrCategory) {
        // It's a category
        processCategory(itemOrCategory as Category, modeVerticalContainerUuid);
      } else {
        // It's a direct item
        processItem(itemOrCategory as Item, modeVerticalContainerUuid);
      }
    });
  });

  return components;
};

// Example usage
const colorVariables2: Mode[] = [
  {
    name: "Mode 1",
    open: true,
    items: [
      {
        name: "Category 1",
        open: true,
        items: [
          {
            label: "Item 1",
            cssVar: "--color-item-1"
          },
          {
            name: "Subcategory 1.1",
            open: false,
            items: [
              {
                label: "Item 1.1",
                cssVar: "--color-item-1-1"
              }
            ]
          }
        ]
      },
      {
        label: "Direct Item 1",
        cssVar: "--color-direct-item-1"
      }
    ]
  },
  {
    name: "Mode 2",
    open: false,
    items: [
      {
        label: "Direct Item 2",
        cssVar: "--color-direct-item-2"
      }
    ]
  }
];

const mainContainerName = "MainContainer";

// Generate components
const components = generateComponents(colorVariables2, mainContainerName);
