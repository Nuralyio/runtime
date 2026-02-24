import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';
// Import the built components
import './index.js';
import '../button/index.js';
import '../icon/index.js';

const meta: Meta = {
  title: 'Data Entry/Radio Group',
  component: 'nr-radio-group',
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
    autoWidth: {
      control: { type: 'boolean' },
      description: 'Remove minimum width from button-type radio groups',
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
    autoWidth: false,
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      ?auto-width="${args.autoWidth}"
      @change="${action('change')}"
    ></nr-radio-group>
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('horizontal-change')}"
    ></nr-radio-group>
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('right-position-change')}"
    ></nr-radio-group>
  `,
};

/**
 * ## Radio Group Sizes
 * 
 * Radio groups support three sizes: small, medium (default), and large.
 * The size affects both the radio buttons and their labels for consistent scaling.
 */
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive comparison of radio group sizes in different layouts and styles. Small, Medium (default), and Large sizes adapt to both default and button styles.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <!-- Default Style - All Sizes -->
      <div>
        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.125rem; font-weight: 600;">Default Style</h3>
        
        <!-- Small -->
        <div style="margin-bottom: 2rem;">
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Small</h4>
          <div style="display: flex; gap: 3rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Vertical</p>
              <nr-radio-group
                size="small"
                direction="vertical"
                .options="${[
                  { value: 'small-v1', label: 'Option 1' },
                  { value: 'small-v2', label: 'Option 2' },
                  { value: 'small-v3', label: 'Option 3' }
                ]}"
                value="small-v1"
                @change="${action('small-vertical-change')}"
              ></nr-radio-group>
            </div>
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Horizontal</p>
              <nr-radio-group
                size="small"
                direction="horizontal"
                .options="${[
                  { value: 'small-h1', label: 'Option 1' },
                  { value: 'small-h2', label: 'Option 2' },
                  { value: 'small-h3', label: 'Option 3' }
                ]}"
                value="small-h1"
                @change="${action('small-horizontal-change')}"
              ></nr-radio-group>
            </div>
          </div>
          <p style="font-size: 0.875rem; color: #6f6f6f; margin-top: 12px;">
            Use in compact layouts or when space is limited
          </p>
        </div>

        <!-- Medium -->
        <div style="margin-bottom: 2rem;">
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Medium (Default)</h4>
          <div style="display: flex; gap: 3rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Vertical</p>
              <nr-radio-group
                size="medium"
                direction="vertical"
                .options="${[
                  { value: 'medium-v1', label: 'Option 1' },
                  { value: 'medium-v2', label: 'Option 2' },
                  { value: 'medium-v3', label: 'Option 3' }
                ]}"
                value="medium-v1"
                @change="${action('medium-vertical-change')}"
              ></nr-radio-group>
            </div>
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Horizontal</p>
              <nr-radio-group
                size="medium"
                direction="horizontal"
                .options="${[
                  { value: 'medium-h1', label: 'Option 1' },
                  { value: 'medium-h2', label: 'Option 2' },
                  { value: 'medium-h3', label: 'Option 3' }
                ]}"
                value="medium-h1"
                @change="${action('medium-horizontal-change')}"
              ></nr-radio-group>
            </div>
          </div>
          <p style="font-size: 0.875rem; color: #6f6f6f; margin-top: 12px;">
            Default size - most common for forms and standard interfaces
          </p>
        </div>

        <!-- Large -->
        <div>
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Large</h4>
          <div style="display: flex; gap: 3rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Vertical</p>
              <nr-radio-group
                size="large"
                direction="vertical"
                .options="${[
                  { value: 'large-v1', label: 'Option 1' },
                  { value: 'large-v2', label: 'Option 2' },
                  { value: 'large-v3', label: 'Option 3' }
                ]}"
                value="large-v1"
                @change="${action('large-vertical-change')}"
              ></nr-radio-group>
            </div>
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Horizontal</p>
              <nr-radio-group
                size="large"
                direction="horizontal"
                .options="${[
                  { value: 'large-h1', label: 'Option 1' },
                  { value: 'large-h2', label: 'Option 2' },
                  { value: 'large-h3', label: 'Option 3' }
                ]}"
                value="large-h1"
                @change="${action('large-horizontal-change')}"
              ></nr-radio-group>
            </div>
          </div>
          <p style="font-size: 0.875rem; color: #6f6f6f; margin-top: 12px;">
            Use for mobile interfaces, touch screens, or when radio groups need more prominence
          </p>
        </div>
      </div>

      <!-- Button Style - All Sizes -->
      <div>
        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.125rem; font-weight: 600;">Button Style</h3>
        
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <!-- Small -->
          <div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Small</h4>
            <nr-radio-group
              size="small"
              type="button"
              direction="horizontal"
              .options="${[
                { value: 'btn-small-1', label: 'Left', icon: 'align-left' },
                { value: 'btn-small-2', label: 'Center', icon: 'align-center' },
                { value: 'btn-small-3', label: 'Right', icon: 'align-right' }
              ]}"
              value="btn-small-2"
              @change="${action('button-small-change')}"
            ></nr-radio-group>
          </div>

          <!-- Medium -->
          <div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Medium (Default)</h4>
            <nr-radio-group
              size="medium"
              type="button"
              direction="horizontal"
              .options="${[
                { value: 'btn-medium-1', label: 'Left', icon: 'align-left' },
                { value: 'btn-medium-2', label: 'Center', icon: 'align-center' },
                { value: 'btn-medium-3', label: 'Right', icon: 'align-right' }
              ]}"
              value="btn-medium-2"
              @change="${action('button-medium-change')}"
            ></nr-radio-group>
          </div>

          <!-- Large -->
          <div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Large</h4>
            <nr-radio-group
              size="large"
              type="button"
              direction="horizontal"
              .options="${[
                { value: 'btn-large-1', label: 'Left', icon: 'align-left' },
                { value: 'btn-large-2', label: 'Center', icon: 'align-center' },
                { value: 'btn-large-3', label: 'Right', icon: 'align-right' }
              ]}"
              value="btn-large-2"
              @change="${action('button-large-change')}"
            ></nr-radio-group>
          </div>
        </div>
      </div>

      <!-- Side-by-Side Comparison -->
      <div>
        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.125rem; font-weight: 600;">Side-by-Side Comparison</h3>
        <div style="display: flex; gap: 3rem; align-items: flex-start;">
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 500;">Small</p>
            <nr-radio-group
              size="small"
              direction="vertical"
              .options="${[
                { value: 'compare-s1', label: 'Option 1' },
                { value: 'compare-s2', label: 'Option 2' }
              ]}"
              value="compare-s1"
            ></nr-radio-group>
          </div>
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 500;">Medium</p>
            <nr-radio-group
              size="medium"
              direction="vertical"
              .options="${[
                { value: 'compare-m1', label: 'Option 1' },
                { value: 'compare-m2', label: 'Option 2' }
              ]}"
              value="compare-m1"
            ></nr-radio-group>
          </div>
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 500;">Large</p>
            <nr-radio-group
              size="large"
              direction="vertical"
              .options="${[
                { value: 'compare-l1', label: 'Option 1' },
                { value: 'compare-l2', label: 'Option 2' }
              ]}"
              value="compare-l1"
            ></nr-radio-group>
          </div>
        </div>
      </div>
    </div>
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('button-change')}"
    ></nr-radio-group>
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
      <nr-radio-group
        .options="${args.options}"
        value="${args.value}"
        type="${args.type}"
        position="${args.position}"
        direction="${args.direction}"
        @change="${action('interactive-change')}"
      ></nr-radio-group>
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('disabled-options-change')}"
    ></nr-radio-group>
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${action('validation-change')}"
    ></nr-radio-group>
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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
      @change="${(e: CustomEvent) => console.log('Radio changed:', e.detail)}"
    ></nr-radio-group>
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
      <nr-radio-group
        .options="${args.options}"
        value="${args.value}"
        type="${args.type}"
        position="${args.position}"
        direction="${args.direction}"
        @change="${(e: CustomEvent) => console.log('Radio changed:', e.detail)}"
      ></nr-radio-group>
    </div>
  `,
};

