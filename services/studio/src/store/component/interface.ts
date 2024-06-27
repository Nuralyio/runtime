export const enum ComponentType {
  TextLabel = "text_label",
  Tabs = "tabs",
  TextInput = "text_input",
  Menu = "menu",
  Button = "button_input",
  Collection = "Collection",
  VerticalContainer = "vertical-container-block",
}

export interface DraggingComponentInfo {
  componentId: string;
  blockInfo?: {
    height: string;
    width: string;
  };
}

export interface ComponentElement {
  parent: ComponentElement;
  uuid: string;
  name: string;
  component_type: ComponentType;
  style?: { [key: string]: string };
  styleBreakPoints ? : {
    laptop : { [key: string]: string },
    tablet : { [key: string]: string },
    mobile : { [key: string]: string },
  }
  styleHandlers: { [key: string]: string };
  inputHandlers: { [key: string]: string };
  parameters?: { [key: string]: string };
  event?: { [key: string]: string };
  input?: { [key: string]: any };
  errors?: { [key: string]: string };
  childrens?: ComponentElement[];
  childrenIds?: string[];
  pageId?: string;
  applicationId?: string;
}
export default {}
