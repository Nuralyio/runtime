import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';
// Import the built components
import './index.js';
import '../button/index.js';
import '../icon/index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

const meta: Meta = {
  title: 'Data Entry/Radio',
  component: 'nr-radio',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: { type: 'object' },
      description: 'Array of radio button options',
    },
    value: {
      control: { type: 'text' },
      description: 'Currently selected value',
    },
    type: {
      control: { type: 'select' },
      options: ['default', 'button'],
      description: 'Radio group display type',
    },
    position: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of radio buttons relative to labels',
    },
    direction: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of radio group',
    },
  },
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ],
    value: 'option1',
    type: 'default',
    position: 'left',
    direction: 'vertical',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    options: [
      { value: 'default1', label: 'First Option' },
      { value: 'default2', label: 'Second Option' },
      { value: 'default3', label: 'Third Option' }
    ],
    value: 'default1',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('change')}"
    ></nr-radio>
  `,
};

export const HorizontalLayout: Story = {
  args: {
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ],
    value: 'medium',
    direction: 'horizontal',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('horizontal-change')}"
    ></nr-radio>
  `,
};

export const RightPosition: Story = {
  args: {
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'maybe', label: 'Maybe' }
    ],
    value: 'no',
    position: 'right',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('right-position-change')}"
    ></nr-radio>
  `,
};

export const ButtonStyle: Story = {
  args: {
    options: [
      { value: 'left', label: 'Left', icon: 'align-left' },
      { value: 'center', label: 'Center', icon: 'align-center' },
      { value: 'right', label: 'Right', icon: 'align-right' }
    ],
    value: 'center',
    type: 'button',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('button-change')}"
    ></nr-radio>
  `,
};

export const InteractiveExample: Story = {
  args: {
    options: [
      { value: 'option1', label: 'First Choice' },
      { value: 'option2', label: 'Second Choice' },
      { value: 'option3', label: 'Third Choice' }
    ],
    value: 'option1',
  },
  render: (args) => html`
    <div>
      <h3>Interactive Radio Example</h3>
      <p>Click on options and check the Actions tab to see events:</p>
      <nr-radio
        .options="${args.options}"
        value="${args.value}"
        type="${args.type}"
        position="${args.position}"
        direction="${args.direction}"
        @change="${action('interactive-change')}"
      ></nr-radio>
      <div style="
        margin-top: 16px; 
        padding: 12px; 
        background: #f4f4f4; 
        border-left: 4px solid #0f62fe;
        font-weight: bold;
      ">
        Check the <strong>Actions</strong> tab in Storybook to see the change events!
      </div>
    </div>
  `,
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { value: 'enabled1', label: 'Enabled Option' },
      { value: 'disabled1', label: 'Disabled Option', disabled: true },
      { value: 'enabled2', label: 'Another Enabled Option' }
    ],
    value: 'enabled1',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('disabled-options-change')}"
    ></nr-radio>
  `,
};

export const WithValidationStates: Story = {
  args: {
    options: [
      { value: 'valid', label: 'Valid Option' },
      { 
        value: 'error', 
        label: 'Option with Error', 
        state: 'error', 
        message: 'This option has an error message' 
      },
      { 
        value: 'warning', 
        label: 'Option with Warning', 
        state: 'warning', 
        message: 'This option has a warning message' 
      }
    ],
    value: 'valid',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('validation-change')}"
    ></nr-radio>
  `,
};

export const HorizontalButtonGroup: Story = {
  args: {
    options: [
      { value: 'view', label: 'View', icon: 'eye' },
      { value: 'edit', label: 'Edit', icon: 'edit' },
      { value: 'delete', label: 'Delete', icon: 'trash' }
    ],
    value: 'view',
    type: 'button',
    direction: 'horizontal',
  },
  render: (args) => html`
    <nr-radio
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${(e: CustomEvent) => console.log('Radio changed:', e.detail)}"
    ></nr-radio>
  `,
};

