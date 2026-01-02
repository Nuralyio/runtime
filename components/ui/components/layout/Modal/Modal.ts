import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { $components } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util';
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';

import "@nuralyui/modal";
import { ModalSize, ModalPosition, ModalAnimation, ModalBackdrop } from "@nuralyui/modal";

@customElement("modal-block")
export class ModalBlock extends BaseElementBlock {
  static styles = [css`
    :host {
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      overflow: visible;
      pointer-events: none;
    }

    /* Modal indicator card - fixed position at top-right, stacks vertically */
    .modal-indicator-wrapper {
      position: fixed;
      top: var(--modal-indicator-top, 60px);
      right: 16px;
      z-index: 1000;
      pointer-events: auto;
    }

    .modal-editor-card {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      white-space: nowrap;
    }

    .modal-editor-card:hover {
      border-color: #9ca3af;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .modal-editor-card.selected {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .modal-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background-color: #6366f1;
      color: white;
    }

    .modal-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .modal-title {
      font-size: 12px;
      font-weight: 500;
      color: #374151;
      line-height: 1;
    }

    .modal-subtitle {
      font-size: 10px;
      color: #6b7280;
      line-height: 1;
    }

    .edit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background-color: transparent;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .edit-btn:hover {
      background-color: #e5e7eb;
      color: #374151;
    }

    .edit-btn.editing {
      background-color: #3b82f6;
      color: white;
    }

    /* Slot placeholder styles */
    .slot-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      min-height: 60px;
      border: 2px dashed #d1d5db;
      border-radius: 6px;
      background-color: #f9fafb;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .slot-placeholder:hover {
      border-color: #9ca3af;
      background-color: #f3f4f6;
    }

    .slot-placeholder.active {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    .slot-placeholder .slot-label {
      font-size: 12px;
      font-weight: 500;
      color: #374151;
    }

    .slot-placeholder nr-label {
      font-size: 11px;
      color: #6b7280;
    }

    .body-placeholder {
      min-height: 120px;
    }

    .slot-container {
      min-height: 60px;
    }

    .header-slot, .footer-slot {
      position: relative;
    }

    /* Ensure nr-modal receives pointer events despite host having pointer-events: none */
    nr-modal {
      pointer-events: auto;
    }
  `];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @property({ type: Boolean })
  isViewMode = false;

  @state()
  childrenComponents: ComponentElement[] = [];

  // Temporary state for editing - does not persist
  @state()
  private _editorOpen = false;

  // Public method to open editor mode (called from component tree/layers panel)
  public openEditor() {
    this._editorOpen = true;
  }

  // Public method to close editor mode
  public closeEditor() {
    this._editorOpen = false;
  }

  // Public method to toggle editor mode
  public toggleEditor() {
    this._editorOpen = !this._editorOpen;
  }

  // Calculate vertical position for indicator to stack modals vertically
  private _getIndicatorTop(): number {
    const baseTop = 60;
    const indicatorHeight = 44;
    const gap = 8;

    // Find all modal-block elements in the same document/shadow root and get this one's index
    const root = this.getRootNode() as Document | ShadowRoot;
    const allModals = root.querySelectorAll('modal-block');
    let index = 0;
    allModals.forEach((modal, i) => {
      if (modal === this) {
        index = i;
      }
    });

    return baseTop + (index * (indicatorHeight + gap));
  }

