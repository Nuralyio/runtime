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
        background-color: var(--box-model-margin-bg, #fef9e7);
        border: 1px dashed #d4ac0d;
        border-radius: 6px;
        padding:22px 34px 22px;
        position: relative;
        width: fit-content;
        margin: 8px auto;
      }

      .margin-label {
        position: absolute;
        top: 5px;
        left: 8px;
        color: #9a7b0a;
        font-size: 9px;
        font-weight: 600;
        text-transform: lowercase;
        z-index: 1;
      }

      /* Shared styles for all box model value badges */
      .margin-values,
      .padding-values {
        position: absolute;
        background: #5d6d7e;
        color: white;
        border-radius: 8px;
        min-width: 24px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        padding: 0 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
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
        background: rgba(255, 255, 255, 0.15);
      }

      .editable-value:focus {
        background: rgba(255, 255, 255, 0.25);
        cursor: text;
      }

      .editable-value:empty::before {
        content: '0';
        color: rgba(255, 255, 255, 0.6);
      }

      .margin-top {
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .margin-right {
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
      }

      .margin-bottom {
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .margin-left {
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
      }

      .padding-top {
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .padding-right {
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
      }

      .padding-bottom {
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .padding-left {
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
      }

      .padding-container {
        background-color: var(--box-model-padding-bg, #d5dbdb);
        border-radius: 4px;
        padding: 22px 16px 16px 16px;
        position: relative;
      }

      .padding-label {
        position: absolute;
        top: 5px;
        left: 8px;
        color: #5d6d7e;
        font-size: 9px;
        font-weight: 600;
        text-transform: lowercase;
        z-index: 1;
      }

      .content-box {
        background-color: var(--box-model-content-bg, #aed6f1);
        border: 1px dashed #5dade2;
        border-radius: 4px;
        padding: 10px 20px;
        text-align: center;
        color: #2471a3;
        font-size: 12px;
        font-weight: 600;
        min-width: 100px;
      }

      .dimensions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .dimension-separator {
        font-weight: normal;
        color: #5dade2;
        font-size: 11px;
      }

      .dimension-value {
        background: transparent;
        border: none;
        color: #2471a3;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        outline: none;
        cursor: text;
        min-width: 35px;
        padding: 2px 4px;
        border-radius: 3px;
        transition: background 0.15s ease;
      }

      .dimension-value:hover {
        background: rgba(46, 134, 193, 0.1);
      }

      .dimension-value:focus {
        background: rgba(46, 134, 193, 0.2);
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

  private handleDimensionPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';

    // Allow pasting values with units (e.g., "100px", "50%", "auto")
    const match = text.match(/^(\d*\.?\d+)(px|%|em|rem|vw|vh)?$/i);
    const isAuto = text.toLowerCase() === "auto";
    const pasteValue = isAuto ? "auto" : (match ? text : text.replace(/[^0-9.]/g, ''));

    if (pasteValue) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(pasteValue);
        range.insertNode(textNode);
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

  private handleDimensionChange(property: string, event: Event) {
    const div = event.target as HTMLDivElement;
    const value = div.textContent?.trim() || "";

    // Allow "auto" or numbers with units (px, %, em, rem, vw, vh)
    const isAuto = value.toLowerCase() === "auto";
    const validUnits = ['px', '%', 'em', 'rem', 'vw', 'vh'];

    // Match number (with optional decimals) followed by optional unit
    const match = value.match(/^(\d*\.?\d+)(px|%|em|rem|vw|vh)?$/i);

    // Allow partial typing of "auto"
    const isPartialAuto = ['a', 'au', 'aut'].includes(value.toLowerCase());

    if (isAuto || isPartialAuto || match) {
      // Valid input, don't modify
    } else if (value !== '') {
      // Invalid input - extract just the number part
      const numericPart = value.replace(/[^0-9.]/g, '');
      if (numericPart) {
        div.textContent = numericPart;
        this.moveCursorToEnd(div);
      }
    }

    // Trigger the onChange event handler
    let finalValue = "auto";
    if (isAuto) {
      finalValue = "auto";
    } else if (match) {
      const num = match[1];
      const unit = match[2] || 'px';
      finalValue = `${num}${unit}`;
    }

    this.executeEvent("onChange", event, {
      property,
      value: finalValue,
    });
  }

  private handleDimensionKeyDown(property: string, event: KeyboardEvent) {
    const div = event.target as HTMLDivElement;
    const currentText = div.textContent?.trim() || "";

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();

      // Extract number and unit from current value
      const match = currentText.match(/^(\d*\.?\d+)(px|%|em|rem|vw|vh)?$/i);
      const currentValue = match ? parseFloat(match[1]) : 0;
      const unit = match?.[2] || 'px';

      const step = event.shiftKey ? 10 : 1;
      const newValue = event.key === "ArrowUp" ? currentValue + step : currentValue - step;
      const finalValue = Math.max(0, newValue);

      div.textContent = `${finalValue}${unit}`;
      this.moveCursorToEnd(div);

      this.executeEvent("onChange", event, {
        property,
        value: `${finalValue}${unit}`,
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      div.blur();
    }
  }

  private handleDimensionBlur(property: string, event: FocusEvent) {
    const div = event.target as HTMLDivElement;
    const value = div.textContent?.trim() || "";

    // Allow "auto" or number with unit
    if (value.toLowerCase() === "auto") {
      div.textContent = "auto";
    } else {
      const match = value.match(/^(\d*\.?\d+)(px|%|em|rem|vw|vh)?$/i);
      if (match) {
        const num = match[1];
        const unit = match[2] || 'px';
        div.textContent = `${num}${unit}`;
      } else {
        const numericValue = value.replace(/[^0-9.]/g, '');
        div.textContent = numericValue ? `${numericValue}px` : "auto";
      }
    }
  }

  private createEditableDimension(value: number | string, property: string) {
    const displayValue = value || "auto";
    return html`<div
      class="dimension-value"
      contenteditable="true"
      spellcheck="false"
      @input=${(e: Event) => this.handleDimensionChange(property, e)}
      @keydown=${(e: KeyboardEvent) => this.handleDimensionKeyDown(property, e)}
      @paste=${(e: ClipboardEvent) => this.handleDimensionPaste(e)}
      @blur=${(e: FocusEvent) => this.handleDimensionBlur(property, e)}
    >${displayValue}</div>`;
  }

  override renderComponent() {
    const handlers = this.resolvedInputs?.value;

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

        <div class="padding-container">
          <div class="padding-label">padding</div>
          <div class="padding-values padding-top">${this.createEditableValue(padding.top, "padding-top")}</div>
          <div class="padding-values padding-right">${this.createEditableValue(padding.right, "padding-right")}</div>
          <div class="padding-values padding-bottom">${this.createEditableValue(padding.bottom, "padding-bottom")}</div>
          <div class="padding-values padding-left">${this.createEditableValue(padding.left, "padding-left")}</div>

          <div class="content-box">
            <div class="dimensions">
              ${this.createEditableDimension(width, "width")}
              <span class="dimension-separator">×</span>
              ${this.createEditableDimension(height, "height")}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
