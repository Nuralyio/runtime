import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { $components } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util';
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';

// Import the workflow wrapper component
import "../../wrappers/WorkflowWrapper/WorkflowWrapper.ts";

@customElement("workflow-wrapper-block")
export class WorkflowWrapperBlock extends BaseElementBlock {
  static styles = [css`
    :host {
      display: block;
    }

    .workflow-block-container {
      min-height: 60px;
      position: relative;
    }

    .workflow-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      min-height: 80px;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .workflow-placeholder:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }

    .workflow-placeholder.selected {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .placeholder-icon {
      font-size: 24px;
    }

    .placeholder-text {
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
    }

    .placeholder-hint {
      font-size: 11px;
      color: #94a3b8;
    }

    /* Children container */
    .children-container {
      min-height: 40px;
    }

    .children-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      min-height: 40px;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
      background: #fafafa;
      margin-top: 8px;
    }

    .children-placeholder span {
      font-size: 11px;
      color: #9ca3af;
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

  override connectedCallback() {
    super.connectedCallback();
    this.updateChildrenComponents();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }
  }

  private updateChildrenComponents(): void {
    const appComponents = $components.get()[this.component?.application_id] ?? [];
    this.childrenComponents = this.component?.children_ids?.map((id) => {
      return appComponents.find((component) => component.uuid === id);
    }).filter(Boolean) ?? [];
  }

  private renderChildren() {
    if (this.childrenComponents.length) {
      return renderComponent(
        this.childrenComponents.map((c) => ({ ...c, item: this.item })),
        this.item,
        this.isViewMode,
        { ...this.component, uniqueUUID: this.uniqueUUID }
      );
    }

    if (!this.isViewMode) {
      return html`
        <div class="children-placeholder">
          <span>Drop components here</span>
          <drag-wrapper
            .where=${"inside"}
            .message=${"Drop inside workflow"}
            .component=${{ ...this.component }}
            .inputRef=${this.inputRef}
            .isDragInitiator=${this.isDragInitiator}
          ></drag-wrapper>
        </div>
      `;
    }

    return nothing;
  }

  renderComponent() {
    const styles = this.component?.style || {};

    // Get properties from input
    const workflowId = this.resolvedInputs?.workflowId || '';
    const triggerType = this.resolvedInputs?.triggerType || 'manual';
    const autoExecute = this.resolvedInputs?.autoExecute ?? false;
    const inputMapping = this.resolvedInputs?.inputMapping || '{}';
    const outputVariable = this.resolvedInputs?.outputVariable || '';
    const showStatus = this.resolvedInputs?.showStatus ?? true;
    const timeout = this.resolvedInputs?.timeout || 30000;
    const viewport = this.resolvedInputs?.viewport ?? { panX: 0, panY: 0, zoom: 1 };
    const readonly = this.resolvedInputs?.readonly ?? false;
    const executionId = this.resolvedInputs?.executionId || '';

    return html`
      <div
        class="workflow-block-container"
        style=${styleMap(styles)}
        ${ref(this.inputRef)}
        @click=${(e: Event) => {
          if (!this.isViewMode) {
            e.stopPropagation();
            setCurrentComponentIdAction(this.component?.uuid);
          }
        }}
      >
        <workflow-wrapper
          .workflowId=${workflowId}
          .executionId=${executionId}
          .triggerType=${triggerType}
          .autoExecute=${autoExecute}
          .inputMapping=${inputMapping}
          .outputVariable=${outputVariable}
          .showStatus=${showStatus}
          .timeout=${timeout}
          .viewport=${viewport}
          .readonly=${readonly}
          .componentId=${this.component?.uuid}
          .applicationId=${this.component?.application_id}
          @onWorkflowStart=${(e: CustomEvent) => this.executeEvent('onWorkflowStart', e)}
          @onWorkflowComplete=${(e: CustomEvent) => this.executeEvent('onWorkflowComplete', e)}
          @onWorkflowError=${(e: CustomEvent) => this.executeEvent('onWorkflowError', e)}
          @onWorkflowProgress=${(e: CustomEvent) => this.executeEvent('onWorkflowProgress', e)}
        >
          ${this.renderChildren()}
        </workflow-wrapper>
      </div>
    `;
  }
}
