
import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";
export const StudioLanguageThemeInput  = [
  {
    uuid: "code_language_block",
    application_id: "1",
    name: "cod language block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["code_language_radio_block", "code_language_handler_block"]
  },
  {
    uuid: "code_language_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["code_language_label"]
  },
  {
    uuid: "code_language_label",
    name: "cod language label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const typeLabel = 'Language';
                return typeLabel;
                `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "code_language_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "cod language select",
    input: {
      placeholder: {
        type: "string",
        value: 'Automatique'
      },
      value: {
        type: "handler",
        value: /* js */ `
              const options = [
                { label: "JS/Typescript", value: "javascript" },
                { label: "HTML", value: "html" },
                { label: "CSS", value: "css" },
                { label: "JSON", value: "json" }      
                
              ];
              return [options, [[
                Utils.first(Vars.selectedComponents)?.input?.language?.value ?? "javascript"
              ]]];
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                const selectedComponent = Utils.first(Vars.selectedComponents);
                let isDisabled = 'enabled';
                if (selectedComponent?.input?.language?.type === 'handler' &&
                  selectedComponent?.input?.language?.value ) {
                    isDisabled = 'disabled';
                }
                return isDisabled;
                `
      }
    },
    style: {
      display: "block",
      ...SelectTheme
    },
    event: {
      changed: /* js */ `
              const selectedComponent = Utils.first(Vars.selectedComponents);
              const typeValue = EventData.value || 'default';
              updateInput(selectedComponent, "language", 'string',typeValue);
            `
    }
  },
  {
    uuid: "code_language_handler_block",
    application_id: "1",
    name: "cod language handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["code_language_select", "code_language_handler"]
  },
  {
    uuid: "code_language_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "type handler",
    style: {
      display: "block",
      "--hybrid-button-width": "120px"

    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const selectedComponent = Utils.first(Vars.selectedComponents);
                const handlerValue = selectedComponent?.input?.language?.type === 'handler'
                ? selectedComponent?.input?.language.value
                : '';
                return ['language', handlerValue];
                `
      }
    },
    event: {
      codeChange: /* js */ `

      const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.language?.value) {
          updateInput(selectedComponent, 'language', 'handler', EventData.value);
        }
            `
    }
  }
];