export const ThemeVariations: Story = {
  render: () => html`
    <div style="display: flex; gap: 40px; align-items: flex-start;">
      <div>
        <h3>Light Theme</h3>
        <nr-radio-group
          .options="${[
            { value: 'light1', label: 'Option 1' },
            { value: 'light2', label: 'Option 2' },
            { value: 'light3', label: 'Option 3' }
          ]}"
          default-value="light1"
          @change="${(e: CustomEvent) => console.log('Light theme radio changed:', e.detail)}"
        ></nr-radio-group>
      </div>
      
      <div data-theme="dark" style="background: #1a1a1a; padding: 20px; border-radius: 8px;">
        <h3 style="color: white; margin-top: 0;">Dark Theme</h3>
        <nr-radio-group
          .options="${[
            { value: 'dark1', label: 'Option 1' },
            { value: 'dark2', label: 'Option 2' },
            { value: 'dark3', label: 'Option 3' }
          ]}"
          default-value="dark2"
          @change="${(e: CustomEvent) => console.log('Dark theme radio changed:', e.detail)}"
        ></nr-radio-group>
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
          <nr-radio-group
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
          ></nr-radio-group>
          <div id="theme-result" class="result">No selection yet</div>
        </div>

        <div class="form-section">
          <h4>Notification Settings</h4>
          <label>Notification Frequency:</label>
          <nr-radio-group
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
          ></nr-radio-group>
          <div id="notification-result" class="result">No selection yet</div>
        </div>

        <div class="form-section">
          <h4>Button Style Actions</h4>
          <label>Choose Action:</label>
          <nr-radio-group
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
          ></nr-radio-group>
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
        <nr-radio-group
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
        </nr-radio-group>
      </div>

      <div>
        <h3>Rich Content with Icons and Badges</h3>
        <nr-radio-group
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
            <nr-icon name="user" style="--nuraly-icon-color: #1677ff;"></nr-icon>
            <div>
              <div style="font-weight: 600;">Professional</div>
              <div style="font-size: 12px; color: #666;">Perfect for freelancers</div>
            </div>
            <span style="background: #e6f7ff; color: #1677ff; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: auto;">POPULAR</span>
          </div>
          <div slot="team" style="display: flex; align-items: center; gap: 12px; padding: 8px;">
            <nr-icon name="users" style="--nuraly-icon-color: #52c41a;"></nr-icon>
            <div>
              <div style="font-weight: 600;">Team</div>
              <div style="font-size: 12px; color: #666;">Great for small teams</div>
            </div>
          </div>
          <div slot="enterprise" style="display: flex; align-items: center; gap: 12px; padding: 8px;">
            <nr-icon name="building" style="--nuraly-icon-color: #722ed1;"></nr-icon>
            <div>
              <div style="font-weight: 600;">Enterprise</div>
              <div style="font-size: 12px; color: #666;">For large organizations</div>
            </div>
            <span style="background: #f9f0ff; color: #722ed1; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: auto;">CUSTOM</span>
          </div>
        </nr-radio-group>
      </div>

      <div>
        <h3>Complex Layout Example</h3>
        <nr-radio-group
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
        </nr-radio-group>
      </div>
    </div>
  `,
};

