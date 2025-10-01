import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../icon/index.js';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

const meta: Meta = {
  title: 'Data Entry/Input',
  component: 'nr-input',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    label: {
      control: { type: 'text' },
      description: 'Label text',
    },
    value: {
      control: { type: 'text' },
      description: 'Input value',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the input is readonly',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Input size',
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'error', 'warning'],
      description: 'Input state',
    },
    withCopy: {
      control: { type: 'boolean' },
      description: 'Show copy button',
    },
    allowClear: {
      control: { type: 'boolean' },
      description: 'Show clear button when input has content',
    },
    showCount: {
      control: { type: 'boolean' },
      description: 'Show character count',
    },
    maxLength: {
      control: { type: 'number' },
      description: 'Maximum character length',
    },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'filled', 'borderless', 'underlined'],
      description: 'Input visual variant',
    },
  },
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    label: 'Input Label',
    value: '',
    disabled: false,
    readonly: false,
    required: false,
    size: 'medium',
    state: 'default',
    withCopy: false,
    allowClear: false,
    showCount: false,
    maxLength: undefined,
    variant: 'underlined',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Type something...',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const WithValue: Story = {
  args: {
    label: 'Input with Value',
    value: 'Predefined value',
    placeholder: 'Type something...',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const Email: Story = {
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    required: true,
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const Number: Story = {
  args: {
    type: 'number',
    label: 'Number Input',
    placeholder: 'Enter a number',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const Search: Story = {
  args: {
    type: 'search',
    label: 'Search',
    placeholder: 'Search...',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 500px;">
      <nr-input size="small" label="Small Input" placeholder="Small size"></nr-input>
      <nr-input size="medium" label="Medium Input" placeholder="Medium size"></nr-input>
      <nr-input size="large" label="Large Input" placeholder="Large size"></nr-input>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 500px;">
      <nr-input label="Normal" placeholder="Normal input"></nr-input>
      <nr-input label="Disabled" placeholder="Disabled input" disabled></nr-input>
      <nr-input label="Readonly" value="Readonly value" readonly></nr-input>
      <nr-input label="Required" placeholder="Required input" required></nr-input>
    </div>
  `,
};

export const ErrorState: Story = {
  args: {
    state: 'error',
    label: 'Error Input',
    placeholder: 'This input has an error',
    value: 'Invalid value',
  },
  render: (args) => html`
    <div style="max-width: 400px;">
      <nr-input
        type="${args.type}"
        placeholder="${args.placeholder}"
        label="${args.label}"
        value="${args.value}"
        size="${args.size}"
        state="${args.state}"
        variant="${args.variant}"
        ?disabled="${args.disabled}"
        ?readonly="${args.readonly}"
        ?required="${args.required}"
        ?withCopy="${args.withCopy}"
        ?allowClear="${args.allowClear}"
        ?showCount="${args.showCount}"
        maxLength="${args.maxLength}"
        .rules=${[
          { required: true, message: 'This field contains an error and this message should follow the error state color and not overflow the parent container width even with very long text that demonstrates text wrapping behavior' }
        ]}
        validation-trigger="blur"
      ></nr-input>
      
      <div style="margin-top: 1rem;">
        <nr-input
          type="text"
          label="Error with helper text"
          placeholder="Another error example"
          state="error"
          helper-text="This is helper text that should also follow error state color and wrap properly within the container width even with very long text content"
        ></nr-input>
      </div>
    </div>
  `,
};

export const WarningState: Story = {
  args: {
    state: 'warning',
    label: 'Warning Input',
    placeholder: 'This input has a warning',
    value: 'Check this value',
  },
  render: (args) => html`
    <div style="max-width: 400px;">
      <nr-input
        type="${args.type}"
        placeholder="${args.placeholder}"
        label="${args.label}"
        value="${args.value}"
        size="${args.size}"
        state="${args.state}"
        variant="${args.variant}"
        ?disabled="${args.disabled}"
        ?readonly="${args.readonly}"
        ?required="${args.required}"
        ?withCopy="${args.withCopy}"
        ?allowClear="${args.allowClear}"
        ?showCount="${args.showCount}"
        maxLength="${args.maxLength}"
        .rules=${[
          { required: true, message: 'This field has a warning and this message should follow the warning state color and not overflow the parent container width even with very long text that demonstrates text wrapping behavior' }
        ]}
        validation-trigger="blur"
      ></nr-input>
      
      <div style="margin-top: 1rem;">
        <nr-input
          type="text"
          label="Warning with helper text"
          placeholder="Another warning example"
          state="warning"
          helper-text="This is helper text that should also follow warning state color and wrap properly within the container width even with very long text content"
        ></nr-input>
      </div>
    </div>
  `,
};

export const WithCopyButton: Story = {
  args: {
    label: 'Input with Copy',
    value: 'This text can be copied',
    withCopy: true,
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      state="${args.state}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
      ?withCopy="${args.withCopy}"
      ?allowClear="${args.allowClear}"
      ?showCount="${args.showCount}"
      maxLength="${args.maxLength}"
    ></nr-input>
  `,
};

export const WithPrefixSuffix: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 500px;">
      <h3>Prefix and Suffix Examples</h3>
      
      <!-- Text prefix/suffix -->
      <nr-input label="Price" placeholder="Enter amount">
        <span slot="prefix">$</span>
        <span slot="suffix">USD</span>
      </nr-input>

      <!-- Icon prefix/suffix -->
      <nr-input label="Search" placeholder="Type to search">
        <nr-icon slot="prefix" name="search"></nr-icon>
        <nr-icon slot="suffix" name="close"></nr-icon>
      </nr-input>

      <!-- Email with icon -->
      <nr-input type="email" label="Email" placeholder="Enter your email">
        <nr-icon slot="prefix" name="envelope"></nr-icon>
      </nr-input>

      <!-- Password with lock icon -->
      <nr-input type="password" label="Password" placeholder="Enter password">
        <nr-icon slot="prefix" name="lock"></nr-icon>
      </nr-input>
    </div>
  `,
};

export const AddonBeforeAfterExamples: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 500px;">
      <h3>Addon Before/After Examples</h3>
      
      <!-- URL with protocol addon before -->
      <nr-input label="Website URL" placeholder="mysite">
        <span slot="addon-before">https://</span>
        <span slot="addon-after">.com</span>
      </nr-input>

      <!-- Phone with country code -->
      <nr-input label="Phone Number" placeholder="555-1234">
        <span slot="addon-before">+1</span>
      </nr-input>

      <!-- Currency input -->
      <nr-input type="number" label="Amount" placeholder="0.00">
        <span slot="addon-before">$</span>
        <span slot="addon-after">USD</span>
      </nr-input>

      <!-- File path -->
      <nr-input label="File Path" placeholder="filename">
        <span slot="addon-before">/home/user/</span>
        <span slot="addon-after">.txt</span>
      </nr-input>

      <!-- Combined with icons in addons -->
      <nr-input label="Search with Button" placeholder="Search term">
        <div slot="addon-before" style="display: flex; align-items: center; gap: 4px;">
          <nr-icon name="search"></nr-icon>
          <span>Find:</span>
        </div>
        <button slot="addon-after" style="border: none; background: #0f62fe; color: white; padding: 4px 8px; cursor: pointer;">Go</button>
      </nr-input>
    </div>
  `,
};

export const AllStates: Story = {
  name: 'All States & Themes',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; width: 100%; max-width: 1000px;">
      
      <!-- Ant Design Theme (Default) -->
      <div data-theme="default-light" style="padding: 20px; border: 2px solid #1890ff; border-radius: 8px; background: #fafafa;">
        <h3 style="margin-top: 0; color: #1890ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">🎨 Ant Design Theme (Default)</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <nr-input 
            state="default" 
            label="Default State" 
            placeholder="Default input" 
            value="Normal text"
            helper-text="Ant Design styled input with clean borders"
          ></nr-input>
          <nr-input 
            state="error" 
            label="Error State" 
            placeholder="Error input" 
            value="Invalid email format"
            helper-text="Ant Design error state with red accent"
          ></nr-input>
          <nr-input 
            state="warning" 
            label="Warning State" 
            placeholder="Warning input" 
            value="Password might be weak"
            helper-text="Ant Design warning state with orange accent"
          ></nr-input>
          <nr-input 
            state="default" 
            label="With Icons" 
            placeholder="Search..." 
            withCopy
            helper-text="Clean Ant Design styling with icons"
          ></nr-input>
        </div>
      </div>

      <!-- Carbon Design Theme -->
      <div data-theme="carbon-light" style="padding: 20px; border: 2px solid #0f62fe; border-radius: 4px; background: #f4f4f4;">
        <h3 style="margin-top: 0; color: #0f62fe; font-family: 'IBM Plex Sans', sans-serif;">⚡ Carbon Design Theme</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <nr-input 
            state="default" 
            label="Default State" 
            placeholder="Default input" 
            value="Normal text"
            helper-text="Carbon Design System underlined style"
          ></nr-input>
          <nr-input 
            state="error" 
            label="Error State" 
            placeholder="Error input" 
            value="Invalid email format"
            helper-text="Carbon error state with IBM styling"
          ></nr-input>
          <nr-input 
            state="warning" 
            label="Warning State" 
            placeholder="Warning input" 
            value="Password might be weak"
            helper-text="Carbon warning state with proper contrast"
          ></nr-input>
          <nr-input 
            state="default" 
            label="With Icons" 
            placeholder="Search..." 
            withCopy
            helper-text="IBM Carbon Design System styling"
          ></nr-input>
        </div>
      </div>

      <!-- Dark Theme Example -->
      <div data-theme="default-dark" style="padding: 20px; border: 2px solid #1890ff; border-radius: 8px; background: #141414; color: #fff;">
        <h3 style="margin-top: 0; color: #40a9ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">🌙 Dark Theme (Ant Design)</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <nr-input 
            state="default" 
            label="Default State" 
            placeholder="Default input" 
            value="Normal text"
            helper-text="Dark theme with proper contrast"
          ></nr-input>
          <nr-input 
            state="error" 
            label="Error State" 
            placeholder="Error input" 
            value="Invalid email format"
            helper-text="Dark theme error state"
          ></nr-input>
          <nr-input 
            state="warning" 
            label="Warning State" 
            placeholder="Warning input" 
            value="Password might be weak"
            helper-text="Dark theme warning state"
          ></nr-input>
          <nr-input 
            state="default" 
            label="With Icons" 
            placeholder="Search..." 
            withCopy
            helper-text="Dark theme with accessible colors"
          ></nr-input>
        </div>
      </div>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 10px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          💡 <strong>Theme Switching:</strong> This showcase demonstrates how the same input component 
          automatically adapts to different design systems (Ant Design vs Carbon) and theme variants 
          (light vs dark) using CSS custom properties.
        </p>
      </div>
    </div>
  `,
};

export const InputValidation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Input components with comprehensive validation features using declarative rules approach.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 600px;">
      <h3>Input Validation Examples</h3>
      
      <!-- Required Field Validation -->
      <div>
        <h4>Required Field Validation</h4>
        <nr-input 
          type="text" 
          label="Full Name *" 
          placeholder="Enter your full name"
          .rules=${[{ required: true, message: 'Please input your full name!' }]}
          validation-trigger="blur"
          help-text="This field is required"
        ></nr-input>
      </div>

      <!-- Email Validation -->
      <div>
        <h4>Email Validation</h4>
        <nr-input 
          type="email" 
          label="Email Address *" 
          placeholder="user@example.com"
          .rules=${[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email address!' }
          ]}
          validation-trigger="change"
          help-text="Please enter a valid email address"
        ></nr-input>
      </div>

      <!-- Password Validation -->
      <div>
        <h4>Password with Custom Rules</h4>
        <nr-input 
          type="password" 
          label="Password *" 
          placeholder="Create a strong password"
          .rules=${[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters!' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, message: 'Password must contain uppercase, lowercase, number and special character!' }
          ]}
          validation-trigger="change"
          help-text="Password must be at least 8 characters with uppercase, lowercase, number and special character"
        ></nr-input>
      </div>

      <!-- Number Range Validation -->
      <div>
        <h4>Number Range Validation</h4>
        <nr-input 
          type="number" 
          label="Age" 
          placeholder="Enter your age"
          .rules=${[
            { required: true, message: 'Please input your age!' },
            { type: 'number', min: 18, max: 120, message: 'Age must be between 18 and 120!' }
          ]}
          validation-trigger="blur"
          help-text="Age must be between 18 and 120"
        ></nr-input>
      </div>

      <!-- Custom Pattern Validation -->
      <div>
        <h4>Phone Number Pattern</h4>
        <nr-input 
          type="tel" 
          label="Phone Number" 
          placeholder="+1 (555) 123-4567"
          .rules=${[
            { required: true, message: 'Please input your phone number!' },
            { pattern: /^\+?1?\d{9,15}$/, message: 'Please enter a valid phone number!' }
          ]}
          validation-trigger="blur"
          help-text="Enter a valid phone number"
        ></nr-input>
      </div>

      <!-- Real-time Username Validation -->
      <div>
        <h4>Real-time Username Validation</h4>
        <nr-input 
          type="text" 
          label="Username" 
          placeholder="Choose a username"
          .rules=${[
            { required: true, message: 'Please input your username!' },
            { min: 3, max: 20, message: 'Username must be 3-20 characters!' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
          ]}
          validation-trigger="change"
          help-text="Username must be 3-20 characters, alphanumeric and underscores only"
        ></nr-input>
      </div>
    </div>
  `,
};

export const FormExample: Story = {
  render: () => html`
    <form style="display: flex; flex-direction: column; gap: 1rem; width: 500px; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;">
      <h3>User Registration</h3>
      <nr-input type="text" label="Full Name" placeholder="Enter your full name" required></nr-input>
      <nr-input type="email" label="Email" placeholder="Enter your email" required></nr-input>
      <nr-input type="password" label="Password" placeholder="Create a password" required></nr-input>
      <nr-input type="tel" label="Phone" placeholder="Enter your phone number"></nr-input>
      <nr-input type="url" label="Website" placeholder="Your website URL"></nr-input>
    </form>
  `,
};

export const ClearFunctionality: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Input with clear functionality - shows a clear icon when there\'s content that allows users to quickly clear the input value.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; width : 400px">
      <div>
        <h3>Clear Examples</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            type="text" 
            label="Basic Clear Input" 
            placeholder="Type something to see clear icon"
            value="Sample text"
            allowClear
          ></nr-input>
          
          <nr-input 
            type="email" 
            label="Email with Clear" 
            placeholder="Enter your email"
            value="user@example.com"
            allowClear
          ></nr-input>
          
          <nr-input 
            type="url" 
            label="URL with Clear" 
            placeholder="Enter website URL"
            value="https://example.com"
            allowClear
          ></nr-input>
          
          <nr-input 
            type="search" 
            label="Search with Clear" 
            placeholder="Search products..."
            value="laptop"
            allowClear
          ></nr-input>
        </div>
      </div>
      
      <div>
        <h3>Clear + Copy Combination</h3>
        <nr-input 
          type="text" 
          label="Both Clear and Copy" 
          placeholder="Type something..."
          value="This text can be cleared or copied"
          allowClear
          withCopy
        ></nr-input>
      </div>
      
      <div>
        <h3>Disabled/Readonly States</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            type="text" 
            label="Disabled with Clear (no icon shown)" 
            value="Can't clear when disabled"
            allowClear
            disabled
          ></nr-input>
          
          <nr-input 
            type="text" 
            label="Readonly with Clear (no icon shown)" 
            value="Can't clear when readonly"
            allowClear
            readonly
          ></nr-input>
        </div>
      </div>
    </div>
  `,
};

export const CharacterCount: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Input with character count functionality - shows character count and enforces character limits with visual feedback.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem;">
      <div>
        <h3>Character Count Examples</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            type="text" 
            label="Basic Character Count" 
            placeholder="Type to see character count"
            value="Sample text"
            showCount
          ></nr-input>
          
          <nr-input 
            type="text" 
            label="With Character Limit (50)" 
            placeholder="Maximum 50 characters"
            value="This text has exactly fifty characters in total!"
            showCount
            maxLength="50"
          ></nr-input>
          
          <nr-input 
            type="text" 
            label="Over Limit Example (20)" 
            placeholder="Maximum 20 characters"
            value="This text exceeds the limit"
            showCount
            maxLength="20"
          ></nr-input>
          
          <nr-input 
            type="textarea" 
            label="Description with Limit (200)" 
            placeholder="Enter your description..."
            value="A longer description that shows how character counting works with longer text content. This helps users understand when they're approaching or exceeding the character limit."
            showCount
            maxLength="200"
          ></nr-input>
        </div>
      </div>
      
      <div>
        <h3>Different Input Types with Count</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            type="email" 
            label="Email (30 chars max)" 
            placeholder="Enter email"
            value="user@example.com"
            showCount
            maxLength="30"
          ></nr-input>
          
          <nr-input 
            type="url" 
            label="Website URL (100 chars max)" 
            placeholder="Enter website URL"
            value="https://www.example-website.com"
            showCount
            maxLength="100"
          ></nr-input>
          
          <nr-input 
            type="search" 
            label="Search Query (50 chars max)" 
            placeholder="Search products..."
            value="laptop computers"
            showCount
            maxLength="50"
          ></nr-input>
        </div>
      </div>
      
      <div>
        <h3>Combined Features</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            type="text" 
            label="Count + Clear + Copy" 
            placeholder="All features combined"
            value="Text with multiple features"
            showCount
            maxLength="40"
            allowClear
            withCopy
          ></nr-input>
          
          <nr-input 
            type="text" 
            label="Count + Prefix/Suffix" 
            placeholder="Username"
            value="johndoe"
            showCount
            maxLength="15"
          >
            <span slot="prefix">@</span>
            <span slot="suffix">.com</span>
          </nr-input>
        </div>
      </div>
    </div>
  `,
};

export const InputVariants: Story = {
  name: 'Input Variants',
  render: () => html`
    <div style="max-width: 600px; padding: 20px;">
      <h3 style="margin-bottom: 20px; color: #333;">Input Variants</h3>
      
      <!-- Outlined Variant -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: #666;">Outlined (Full Border)</h4>
        <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
          <nr-input
            variant="outlined"
            label="Outlined Input"
            placeholder="Enter text..."
            style="flex: 1; min-width: 200px;"
          ></nr-input>
          <nr-input
            variant="outlined"
            label="With Prefix"
            placeholder="Enter username"
            style="flex: 1; min-width: 200px;"
          >
            <span slot="prefix">@</span>
          </nr-input>
          <nr-input
            variant="outlined"
            label="Error State"
            placeholder="Enter text..."
            state="error"
            helper-text="This field is required"
            style="flex: 1; min-width: 200px;"
          ></nr-input>
        </div>
      </div>

      <!-- Filled Variant -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: #666;">Filled (Background + Bottom Border)</h4>
        <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
          <nr-input
            variant="filled"
            label="Filled Input"
            placeholder="Enter text..."
            style="flex: 1; min-width: 200px;"
          ></nr-input>
          <nr-input
            variant="filled"
            label="With Suffix"
            placeholder="Enter amount"
            style="flex: 1; min-width: 200px;"
          >
            <span slot="suffix">USD</span>
          </nr-input>
          <nr-input
            variant="filled"
            label="Warning State"
            placeholder="Enter text..."
            state="warning"
            helper-text="Please check your input"
            style="flex: 1; min-width: 200px;"
          ></nr-input>
        </div>
      </div>

      <!-- Borderless Variant -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: #666;">Borderless (Focus Outline Only)</h4>
        <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
          <nr-input
            variant="borderless"
            label="Borderless Input"
            placeholder="Enter text..."
            style="flex: 1; min-width: 200px;"
          ></nr-input>
          <nr-input
            variant="borderless"
            label="With Clear"
            placeholder="Enter text..."
            value="Sample text"
            allow-clear
            style="flex: 1; min-width: 200px;"
          ></nr-input>
          <nr-input
            variant="borderless"
            label="Disabled"
            placeholder="Enter text..."
            disabled
            style="flex: 1; min-width: 200px;"
          ></nr-input>
        </div>
      </div>

      <!-- Underlined Variant (Default) -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: #666;">Underlined (Bottom Border Only)</h4>
        <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
          <nr-input
            variant="underlined"
            label="Underlined Input"
            placeholder="Enter text..."
            style="flex: 1; min-width: 200px;"
          ></nr-input>
          <nr-input
            variant="underlined"
            label="With Character Count"
            placeholder="Enter text..."
            show-count
            max-length="50"
            style="flex: 1; min-width: 200px;"
          ></nr-input>
          <nr-input
            variant="underlined"
            label="Password Type"
            type="password"
            placeholder="Enter password..."
            style="flex: 1; min-width: 200px;"
          ></nr-input>
        </div>
      </div>

      <!-- Size Variations with Different Variants -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: #666;">Size Variations Across Variants</h4>
        
        <!-- Small Size -->
        <div style="margin-bottom: 15px;">
          <p style="margin-bottom: 10px; font-weight: 500;">Small Size:</p>
          <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
            <nr-input
              variant="outlined"
              size="small"
              label="Small Outlined"
              placeholder="Small..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
            <nr-input
              variant="filled"
              size="small"
              label="Small Filled"
              placeholder="Small..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
            <nr-input
              variant="borderless"
              size="small"
              label="Small Borderless"
              placeholder="Small..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
            <nr-input
              variant="underlined"
              size="small"
              label="Small Underlined"
              placeholder="Small..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
          </div>
        </div>

        <!-- Large Size -->
        <div style="margin-bottom: 15px;">
          <p style="margin-bottom: 10px; font-weight: 500;">Large Size:</p>
          <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
            <nr-input
              variant="outlined"
              size="large"
              label="Large Outlined"
              placeholder="Large..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
            <nr-input
              variant="filled"
              size="large"
              label="Large Filled"
              placeholder="Large..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
            <nr-input
              variant="borderless"
              size="large"
              label="Large Borderless"
              placeholder="Large..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
            <nr-input
              variant="underlined"
              size="large"
              label="Large Underlined"
              placeholder="Large..."
              style="flex: 1; min-width: 140px;"
            ></nr-input>
          </div>
        </div>
      </div>

      <!-- Combined Features -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: #666;">Combined Features</h4>
        <div style="display: flex; gap: 15px; align-items: end; flex-wrap: wrap;">
          <nr-input
            variant="outlined"
            label="Full Featured"
            placeholder="Enter username..."
            show-count
            max-length="20"
            allow-clear
            style="flex: 1; min-width: 200px;"
          >
            <span slot="prefix">@</span>
            <span slot="suffix">.com</span>
          </nr-input>
          <nr-input
            variant="filled"
            label="Addons + Count"
            placeholder="Enter amount..."
            show-count
            max-length="10"
            style="flex: 1; min-width: 200px;"
          >
            <span slot="addon-before">$</span>
            <span slot="addon-after">USD</span>
          </nr-input>
        </div>
      </div>
    </div>
  `,
};

export const FocusManagement: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Advanced focus management with cursor positioning, text selection, and programmatic focus control.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem;">
      <div>
        <h3>Focus Management Examples</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="focus-basic" 
            type="text" 
            label="Basic Focus" 
            placeholder="Click buttons to test focus"
            value="Sample text for testing"
          ></nr-input>
          
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              onclick="document.getElementById('focus-basic').focus();"
            >Focus</button>
            
            <button 
              onclick="document.getElementById('focus-basic').focus({ preventScroll: true });"
            >Focus (No Scroll)</button>
            
            <button 
              onclick="document.getElementById('focus-basic').focus({ cursor: 'start' });"
            >Focus at Start</button>
            
            <button 
              onclick="document.getElementById('focus-basic').focus({ cursor: 'end' });"
            >Focus at End</button>
            
            <button 
              onclick="document.getElementById('focus-basic').focus({ cursor: 5 });"
            >Focus at Position 5</button>
            
            <button 
              onclick="document.getElementById('focus-basic').focus({ select: true });"
            >Focus & Select All</button>
            
            <button 
              onclick="document.getElementById('focus-basic').blur();"
            >Blur</button>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Text Selection Methods</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="selection-test" 
            type="text" 
            label="Selection Test" 
            placeholder="Text selection methods"
            value="This is a sample text for selection testing"
          ></nr-input>
          
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              onclick="document.getElementById('selection-test').selectAll();"
            >Select All</button>
            
            <button 
              onclick="document.getElementById('selection-test').selectRange(5, 15);"
            >Select Range (5-15)</button>
            
            <button 
              onclick="document.getElementById('selection-test').setCursorPosition('start');"
            >Cursor to Start</button>
            
            <button 
              onclick="document.getElementById('selection-test').setCursorPosition('end');"
            >Cursor to End</button>
            
            <button 
              onclick="document.getElementById('selection-test').setCursorPosition(10);"
            >Cursor to Position 10</button>
            
            <button 
              onclick="alert('Selected: ' + document.getElementById('selection-test').getSelectedText());"
            >Get Selected Text</button>
            
            <button 
              onclick="alert('Cursor Position: ' + document.getElementById('selection-test').getCursorPosition());"
            >Get Cursor Position</button>
          </div>
            >Cursor to End</button>
            
            <button 
              @click=${() => {
                const input = document.getElementById('selection-test') as any;
                input?.setCursorPosition(10);
              }}
            >Cursor to Position 10</button>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Focus State Information</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="focus-info" 
            type="text" 
            label="Focus Info Test" 
            placeholder="Focus to see state information"
            value="Test focus state tracking"
          ></nr-input>
          
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              @click=${() => {
                const input = document.getElementById('focus-info') as any;
                const pos = input?.getCursorPosition();
                alert(`Cursor position: ${pos}`);
              }}
            >Get Cursor Position</button>
            
            <button 
              @click=${() => {
                const input = document.getElementById('focus-info') as any;
                const text = input?.getSelectedText();
                alert(`Selected text: "${text}"`);
              }}
            >Get Selected Text</button>
            
            <button 
              @click=${() => {
                const input = document.getElementById('focus-info') as any;
                const focused = input?.isFocused();
                alert(`Is focused: ${focused}`);
              }}
            >Check Focus State</button>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Advanced Focus Options</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="advanced-focus" 
            type="text" 
            label="Advanced Focus Options" 
            placeholder="Test advanced focus features"
            value="Advanced focus management testing"
          ></nr-input>
          
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              @click=${() => {
                const input = document.getElementById('advanced-focus') as any;
                input?.focus({ cursor: 'all' });
              }}
            >Focus & Select All</button>
            
            <button 
              @click=${() => {
                const input = document.getElementById('advanced-focus') as any;
                input?.blur({ restoreCursor: true });
                setTimeout(() => input?.focus(), 1000);
              }}
            >Blur & Restore (1s delay)</button>
            
            <button 
              @click=${() => {
                const input = document.getElementById('advanced-focus') as any;
                input?.focus({ 
                  preventScroll: true, 
                  cursor: 15,
                  select: false 
                });
              }}
            >Focus (No Scroll, Pos 15)</button>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Focus Events Demo</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="focus-events" 
            type="text" 
            label="Focus Events" 
            placeholder="Focus/blur to see events in console"
            value="Event tracking demo"
            @nr-focus-change=${(e: CustomEvent) => {
              console.log('Focus change event:', e.detail);
            }}
            @nr-focus=${(e: CustomEvent) => {
              console.log('Focus event:', e.detail);
            }}
            @nr-blur=${(e: CustomEvent) => {
              console.log('Blur event:', e.detail);
            }}
          ></nr-input>
          
          <p style="font-size: 0.875rem; color: #666; margin: 0;">
            Open browser console to see focus change events with cursor position and selection details.
          </p>
        </div>
      </div>
    </div>
  `,
};

export const AdvancedValidation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Advanced validation features including custom validators, async validation, and cross-field validation.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 800px;">
      <h3>Advanced Validation Examples</h3>
      
      <!-- Custom Validation Rules -->
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
        <h4>Custom Validation Rules</h4>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="credit-card-input"
            type="text" 
            label="Credit Card Number" 
            placeholder="1234 5678 9012 3456"
            validation-trigger="change"
            help-text="Enter a valid credit card number - validation happens as you type"
            .rules=${[
              { required: true, message: 'Please input your credit card number!' },
              { 
                pattern: /^[0-9\s-]{13,19}$/, 
                message: 'Credit card number must be 13-19 digits' 
              },
              {
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  
                  // Remove spaces and hyphens
                  const cleaned = value.replace(/[\s-]/g, '');
                  
                  // Check if it's all digits
                  if (!/^\d+$/.test(cleaned)) {
                    return Promise.reject(new Error('Credit card number must contain only digits'));
                  }
                  
                  // Check length
                  if (cleaned.length < 13 || cleaned.length > 19) {
                    return Promise.reject(new Error('Credit card number must be 13-19 digits'));
                  }
                  
                  // Luhn algorithm check
                  let sum = 0;
                  let isEven = false;
                  for (let i = cleaned.length - 1; i >= 0; i--) {
                    let digit = parseInt(cleaned[i]);
                    if (isEven) {
                      digit *= 2;
                      if (digit > 9) digit -= 9;
                    }
                    sum += digit;
                    isEven = !isEven;
                  }
                  
                  if (sum % 10 !== 0) {
                    return Promise.reject(new Error('Invalid credit card number'));
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          ></nr-input>
          
          <nr-input 
            id="zip-code-input"
            type="text" 
            label="ZIP Code" 
            placeholder="12345 or 12345-6789"
            validation-trigger="blur"
            help-text="Enter a valid US ZIP code"
            .rules=${[
              { required: true, message: 'Please input your ZIP code!' },
              { 
                pattern: /^\d{5}(-\d{4})?$/, 
                message: 'ZIP code must be in format 12345 or 12345-6789' 
              }
            ]}
          ></nr-input>
          
          <nr-input 
            id="hex-color-input"
            type="text" 
            label="Hex Color" 
            placeholder="#FF0000 or #f00"
            .rules=${[
              { required: true, message: 'Please input a hex color!' },
              { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: 'Color must be in hex format (#FF0000 or #f00)!' }
            ]}
            validation-trigger="change"
            help-text="Enter a valid hex color code - validation happens as you type"
          ></nr-input>
        </div>
      </div>
      
      <!-- $ Validation -->
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
        <h4>Async Validation (Simulated API Calls)</h4>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="username-async"
            type="text" 
            label="Username Availability" 
            placeholder="Check username availability"
            has-feedback
            .rules=${[
              { required: true, message: 'Please input your username!' },
              { 
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                      const takenUsernames = ['admin', 'user', 'test', 'demo', 'guest'];
                      if (takenUsernames.includes(value.toLowerCase())) {
                        reject(new Error('Username is already taken'));
                      } else {
                        resolve();
                      }
                    }, 1000);
                  });
                }
              }
            ]}
            validation-trigger="change"
            validation-debounce="500"
            help-text="We'll check if this username is available (try: admin, user, test) - validates while typing with 500ms debounce. Watch for spinner!"
          ></nr-input>
          
          <nr-input 
            id="domain-async"
            type="text" 
            label="Domain Validation" 
            placeholder="example.com"
            has-feedback
            .rules=${[
              { required: true, message: 'Please input a domain!' },
              { 
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                      const validDomains = ['google.com', 'github.com', 'stackoverflow.com', 'example.com'];
                      if (validDomains.includes(value.toLowerCase())) {
                        resolve();
                      } else {
                        reject(new Error('Domain does not exist or is unreachable'));
                      }
                    }, 800);
                  });
                }
              }
            ]}
            validation-trigger="change"
            validation-debounce="300"
            help-text="We'll validate if the domain exists (try: google.com, invalid-domain-123.xyz) - validates while typing with 300ms debounce. Watch for spinner!"
          ></nr-input>
        </div>
      </div>
      
      <!-- Cross-field Validation -->
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
        <h4>Cross-field Validation</h4>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <nr-input 
            id="start-date"
            type="date" 
            label="Start Date" 
            .rules=${[
              { required: true, message: 'Please select a start date!' }
            ]}
            validation-trigger="change"
            help-text="Select a start date"
          ></nr-input>
          
          <nr-input 
            id="end-date"
            type="date" 
            label="End Date" 
            .rules=${[
              { required: true, message: 'Please select an end date!' },
              { 
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  const startDateElement = document.getElementById('start-date') as any;
                  const startDate = startDateElement?.value;
                  if (startDate && new Date(value) <= new Date(startDate)) {
                    return Promise.reject(new Error('End date must be after start date'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            validation-trigger="change"
            help-text="End date must be after start date"
          ></nr-input>
          
          <nr-input 
            id="new-password"
            type="password" 
            label="New Password" 
            placeholder="Enter new password"
            .rules=${[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              { 
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  const checks = [
                    { test: /[A-Z]/.test(value), message: 'uppercase letter' },
                    { test: /[a-z]/.test(value), message: 'lowercase letter' },
                    { test: /\d/.test(value), message: 'number' },
                    { test: /[!@#$%^&*(),.?":{}|<>]/.test(value), message: 'special character' }
                  ];
                  const failed = checks.filter(check => !check.test);
                  if (failed.length > 0) {
                    return Promise.reject(new Error(`Missing: ${failed.map(f => f.message).join(', ')}`));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            validation-trigger="change"
            help-text="Password requirements: 8+ chars, uppercase, lowercase, number, special char"
          ></nr-input>
          
          <nr-input 
            id="confirm-new-password"
            type="password" 
            label="Confirm New Password" 
            placeholder="Confirm new password"
            .rules=${[
              { required: true, message: 'Please confirm your password!' },
              { 
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  const newPasswordElement = document.getElementById('new-password') as any;
                  const newPassword = newPasswordElement?.value;
                  if (value !== newPassword) {
                    return Promise.reject(new Error('Passwords do not match'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            validation-trigger="blur"
            help-text="Must match the new password"
          ></nr-input>
        </div>
      </div>
      
      <!-- Dynamic Validation Rules -->
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
        <h4>Dynamic Validation Rules</h4>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <label>Validation Mode:</label>
            <select id="validation-mode" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
              <option value="basic">Basic (required only)</option>
              <option value="strict">Strict (length + format)</option>
              <option value="enterprise">Enterprise (all rules)</option>
            </select>
          </div>
          
          <nr-input 
            id="dynamic-input"
            type="text" 
            label="Dynamic Validation Input" 
            placeholder="Validation rules change based on mode"
            .rules=${[
              { required: true, message: 'This field is required!' }
            ]}
            validation-trigger="change"
            help-text="Change validation mode above to see different rules"
          ></nr-input>
        </div>
      </div>
    </div>
  `,
};

export const ValidationPerformance: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Performance testing for validation with multiple fields using declarative rules.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; max-width: 600px;">
      <h3>Validation Performance Test</h3>
      <p style="font-size: 0.875rem; color: #666;">
        This form contains 20 fields with complex validation rules to test performance using declarative rules approach.
      </p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        ${Array.from({ length: 20 }, (_, i) => html`
          <nr-input 
            id="perf-input-${i}"
            type="text" 
            label="Field ${i + 1}" 
            placeholder="Enter value for field ${i + 1}"
            .rules=${[
              { required: true, message: 'This field is required!' },
              { min: 3, max: 50, message: 'Must be 3-50 characters!' },
              { pattern: /^[a-zA-Z0-9\s]+$/, message: 'Only letters, numbers and spaces allowed!' },
              { 
                validator: (rule: any, value: any) => {
                  if (!value) return Promise.resolve();
                  if (value.includes('test')) {
                    return Promise.reject(new Error('Cannot contain the word "test"'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            validation-trigger="change"
          ></nr-input>
        `)}
      </div>
      
      <div style="margin-top: 1rem; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
        <h4>Performance Info</h4>
        <p style="font-size: 0.875rem; color: #666;">
          All validation is handled declaratively through the rules property. 
          Each field has multiple validation rules including required, length, pattern, and custom validator.
        </p>
      </div>
    </div>
  `,
};

export const CustomIconColors: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 500px;">
      <h3>Icon Color Customization</h3>
      
      <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h4>Global Icon Color Override</h4>
        <nr-input 
          type="password"
          placeholder="Custom icon colors"
          value="example123"
          with-clear
          with-copy
          style="--nuraly-color-input-icon: #9c27b0; --nuraly-size-input-icon: 20px;"
        ></nr-input>
        <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
          All icons are purple (20px) using: <code>--nuraly-color-input-icon: #9c27b0</code>
        </p>
      </div>

      <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h4>Specific Icon Type Colors</h4>
        <nr-input 
          type="text"
          placeholder="Error input with custom colors"
          state="error"
          value="Invalid value"
          with-clear
          style="
            --nuraly-color-input-error-icon: #ff5722; 
            --nuraly-color-input-clear-icon: #4caf50;
            --nuraly-size-input-icon: 18px;
          "
        ></nr-input>
        <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
          Error icon is orange, clear icon is green using specific CSS variables
        </p>
      </div>

      <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h4>Number Input with Custom Icon Colors</h4>
        <nr-input 
          type="number"
          placeholder="Number with custom increment icons"
          value="42"
          style="--nuraly-color-input-number-icons: #2196f3;"
        ></nr-input>
        <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
          Number increment/decrement icons are blue using: <code>--nuraly-color-input-number-icons: #2196f3</code>
        </p>
      </div>

      <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h4>Interactive State Colors</h4>
        <nr-input 
          type="password"
          placeholder="Hover/active custom colors"
          value="interactive"
          style="
            --nuraly-color-input-icon: #795548;
            --nuraly-color-input-icon-hover: #ff9800;
            --nuraly-color-input-icon-active: #f44336;
          "
        ></nr-input>
        <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
          Brown default, orange on hover, red on active - try interacting with the password toggle icon
        </p>
      </div>

      <div style="padding: 1rem; background-color: #f5f5f5; border-radius: 8px;">
        <h4>Available CSS Variables</h4>
        <ul style="font-size: 0.875rem; color: #444; margin: 0.5rem 0;">
          <li><code>--nuraly-color-input-icon</code> - All icons</li>
          <li><code>--nuraly-size-input-icon</code> - Icon size</li>
          <li><code>--nuraly-color-input-error-icon</code> - Error state icons</li>
          <li><code>--nuraly-color-input-warning-icon</code> - Warning state icons</li>
          <li><code>--nuraly-color-input-password-icon</code> - Password toggle</li>
          <li><code>--nuraly-color-input-clear-icon</code> - Clear button</li>
          <li><code>--nuraly-color-input-copy-icon</code> - Copy button</li>
          <li><code>--nuraly-color-input-number-icons</code> - Number increment/decrement</li>
          <li><code>--nuraly-color-input-calendar-icon</code> - Calendar icons</li>
        </ul>
      </div>
    </div>
  `,
};
