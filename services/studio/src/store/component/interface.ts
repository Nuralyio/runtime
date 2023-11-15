export const enum ComponentType {
  TextLabel = "text_label",
  TextInput = "text_input",
  Button = "button_input",
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
  id: string;
  name: string;
  type: ComponentType;
  style?: { [key: string]: string };
  styleBreakPoints ? : {
    laptop : { [key: string]: string },
    tablet : { [key: string]: string },
    mobile : { [key: string]: string },
  }
  styleHandlers: { [key: string]: string };
  parameters?: { [key: string]: string };
  event?: { [key: string]: string };
  input?: { [key: string]: string };
  errors?: { [key: string]: string };
  childrens?: ComponentElement[];
  childrenIds?: string[];
  pageId?: string;
}