/**
 * ## Auto Width Buttons
 * 
 * By default, button-type radio groups have a minimum width for consistent sizing.
 * You can use the `auto-width` attribute to make buttons size to their content.
 */
export const AutoWidth: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Comparison of default button sizing vs auto-width sizing. Auto-width is useful when you have buttons with varying text lengths and want them to be sized optimally.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <!-- Default Button Width -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Default Min-Width (5rem)</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Buttons have consistent minimum widths for better visual alignment
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          value="no"
          .options="${[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'definitely-not', label: 'Definitely Not' }
          ]}"
          @change="${action('default-width-change')}"
        ></nr-radio-group>
      </div>

      <!-- Auto Width -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Auto Width</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Buttons size to their content for optimal space usage
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          value="no"
          auto-width
          .options="${[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'definitely-not', label: 'Definitely Not' }
          ]}"
          @change="${action('auto-width-change')}"
        ></nr-radio-group>
      </div>

      <!-- Different Sizes Comparison -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Size Comparison with Auto Width</h3>
        
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Small</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              size="small"
              value="sm"
              auto-width
              .options="${[
                { value: 'xs', label: 'XS' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' }
              ]}"
              @change="${action('small-auto-width-change')}"
            ></nr-radio-group>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Medium</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              size="medium"
              value="sm"
              auto-width
              .options="${[
                { value: 'xs', label: 'XS' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' }
              ]}"
              @change="${action('medium-auto-width-change')}"
            ></nr-radio-group>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Large</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              size="large"
              value="sm"
              auto-width
              .options="${[
                { value: 'xs', label: 'XS' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' }
              ]}"
              @change="${action('large-auto-width-change')}"
            ></nr-radio-group>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * ## Auto Width User Stories
 * 
 * Real-world scenarios where auto-width provides better user experience and visual design.
 */
