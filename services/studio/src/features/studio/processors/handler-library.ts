/**
 * @fileoverview Handler Library - Reusable Handler Functions
 * @module Studio/Processors/HandlerLibrary
 * 
 * @description
 * Comprehensive library of reusable handler functions for Studio property inputs.
 * This library provides parameterized, type-safe handler code that can be referenced
 * by name in component configurations instead of writing inline handler code.
 * 
 * **Purpose:**
 * - Eliminate code duplication across component configurations
 * - Provide tested, reliable handler patterns
 * - Enable parameterization for flexibility
 * - Maintain consistency in handler behavior
 * - Simplify configuration files
 * 
 * **Handler Categories:**
 * 
 * 1. **ValueHandlers** - Retrieve values to display in inputs
 *    - Get component properties (name, input, style, etc.)
 *    - Format values for different input types
 *    - Handle special cases (radio buttons, selects, toggles)
 * 
 * 2. **StateHandlers** - Control input enabled/disabled state
 *    - Disable inputs when handlers are active
 *    - Conditional enable/disable logic
 *    - Dynamic state based on component properties
 * 
 * 3. **EventHandlers** - Handle user interactions
 *    - Update component properties
 *    - Add units to numeric values
 *    - Trigger component re-renders
 * 
 * **Usage Pattern:**
 * 
 * **Inline Handler (OLD - Discouraged):**
 * ```yaml
 * properties:
 *   - name: width
 *     valueHandler: |
 *       const selectedComponent = Utils.first(Vars.selectedComponents);
 *       return selectedComponent?.style?.width || 'auto';
 * ```
 * 
 * **Library Reference (NEW - Recommended):**
 * ```yaml
 * properties:
 *   - name: width
 *     valueHandler:
 *       ref: componentStyle
 *       params: [width, "auto"]
 * ```
 * 
 * **Architecture:**
 * ```
 * Configuration File
 *         │
 *         │ valueHandler: { ref: "componentStyle", params: ["width", "auto"] }
 *         ▼
 * Handler Resolver
 *         │
 *         │ Lookup in ValueHandlers
 *         ▼
 * Handler Function
 *         │
 *         │ Execute with params
 *         ▼
 * Generated Handler Code String
 *         │
 *         │ Compile at runtime
 *         ▼
 * Executable Function
 * ```
 * 
 * **Adding New Handlers:**
 * 
 * 1. Identify common pattern in configurations
 * 2. Extract to parameterized function
 * 3. Add to appropriate category (Value/State/Event)
 * 4. Document parameters and return type
 * 5. Update configurations to use reference
 * 
 * @example Basic Handler Usage
 * ```typescript
 * import { ValueHandlers } from './handler-library';
 * 
 * // Get handler function
 * const styleHandler = ValueHandlers.componentStyle;
 * 
 * // Call with parameters
 * const handlerCode = styleHandler('width', 'auto');
 * 
 * // Result: Generated JavaScript code string
 * console.log(handlerCode);
 * // Output: "const selectedComponent = Utils.first(Vars.selectedComponents); ..."
 * ```
 * 
 * @example Configuration Reference
 * ```yaml
 * # In component configuration
 * properties:
 *   - name: fontSize
 *     type: number
 *     valueHandler:
 *       ref: componentStyle        # Handler name
 *       params: [fontSize, "16px"] # Parameters
 *     stateHandler:
 *       ref: defaultStyle
 *       params: [fontSize]
 *     eventHandlers:
 *       onChange:
 *         ref: updateStyleWithUnit
 *         params: [fontSize, "px"]
 * ```
 * 
 * @example Creating Custom Handler
 * ```typescript
 * // Add to appropriate category
 * export const ValueHandlers = {
 *   // ... existing handlers
 *   
 *   // New custom handler
 *   customGetter: (propertyName: string, multiplier: number) => `
 *     const selectedComponent = Utils.first(Vars.selectedComponents);
 *     const value = selectedComponent?.custom?.${propertyName} || 0;
 *     return value * ${multiplier};
 *   `
 * };
 * 
 * // Use in config
 * valueHandler:
 *   ref: customGetter
 *   params: [myProperty, 2.5]
 * ```
 * 
 * @see {@link ./property-block/handler-resolver.ts} for resolution logic
 * @see {@link ./property-block/generators/input-generator.ts} for usage in generation
 * @see {@link ../runtime/handlers/handler-executor.ts} for runtime execution
 */

