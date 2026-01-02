import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { formStyles } from "./Form.style.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { renderComponent } from '../../../../../utils/render-util.ts';

// Safely import @nuralyui/forms
try {
  await import("@nuralyui/forms");
} catch (error) {
  console.warn('[@nuralyui/forms] Package not found or failed to load.');
}

// Import icon and label for placeholder
import "@nuralyui/icon";
import "@nuralyui/label";

/**
 * Form block component that wraps nr-form and handles field registration
 * across Shadow DOM boundaries using event-based communication.
 */
@customElement("form-block")
export class FormBlock extends BaseElementBlock {
  static styles = [formStyles];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  private _formElement: any = null;

  @state()
  private _registeredFields: Map<string, any> = new Map();

  @state()
  childrenComponents: ComponentElement[] = [];

  private _fieldRegisterHandler = this._handleFieldRegister.bind(this);
  private _fieldUnregisterHandler = this._handleFieldUnregister.bind(this);
  private _fieldValueChangeHandler = this._handleFieldValueChange.bind(this);

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.updateChildrenComponents();

    // Listen for field registration events from child input blocks
    this.addEventListener('nr-field-register', this._fieldRegisterHandler as EventListener);
    this.addEventListener('nr-field-unregister', this._fieldUnregisterHandler as EventListener);
    this.addEventListener('nr-field-value-change', this._fieldValueChangeHandler as EventListener);
  }

  override willUpdate(changedProperties: Map<string, any>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }
  }

  private updateChildrenComponents(): void {
    this.childrenComponents = this.component?.children_ids?.map((id) => {
      return $components.get()[this.component?.application_id]?.find((component) => component.uuid === id);
    }).filter(Boolean) ?? [];
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('nr-field-register', this._fieldRegisterHandler as EventListener);
    this.removeEventListener('nr-field-unregister', this._fieldUnregisterHandler as EventListener);
    this.removeEventListener('nr-field-value-change', this._fieldValueChangeHandler as EventListener);
    this._registeredFields.clear();
  }

  protected override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    // Get reference to the nr-form element
    this._formElement = this.renderRoot.querySelector("nr-form");

    // Register callbacks for input handlers
    this.registerCallback("disabled", (value) => {
      if (this._formElement) {
        this._formElement.disabled = value;
      }
    });
  }

  /**
   * Handle field registration from child input blocks
   */
  private _handleFieldRegister(event: CustomEvent) {
    event.stopPropagation();

    const { element, name, blockElement } = event.detail;

    if (!name || !element) {
      console.warn('[FormBlock] Field registration missing name or element');
      return;
    }

    // Store the registration
    this._registeredFields.set(name, { element, blockElement });

    // Register with nr-form's validation controller if available
    if (this._formElement?.validationController) {
      try {
        this._formElement.validationController.registerField(element);
      } catch (error) {
        console.warn('[FormBlock] Failed to register field with validation controller:', error);
      }
    }
  }

  /**
   * Handle field unregistration when child input blocks are removed
   */
  private _handleFieldUnregister(event: CustomEvent) {
    event.stopPropagation();

    const { name } = event.detail;

    if (name && this._registeredFields.has(name)) {
      // Unregister from nr-form's validation controller
      if (this._formElement?.validationController) {
        try {
          this._formElement.validationController.unregisterField(name);
        } catch (error) {
          console.warn('[FormBlock] Failed to unregister field:', error);
        }
      }
      this._registeredFields.delete(name);
    }
  }

  /**
   * Handle field value changes for form data collection
   */
  private _handleFieldValueChange(event: CustomEvent) {
    // Allow the event to propagate for potential parent handling
    const { name, value } = event.detail;

    if (name && this._registeredFields.has(name)) {
      const fieldInfo = this._registeredFields.get(name);
      fieldInfo.value = value;
    }
  }

  /**
   * Get all form field values
   */
  public getFieldsValue(): Record<string, any> {
    if (this._formElement?.getFieldsValue) {
      return this._formElement.getFieldsValue();
    }

    // Fallback: collect from registered fields
    const values: Record<string, any> = {};
    for (const [name, fieldInfo] of this._registeredFields) {
      values[name] = fieldInfo.element?.value ?? fieldInfo.value;
    }
    return values;
  }

  /**
   * Set form field values
   */
  public setFieldsValue(values: Record<string, any>): void {
    if (this._formElement?.setFieldsValue) {
      this._formElement.setFieldsValue(values);
    }
  }

  /**
   * Validate all form fields
   */
  public async validate(): Promise<boolean> {
    if (this._formElement?.validate) {
      return this._formElement.validate();
    }
    return true;
  }

  /**
   * Submit the form programmatically
   */
  public async submit(customData?: Record<string, any>): Promise<void> {
    if (this._formElement?.submit) {
      await this._formElement.submit(customData);
    }
  }

  /**
   * Reset the form
   */
  public reset(): void {
    if (this._formElement?.reset) {
      this._formElement.reset();
    }
  }

  /**
   * Get form state summary
   */
  public getFormState(): any {
    if (this._formElement?.getFormState) {
      return this._formElement.getFormState();
    }
    return {
      isValid: true,
      isSubmitting: false,
      hasErrors: false,
      errorCount: 0,
      fieldCount: this._registeredFields.size
    };
  }

  /**
   * Render placeholder when form is empty in editor mode
   */
  private renderPlaceholder() {
    return html`
      <div
        class="form-placeholder"
        @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
      >
        <nr-icon name="file-text"></nr-icon>
        <nr-label>Add form fields to this form</nr-label>
        <drag-wrapper
          .where=${"inside"}
          .message=${"Drop inside"}
          .component=${{ ...this.component }}
          .inputRef=${this.inputRef}
          .isDragInitiator=${this.isDragInitiator}
        >
        </drag-wrapper>
      </div>
    `;
  }

  /**
   * Render children components
   */
  private renderChildren() {
    return renderComponent(
      this.childrenComponents.map((component) => ({ ...component, item: this.item })),
      this.item,
      this.isViewMode,
      { ...this.component, uniqueUUID: this.uniqueUUID }
    );
  }

  override renderComponent() {
    const inputStyles = this.getStyles();
    const hasChildren = this.childrenComponents.length > 0;

    // In view mode, always render the form with children (or empty)
    if (this.isViewMode) {
      return html`
        <nr-form
          ${ref(this.inputRef)}
          class="${`drop-${this.component.uuid}`}"
          style=${Object.entries(inputStyles).map(([k, v]) => `${k}:${v}`).join(';')}
          .disabled=${this.resolvedInputs?.disabled || false}
          .validateOnChange=${this.resolvedInputs?.validateOnChange ?? false}
          .validateOnBlur=${this.resolvedInputs?.validateOnBlur ?? true}
          .preventInvalidSubmission=${this.resolvedInputs?.preventInvalidSubmission ?? true}
          .resetOnSuccess=${this.resolvedInputs?.resetOnSuccess ?? false}
          .action=${this.resolvedInputs?.action ?? nothing}
          .method=${this.resolvedInputs?.method ?? 'POST'}
          @nr-form-submit-success=${(e: CustomEvent) => {
            this.executeEvent('onSubmitSuccess', e, {
              formData: e.detail?.formData,
              values: this.getFieldsValue()
            });
          }}
          @nr-form-submit-error=${(e: CustomEvent) => {
            this.executeEvent('onSubmitError', e, {
              error: e.detail?.error
            });
          }}
          @nr-form-validation-changed=${(e: CustomEvent) => {
            this.executeEvent('onValidationChange', e, {
              validationResult: e.detail?.validationResult
            });
          }}
          @nr-form-field-changed=${(e: CustomEvent) => {
            this.executeEvent('onFieldChange', e, {
              field: e.detail?.field
            });
          }}
          @nr-form-reset=${(e: CustomEvent) => {
            this.executeEvent('onReset', e, {});
          }}
        >
          ${hasChildren ? this.renderChildren() : nothing}
        </nr-form>
      `;
    }

    // In editor mode, show placeholder if empty
    return html`
      <nr-form
        ${ref(this.inputRef)}
        class="${`drop-${this.component.uuid}`}"
        style=${Object.entries(inputStyles).map(([k, v]) => `${k}:${v}`).join(';')}
        .disabled=${this.resolvedInputs?.disabled || false}
        .validateOnChange=${this.resolvedInputs?.validateOnChange ?? false}
        .validateOnBlur=${this.resolvedInputs?.validateOnBlur ?? true}
        .preventInvalidSubmission=${this.resolvedInputs?.preventInvalidSubmission ?? true}
        .resetOnSuccess=${this.resolvedInputs?.resetOnSuccess ?? false}
        .action=${this.resolvedInputs?.action ?? nothing}
        .method=${this.resolvedInputs?.method ?? 'POST'}
        @nr-form-submit-success=${(e: CustomEvent) => {
          this.executeEvent('onSubmitSuccess', e, {
            formData: e.detail?.formData,
            values: this.getFieldsValue()
          });
        }}
        @nr-form-submit-error=${(e: CustomEvent) => {
          this.executeEvent('onSubmitError', e, {
            error: e.detail?.error
          });
        }}
        @nr-form-validation-changed=${(e: CustomEvent) => {
          this.executeEvent('onValidationChange', e, {
            validationResult: e.detail?.validationResult
          });
        }}
        @nr-form-field-changed=${(e: CustomEvent) => {
          this.executeEvent('onFieldChange', e, {
            field: e.detail?.field
          });
        }}
        @nr-form-reset=${(e: CustomEvent) => {
          this.executeEvent('onReset', e, {});
        }}
      >
        ${hasChildren ? this.renderChildren() : this.renderPlaceholder()}
      </nr-form>
    `;
  }
}