export const AutoWidthUserStories: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Collection of common use cases where auto-width radio groups provide better UX and visual design than fixed-width buttons.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 4rem;">
      
      <!-- User Story 1: Yes/No Questions -->
      <div style="padding: 2rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-weight: 600;">📋 User Story 1: Survey Yes/No Questions</h3>
        <p style="margin: 0 0 1.5rem 0; color: #374151; line-height: 1.6;">
          <strong>As a</strong> survey designer<br>
          <strong>I want</strong> compact Yes/No buttons that don't waste space<br>
          <strong>So that</strong> I can fit more questions on screen and reduce scrolling
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600;">Do you enjoy using this component library?</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              auto-width
              value="yes"
              .options="${[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ]}"
              @change="${action('survey-1-change')}"
            ></nr-radio-group>
          </div>
          
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600;">Would you recommend it to others?</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              auto-width
              value="definitely"
              .options="${[
                { value: 'definitely', label: 'Definitely' },
                { value: 'probably', label: 'Probably' },
                { value: 'maybe', label: 'Maybe' },
                { value: 'no', label: 'No' }
              ]}"
              @change="${action('survey-2-change')}"
            ></nr-radio-group>
          </div>
        </div>
      </div>

      <!-- User Story 2: Size Selector -->
      <div style="padding: 2rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-weight: 600;">👕 User Story 2: E-commerce Size Selector</h3>
        <p style="margin: 0 0 1.5rem 0; color: #374151; line-height: 1.6;">
          <strong>As an</strong> e-commerce customer<br>
          <strong>I want</strong> size buttons that are clearly readable but not overly wide<br>
          <strong>So that</strong> I can quickly scan and select my size without visual clutter
        </p>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Select Size:</h4>
          <nr-radio-group
            type="button"
            direction="horizontal"
            auto-width
            value="m"
            .options="${[
              { value: 'xs', label: 'XS' },
              { value: 's', label: 'S' },
              { value: 'm', label: 'M' },
              { value: 'l', label: 'L' },
              { value: 'xl', label: 'XL' },
              { value: 'xxl', label: 'XXL' }
            ]}"
            @change="${action('size-selector-change')}"
          ></nr-radio-group>
        </div>
      </div>

      <!-- User Story 3: Rating Scale -->
      <div style="padding: 2rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-weight: 600;">⭐ User Story 3: Compact Rating Scale</h3>
        <p style="margin: 0 0 1.5rem 0; color: #374151; line-height: 1.6;">
          <strong>As a</strong> UX researcher<br>
          <strong>I want</strong> a horizontal rating scale that doesn't dominate the form<br>
          <strong>So that</strong> users focus on the question content rather than large buttons
        </p>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">How satisfied are you with our service?</h4>
          <nr-radio-group
            type="button"
            direction="horizontal"
            auto-width
            value="4"
            .options="${[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' }
            ]}"
            @change="${action('rating-change')}"
          ></nr-radio-group>
          <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">
            <span>Very Unsatisfied</span>
            <span>Very Satisfied</span>
          </div>
        </div>
      </div>

      <!-- User Story 4: Navigation Filters -->
      <div style="padding: 2rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-weight: 600;">🔍 User Story 4: Content Filter Navigation</h3>
        <p style="margin: 0 0 1.5rem 0; color: #374151; line-height: 1.6;">
          <strong>As a</strong> content manager<br>
          <strong>I want</strong> filter buttons that adapt to their labels<br>
          <strong>So that</strong> the interface looks clean regardless of text length variations
        </p>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Filter by Status:</h4>
          <nr-radio-group
            type="button"
            direction="horizontal"
            auto-width
            value="published"
            .options="${[
              { value: 'all', label: 'All' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
              { value: 'pending-review', label: 'Pending Review' }
            ]}"
            @change="${action('filter-change')}"
          ></nr-radio-group>
        </div>
      </div>

      <!-- User Story 5: Payment Method -->
      <div style="padding: 2rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-weight: 600;">💳 User Story 5: Payment Method Selection</h3>
        <p style="margin: 0 0 1.5rem 0; color: #374151; line-height: 1.6;">
          <strong>As a</strong> checkout flow designer<br>
          <strong>I want</strong> payment method buttons to be proportional to their labels<br>
          <strong>So that</strong> the checkout process feels streamlined and professional
        </p>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Choose Payment Method:</h4>
          <nr-radio-group
            type="button"
            direction="horizontal"
            auto-width
            value="card"
            .options="${[
              { value: 'card', label: 'Card' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'apple-pay', label: 'Apple Pay' },
              { value: 'bank', label: 'Bank Transfer' }
            ]}"
            @change="${action('payment-change')}"
          ></nr-radio-group>
        </div>
      </div>

      <!-- User Story 6: Dashboard Time Range -->
      <div style="padding: 2rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-weight: 600;">📊 User Story 6: Dashboard Time Range Selector</h3>
        <p style="margin: 0 0 1.5rem 0; color: #374151; line-height: 1.6;">
          <strong>As a</strong> dashboard user<br>
          <strong>I want</strong> time range buttons that don't take up excessive header space<br>
          <strong>So that</strong> more screen real estate is available for data visualization
        </p>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Time Range:</h4>
          <nr-radio-group
            type="button"
            direction="horizontal"
            auto-width
            value="7d"
            .options="${[
              { value: '1d', label: '1D' },
              { value: '7d', label: '7D' },
              { value: '30d', label: '30D' },
              { value: '90d', label: '90D' },
              { value: '1y', label: '1Y' },
              { value: 'all', label: 'All Time' }
            ]}"
            @change="${action('timerange-change')}"
          ></nr-radio-group>
        </div>
      </div>

      <!-- Summary Box -->
      <div style="padding: 2rem; border: 2px solid #dbeafe; border-radius: 8px; background: #eff6ff;">
        <h3 style="margin: 0 0 1rem 0; color: #1d4ed8; font-weight: 600;">💡 When to Use Auto-Width</h3>
        <ul style="margin: 0; padding-left: 1.5rem; color: #374151; line-height: 1.6;">
          <li><strong>Short labels:</strong> Yes/No, numbers, abbreviations (XS, S, M, L)</li>
          <li><strong>Mixed lengths:</strong> When some options are short and others longer</li>
          <li><strong>Space constraints:</strong> Mobile interfaces, compact dashboards, sidebars</li>
          <li><strong>Visual hierarchy:</strong> When buttons shouldn't dominate the layout</li>
          <li><strong>Form efficiency:</strong> Surveys, filters, quick selectors</li>
        </ul>
        
        <h3 style="margin: 2rem 0 1rem 0; color: #1d4ed8; font-weight: 600;">⚠️ When to Keep Default Width</h3>
        <ul style="margin: 0; padding-left: 1.5rem; color: #374151; line-height: 1.6;">
          <li><strong>Consistent alignment:</strong> When visual uniformity is important</li>
          <li><strong>Touch targets:</strong> Mobile apps where larger buttons improve usability</li>
          <li><strong>Similar length labels:</strong> When all options are roughly the same length</li>
          <li><strong>Emphasis:</strong> When buttons should be prominent UI elements</li>
        </ul>
      </div>
    </div>
  `,
};

/**
 * ## Auto Width Icon-Only Groups
 * 
 * Icon-only radio groups with auto-width for compact toolbars and action buttons.
 */
export const AutoWidthIconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Icon-only radio groups with auto-width are perfect for toolbars, formatting controls, and compact UI elements where space is at a premium.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      
      <!-- Text Alignment Toolbar -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Text Alignment Toolbar</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Compact icon-only buttons for text alignment controls
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          auto-width
          value="left"
          .options="${[
            { value: 'left', label: '', icon: 'align-left' },
            { value: 'center', label: '', icon: 'align-center' },
            { value: 'right', label: '', icon: 'align-right' },
            { value: 'justify', label: '', icon: 'align-justify' }
          ]}"
          @change="${action('text-align-change')}"
        ></nr-radio-group>
      </div>

      <!-- View Mode Selector -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">View Mode Selector</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Switch between different view modes using only icons
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          auto-width
          value="grid"
          .options="${[
            { value: 'list', label: '', icon: 'list' },
            { value: 'grid', label: '', icon: 'grid' },
            { value: 'card', label: '', icon: 'card' },
            { value: 'table', label: '', icon: 'table' }
          ]}"
          @change="${action('view-mode-change')}"
        ></nr-radio-group>
      </div>

      <!-- Media Controls -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Media Controls</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Playback controls with auto-width for optimal spacing
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          auto-width
          value="play"
          .options="${[
            { value: 'previous', label: '', icon: 'skip-back' },
            { value: 'play', label: '', icon: 'play' },
            { value: 'pause', label: '', icon: 'pause' },
            { value: 'next', label: '', icon: 'skip-forward' }
          ]}"
          @change="${action('media-controls-change')}"
        ></nr-radio-group>
      </div>

      <!-- Size Comparison: Different Sizes -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Size Variations</h3>
        
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Small</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              size="small"
              auto-width
              value="bold"
              .options="${[
                { value: 'bold', label: '', icon: 'bold' },
                { value: 'italic', label: '', icon: 'italic' },
                { value: 'underline', label: '', icon: 'underline' },
                { value: 'strikethrough', label: '', icon: 'strikethrough' }
              ]}"
              @change="${action('small-format-change')}"
            ></nr-radio-group>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Medium</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              size="medium"
              auto-width
              value="bold"
              .options="${[
                { value: 'bold', label: '', icon: 'bold' },
                { value: 'italic', label: '', icon: 'italic' },
                { value: 'underline', label: '', icon: 'underline' },
                { value: 'strikethrough', label: '', icon: 'strikethrough' }
              ]}"
              @change="${action('medium-format-change')}"
            ></nr-radio-group>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Large</h4>
            <nr-radio-group
              type="button"
              direction="horizontal"
              size="large"
              auto-width
              value="bold"
              .options="${[
                { value: 'bold', label: '', icon: 'bold' },
                { value: 'italic', label: '', icon: 'italic' },
                { value: 'underline', label: '', icon: 'underline' },
                { value: 'strikethrough', label: '', icon: 'strikethrough' }
              ]}"
              @change="${action('large-format-change')}"
            ></nr-radio-group>
          </div>
        </div>
      </div>

      <!-- Chart Type Selector -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Chart Type Selector</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Select chart types using visual icons only
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          auto-width
          value="bar-chart"
          .options="${[
            { value: 'bar-chart', label: '', icon: 'bar-chart' },
            { value: 'line-chart', label: '', icon: 'line-chart' },
            { value: 'pie-chart', label: '', icon: 'pie-chart' },
            { value: 'area-chart', label: '', icon: 'area-chart' },
            { value: 'scatter-plot', label: '', icon: 'scatter-plot' }
          ]}"
          @change="${action('chart-type-change')}"
        ></nr-radio-group>
      </div>

      <!-- Zoom Controls -->
      <div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Zoom Controls</h3>
        <p style="margin: 0 0 1rem 0; color: #6f6f6f; font-size: 0.875rem;">
          Minimal zoom control buttons with perfect spacing
        </p>
        <nr-radio-group
          type="button"
          direction="horizontal"
          auto-width
          value="100"
          .options="${[
            { value: '50', label: '', icon: 'zoom-out' },
            { value: '100', label: '', icon: 'maximize' },
            { value: 'fit', label: '', icon: 'maximize-2' },
            { value: '200', label: '', icon: 'zoom-in' }
          ]}"
          @change="${action('zoom-change')}"
        ></nr-radio-group>
      </div>

      <!-- Usage Guidelines -->
      <div style="padding: 2rem; border: 2px solid #dbeafe; border-radius: 8px; background: #eff6ff;">
        <h3 style="margin: 0 0 1rem 0; color: #1d4ed8; font-weight: 600;">💡 Icon-Only Design Guidelines</h3>
        <ul style="margin: 0; padding-left: 1.5rem; color: #374151; line-height: 1.6;">
          <li><strong>Use recognizable icons:</strong> Choose universally understood icons (play, pause, align, etc.)</li>
          <li><strong>Provide tooltips:</strong> Always include tooltip attributes for accessibility</li>
          <li><strong>Consistent icon style:</strong> Use icons from the same icon set for visual harmony</li>
          <li><strong>Appropriate sizing:</strong> Ensure icons are large enough to be easily clickable</li>
          <li><strong>Context matters:</strong> Icon-only works best in toolbars and repeated UI patterns</li>
        </ul>
        
        <h3 style="margin: 2rem 0 1rem 0; color: #1d4ed8; font-weight: 600;">🎯 Best Use Cases</h3>
        <ul style="margin: 0; padding-left: 1.5rem; color: #374151; line-height: 1.6;">
          <li><strong>Toolbars:</strong> Text formatting, drawing tools, media controls</li>
          <li><strong>View switchers:</strong> List/grid views, chart types, layout modes</li>
          <li><strong>Quick actions:</strong> Save, edit, delete, share, favorite</li>
          <li><strong>Toggle states:</strong> On/off, enabled/disabled, visible/hidden</li>
          <li><strong>Navigation:</strong> Previous/next, directional controls</li>
        </ul>
      </div>
    </div>
  `,
};