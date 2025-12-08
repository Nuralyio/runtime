import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";

// Safely import @nuralyui/panel
try {
  await import("@nuralyui/panel");
} catch (error) {
  console.warn('[@nuralyui/panel] Package not found or failed to load. Panel functionality may be limited.');
}

import { ref } from "lit/directives/ref.js";
import { PanelMode, PanelSize, PanelPosition, MaximizePosition } from "@nuralyui/panel";
import { $components } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util';

@customElement("panel-block")
export class PanelBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @property({ type: Boolean })
  isViewMode = false;

  @state()
  childrenComponents: ComponentElement[] = [];

  override async connectedCallback() {
    await super.connectedCallback();
    this.updateChildrenComponents();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }
  }

  private updateChildrenComponents(): void {
    this.childrenComponents = this.component?.childrenIds?.map((id) => {
      return $components.get()[this.component?.application_id]?.find((component) => component.uuid === id);
    }) ?? [];
  }

  renderComponent() {
    const panelStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const mode = this.component?.input?.mode?.value || this.inputHandlersValue?.mode || PanelMode.Panel;
    const size = this.component?.input?.size?.value || this.inputHandlersValue?.size || PanelSize.Medium;
    const position = this.component?.input?.position?.value || this.inputHandlersValue?.position || PanelPosition.Right;
    const maximizePosition = this.component?.input?.maximizePosition?.value || this.inputHandlersValue?.maximizePosition || MaximizePosition.Center;
    const draggable = this.component?.input?.draggable?.value ?? this.inputHandlersValue?.draggable ?? true;
    const resizable = this.component?.input?.resizable?.value ?? this.inputHandlersValue?.resizable ?? false;
    const collapsible = this.component?.input?.collapsible?.value ?? this.inputHandlersValue?.collapsible ?? false;
    const minimizable = this.component?.input?.minimizable?.value ?? this.inputHandlersValue?.minimizable ?? true;
    const closable = this.component?.input?.closable?.value ?? this.inputHandlersValue?.closable ?? true;
    const animated = this.component?.input?.animated?.value ?? this.inputHandlersValue?.animated ?? false;
    const title = this.component?.input?.title?.value || this.inputHandlersValue?.title || '';
    const icon = this.component?.input?.icon?.value || this.inputHandlersValue?.icon || '';
    const width = this.component?.input?.width?.value || this.inputHandlersValue?.width || '';
    const height = this.component?.input?.height?.value || this.inputHandlersValue?.height || '';
    const open = this.component?.input?.open?.value ?? this.inputHandlersValue?.open ?? true;

    return html`
      <nr-panel
        ${ref(this.inputRef)}
        style=${styleMap(panelStyles)}
        .mode=${mode}
        .size=${size}
        .position=${position}
        .maximizePosition=${maximizePosition}
        ?draggable=${draggable}
        ?resizable=${resizable}
        ?collapsible=${collapsible}
        ?minimizable=${minimizable}
        ?closable=${closable}
        ?animated=${animated}
        .title=${title}
        .icon=${icon}
        .width=${width}
        .height=${height}
        ?open=${open}
        @panel-mode-change=${(e: CustomEvent) => {
          this.executeEvent('onPanelModeChange', e);
        }}
        @panel-close=${(e: CustomEvent) => {
          this.executeEvent('onPanelClose', e);
        }}
        @panel-minimize=${(e: CustomEvent) => {
          this.executeEvent('onPanelMinimize', e);
        }}
        @panel-maximize=${(e: CustomEvent) => {
          this.executeEvent('onPanelMaximize', e);
        }}
        @panel-drag-start=${(e: CustomEvent) => {
          this.executeEvent('onPanelDragStart', e);
        }}
        @panel-drag-end=${(e: CustomEvent) => {
          this.executeEvent('onPanelDragEnd', e);
        }}
        @panel-resize=${(e: CustomEvent) => {
          this.executeEvent('onPanelResize', e);
        }}
        @panel-maximize-embedded=${(e: CustomEvent) => {
          this.executeEvent('onPanelMaximizeEmbedded', e);
        }}
        @panel-restore-embedded=${(e: CustomEvent) => {
          this.executeEvent('onPanelRestoreEmbedded', e);
        }}
      >
        ${this.childrenComponents.length
          ? renderComponent(
              this.childrenComponents.map((component) => ({ ...component, item: this.item })), 
              this.item, 
              this.isViewMode, 
              {...this.component, uniqueUUID : this.uniqueUUID}
            )
          : nothing}
        ${this.renderHeaderSlot()}
        ${this.renderFooterSlot()}
      </nr-panel>
    `;
  }

  /**
   * Render custom header slot if content is provided
   */
  private renderHeaderSlot() {
    const headerContent = this.component?.input?.headerContent?.value || this.inputHandlersValue?.headerContent;
    
    if (!headerContent) return nothing;
    
    return html`
      <div slot="header">
        ${headerContent}
      </div>
    `;
  }

  /**
   * Render custom footer slot if content is provided
   */
  private renderFooterSlot() {
    const footerContent = this.component?.input?.footerContent?.value || this.inputHandlersValue?.footerContent;
    
    if (!footerContent) return nothing;
    
    return html`
      <div slot="footer">
        ${footerContent}
      </div>
    `;
  }
}
