import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import { TEXTAREA_STATE, TEXTAREA_SIZE, TEXTAREA_VARIANT, TEXTAREA_RESIZE } from './textarea.types.js';

const meta: Meta = {
  title: 'Data Entry/Textarea',
  component: 'nr-textarea',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Textarea Component

A versatile textarea component with validation, resize options, and interactive features.

## Features

- 📝 Multi-line text input with configurable rows/columns
- ✅ Built-in validation system with custom rules
- 📏 Configurable resize behavior (none, vertical, horizontal, both)
- 🎨 Multiple visual variants (outlined, filled, borderless, underlined)
- 📊 Character counting with limits
- 🔄 Auto-resize functionality
- 🧹 Optional clear button
- ♿ Full accessibility support
- 🌙 Theme support (light/dark)

## Usage

\`\`\`html
<nr-textarea placeholder="Enter your message"></nr-textarea>
<nr-textarea rows="5" resize="vertical"></nr-textarea>
<nr-textarea max-length="500" show-count></nr-textarea>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The textarea value'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the textarea'
    },
    readonly: {
      control: 'boolean',
      description: 'Makes the textarea read-only'
    },
    required: {
      control: 'boolean',
      description: 'Marks the textarea as required'
    },
    state: {
      control: 'select',
      options: Object.values(TEXTAREA_STATE),
      description: 'Visual state of the textarea'
    },
    size: {
      control: 'select',
      options: Object.values(TEXTAREA_SIZE),
      description: 'Size variant of the textarea'
    },
    variant: {
      control: 'select',
      options: Object.values(TEXTAREA_VARIANT),
      description: 'Visual variant of the textarea'
    },
    resize: {
      control: 'select',
      options: Object.values(TEXTAREA_RESIZE),
      description: 'Resize behavior'
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines'
    },
    cols: {
      control: 'number',
      description: 'Number of visible character columns'
    },
    maxLength: {
      control: 'number',
      description: 'Maximum character limit'
    },
    allowClear: {
      control: 'boolean',
      description: 'Shows clear button'
    },
    showCount: {
      control: 'boolean',
      description: 'Shows character counter'
    },
    autoResize: {
      control: 'boolean',
      description: 'Auto-resize based on content'
    },
    minHeight: {
      control: 'number',
      description: 'Minimum height for auto-resize (px)'
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum height for auto-resize (px)'
    },
    validateOnChange: {
      control: 'boolean',
      description: 'Validate on value change'
    },
    validateOnBlur: {
      control: 'boolean',
      description: 'Validate on blur'
    },
    hasFeedback: {
      control: 'boolean',
      description: 'Show validation status icon'
    }
  },
  args: {
    value: '',
    placeholder: 'Enter your text...',
    disabled: false,
    readonly: false,
    required: false,
    state: TEXTAREA_STATE.Default,
    size: TEXTAREA_SIZE.Medium,
    variant: TEXTAREA_VARIANT.Default,
    resize: TEXTAREA_RESIZE.Vertical,
    rows: 3,
    cols: 50,
    allowClear: false,
    showCount: false,
    autoResize: false,
    validateOnChange: true,
    validateOnBlur: true,
    hasFeedback: false
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <nr-textarea
      .value=${args.value}
      .placeholder=${args.placeholder}
      .disabled=${args.disabled}
      .readonly=${args.readonly}
      .required=${args.required}
      .state=${args.state}
      .size=${args.size}
      .variant=${args.variant}
      .resize=${args.resize}
      .rows=${args.rows}
      .cols=${args.cols}
      .maxLength=${args.maxLength}
      .allowClear=${args.allowClear}
      .showCount=${args.showCount}
      .autoResize=${args.autoResize}
      .minHeight=${args.minHeight}
      .maxHeight=${args.maxHeight}
      .validateOnChange=${args.validateOnChange}
      .validateOnBlur=${args.validateOnBlur}
      .hasFeedback=${args.hasFeedback}
    ></nr-textarea>
  `
};

export const WithLabel: Story = {
  args: {
    placeholder: 'Enter your feedback...',
    required: true
  },
  render: (args) => html`
    <nr-textarea
      .value=${args.value}
      .placeholder=${args.placeholder}
      .disabled=${args.disabled}
      .readonly=${args.readonly}
      .required=${args.required}
      .state=${args.state}
      .size=${args.size}
      .variant=${args.variant}
      .resize=${args.resize}
      .rows=${args.rows}
      .cols=${args.cols}
      .maxLength=${args.maxLength}
      .allowClear=${args.allowClear}
      .showCount=${args.showCount}
      .autoResize=${args.autoResize}
      .minHeight=${args.minHeight}
      .maxHeight=${args.maxHeight}
      .validateOnChange=${args.validateOnChange}
      .validateOnBlur=${args.validateOnBlur}
      .hasFeedback=${args.hasFeedback}
    >
      <span slot="label">Feedback Message</span>
      <span slot="helper-text">Please provide your honest feedback about our service.</span>
    </nr-textarea>
  `
};

export const CharacterCounter: Story = {
  args: {
    placeholder: 'What\'s happening?',
    maxLength: 280,
    showCount: true,
    rows: 4
  },
  render: (args) => html`
    <nr-textarea
      .value=${args.value}
      .placeholder=${args.placeholder}
      .disabled=${args.disabled}
      .readonly=${args.readonly}
      .required=${args.required}
      .state=${args.state}
      .size=${args.size}
      .variant=${args.variant}
      .resize=${args.resize}
      .rows=${args.rows}
      .cols=${args.cols}
      .maxLength=${args.maxLength}
      .allowClear=${args.allowClear}
      .showCount=${args.showCount}
      .autoResize=${args.autoResize}
      .minHeight=${args.minHeight}
      .maxHeight=${args.maxHeight}
      .validateOnChange=${args.validateOnChange}
      .validateOnBlur=${args.validateOnBlur}
      .hasFeedback=${args.hasFeedback}
    >
      <span slot="label">Tweet</span>
      <span slot="helper-text">Share your thoughts in 280 characters or less.</span>
    </nr-textarea>
  `
};

