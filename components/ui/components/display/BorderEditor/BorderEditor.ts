import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface BorderValues {
  width: string;
  style: string;
  color: string;
}

interface BorderRadiusValues {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

@customElement("border-editor-display")
export class BorderEditorDisplay extends BaseElementBlock {
  @property({ type: Object }) borderValues: BorderValues | null = null;
  @property({ type: Object }) borderRadiusValues: BorderRadiusValues | null = null;
  @property({ type: Object }) component: ComponentElement;

  @state() private activeEdges = {
    all: true,
    top: false,
    right: false,
    bottom: false,
    left: false,
  };

  @state() private radiusLinked = true;

  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
      }

      .border-editor {
        padding: 8px 0;
      }

      .edge-selector {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .edge-selector nr-button {
        --nuraly-button-padding: 4px 8px;
        --nuraly-button-font-size: 10px;
      }

      .property-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
      }

      .property-label {
        width: 50px;
        font-size: 11px;
        color: var(--text-secondary, #666);
      }

      .property-input {
        flex: 1;
        display: flex;
        gap: 4px;
        align-items: center;
      }

      nr-input {
        --nuraly-input-container-padding-top: 4px;
        --nuraly-input-container-padding-bottom: 4px;
        --nuraly-input-container-padding-left: 8px;
        --nuraly-input-container-padding-right: 8px;
      }

      nr-select {
        flex: 1;
      }

      .section-divider {
        border-top: 1px solid var(--border-color, #e0e0e0);
        margin: 12px 0;
        padding-top: 12px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .section-title {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-secondary, #666);
      }

      .radius-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .radius-input-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .radius-input-wrapper .corner-label {
        font-size: 10px;
        color: var(--text-secondary, #888);
        min-width: 20px;
      }

      .link-button {
        --nuraly-button-padding: 2px 6px;
        --nuraly-button-font-size: 10px;
      }
    `,
  ];

  private toggleEdge(edge: 'all' | 'top' | 'right' | 'bottom' | 'left') {
    const values = this.borderValues;
    const width = values?.width || '1';
    const style = values?.style || 'solid';
    const color = values?.color || '#000000';
    const borderValue = `${this.parseValue(width)}px ${style} ${color}`;
    const event = new CustomEvent('change');

    if (edge === 'all') {
      const newAllState = !this.activeEdges.all;
      this.activeEdges = {
        all: newAllState,
        top: false,
        right: false,
        bottom: false,
        left: false,
      };

      // Clear individual edges when switching to "all"
      if (newAllState) {
        ['top', 'right', 'bottom', 'left'].forEach(e => {
          this.executeEvent("onChange", event, {
            property: `border-${e}`,
            value: undefined,
          });
        });
        this.executeEvent("onChange", event, {
          property: 'border',
          value: borderValue,
        });
      } else {
        this.executeEvent("onChange", event, {
          property: 'border',
          value: 'none',
        });
      }
    } else {
      const newEdgeState = !this.activeEdges[edge];

      // If switching from "all" to individual edges
      if (this.activeEdges.all) {
        this.executeEvent("onChange", event, {
          property: 'border',
          value: undefined,
        });
      }

      this.activeEdges = {
        ...this.activeEdges,
        all: false,
        [edge]: newEdgeState,
      };

      // Apply or remove only this specific edge
      this.executeEvent("onChange", event, {
        property: `border-${edge}`,
        value: newEdgeState ? borderValue : undefined,
      });
    }

    this.requestUpdate();
  }

  private getActiveEdges(): string[] {
    if (this.activeEdges.all) {
      return ['all'];
    }
    const edges: string[] = [];
    if (this.activeEdges.top) edges.push('top');
    if (this.activeEdges.right) edges.push('right');
    if (this.activeEdges.bottom) edges.push('bottom');
    if (this.activeEdges.left) edges.push('left');
    return edges;
  }

  private getBorderShorthand(width?: string, style?: string, color?: string): string {
    const values = this.borderValues;
    const w = width ?? values?.width ?? '0';
    const s = style ?? values?.style ?? 'solid';
    const c = color ?? values?.color ?? '#000000';
    const widthValue = w.includes('px') ? w : `${w}px`;
    return `${widthValue} ${s} ${c}`;
  }

  private handleWidthChange(e: CustomEvent) {
    const value = e.detail.value || '0';
    const edges = this.getActiveEdges();
    const borderValue = this.getBorderShorthand(value);

    if (edges.length === 0) return;

    if (edges.includes('all')) {
      this.executeEvent("onChange", e, {
        property: 'border',
        value: borderValue,
      });
    } else {
      edges.forEach(edge => {
        this.executeEvent("onChange", e, {
          property: `border-${edge}`,
          value: borderValue,
        });
      });
    }
  }

  private handleStyleChange(e: CustomEvent) {
    const value = e.detail.value;
    const edges = this.getActiveEdges();
    const borderValue = this.getBorderShorthand(undefined, value);

    if (edges.length === 0) return;

    if (edges.includes('all')) {
      this.executeEvent("onChange", e, {
        property: 'border',
        value: borderValue,
      });
    } else {
      edges.forEach(edge => {
        this.executeEvent("onChange", e, {
          property: `border-${edge}`,
          value: borderValue,
        });
      });
    }
  }

  private handleColorChange(e: CustomEvent) {
    const value = e.detail.value;
    const edges = this.getActiveEdges();
    const borderValue = this.getBorderShorthand(undefined, undefined, value);

    if (edges.length === 0) return;

    if (edges.includes('all')) {
      this.executeEvent("onChange", e, {
        property: 'border',
        value: borderValue,
      });
    } else {
      edges.forEach(edge => {
        this.executeEvent("onChange", e, {
          property: `border-${edge}`,
          value: borderValue,
        });
      });
    }
  }

  private parseValue(value: string): string {
    if (!value) return '0';
    return value.replace('px', '');
  }

  private handleRadiusChange(corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', e: CustomEvent) {
    const value = e.detail.value || '0';
    const radiusValue = value.includes('px') ? value : `${value}px`;

    if (this.radiusLinked) {
      // Apply to all corners when linked
      const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      corners.forEach(c => {
        this.executeEvent("onChange", e, {
          property: `border-${c}-radius`,
          value: radiusValue,
        });
      });
    } else {
      // Apply to specific corner
      const propertyMap: Record<string, string> = {
        topLeft: 'border-top-left-radius',
        topRight: 'border-top-right-radius',
        bottomLeft: 'border-bottom-left-radius',
        bottomRight: 'border-bottom-right-radius',
      };
      this.executeEvent("onChange", e, {
        property: propertyMap[corner],
        value: radiusValue,
      });
    }
  }

  private toggleRadiusLink() {
    const wasLinked = this.radiusLinked;
    this.radiusLinked = !this.radiusLinked;

    // When switching to linked mode, apply the first corner value to all corners
    if (this.radiusLinked && !wasLinked) {
      const value = this.borderRadiusValues?.topLeft || '0px';
      const radiusValue = value.includes('px') ? value : `${value}px`;
      const event = new CustomEvent('change');
      const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      corners.forEach(c => {
        this.executeEvent("onChange", event, {
          property: `border-${c}-radius`,
          value: radiusValue,
        });
      });
    }

    this.requestUpdate();
  }

  override renderComponent() {
    const values = this.borderValues;

    if (!values) {
      return html`
        <div style="padding: 20px; text-align: center; color: #666;">
          Select a component to edit borders
        </div>
      `;
    }

    const styleOptions = [
      { label: "None", value: "none" },
      { label: "Solid", value: "solid" },
      { label: "Dashed", value: "dashed" },
      { label: "Dotted", value: "dotted" },
      { label: "Double", value: "double" },
      { label: "Groove", value: "groove" },
      { label: "Ridge", value: "ridge" },
      { label: "Inset", value: "inset" },
      { label: "Outset", value: "outset" },
    ];

    const hasActiveEdge = this.activeEdges.all || this.activeEdges.top ||
      this.activeEdges.right || this.activeEdges.bottom || this.activeEdges.left;

    return html`
      <div class="border-editor">
        <!-- Edge Selector (Toggle) -->
        <div class="edge-selector">
          <nr-button
            size="small"
            type=${this.activeEdges.all ? 'primary' : 'default'}
            @click=${() => this.toggleEdge('all')}
          >All</nr-button>
          <nr-button
            size="small"
            type=${this.activeEdges.top ? 'primary' : 'default'}
            @click=${() => this.toggleEdge('top')}
          >Top</nr-button>
          <nr-button
            size="small"
            type=${this.activeEdges.right ? 'primary' : 'default'}
            @click=${() => this.toggleEdge('right')}
          >Right</nr-button>
          <nr-button
            size="small"
            type=${this.activeEdges.bottom ? 'primary' : 'default'}
            @click=${() => this.toggleEdge('bottom')}
          >Bottom</nr-button>
          <nr-button
            size="small"
            type=${this.activeEdges.left ? 'primary' : 'default'}
            @click=${() => this.toggleEdge('left')}
          >Left</nr-button>
        </div>

        <!-- Width -->
        <div class="property-row">
          <span class="property-label">Width</span>
          <div class="property-input">
            <nr-input
              size="small"
              .value=${this.parseValue(values.width)}
              placeholder="0"
              ?disabled=${!hasActiveEdge}
              @nr-input=${this.handleWidthChange}
            ></nr-input>
          </div>
        </div>

        <!-- Style -->
        <div class="property-row">
          <span class="property-label">Style</span>
          <div class="property-input">
            <nr-select
              size="small"
              .value=${values.style || 'none'}
              .options=${styleOptions}
              ?disabled=${!hasActiveEdge}
              @nr-change=${this.handleStyleChange}
            ></nr-select>
          </div>
        </div>

        <!-- Color -->
        <div class="property-row">
          <span class="property-label">Color</span>
          <div class="property-input">
            <nr-color-picker
              size="small"
              .color=${values.color || '#000000'}
              ?disabled=${!hasActiveEdge}
              @color-changed=${this.handleColorChange}
            ></nr-color-picker>
          </div>
        </div>

        <!-- Border Radius Section -->
        <div class="section-divider">
          <div class="section-header">
            <span class="section-title">Border Radius</span>
            <nr-button
              class="link-button"
              size="small"
              type=${this.radiusLinked ? 'primary' : 'default'}
              @click=${this.toggleRadiusLink}
            >${this.radiusLinked ? 'Linked' : 'Individual'}</nr-button>
          </div>

          ${this.radiusLinked ? html`
            <!-- Single input for all corners -->
            <div class="property-row">
              <span class="property-label">All</span>
              <div class="property-input">
                <nr-input
                  size="small"
                  .value=${this.parseValue(this.borderRadiusValues?.topLeft || '0')}
                  placeholder="0"
                  @nr-input=${(e: CustomEvent) => this.handleRadiusChange('topLeft', e)}
                ></nr-input>
              </div>
            </div>
          ` : html`
            <!-- Individual corner inputs -->
            <div class="radius-grid">
              <div class="radius-input-wrapper">
                <span class="corner-label">TL</span>
                <nr-input
                  size="small"
                  .value=${this.parseValue(this.borderRadiusValues?.topLeft || '0')}
                  placeholder="0"
                  @nr-input=${(e: CustomEvent) => this.handleRadiusChange('topLeft', e)}
                ></nr-input>
              </div>
              <div class="radius-input-wrapper">
                <span class="corner-label">TR</span>
                <nr-input
                  size="small"
                  .value=${this.parseValue(this.borderRadiusValues?.topRight || '0')}
                  placeholder="0"
                  @nr-input=${(e: CustomEvent) => this.handleRadiusChange('topRight', e)}
                ></nr-input>
              </div>
              <div class="radius-input-wrapper">
                <span class="corner-label">BL</span>
                <nr-input
                  size="small"
                  .value=${this.parseValue(this.borderRadiusValues?.bottomLeft || '0')}
                  placeholder="0"
                  @nr-input=${(e: CustomEvent) => this.handleRadiusChange('bottomLeft', e)}
                ></nr-input>
              </div>
              <div class="radius-input-wrapper">
                <span class="corner-label">BR</span>
                <nr-input
                  size="small"
                  .value=${this.parseValue(this.borderRadiusValues?.bottomRight || '0')}
                  placeholder="0"
                  @nr-input=${(e: CustomEvent) => this.handleRadiusChange('bottomRight', e)}
                ></nr-input>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }
}
