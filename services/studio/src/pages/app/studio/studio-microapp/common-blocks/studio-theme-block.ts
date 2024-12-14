import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import cssVariables from "../editor/right-panel-tabs/button/theme/css-vars.ts";
import { v4 as uuidv4 } from "uuid";

// Function to generate components
export const generateComponents = (colorVariables2, mainContainerName) => {
  const components = [];

  // Generate parent container
  const parentContainer = {
    uuid: mainContainerName,
    applicationId: "1",
    name: mainContainerName,
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
    },
    childrenIds: []
  };
  components.push(parentContainer);

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
          value:  [{
            blockName: `${modeCollapseUuid}_vertical_container`,
            label: mode.name.toUpperCase(),
            open : !!mode.open
          }]
        }
      },
      childrenIds: [`${modeCollapseUuid}_vertical_container`]
    };
    components.push(modeCollapse);
    parentContainer.childrenIds.push(modeCollapseUuid);

    // Generate vertical containers for each category
    const categoryContainerUuid = `${modeCollapseUuid}_vertical_container`;
    const categoryContainerChildrenIds = [];

    mode.items.forEach((category) => {
      const categoryCollapseUuid = `${categoryContainerUuid}_${category.name.toLowerCase().replace(/\s+/g, "_")}_collapse`;

      // Category collapse
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
          "--hy-collapse-header-collapsed-background-color": "none",
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
              open : !!category.open
            }]
          }
        }
      };
      components.push(categoryCollapse);
      categoryContainerChildrenIds.push(categoryCollapseUuid);

      // Category vertical container
      const categoryVerticalContainer = {
        uuid: `${categoryCollapseUuid}_vertical_container`,
        applicationId: "1",
        name: `${category.name} Vertical Container`,
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "flex-direction": "column",
        },
        childrenIds: []
      };

      // Generate blocks for each item in the category
      const generatedBlocks = category.items.map((item) => {
        const blockUuid =  uuidv4();
        const inputBlockUuid =  uuidv4();
        const handlerBlockUuid =  uuidv4();
        const labelUuid =  uuidv4();
        const inputUuid =  uuidv4();
        const handlerUuid =  uuidv4();

        const blockComponents = [
          {
            uuid: blockUuid,
            applicationId: "1",
            name: `${item.label} block`,
            component_type: ComponentType.VerticalContainer,
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
            component_type: ComponentType.VerticalContainer,
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
            component_type: ComponentType.VerticalContainer,
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
            style: {
            },
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
        `,
              },
            },
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

        // Add block UUIDs to the category vertical container's children
        categoryVerticalContainer.childrenIds.push(blockUuid);

        return blockComponents;
      }).flat();

      components.push(categoryVerticalContainer);
      components.push(...generatedBlocks);
    });

    // Add category container to the mode collapse
    const categoryContainer = {
      uuid: categoryContainerUuid,
      applicationId: "1",
      name: `${mode.name} Vertical Container`,
      component_type: ComponentType.VerticalContainer,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column",
      },
      childrenIds: categoryContainerChildrenIds
    };
    components.push(categoryContainer);
    modeCollapse.childrenIds = [categoryContainerUuid];
  });

  return components;
};

// Example usage


