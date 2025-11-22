import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "@shared/ui/components/base/BaseElement";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { handleComponentEvent } from "@shared/ui/components/base/BaseElement/execute-event.helpers.ts";
import "@nuralyui/label";

@customElement("box-model-display")
export class BoxModelDisplay extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
      }

      .box-model-container {
        background-color: var(--box-model-margin-bg, #fffef0);
        border: 2px dashed #b4d455;
        border-radius: 0;
        padding: 30px;
        position: relative;
        width: fit-content;
        margin: 10px auto;
        max-width: 600px;
      }

      .margin-label {
        position: absolute;
        top: 10px;
        left: 10px;
        color: #000;
        font-size: 13px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .margin-values {
        position: absolute;
        background: #5a5a5a;
        color: white;
        border-radius: 12px;
        width: 32px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 500;
      }

      .editable-value {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        color: white;
        text-align: center;
        font-size: 11px;
        outline: none;
        cursor: text;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: text;
        -webkit-user-select: text;
        transition: background 0.15s ease;
        font-weight: 500;
      }

      .editable-value:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .editable-value:focus {
        background: rgba(255, 255, 255, 0.25);
        cursor: text;
      }

      .editable-value:empty::before {
        content: '0';
        color: rgba(255, 255, 255, 0.7);
      }

      .margin-top {
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .margin-right {
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .margin-bottom {
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .margin-left {
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .border-container {
        background-color: var(--box-model-border-bg, #5a5a5a);
        border-radius: 0;
        padding: 28px;
        position: relative;
      }

      .border-label {
        position: absolute;
        top: 8px;
        left: 10px;
        color: white;
        font-size: 13px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .border-values {
        position: absolute;
        background: #444;
        color: white;
        border-radius: 12px;
        width: 32px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 500;
      }

      .border-top {
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .border-right {
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .border-bottom {
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .border-left {
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .padding-container {
        background-color: var(--box-model-padding-bg, #c8b7f6);
        border-radius: 0;
        padding: 28px;
        position: relative;
      }

      .padding-label {
        position: absolute;
        top: 8px;
        left: 10px;
        color: #000;
        font-size: 13px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .padding-values {
        position: absolute;
        background: #5a5a5a;
        color: white;
        border-radius: 12px;
        width: 32px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 500;
      }

      .padding-top {
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .padding-right {
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .padding-bottom {
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .padding-left {
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .content-box {
        background-color: var(--box-model-content-bg, #93d7e8);
        border: 2px dashed #5eb8cf;
        border-radius: 0;
        padding: 25px 50px;
        text-align: center;
        color: #000;
        font-size: 16px;
        font-weight: 700;
        min-width: 150px;
      }

      .dimensions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
      }

      .dimension-separator {
        font-weight: 700;
        color: #000;
      }
    `,
  ];

  @property()
  component: ComponentElement;

  @state()
  boxModel = {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    width: 0,
    height: 0,
  };

  constructor() {
    super();
    this.registerCallback("value", (value) => {
      if (value) {
        this.boxModel = {
          margin: value.margin || { top: 0, right: 0, bottom: 0, left: 0 },
          border: value.border || { top: 0, right: 0, bottom: 0, left: 0 },
          padding: value.padding || { top: 0, right: 0, bottom: 0, left: 0 },
          width: value.width || 0,
          height: value.height || 0,
        };
        this.requestUpdate();
      }
    });
  }

  private parseValue(value: string | undefined): number {
    if (!value) return 0;
    const numeric = parseFloat(value);
    return isNaN(numeric) ? 0 : Math.round(numeric);
  }

  private handleValueChange(property: string, event: Event) {
    const div = event.target as HTMLDivElement;
    const value = div.textContent?.trim() || "0";

    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    if (value !== numericValue) {
      div.textContent = numericValue;
      // Move cursor to end
      this.moveCursorToEnd(div);
    }

    // Trigger the onChange event handler
    handleComponentEvent({
      isViewMode: true,
      component: this.component,
      item: this.item,
      eventName: "onChange",
      event: event,
      data: {
        property,
        value: numericValue ? `${numericValue}px` : "0px",
      },
    });
  }

  private handleKeyDown(property: string, event: KeyboardEvent) {
    const div = event.target as HTMLDivElement;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const currentValue = parseFloat(div.textContent || "0") || 0;
      const step = event.shiftKey ? 10 : 1;
      const newValue = event.key === "ArrowUp" ? currentValue + step : currentValue - step;
      const finalValue = Math.max(0, newValue);

      div.textContent = finalValue.toString();
      this.moveCursorToEnd(div);

      // Trigger update
      handleComponentEvent({
        isViewMode: true,
        component: this.component,
        item: this.item,
        eventName: "onChange",
        event: event,
        data: {
          property,
          value: `${finalValue}px`,
        },
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      div.blur();
    }
  }

  private handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    const numericValue = text.replace(/[^0-9]/g, '');

    if (numericValue) {
      document.execCommand('insertText', false, numericValue);
    }
  }

  private moveCursorToEnd(element: HTMLElement) {
    const range = document.createRange();
    const selection = window.getSelection();

    if (element.childNodes.length > 0) {
      range.setStart(element.childNodes[0], element.textContent?.length || 0);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  private handleBlur(property: string, event: FocusEvent) {
    const div = event.target as HTMLDivElement;
    const value = div.textContent?.trim() || "0";

    // Ensure we have a valid number
    const numericValue = value.replace(/[^0-9]/g, '') || "0";

    if (div.textContent !== numericValue) {
      div.textContent = numericValue;
    }
  }

  private createEditableValue(value: number, property: string) {
    return html`<div
      class="editable-value"
      contenteditable="true"
      spellcheck="false"
      @input=${(e: Event) => this.handleValueChange(property, e)}
      @keydown=${(e: KeyboardEvent) => this.handleKeyDown(property, e)}
      @paste=${(e: ClipboardEvent) => this.handlePaste(e)}
      @blur=${(e: FocusEvent) => this.handleBlur(property, e)}
    >${value}</div>`;
  }

  override renderComponent() {
    const handlers = this.inputHandlersValue?.value;

    if (!handlers) {
      return html`
        <div style="padding: 20px; text-align: center; color: #666;">
          Select a component to view its box model
        </div>
      `;
    }

    const margin = {
      top: this.parseValue(handlers?.["margin-top"]?.value) || 0,
      right: this.parseValue(handlers?.["margin-right"]?.value) || 0,
      bottom: this.parseValue(handlers?.["margin-bottom"]?.value) || 0,
      left: this.parseValue(handlers?.["margin-left"]?.value) || 0,
    };

    const padding = {
      top: this.parseValue(handlers?.["padding-top"]?.value) || 0,
      right: this.parseValue(handlers?.["padding-right"]?.value) || 0,
      bottom: this.parseValue(handlers?.["padding-bottom"]?.value) || 0,
      left: this.parseValue(handlers?.["padding-left"]?.value) || 0,
    };

    // Parse border from border style (e.g., "1px solid #000")
    const borderValue = handlers?.["border"]?.value || "0";
    const borderWidth = this.parseValue(
      typeof borderValue === "string" ? borderValue.split(" ")[0] : "0"
    );

    const border = {
      top: borderWidth,
      right: borderWidth,
      bottom: borderWidth,
      left: borderWidth,
    };

    // Get width and height from component
    const width = this.parseValue(handlers?.["width"]?.value) || 0;
    const height = this.parseValue(handlers?.["height"]?.value) || 0;

    return html`
      <div class="box-model-container">
        <div class="margin-label">margin</div>
        <div class="margin-values margin-top">${this.createEditableValue(margin.top, "margin-top")}</div>
        <div class="margin-values margin-right">${this.createEditableValue(margin.right, "margin-right")}</div>
        <div class="margin-values margin-bottom">${this.createEditableValue(margin.bottom, "margin-bottom")}</div>
        <div class="margin-values margin-left">${this.createEditableValue(margin.left, "margin-left")}</div>

        <div class="border-container">
          <div class="border-label">border</div>
          <div class="border-values border-top">${this.createEditableValue(border.top, "border")}</div>
          <div class="border-values border-right">${this.createEditableValue(border.right, "border")}</div>
          <div class="border-values border-bottom">${this.createEditableValue(border.bottom, "border")}</div>
          <div class="border-values border-left">${this.createEditableValue(border.left, "border")}</div>

          <div class="padding-container">
            <div class="padding-label">padding</div>
            <div class="padding-values padding-top">${this.createEditableValue(padding.top, "padding-top")}</div>
            <div class="padding-values padding-right">${this.createEditableValue(padding.right, "padding-right")}</div>
            <div class="padding-values padding-bottom">${this.createEditableValue(padding.bottom, "padding-bottom")}</div>
            <div class="padding-values padding-left">${this.createEditableValue(padding.left, "padding-left")}</div>

            <div class="content-box">
              <div class="dimensions">
                <span>${width || "auto"}</span>
                <span class="dimension-separator">×</span>
                <span>${height || "auto"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