/**
 * Value Handlers - Functions to retrieve and format values for input display.
 * 
 * @description
 * ValueHandlers are responsible for extracting component properties and formatting
 * them for display in Studio inputs. They run when inputs need to show current values.
 * 
 * **Execution Context:**
 * - Runs in runtime context with full API access
 * - Has access to: Utils, Vars, Editor, selectedComponent
 * - Should return values compatible with input type
 * - Should handle missing/undefined values gracefully
 * 
 * **Common Patterns:**
 * ```typescript
 * // 1. Get selected component
 * const selectedComponent = Utils.first(Vars.selectedComponents);
 * 
 * // 2. Extract property with default
 * const value = selectedComponent?.style?.propertyName || defaultValue;
 * 
 * // 3. Return formatted value
 * return value;
 * ```
 * 
 * **Return Types by Input:**
 * - **TextInput/Number**: string | number
 * - **Select**: [options[], [currentValue]]
 * - **Radio**: [options[], currentValue, 'button']
 * - **Checkbox**: boolean | 'check' | ''
 * - **ColorPicker**: string (hex/rgb/hsl)
 * 
 * @type {Record<string, string | Function>}
 */
export const ValueHandlers = {
  // Get component name
  componentName: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.name || '';
  `,
  
  // Get component input property (prioritizes inputHandlers over input)
  componentInput: (propertyName: string, defaultValue?: any) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const input = Editor.getComponentBreakpointInput(selectedComponent, '${propertyName}');
    // Return the value if it exists (handles both {type: 'value', value: x} and direct values)
    if (input?.type === 'handler' && input?.value) {
      // If type is handler, return the default (the value is code, not displayable)
      return ${defaultValue !== undefined ? JSON.stringify(defaultValue) : `''`};
    }
    return input?.value ${defaultValue !== undefined ? `?? ${JSON.stringify(defaultValue)}` : `?? ''`};
  `,
  
  // Get component input handler value (when type is 'handler')
  componentInputHandler: (propertyName: string, defaultValue: string = '') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const input = Editor.getComponentBreakpointInput(selectedComponent, '${propertyName}');
    // Return handler code if it exists, otherwise default
    return input?.type === 'handler' ? (input.value || '${defaultValue}') : '${defaultValue}';
  `,
  
  // Get component input property for radio buttons (returns {options, currentValue, type})
  componentInputRadio: (propertyName: string, options: Array<{label: string, value: string}>, defaultValue: string = '') => `
    const options = ${JSON.stringify(options)};
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const input = Editor.getComponentBreakpointInput(selectedComponent, '${propertyName}');
    // Only use the value if type is "value", otherwise use default (e.g., for handlers)
    const currentValue = input?.type === 'value' ? (input.value || '${defaultValue}') : '${defaultValue}';
    const type = 'button';
    return {options, currentValue, type};
  `,
  
  // Get component style property
  componentStyle: (propertyName: string, defaultValue: string = '') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return Editor.getComponentStyle(selectedComponent, '${propertyName}') || "${defaultValue}";
  `,
  
  // Get component style property for select inputs (returns [options, [currentValue]])
  componentStyleSelect: (propertyName: string, options: Array<{label: string, value: string}>, defaultValue: string = '') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const currentValue = Editor.getComponentStyle(selectedComponent, '${propertyName}') || '${defaultValue}';
    const options = ${JSON.stringify(options)};
    return [options, [currentValue]];
  `,
  
  // Get component input property for select inputs (returns [options, [currentValue]])
  componentInputSelect: (propertyName: string, defaultValue: string = '') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const input = Editor.getComponentBreakpointInput(selectedComponent, '${propertyName}');
    // Only use the value if type is "value", otherwise use default (e.g., for handlers)
    const currentValue = input?.type === 'value' ? (input.value || '${defaultValue}') : '${defaultValue}';
    return currentValue;
  `,
  
  // Style handler - for getting style values with handler support
  styleHandler: (propertyName: string, defaultValue: string = '') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return Editor.getComponentStyleForState(selectedComponent, '${propertyName}') || "${defaultValue}";
  `,
  
  // Display toggle (show/hide) with icons
  displayToggle: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    let currentDisplay = '';
    let isDisabled = false;
    
    if (selectedComponent?.input?.display?.type == 'handler' && !!selectedComponent?.input?.display?.value) {
      isDisabled = true;
    } else {
      currentDisplay = Editor.getComponentBreakpointInput(selectedComponent, 'display')?.value;
    }
    
    const options = [
      { icon: 'eye', value: true, disabled: isDisabled },
      { icon: 'eye-slash', value: false, disabled: isDisabled }
    ];
    
    const radioType = 'button';
    return [options, currentDisplay, radioType];
  `,
  
  // Radio button with options
  radioWithOptions: (propertyName: string, options: any[], defaultValue: any) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const currentValue = Editor.getComponentStyle(selectedComponent, '${propertyName}') || "${defaultValue}";
    const options = ${JSON.stringify(options)};
    const radioType = "button";
    return [options, currentValue, radioType];
  `
};

/**
 * State Handlers - Functions to control input enabled/disabled state.
 * 
 * @description
 * StateHandlers determine whether an input should be enabled or disabled based
 * on component state. Primary use case is disabling static inputs when dynamic
 * handlers (code icons) are active.
 * 
 * **Execution Context:**
 * - Runs in runtime context when input state needs evaluation
 * - Has access to: Utils, Vars, selectedComponent
 * - Should return 'enabled' | 'disabled' | boolean
 * - Re-evaluated when component state changes
 * 
 * **Common Pattern:**
 * ```typescript
 * // Check if property has an active handler
 * const hasHandler = selectedComponent?.styleHandlers?.['propertyName'];
 * 
 * // Disable input if handler is active (user should use code editor instead)
 * return hasHandler ? 'disabled' : 'enabled';
 * ```
 * 
 * **Why Disable on Handler?**
 * When a property has a dynamic handler (code icon), the value is computed
 * at runtime. The static input becomes meaningless and should be disabled
 * to prevent user confusion.
 * 
 * **State Values:**
 * - `'enabled'` - Input is interactive
 * - `'disabled'` - Input is grayed out and non-interactive
 * - `true` / `false` - Boolean alternative (for some input types)
 * 
 * **Best Practices:**
 * - Always check for null/undefined components
 * - Provide clear feedback about why input is disabled
 * - Consider handler type (style vs input)
 * - Handle edge cases (missing properties)
 * 
 * @type {Record<string, string | Function>}
 * 
 * @example Default Style Handler Pattern
 * ```typescript
 * // Property: fontSize
 * // State: Disabled when fontSize has a styleHandler
 * 
 * stateHandler: {
 *   ref: "defaultStyle",
 *   params: ["fontSize"]
 * }
 * 
 * // Generated code:
 * // If component.styleHandlers.fontSize exists -> 'disabled'
 * // Otherwise -> 'enabled'
 * ```
 * 
 * @example Input Handler Pattern
 * ```typescript
 * // Property: placeholder
 * // State: Disabled when placeholder has an inputHandler
 * 
 * stateHandler: {
 *   ref: "inputHandler",
 *   params: ["placeholder"]
 * }
 * 
 * // Used for input properties that can have handlers
 * ```
 */
export const StateHandlers = {
  /**
   * Default style property state handler.
   * 
   * @description
   * Disables input when the property has an active styleHandler (code icon).
   * This is the most common state handler for style properties.
   * 
   * **Use For:**
   * - Style properties (width, height, color, etc.)
   * - Properties that support dynamic handlers
   * - Standard property inputs
   * 
   * **Behavior:**
   * - Checks `component.styleHandlers[propertyName]`
   * - Returns 'disabled' if handler exists
   * - Returns 'enabled' otherwise
   * 
   * @param {string} propertyName - The CSS property name (e.g., 'width', 'fontSize')
   * @returns {string} Handler code that evaluates to 'enabled' | 'disabled'
   * 
   * @example Usage in Config
   * ```yaml
   * properties:
   *   - name: width
   *     type: number
   *     stateHandler:
   *       ref: defaultStyle
   *       params: [width]
   * ```
   */
  defaultStyle: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.styleHandlers?.['${propertyName}'] ? 'disabled' : 'enabled';
  `,
  
  /**
   * Input property state handler.
   *
   * @description
   * Disables input when the property has an active handler (type === 'handler').
   * Used for component input properties rather than style properties.
   *
   * **Use For:**
   * - Input properties (placeholder, value, label, etc.)
   * - Non-style component properties
   * - Dynamic input behavior
   *
   * **Behavior:**
   * - Checks `component.input[propertyName].type === 'handler'`
   * - Returns 'disabled' if handler exists
   * - Returns 'enabled' otherwise
   *
   * @param {string} propertyName - The input property name (e.g., 'placeholder', 'label')
   * @returns {string} Handler code that evaluates to 'enabled' | 'disabled'
   *
   * @example Usage in Config
   * ```yaml
   * properties:
   *   - name: placeholder
   *     type: text
   *     stateHandler:
   *       ref: inputHandler
   *       params: [placeholder]
   * ```
   */
  inputHandler: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const hasHandlerType = selectedComponent?.input?.${propertyName}?.type === 'handler' &&
                           selectedComponent?.input?.${propertyName}?.value;
    return hasHandlerType ? 'disabled' : 'enabled';
  `,

  /**
   * Input helper text handler - Shows message when handler is active.
   *
   * @description
   * Returns helper text message when an input property has a handler applied.
   * Used to inform users why an input is disabled.
   *
   * **Use For:**
   * - Text inputs with handler support
   * - Number inputs with handler support
   * - Any input that can have handlers
   *
   * **Behavior:**
   * - Returns "Value driven by handler" when handler is active
   * - Returns empty string when no handler (input is editable)
   *
   * @param {string} propertyName - The input property name
   * @returns {string} Handler code that returns helper text
   *
   * @example Usage in Config
   * ```yaml
   * properties:
   *   - name: label
   *     type: text
   *     helperHandler:
   *       ref: inputHelperText
   *       params: [label]
   * ```
   */
  inputHelperText: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const hasHandlerType = selectedComponent?.input?.${propertyName}?.type === 'handler' &&
                           selectedComponent?.input?.${propertyName}?.value;
    return hasHandlerType ? 'Value driven by handler' : '';
  `,

  /**
   * Icon picker disable state handler.
   *
   * @description
   * Returns boolean to disable icon picker when the icon property has a handler.
   * Specifically designed for IconPicker components which expect boolean disable state.
   *
   * **Use For:**
   * - IconPicker components
   * - Icon selection inputs
   * - Components with icon properties
   *
   * **Behavior:**
   * - Checks `component.input[propertyName].type === 'handler'`
   * - Returns true if handler exists (disabled)
   * - Returns false otherwise (enabled)
   *
   * **Difference from inputHandler:**
   * - Returns boolean instead of 'enabled'/'disabled' string
   * - Specifically for IconPicker compatibility
   * - Uses double-bang (!!) for explicit boolean conversion
   *
   * @param {string} propertyName - The icon property name (typically 'icon')
   * @returns {string} Handler code that evaluates to boolean
   *
   * @example Usage in Config
   * ```yaml
   * properties:
   *   - name: icon
   *     type: icon
   *     stateHandler:
   *       ref: iconPickerDisable
   *       params: [icon]
   * ```
   */
  iconPickerDisable: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return !!(selectedComponent?.input?.${propertyName}?.type === 'handler' && selectedComponent?.input?.${propertyName}?.value);
  `,
  
  /**
   * Value handler state - disables if input value is a handler.
   * 
   * @description
   * Special case handler for the 'value' property itself. Disables static value
   * input when the value is defined as a handler (dynamic computed value).
   * 
   * **Use For:**
   * - Component 'value' property editors
   * - Cases where value can be static or dynamic
   * - Preventing conflicting static/dynamic values
   * 
   * **Behavior:**
   * - Checks `component.input.value.type === 'handler'`
   * - Also verifies handler code exists (.value is not empty)
   * - Returns 'disabled' if value is a handler
   * - Returns 'enabled' for static values
   * 
   * **No Parameters:**
   * - Always checks the 'value' property specifically
   * - Not parameterized like other handlers
   * - Used as-is in configurations
   * 
   * @returns {string} Handler code that evaluates to 'enabled' | 'disabled'
   * 
   * @example Usage in Config
   * ```yaml
   * properties:
   *   - name: value
   *     type: text
   *     stateHandler:
   *       ref: valueHandler  # No params needed
   * ```
   */
  valueHandler: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.input?.value?.type === 'handler' && selectedComponent?.input?.value?.value ? 'disabled' : 'enabled';
  `
};

