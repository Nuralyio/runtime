import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { v4 as uuidv4 } from "uuid";

// Define interfaces for clarity
interface Item {
  label: string;
  cssVar: string;
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
    applicationId: "1",
    name: mainContainerName,
    component_type: ComponentType.Container,
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
      applicationId: "1",
      name: `${category.name} Collapse`,
      component_type: ComponentType.Collapse,
      style: {
        "--hy-collapse-content-small-size-padding": "5px",
        "--hy-collapse-font-weight": "normal",
        "--hy-collapse-border-radius": "0px",
        "--hy-collapse-width": "292px",
        "--hy-collapse-border": "none",
        "--hy-collapse-border-bottom": "none",
        "--hy-collapse-local-header-background-color": "none",
        "--hy-collapse-header-collapsed-background-color": "none"
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
            label: category.name.toUpperCase(),
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
      applicationId: "1",
      name: `${category.name} Vertical Container`,
      component_type: ComponentType.Container,
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

    const blockComponents = [
      {
        uuid: blockUuid,
        applicationId: "1",
        name: `${item.label} block`,
        component_type: ComponentType.Container,
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          width: "290px"
        },
        childrenIds: [inputBlockUuid, handlerBlockUuid]
      },
      {
        uuid: inputBlockUuid,
        applicationId: "1",
        name: `${item.label} input block`,
        component_type: ComponentType.Container,
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "flex-direction": "column",
          marginLeft: "21px"
        },
        childrenIds: [labelUuid]
      },
      {
        uuid: handlerBlockUuid,
        applicationId: "1",
        name: `${item.label} handler block`,
        component_type: ComponentType.Container,
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
        applicationId: "1",
        name: `${item.label} label`,
        component_type: ComponentType.TextLabel,
        ...COMMON_ATTRIBUTES,
        style: {
          "font-size": "14px",
          "font-weight": "bold"
        },
        input: {
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
        applicationId: "1",
        name: `${item.label} input`,
        component_type: ComponentType.ColorPicker,
        ...COMMON_ATTRIBUTES,
        style: {},
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
          `
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
            `
          }
        }
      },
      {
        uuid: handlerUuid,
        applicationId: "1",
        name: `${item.label} handler`,
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
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
            `
          }
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
      applicationId: "1",
      name: `${mode.name} Collapse`,
      component_type: ComponentType.Collapse,
      style: {
        "--hy-collapse-content-small-size-padding": "5px",
        "--hy-collapse-font-weight": "normal",
        "--hy-collapse-border-radius": "0px",
        "--hy-collapse-width": "292px",
        "--hy-collapse-border": "none",
        "--hy-collapse-border-bottom": "1px solid #ccc",
        "--hy-collapse-local-header-background-color": "none"
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
            label: mode.name.toUpperCase(),
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
      applicationId: "1",
      name: `${mode.name} Vertical Container`,
      component_type: ComponentType.Container,
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
