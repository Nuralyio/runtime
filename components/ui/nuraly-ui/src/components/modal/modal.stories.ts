/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ModalSize, ModalPosition, ModalAnimation, ModalBackdrop } from './modal.types.js';
import './modal.component.js';
import '../button/index.js';
import '../icon/index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

const meta: Meta = {
  title: 'Feedback/Modal',
  component: 'nr-modal',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Modal Component

A versatile modal component with multiple sizes, animations, and enhanced functionality including dragging, keyboard navigation, and customizable content areas.

## Features

- **Multiple sizes**: small, medium, large, xl
- **Flexible positioning**: center, top, bottom
- **Various animations**: fade, zoom, slide-up, slide-down
- **Backdrop behaviors**: closable, static, none
- **Drag & drop**: Optional draggable functionality
- **Keyboard navigation**: Full keyboard support with focus management
- **Customizable**: Header, body, and footer slots
- **Accessibility**: ARIA compliant with proper focus management

## Usage

\`\`\`html
<nr-modal open title="Modal Title">
  <p>Modal content goes here</p>
</nr-modal>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is open'
    },
    size: {
      control: 'select',
      options: Object.values(ModalSize),
      description: 'Modal size'
    },
    position: {
      control: 'select', 
      options: Object.values(ModalPosition),
      description: 'Modal position on screen'
    },
    animation: {
      control: 'select',
      options: Object.values(ModalAnimation),
      description: 'Animation type when opening/closing'
    },
    backdrop: {
      control: 'select',
      options: Object.values(ModalBackdrop),
      description: 'Backdrop behavior'
    },
    closable: {
      control: 'boolean',
      description: 'Whether the modal can be closed'
    },
    modalDraggable: {
      control: 'boolean',
      description: 'Whether the modal can be dragged'
    },
    resizable: {
      control: 'boolean',
      description: 'Whether the modal is resizable'
    },
    fullscreen: {
      control: 'boolean',
      description: 'Whether the modal is fullscreen'
    },
    modalTitle: {
      control: 'text',
      description: 'Modal title'
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header'
    },
    headerIcon: {
      control: 'text',
      description: 'Header icon name'
    },
    width: {
      control: 'text',
      description: 'Custom width (CSS value)'
    },
    height: {
      control: 'text',
      description: 'Custom height (CSS value)'
    },
    zIndex: {
      control: 'number',
      description: 'Z-index for the modal'
    }
  },
  args: {
    open: true,
    size: ModalSize.Medium,
    position: ModalPosition.Center,
    animation: ModalAnimation.Fade,
    backdrop: ModalBackdrop.Closable,
    closable: true,
    modalDraggable: false,
    resizable: false,
    fullscreen: false,
    modalTitle: '',
    showCloseButton: true,
    headerIcon: '',
    width: '',
    height: '',
    zIndex: 1000
  }
};

export default meta;

type Story = StoryObj;

/**
 * Default modal with basic content
 */
export const Default: Story = {
  args: {
    modalTitle: 'Modal Title',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .size=${args.size}
      .position=${args.position}
      .animation=${args.animation}
      .backdrop=${args.backdrop}
      .closable=${args.closable}
      .modalDraggable=${args.modalDraggable}
      .resizable=${args.resizable}
      .fullscreen=${args.fullscreen}
      .modalTitle=${args.modalTitle}
      .showCloseButton=${args.showCloseButton}
      .headerIcon=${args.headerIcon}
      .width=${args.width}
      .height=${args.height}
      .zIndex=${args.zIndex}>
      <p>This is the modal content. You can put any HTML content here.</p>
      <p>The modal supports rich content including lists, forms, and other components.</p>
    </nr-modal>
  `
};

/**
 * Modal with custom header using slots
 */