/**
 * Event Handlers - Functions to handle user interactions with inputs.
 * 
 * @description
 * EventHandlers respond to user actions (onChange, onClick, onInput, etc.) and
 * update component properties accordingly. They bridge the gap between Studio UI
 * interactions and the underlying component data model.
 * 
 * **Execution Context:**
 * - Runs when user interacts with input
 * - Has access to: Utils, Vars, EventData, selectedComponent
 * - Has access to update functions: updateInput, updateStyle, updateName, etc.
 * - Should perform updates and trigger re-renders
 * 
 * **EventData Structure:**
 * ```typescript
 * EventData = {
 *   value: any,        // The new value from the input
 *   event: Event,      // Original DOM event (if applicable)
 *   component: any,    // The input component that triggered the event
 *   ...                // Event-specific additional data
 * }
 * ```
 * 
 * **Common Pattern:**
 * ```typescript
 * // 1. Get selected component
 * const selectedComponent = Utils.first(Vars.selectedComponents);
 * if (!selectedComponent) return;
 * 
 * // 2. Extract and process value
 * let value = EventData.value;
 * 
 * // 3. Call update function
 * updateStyle(selectedComponent, 'propertyName', value);
 * ```
 * 
 * **Update Functions Available:**
 * - `updateName(component, name)` - Update component name
 * - `updateInput(component, prop, type, value)` - Update input property (type can be 'handler' for dynamic values)
 * - `updateStyle(component, prop, value)` - Update style property
 * - `updateStyleHandlers(component, prop, handler)` - Update style handler
 * - `updateEvent(component, event, code)` - Update event handler
 * 
 * **Side Effects:**
 * - Updates trigger component re-renders
 * - Changes propagate to stores ($components)
 * - Editor UI reflects updates immediately
 * - History/undo system records changes
 * 
 * **Best Practices:**
 * - Always check selectedComponent exists
 * - Validate value before updating
 * - Handle edge cases (empty, null, undefined)
 * - Add units to numeric values appropriately
 * - Use early returns for invalid states
 * 
 * @type {Record<string, string | Function>}
 * 
 * @example Basic Update Pattern
 * ```yaml
 * properties:
 *   - name: fontSize
 *     type: number
 *     eventHandlers:
 *       onChange:
 *         ref: updateStyleWithUnit
 *         params: [fontSize, "px"]
 * ```
 * 
 * @example Multi-Event Configuration
 * ```yaml
 * properties:
 *   - name: width
 *     type: number
 *     eventHandlers:
 *       onChange:
 *         ref: updateStyleWithUnit
 *         params: [width, "px"]
 *       onBlur:
 *         ref: updateStyle
 *         params: [width]
 * ```
 */
