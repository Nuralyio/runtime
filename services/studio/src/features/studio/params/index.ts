/**
 * Centralized Component Loader
 * 
 * Auto-loads all components from the new organized structure.
 * Components are categorized by type for better organization.
 */

import { loadComponentProperties } from "../processors/component-loader.ts";

// ========================================
// INPUT COMPONENTS
// ========================================

// Text Input
import textInputConfig from "./inputs/text-input/config.json";
import textInputHandlers from "./inputs/text-input/handlers.json";
import textInputTheme from "./inputs/text-input/theme.json";
import textInputMeta from "./inputs/text-input/meta.json";

export const StudioTextInput = loadComponentProperties(
  textInputConfig,
  textInputHandlers,
  textInputTheme,
  textInputMeta
);

// Textarea
import textareaConfig from "./inputs/textarea/textarea-config.yaml";
import textareaHandlers from "./inputs/textarea/textarea-handlers.yaml";
import textareaTheme from "./inputs/textarea/textarea-theme.yaml";
import textareaMeta from "./inputs/textarea/textarea-meta.yaml";

export const StudioTextarea = loadComponentProperties(
  textareaConfig,
  textareaHandlers,
  textareaTheme,
  textareaMeta
);

// Slider
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

// Text Label
import textLabelConfig from "./inputs/text-label/config.json";
import textLabelHandlers from "./inputs/text-label/handlers.json";
import textLabelTheme from "./inputs/text-label/theme.json";
import textLabelMeta from "./inputs/text-label/meta.json";

export const StudioTextLabel = loadComponentProperties(
  textLabelConfig,
  textLabelHandlers,
  textLabelTheme,
  textLabelMeta
);

// Select
import selectConfig from "./inputs/select/config.json";
import selectHandlers from "./inputs/select/handlers.json";
import selectTheme from "./inputs/select/theme.json";
import selectMeta from "./inputs/select/meta.json";

export const StudioSelect = loadComponentProperties(
  selectConfig,
  selectHandlers,
  selectTheme,
  selectMeta
);

// Checkbox
import checkboxConfig from "./inputs/checkbox/config.json";
import checkboxHandlers from "./inputs/checkbox/handlers.json";
import checkboxTheme from "./inputs/checkbox/theme.json";
import checkboxMeta from "./inputs/checkbox/meta.json";

export const StudioCheckbox = loadComponentProperties(
  checkboxConfig,
  checkboxHandlers,
  checkboxTheme,
  checkboxMeta
);

// Datepicker
import datepickerConfig from "./inputs/datepicker/config.json";
import datepickerHandlers from "./inputs/datepicker/handlers.json";
import datepickerTheme from "./inputs/datepicker/theme.json";
import datepickerMeta from "./inputs/datepicker/meta.json";

export const StudioDatepicker = loadComponentProperties(
  datepickerConfig,
  datepickerHandlers,
  datepickerTheme,
  datepickerMeta
);

// ========================================
// LAYOUT COMPONENTS
// ========================================

// Container
import containerConfig from "./layout/container/config.json";
import containerHandlers from "./layout/container/handlers.json";
import containerTheme from "./layout/container/theme.json";
import containerMeta from "./layout/container/meta.json";

export const StudioContainer = loadComponentProperties(
  containerConfig,
  containerHandlers,
  containerTheme,
  containerMeta
);

// Card
import cardConfig from "./layout/card/card-config.yaml";
import cardHandlers from "./layout/card/card-handlers.yaml";
import cardTheme from "./layout/card/card-theme.yaml";
import cardMeta from "./layout/card/card-meta.yaml";

export const StudioCard = loadComponentProperties(
  cardConfig,
  cardHandlers,
  cardTheme,
  cardMeta
);

// ========================================
// DATA COMPONENTS
// ========================================

// Table
import tableConfig from "./data/table/config.json";
import tableHandlers from "./data/table/handlers.json";
import tableTheme from "./data/table/theme.json";
import tableMeta from "./data/table/meta.json";

export const StudioTable = loadComponentProperties(
  tableConfig,
  tableHandlers,
  tableTheme,
  tableMeta
);

// Collection
import collectionConfig from "./data/collection/config.json";
import collectionHandlers from "./data/collection/handlers.json";
import collectionTheme from "./data/collection/theme.json";
import collectionMeta from "./data/collection/meta.json";

export const StudioCollection = loadComponentProperties(
  collectionConfig,
  collectionHandlers,
  collectionTheme,
  collectionMeta
);

// Menu
import menuConfig from "./data/menu/config.json";
import menuHandlers from "./data/menu/handlers.json";
import menuTheme from "./data/menu/theme.json";
import menuMeta from "./data/menu/meta.json";

export const StudioMenu = loadComponentProperties(
  menuConfig,
  menuHandlers,
  menuTheme,
  menuMeta
);

// ========================================
// MEDIA COMPONENTS
// ========================================

// Image
import imageConfig from "./media/image/config.json";
import imageHandlers from "./media/image/handlers.json";
import imageTheme from "./media/image/theme.json";
import imageMeta from "./media/image/meta.json";

export const StudioImage = loadComponentProperties(
  imageConfig,
  imageHandlers,
  imageTheme,
  imageMeta
);

// Video
import videoConfig from "./media/video/config.json";
import videoHandlers from "./media/video/handlers.json";
import videoTheme from "./media/video/theme.json";
import videoMeta from "./media/video/meta.json";

