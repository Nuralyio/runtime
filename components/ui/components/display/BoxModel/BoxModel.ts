import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("box-model-display")
export class BoxModelDisplay extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
      }

      .box-model-container {
        background-color: var(--box-model-margin-bg, #f6f6d8);
        border: 2px dashed #9acd32;
        border-radius: 4px;
        padding: 20px;
        position: relative;
        width: fit-content;
        margin: 10px auto;
        max-width: 500px;
      }

      .margin-label {
        position: absolute;
        top: 8px;
        left: 8px;
        color: #666;
        font-size: 11px;
        font-weight: 500;
      }

      /* Shared styles for all box model value badges */
      .margin-values,
      .border-values,
      .padding-values {
        position: absolute;
        background: #666;
        color: white;
        border-radius: 10px;
        width: 30px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
      }

      /* Override background for border values */
      .border-values {
        background: #444;
      }

      .editable-value {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        color: white;
        text-align: center;
        font-size: 9px;
        outline: none;
        cursor: text;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: text;
        -webkit-user-select: text;
        transition: background 0.15s ease;
      }

      .editable-value:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .editable-value:focus {
        background: rgba(255, 255, 255, 0.2);
        cursor: text;
      }

      .editable-value:empty::before {
        content: '0';
        color: rgba(255, 255, 255, 0.6);
      }

      .margin-top,
      .border-top,
      .padding-top {
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .margin-right,
      .border-right,
      .padding-right {
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .margin-bottom,
      .border-bottom,
      .padding-bottom {
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .margin-left,
      .border-left,
      .padding-left {
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
      }

      .border-container {
        background-color: var(--box-model-border-bg, #656565);
        border-radius: 3px;
        padding: 18px;
        position: relative;
      }

      .border-label {
        position: absolute;
        top: 5px;
        left: 8px;
        color: white;
        font-size: 11px;
        font-weight: 500;
      }

      .padding-container {
        background-color: var(--box-model-padding-bg, #b8b8d1);
        border-radius: 3px;
        padding: 18px;
        position: relative;
      }

      .padding-label {
        position: absolute;
        top: 5px;
        left: 8px;
        color: #333;
        font-size: 11px;
        font-weight: 500;
      }

      .content-box {
        background-color: var(--box-model-content-bg, #8ac4d0);
        border: 2px dashed #4a9db0;
        border-radius: 3px;
        padding: 15px 30px;
        text-align: center;
        color: #333;
        font-size: 14px;
        font-weight: 600;
        min-width: 120px;
      }

      .dimensions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .dimension-separator {
        font-weight: normal;
        color: #666;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

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
    this.executeEvent("onChange", event, {
      property,
      value: numericValue ? `${numericValue}px` : "0px",
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
      this.executeEvent("onChange", event, {
        property,
        value: `${finalValue}px`,
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
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(numericValue);
        range.insertNode(textNode);
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
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

    // Handler returns objects with {value: number, unit: string} structure
    const margin = {
      top: handlers?.["margin-top"]?.value || 0,
      right: handlers?.["margin-right"]?.value || 0,
      bottom: handlers?.["margin-bottom"]?.value || 0,
      left: handlers?.["margin-left"]?.value || 0,
    };

    const padding = {
      top: handlers?.["padding-top"]?.value || 0,
      right: handlers?.["padding-right"]?.value || 0,
      bottom: handlers?.["padding-bottom"]?.value || 0,
      left: handlers?.["padding-left"]?.value || 0,
    };

    // Border handler also returns {value: number, unit: string}
    const borderWidth = handlers?.["border"]?.value || 0;

    const border = {
      top: borderWidth,
      right: borderWidth,
      bottom: borderWidth,
      left: borderWidth,
    };

    // Get width and height from handler (already numeric values)
    const width = handlers?.["width"]?.value || 0;
    const height = handlers?.["height"]?.value || 0;

    return html`
      <div class="box-model-container">
        <div class="margin-label">margin</div>
        <div class="margin-values margin-top">${this.createEditableValue(margin.top, "margin-top")}</div>
        <div class="margin-values margin-right">${this.createEditableValue(margin.right, "margin-right")}</div>
        <div class="margin-values margin-bottom">${this.createEditableValue(margin.bottom, "margin-bottom")}</div>
        <div class="margin-values margin-left">${this.createEditableValue(margin.left, "margin-left")}</div>

        <div class="border-container">
          <div class="border-label">border</div>
          <div class="border-values border-top">${this.createEditableValue(border.top, "border-top")}</div>
          <div class="border-values border-right">${this.createEditableValue(border.right, "border-right")}</div>
          <div class="border-values border-bottom">${this.createEditableValue(border.bottom, "border-bottom")}</div>
          <div class="border-values border-left">${this.createEditableValue(border.left, "border-left")}</div>

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
