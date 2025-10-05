/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';
import type { NrToastElement } from './toast.component.js';
import { ToastType } from './toast.types.js';

/**
 * ## Toast
 * 
 * Toast notifications are lightweight messages that appear temporarily to provide feedback about
 * an operation. They're non-intrusive and don't require user interaction to dismiss.
 * 
 * ### When to use
 * - To provide feedback about an action (success, error, warning)
 * - To show brief informational messages
 * - To confirm that an action has been completed
 * - To notify users of system events
 * 
 * ### When not to use
 * - For critical information that requires user action (use Modal instead)
 * - For permanent messages (use Alert instead)
 * - For complex messages that need detailed explanation
 * 
 * ### Types
 * - **Success**: Confirms successful completion of an action
 * - **Error**: Alerts users to errors or failures
 * - **Warning**: Warns users about potential issues
 * - **Info**: Provides general information
 * - **Default**: Neutral messages
 */
const meta: Meta = {
  title: 'Feedback/Toast',
  component: 'nr-toast',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Toast notifications provide brief, temporary feedback about operations. They appear at configurable positions on the screen and automatically dismiss after a set duration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Positioning
    position: {
      control: { type: 'select' },
      options: ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'],
      description: 'Position of the toast container on screen',
      table: {
        category: 'Layout',
        defaultValue: { summary: 'top-right' },
      },
    },
    
    // Behavior
    maxToasts: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of toasts to display simultaneously',
      table: {
        category: 'Behavior',
        defaultValue: { summary: '5' },
      },
    },
    defaultDuration: {
      control: { type: 'number', min: 1000, max: 10000, step: 1000 },
      description: 'Default duration in milliseconds before auto-dismiss',
      table: {
        category: 'Behavior',
        defaultValue: { summary: '5000' },
      },
    },
    animation: {
      control: { type: 'select' },
      options: ['fade', 'slide', 'bounce'],
      description: 'Animation style for toasts',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'fade' },
      },
    },
    stack: {
      control: { type: 'boolean' },
      description: 'Whether to stack multiple toasts or replace the current one',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },
    autoDismiss: {
      control: { type: 'boolean' },
      description: 'Auto dismiss toasts after duration (default: true)',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Default toast with basic configuration
 */
export const Default: Story = {
  args: {
    position: 'top-right',
    maxToasts: 5,
    defaultDuration: 5000,
    animation: 'fade',
    stack: true,
    autoDismiss: true,
  },
  render: (args) => html`
    <div style="padding: 2rem;">
      <nr-toast 
        id="toast-default"
        position=${args.position}
        max-toasts=${args.maxToasts}
        default-duration=${args.defaultDuration}
        animation=${args.animation}
        ?stack=${args.stack}
      ></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-default') as NrToastElement;
          toast?.show('This is a default toast message');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer;"
      >
        Show Toast
      </button>
    </div>
  `,
};

/**
 * Success toast for positive feedback
 */
export const Success: Story = {
  args: {
    position: 'top-right',
  },
  render: (args) => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-success" position=${args.position}></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-success') as NrToastElement;
          toast?.success('Operation completed successfully!');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #24a148; color: white; border: none; border-radius: 4px;"
      >
        Show Success
      </button>
    </div>
  `,
};

/**
 * Error toast for error messages
 */
export const Error: Story = {
  args: {
    position: 'top-right',
  },
  render: (args) => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-error" position=${args.position}></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-error') as NrToastElement;
          toast?.error('An error occurred. Please try again.');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #da1e28; color: white; border: none; border-radius: 4px;"
      >
        Show Error
      </button>
    </div>
  `,
};

/**
 * Warning toast for cautionary messages
 */
export const Warning: Story = {
  args: {
    position: 'top-right',
  },
  render: (args) => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-warning" position=${args.position}></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-warning') as NrToastElement;
          toast?.warning('Please review your changes before submitting.');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #f1c21b; color: #000; border: none; border-radius: 4px;"
      >
        Show Warning
      </button>
    </div>
  `,
};

/**
 * Info toast for informational messages
 */
export const Info: Story = {
  args: {
    position: 'top-right',
  },
  render: (args) => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-info" position=${args.position}></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-info') as NrToastElement;
          toast?.info('New features are now available!');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #0043ce; color: white; border: none; border-radius: 4px;"
      >
        Show Info
      </button>
    </div>
  `,
};

/**
 * All toast types showcase
 */
export const AllTypes: Story = {
  args: {
    position: 'top-right',
  },
  render: (args) => html`
    <div style="padding: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
      <nr-toast id="toast-all" position=${args.position}></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-all') as NrToastElement;
          toast?.show('Default message');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer;"
      >
        Default
      </button>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-all') as NrToastElement;
          toast?.success('Success message');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #24a148; color: white; border: none; border-radius: 4px;"
      >
        Success
      </button>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-all') as NrToastElement;
          toast?.error('Error message');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #da1e28; color: white; border: none; border-radius: 4px;"
      >
        Error
      </button>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-all') as NrToastElement;
          toast?.warning('Warning message');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #f1c21b; color: #000; border: none; border-radius: 4px;"
      >
        Warning
      </button>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-all') as NrToastElement;
          toast?.info('Info message');
        }}
        style="padding: 0.5rem 1rem; cursor: pointer; background: #0043ce; color: white; border: none; border-radius: 4px;"
      >
        Info
      </button>
    </div>
  `,
};

/**
 * Different positions showcase
 */
export const Positions: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-top-left" position="top-left"></nr-toast>
      <nr-toast id="toast-top-center" position="top-center"></nr-toast>
      <nr-toast id="toast-top-right" position="top-right"></nr-toast>
      <nr-toast id="toast-bottom-left" position="bottom-left"></nr-toast>
      <nr-toast id="toast-bottom-center" position="bottom-center"></nr-toast>
      <nr-toast id="toast-bottom-right" position="bottom-right"></nr-toast>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 600px;">
        <button 
          @click=${() => (document.getElementById('toast-top-left') as NrToastElement)?.show('Top Left')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Top Left
        </button>
        <button 
          @click=${() => (document.getElementById('toast-top-center') as NrToastElement)?.show('Top Center')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Top Center
        </button>
        <button 
          @click=${() => (document.getElementById('toast-top-right') as NrToastElement)?.show('Top Right')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Top Right
        </button>
        <button 
          @click=${() => (document.getElementById('toast-bottom-left') as NrToastElement)?.show('Bottom Left')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Bottom Left
        </button>
        <button 
          @click=${() => (document.getElementById('toast-bottom-center') as NrToastElement)?.show('Bottom Center')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Bottom Center
        </button>
        <button 
          @click=${() => (document.getElementById('toast-bottom-right') as NrToastElement)?.show('Bottom Right')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Bottom Right
        </button>
      </div>
    </div>
  `,
};

/**
 * Different animations showcase
 */
export const Animations: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-fade" position="top-left" animation="fade"></nr-toast>
      <nr-toast id="toast-slide" position="top-center" animation="slide"></nr-toast>
      <nr-toast id="toast-bounce" position="top-right" animation="bounce"></nr-toast>
      
      <div style="display: flex; gap: 1rem;">
        <button 
          @click=${() => (document.getElementById('toast-fade') as NrToastElement)?.success('Fade animation')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Fade Animation
        </button>
        <button 
          @click=${() => (document.getElementById('toast-slide') as NrToastElement)?.success('Slide animation')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Slide Animation
        </button>
        <button 
          @click=${() => (document.getElementById('toast-bounce') as NrToastElement)?.success('Bounce animation')}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Bounce Animation
        </button>
      </div>
    </div>
  `,
};

/**
 * Custom configuration with callbacks
 */
export const CustomConfiguration: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-custom"></nr-toast>
      
      <button 
        @click=${() => {
          const toast = document.getElementById('toast-custom') as NrToastElement;
          toast?.show({
            text: 'Custom toast with click handler',
            type: ToastType.Info,
            duration: 7000,
            closable: true,
            icon: 'star',
            onClick: () => alert('Toast clicked!'),
            onClose: () => console.log('Toast closed')
          });
        }}
        style="padding: 0.5rem 1rem; cursor: pointer;"
      >
        Show Custom Toast
      </button>
    </div>
  `,
};

/**
 * Stacking behavior demonstration
 */
export const Stacking: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-stack" max-toasts="3" stack></nr-toast>
      
      <div style="display: flex; gap: 1rem;">
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-stack') as NrToastElement;
            for (let i = 1; i <= 5; i++) {
              setTimeout(() => {
                toast?.show(`Toast #${i}`);
              }, i * 500);
            }
          }}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Show Multiple Toasts
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-stack') as NrToastElement;
            toast?.clearAll();
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #da1e28; color: white; border: none; border-radius: 4px;"
        >
          Clear All
        </button>
      </div>
      
      <p style="margin-top: 1rem; color: #666;">
        Max 3 toasts shown at once. Older toasts are removed when limit is reached.
      </p>
    </div>
  `,
};

/**
 * Auto-dismiss behavior demonstration
 */
export const AutoDismiss: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-auto" auto-dismiss></nr-toast>
      <nr-toast id="toast-manual" auto-dismiss="false"></nr-toast>
      
      <div style="display: flex; gap: 1rem; flex-direction: column; max-width: 600px;">
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Auto-Dismiss Enabled (Default)</h3>
          <p style="margin: 0 0 1rem 0; color: #666;">
            Toasts will automatically close after 5 seconds
          </p>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-auto') as NrToastElement;
              toast?.success('This toast will auto-dismiss in 5 seconds');
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Auto-Dismiss Toast
          </button>
        </div>
        
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Auto-Dismiss Disabled</h3>
          <p style="margin: 0 0 1rem 0; color: #666;">
            Toasts must be manually closed with the close button
          </p>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-manual') as NrToastElement;
              toast?.info('This toast requires manual closing');
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Manual Close Toast
          </button>
        </div>
        
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Per-Toast Control</h3>
          <p style="margin: 0 0 1rem 0; color: #666;">
            Override container setting for individual toasts
          </p>
          <div style="display: flex; gap: 0.5rem;">
            <button 
              @click=${() => {
                const toast = document.getElementById('toast-auto') as NrToastElement;
                toast?.show({ 
                  text: 'This toast will NOT auto-dismiss',
                  type: ToastType.Warning,
                  autoDismiss: false
                });
              }}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Disable for One Toast
            </button>
            <button 
              @click=${() => {
                const toast = document.getElementById('toast-manual') as NrToastElement;
                toast?.show({ 
                  text: 'This toast WILL auto-dismiss',
                  type: ToastType.Success,
                  autoDismiss: true,
                  duration: 3000
                });
              }}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Enable for One Toast
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * React.js Usage Example
 */
export const ReactUsage: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { NrToast } from '@nuralyui/toast/react';
import { useRef } from 'react';
function App() {
  const toastRef = useRef(null);
  const showToast = () => {
    toastRef.current?.success('Success message!');
  };
  return (
    <div>
      <button onClick={showToast}>Show Toast</button>
      <NrToast 
        ref={toastRef}
        position="top-right"
        maxToasts={5}
        onNrToastShow={(e) => console.log('Toast shown:', e.detail)}
      />
    </div>
  );
}`,
        language: 'jsx',
      },
    },
  },
  render: () => html`
    <div style="padding: 2rem;">
      <p>See the code example in the docs panel.</p>
    </div>
  `,
};
