/**
 * Centralized Component Loader
 *
 * Auto-loads all components from the new organized structure.
 * Components are categorized by type for better organization.
 *
 * Components with properties.ts use the TypeScript loader (loadFromTypeScript).
 * Components without properties.ts use the legacy JSON loader (loadComponentProperties).
 */

import { loadComponentProperties } from "../processors/component-loader.ts";
import { loadFromTypeScript } from "../processors/typescript-component-loader.ts";

// ========================================
// INPUT COMPONENTS
// ========================================

// Text Input (TypeScript)
import { textInputDefinition } from "./inputs/text-input/properties.ts";
import textInputHandlers from "./inputs/text-input/handlers.json";
import textInputTheme from "./inputs/text-input/theme.json";

export const StudioTextInput = loadFromTypeScript(
  textInputDefinition,
  textInputHandlers,
  textInputTheme,
  ["text_input_fields_collapse_container", "validation_rules_collapse"]
);

// Textarea (TypeScript)
import { textareaDefinition } from "./inputs/textarea/properties.ts";
import textareaHandlers from "./inputs/textarea/handlers.json";
import textareaTheme from "./inputs/textarea/theme.json";

export const StudioTextarea = loadFromTypeScript(
  textareaDefinition,
  textareaHandlers,
  textareaTheme
);

// Slider (YAML - no properties.ts)
import sliderConfig from "./inputs/slider/slider-config.yaml";
import sliderHandlers from "./inputs/slider/slider-handlers.yaml";
import sliderTheme from "./inputs/slider/slider-theme.yaml";
import sliderMeta from "./inputs/slider/slider-meta.yaml";

export const StudioSlider = loadComponentProperties(
  sliderConfig,
  sliderHandlers,
  sliderTheme,
  sliderMeta
);

// Text Label (TypeScript)
import { textLabelDefinition } from "./inputs/text-label/properties.ts";
import textLabelHandlers from "./inputs/text-label/handlers.json";
import textLabelTheme from "./inputs/text-label/theme.json";

export const StudioTextLabel = loadFromTypeScript(
  textLabelDefinition,
  textLabelHandlers,
  textLabelTheme
);

// Select (TypeScript)
import { selectDefinition } from "./inputs/select/properties.ts";
import selectHandlers from "./inputs/select/handlers.json";
import selectTheme from "./inputs/select/theme.json";

export const StudioSelect = loadFromTypeScript(
  selectDefinition,
  selectHandlers,
  selectTheme
);

// Checkbox (TypeScript)
import { checkboxDefinition } from "./inputs/checkbox/properties.ts";
import checkboxHandlers from "./inputs/checkbox/handlers.json";
import checkboxTheme from "./inputs/checkbox/theme.json";

export const StudioCheckbox = loadFromTypeScript(
  checkboxDefinition,
  checkboxHandlers,
  checkboxTheme
);

// Datepicker (TypeScript)
import { datepickerDefinition } from "./inputs/datepicker/properties.ts";
import datepickerHandlers from "./inputs/datepicker/handlers.json";
import datepickerTheme from "./inputs/datepicker/theme.json";

export const StudioDatepicker = loadFromTypeScript(
  datepickerDefinition,
  datepickerHandlers,
  datepickerTheme
);

// Form (TypeScript)
import { formDefinition } from "./inputs/form/properties.ts";
import formHandlers from "./inputs/form/handlers.json";
import formTheme from "./inputs/form/theme.json";

export const StudioForm = loadFromTypeScript(
  formDefinition,
  formHandlers,
  formTheme
);

// ========================================
// LAYOUT COMPONENTS
// ========================================

// Container (TypeScript)
import { containerDefinition } from "./layout/container/properties.ts";
import containerHandlers from "./layout/container/handlers.json";
import containerTheme from "./layout/container/theme.json";

export const StudioContainer = loadFromTypeScript(
  containerDefinition,
  containerHandlers,
  containerTheme
);

// Grid Row (TypeScript)
import { gridRowDefinition } from "./layout/grid-row/properties.ts";
import gridRowHandlers from "./layout/grid-row/handlers.json";
import gridRowTheme from "./layout/grid-row/theme.json";

export const StudioGridRow = loadFromTypeScript(
  gridRowDefinition,
  gridRowHandlers,
  gridRowTheme
);

// Grid Col (TypeScript)
import { gridColDefinition } from "./layout/grid-col/properties.ts";
import gridColHandlers from "./layout/grid-col/handlers.json";
import gridColTheme from "./layout/grid-col/theme.json";

