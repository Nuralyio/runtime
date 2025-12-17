import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { handleComponentEvent } from '../../base/BaseElement/execute-event.helpers.ts';
import { borderManagerStyles } from './BorderManager.style.ts';

// Border configuration interface
interface BorderConfig {
  width: number;
  style: string;
  color: string;
  unit: string;
}

interface BorderSides {
  all: boolean;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  unit: string;
  linked: boolean;
}

interface BorderState {
  sides: BorderSides;
  config: BorderConfig;
  radius: BorderRadius;
  individualConfigs: {
    top: BorderConfig;
    right: BorderConfig;
    bottom: BorderConfig;
    left: BorderConfig;
  };
}

// Border style options
const BORDER_STYLES = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
  { label: 'Double', value: 'double' },
  { label: 'Groove', value: 'groove' },
  { label: 'Ridge', value: 'ridge' },
  { label: 'Inset', value: 'inset' },
  { label: 'Outset', value: 'outset' },
  { label: 'None', value: 'none' },
];

// Border presets
const BORDER_PRESETS = {
  none: (): Partial<BorderState> => ({
    config: { width: 0, style: 'none', color: '#000000', unit: 'px' },
    sides: { all: true, top: false, right: false, bottom: false, left: false }
  }),
  thin: (): Partial<BorderState> => ({
    config: { width: 1, style: 'solid', color: '#d9d9d9', unit: 'px' },
    sides: { all: true, top: false, right: false, bottom: false, left: false }
  }),
  medium: (): Partial<BorderState> => ({
    config: { width: 2, style: 'solid', color: '#d9d9d9', unit: 'px' },
    sides: { all: true, top: false, right: false, bottom: false, left: false }
  }),
  thick: (): Partial<BorderState> => ({
    config: { width: 3, style: 'solid', color: '#d9d9d9', unit: 'px' },
    sides: { all: true, top: false, right: false, bottom: false, left: false }
  }),
  accent: (): Partial<BorderState> => ({
    config: { width: 2, style: 'solid', color: '#1890ff', unit: 'px' },
    sides: { all: true, top: false, right: false, bottom: false, left: false }
  }),
  dashed: (): Partial<BorderState> => ({
    config: { width: 1, style: 'dashed', color: '#d9d9d9', unit: 'px' },
    sides: { all: true, top: false, right: false, bottom: false, left: false }
  }),
};

type BorderPresetKey = keyof typeof BORDER_PRESETS;

@customElement("border-manager-display")
export class BorderManagerDisplay extends BaseElementBlock {
  static override styles = [borderManagerStyles];

  @property({ type: Object })
  component: ComponentElement;