export const AutoResize: Story = {
  args: {
    placeholder: 'Start typing and watch the textarea grow...',
    autoResize: true,
    minHeight: 80,
    maxHeight: 300,
    allowClear: true
  },
  render: (args) => html`
    <nr-textarea
      .value=${args.value}
      .placeholder=${args.placeholder}
      .disabled=${args.disabled}
      .readonly=${args.readonly}
      .required=${args.required}
      .state=${args.state}
      .size=${args.size}
      .variant=${args.variant}
      .resize=${args.resize}
      .rows=${args.rows}
      .cols=${args.cols}
      .maxLength=${args.maxLength}
      .allowClear=${args.allowClear}
      .showCount=${args.showCount}
      .autoResize=${args.autoResize}
      .minHeight=${args.minHeight}
      .maxHeight=${args.maxHeight}
      .validateOnChange=${args.validateOnChange}
      .validateOnBlur=${args.validateOnBlur}
      .hasFeedback=${args.hasFeedback}
    >
      <span slot="label">Auto-resize Textarea</span>
      <span slot="helper-text">This textarea will automatically adjust its height based on content (80px - 300px).</span>
    </nr-textarea>
  `
};

export const WithValidation: Story = {
  args: {
    placeholder: 'Enter at least 10 characters...',
    hasFeedback: true,
    showCount: true,
    maxLength: 200
  },
  render: (args) => {
    setTimeout(() => {
      const textarea = document.querySelector('#validation-textarea');
      if (textarea) {
        textarea.rules = [
          {
            validator: (value) => value.length >= 10,
            message: 'Please provide at least 10 characters',
            level: 'error'
          },
          {
            validator: (value) => value.length <= 200,
            message: 'Message is too long',
            level: 'error'
          }
        ];
      }
    }, 100);

    return html`
      <nr-textarea
        id="validation-textarea"
        .value=${args.value}
        .placeholder=${args.placeholder}
        .disabled=${args.disabled}
        .readonly=${args.readonly}
        .required=${args.required}
        .state=${args.state}
        .size=${args.size}
        .variant=${args.variant}
        .resize=${args.resize}
        .rows=${args.rows}
        .cols=${args.cols}
        .maxLength=${args.maxLength}
        .allowClear=${args.allowClear}
        .showCount=${args.showCount}
        .autoResize=${args.autoResize}
        .minHeight=${args.minHeight}
        .maxHeight=${args.maxHeight}
        .validateOnChange=${args.validateOnChange}
        .validateOnBlur=${args.validateOnBlur}
        .hasFeedback=${args.hasFeedback}
      >
        <span slot="label">Validated Textarea</span>
        <span slot="helper-text">Minimum 10 characters, maximum 200 characters.</span>
      </nr-textarea>
    `;
  }
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 400px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Small</label>
        <nr-textarea size="small" placeholder="Small textarea" rows="2"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Medium</label>
        <nr-textarea size="medium" placeholder="Medium textarea"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Large</label>
        <nr-textarea size="large" placeholder="Large textarea" rows="4"></nr-textarea>
      </div>
    </div>
  `
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; width: 800px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Default</label>
        <nr-textarea placeholder="Default textarea (no variant)"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Outlined</label>
        <nr-textarea variant="outlined" placeholder="Outlined textarea"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Filled</label>
        <nr-textarea variant="filled" placeholder="Filled textarea"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Underlined</label>
        <nr-textarea variant="underlined" placeholder="Underlined textarea"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Borderless</label>
        <nr-textarea variant="borderless" placeholder="Borderless textarea"></nr-textarea>
      </div>
    </div>
  `
};

export const AllStates: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; width: 600px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Default</label>
        <nr-textarea state="default" placeholder="Default state"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Error</label>
        <nr-textarea state="error" value="This has an error" has-feedback>
          <span slot="helper-text">Please correct this field</span>
        </nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Warning</label>
        <nr-textarea state="warning" value="This has a warning" has-feedback>
          <span slot="helper-text">Please review this field</span>
        </nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Success</label>
        <nr-textarea state="success" value="This is correct" has-feedback>
          <span slot="helper-text">Field validated successfully</span>
        </nr-textarea>
      </div>
    </div>
  `
};

export const ResizeOptions: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; width: 600px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Vertical Resize</label>
        <nr-textarea resize="vertical" placeholder="Drag bottom edge to resize vertically"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Horizontal Resize</label>
        <nr-textarea resize="horizontal" placeholder="Drag right edge to resize horizontally"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Both Directions</label>
        <nr-textarea resize="both" placeholder="Drag corner to resize in any direction"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">No Resize</label>
        <nr-textarea resize="none" placeholder="This textarea cannot be resized"></nr-textarea>
      </div>
    </div>
  `
};

export const DisabledAndReadonly: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; width: 400px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Disabled</label>
        <nr-textarea disabled value="This textarea is disabled" placeholder="Disabled textarea"></nr-textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Readonly</label>
        <nr-textarea readonly value="This textarea is readonly and cannot be edited"></nr-textarea>
      </div>
    </div>
  `
};