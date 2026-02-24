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
 * Interactive playground with all controls and basic usage demonstration.
 * Use the controls panel to customize position, duration, animation, and behavior.
 */
export const Playground: Story = {
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
        id="toast-playground"
        position=${args.position}
        max-toasts=${args.maxToasts}
        default-duration=${args.defaultDuration}
        animation=${args.animation}
        ?stack=${args.stack}
        ?auto-dismiss=${args.autoDismiss}
      ></nr-toast>
      
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-playground') as NrToastElement;
            toast?.show('This is a default toast message');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Default
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-playground') as NrToastElement;
            toast?.success('Operation completed successfully!');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #24a148; color: white; border: none; border-radius: 4px;"
        >
          Success
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-playground') as NrToastElement;
            toast?.error('An error occurred. Please try again.');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #da1e28; color: white; border: none; border-radius: 4px;"
        >
          Error
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-playground') as NrToastElement;
            toast?.warning('Please review your changes before submitting.');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #f1c21b; color: #000; border: none; border-radius: 4px;"
        >
          Warning
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-playground') as NrToastElement;
            toast?.info('New features are now available!');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #0043ce; color: white; border: none; border-radius: 4px;"
        >
          Info
        </button>
      </div>
    </div>
  `,
};

/**
 * All toast types and their usage patterns.
 * Demonstrates Success, Error, Warning, Info, and Default toasts with custom configurations.
 */
export const Types: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-types"></nr-toast>
      
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-types') as NrToastElement;
            toast?.show('Default message');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer;"
        >
          Default
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-types') as NrToastElement;
            toast?.success('Operation completed successfully!');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #24a148; color: white; border: none; border-radius: 4px;"
        >
          Success
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-types') as NrToastElement;
            toast?.error('An error occurred. Please try again.');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #da1e28; color: white; border: none; border-radius: 4px;"
        >
          Error
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-types') as NrToastElement;
            toast?.warning('Please review your changes before submitting.');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #f1c21b; color: #000; border: none; border-radius: 4px;"
        >
          Warning
        </button>
        
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-types') as NrToastElement;
            toast?.info('New features are now available!');
          }}
          style="padding: 0.5rem 1rem; cursor: pointer; background: #0043ce; color: white; border: none; border-radius: 4px;"
        >
          Info
        </button>
      </div>
      
      <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
        <h4 style="margin: 0 0 0.5rem 0;">Custom Configuration Example</h4>
        <button 
          @click=${() => {
            const toast = document.getElementById('toast-types') as NrToastElement;
            toast?.show({
              text: 'Custom toast with click handler and custom icon',
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
          Show Custom Configuration
        </button>
      </div>
    </div>
  `,
};

/**
 * Toast positioning options.
 * Demonstrates all 6 available positions: top and bottom with left, center, and right alignment.
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
 * Toast behavior options including stacking, auto-dismiss, and animations.
 * Demonstrates how toasts can be configured for different interaction patterns.
 */
export const Behavior: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 800px;">
        
        <!-- Animations Section -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h3 style="margin: 0 0 1rem 0;">Animations</h3>
          <nr-toast id="toast-fade" position="top-left" animation="fade"></nr-toast>
          <nr-toast id="toast-slide" position="top-center" animation="slide"></nr-toast>
          <nr-toast id="toast-bounce" position="top-right" animation="bounce"></nr-toast>
          
          <div style="display: flex; gap: 1rem;">
            <button 
              @click=${() => (document.getElementById('toast-fade') as NrToastElement)?.success('Fade animation')}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Fade
            </button>
            <button 
              @click=${() => (document.getElementById('toast-slide') as NrToastElement)?.success('Slide animation')}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Slide
            </button>
            <button 
              @click=${() => (document.getElementById('toast-bounce') as NrToastElement)?.success('Bounce animation')}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Bounce
            </button>
          </div>
        </div>
        
        <!-- Stacking Section -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h3 style="margin: 0 0 1rem 0;">Stacking (Max 3 toasts)</h3>
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
          <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">
            Older toasts are removed when limit is reached
          </p>
        </div>
        
        <!-- Auto-Dismiss Section -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h3 style="margin: 0 0 1rem 0;">Auto-Dismiss Control</h3>
          <nr-toast id="toast-auto" auto-dismiss></nr-toast>
          <nr-toast id="toast-manual" auto-dismiss="false"></nr-toast>
          
          <div style="display: flex; gap: 1rem; flex-direction: column;">
            <div style="display: flex; gap: 1rem;">
              <button 
                @click=${() => {
                  const toast = document.getElementById('toast-auto') as NrToastElement;
                  toast?.success('Auto-dismiss in 5 seconds');
                }}
                style="padding: 0.5rem 1rem; cursor: pointer;"
              >
                Auto-Dismiss Enabled
              </button>
              
              <button 
                @click=${() => {
                  const toast = document.getElementById('toast-manual') as NrToastElement;
                  toast?.info('Manual close required');
                }}
                style="padding: 0.5rem 1rem; cursor: pointer;"
              >
                Auto-Dismiss Disabled
              </button>
            </div>
            
            <div style="display: flex; gap: 1rem;">
              <button 
                @click=${() => {
                  const toast = document.getElementById('toast-auto') as NrToastElement;
                  toast?.show({ 
                    text: 'This toast will NOT auto-dismiss',
                    type: ToastType.Warning,
                    autoDismiss: false
                  });
                }}
                style="padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;"
              >
                Override: Disable for One Toast
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
                style="padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;"
              >
                Override: Enable for One Toast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Toast with action buttons using nr-button
 */
