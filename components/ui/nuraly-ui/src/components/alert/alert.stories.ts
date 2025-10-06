/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';
import '../button/index.js';
import type { NrAlertElement } from './alert.component.js';
import { AlertType } from './alert.types.js';
/**
 * ## Alert
 * 
 * Alert component displays important messages to users in a prominent way. Similar to Ant Design's alert,
 * it supports different severity levels and can include descriptions, icons, and close functionality.
 * 
 * ### When to use
 * - To display important information that requires user attention
 * - To show feedback about system status or user actions
 * - To communicate warnings, errors, or success messages
 * - To display banner notifications across the top of a page
 * 
 * ### When not to use
 * - For temporary feedback messages (use Toast instead)
 * - For critical actions that require user confirmation (use Modal instead)
 * - For inline form validation (use Input validation states instead)
 * 
 * ### Types
 * - **Success**: Indicates successful or positive information
 * - **Info**: Displays general informational messages
 * - **Warning**: Shows warning messages that need attention
 * - **Error**: Displays error or critical messages
 */
const meta: Meta<NrAlertElement> = {
  title: 'Feedback/Alert',
  component: 'nr-alert',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Alert component for displaying important messages with different severity levels, icons, and closable functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Alert message text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    type: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: 'Alert type/variant',
      table: {
        type: { summary: 'AlertType' },
        defaultValue: { summary: 'info' },
      },
    },
    description: {
      control: 'text',
      description: 'Optional description text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    closable: {
      control: 'boolean',
      description: 'Whether the alert can be closed',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show icon',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    icon: {
      control: 'text',
      description: 'Custom icon name',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    banner: {
      control: 'boolean',
      description: 'Banner mode - full width with no border radius',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<NrAlertElement>;

/**
 * Basic alert with different types
 */
export const Basic: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert message="Success message" type="success"></nr-alert>
      <nr-alert message="Info message" type="info"></nr-alert>
      <nr-alert message="Warning message" type="warning"></nr-alert>
      <nr-alert message="Error message" type="error"></nr-alert>
    </div>
  `,
};

/**
 * Alerts with icons
 */
export const WithIcon: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert message="Success Tips" type="success" show-icon></nr-alert>
      <nr-alert message="Informational Notes" type="info" show-icon></nr-alert>
      <nr-alert message="Warning" type="warning" show-icon></nr-alert>
      <nr-alert message="Error" type="error" show-icon></nr-alert>
    </div>
  `,
};

/**
 * Closable alerts
 */
export const Closable: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert 
        message="Success message that can be dismissed" 
        type="success" 
        closable
        show-icon
      ></nr-alert>
      <nr-alert 
        message="Info message that can be dismissed" 
        type="info" 
        closable
        show-icon
      ></nr-alert>
      <nr-alert 
        message="Warning message that can be dismissed" 
        type="warning" 
        closable
        show-icon
      ></nr-alert>
      <nr-alert 
        message="Error message that can be dismissed" 
        type="error" 
        closable
        show-icon
      ></nr-alert>
    </div>
  `,
};

/**
 * Alerts with description
 */
export const WithDescription: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert 
        message="Success Text"
        description="Success Description Success Description Success Description"
        type="success"
        show-icon
      ></nr-alert>
      <nr-alert 
        message="Info Text"
        description="Info Description Info Description Info Description"
        type="info"
        show-icon
      ></nr-alert>
      <nr-alert 
        message="Warning Text"
        description="Warning Description Warning Description Warning Description"
        type="warning"
        show-icon
      ></nr-alert>
      <nr-alert 
        message="Error Text"
        description="Error Description Error Description Error Description"
        type="error"
        show-icon
      ></nr-alert>
    </div>
  `,
};

/**
 * Alerts with description and closable
 */
export const WithDescriptionClosable: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert 
        message="Success Text"
        description="Success Description Success Description Success Description"
        type="success"
        show-icon
        closable
      ></nr-alert>
      <nr-alert 
        message="Info Text"
        description="Info Description Info Description Info Description"
        type="info"
        show-icon
        closable
      ></nr-alert>
      <nr-alert 
        message="Warning Text"
        description="Warning Description Warning Description Warning Description"
        type="warning"
        show-icon
        closable
      ></nr-alert>
      <nr-alert 
        message="Error Text"
        description="Error Description Error Description Error Description"
        type="error"
        show-icon
        closable
      ></nr-alert>
    </div>
  `,
};

/**
 * Banner style alerts
 */
export const Banner: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert 
        message="Warning: This is a warning notice about copywriting." 
        type="warning"
        banner
      ></nr-alert>
      <nr-alert 
        message="Error: This is an error notice about copywriting." 
        type="error"
        banner
      ></nr-alert>
      <nr-alert 
        message="Info: This is an info notice about copywriting." 
        type="info"
        banner
      ></nr-alert>
      <nr-alert 
        message="Success: This is a success notice about copywriting." 
        type="success"
        banner
      ></nr-alert>
    </div>
  `,
};