export const StudioVideo = loadComponentProperties(
  videoConfig,
  videoHandlers,
  videoTheme,
  videoMeta
);

// Icon
import iconConfig from "./media/icon/config.json";
import iconHandlers from "./media/icon/handlers.json";
import iconTheme from "./media/icon/theme.json";
import iconMeta from "./media/icon/meta.json";

export const StudioIcon = loadComponentProperties(
  iconConfig,
  iconHandlers,
  iconTheme,
  iconMeta
);

// Badge
import badgeConfig from "./display/badge/badge-config.yaml";
import badgeHandlers from "./display/badge/badge-handlers.yaml";
import badgeTheme from "./display/badge/badge-theme.yaml";
import badgeMeta from "./display/badge/badge-meta.yaml";

export const StudioBadge = loadComponentProperties(
  badgeConfig,
  badgeHandlers,
  badgeTheme,
  badgeMeta
);

// Tag
import tagConfig from "./display/tag/tag-config.yaml";
import tagHandlers from "./display/tag/tag-handlers.yaml";
import tagTheme from "./display/tag/tag-theme.yaml";
import tagMeta from "./display/tag/tag-meta.yaml";

export const StudioTag = loadComponentProperties(
  tagConfig,
  tagHandlers,
  tagTheme,
  tagMeta
);

// File Upload
import fileUploadConfig from "./media/file-upload/config.json";
import fileUploadHandlers from "./media/file-upload/handlers.json";
import fileUploadTheme from "./media/file-upload/theme.json";
import fileUploadMeta from "./media/file-upload/meta.json";

export const StudioFileUpload = loadComponentProperties(
  fileUploadConfig,
  fileUploadHandlers,
  fileUploadTheme,
  fileUploadMeta
);

// ========================================
// CONTENT COMPONENTS
// ========================================

// Code
import codeConfig from "./content/code/config.json";
import codeHandlers from "./content/code/handlers.json";
import codeTheme from "./content/code/theme.json";
import codeMeta from "./content/code/meta.json";

export const StudioCode = loadComponentProperties(
  codeConfig,
  codeHandlers,
  codeTheme,
  codeMeta
);

// Document
import documentConfig from "./content/document/config.json";
import documentHandlers from "./content/document/handlers.json";
import documentTheme from "./content/document/theme.json";
import documentMeta from "./content/document/meta.json";

export const StudioDocument = loadComponentProperties(
  documentConfig,
  documentHandlers,
  documentTheme,
  documentMeta
);

// Richtext
import richtextConfig from "./content/Richtext/config.json";
import richtextHandlers from "./content/Richtext/handlers.json";
import richtextTheme from "./content/Richtext/theme.json";
import richtextMeta from "./content/Richtext/meta.json";

export const StudioRichText = loadComponentProperties(
  richtextConfig,
  richtextHandlers,
  richtextTheme,
  richtextMeta
);

// RichtextEditor
import richtextEditorConfig from "./content/RichtextEditor/config.json";
import richtextEditorHandlers from "./content/RichtextEditor/handlers.json";
import richtextEditorTheme from "./content/RichtextEditor/theme.json";
import richtextEditorMeta from "./content/RichtextEditor/meta.json";

export const StudioRichTextEditor = loadComponentProperties(
  richtextEditorConfig,
  richtextEditorHandlers,
  richtextEditorTheme,
  richtextEditorMeta
);

// ========================================
// NAVIGATION COMPONENTS
// ========================================

// Button
import buttonConfig from "./navigation/button/config.json";
import buttonHandlers from "./navigation/button/handlers.json";
import buttonTheme from "./navigation/button/theme.json";
import buttonMeta from "./navigation/button/meta.json";

export const StudioButton = loadComponentProperties(
  buttonConfig,
  buttonHandlers,
  buttonTheme,
  buttonMeta
);

// Link
import linkConfig from "./navigation/link/config.json";
import linkHandlers from "./navigation/link/handlers.json";
import linkTheme from "./navigation/link/theme.json";
import linkMeta from "./navigation/link/meta.json";

export const StudioLink = loadComponentProperties(
  linkConfig,
  linkHandlers,
  linkTheme,
  linkMeta
);

// Dropdown
import dropdownConfig from "./navigation/dropdown/config.json";
import dropdownHandlers from "./navigation/dropdown/handlers.json";
import dropdownTheme from "./navigation/dropdown/theme.json";
import dropdownMeta from "./navigation/dropdown/meta.json";

export const StudioDropdown = loadComponentProperties(
  dropdownConfig,
  dropdownHandlers,
  dropdownTheme,
  dropdownMeta
);

// ========================================
// ADVANCED COMPONENTS
// ========================================

// Embed
import embedConfig from "./advanced/embed/config.json";
import embedHandlers from "./advanced/embed/handlers.json";
import embedTheme from "./advanced/embed/theme.json";
import embedMeta from "./advanced/embed/meta.json";

export const StudioEmbed = loadComponentProperties(
  embedConfig,
  embedHandlers,
  embedTheme,
  embedMeta
);

// Ref Component
import refComponentConfig from "./advanced/ref-component/config.json";
import refComponentHandlers from "./advanced/ref-component/handlers.json";
import refComponentTheme from "./advanced/ref-component/theme.json";
import refComponentMeta from "./advanced/ref-component/meta.json";

export const StudioRefComponent = loadComponentProperties(
  refComponentConfig,
  refComponentHandlers,
  refComponentTheme,
  refComponentMeta
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
  
  // Layout
  StudioContainer,
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
};
