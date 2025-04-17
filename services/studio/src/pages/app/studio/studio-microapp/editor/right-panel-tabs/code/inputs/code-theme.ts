
import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";
export const StudiocodeThemeInput  = [
  {
    uuid: "code_theme_block",
    application_id: "1",
    name: "cod theme block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["code_theme_radio_block", "code_theme_handler_block"]
  },
  {
    uuid: "code_theme_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["code_theme_label"]
  },
  {
    uuid: "code_theme_label",
    name: "cod theme label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const typeLabel = 'Theme';
                return typeLabel;
                `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "code_theme_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "cod theme select",
    input: {
      placeholder: {
        type: "string",
        value: 'Automatique'
      },
      value: {
        type: "handler",
        value: /* js */ `
              const options = [
                { label: "Automatique", value: "" },
                { label: "Visual studio", value: "vs" },
                { label: "Visual studio dark", value: "vs-dark" },
              ];
              return [options, [[
                Utils.first(Vars.selectedComponents)?.input?.theme?.value ?? "default"
              ]]];
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                const selectedComponent = Utils.first(Vars.selectedComponents);
                let isDisabled = 'enabled';
                if (selectedComponent?.input?.theme?.type === 'handler' &&
                  selectedComponent?.input?.theme?.value ) {
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
              updateInput(selectedComponent, "theme", 'string',typeValue);
            `
    }
  },
  {
    uuid: "code_theme_handler_block",
    application_id: "1",
    name: "cod theme handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["code_theme_select", "code_theme_handler"]
  },
  {
    uuid: "code_theme_handler",
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
                const handlerValue = selectedComponent?.input?.theme?.type === 'handler'
                ? selectedComponent?.input?.theme.value
                : '';
                return ['theme', handlerValue];
                `
      }
    },
    event: {
      codeChange: /* js */ `

      const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.theme?.value) {
          updateInput(selectedComponent, 'theme', 'handler', EventData.value);
        }
            `
    }
  }
];
