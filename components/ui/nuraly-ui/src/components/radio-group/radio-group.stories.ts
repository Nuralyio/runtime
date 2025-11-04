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
    <nr-radio-group
      .options="${args.options}"
      value="${args.value}"
      type="${args.type}"
      position="${args.position}"
      direction="${args.direction}"
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