export const EventHandlers = {
  /**
   * Update component name.
   * 
   * @description
   * Updates the component's display name. This is typically used with text inputs
   * that edit the component name property, which appears in the component tree
   * and is used for identification.
   * 
   * **Use For:**
   * - Component name editors
   * - Name input fields in property panels
   * - Renaming operations
   * 
   * **Behavior:**
   * - Gets selected component
   * - Calls `updateName` with new name from EventData.value
   * - Updates component.name property
   * - Triggers Studio UI refresh
   * 
   * **Side Effects:**
   * - Component tree updates
   * - Component references may need updating
   * - Undo/redo history records change
   * 
   * **No Parameters:**
   * - Always updates the 'name' property
   * - Not parameterized (name is standard property)
   * 
   * @returns {string} Handler code for updating component name
   * 
   * @example Usage in Config
   * ```yaml
   * properties:
   *   - name: componentName
   *     type: text
   *     label: Component Name
   *     eventHandlers:
   *       onChange:
   *         ref: updateName  # No params needed
   * ```
   */
  updateName: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (selectedComponent) {
      updateName(selectedComponent, EventData.value);
    }
  `,
  
  /**
   * Update component input property.
   * 
   * @description
   * Updates a component's input property with type specification. Input properties
   * are the data values that configure component behavior (text, placeholder, options, etc.).
   * 
   * **Use For:**
   * - Text input values (placeholder, label, etc.)
   * - Boolean flags (disabled, required, etc.)
   * - Array data (options, items, etc.)
   * - Any component input property
   * 
   * **Behavior:**
   * - Gets selected component
   * - Calls `updateInput` with property name, type, and value
   * - Updates `component.input[propertyName]`
   * - Triggers re-render of affected component
   * 
   * **Value Types:**
   * - `'string'` - Text values
   * - `'number'` - Numeric values
   * - `'boolean'` - True/false flags
   * - `'array'` - Array data
   * - `'object'` - Complex objects
   * 
   * @param {string} propertyName - The input property to update (e.g., 'placeholder')
   * @param {string} valueType - Type of the value ('string', 'number', 'boolean', etc.)
   * @returns {string} Handler code for updating input property
   * 
   * @example String Input Update
   * ```yaml
   * properties:
   *   - name: placeholder
   *     type: text
   *     eventHandlers:
   *       onChange:
   *         ref: updateInput
   *         params: [placeholder, "string"]
   * ```
   * 
   * @example Boolean Input Update
   * ```yaml
   * properties:
   *   - name: required
   *     type: boolean
   *     eventHandlers:
   *       changed:
   *         ref: updateInput
   *         params: [required, "boolean"]
   * ```
   */
  updateInput: (propertyName: string, valueType: string = 'string') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (selectedComponent) {
      updateInput(selectedComponent, '${propertyName}', '${valueType}', EventData.value);
    }
  `,
  
  /**
   * Update component input handler (dynamic code).
   *
   * @description
   * Updates an input property to be a handler, which contains JavaScript code that
   * computes input values dynamically at runtime. This is used by the code icon
   * functionality to enable dynamic property values.
   *
   * **Use For:**
   * - Icon selection with dynamic values
   * - Placeholder text from variables
   * - Label text based on state
   * - Any input that can be dynamic
   *
   * **Behavior:**
   * - Gets selected component
   * - Calls `updateInput` with type 'handler' and the code as value
   * - Updates `component.input[propertyName]` with `{type: 'handler', value: code}`
   * - Disables static input (via stateHandler)
   *
   * **Handler Code:**
   * - EventData.value contains the JavaScript code string
   * - Code executes in runtime context
   * - Has access to all runtime API functions
   *
   * @param {string} propertyName - The input property handler to update
   * @returns {string} Handler code for updating input handler
   *
   * @example Icon Handler Update
   * ```yaml
   * properties:
   *   - name: icon
   *     type: event  # Code editor type
   *     eventHandlers:
   *       codeChange:
   *         ref: updateInputHandler
   *         params: [icon]
   * ```
   */
  updateInputHandler: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (selectedComponent) {
      updateInput(selectedComponent, '${propertyName}', 'handler', EventData.value);
    }
  `,
  
  /**
   * Update component style property.
   * 
   * @description
   * Updates a component's style property (CSS). This is the most common event handler
   * for style-related inputs. Updates the component's style object directly.
   * 
   * **Use For:**
   * - CSS properties (color, fontSize, padding, etc.)
   * - Style values that don't need units
   * - Select inputs (display: flex, position: absolute)
   * - Radio buttons (textAlign: left, center, right)
   * 
   * **Behavior:**
   * - Gets selected component
   * - Validates component exists
   * - Calls `updateStyle` with property and value
   * - Updates `component.style[propertyName]`
   * - Triggers component re-render
   * 
   * **Value Processing:**
   * - Values are used as-is (no transformation)
   * - Supports any valid CSS value
   * - Empty string removes property
   * - 'auto' is preserved
   * 
   * @param {string} propertyName - The CSS property to update (e.g., 'color', 'display')
   * @returns {string} Handler code for updating style property
   * 
   * @example Color Update
   * ```yaml
   * properties:
   *   - name: backgroundColor
   *     type: color
   *     eventHandlers:
   *       changed:
   *         ref: updateStyle
   *         params: [backgroundColor]
   * ```
   * 
   * @example Select Update
   * ```yaml
   * properties:
   *   - name: display
   *     type: select
   *     options:
   *       - { value: flex, label: Flex }
   *       - { value: block, label: Block }
   *     eventHandlers:
   *       changed:
   *         ref: updateStyle
   *         params: [display]
   * ```
   */
  updateStyle: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (!selectedComponent) return;
    updateStyle(selectedComponent, '${propertyName}', EventData.value);
  `,
  
  /**
   * Update style property with automatic unit addition.
   * 
   * @description
   * Updates a style property and automatically appends a unit (px, rem, %, etc.) if needed.
   * This is essential for numeric CSS properties that require units. Intelligently handles
   * values that already have units and special keywords like 'auto'.
   * 
   * **Use For:**
   * - Numeric CSS properties (width, height, margin, padding, fontSize, etc.)
   * - Number inputs that represent CSS values
   * - Properties that accept unit-based values
   * 
   * **Behavior:**
   * - Gets selected component
   * - Extracts value from EventData
   * - Checks if value needs a unit:
   *   - Skip if empty string
   *   - Skip if 'auto'
   *   - Skip if already has a unit (checked via regex)
   * - Appends unit if needed
   * - Calls `updateStyle` with processed value
   * 
   * **Unit Detection:**
   * - Uses regex `/[a-z%]$/i` to detect existing units
   * - Matches: px, rem, em, %, vh, vw, pt, cm, etc.
   * - Case-insensitive matching
   * 
   * **Special Cases:**
   * - `''` (empty) → No update
   * - `'auto'` → Passed as-is
   * - `'50'` → Becomes '50px' (or specified unit)
   * - `'50px'` → Stays '50px' (already has unit)
   * - `'2rem'` → Stays '2rem' (already has unit)
   * 
   * @param {string} propertyName - The CSS property to update (e.g., 'width', 'fontSize')
   * @param {string} unit - Unit to append ('px', 'rem', '%', 'em', etc.)
   * @returns {string} Handler code for updating style with unit
   * 
   * @example Width with Pixels
   * ```yaml
   * properties:
   *   - name: width
   *     type: number
   *     unit: px
   *     eventHandlers:
   *       onChange:
   *         ref: updateStyleWithUnit
   *         params: [width, "px"]
   * 
   * # User enters: "100" → Becomes: "100px"
   * # User enters: "50rem" → Stays: "50rem"
   * # User enters: "auto" → Stays: "auto"
   * ```
   * 
   * @example Font Size with REM
   * ```yaml
   * properties:
   *   - name: fontSize
   *     type: number
   *     unit: rem
   *     eventHandlers:
   *       onChange:
   *         ref: updateStyleWithUnit
   *         params: [fontSize, "rem"]
   * 
   * # User enters: "1.5" → Becomes: "1.5rem"
   * ```
   * 
   * @example Percentage Value
   * ```yaml
   * properties:
   *   - name: width
   *     type: number
   *     unit: "%"
   *     eventHandlers:
   *       onChange:
   *         ref: updateStyleWithUnit
   *         params: [width, "%"]
   * 
   * # User enters: "50" → Becomes: "50%"
   * ```
   */
  updateStyleWithUnit: (propertyName: string, unit: string = 'px') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (!selectedComponent) return;
    
    let value = EventData.value;
    
    // Add unit if value is not empty and not 'auto'
    if (value && value !== 'auto' && value !== '') {
      // Check if value already has a unit
      if (!/[a-z%]$/i.test(value)) {
        value = value + '${unit}';
      }
    }
    
    updateStyle(selectedComponent, "${propertyName}", value);
  `
};
