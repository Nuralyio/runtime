export const enum ComponentType {
  TextLabel = "text_label",
  Tabs = "tabs",
  TextInput = "text_input",
  Menu = "menu",
  Button = "button_input",
  Collection = "collection",
  Container = "container",
  ColorPicker = "color_picker",
  NumberInput = "number_input",
  IconButton = "icon_button",
  Select = "select",
  ShadowBox = "shadow_box",
  BorderRadius = "border_radius",
  BoxModel = "box_model",
  Event = "event", //TODO: this is an event not a component type
  Table = "table",
  Checkbox = "checkbox",
  DatePicker = "date_picker",
  Icon = "icon",
  Image = "image",
  MicroApp = "micro_app",
  RadioButton = "radio_button",
  IconPicker = "icon_picker",
  RefComponent = "ref_component",
  Code = "code",
  RichText = "rich_text",
  EmbedURL = "embed_url",
  Link = "link",
  Document = "document",
  Video = "video",
  FileUpload = "file_upload",
  RichTextEditor = "rich_text_editor",
  UsersDropdown = "users_dropdown",
  InsertDropdown = "insert_dropdown",
  Collapse = "collapse",
  Handlers = "handlers",
  AI = "ai",
  Divider = "divider",
  ExportImport = "export_import",
  InvokeFunction = "invoke_function",
  Dropdown = "dropdown",
  Textarea = "textarea",
  Badge = "badge",
  Card = "card",
  Tag = "tag",
  Slider = "slider",
  Alert = "alert",
  Modal = "modal",
  Toast = "toast",
  Panel = "panel",
  GridRow = "grid_row",
  GridCol = "grid_col",
  Form = "form",
  ValidationRules = "validation_rules",
  BorderManager = "border_manager",
  AccessRoles = "access_roles",
  FunctionsPanel = "functions_panel",
  ShareModal = "share_modal",
  RevisionPanel = "revision_panel",
  LanguageSwitcher = "language_switcher",
  TranslationsEditor = "translations_editor",
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
  uuid: string;
  name: string;
  type: ComponentType | string;  // Allow string for custom component types
  style?: { [key: string]: string };
  breakpoints?: any;
  style_handlers: { [key: string]: string };
  event?: { [key: string]: string };
  input?: { [key: string]: any };
  inputHandlers?: { [key: string]: string };
  errors?: { [key: string]: string };
  children_ids?: string[];
  children?: ComponentElement[];
  pageId?: string;
  application_id?: string;
  uniqueUUID?: string;
  Instance?: any; // Component instance state (reactive proxy)
  __microAppContext?: {
    Vars: any;
    runtimeContext: any;
  }; // Micro-app isolated runtime context (set by MicroAppRuntimeContext)

  /**
   * Translations for input properties (i18n support)
   *
   * Structure:
   * {
   *   [propertyName]: {
   *     [localeCode]: translatedValue
   *   }
   * }
   *
   * @example
   * {
   *   "value": { "fr": "Bonjour", "ar": "مرحبا" },
   *   "placeholder": { "fr": "Entrez le texte...", "ar": "أدخل النص..." }
   * }
   *
   * The default locale value comes from input[propertyName].value
   * Other locale values come from translations[propertyName][locale]
   */
  translations?: {
    [propertyName: string]: {
      [locale: string]: any;
    };
  };
}

export default {};
