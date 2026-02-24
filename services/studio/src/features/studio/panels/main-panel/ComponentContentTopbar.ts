import { html, css, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type Ref } from "lit/directives/ref.js";
import { type ComponentElement } from '@nuraly/runtime/redux/store';
import { updateComponentAttributes } from '@nuraly/runtime/redux/actions';
import { getTopbarControls, type TopbarControl } from './topbar-configs';
import { PositionTracker } from './position-tracker';

@customElement("component-content-topbar")
export class ComponentContentTopbar extends LitElement {
  static styles = css`
    .content-topbar {
      position: fixed;
      transform: translateX(-50%);
      z-index: 1002;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      pointer-events: auto;
    }

    .divider {
      width: 1px;
      height: 20px;
      background: #e0e0e0;
    }
  `;

  @property({ type: Object }) component: ComponentElement | null = null;
  @property({ type: Object }) componentRef: Ref<HTMLElement> | null = null;

  private tracker = new PositionTracker(
    this,
    () => this.componentRef,
    (rect) => ({
      top: rect.top - 22 - 36 - 4,
      left: rect.left + rect.width / 2,
    }),
  );

  private getInputValue(inputProperty: string): any {
    const inputValue = this.component?.input?.[inputProperty];
    if (inputValue === undefined || inputValue === null) return undefined;
    if (typeof inputValue === "object" && "type" in inputValue) {
      if (inputValue.type === "handler") return undefined;
      return inputValue.value;
    }
    return inputValue;
  }

  private handleChange(control: TopbarControl, value: any) {
    if (!this.component) return;
    const { property: prop } = control;
    const wrappedValue = {
      type: prop.type === 'boolean' ? 'boolean' : prop.type === 'number' ? 'number' : 'string',
      value,
    };
    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "input",
      { [prop.inputProperty]: wrappedValue },
      true
    );
  }

  private getOptions(control: TopbarControl) {
    const options = control.property.options || [];
    if (!control.optionLabels) return options;
    return options.map(opt => ({
      label: control.optionLabels[opt.value] ?? opt.label,
      value: opt.value,
    }));
  }

  private renderControl(control: TopbarControl) {
    const { property: prop } = control;
    const value = this.getInputValue(prop.inputProperty);

    switch (prop.type) {
      case 'text':
        return html`
          <nr-input
            size="small"
            .value=${value || ''}
            placeholder=${prop.placeholder || ''}
            style=${control.width ? `width: ${control.width}` : ''}
            @nr-input=${(e: CustomEvent) => this.handleChange(control, e.detail.value)}
          ></nr-input>
        `;
      case 'select':
        return html`
          <nr-select
            size="small"
            .value=${value || ''}
            .options=${this.getOptions(control)}
            @nr-change=${(e: CustomEvent) => this.handleChange(control, e.detail.value)}
          ></nr-select>
        `;
      case 'number':
        return html`
          <nr-input
            size="small"
            type="number"
            .value=${value ?? ''}
            placeholder=${prop.placeholder || ''}
            style=${control.width ? `width: ${control.width}` : 'width: 70px'}
            @nr-input=${(e: CustomEvent) => this.handleChange(control, e.detail.value)}
          ></nr-input>
        `;
      case 'color':
        return html`
          <nr-color-picker
            .value=${value ?? '#000000'}
            @nr-change=${(e: CustomEvent) => this.handleChange(control, e.detail.value)}
          ></nr-color-picker>
        `;
      case 'boolean':
        return html`
          <nr-checkbox
            .checked=${!!value}
            @nr-change=${(e: CustomEvent) => this.handleChange(control, e.detail.checked)}
          ></nr-checkbox>
        `;
      default:
        return nothing;
    }
  }

  protected render() {
    if (!this.component || !this.componentRef?.value) return nothing;

    const controls = getTopbarControls(this.component.type);
    if (!controls?.length) return nothing;

    return html`
      <div
        class="content-topbar"
        style="top: ${this.tracker.position.top}px; left: ${this.tracker.position.left}px;"
      >
        ${controls.map((control, i) => html`
          ${i > 0 ? html`<div class="divider"></div>` : nothing}
          ${this.renderControl(control)}
        `)}
      </div>
    `;
  }
}