export const StudioGridCol = loadFromTypeScript(
  gridColDefinition,
  gridColHandlers,
  gridColTheme
);

// Card (JSON - no properties.ts)
import cardConfig from "./layout/card/card-config.json";
import cardHandlers from "./layout/card/card-handlers.json";
import cardTheme from "./layout/card/card-theme.json";
import cardMeta from "./layout/card/card-meta.json";

export const StudioCard = loadComponentProperties(
  cardConfig,
  cardHandlers,
  cardTheme,
  cardMeta
);

// ========================================
// DATA COMPONENTS
// ========================================

// Table (TypeScript)
import { tableDefinition } from "./data/table/properties.ts";
import tableHandlers from "./data/table/handlers.json";
import tableTheme from "./data/table/theme.json";

export const StudioTable = loadFromTypeScript(
  tableDefinition,
  tableHandlers,
  tableTheme
);

// Collection (TypeScript)
import { collectionDefinition } from "./data/collection/properties.ts";
import collectionHandlers from "./data/collection/handlers.json";
import collectionTheme from "./data/collection/theme.json";

export const StudioCollection = loadFromTypeScript(
  collectionDefinition,
  collectionHandlers,
  collectionTheme
);

// Menu (TypeScript)
import { menuDefinition } from "./data/menu/properties.ts";
import menuHandlers from "./data/menu/handlers.json";
import menuTheme from "./data/menu/theme.json";

export const StudioMenu = loadFromTypeScript(
  menuDefinition,
  menuHandlers,
  menuTheme
);

// ========================================
// MEDIA COMPONENTS
// ========================================

// Image (TypeScript)
import { imageDefinition } from "./media/image/properties.ts";
import imageHandlers from "./media/image/handlers.json";
import imageTheme from "./media/image/theme.json";

export const StudioImage = loadFromTypeScript(
  imageDefinition,
  imageHandlers,
  imageTheme
);

// Video (TypeScript)
import { videoDefinition } from "./media/video/properties.ts";
import videoHandlers from "./media/video/handlers.json";
import videoTheme from "./media/video/theme.json";

export const StudioVideo = loadFromTypeScript(
  videoDefinition,
  videoHandlers,
  videoTheme
);

// Icon (TypeScript)
import { iconDefinition } from "./media/icon/properties.ts";
import iconHandlers from "./media/icon/handlers.json";
import iconTheme from "./media/icon/theme.json";

export const StudioIcon = loadFromTypeScript(
  iconDefinition,
  iconHandlers,
  iconTheme
);

// File Upload (TypeScript)
import { fileUploadDefinition } from "./media/file-upload/properties.ts";
import fileUploadHandlers from "./media/file-upload/handlers.json";
import fileUploadTheme from "./media/file-upload/theme.json";

export const StudioFileUpload = loadFromTypeScript(
  fileUploadDefinition,
  fileUploadHandlers,
  fileUploadTheme
);

// ========================================
// DISPLAY COMPONENTS
// ========================================

// Badge (TypeScript)
import { badgeDefinition } from "./display/badge/properties.ts";
import badgeHandlers from "./display/badge/handlers.json";
import badgeTheme from "./display/badge/theme.json";

export const StudioBadge = loadFromTypeScript(
  badgeDefinition,
  badgeHandlers,
  badgeTheme
);

// Tag (JSON - no properties.ts)
import tagConfig from "./display/tag/tag-config.json";
import tagHandlers from "./display/tag/tag-handlers.json";
import tagTheme from "./display/tag/tag-theme.json";
import tagMeta from "./display/tag/tag-meta.json";

export const StudioTag = loadComponentProperties(
  tagConfig,
  tagHandlers,
  tagTheme,
  tagMeta
);

// ========================================
// CONTENT COMPONENTS
// ========================================

// Code (TypeScript)
import { codeDefinition } from "./content/code/properties.ts";
import codeHandlers from "./content/code/handlers.json";
import codeTheme from "./content/code/theme.json";

export const StudioCode = loadFromTypeScript(
  codeDefinition,
  codeHandlers,
  codeTheme
);

// Document (TypeScript)
import { documentDefinition } from "./content/document/properties.ts";
import documentHandlers from "./content/document/handlers.json";
import documentTheme from "./content/document/theme.json";

export const StudioDocument = loadFromTypeScript(
  documentDefinition,
  documentHandlers,
  documentTheme
);

// Richtext (TypeScript)
import { richtextDefinition } from "./content/Richtext/properties.ts";
import richtextHandlers from "./content/Richtext/handlers.json";
import richtextTheme from "./content/Richtext/theme.json";

