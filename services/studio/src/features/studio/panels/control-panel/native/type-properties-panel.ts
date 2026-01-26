/**
 * Native Type-Specific Properties Panel
 *
 * Renders component-specific properties with handler support.
 * Each property can have a static value OR a handler (code).
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { updateComponentAttributes } from "../../../../runtime/redux/actions/component/updateComponentAttributes";
import type { ComponentElement } from "../../../../runtime/redux/store/component/component.interface";
import "../../../../runtime/components/ui/components/advanced/CodeEditor/CodeEditor";
import { $i18nEnabled, $supportedLocales } from "../../../../runtime/state/locale.store";
import { $currentApplication } from "../../../../runtime/redux/store";

interface PropertyConfig {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "color" | "textarea";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  inputProperty?: string;
  supportsHandler?: boolean;
  translatable?: boolean;
}

const COMPONENT_PROPERTIES: Record<string, PropertyConfig[]> = {
  text_label: [
    { name: "value", label: "Text", type: "text", inputProperty: "value", placeholder: "Enter text", supportsHandler: true, translatable: true },
    { name: "size", label: "Size", type: "select", inputProperty: "size", supportsHandler: true, options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "variant", label: "Variant", type: "select", inputProperty: "variant", supportsHandler: true, options: [
      { label: "Default", value: "default" },
      { label: "Secondary", value: "secondary" },
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" }
    ]},
    { name: "required", label: "Required", type: "boolean", inputProperty: "required", supportsHandler: true },
    { name: "for", label: "For (Input ID)", type: "text", inputProperty: "for", placeholder: "Enter input ID" }
  ],
  text_input: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", placeholder: "Default value", supportsHandler: true, translatable: true },
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true, translatable: true },
    { name: "size", label: "Size", type: "select", inputProperty: "size", supportsHandler: true, options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "type", label: "Type", type: "select", inputProperty: "type", options: [
      { label: "Text", value: "text" },
      { label: "Password", value: "password" },
      { label: "Email", value: "email" },
      { label: "Number", value: "number" }
    ]},
    { name: "required", label: "Required", type: "boolean", inputProperty: "required", supportsHandler: true },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  button_input: [
    { name: "label", label: "Label", type: "text", inputProperty: "label", placeholder: "Button text", supportsHandler: true, translatable: true },
    { name: "variant", label: "Variant", type: "select", inputProperty: "variant", supportsHandler: true, options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Ghost", value: "ghost" },
      { label: "Danger", value: "danger" }
    ]},
    { name: "size", label: "Size", type: "select", inputProperty: "size", options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  container: [
    { name: "direction", label: "Direction", type: "select", inputProperty: "direction", options: [
      { label: "Row", value: "row" },
      { label: "Column", value: "column" }
    ]},
    { name: "gap", label: "Gap", type: "text", inputProperty: "gap", placeholder: "e.g., 8px" },
    { name: "padding", label: "Padding", type: "text", inputProperty: "padding", placeholder: "e.g., 16px" }
  ],
  image: [
    { name: "src", label: "Source URL", type: "text", inputProperty: "src", placeholder: "https://...", supportsHandler: true },
    { name: "alt", label: "Alt Text", type: "text", inputProperty: "alt", placeholder: "Image description", supportsHandler: true },
    { name: "objectFit", label: "Object Fit", type: "select", inputProperty: "objectFit", options: [
      { label: "Contain", value: "contain" },
      { label: "Cover", value: "cover" },
      { label: "Fill", value: "fill" },
      { label: "None", value: "none" }
    ]}
  ],
  checkbox: [
    { name: "label", label: "Label", type: "text", inputProperty: "label", supportsHandler: true },
    { name: "checked", label: "Checked", type: "boolean", inputProperty: "checked", supportsHandler: true },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  select: [
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "options", label: "Options", type: "text", inputProperty: "options", placeholder: "JSON array", supportsHandler: true },
    { name: "size", label: "Size", type: "select", inputProperty: "size", options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "searchable", label: "Searchable", type: "boolean", inputProperty: "searchable" },
    { name: "multiple", label: "Multiple", type: "boolean", inputProperty: "multiple" },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  icon: [
    { name: "name", label: "Icon Name", type: "text", inputProperty: "name", placeholder: "e.g., home", supportsHandler: true },
    { name: "size", label: "Size", type: "text", inputProperty: "size", placeholder: "e.g., 24px" },
    { name: "color", label: "Color", type: "color", inputProperty: "color", supportsHandler: true }
  ],
  textarea: [
    { name: "value", label: "Value", type: "textarea", inputProperty: "value", supportsHandler: true },
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "rows", label: "Rows", type: "number", inputProperty: "rows", placeholder: "4" },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  date_picker: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", supportsHandler: true },
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "format", label: "Format", type: "text", inputProperty: "format", placeholder: "YYYY-MM-DD" },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  slider: [
    { name: "value", label: "Value", type: "number", inputProperty: "value", supportsHandler: true },
    { name: "min", label: "Min", type: "number", inputProperty: "min", placeholder: "0" },
    { name: "max", label: "Max", type: "number", inputProperty: "max", placeholder: "100" },
    { name: "step", label: "Step", type: "number", inputProperty: "step", placeholder: "1" }
  ],
  badge: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", supportsHandler: true },
    { name: "variant", label: "Variant", type: "select", inputProperty: "variant", options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" }
    ]}
  ],
  tag: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", supportsHandler: true },
    { name: "closable", label: "Closable", type: "boolean", inputProperty: "closable" }
  ]
};

@customElement("type-properties-panel")
export class TypePropertiesPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    nr-row {
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .handler-editor {
      margin: 4px 12px 12px;
      border-radius: 4px;
      overflow: hidden;
    }

    .handler-editor code-editor {
      --editor-height: 120px;
      display: block;
    }

    .translation-editor {
      margin: 4px 12px 12px;
      padding: 8px;
      background: var(--nuraly-color-bg-secondary, #f5f5f5);
      border-radius: 4px;
    }

    .translation-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .translation-row:last-child {
      margin-bottom: 0;
    }

    .locale-label {
      min-width: 40px;
      font-size: 12px;
      font-weight: 500;
    }
  `;

  @property({ attribute: false })
  component: ComponentElement | null = null;

  @state()
  private expandedHandlers: Map<string, string> = new Map(); // prop name -> initial code

  @state()
  private expandedTranslations: Set<string> = new Set(); // prop names with open translation panel

  @state()
  private i18nEnabled: boolean = false;

  @state()
  private supportedLocales: string[] = [];

  private unsubscribeI18n?: () => void;
  private unsubscribeLocales?: () => void;
  private unsubscribeApp?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.i18nEnabled = $i18nEnabled.get();
    this.supportedLocales = $supportedLocales.get();

    this.unsubscribeI18n = $i18nEnabled.subscribe((enabled) => {
      this.i18nEnabled = enabled;
      this.requestUpdate();
    });

    this.unsubscribeLocales = $supportedLocales.subscribe((locales) => {
      this.supportedLocales = locales;
      this.requestUpdate();
    });

    // Also subscribe to app changes to catch i18n config updates
    this.unsubscribeApp = $currentApplication.subscribe((app) => {
      // Re-read from locale stores when app changes
      this.i18nEnabled = $i18nEnabled.get();
      this.supportedLocales = $supportedLocales.get();
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeI18n?.();
    this.unsubscribeLocales?.();
    this.unsubscribeApp?.();
  }

  protected override firstUpdated(): void {
    // Re-read store values after first render to catch any that were set after connectedCallback
    this.i18nEnabled = $i18nEnabled.get();
    this.supportedLocales = $supportedLocales.get();
  }

  private getInputValue(prop: PropertyConfig): { value: any; isHandler: boolean; handlerCode: string } {
    if (!this.component?.input || !prop.inputProperty) {
      return { value: undefined, isHandler: false, handlerCode: "" };
    }

    const inputValue = this.component.input[prop.inputProperty];
    if (inputValue === undefined || inputValue === null) {
      return { value: undefined, isHandler: false, handlerCode: "" };
    }

    if (typeof inputValue === "object" && "type" in inputValue) {
      if (inputValue.type === "handler") {
        return { value: undefined, isHandler: true, handlerCode: inputValue.value || "" };
      }
      return { value: inputValue.value, isHandler: false, handlerCode: "" };
    }

    return { value: inputValue, isHandler: false, handlerCode: "" };
  }

  private handlePropertyChange(prop: PropertyConfig, value: any) {
    if (!this.component || !prop.inputProperty) return;

    const wrappedValue = {
      type: prop.type === "boolean" ? "boolean" : prop.type === "number" ? "number" : "string",
      value: value
    };

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "input",
      { [prop.inputProperty]: wrappedValue },
      true
    );
  }

  private handleHandlerChange(prop: PropertyConfig, code: string) {
    if (!this.component || !prop.inputProperty) return;

    const wrappedValue = {
      type: "handler",
      value: code
    };

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "input",
      { [prop.inputProperty]: wrappedValue },
      true
    );
  }

  private valueToCode(value: any, propType: string): string {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    if (propType === "boolean") {
      return String(value);
    }
    if (propType === "number") {
      return String(value);
    }
    // For strings, return as-is (user can add quotes if needed)
    return String(value);
  }

  private codeToValue(code: string, propType: string): any {
    const trimmed = code.trim();
    if (!trimmed) return "";

    // Try to parse as JSON first
    try {
      return JSON.parse(trimmed);
    } catch {
      // If not valid JSON, return as string
      return trimmed;
    }
  }

  private getTranslation(prop: PropertyConfig, locale: string): string {
    if (!this.component?.translations || !prop.inputProperty) return "";
    return this.component.translations[prop.inputProperty]?.[locale] ?? "";
  }

  private handleTranslationChange(prop: PropertyConfig, locale: string, value: string) {
    if (!this.component || !prop.inputProperty) return;

    // Build new translations object
    const currentTranslations = this.component.translations || {};
    const propTranslations = currentTranslations[prop.inputProperty] || {};
    const newPropTranslations = { ...propTranslations, [locale]: value };
    const newTranslations = { ...currentTranslations, [prop.inputProperty]: newPropTranslations };

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "translations",
      newTranslations,
      true
    );
  }

  private canShowTranslations(): boolean {
    return this.i18nEnabled && this.supportedLocales.length > 1;
  }

  private getLocaleFlag(locale: string): string {
    const flags: Record<string, string> = {
      en: "🇺🇸", fr: "🇫🇷", ar: "🇸🇦", es: "🇪🇸", de: "🇩🇪",
      it: "🇮🇹", pt: "🇵🇹", zh: "🇨🇳", ja: "🇯🇵", ko: "🇰🇷"
    };
    return flags[locale] || "🌐";
  }

  private renderTranslationsEditor(prop: PropertyConfig) {
    // Get non-default locales (skip the first one which is the default)
    const otherLocales = this.supportedLocales.slice(1);

    if (otherLocales.length === 0) {
      return nothing;
    }

    return html`
      <div class="translation-editor">
        ${otherLocales.map(locale => html`
          <div class="translation-row">
            <span class="locale-label">${this.getLocaleFlag(locale)} ${locale.toUpperCase()}</span>
            <nr-input
              size="small"
              style="flex: 1"
              .value=${this.getTranslation(prop, locale)}
              placeholder=${`${prop.label} in ${locale}`}
              @nr-input=${(e: CustomEvent) => this.handleTranslationChange(prop, locale, e.detail.value)}
            ></nr-input>
          </div>
        `)}
      </div>
    `;
  }

  private renderProperty(prop: PropertyConfig) {
    const { value, isHandler, handlerCode } = this.getInputValue(prop);
    const isExpanded = this.expandedHandlers.has(prop.name);
    const showHandlerEditor = isHandler || isExpanded;
    const supportsHandler = prop.supportsHandler === true;
    const isTranslatable = prop.translatable === true && this.canShowTranslations();
    const showTranslationsEditor = this.expandedTranslations.has(prop.name);

    // Get the code to show in editor - either from handler or from expanded state
    const editorCode = isHandler ? handlerCode : (this.expandedHandlers.get(prop.name) || "");

    // Translation toggle button (globe icon)
    const translationButton = isTranslatable ? html`
      <nr-col flex="none">
        <nr-button
          size="small"
          variant=${showTranslationsEditor ? "primary" : "ghost"}
          title=${showTranslationsEditor ? "Hide translations" : "Edit translations"}
          @click=${() => {
            if (showTranslationsEditor) {
              this.expandedTranslations.delete(prop.name);
            } else {
              this.expandedTranslations.add(prop.name);
            }
            this.requestUpdate();
          }}
        ><nr-icon name="globe" size="small"></nr-icon></nr-button>
      </nr-col>
    ` : nothing;

    const handlerButton = supportsHandler ? html`
      <nr-col flex="none">
        <nr-button
          size="small"
          variant=${showHandlerEditor ? "primary" : "ghost"}
          title=${showHandlerEditor ? "Click to use static value" : "Click to use handler (code)"}
          @click=${() => {
            if (isHandler) {
              // Convert handler back to static value
              const newValue = this.codeToValue(handlerCode, prop.type);
              this.handlePropertyChange(prop, newValue);
              this.expandedHandlers.delete(prop.name);
              this.requestUpdate();
            } else if (isExpanded) {
              // Close the expanded editor without saving
              this.expandedHandlers.delete(prop.name);
              this.requestUpdate();
            } else {
              // Open the handler editor - convert current value to code
              const initialCode = this.valueToCode(value, prop.type);
              this.expandedHandlers.set(prop.name, initialCode);
              this.requestUpdate();
            }
          }}
        >&lt;/&gt;</nr-button>
      </nr-col>
    ` : nothing;

    if (showHandlerEditor) {
      return html`
        <nr-row gutter="8">
          <nr-col span="8"><nr-label size="small">${prop.label}</nr-label></nr-col>
          <nr-col flex="auto"><nr-label size="small" variant="secondary">Using handler</nr-label></nr-col>
          <nr-col flex="none">
            <nr-button
              size="small"
              variant="ghost"
              title="Remove handler and use static value"
              @click=${() => {
                // Convert handler code back to static value
                const codeToConvert = isHandler ? handlerCode : (this.expandedHandlers.get(prop.name) || "");
                const newValue = this.codeToValue(codeToConvert, prop.type);
                this.handlePropertyChange(prop, newValue);
                this.expandedHandlers.delete(prop.name);
                this.requestUpdate();
              }}
            ><nr-icon name="delete" size="small"></nr-icon></nr-button>
          </nr-col>
        </nr-row>
        <div class="handler-editor">
          <code-editor
            language="javascript"
            .code=${editorCode}
            @change=${(e: CustomEvent) => {
              const code = e.detail.value;
              this.expandedHandlers.set(prop.name, code);
              this.handleHandlerChange(prop, code);
            }}
          ></code-editor>
          <nr-label size="small" variant="secondary">Available: Vars, Props, Component, Database</nr-label>
        </div>
      `;
    }

    switch (prop.type) {
      case "text":
      case "number":
        return html`
          <nr-row gutter="8">
            <nr-col span="8"><nr-label size="small">${prop.label}</nr-label></nr-col>
            <nr-col flex="auto">
              <nr-input
                size="small"
                type=${prop.type}
                .value=${value ?? ""}
                placeholder=${prop.placeholder ?? ""}
                @nr-input=${(e: CustomEvent) => this.handlePropertyChange(prop, e.detail.value)}
              ></nr-input>
            </nr-col>
            ${translationButton}
            ${handlerButton}
          </nr-row>
          ${showTranslationsEditor ? this.renderTranslationsEditor(prop) : nothing}
        `;

      case "textarea":
        return html`
          <nr-row gutter="8">
            <nr-col span="8"><nr-label size="small">${prop.label}</nr-label></nr-col>
            <nr-col flex="auto">
              <nr-textarea
                size="small"
                .value=${value ?? ""}
                placeholder=${prop.placeholder ?? ""}
                @nr-input=${(e: CustomEvent) => this.handlePropertyChange(prop, e.detail.value)}
              ></nr-textarea>
            </nr-col>
            ${translationButton}
            ${handlerButton}
          </nr-row>
          ${showTranslationsEditor ? this.renderTranslationsEditor(prop) : nothing}
        `;

      case "select":
        return html`
          <nr-row gutter="8">
            <nr-col span="8"><nr-label size="small">${prop.label}</nr-label></nr-col>
            <nr-col flex="auto">
              <nr-select
                size="small"
                .value=${value ?? ""}
                .options=${prop.options ?? []}
                @nr-change=${(e: CustomEvent) => this.handlePropertyChange(prop, e.detail.value)}
              ></nr-select>
            </nr-col>
            ${handlerButton}
          </nr-row>
        `;

      case "boolean":
        return html`
          <nr-row gutter="8">
            <nr-col span="8"><nr-label size="small">${prop.label}</nr-label></nr-col>
            <nr-col flex="auto">
              <nr-checkbox
                ?checked=${value === true}
                @nr-change=${(e: CustomEvent) => this.handlePropertyChange(prop, e.detail.checked)}
              ></nr-checkbox>
            </nr-col>
            ${handlerButton}
          </nr-row>
        `;

      case "color":
        return html`
          <nr-row gutter="8">
            <nr-col span="8"><nr-label size="small">${prop.label}</nr-label></nr-col>
            <nr-col flex="auto">
              <nr-color-picker
                .value=${value ?? "#000000"}
                @nr-change=${(e: CustomEvent) => this.handlePropertyChange(prop, e.detail.value)}
              ></nr-color-picker>
            </nr-col>
            ${handlerButton}
          </nr-row>
        `;

      default:
        return nothing;
    }
  }

  private formatTypeName(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  override render() {
    if (!this.component) {
      return html`<nr-row justify="center"><nr-col><nr-label size="small" variant="secondary">No component selected</nr-label></nr-col></nr-row>`;
    }

    const properties = COMPONENT_PROPERTIES[this.component.type] || [];

    if (properties.length === 0) {
      return html`<nr-row justify="center"><nr-col><nr-label size="small" variant="secondary">No specific properties for ${this.formatTypeName(this.component.type)}</nr-label></nr-col></nr-row>`;
    }

    return html`
      <nr-row>
        <nr-col span="24">
          <nr-label size="small" variant="secondary">${this.formatTypeName(this.component.type)} Properties</nr-label>
        </nr-col>
      </nr-row>
      ${properties.map(prop => this.renderProperty(prop))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "type-properties-panel": TypePropertiesPanel;
  }
}
