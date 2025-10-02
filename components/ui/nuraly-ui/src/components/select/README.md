# Select Component

Advanced select component with multiple selection modes, validation, keyboard navigation, and accessibility features.

## Features

- **Multiple Selection Modes**: Single and multiple selection support
- **Validation**: Built-in validation with custom messages and states
- **Keyboard Navigation**: Full keyboard accessibility with arrow keys, Enter, Escape
- **Multiple Display Types**: Default, inline, button, and custom slot-based rendering
- **Accessibility**: ARIA-compliant with screen reader support
- **Customizable**: Extensive styling options and custom content support
- **Controller Architecture**: Modular design with separate controllers for different concerns

## Basic Usage

```html
<!-- Basic select with custom placeholder -->
<nr-select placeholder="Choose a city...">
  <option value="1">New York</option>
  <option value="2">London</option>
</nr-select>

<!-- Multiple selection -->
<nr-select multiple placeholder="Select multiple cities"></nr-select>

<!-- With validation -->
<nr-select required status="error" placeholder="Please select..."></nr-select>

<!-- Button style -->
<nr-select type="button" placeholder="Click to select"></nr-select>

<!-- Empty placeholder (no text shown when nothing selected) -->
<nr-select placeholder=""></nr-select>

<!-- Custom no-options message -->
<nr-select no-options-message="No cities found"></nr-select>

<!-- Custom no-options message and icon -->
<nr-select 
  no-options-message="No fruits available" 
  no-options-icon="apple">
</nr-select>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | `SelectOption[]` | `[]` | Array of options to display |
| `value` | `string \| string[]` | `''` | Current/initial value(s) |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disables the component |
| `type` | `SelectType` | `'default'` | Display type |
| `multiple` | `boolean` | `false` | Enable multiple selection |
| `show` | `boolean` | `false` | Control dropdown visibility |
| `status` | `SelectStatus` | `'default'` | Validation status |
| `size` | `SelectSize` | `'medium'` | Component size |
| `required` | `boolean` | `false` | Required for validation |
| `name` | `string` | `''` | Form field name |
| `no-options-message` | `string` | `'No options available'` | Message when no options |
| `no-options-icon` | `string` | `'inbox'` | Icon for no options message |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-change` | `{ value, selectedOptions, previousValue }` | Fired when selection changes |
| `nr-focus` | `{}` | Fired when component receives focus |
| `nr-blur` | `{}` | Fired when component loses focus |
| `nr-dropdown-open` | `{}` | Fired when dropdown opens |
| `nr-dropdown-close` | `{}` | Fired when dropdown closes |
| `nr-validation` | `{ valid, message }` | Fired when validation state changes |

## Methods

### Selection Methods

```typescript
// Get selected options
const selected = selectElement.selectedOptions;
const firstSelected = selectElement.selectedOption;

// Programmatic selection
selectElement.selectOption(option);
selectElement.unselectOption(option);
selectElement.clearSelection();

// Check selection state
const isSelected = selectElement.isOptionSelected(option);
```

### Dropdown Control

```typescript
// Control dropdown
selectElement.openDropdown();
selectElement.closeDropdown();
selectElement.toggleDropdown();
```

### Validation

```typescript
// Validation methods
const isValid = selectElement.validate();
const isValidNow = selectElement.checkValidity();
const reportedValid = selectElement.reportValidity();

// Custom validation
selectElement.setCustomValidity('Custom error message');
```

## Slots

| Slot | Description |
|------|-------------|
| `label` | Select label content |
| `helper-text` | Helper text below select |
| `trigger` | Custom trigger content (slot type only) |

## CSS Custom Properties

| Property | Description | Default |
|----------|-------------|---------|
| `--select-border-color` | Border color | Theme dependent |
| `--select-background` | Background color | Theme dependent |
| `--select-text-color` | Text color | Theme dependent |
| `--select-focus-color` | Focus indicator color | Theme dependent |
| `--select-dropdown-shadow` | Dropdown shadow | Theme dependent |
| `--select-no-options-color` | No options message text color | Theme dependent |
| `--select-no-options-icon-color` | No options icon color | Theme dependent |
| `--select-no-options-color` | No options message text color | Theme dependent |

## Option Configuration

```typescript
interface SelectOption {
  value: string;           // Unique value
  label: string;           // Display text
  icon?: string;           // Optional icon
  disabled?: boolean;      // Disable option
  state?: 'error' | 'warning' | 'success';
  message?: string;        // Additional message
  htmlContent?: string;    // HTML content instead of label
  className?: string;      // Custom CSS class
  style?: string;          // Inline styles
  title?: string;          // Tooltip text
  group?: string;          // Option grouping
  description?: string;    // Additional description
}
```

## Advanced Usage

### Custom Option Rendering

```typescript
const options = [
  {
    value: '1',
    label: 'Option 1',
    icon: 'home',
    description: 'Home option',
    htmlContent: '<strong>Bold</strong> option'
  }
];
```

### Multiple Selection with Tags

```html
<nr-select multiple>
  <!-- Selected options appear as removable tags -->
</nr-select>
```

### Custom Validation

```typescript
selectElement.addEventListener('nr-validation', (e) => {
  if (!e.detail.valid) {
    console.log('Validation failed:', e.detail.message);
  }
});

selectElement.addEventListener('nr-change', (e) => {
  console.log('Selection changed:', e.detail.value);
  console.log('Selected options:', e.detail.selectedOptions);
});
```

## Keyboard Navigation

- **Arrow Keys**: Navigate through options
- **Enter/Space**: Select focused option
- **Escape**: Close dropdown
- **Tab**: Navigate to next focusable element
- **Home/End**: Jump to first/last option

## Accessibility

The component follows ARIA guidelines:
- Uses `combobox` and `listbox` roles
- Provides proper `aria-expanded`, `aria-selected` states
- Supports screen readers with descriptive labels
- Keyboard navigation follows standard patterns

## Architecture

The component uses a modular controller architecture:

- **SelectionController**: Manages option selection state
- **DropdownController**: Handles dropdown visibility and positioning
- **KeyboardController**: Manages keyboard interactions
- **FocusController**: Handles focus management
- **ValidationController**: Manages validation logic

This separation allows for better maintainability and testing.
