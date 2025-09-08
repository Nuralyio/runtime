import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/icon/index.js';
import '../../dist/components/input/index.js';

const meta: Meta = {
  title: 'Components/Input',
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

export const WarningState: Story = {
  args: {
    state: 'warning',
    label: 'Warning Input',
    placeholder: 'This input has a warning',
    value: 'Check this value',
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
        <hy-icon slot="prefix" name="search"></hy-icon>
        <hy-icon slot="suffix" name="close"></hy-icon>
      </nr-input>

      <!-- Email with icon -->
      <nr-input type="email" label="Email" placeholder="Enter your email">
        <hy-icon slot="prefix" name="envelope"></hy-icon>
      </nr-input>

      <!-- Password with lock icon -->
      <nr-input type="password" label="Password" placeholder="Enter password">
        <hy-icon slot="prefix" name="lock"></hy-icon>
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
          <hy-icon name="search"></hy-icon>
          <span>Find:</span>
        </div>
        <button slot="addon-after" style="border: none; background: #0f62fe; color: white; padding: 4px 8px; cursor: pointer;">Go</button>
      </nr-input>
    </div>
  `,
};

export const AllStates: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 500px;">
      <h3>Input States</h3>
      <nr-input state="default" label="Default State" placeholder="Default input" value="Normal text"></nr-input>
      <nr-input state="error" label="Error State" placeholder="Error input" value="Invalid email format"></nr-input>
      <nr-input state="warning" label="Warning State" placeholder="Warning input" value="Password might be weak"></nr-input>
      
      <h3>Combined States</h3>
      <nr-input state="error" label="Error + Required" placeholder="Required field" required></nr-input>
      <nr-input state="warning" label="Warning + Disabled" placeholder="Disabled field" disabled></nr-input>
      <nr-input state="default" label="Default + Copy" value="Text to copy" withCopy></nr-input>
    </div>
  `,
};

export const FormWithValidation: Story = {
  render: () => html`
    <form style="display: flex; flex-direction: column; gap: 1rem; width: 500px; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;">
      <h3>Form with Validation States</h3>
      <nr-input type="text" label="Full Name" placeholder="Enter your full name" required state="default"></nr-input>
      <nr-input type="email" label="Email" placeholder="Enter your email" value="invalid-email" state="error" required></nr-input>
      <nr-input type="password" label="Password" placeholder="Create a password" value="123" state="warning" required></nr-input>
      <nr-input type="tel" label="Phone" placeholder="Enter your phone number" value="+1 (555) 123-4567" state="default" withCopy></nr-input>
      <nr-input type="number" label="Age" placeholder="Your age" min="18" max="120" state="default"></nr-input>
    </form>
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