export const WithButtons: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-buttons"></nr-toast>
      
      <div style="display: flex; gap: 1rem; flex-direction: column; max-width: 600px;">
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Simple Action Button</h3>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-buttons') as NrToastElement;
              toast?.show({
                text: 'Item added to cart',
                type: ToastType.Success,
                button: {
                  label: 'View Cart',
                  type: 'primary',
                  onClick: () => alert('Navigate to cart')
                }
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Toast with Action
          </button>
        </div>
        
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Undo Action</h3>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-buttons') as NrToastElement;
              let undone = false;
              toast?.show({
                text: 'Message deleted',
                type: ToastType.Success,
                autoDismiss: false,
                button: {
                  label: 'Undo',
                  type: 'secondary',
                  onClick: (e) => {
                    if (!undone) {
                      undone = true;
                      alert('Deletion undone!');
                      const toastEl = (e.target as HTMLElement).closest('.toast');
                      const closeBtn = toastEl?.querySelector('.toast__close') as HTMLElement;
                      closeBtn?.click();
                    }
                  }
                }
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Delete with Undo
          </button>
        </div>
        
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Button with Icon</h3>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-buttons') as NrToastElement;
              toast?.show({
                text: 'Update available for your app',
                type: ToastType.Info,
                button: {
                  label: 'Refresh',
                  icon: 'refresh',
                  type: 'primary',
                  size: 'small',
                  onClick: () => alert('Refreshing app...')
                }
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Update Toast
          </button>
        </div>
        
        <div>
          <h3 style="margin: 0 0 0.5rem 0;">Different Button Types</h3>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              @click=${() => {
                const toast = document.getElementById('toast-buttons') as NrToastElement;
                toast?.show({
                  text: 'Action required',
                  button: {
                    label: 'Default Button',
                    type: 'default',
                    onClick: () => console.log('Default clicked')
                  }
                });
              }}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Default
            </button>
            <button 
              @click=${() => {
                const toast = document.getElementById('toast-buttons') as NrToastElement;
                toast?.show({
                  text: 'Confirm your action',
                  type: ToastType.Warning,
                  button: {
                    label: 'Confirm',
                    type: 'primary',
                    onClick: () => console.log('Confirmed')
                  }
                });
              }}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Primary
            </button>
            <button 
              @click=${() => {
                const toast = document.getElementById('toast-buttons') as NrToastElement;
                toast?.show({
                  text: 'This action cannot be undone',
                  type: ToastType.Error,
                  autoDismiss: false,
                  button: {
                    label: 'Delete Anyway',
                    type: 'danger',
                    onClick: () => console.log('Danger action')
                  }
                });
              }}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              Danger
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Custom HTML Content - GDPR/Cookie Consent Example
 * 
 * Toast supports custom HTML content for complex use cases like GDPR consent banners,
 * privacy notices, or any other rich content that requires custom layout and interactions.
 */
export const CustomContent: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <nr-toast id="toast-custom-content" position="bottom-center" auto-dismiss="false"></nr-toast>
      
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
        <h3 style="margin: 0;">Custom Content Examples</h3>
        
        <!-- GDPR Cookie Consent -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h4 style="margin: 0 0 0.5rem 0;">GDPR Cookie Consent</h4>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-custom-content') as NrToastElement;
              toast?.show({
                content: html`
                  <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
                    <div>
                      <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">
                        🍪 Cookie Consent
                      </h4>
                      <p style="margin: 0; font-size: 0.875rem; line-height: 1.5;">
                        We use cookies to enhance your browsing experience, serve personalized content, 
                        and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                      </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                      <nr-button 
                        size="small" 
                        type="primary"
                        @click=${() => {
                          console.log('Cookies accepted');
                          toast.clearAll();
                        }}
                      >
                        Accept All
                      </nr-button>
                      <nr-button 
                        size="small" 
                        type="secondary"
                        @click=${() => {
                          console.log('Only essential cookies');
                          toast.clearAll();
                        }}
                      >
                        Essential Only
                      </nr-button>
                      <nr-button 
                        size="small" 
                        type="tertiary"
                        @click=${() => {
                          console.log('Customize preferences');
                        }}
                      >
                        Customize
                      </nr-button>
                    </div>
                  </div>
                `,
                type: ToastType.Info,
                autoDismiss: false,
                closable: true,
                icon: '',
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show GDPR Consent
          </button>
        </div>

        <!-- Privacy Notice -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h4 style="margin: 0 0 0.5rem 0;">Privacy Notice</h4>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-custom-content') as NrToastElement;
              toast?.show({
                content: html`
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; align-items: start; gap: 0.5rem;">
                      <nr-icon name="shield-check" style="flex-shrink: 0; margin-top: 0.125rem;"></nr-icon>
                      <div>
                        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600;">
                          Privacy Policy Updated
                        </h4>
                        <p style="margin: 0; font-size: 0.813rem; line-height: 1.4; color: #525252;">
                          We've updated our privacy policy to give you more control over your data.
                        </p>
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                      <nr-button 
                        size="small" 
                        type="primary"
                        @click=${() => {
                          console.log('Review privacy policy');
                          window.open('/privacy-policy', '_blank');
                        }}
                      >
                        Review Policy
                      </nr-button>
                      <nr-button 
                        size="small" 
                        type="ghost"
                        @click=${() => {
                          console.log('Dismissed');
                          toast.clearAll();
                        }}
                      >
                        Got it
                      </nr-button>
                    </div>
                  </div>
                `,
                type: ToastType.Default,
                autoDismiss: false,
                closable: true,
                icon: '',
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Privacy Notice
          </button>
        </div>

        <!-- Marketing Consent -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h4 style="margin: 0 0 0.5rem 0;">Marketing Consent</h4>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-custom-content') as NrToastElement;
              toast?.show({
                content: html`
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div>
                      <h4 style="margin: 0 0 0.5rem 0; font-size: 0.938rem; font-weight: 600;">
                        📧 Stay Updated
                      </h4>
                      <p style="margin: 0; font-size: 0.875rem; line-height: 1.5;">
                        Get the latest updates, exclusive offers, and news delivered to your inbox.
                      </p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.813rem;">
                        <input type="checkbox" id="marketing-email" checked />
                        <span>Email newsletters</span>
                      </label>
                      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.813rem;">
                        <input type="checkbox" id="marketing-sms" />
                        <span>SMS notifications</span>
                      </label>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                      <nr-button 
                        size="small" 
                        type="primary"
                        @click=${() => {
                          const emailChecked = (document.getElementById('marketing-email') as HTMLInputElement)?.checked;
                          const smsChecked = (document.getElementById('marketing-sms') as HTMLInputElement)?.checked;
                          console.log('Marketing consent:', { email: emailChecked, sms: smsChecked });
                          toast.clearAll();
                        }}
                      >
                        Subscribe
                      </nr-button>
                      <nr-button 
                        size="small" 
                        type="ghost"
                        @click=${() => {
                          toast.clearAll();
                        }}
                      >
                        Maybe Later
                      </nr-button>
                    </div>
                  </div>
                `,
                type: ToastType.Default,
                autoDismiss: false,
                closable: true,
                icon: '',
                customClass: 'marketing-toast',
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Marketing Consent
          </button>
        </div>

        <!-- App Update Notification -->
        <div style="padding: 1rem; background: #f4f4f4; border-radius: 4px;">
          <h4 style="margin: 0 0 0.5rem 0;">App Update Available</h4>
          <button 
            @click=${() => {
              const toast = document.getElementById('toast-custom-content') as NrToastElement;
              toast?.show({
                content: html`
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="flex: 1;">
                      <h4 style="margin: 0 0 0.25rem 0; font-size: 0.938rem; font-weight: 600;">
                        ⚡ New Version Available
                      </h4>
                      <p style="margin: 0; font-size: 0.813rem; color: #525252;">
                        Version 2.0.0 is ready to install
                      </p>
                    </div>
                    <nr-button 
                      size="small" 
                      type="primary"
                      @click=${() => {
                        console.log('Installing update...');
                        toast.clearAll();
                      }}
                    >
                      Update Now
                    </nr-button>
                  </div>
                `,
                type: ToastType.Info,
                autoDismiss: false,
                closable: true,
                icon: '',
              });
            }}
            style="padding: 0.5rem 1rem; cursor: pointer;"
          >
            Show Update Notice
          </button>
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
