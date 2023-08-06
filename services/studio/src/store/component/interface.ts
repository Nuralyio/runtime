export const enum ComponentType {
  TextLabel = "text_label",
  TextInput = "text_input",
  Button = "button_input",
}

type FontSize = {
  value: string;
  unit: string;
};
export interface TextLabelAttributes {
  fontSize: string;
  backgroundColor: string;
}

export interface TextInputAttributes {}

export interface TextLabelParameters {
  value: string;
  onClick?: Function;
}

export interface TextInputParameters {
  onChange: Function;
}

export interface DraggingComponentInfo {
  componentId: string;
  blockInfo: {
    height: string;
    width: string;
  };
}

export interface ComponentElement {
  id: string;
  name: string;
  type: ComponentType;
  attributes?: TextLabelAttributes | TextInputAttributes;
  parameters?: TextLabelParameters | TextInputParameters;
  childrens?: ComponentElement[];
  childrenIds?: string[];
  pageId?: string;
}
