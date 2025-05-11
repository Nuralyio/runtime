import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "./common-editor-theme.ts";

export function generateComponents(containerUuid: string, cssVar: string, label: string) {
  return [
    {
      uuid: `${containerUuid}`,
      application_id: "1",
      name: "select helper color block",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        ...InputBlockContainerTheme
      },
      childrenIds: [
        `${containerUuid}_input_block`,
        `${containerUuid}_handler_block`
      ]
    },
    {
      uuid: `${containerUuid}_input_block`,
      application_id: "1",
      name: "select helper color input block",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "align-items": "center",
        "justify-content": "space-between"
      },
      childrenIds: [`${containerUuid}_label`]
    },
    {
      uuid: `${containerUuid}_label`,
      name: "select helper color label",
      component_type: ComponentType.TextLabel,
      application_id: "1",
      ...COMMON_ATTRIBUTES,
      input: {
        value: {
          type: "handler",
          value: /* js */ `
                        const label = '${label}';
                        return label;
                    `
        }
      },
      style: {
        "width": "90px"
      }
    },
    {
      uuid: `${containerUuid}_input`,
      name: "helper color input",
      application_id: "1",
      component_type: ComponentType.ColorPicker,
      event: {
        valueChange: /* js */ `
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                        if (selectedComponent) {
                            updateStyle(selectedComponent, "${cssVar}", EventData.value);
                        }
                   
                `
      },
      ...COMMON_ATTRIBUTES,
      style: {
        width: "33px",
        display: "block"
      },
      input: {
        value: {
          type: "handler",
          value: /* js */ `
                        
                            const selectedComponent = Utils.first(Vars.selectedComponents);
                            if (true) {
                                if (selectedComponent.style)
                                    return selectedComponent.style['${cssVar}'];
                            }
                        
                    `
        },
        state: {
          type: "handler",
          value: /* js */ `
                        
                            const selectedComponent = Utils.first(Vars.selectedComponents);
                            if (true) {
                                
                                ;
                                let state = 'enabled';
                                if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${cssVar}']) {
                                    state = 'disabled';
                                    return state;
                                }
                            }
                        
                    `
        }
      }
    },
    {
      uuid: `${containerUuid}_handler_block`,
      application_id: "1",
      name: "select helper color handler block",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "justify-content": "space-between"
      },
      childrenIds: [`${containerUuid}_input`, `${containerUuid}_handler`]
    },
    {
      uuid: `${containerUuid}_handler`,
      application_id: "1",
      component_type: ComponentType.Event,
      ...COMMON_ATTRIBUTES,
      styleHandlers: {},
      name: "helper color handler",
      style: {
        display: "block",
        width: "50px"
      },
      input: {
        value: {
          type: "handler",
          value: /* js */ `
                        const parameter = '${label}';
                        let helperColorHandler = '';
                        
                            const selectedComponent = Utils.first(Vars.selectedComponents);
                            if (true) {
                                
                                ;
                                helperColorHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${cssVar}'] || '';
                            }
                        
                        return [parameter, helperColorHandler];
                    `
        }
      },
      event: {
        codeChange: /* js */ `
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                        if (true) {
                            updateStyleHandlers(selectedComponent, '${cssVar}', EventData.value);
                        }
                    
                `
      }
    }
  ];
}