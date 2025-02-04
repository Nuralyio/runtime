import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export const StudioContainerGapInput = [
  {
    uuid: "gap_vertical_container",
    application_id: "1",
    name: "gap vertical container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: [
      "gap_label",
      "gap_handler_block",
    ]
  },
  {
    uuid: "gap_handler_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["gap_input", "gap_handler"]
  },
  {
    uuid: "gap_label",
    name: "gap label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                return 'Gap';
            `
      }
    }
  },
  {
    uuid: "gap_input",
    name: "gap input",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "block",
      width: "153px",
      size: "small"
    },
    event: {
      valueChange: /* js */ `
              const selectedComponent = Utils.first(Editor.selectedComponents);
              updateStyle(selectedComponent, "gap", EventData.value + 'px');
            `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
              return Editor.getComponentStyle(Utils.first(Editor.selectedComponents), 'gap') ?? 0
            `
      },
      state: {
        type: "handler",
        value: /* js */`
            const selectedComponent = Utils.first(Editor.selectedComponents);
            let state = 'enabled';
            if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['gap']) {
              state = 'disabled';
            }
            return state;  
            `
      }
    }
  },
  {
    uuid: "gap_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "gap handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter = 'gap';
                let heightHandler = '';
                const selectedComponent = Utils.first(Editor.selectedComponents);
                heightHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['gap'] || '';  
                return [parameter, heightHandler];
            `
      }
    },
    event: {
      codeChange: /* js */ `
              const selectedComponent = Utils.first(Editor.selectedComponents);
              updateStyleHandlers(selectedComponent, 'gap', EventData.value);
      `
    }
  }
];