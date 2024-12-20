import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "./common-editor-theme.ts";

export function generateComponents(containerUuid: string, cssVar: string, label: string) {
    return [
        {
            uuid: `${containerUuid}`,
            applicationId: "1",
            name: "select helper color block",
            component_type: ComponentType.VerticalContainer,
            ...COMMON_ATTRIBUTES,
            style: {
                ...InputBlockContainerTheme
            },
            childrenIds: [
                `${containerUuid}_input_block`,
                `${containerUuid}_handler_block`
            ],
        },
        {
            uuid: `${containerUuid}_input_block`,
            applicationId: "1",
            name: "select helper color input block",
            component_type: ComponentType.VerticalContainer,
            ...COMMON_ATTRIBUTES,
            style: {
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'space-between'
            },
            childrenIds: [`${containerUuid}_label`],
        },
        {
            uuid: `${containerUuid}_label`,
            name: "select helper color label",
            component_type: ComponentType.TextLabel,
            applicationId: "1",
            ...COMMON_ATTRIBUTES,
            input: {
                value: {
                    type: 'handler',
                    value: /* js */ `
                        const label = '${label}';
                        return label;
                    `
                }
            },
            style: {
                'width': '90px'
            },
        },
        {
            uuid: `${containerUuid}_input`,
            name: "helper color input",
            applicationId: "1",
            component_type: ComponentType.ColorPicker,
            event: {
                valueChange: /* js */ `
                    try {
                        const selectedComponents = GetVar("selectedComponents") || [];
                        if (selectedComponents.length) {
                            const selectedComponent = selectedComponents[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                            updateStyle(currentComponent, "${cssVar}", EventData.value);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                `
            },
            ...COMMON_ATTRIBUTES,
            style: {
                width: "33px",
                display: 'block'
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
                                if (currentComponent?.style)
                                    return currentComponent.style['${cssVar}'];
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    `
                },
                state: {
                    type: "handler",
                    value: /* js */ `
                        try {
                            const selectedComponents = GetVar("selectedComponents") || [];
                            if (selectedComponents.length) {
                                const selectedComponent = selectedComponents[0];
                                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                                let state = 'enabled';
                                if (currentComponent.styleHandlers && currentComponent.styleHandlers['${cssVar}']) {
                                    state = 'disabled';
                                    return state;
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    `
                }
            }
        },
        {
            uuid: `${containerUuid}_handler_block`,
            applicationId: "1",
            name: "select helper color handler block",
            component_type: ComponentType.VerticalContainer,
            ...COMMON_ATTRIBUTES,
            style: {
                display: 'flex',
                'justify-content': 'space-between',
            },
            childrenIds: [`${containerUuid}_input`, `${containerUuid}_handler`],
        },
        {
            uuid: `${containerUuid}_handler`,
            applicationId: "1",
            component_type: ComponentType.Event,
            ...COMMON_ATTRIBUTES,
            styleHandlers: {},
            name: "helper color handler",
            style: {
                display: 'block',
                width: '50px',
            },
            input: {
                value: {
                    type: 'handler',
                    value: /* js */ `
                        const parameter = '${label}';
                        let helperColorHandler = '';
                        try {
                            const selectedComponents = GetVar("selectedComponents") || [];
                            if (selectedComponents.length) {
                                const selectedComponent = selectedComponents[0];
                                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                                helperColorHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['${cssVar}'] || '';
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        return [parameter, helperColorHandler];
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
                            updateStyleHandlers(currentComponent, '${cssVar}', EventData.value);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                `
            },
        },
    ];
}