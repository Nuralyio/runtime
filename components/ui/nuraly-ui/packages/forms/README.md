# @nuralyui/forms

Form components package for Nuraly UI Library. This package contains all form input components for building interactive forms.

[![npm version](https://badge.fury.io/js/@nuralyui%2Fforms.svg)](https://badge.fury.io/js/@nuralyui%2Fforms)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## 📦 Included Components

### Basic Inputs
- **input** - Text input fields with validation
- **textarea** - Multi-line text input
- **checkbox** - Checkbox inputs
- **radio** / **radio-group** - Radio button groups
- **select** - Dropdown select components

### Advanced Inputs
- **slider-input** - Range slider inputs
- **datepicker** - Calendar-based date selection
- **timepicker** - Time selection input
- **colorpicker** - Color picker with multiple formats
- **file-upload** - Drag & drop file upload

### Form Container
- **form** - Form wrapper with validation and submission handling

## 🚀 Installation

```bash
npm install @nuralyui/forms
```

## 📖 Usage

### Import All Form Components

```javascript
import '@nuralyui/forms';
```

### Import Individual Components

```javascript
import '@nuralyui/forms/input';
import '@nuralyui/forms/checkbox';
import '@nuralyui/forms/select';
```

### HTML Usage

```html
<nr-input label="Email" type="email" required></nr-input>
<nr-checkbox>Accept terms</nr-checkbox>
<nr-select label="Country" .options="${countries}"></nr-select>
<nr-textarea label="Message" rows="5"></nr-textarea>
```

### React Usage

```tsx
import { NrInput, NrCheckbox, NrSelect, NrForm } from '@nuralyui/forms/react';

function ContactForm() {
  return (
    <NrForm onSubmit={(e) => console.log(e.detail)}>
      <NrInput label="Name" required />
      <NrInput label="Email" type="email" required />
      <NrTextarea label="Message" rows={5} />
      <NrCheckbox>Subscribe to newsletter</NrCheckbox>
      <button type="submit">Submit</button>
    </NrForm>
  );
}
```

## 📊 Component Versions

See the `VERSIONS.md` file in the package for component version information.

## 🔗 Links

- [GitHub Repository](https://github.com/NuralyUI/NuralyUI)
- [Documentation](https://nuralyui.github.io)
- [NPM Organization](https://www.npmjs.com/org/nuralyui)