export const LongOptionsList: Story = {
  args: {
    options: [
      { value: 'option1', label: 'First Option with a very long description' },
      { value: 'option2', label: 'Second Option' },
      { value: 'option3', label: 'Third Option' },
      { value: 'option4', label: 'Fourth Option with some additional text' },
      { value: 'option5', label: 'Fifth Option' }
    ],
    value: 'option3',
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-radio
        .options="${args.options}"
        value="${args.value}"
        type="${args.type}"
        position="${args.position}"
        direction="${args.direction}"
        @change="${(e: CustomEvent) => console.log('Radio changed:', e.detail)}"
      ></nr-radio>
    </div>
  `,
};

export const ThemeVariations: Story = {
  render: () => html`
    <div style="display: flex; gap: 40px; align-items: flex-start;">
      <div>
        <h3>Light Theme</h3>
        <nr-radio
          .options="${[
            { value: 'light1', label: 'Option 1' },
            { value: 'light2', label: 'Option 2' },
            { value: 'light3', label: 'Option 3' }
          ]}"
          default-value="light1"
          @change="${(e: CustomEvent) => console.log('Light theme radio changed:', e.detail)}"
        ></nr-radio>
      </div>
      
      <div data-theme="dark" style="background: #1a1a1a; padding: 20px; border-radius: 8px;">
        <h3 style="color: white; margin-top: 0;">Dark Theme</h3>
        <nr-radio
          .options="${[
            { value: 'dark1', label: 'Option 1' },
            { value: 'dark2', label: 'Option 2' },
            { value: 'dark3', label: 'Option 3' }
          ]}"
          default-value="dark2"
          @change="${(e: CustomEvent) => console.log('Dark theme radio changed:', e.detail)}"
        ></nr-radio>
      </div>
    </div>
  `,
};

export const Interactive: Story = {
  render: () => html`
    <div>
      <style>
        .demo-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
        }
        .result {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          font-family: monospace;
        }
        .form-section {
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        }
        .form-section h4 {
          margin-top: 0;
        }
      </style>
      <div class="demo-container">
        <div class="form-section">
          <h4>User Preferences</h4>
          <label>Theme Preference:</label>
          <nr-radio
            id="theme-radio"
            .options="${[
              { value: 'auto', label: 'Auto (System)' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' }
            ]}"
            default-value="auto"
            direction="horizontal"
            @change="${(e: CustomEvent) => {
              const result = document.getElementById('theme-result');
              if (result) result.textContent = JSON.stringify(e.detail, null, 2);
            }}"
          ></nr-radio>
          <div id="theme-result" class="result">No selection yet</div>
        </div>

        <div class="form-section">
          <h4>Notification Settings</h4>
          <label>Notification Frequency:</label>
          <nr-radio
            id="notification-radio"
            .options="${[
              { value: 'realtime', label: 'Real-time' },
              { value: 'daily', label: 'Daily Summary' },
              { value: 'weekly', label: 'Weekly Summary' },
              { value: 'never', label: 'Never' }
            ]}"
            default-value="daily"
            @change="${(e: CustomEvent) => {
              const result = document.getElementById('notification-result');
              if (result) result.textContent = JSON.stringify(e.detail, null, 2);
            }}"
          ></nr-radio>
          <div id="notification-result" class="result">No selection yet</div>
        </div>

        <div class="form-section">
          <h4>Button Style Actions</h4>
          <label>Choose Action:</label>
          <nr-radio
            id="action-radio"
            .options="${[
              { value: 'save', label: 'Save', icon: 'save' },
              { value: 'export', label: 'Export', icon: 'download' },
              { value: 'share', label: 'Share', icon: 'share' }
            ]}"
            default-value="save"
            type="button"
            @change="${(e: CustomEvent) => {
              const result = document.getElementById('action-result');
              if (result) result.textContent = JSON.stringify(e.detail, null, 2);
            }}"
          ></nr-radio>
          <div id="action-result" class="result">No selection yet</div>
        </div>
      </div>
    </div>
  `,
};

export const WithSlots: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Radio buttons can use slots for custom HTML content in each option. This allows for rich content like icons, images, formatting, and complex layouts within radio options.'
      }
    }
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 30px; max-width: 800px;">
      <div>
        <h3>Custom HTML Content with Slots</h3>
        <p>Each radio option can contain custom HTML content using slots:</p>
        
        <!-- Basic HTML content slots -->
        <nr-radio
          .options="${[
            { value: 'basic1', label: '' },
            { value: 'basic2', label: '' },
            { value: 'basic3', label: '' }
          ]}"
          value="basic1"
          type="slot"
          @change="${action('slot-basic-change')}"
        >
          <div slot="basic1">
            <strong>Premium Plan</strong><br>
            <small style="color: #666;">$29/month - All features included</small>
          </div>
          <div slot="basic2">
            <strong>Standard Plan</strong><br>
            <small style="color: #666;">$19/month - Core features</small>
          </div>
          <div slot="basic3">
            <strong>Basic Plan</strong><br>
            <small style="color: #666;">$9/month - Essential features</small>
          </div>
        </nr-radio>
      </div>

      <div>
        <h3>Rich Content with Icons and Badges</h3>
        <nr-radio
          .options="${[
            { value: 'pro', label: '' },
            { value: 'team', label: '' },
            { value: 'enterprise', label: '' }
          ]}"
          value="pro"
          type="slot"
          @change="${action('slot-rich-change')}"
        >
          <div slot="pro" style="display: flex; align-items: center; gap: 12px; padding: 8px;">
            <hy-icon name="user" style="--nuraly-icon-color: #1677ff;"></hy-icon>
            <div>
              <div style="font-weight: 600;">Professional</div>
              <div style="font-size: 12px; color: #666;">Perfect for freelancers</div>
            </div>
            <span style="background: #e6f7ff; color: #1677ff; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: auto;">POPULAR</span>
          </div>
          <div slot="team" style="display: flex; align-items: center; gap: 12px; padding: 8px;">
            <hy-icon name="users" style="--nuraly-icon-color: #52c41a;"></hy-icon>
            <div>
              <div style="font-weight: 600;">Team</div>
              <div style="font-size: 12px; color: #666;">Great for small teams</div>
            </div>
          </div>
          <div slot="enterprise" style="display: flex; align-items: center; gap: 12px; padding: 8px;">
            <hy-icon name="building" style="--nuraly-icon-color: #722ed1;"></hy-icon>
            <div>
              <div style="font-weight: 600;">Enterprise</div>
              <div style="font-size: 12px; color: #666;">For large organizations</div>
            </div>
            <span style="background: #f9f0ff; color: #722ed1; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: auto;">CUSTOM</span>
          </div>
        </nr-radio>
      </div>

      <div>
        <h3>Complex Layout Example</h3>
        <nr-radio
          .options="${[
            { value: 'starter', label: '' },
            { value: 'growth', label: '' },
            { value: 'scale', label: '' }
          ]}"
          value="growth"
          type="slot"
          @change="${action('slot-complex-change')}"
        >
          <div slot="starter" style="border: 2px solid #d9d9d9; border-radius: 8px; padding: 16px; margin: 4px 0;">
            <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
              <h4 style="margin: 0; color: #1677ff;">Starter</h4>
              <div style="font-size: 24px; font-weight: bold; margin-left: auto;">$0</div>
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 14px; color: #666;">
              <li>Up to 3 projects</li>
              <li>Basic analytics</li>
              <li>Community support</li>
            </ul>
          </div>
          <div slot="growth" style="border: 2px solid #1677ff; border-radius: 8px; padding: 16px; margin: 4px 0; position: relative;">
            <div style="position: absolute; top: -10px; right: 16px; background: #1677ff; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">RECOMMENDED</div>
            <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
              <h4 style="margin: 0; color: #1677ff;">Growth</h4>
              <div style="font-size: 24px; font-weight: bold; margin-left: auto;">$29</div>
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 14px; color: #666;">
              <li>Unlimited projects</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>Custom integrations</li>
            </ul>
          </div>
          <div slot="scale" style="border: 2px solid #d9d9d9; border-radius: 8px; padding: 16px; margin: 4px 0;">
            <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
              <h4 style="margin: 0; color: #1677ff;">Scale</h4>
              <div style="font-size: 24px; font-weight: bold; margin-left: auto;">$99</div>
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 14px; color: #666;">
              <li>Everything in Growth</li>
              <li>White-label solution</li>
              <li>Dedicated support</li>
              <li>Custom development</li>
            </ul>
          </div>
        </nr-radio>
      </div>
    </div>
  `,
};