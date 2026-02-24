/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import './icon-picker.component.js';

export default {
  title: 'Forms/Icon Picker',
  component: 'nr-icon-picker',
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Selected icon name',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Component size',
    },
    placement: {
      control: 'select',
      options: ['auto', 'top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      description: 'Dropdown placement',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the component',
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search input',
    },
    showClear: {
      control: 'boolean',
      description: 'Show clear button',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
};

/**
 * Default icon picker
 */
export const Default = {
  render: () => html`
    <nr-icon-picker
      @nr-icon-picker-change=${(e: CustomEvent) => {
        console.log('Icon changed:', e.detail);
      }}
    ></nr-icon-picker>
  `,
};

/**
 * Icon picker with initial value
 */
export const WithValue = {
  render: () => html`
    <nr-icon-picker value="heart"></nr-icon-picker>
  `,
};

/**
 * Icon picker sizes
 */
export const Sizes = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Small</label>
        <nr-icon-picker size="small" value="star"></nr-icon-picker>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Medium (Default)</label>
        <nr-icon-picker size="medium" value="heart"></nr-icon-picker>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Large</label>
        <nr-icon-picker size="large" value="home"></nr-icon-picker>
      </div>
    </div>
  `,
};

/**
 * Different placements
 */
export const Placements = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 100px;">
      <nr-icon-picker placement="top" value="arrow-up" placeholder="Top"></nr-icon-picker>
      <nr-icon-picker placement="top-start" value="arrow-up" placeholder="Top Start"></nr-icon-picker>
      <nr-icon-picker placement="top-end" value="arrow-up" placeholder="Top End"></nr-icon-picker>
      <nr-icon-picker placement="bottom" value="arrow-down" placeholder="Bottom"></nr-icon-picker>
      <nr-icon-picker placement="bottom-start" value="arrow-down" placeholder="Bottom Start"></nr-icon-picker>
      <nr-icon-picker placement="bottom-end" value="arrow-down" placeholder="Bottom End"></nr-icon-picker>
    </div>
  `,
};

/**
 * Disabled state
 */
export const Disabled = {
  render: () => html`
    <nr-icon-picker value="lock" disabled></nr-icon-picker>
  `,
};

/**
 * Without search
 */
export const WithoutSearch = {
  render: () => html`
    <nr-icon-picker .showSearch=${false} value="search"></nr-icon-picker>
  `,
};

/**
 * Without clear button
 */
export const WithoutClear = {
  render: () => html`
    <nr-icon-picker .showClear=${false} value="times"></nr-icon-picker>
  `,
};

/**
 * Custom placeholder
 */
export const CustomPlaceholder = {
  render: () => html`
    <nr-icon-picker placeholder="Choose an icon..."></nr-icon-picker>
  `,
};

/**
 * Custom styling
 */
export const CustomStyling = {
  render: () => html`
    <nr-icon-picker
      value="palette"
      style="
        --icon-picker-dropdown-width: 400px;
        --icon-picker-icon-size: 32px;
        --icon-picker-selected-bg: #ff6b6b;
        --icon-picker-selected-border: #ff6b6b;
      "
    ></nr-icon-picker>
  `,
};

/**
 * With event listeners
 */
export const WithEvents = {
  render: () => html`
    <div>
      <nr-icon-picker
        @nr-icon-picker-change=${(e: CustomEvent) => {
          const output = document.getElementById('event-output');
          if (output) {
            output.textContent = `Changed to: ${e.detail.value}`;
          }
        }}
        @nr-icon-picker-open=${() => {
          const output = document.getElementById('event-output-2');
          if (output) {
            output.textContent = 'Dropdown opened';
          }
        }}
        @nr-icon-picker-close=${() => {
          const output = document.getElementById('event-output-2');
          if (output) {
            output.textContent = 'Dropdown closed';
          }
        }}
        @nr-icon-picker-search=${(e: CustomEvent) => {
          const output = document.getElementById('event-output-3');
          if (output) {
            output.textContent = `Searching: "${e.detail.query}"`;
          }
        }}
      ></nr-icon-picker>
      
      <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-family: monospace;">
        <div id="event-output">No selection yet</div>
        <div id="event-output-2">Dropdown state: closed</div>
        <div id="event-output-3">No search query</div>
      </div>
    </div>
  `,
};

/**
 * Form integration
 */
export const FormIntegration = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const picker = (e.target as HTMLFormElement).querySelector('nr-icon-picker');
        alert(`Selected icon: ${picker?.value || 'None'}`);
      }}
      style="display: flex; flex-direction: column; gap: 16px; max-width: 300px;"
    >
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">
          Select an icon
        </label>
        <nr-icon-picker name="icon" value="star"></nr-icon-picker>
      </div>
      
      <button type="submit" style="padding: 8px 16px; cursor: pointer;">
        Submit
      </button>
    </form>
  `,
};

/**
 * Interactive playground
 */
export const Playground = {
  args: {
    value: 'heart',
    size: 'medium',
    placement: 'auto',
    disabled: false,
    showSearch: true,
    showClear: true,
    placeholder: 'Select icon',
  },
  render: (args: any) => html`
    <nr-icon-picker
      .value=${args.value}
      .size=${args.size}
      .placement=${args.placement}
      .disabled=${args.disabled}
      .showSearch=${args.showSearch}
      .showClear=${args.showClear}
      .placeholder=${args.placeholder}
    ></nr-icon-picker>
  `,
};
