/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Toolbar templates
export {
  renderToolbarTemplate,
  renderZoomControlsTemplate,
  type ToolbarTemplateData,
  type ZoomControlsTemplateData,
} from './toolbar.template.js';

// Palette template
export { renderPaletteTemplate, type PaletteTemplateData } from './palette.template.js';

// Context menu template
export { renderContextMenuTemplate, type ContextMenuTemplateData } from './context-menu.template.js';

// Empty state template
export { renderEmptyStateTemplate, type EmptyStateTemplateData } from './empty-state.template.js';

// Config panel template
export {
  renderConfigPanelTemplate,
  type ConfigPanelTemplateData,
  type ConfigPanelCallbacks,
} from './config-panel.template.js';

// Edges template
export {
  renderEdgesTemplate,
  renderEdgeTemplate,
  renderConnectionLineTemplate,
  type EdgesTemplateData,
  type EdgeCallbacks,
} from './edges.template.js';
