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
  BoxModel = "box_model",
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
  Document = "document",
  Video = "video",
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
  Textarea = "Textarea",
  Badge = "Badge",
  Card = "Card",
  Tag = "Tag",
  Slider = "Slider",
  Alert = "Alert",
  Modal = "Modal",
  Toast = "Toast",
  Panel = "Panel",
  GridRow = "grid-row-block",
  GridCol = "grid-col-block",
  Form = "form",
  ValidationRules = "validation_rules",
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
  uniqueUUID?: string;
  Instance?: any; // Component instance state (reactive proxy)
  children?: ComponentElement[]; // Resolved children components
  __microAppContext?: {
    Vars: any;
    runtimeContext: any;
  }; // Micro-app isolated runtime context (set by MicroAppRuntimeContext)
}

export default {};