  @state()
  private borderState: BorderState = {
    sides: { all: true, top: false, right: false, bottom: false, left: false },
    config: { width: 0, style: 'none', color: '#000000', unit: 'px' },
    radius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, unit: 'px', linked: true },
    individualConfigs: {
      top: { width: 1, style: 'solid', color: '#d9d9d9', unit: 'px' },
      right: { width: 1, style: 'solid', color: '#d9d9d9', unit: 'px' },
      bottom: { width: 1, style: 'solid', color: '#d9d9d9', unit: 'px' },
      left: { width: 1, style: 'solid', color: '#d9d9d9', unit: 'px' },
    }
  };

  private emitBorderChange(property: string, value: any) {
    handleComponentEvent({
      isViewMode: true,
      component: this.component,
      item: this.item,
      eventName: "onChange",
      event: new CustomEvent('change'),
      data: { property, type: 'style', value },
    });
  }

  private getBorderFromHandlers(): BorderState {
    const handlers = this.inputHandlersValue;
    const style = handlers?.value?.style || handlers?.style || {};

    // Parse existing border values
    const parseBorder = (borderStr: string): BorderConfig => {
      if (!borderStr || borderStr === 'none') {
        return { width: 0, style: 'none', color: '#000000', unit: 'px' };
      }
      const parts = borderStr.split(' ');
      const widthMatch = parts[0]?.match(/^(\d+)(px|em|rem|%)?$/);
      return {
        width: widthMatch ? parseInt(widthMatch[1]) : 0,
        style: parts[1] || 'solid',
        color: parts[2] || '#000000',
        unit: widthMatch?.[2] || 'px'
      };
    };

    const parseRadius = (radiusStr: string): number => {
      if (!radiusStr) return 0;
      const match = radiusStr.match(/^(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    // Determine active sides
    const hasBorder = !!style.border && style.border !== 'none';
    const hasTop = !!style['border-top'] && style['border-top'] !== 'none';
    const hasRight = !!style['border-right'] && style['border-right'] !== 'none';
    const hasBottom = !!style['border-bottom'] && style['border-bottom'] !== 'none';
    const hasLeft = !!style['border-left'] && style['border-left'] !== 'none';

    const mainConfig = parseBorder(style.border || style['border-top'] || style['border-right'] || style['border-bottom'] || style['border-left'] || '');

    return {
      sides: {
        all: hasBorder,
        top: hasTop,
        right: hasRight,
        bottom: hasBottom,
        left: hasLeft,
      },
      config: mainConfig,
      radius: {
        topLeft: parseRadius(style['border-top-left-radius']),
        topRight: parseRadius(style['border-top-right-radius']),
        bottomLeft: parseRadius(style['border-bottom-left-radius']),
        bottomRight: parseRadius(style['border-bottom-right-radius']),
        unit: 'px',
        linked: true
      },
      individualConfigs: {
        top: parseBorder(style['border-top']),
        right: parseBorder(style['border-right']),
        bottom: parseBorder(style['border-bottom']),
        left: parseBorder(style['border-left']),
      }
    };
  }

  private applyPreset(presetKey: BorderPresetKey) {
    const preset = BORDER_PRESETS[presetKey]();
    if (preset.config) {
      this.borderState = { ...this.borderState, ...preset };
    }
    this.emitAllBorderChanges();
    this.requestUpdate();
  }

  private toggleSide(side: keyof BorderSides) {
    if (side === 'all') {
      this.borderState.sides = {
        all: true,
        top: false,
        right: false,
        bottom: false,
        left: false,
      };
    } else {
      this.borderState.sides = {
        ...this.borderState.sides,
        all: false,
        [side]: !this.borderState.sides[side],
      };
    }
    this.emitAllBorderChanges();
    this.requestUpdate();
  }

  private updateConfig(key: keyof BorderConfig, value: any) {
    this.borderState.config = { ...this.borderState.config, [key]: value };
    this.emitAllBorderChanges();
    this.requestUpdate();
  }

  private updateRadius(corner: keyof Omit<BorderRadius, 'unit' | 'linked'>, value: number) {
    if (this.borderState.radius.linked) {
      this.borderState.radius = {
        ...this.borderState.radius,
        topLeft: value,
        topRight: value,
        bottomLeft: value,
        bottomRight: value,
      };
    } else {
      this.borderState.radius = { ...this.borderState.radius, [corner]: value };
    }
    this.emitRadiusChanges();
    this.requestUpdate();
  }

  private toggleRadiusLink() {
    this.borderState.radius.linked = !this.borderState.radius.linked;
    if (this.borderState.radius.linked) {
      // Sync all to topLeft value
      const val = this.borderState.radius.topLeft;
      this.borderState.radius = {
        ...this.borderState.radius,
        topRight: val,
        bottomLeft: val,
        bottomRight: val,
      };
      this.emitRadiusChanges();
    }
    this.requestUpdate();
  }

  private formatBorder(config: BorderConfig): string {
    if (config.style === 'none' || config.width === 0) {
      return 'none';
    }
    return `${config.width}${config.unit} ${config.style} ${config.color}`;
  }

  private emitAllBorderChanges() {
    const { sides, config } = this.borderState;
    const borderValue = this.formatBorder(config);

    if (sides.all) {
      this.emitBorderChange('border', borderValue);
      // Clear individual sides
      this.emitBorderChange('border-top', undefined);
      this.emitBorderChange('border-right', undefined);
      this.emitBorderChange('border-bottom', undefined);
      this.emitBorderChange('border-left', undefined);
    } else {
      this.emitBorderChange('border', undefined);
      this.emitBorderChange('border-top', sides.top ? borderValue : undefined);
      this.emitBorderChange('border-right', sides.right ? borderValue : undefined);
      this.emitBorderChange('border-bottom', sides.bottom ? borderValue : undefined);
      this.emitBorderChange('border-left', sides.left ? borderValue : undefined);
    }
  }

  private emitRadiusChanges() {
    const { radius } = this.borderState;
    this.emitBorderChange('border-top-left-radius', `${radius.topLeft}${radius.unit}`);
    this.emitBorderChange('border-top-right-radius', `${radius.topRight}${radius.unit}`);
    this.emitBorderChange('border-bottom-left-radius', `${radius.bottomLeft}${radius.unit}`);
    this.emitBorderChange('border-bottom-right-radius', `${radius.bottomRight}${radius.unit}`);
  }

  private handleColorChange(e: CustomEvent) {
    this.updateConfig('color', e.detail.value);
  }

  private renderPresetButtons() {
    return html`
      <div class="section">
        <div class="section-title">Border Presets</div>
        <div class="preset-buttons">
          <nr-button dashed size="small" @click=${() => this.applyPreset('none')}>none</nr-button>
          <nr-button dashed size="small" @click=${() => this.applyPreset('thin')}>thin</nr-button>
          <nr-button dashed size="small" @click=${() => this.applyPreset('medium')}>medium</nr-button>
          <nr-button dashed size="small" @click=${() => this.applyPreset('thick')}>thick</nr-button>
          <nr-button dashed size="small" @click=${() => this.applyPreset('accent')}>accent</nr-button>
          <nr-button dashed size="small" @click=${() => this.applyPreset('dashed')}>dashed</nr-button>
        </div>
      </div>
    `;
  }

  private renderBorderConfig() {
    const { sides, config } = this.borderState;

    return html`
      <div class="section">
        <div class="section-title">Border Style</div>
        <div class="config-panel">
          <div class="config-header">
            <span class="config-title">Sides</span>
            <div class="side-toggles">
              <span class="side-toggle ${sides.all ? 'active' : ''}" @click=${() => this.toggleSide('all')}>ALL</span>
              <span class="side-toggle ${sides.top ? 'active' : ''}" @click=${() => this.toggleSide('top')}>T</span>
              <span class="side-toggle ${sides.right ? 'active' : ''}" @click=${() => this.toggleSide('right')}>R</span>
              <span class="side-toggle ${sides.bottom ? 'active' : ''}" @click=${() => this.toggleSide('bottom')}>B</span>
              <span class="side-toggle ${sides.left ? 'active' : ''}" @click=${() => this.toggleSide('left')}>L</span>
            </div>
          </div>

          <div class="config-row">
            <span class="config-label">Width</span>
            <div class="config-input">
              <nr-input
                class="width-input"
                type="number"
                size="small"
                .value=${String(config.width)}
                @nr-input=${(e: CustomEvent) => this.updateConfig('width', parseInt(e.detail?.value) || 0)}
              ></nr-input>
              <span style="font-size: 10px; color: #888;">px</span>
            </div>
          </div>

          <div class="config-row">
            <span class="config-label">Style</span>
            <div class="config-input">
              <nr-select
                size="small"
                .value=${config.style}
                .options=${BORDER_STYLES}
                @nr-change=${(e: CustomEvent) => this.updateConfig('style', e.detail?.value?.value || e.detail?.value || 'solid')}
              ></nr-select>
            </div>
          </div>

          <div class="config-row">
            <span class="config-label">Color</span>
            <div class="config-input">
              <nr-color-picker
                .color=${config.color}
                @color-changed=${this.handleColorChange}
              ></nr-color-picker>
              <nr-input
                size="small"
                .value=${config.color}
                @nr-input=${(e: CustomEvent) => this.updateConfig('color', e.detail?.value || '#000000')}
              ></nr-input>
            </div>
          </div>

          <!-- Preview -->
          <div class="preview-box" style="
            border: ${this.formatBorder(config)};
            border-radius: ${this.borderState.radius.topLeft}${this.borderState.radius.unit};
          "></div>
        </div>
      </div>
    `;
  }

  private renderRadiusConfig() {
    const { radius } = this.borderState;

    return html`
      <div class="section radius-section">
        <div class="section-title">Border Radius</div>
        <div class="config-panel">
          <div class="link-toggle ${radius.linked ? 'linked' : ''}" @click=${() => this.toggleRadiusLink()}>
            <nr-icon name=${radius.linked ? 'link' : 'disconnect'}></nr-icon>
            <span>${radius.linked ? 'Linked' : 'Individual'}</span>
          </div>

          ${radius.linked ? html`
            <div class="config-row">
              <span class="config-label">All</span>
              <div class="config-input">
                <nr-input
                  class="width-input"
                  type="number"
                  size="small"
                  .value=${String(radius.topLeft)}
                  @nr-input=${(e: CustomEvent) => this.updateRadius('topLeft', parseInt(e.detail?.value) || 0)}
                ></nr-input>
                <span style="font-size: 10px; color: #888;">px</span>
              </div>
            </div>
          ` : html`
            <div class="radius-grid">
              <div class="radius-item">
                <span class="radius-label">TL</span>
                <nr-input
                  class="radius-input"
                  type="number"
                  size="small"
                  .value=${String(radius.topLeft)}
                  @nr-input=${(e: CustomEvent) => this.updateRadius('topLeft', parseInt(e.detail?.value) || 0)}
                ></nr-input>
              </div>
              <div class="radius-item">
                <span class="radius-label">TR</span>
                <nr-input
                  class="radius-input"
                  type="number"
                  size="small"
                  .value=${String(radius.topRight)}
                  @nr-input=${(e: CustomEvent) => this.updateRadius('topRight', parseInt(e.detail?.value) || 0)}
                ></nr-input>
              </div>
              <div class="radius-item">
                <span class="radius-label">BL</span>
                <nr-input
                  class="radius-input"
                  type="number"
                  size="small"
                  .value=${String(radius.bottomLeft)}
                  @nr-input=${(e: CustomEvent) => this.updateRadius('bottomLeft', parseInt(e.detail?.value) || 0)}
                ></nr-input>
              </div>
              <div class="radius-item">
                <span class="radius-label">BR</span>
                <nr-input
                  class="radius-input"
                  type="number"
                  size="small"
                  .value=${String(radius.bottomRight)}
                  @nr-input=${(e: CustomEvent) => this.updateRadius('bottomRight', parseInt(e.detail?.value) || 0)}
                ></nr-input>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  override renderComponent() {
    // Initialize state from handlers on first render
    const handlersState = this.getBorderFromHandlers();

    return html`
      <div class="border-container">
        ${this.renderPresetButtons()}
        <div class="divider"></div>
        ${this.renderBorderConfig()}
        ${this.renderRadiusConfig()}
      </div>
    `;
  }
}