/**
 * Custom icon
 */
export const CustomIcon: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert 
        message="Success message with custom icon" 
        type="success" 
        show-icon
        icon="smile"
      ></nr-alert>
      <nr-alert 
        message="Info message with custom icon" 
        type="info" 
        show-icon
        icon="bell"
      ></nr-alert>
    </div>
  `,
};

/**
 * With action buttons using slots
 */
export const WithAction: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert 
        message="Success Tips"
        description="Detailed description and advice about successful copywriting."
        type="success"
        show-icon
        closable
      >
        <div slot="action" style="margin-left: 16px;">
          <nr-button size="small" type="primary">Accept</nr-button>
        </div>
      </nr-alert>
      
      <nr-alert 
        message="Error Text"
        description="This is an error message about copywriting."
        type="error"
        show-icon
      >
        <div slot="action" style="margin-left: 16px; display: flex; gap: 8px;">
          <nr-button size="small" type="danger">Retry</nr-button>
          <nr-button size="small" type="default">Cancel</nr-button>
        </div>
      </nr-alert>
    </div>
  `,
};

/**
 * Custom content using default slot
 */
export const CustomContent: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-alert type="success" show-icon closable>
        <div>
          <strong>Success Tips</strong>
          <p style="margin: 8px 0 0 0;">
            This is a custom content alert. You can put any HTML content here.
          </p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      </nr-alert>
      
      <nr-alert type="info" show-icon>
        <div>
          <h4 style="margin: 0 0 8px 0;">Information</h4>
          <p style="margin: 0;">
            You can customize the entire content of the alert using the default slot.
            This gives you full control over the layout and styling.
          </p>
        </div>
      </nr-alert>
    </div>
  `,
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    message: 'This is an alert message',
    type: AlertType.Info,
    description: '',
    closable: false,
    showIcon: true,
    icon: '',
    banner: false,
  },
  render: (args) => html`
    <nr-alert
      message=${args.message}
      type=${args.type}
      description=${args.description || ''}
      ?closable=${args.closable}
      ?show-icon=${args.showIcon}
      icon=${args.icon || ''}
      ?banner=${args.banner}
    ></nr-alert>
  `,
};

/**
 * Real-world examples
 */
export const RealWorldExamples: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <section>
        <h3>Form Submission Success</h3>
        <nr-alert 
          message="Your changes have been saved successfully!"
          type="success"
          show-icon
          closable
        ></nr-alert>
      </section>

      <section>
        <h3>System Notification</h3>
        <nr-alert 
          message="System Maintenance Scheduled"
          description="The system will be under maintenance from 2:00 AM to 4:00 AM on Sunday. Some features may be temporarily unavailable during this time."
          type="info"
          show-icon
          banner
        ></nr-alert>
      </section>

      <section>
        <h3>Account Security Warning</h3>
        <nr-alert 
          message="Unusual Login Activity Detected"
          description="We detected a login from a new device in New York. If this wasn't you, please secure your account immediately."
          type="warning"
          show-icon
          closable
        >
          <div slot="action" style="margin-left: 16px;">
            <nr-button size="small" type="primary">Review Activity</nr-button>
          </div>
        </nr-alert>
      </section>

      <section>
        <h3>Payment Error</h3>
        <nr-alert 
          message="Payment Failed"
          description="Your payment could not be processed. Please verify your payment information and try again."
          type="error"
          show-icon
          closable
        >
          <div slot="action" style="margin-left: 16px; display: flex; gap: 8px;">
            <nr-button size="small" type="danger">Update Payment</nr-button>
            <nr-button size="small" type="default">Contact Support</nr-button>
          </div>
        </nr-alert>
      </section>

      <section>
        <h3>Cookie Consent</h3>
        <nr-alert 
          message="We use cookies"
          description="This website uses cookies to enhance the user experience and analyze site usage. By continuing to browse, you agree to our use of cookies."
          type="info"
          show-icon
        >
          <div slot="action" style="margin-left: 16px; display: flex; gap: 8px;">
            <nr-button size="small" type="primary">Accept</nr-button>
            <nr-button size="small" type="default">Learn More</nr-button>
          </div>
        </nr-alert>
      </section>
    </div>
  `,
};
