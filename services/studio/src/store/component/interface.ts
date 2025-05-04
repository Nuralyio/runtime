export const enum ComponentType {
  TextLabel = "text_label",
  Tabs = "tabs",
  TextInput = "text_input",
  Menu = "menu",
  Button = "button_input",
  Collection = "Collection",
  Container = "vertical-container-block",
  ColorPicker = "color_picker",
  NumberInput = "number_input",
  IconButton = "icon_button",
  Select = "select",
  ShadowBox = "shadow_box",
  BorderRadius = "border_radius",
  Event = "event", //TODO: this is an event not a component type
  Table = "Table",
  Checkbox = "checkbox",
  DatePicker = "Datepicker",
  Icon = "Icon",
  Image = "Image",
  MicroApp = "MicroApp",
  RadioButton = "RadioButton",
  IconPicker = "IconPicker",
  RefComponent = "RefComponent",
  Code = "code-block",
  RichText = "rich-text",
  EmbedURL = "embed-url",
  Link = "link",
  FileUpload = "file-upload",
  RichTextEditor = "rich-text-editor",
  UsersDropdown = "UsersDropdown",
  InsertDropdown = "InsertDropdown",
  Collapse = "Collapse",
  Handlers = "Handlers",
  AI = "AI",
  Divider = "Divider",
  ExportImport = "ExportImport",
  InvokeFunction = "InvokeFunction",
  Dropdown = "dropdown",
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
  root?: boolean;
  values?: any;
  uuid: string;
  name: string;
  component_type: ComponentType;
  style?: { [key: string]: string };
  breakpoints?: any;
  styleHandlers: { [key: string]: string };
  inputHandlers: { [key: string]: string };
  parameters?: { [key: string]: string };
  event?: { [key: string]: string };
  input?: { [key: string]: any };
  errors?: { [key: string]: string };
  childrens?: ComponentElement[];
  childrenIds?: string[];
  pageId?: string;
  application_id?: string;
}

export default {};