export const CustomHeader: Story = {
  args: {
    open: true,
    showCloseButton: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .size=${args.size}
      .closable=${args.closable}>
      <div slot="header" style="display: flex; align-items: center; gap: 8px;">
        <nr-icon name="info" style="color: var(--nuraly-color-primary, #0f62fe);"></nr-icon>
        <span style="font-weight: 600;">Custom Header with Icon</span>
      </div>
      <p>This modal has a custom header using the header slot.</p>
      <p>You can put any content in the header including icons, buttons, or other components.</p>
    </nr-modal>
  `
};

/**
 * Modal with footer actions
 */
export const WithFooter: Story = {
  args: {
    modalTitle: 'Confirm Action',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .modalTitle=${args.modalTitle}
      .closable=${args.closable}>
      <p>Are you sure you want to delete this item?</p>
      <p>This action cannot be undone.</p>
      
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="secondary">Cancel</nr-button>
        <nr-button type="danger">Delete</nr-button>
      </div>
    </nr-modal>
  `
};

/**
 * Small modal size
 */
export const Small: Story = {
  args: {
    size: ModalSize.Small,
    modalTitle: 'Small Modal',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .size=${args.size}
      .modalTitle=${args.modalTitle}>
      <p>This is a small modal perfect for quick confirmations or simple forms.</p>
    </nr-modal>
  `
};

/**
 * Large modal size
 */
export const Large: Story = {
  args: {
    size: ModalSize.Large,
    modalTitle: 'Large Modal',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .size=${args.size}
      .modalTitle=${args.modalTitle}>
      <p>This is a large modal suitable for complex forms or detailed content.</p>
      <p>Large modals provide more space for extensive content while maintaining good usability.</p>
      <ul>
        <li>Perfect for data entry forms</li>
        <li>Detailed information displays</li>
        <li>Multi-step workflows</li>
        <li>Rich content presentations</li>
      </ul>
    </nr-modal>
  `
};

/**
 * Extra large modal
 */
export const ExtraLarge: Story = {
  args: {
    size: ModalSize.ExtraLarge,
    modalTitle: 'Extra Large Modal',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .size=${args.size}
      .modalTitle=${args.modalTitle}>
      <h3>Extra Large Modal Content</h3>
      <p>This extra large modal provides maximum space for complex interfaces.</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
        <div>
          <h4>Left Column</h4>
          <p>Content can be organized in multiple columns.</p>
          <ul>
            <li>Dashboard widgets</li>
            <li>Data tables</li>
            <li>Chart displays</li>
          </ul>
        </div>
        <div>
          <h4>Right Column</h4>
          <p>Perfect for complex layouts and rich content.</p>
          <ul>
            <li>Image galleries</li>
            <li>Video players</li>
            <li>Interactive maps</li>
          </ul>
        </div>
      </div>
    </nr-modal>
  `
};

/**
 * Fullscreen modal
 */
export const Fullscreen: Story = {
  args: {
    fullscreen: true,
    modalTitle: 'Fullscreen Modal',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .fullscreen=${args.fullscreen}
      .modalTitle=${args.modalTitle}>
      <h3>Fullscreen Experience</h3>
      <p>This modal takes up the entire viewport, perfect for immersive experiences.</p>
      <p>Use fullscreen modals for:</p>
      <ul>
        <li>Image and video viewers</li>
        <li>Document editors</li>
        <li>Complex application interfaces</li>
        <li>Mobile-first designs</li>
      </ul>
    </nr-modal>
  `
};

/**
 * Draggable modal
 */
export const Draggable: Story = {
  args: {
    modalDraggable: true,
    modalTitle: 'Draggable Modal',
    headerIcon: 'drag',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .modalDraggable=${args.modalDraggable}
      .modalTitle=${args.modalTitle}
      .headerIcon=${args.headerIcon}>
      <p>This modal can be dragged around the screen by clicking and dragging the header.</p>
      <p>Drag functionality is useful for:</p>
      <ul>
        <li>Non-blocking dialogs</li>
        <li>Tool windows</li>
        <li>Multi-window workflows</li>
      </ul>
    </nr-modal>
  `
};

/**
 * Modal positioned at top
 */
export const TopPosition: Story = {
  args: {
    position: ModalPosition.Top,
    modalTitle: 'Top Positioned Modal',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .position=${args.position}
      .modalTitle=${args.modalTitle}>
      <p>This modal appears at the top of the screen.</p>
      <p>Top positioning is useful for notifications and quick actions.</p>
    </nr-modal>
  `
};

/**
 * Modal with zoom animation
 */
export const ZoomAnimation: Story = {
  args: {
    animation: ModalAnimation.Zoom,
    modalTitle: 'Zoom Animation',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .animation=${args.animation}
      .modalTitle=${args.modalTitle}>
      <p>This modal uses a zoom animation when opening and closing.</p>
      <p>The zoom effect creates a more dramatic entrance and exit.</p>
    </nr-modal>
  `
};

/**
 * Modal with slide-up animation
 */
export const SlideUpAnimation: Story = {
  args: {
    animation: ModalAnimation.SlideUp,
    position: ModalPosition.Bottom,
    modalTitle: 'Slide Up Animation',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .animation=${args.animation}
      .position=${args.position}
      .modalTitle=${args.modalTitle}>
      <p>This modal slides up from the bottom of the screen.</p>
      <p>Slide animations are great for mobile interfaces and bottom sheets.</p>
    </nr-modal>
  `
};

/**
 * Modal with static backdrop (cannot be closed by clicking outside)
 */
export const StaticBackdrop: Story = {
  args: {
    backdrop: ModalBackdrop.Static,
    modalTitle: 'Static Backdrop',
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .backdrop=${args.backdrop}
      .modalTitle=${args.modalTitle}>
      <p>This modal has a static backdrop - clicking outside won't close it.</p>
      <p>Use static backdrops for:</p>
      <ul>
        <li>Critical confirmations</li>
        <li>Required form completion</li>
        <li>Multi-step processes</li>
      </ul>
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="primary">Close</nr-button>
      </div>
    </nr-modal>
  `
};

/**
 * Complex modal with form content
 */
export const FormModal: Story = {
  args: {
    modalTitle: 'User Registration',
    size: ModalSize.Large,
    open: true
  },
  render: (args) => html`
    <nr-modal
      .open=${args.open}
      .modalTitle=${args.modalTitle}
      .size=${args.size}>
      <form style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label for="firstName" style="display: block; margin-bottom: 4px; font-weight: 500;">First Name</label>
            <input type="text" id="firstName" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          </div>
          <div>
            <label for="lastName" style="display: block; margin-bottom: 4px; font-weight: 500;">Last Name</label>
            <input type="text" id="lastName" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          </div>
        </div>
        
        <div>
          <label for="email" style="display: block; margin-bottom: 4px; font-weight: 500;">Email Address</label>
          <input type="email" id="email" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        
        <div>
          <label for="phone" style="display: block; margin-bottom: 4px; font-weight: 500;">Phone Number</label>
          <input type="tel" id="phone" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        
        <div>
          <label for="company" style="display: block; margin-bottom: 4px; font-weight: 500;">Company</label>
          <input type="text" id="company" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
      </form>
      
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="secondary">Cancel</nr-button>
        <nr-button type="primary">Register</nr-button>
      </div>
    </nr-modal>
  `
};

/**
 * Modal trigger example showing how to open/close modals
 */
export const ModalTrigger: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <nr-button 
        type="primary" 
        @click=${() => {
          const modal = document.querySelector('#trigger-modal') as any;
          if (modal) modal.open = true;
        }}>
        Open Modal
      </nr-button>
      
      <nr-modal 
        id="trigger-modal" 
        modalTitle="Triggered Modal"
        @modal-close=${() => {
          console.log('Modal closed');
        }}>
        <p>This modal was opened by clicking the button above.</p>
        <p>It demonstrates the programmatic opening and event handling.</p>
        
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <nr-button 
            type="secondary"
            @click=${() => {
              const modal = document.querySelector('#trigger-modal') as any;
              if (modal) modal.open = false;
            }}>
            Close
          </nr-button>
        </div>
      </nr-modal>
    </div>
  `
};

/**
 * Nested modal example demonstrating modal stacking and proper focus management
 */
export const NestedModals: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <nr-button 
        type="primary" 
        @click=${() => {
          const modal = document.querySelector('#parent-modal') as any;
          if (modal) modal.open = true;
        }}>
        Open Parent Modal
      </nr-button>
      
      <!-- Parent Modal -->
      <nr-modal 
        id="parent-modal" 
        modalTitle="Parent Modal"
        size="large">
        <p>This is the parent modal. You can open child modals from here.</p>
        <p>Notice how the z-index and focus management works with nested modals.</p>
        
        <div style="margin: 20px 0;">
          <h4>Parent Modal Content</h4>
          <p>This content demonstrates that the parent modal remains accessible behind the child modal.</p>
          <ul>
            <li>Z-index is automatically managed</li>
            <li>Focus is trapped in the top modal</li>
            <li>Escape key closes the top modal only</li>
            <li>Backdrop clicks only affect the top modal</li>
          </ul>
        </div>
        
        <div slot="footer" style="display: flex; gap: 8px; justify-content: space-between; width: 100%;">
          <div>
            <nr-button 
              type="primary"
              @click=${() => {
                const modal = document.querySelector('#child-modal-1') as any;
                if (modal) modal.open = true;
              }}>
              Open Child Modal 1
            </nr-button>
            <nr-button 
              type="secondary"
              @click=${() => {
                const modal = document.querySelector('#child-modal-2') as any;
                if (modal) modal.open = true;
              }}>
              Open Child Modal 2
            </nr-button>
          </div>
          <nr-button 
            type="secondary"
            @click=${() => {
              const modal = document.querySelector('#parent-modal') as any;
              if (modal) modal.open = false;
            }}>
            Close Parent
          </nr-button>
        </div>
      </nr-modal>
      
      <!-- Child Modal 1 -->
      <nr-modal 
        id="child-modal-1" 
        modalTitle="Child Modal 1"
        size="medium"
        backdrop="static">
        <p>This is Child Modal 1 with a static backdrop.</p>
        <p>Notice how it appears on top of the parent modal with proper layering.</p>
        
        <div style="background: #f0f8ff; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <h4>Child Modal Features:</h4>
          <ul>
            <li>Automatic z-index management</li>
            <li>Focus trapping in the top modal</li>
            <li>Static backdrop (can't click outside to close)</li>
            <li>Proper keyboard navigation</li>
          </ul>
        </div>
        
        <div slot="footer" style="display: flex; gap: 8px; justify-content: space-between; width: 100%;">
          <nr-button 
            type="primary"
            @click=${() => {
              const modal = document.querySelector('#grandchild-modal') as any;
              if (modal) modal.open = true;
            }}>
            Open Grandchild Modal
          </nr-button>
          <nr-button 
            type="secondary"
            @click=${() => {
              const modal = document.querySelector('#child-modal-1') as any;
              if (modal) modal.open = false;
            }}>
            Close Child 1
          </nr-button>
        </div>
      </nr-modal>
      
      <!-- Child Modal 2 -->
      <nr-modal 
        id="child-modal-2" 
        modalTitle="Child Modal 2"
        size="small"
        animation="zoom">
        <p>This is Child Modal 2 with zoom animation.</p>
        <p>It demonstrates multiple child modals from the same parent.</p>
        
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <nr-button 
            type="secondary"
            @click=${() => {
              const modal = document.querySelector('#child-modal-2') as any;
              if (modal) modal.open = false;
            }}>
            Close Child 2
          </nr-button>
        </div>
      </nr-modal>
      
      <!-- Grandchild Modal (3rd level) -->
      <nr-modal 
        id="grandchild-modal" 
        modalTitle="Grandchild Modal"
        size="small"
        animation="slide-up"
        position="top">
        <p>This is a grandchild modal (3rd level nesting).</p>
        <p>It demonstrates deep modal nesting capabilities.</p>
        
        <div style="background: #fff3cd; padding: 12px; border-radius: 4px; margin: 12px 0;">
          <strong>Level 3 Modal:</strong> The modal manager properly handles even deeply nested modals with correct z-index stacking and focus management.
        </div>
        
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <nr-button 
            type="primary"
            @click=${() => {
              const modal = document.querySelector('#grandchild-modal') as any;
              if (modal) modal.open = false;
            }}>
            Close Grandchild
          </nr-button>
        </div>
      </nr-modal>
      
      <!-- Debug info -->
      <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 4px;">
        <h4>Debug Information:</h4>
        <p>Open the browser console to see modal stack management in action.</p>
        <p>Use <code>window.ModalManager.getStackDepth()</code> to check the current modal stack depth.</p>
        <p>Use <code>window.ModalManager.getOpenModalIds()</code> to see all open modal IDs.</p>
      </div>
    </div>
  `
};

/**
 * Animation Playground - Test all animations with trigger buttons
 */
export const AnimationPlayground: Story = {
  args: {
    modalTitle: 'Animation Demo',
    size: ModalSize.Medium
  },
  render: (args) => html`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px;">
      <nr-button type="primary" @click=${() => {
        const modal = document.getElementById('fade-modal') as any;
        if (modal) modal.open = true;
      }}>
        Fade Animation
      </nr-button>
      
      <nr-button type="primary" @click=${() => {
        const modal = document.getElementById('zoom-modal') as any;
        if (modal) modal.open = true;
      }}>
        Zoom Animation
      </nr-button>
      
      <nr-button type="primary" @click=${() => {
        const modal = document.getElementById('slide-up-modal') as any;
        if (modal) modal.open = true;
      }}>
        Slide Up Animation
      </nr-button>
      
      <nr-button type="primary" @click=${() => {
        const modal = document.getElementById('slide-down-modal') as any;
        if (modal) modal.open = true;
      }}>
        Slide Down Animation
      </nr-button>
    </div>

    <!-- Fade Animation Modal -->
    <nr-modal
      id="fade-modal"
      .animation=${ModalAnimation.Fade}
      .modalTitle=${'Fade Animation'}
      .size=${args.size}
      @modal-close=${() => {
        const modal = document.getElementById('fade-modal') as any;
        if (modal) modal.open = false;
      }}>
      <p>🌅 This modal uses a <strong>fade animation</strong>.</p>
      <p>The fade effect provides a smooth, gentle transition that feels natural and subtle.</p>
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="secondary" @click=${() => {
          const modal = document.getElementById('fade-modal') as any;
          if (modal) modal.open = false;
        }}>
          Close
        </nr-button>
      </div>
    </nr-modal>

    <!-- Zoom Animation Modal -->
    <nr-modal
      id="zoom-modal"
      .animation=${ModalAnimation.Zoom}
      .modalTitle=${'Zoom Animation'}
      .size=${args.size}
      @modal-close=${() => {
        const modal = document.getElementById('zoom-modal') as any;
        if (modal) modal.open = false;
      }}>
      <p>🔍 This modal uses a <strong>zoom animation</strong>.</p>
      <p>The zoom effect creates a more dramatic entrance with a scale transformation.</p>
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="secondary" @click=${() => {
          const modal = document.getElementById('zoom-modal') as any;
          if (modal) modal.open = false;
        }}>
          Close
        </nr-button>
      </div>
    </nr-modal>

    <!-- Slide Up Animation Modal -->
    <nr-modal
      id="slide-up-modal"
      .animation=${ModalAnimation.SlideUp}
      .position=${ModalPosition.Bottom}
      .modalTitle=${'Slide Up Animation'}
      .size=${args.size}
      @modal-close=${() => {
        const modal = document.getElementById('slide-up-modal') as any;
        if (modal) modal.open = false;
      }}>
      <p>⬆️ This modal uses a <strong>slide up animation</strong>.</p>
      <p>Perfect for mobile interfaces and bottom sheet patterns.</p>
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="secondary" @click=${() => {
          const modal = document.getElementById('slide-up-modal') as any;
          if (modal) modal.open = false;
        }}>
          Close
        </nr-button>
      </div>
    </nr-modal>

    <!-- Slide Down Animation Modal -->
    <nr-modal
      id="slide-down-modal"
      .animation=${ModalAnimation.SlideDown}
      .position=${ModalPosition.Top}
      .modalTitle=${'Slide Down Animation'}
      .size=${args.size}
      @modal-close=${() => {
        const modal = document.getElementById('slide-down-modal') as any;
        if (modal) modal.open = false;
      }}>
      <p>⬇️ This modal uses a <strong>slide down animation</strong>.</p>
      <p>Great for notifications and top-positioned content.</p>
      <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
        <nr-button type="secondary" @click=${() => {
          const modal = document.getElementById('slide-down-modal') as any;
          if (modal) modal.open = false;
        }}>
          Close
        </nr-button>
      </div>
    </nr-modal>
  `
};