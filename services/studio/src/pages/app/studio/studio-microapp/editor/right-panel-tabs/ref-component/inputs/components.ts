import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export const ComponentRefComponentSelector = [
  {
    uuid: "component_refs_block",
    application_id: "1",
    name: "datepicker locale  block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["component_ref_local_input_block", "component_select_handler_block"]
  },
  {
    uuid: "component_ref_local_input_block",
    application_id: "1",
    name: "datepicker local input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["component_refs_label_container"]
  },
  {
    uuid: "component_refs_label_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },

    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["component_Fef_locale_label"]
  },
  {
    uuid: "component_Fef_locale_label",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px;"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Select Component';
             return label;
            `
      }
    }
  },

  {
    uuid: "component_ref_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "locale select",
    input: {
        placeholder: {
            type: "string",
            value: 'Select component'
          },
      value: {
        type: "handler",
        value: /* js */ ` 
        const selectedComponent = Utils.first(Editor.selectedComponents);
        const currentApplicationComponent = Editor.components.filter(
          (component) => component.application_id == selectedComponent.application_id && component.uuid !==selectedComponent.uuid
        );
        
        let locale = selectedComponent.input?.ref?.value ?? '';
        let selectedComponentRef;
        
        const options = currentApplicationComponent.map((component) => ({
          label: component.name,
          value: component.uuid,
        }));
        
        if (locale) {
          selectedComponentRef = options.find((option) => option.value == locale);
        }
        
        const result = [options, [selectedComponentRef ? selectedComponentRef.value : ""]];
        return result;
                `
      },
      state: {
        type: "handler",
        value: /* js */`
            try{
                const selectedComponent = Utils.first(Editor.selectedComponents);
                let state = "unabled";
                if(selectedComponent.input?.ref?.type =="handler" && selectedComponent.input?.ref?.value){
                   state = "disabled"
               }
               return state;

        }catch(e){
            console.log(e);
        }
            `
      }
    },
    style: {
      ...SelectTheme
    },
    event: {
      changed: /* js */ `

        const selectedComponent = Utils.first(Editor.selectedComponents);
        const localeValue = EventData.value?EventData.value:''
        updateInput(selectedComponent, "ref", 'string',localeValue);

      `
    }
  },
  {
    uuid: "component_select_handler_block",
    application_id: "1",
    name: "locale handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["component_ref_select", "locale_handler"]
  },
  {
    uuid: "locale_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "locale handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='ref';
                let refHandler=''
                const selectedComponent = Utils.first(Editor.selectedComponents);
                if(selectedComponent?.input?.ref?.type =='handler' && selectedComponent?.input?.ref?.value){
                    refHandler = selectedComponent?.input?.ref?.value
                }
                return [parameter,refHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
      const selectedComponent = Utils.first(Editor.selectedComponents);
      if(EventData.value != selectedComponent?.input?.ref?.value)
        updateInput(selectedComponent,'ref','handler',EventData.value);
      `
    }
  }

];