export const StudioRichText = loadFromTypeScript(
  richtextDefinition,
  richtextHandlers,
  richtextTheme
);

// RichtextEditor (TypeScript)
import { richtextEditorDefinition } from "./content/RichtextEditor/properties.ts";
import richtextEditorHandlers from "./content/RichtextEditor/handlers.json";
import richtextEditorTheme from "./content/RichtextEditor/theme.json";

export const StudioRichTextEditor = loadFromTypeScript(
  richtextEditorDefinition,
  richtextEditorHandlers,
  richtextEditorTheme
);

// ========================================
// NAVIGATION COMPONENTS
// ========================================

// Button (TypeScript)
import { buttonDefinition } from "./navigation/button/properties.ts";
import buttonHandlers from "./navigation/button/handlers.json";
import buttonTheme from "./navigation/button/theme.json";

export const StudioButton = loadFromTypeScript(
  buttonDefinition,
  buttonHandlers,
  buttonTheme
);

// Link (TypeScript)
import { linkDefinition } from "./navigation/link/properties.ts";
import linkHandlers from "./navigation/link/handlers.json";
import linkTheme from "./navigation/link/theme.json";

export const StudioLink = loadFromTypeScript(
  linkDefinition,
  linkHandlers,
  linkTheme
);

// Dropdown (TypeScript)
import { dropdownDefinition } from "./navigation/dropdown/properties.ts";
import dropdownHandlers from "./navigation/dropdown/handlers.json";
import dropdownTheme from "./navigation/dropdown/theme.json";

export const StudioDropdown = loadFromTypeScript(
  dropdownDefinition,
  dropdownHandlers,
  dropdownTheme
);

// ========================================
// ADVANCED COMPONENTS
// ========================================

// Embed (TypeScript)
import { embedDefinition } from "./advanced/embed/properties.ts";
import embedHandlers from "./advanced/embed/handlers.json";
import embedTheme from "./advanced/embed/theme.json";

export const StudioEmbed = loadFromTypeScript(
  embedDefinition,
  embedHandlers,
  embedTheme
);

// Ref Component (TypeScript)
import { refComponentDefinition } from "./advanced/ref-component/properties.ts";
import refComponentHandlers from "./advanced/ref-component/handlers.json";
import refComponentTheme from "./advanced/ref-component/theme.json";

export const StudioRefComponent = loadFromTypeScript(
  refComponentDefinition,
  refComponentHandlers,
  refComponentTheme
);

// Modal (TypeScript)
import { modalDefinition } from "./advanced/modal/properties.ts";
import modalHandlers from "./advanced/modal/handlers.json";
import modalTheme from "./advanced/modal/theme.json";

export const StudioModal = loadFromTypeScript(
  modalDefinition,
  modalHandlers,
  modalTheme
);

// Workflow (TypeScript)
import { workflowDefinition } from "./advanced/workflow/properties.ts";
import workflowHandlers from "./advanced/workflow/handlers.json";
import workflowTheme from "./advanced/workflow/theme.json";

export const StudioWorkflow = loadFromTypeScript(
  workflowDefinition,
  workflowHandlers,
  workflowTheme
);

// Chatbot (TypeScript)
import { chatbotDefinition } from "./advanced/chatbot/properties.ts";
import chatbotHandlers from "./advanced/chatbot/handlers.json";
import chatbotTheme from "./advanced/chatbot/theme.json";

export const StudioChatbot = loadFromTypeScript(
  chatbotDefinition,
  chatbotHandlers,
  chatbotTheme
);

// ========================================
// COMPONENT REGISTRY
// ========================================

export const StudioComponents = {
  // Inputs
  StudioTextInput,
  StudioTextarea,
  StudioSlider,
  StudioTextLabel,
  StudioSelect,
  StudioCheckbox,
  StudioDatepicker,
  StudioForm,

  // Layout
  StudioContainer,
  StudioGridRow,
  StudioGridCol,
  StudioCard,

  // Data
  StudioTable,
  StudioCollection,
  StudioMenu,

  // Media
  StudioImage,
  StudioVideo,
  StudioIcon,
  StudioFileUpload,

  // Display
  StudioBadge,
  StudioTag,

  // Content
  StudioCode,
  StudioDocument,
  StudioRichText,
  StudioRichTextEditor,

  // Navigation
  StudioButton,
  StudioLink,
  StudioDropdown,

  // Advanced
  StudioEmbed,
  StudioRefComponent,
  StudioModal,
  StudioWorkflow,
  StudioChatbot,
};