  override connectedCallback() {
    super.connectedCallback();
    this.updateChildrenComponents();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();

      // In editor mode, sync _editorOpen with the open input property
      if (!this.isViewMode) {
        const openValue = this.component?.input?.open?.value ?? false;
        if (this._editorOpen !== openValue) {
          this._editorOpen = openValue;
        }
      }
    }
  }

  private updateChildrenComponents(): void {
    const appComponents = $components.get()[this.component?.application_id] ?? [];

    // Body children (default slot)
    this.childrenComponents = this.component?.children_ids?.map((id) => {
      return appComponents.find((component) => component.uuid === id);
    }).filter(Boolean) ?? [];
  }

  private renderBodySlot() {
    if (this.isViewMode) {
      return this.childrenComponents.length
        ? renderComponent(
            this.childrenComponents.map((c) => ({ ...c, item: this.item })),
            this.item,
            this.isViewMode,
            { ...this.component, uniqueUUID: this.uniqueUUID }
          )
        : nothing;
    }

    // Editor mode
    return html`
      <div class="slot-container">
        ${this.childrenComponents.length
          ? renderComponent(
              this.childrenComponents.map((c) => ({ ...c, item: this.item })),
              this.item,
              this.isViewMode,
              { ...this.component, uniqueUUID: this.uniqueUUID }
            )
          : html`
              <div
                class="slot-placeholder body-placeholder"
                @click="${(e: Event) => {
                  e.stopPropagation();
                  setCurrentComponentIdAction(this.component?.uuid);
                }}"
              >
                <nr-icon name="layout-grid"></nr-icon>
                <span class="slot-label">Modal Content</span>
                <nr-label>Drop components here</nr-label>
                <drag-wrapper
                  .where=${"inside"}
                  .message=${"Drop inside modal"}
                  .component=${{ ...this.component }}
                  .inputRef=${this.inputRef}
                  .isDragInitiator=${this.isDragInitiator}
                ></drag-wrapper>
              </div>
            `}
      </div>
    `;
  }

  renderComponent() {
    const modalStyles = this.component?.style || {};

    // Get properties from input or inputHandlers
    const open = this.resolvedInputs?.open ?? false;
    const size = this.resolvedInputs?.size || ModalSize.Medium;
    const position =  this.resolvedInputs?.position || ModalPosition.Center;
    const backdrop = this.resolvedInputs?.backdrop || ModalBackdrop.Closable;
    const closable =  this.resolvedInputs?.closable ?? true;
    const animation =  this.resolvedInputs?.animation || ModalAnimation.None;
    const modalTitle = this.component?.input?.modalTitle?.value || this.resolvedInputs?.modalTitle || 'Modal';
    const showCloseButton =  this.resolvedInputs?.showCloseButton ?? true;
    const modalDraggable =  this.resolvedInputs?.modalDraggable ?? false;
    const width = this.resolvedInputs?.width || '';
    const height =  this.resolvedInputs?.height || '';

    // In editor mode: show card at top-right corner of page (outside layout) + modal when editing
    if (!this.isViewMode) {
      return html`
        <!-- Card wrapper - displays inline in the editor -->
        <div class="modal-indicator-wrapper" style="--modal-indicator-top: ${this._getIndicatorTop()}px">
          <div
            class="modal-editor-card"
            @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
          >
            <div class="modal-icon">
              <nr-icon name="square-stack" size="14"></nr-icon>
            </div>
            <div class="modal-info">
              <span class="modal-title">${modalTitle || 'Modal'}</span>
              <span class="modal-subtitle">${this.component?.name || 'modal-block'}</span>
            </div>
            <button
              class="edit-btn ${this._editorOpen ? 'editing' : ''}"
              @click="${(e: Event) => {
                e.stopPropagation();
                this._editorOpen = !this._editorOpen;
              }}"
              title="${this._editorOpen ? 'Close editor' : 'Edit modal content'}"
            >
              <nr-icon name="${this._editorOpen ? 'x' : 'pencil'}" size="14"></nr-icon>
            </button>
          </div>
        </div>

        <!-- Modal shows when editing -->
        ${this._editorOpen ? html`
          <nr-modal
            ${ref(this.inputRef)}
            style=${styleMap(modalStyles)}
            ?open=${true}
            .size=${size}
            .position=${position}
            .backdrop=${ModalBackdrop.Closable}
            ?closable=${true}
            .animation=${ModalAnimation.Fade}
            .modalTitle=${modalTitle || 'Modal'}
            ?showCloseButton=${true}
            ?modalDraggable=${true}
            .width=${width}
            .height=${height}
            @modal-close=${(e: CustomEvent) => {
              alert('ok')
               this._editorOpen = false;
               this.executeEvent('onModalClose', e);
               this.requestUpdate();
             }}
            @modal-escape=${(e: CustomEvent) => {
               this._editorOpen = false;
               this.executeEvent('onModalClose', e);
               this.requestUpdate();
             }}
          >
            ${this.renderBodySlot()}
          </nr-modal>
        ` : nothing}
      `;
    }

    // In view mode, render actual nr-modal with all settings
    return html`
      <nr-modal
        ${ref(this.inputRef)}
        style=${styleMap(modalStyles)}
        ?open=${open}
        .size=${size}
        .position=${position}
        .backdrop=${backdrop}
        ?closable=${closable}
        .animation=${animation}
        .modalTitle=${modalTitle}
        ?showCloseButton=${showCloseButton}
        ?modalDraggable=${modalDraggable}
        .width=${width}
        .height=${height}
        @modal-open=${(e: CustomEvent) => {
          this.executeEvent('onModalOpen', e);
        }}
        @modal-close=${(e: CustomEvent) => {
          this.executeEvent('onModalClose', e);
        }}
        @modal-before-close=${(e: CustomEvent) => {
          this.executeEvent('onModalBeforeClose', e);
        }}
        @modal-after-open=${(e: CustomEvent) => {
          this.executeEvent('onModalAfterOpen', e);
        }}
      >
        ${this.renderBodySlot()}
      </nr-modal>
    `;
  }
}
