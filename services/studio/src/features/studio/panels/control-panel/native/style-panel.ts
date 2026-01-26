/**
 * Native Style Panel
 *
 * Provides styling controls using native nr-* components.
 * Reads from Editor with breakpoint support.
 * Uses existing box-model-display component for margin/padding.
 */

import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { updateComponentAttributes } from "../../../../runtime/redux/actions/component/updateComponentAttributes";
import type { ComponentElement } from "../../../../runtime/redux/store/component/component.interface";
import EditorInstance from "../../../../runtime/state/editor";
import { eventDispatcher } from "../../../../runtime/utils/change-detection";
import { ExecuteInstance } from "../../../../runtime/state/runtime-context";
// Import the existing box model display component
import "../../../../runtime/components/ui/components/display/BoxModel/BoxModel";
// Import the border editor component
import "../../../../runtime/components/ui/components/display/BorderEditor/BorderEditor";

/**
 * CSS Variable mapping for component types
 * Maps standard CSS properties to component-specific CSS variables
 */
const CSS_VAR_MAPPING: Record<string, Record<string, string>> = {
  // Text components (use underscore to match component.type)
  "text_label": {
    "font-family": "--nuraly-label-font-family",
    "font-size": "--nuraly-font-size",
    "font-weight": "--nuraly-font-weight",
    "color": "--nuraly-text-color",
  },
  "nr_text": {
    "font-family": "--nuraly-font-family",
    "font-size": "--nuraly-font-size",
    "font-weight": "--nuraly-font-weight",
    "color": "--nuraly-text-color",
  },
  "nr_button": {
    "font-family": "--nuraly-button-font-family",
    "font-size": "--nuraly-button-font-size",
    "background-color": "--nuraly-button-background-color",
    "color": "--nuraly-button-text-color",
  },
  "nr_input": {
    "font-family": "--nuraly-input-font-family",
    "font-size": "--nuraly-input-font-size",
  },
};

@customElement("native-style-panel")
export class NativeStylePanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      /* Override panel CSS variables to zero */
      --nuraly-panel-padding: 0;
      
      --nuraly-panel-body-padding-small: 0;
      --nuraly-panel-body-padding-medium: 0;
      --nuraly-panel-body-padding-large: 0;
      --nuraly-panel-header-padding: 0;
      --nuraly-panel-header-padding-small: 0;
      --nuraly-panel-header-padding-medium: 0;
      --nuraly-panel-header-font-weight: 400; 
      --nuraly-panel-header-padding-large: 0;
      --nuraly-panel-header-font-size: 11px;
    }

    nr-row {
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .section-title {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #666);
      border-bottom: 1px solid var(--nuraly-color-border, #e0e0e0);
      background: var(--nuraly-color-surface-variant, #f5f5f5);
    }

    .section-content {
      padding: 8px 0;
    }

    .box-model-wrapper {
      padding: 0 12px;
    }

    box-model-display {
      display: block;
    }
  `;

  @state()
  private component: ComponentElement | null = null;

  @state()
  private styleState: string = "default";

  override connectedCallback() {
    super.connectedCallback();
    this.updateFromSelection();
    eventDispatcher.on('Vars:selectedComponents', this.onSelectionChanged);
    eventDispatcher.on('component:updated', this.onComponentUpdated);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    eventDispatcher.off('Vars:selectedComponents', this.onSelectionChanged);
    eventDispatcher.off('component:updated', this.onComponentUpdated);
  }

  private onSelectionChanged = () => {
    this.updateFromSelection();
  };

  private onComponentUpdated = () => {
    // Refresh component reference from latest selection since updateComponentAttributes
    // creates a new object for immutable updates
    const selected = ExecuteInstance.Vars.selectedComponents;
    this.component = selected?.[0] ?? null;
    this.requestUpdate();
  };

  private updateFromSelection() {
    const selected = ExecuteInstance.Vars.selectedComponents;
    this.component = selected?.[0] ?? null;
    console.log('[StylePanel] Selected component:', {
      type: this.component?.type,
      uuid: this.component?.uuid,
      style: this.component?.style,
    });
  }

  /**
   * Get component's CSS variable name for a property if it exists
   */
  private getCssVarForProperty(property: string): string | null {
    if (!this.component) return null;
    const componentType = this.component.type?.toLowerCase() || "";
    const cssVar = CSS_VAR_MAPPING[componentType]?.[property] || null;
    console.log('[StylePanel] getCssVarForProperty:', { property, componentType, cssVar });
    return cssVar;
  }

  /**
   * Get style value with breakpoint support from Editor
   * Also checks for CSS variable mapping
   */
  private getStyleValue(property: string): string {
    if (!this.component) return "";

    // First try the standard property
    const standardValue = EditorInstance.getComponentStyle(this.component, property);
    if (standardValue) return standardValue;

    // If not found and not already a CSS var, check for mapped CSS variable
    if (!property.startsWith("--")) {
      const cssVar = this.getCssVarForProperty(property);
      if (cssVar) {
        const cssVarValue = EditorInstance.getComponentStyle(this.component, cssVar);
        if (cssVarValue) return cssVarValue;
      }
    }

    return "";
  }

  /**
   * Parse style value into numeric value and unit
   */
  private parseStyleValue(value: string): { value: number; unit: string } {
    if (!value || value === "auto") return { value: 0, unit: "px" };
    const match = value.match(/^(-?\d*\.?\d+)(.*)$/);
    return {
      value: match ? parseFloat(match[1]) : 0,
      unit: match?.[2] || "px"
    };
  }

  /**
   * Get box model values from Editor with breakpoint support
   */
  private getBoxModelValue() {
    const props = [
      "margin-left", "margin-top", "margin-bottom", "margin-right",
      "padding-left", "padding-right", "padding-top", "padding-bottom",
      "width", "height"
    ];

    const result: Record<string, { value: number; unit: string }> = {};
    props.forEach(prop => {
      result[prop] = this.parseStyleValue(this.getStyleValue(prop));
    });

    return result;
  }

  private updateStyle(property: string, value: string | undefined) {
    if (!this.component) return;

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "style",
      { [property]: value },
      true
    );
  }

  /**
   * Update style with CSS variable support
   * Checks if the component type has a CSS variable mapping and applies both
   */
  private updateStyleWithCssVar(property: string, value: string | undefined) {
    if (!this.component) return;

    const componentType = this.component.type?.toLowerCase() || "";
    const cssVarMapping = CSS_VAR_MAPPING[componentType];
    const cssVar = cssVarMapping?.[property];

    console.log('[StylePanel] updateStyleWithCssVar:', {
      property,
      value,
      componentType,
      cssVarMapping,
      cssVar,
      allMappings: CSS_VAR_MAPPING,
    });

    const styleUpdates: Record<string, string | undefined> = {};

    // Always set the standard property
    styleUpdates[property] = value;

    // Also set the CSS variable if mapping exists
    if (cssVar) {
      styleUpdates[cssVar] = value;
    }

    console.log('[StylePanel] styleUpdates:', styleUpdates);

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "style",
      styleUpdates,
      true
    );
  }

  private handleBoxModelChange(e: CustomEvent) {
    const { property, value } = e.detail;
    this.updateStyle(property, value);
  }

  /**
   * Parse border shorthand value (e.g., "1px solid #000000")
   */
  private parseBorderShorthand(value: string): { width: string; style: string; color: string } | null {
    if (!value || value === 'none' || value === 'undefined') return null;
    const parts = value.split(' ').filter(p => p);
    if (parts.length >= 3) {
      return {
        width: parts[0],
        style: parts[1],
        color: parts[2],
      };
    }
    return null;
  }

  /**
   * Get border values from Editor with breakpoint support
   * Parses shorthand (border), individual edges (border-top, etc.), and individual properties
   */
  private getBorderValues() {
    // Try to get from main shorthand first
    const borderShorthand = this.getStyleValue("border");
    const parsed = this.parseBorderShorthand(borderShorthand);
    if (parsed) return parsed;

    // Try to get from individual edge shorthands
    const edges = ['top', 'right', 'bottom', 'left'];
    for (const edge of edges) {
      const edgeValue = this.getStyleValue(`border-${edge}`);
      const edgeParsed = this.parseBorderShorthand(edgeValue);
      if (edgeParsed) return edgeParsed;
    }

    // Fallback to individual properties
    return {
      width: this.getStyleValue("border-width") || "1px",
      style: this.getStyleValue("border-style") || "solid",
      color: this.getStyleValue("border-color") || "#000000",
    };
  }

  /**
   * Get border radius values from Editor with breakpoint support
   */
  private getBorderRadiusValues() {
    return {
      topLeft: this.getStyleValue("border-top-left-radius") || "0px",
      topRight: this.getStyleValue("border-top-right-radius") || "0px",
      bottomLeft: this.getStyleValue("border-bottom-left-radius") || "0px",
      bottomRight: this.getStyleValue("border-bottom-right-radius") || "0px",
    };
  }

  private handleBorderChange(e: CustomEvent) {
    const { property, value } = e.detail;
    this.updateStyle(property, value);
  }

  private renderPropertyRow(label: string, content: any) {
    return html`
      <nr-row gutter="8">
        <nr-col span="8"><nr-label size="small">${label}</nr-label></nr-col>
        <nr-col flex="auto">${content}</nr-col>
      </nr-row>
    `;
  }

  override render() {
    if (!this.component) {
      return html`<nr-label size="small" variant="secondary" style="padding: 16px; display: block; text-align: center;">No component selected</nr-label>`;
    }

    return html`
      <!-- State Selector -->
      ${this.renderPropertyRow("State", html`
        <nr-select
          size="small"
          .value=${this.styleState}
          .options=${[
            { label: "Default", value: "default" },
            { label: "Hover", value: ":hover" },
            { label: "Active", value: ":active" },
            { label: "Focus", value: ":focus" }
          ]}
          @nr-change=${(e: CustomEvent) => this.styleState = e.detail.value}
        ></nr-select>
      `)}

      <!-- Box Model Section -->
      <div class="section-title">Box Model</div>
      <div class="box-model-wrapper">
        <box-model-display
          .component=${this.component}
          .boxValues=${this.getBoxModelValue()}
          @onChange=${this.handleBoxModelChange}
        ></box-model-display>
      </div>

      <!-- Typography Section -->
      <div class="section-title">Typography</div>
      <div class="section-content">
        ${this.renderPropertyRow("Font Family", html`
          <nr-select
            size="small"
            .value=${this.getStyleValue("font-family") || "system-ui, -apple-system, sans-serif"}
            .options=${[
              { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
              { label: "Lato", value: "Lato, sans-serif" },
              { label: "Arial", value: "Arial, sans-serif" },
              { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
              { label: "Times New Roman", value: "Times New Roman, serif" },
              { label: "Georgia", value: "Georgia, serif" },
              { label: "Verdana", value: "Verdana, sans-serif" },
              { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
              { label: "Courier New", value: "Courier New, monospace" },
              { label: "Roboto", value: "Roboto, sans-serif" },
              { label: "Inter", value: "Inter, sans-serif" },
              { label: "Sans Serif (Generic)", value: "sans-serif" },
              { label: "Serif (Generic)", value: "serif" },
              { label: "Monospace (Generic)", value: "monospace" }
            ]}
            @nr-change=${(e: CustomEvent) => this.updateStyleWithCssVar("font-family", e.detail.value)}
          ></nr-select>
        `)}
        ${this.renderPropertyRow("Font Size", html`
          <nr-input
            size="small"
            .value=${this.getStyleValue("font-size")}
            placeholder="14px"
            @nr-input=${(e: CustomEvent) => this.updateStyleWithCssVar("font-size", e.detail.value)}
          ></nr-input>
        `)}
        ${this.renderPropertyRow("Font Weight", html`
          <nr-select
            size="small"
            .value=${this.getStyleValue("font-weight") || "400"}
            .options=${[
              { label: "Light (300)", value: "300" },
              { label: "Normal (400)", value: "400" },
              { label: "Medium (500)", value: "500" },
              { label: "Semi Bold (600)", value: "600" },
              { label: "Bold (700)", value: "700" }
            ]}
            @nr-change=${(e: CustomEvent) => this.updateStyleWithCssVar("font-weight", e.detail.value)}
          ></nr-select>
        `)}
        ${this.renderPropertyRow("Color", html`
          <nr-color-picker
            size="small"
            .value=${this.getStyleValue("color") || "#000000"}
            @color-changed=${(e: CustomEvent) => this.updateStyleWithCssVar("color", e.detail.value)}
          ></nr-color-picker>
        `)}
        ${this.renderPropertyRow("Text Align", html`
          <nr-select
            size="small"
            .value=${this.getStyleValue("text-align") || "left"}
            .options=${[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Justify", value: "justify" }
            ]}
            @nr-change=${(e: CustomEvent) => this.updateStyle("text-align", e.detail.value)}
          ></nr-select>
        `)}
      </div>

      <!-- Background Section -->
      <div class="section-title">Background</div>
      <div class="section-content">
        ${this.renderPropertyRow("Color", html`
          <nr-color-picker
            size="small"
            .value=${this.getStyleValue("background-color") || "transparent"}
            @nr-change=${(e: CustomEvent) => this.updateStyle("background-color", e.detail.value)}
          ></nr-color-picker>
        `)}
      </div>

      <!-- Border Section -->
      <div class="section-title">Border</div>
      <div class="box-model-wrapper">
        <border-editor-display
          .component=${this.component}
          .borderValues=${this.getBorderValues()}
          .borderRadiusValues=${this.getBorderRadiusValues()}
          @onChange=${this.handleBorderChange}
        ></border-editor-display>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "native-style-panel": NativeStylePanel;
  }
}
