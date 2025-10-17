import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './index.js';
import '../icon/index.js';
import '../input/index.js';

const meta: Meta = {
  title: 'Data Entry/ColorPicker',
  component: 'nr-color-picker',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A comprehensive color picker component with dropdown functionality including:
- Hex color picker with visual gradient selector
- Preset color swatches for quick selection
- Text input with validation and copy functionality
- Smart dropdown positioning with viewport detection
- Accessibility support with ARIA attributes
- Multiple size variants and customization options

## Features
- **Visual Color Picker**: Interactive gradient-based color selection
- **Preset Colors**: Quick selection from predefined color swatches
- **Color Input**: Manual color entry with validation and copy button
- **Smart Positioning**: Automatic dropdown placement based on viewport
- **Validation**: Real-time color format validation
- **Accessibility**: Full ARIA support and keyboard navigation
- **Size Variants**: Small, default, and large sizes
- **Customizable**: Support for labels, helper text, and various formats

## CSS Custom Properties
- \`--colorpicker-trigger-size\`: Size of the color trigger box
- \`--colorpicker-dropdown-width\`: Width of the dropdown panel
- \`--colorpicker-dropdown-background\`: Background color of dropdown
- \`--colorpicker-dropdown-shadow\`: Shadow of dropdown panel
- \`--colorpicker-dropdown-border-radius\`: Border radius of dropdown
- \`--color-holder-size\`: Size of individual color swatches
- \`--color-holder-border\`: Border style for color boxes
- \`--default-color-sets-gap\`: Gap between preset color swatches

## Events
- \`nr-color-change\`: Fired when color value changes (with validation info)
- \`nr-colorpicker-open\`: Fired when dropdown opens
- \`nr-colorpicker-close\`: Fired when dropdown closes
- \`color-changed\`: Legacy event for backwards compatibility
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'color',
      description: 'Current color value (hex, rgb, rgba, hsl, hsla)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the color picker',
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size variant of the color picker',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above the color picker',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the color picker',
    },
    showInput: {
      control: 'boolean',
      description: 'Show/hide the color input field',
    },
    showCopyButton: {
      control: 'boolean',
      description: 'Show/hide the copy button on input',
    },
    closeOnSelect: {
      control: 'boolean',
      description: 'Close dropdown when a color is selected',
    },
    closeOnOutsideClick: {
      control: 'boolean',
      description: 'Close dropdown when clicking outside',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close dropdown when pressing Escape key',
    },
    inputPlaceholder: {
      control: 'text',
      description: 'Placeholder text for color input field',
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'auto'],
      description: 'Dropdown placement relative to trigger',
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'manual'],
      description: 'How the dropdown is triggered',
    },
    format: {
      control: 'select',
      options: ['hex', 'rgb', 'rgba', 'hsl', 'hsla'],
      description: 'Color format for display and output',
    },
  },
};

export default meta;
type Story = StoryObj;

// Default preset colors
const defaultColors = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#34495e', '#95a5a6',
  '#e67e22', '#16a085', '#2980b9', '#8e44ad',
  '#27ae60', '#c0392b', '#d35400', '#7f8c8d'
];

// Material Design colors
const materialColors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
];

/**
 * Default color picker with basic functionality
 */
export const Default: Story = {
  args: {
    color: '#3498db',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      ?disabled="${args.disabled}"
      size="${args.size || 'default'}"
    ></nr-color-picker>
  `,
};

/**
 * Color picker with preset color swatches for quick selection
 */
export const WithPresetColors: Story = {
  args: {
    color: '#e74c3c',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * Color picker with Material Design color palette
 */
export const MaterialDesignPalette: Story = {
  args: {
    color: '#2196f3',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      .defaultColorSets="${materialColors}"
    ></nr-color-picker>
  `,
};

/**
 * Color picker with label and helper text
 */
export const WithLabelAndHelper: Story = {
  args: {
    color: '#9b59b6',
    label: 'Brand Color',
    helperText: 'Choose your primary brand color',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      label="${args.label}"
      helper-text="${args.helperText}"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    color: '#2ecc71',
  },
  render: (args) => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <nr-color-picker
        color="${args.color}"
        size="small"
        .defaultColorSets="${defaultColors}"
      ></nr-color-picker>
      <span>Small size variant</span>
    </div>
  `,
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    color: '#f39c12',
  },
  render: (args) => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <nr-color-picker
        color="${args.color}"
        size="large"
        .defaultColorSets="${defaultColors}"
      ></nr-color-picker>
      <span>Large size variant</span>
    </div>
  `,
};

/**
 * All size variants comparison
 */
export const SizeComparison: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <div style="text-align: center;">
        <nr-color-picker
          color="#3498db"
          size="small"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
        <div style="margin-top: 8px; font-size: 12px;">Small</div>
      </div>
      <div style="text-align: center;">
        <nr-color-picker
          color="#e74c3c"
          size="default"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
        <div style="margin-top: 8px; font-size: 12px;">Default</div>
      </div>
      <div style="text-align: center;">
        <nr-color-picker
          color="#2ecc71"
          size="large"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
        <div style="margin-top: 8px; font-size: 12px;">Large</div>
      </div>
    </div>
  `,
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    color: '#95a5a6',
    disabled: true,
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      ?disabled="${args.disabled}"
      label="Disabled Color Picker"
      helper-text="This color picker is disabled"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * Without color input field
 */
export const WithoutInput: Story = {
  args: {
    color: '#1abc9c',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      ?show-input="${false}"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * Without copy button on input
 */
export const WithoutCopyButton: Story = {
  args: {
    color: '#e67e22',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      ?show-copy-button="${false}"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * Close dropdown on color selection
 */
export const CloseOnSelect: Story = {
  args: {
    color: '#8e44ad',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      close-on-select
      label="Select a Color"
      helper-text="Dropdown closes automatically after selection"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * With custom input placeholder
 */
export const CustomPlaceholder: Story = {
  args: {
    color: '#27ae60',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      input-placeholder="Enter hex color code..."
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};

/**
 * Multiple color pickers in a form
 */
export const FormExample: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; min-width: 300px;">
      <div>
        <nr-color-picker
          color="#3498db"
          label="Primary Color"
          helper-text="Main brand color for buttons and links"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
      <div>
        <nr-color-picker
          color="#2ecc71"
          label="Success Color"
          helper-text="Color for success messages and confirmations"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
      <div>
        <nr-color-picker
          color="#e74c3c"
          label="Error Color"
          helper-text="Color for error states and warnings"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
      <div>
        <nr-color-picker
          color="#f39c12"
          label="Warning Color"
          helper-text="Color for warning messages"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
    </div>
  `,
};

/**
 * Theme customization example
 */
export const ThemeCustomization: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; min-width: 400px;">
      <div style="background: #f8f9fa; padding: 24px; border-radius: 8px;">
        <h3 style="margin: 0 0 16px 0;">Light Theme Colors</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <nr-color-picker
            color="#ffffff"
            label="Background"
            .defaultColorSets="${['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6']}"
          ></nr-color-picker>
          <nr-color-picker
            color="#212529"
            label="Text"
            .defaultColorSets="${['#212529', '#495057', '#6c757d', '#adb5bd']}"
          ></nr-color-picker>
        </div>
      </div>
      
      <div style="background: #2c3e50; padding: 24px; border-radius: 8px;">
        <h3 style="margin: 0 0 16px 0; color: white;">Dark Theme Colors</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <nr-color-picker
            color="#1a1a1a"
            label="Background"
            .defaultColorSets="${['#1a1a1a', '#2c2c2c', '#3c3c3c', '#4a4a4a']}"
          ></nr-color-picker>
          <nr-color-picker
            color="#f8f9fa"
            label="Text"
            .defaultColorSets="${['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da']}"
          ></nr-color-picker>
        </div>
      </div>
    </div>
  `,
};

/**
 * Gradient color palette
 */
export const GradientPalette: Story = {
  render: () => {
    const blueGradient = [
      '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6',
      '#42a5f5', '#2196f3', '#1e88e5', '#1976d2'
    ];
    const greenGradient = [
      '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784',
      '#66bb6a', '#4caf50', '#43a047', '#388e3c'
    ];
    const redGradient = [
      '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373',
      '#ef5350', '#f44336', '#e53935', '#d32f2f'
    ];
    
    return html`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <h4 style="margin: 0 0 12px 0;">Blue Gradient</h4>
          <nr-color-picker
            color="#2196f3"
            .defaultColorSets="${blueGradient}"
          ></nr-color-picker>
        </div>
        <div>
          <h4 style="margin: 0 0 12px 0;">Green Gradient</h4>
          <nr-color-picker
            color="#4caf50"
            .defaultColorSets="${greenGradient}"
          ></nr-color-picker>
        </div>
        <div>
          <h4 style="margin: 0 0 12px 0;">Red Gradient</h4>
          <nr-color-picker
            color="#f44336"
            .defaultColorSets="${redGradient}"
          ></nr-color-picker>
        </div>
      </div>
    `;
  },
};

/**
 * Event handling example
 */
export const EventHandling: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 400px;">
      <nr-color-picker
        color="#3498db"
        label="Select a Color"
        helper-text="Color change events are logged to console"
        .defaultColorSets="${defaultColors}"
        @nr-color-change="${(e: CustomEvent) => {
          console.log('Color changed:', e.detail);
          const infoBox = document.getElementById('color-info');
          if (infoBox) {
            infoBox.innerHTML = `
              <div><strong>Color:</strong> ${e.detail.value}</div>
              <div><strong>Previous:</strong> ${e.detail.previousValue}</div>
              <div><strong>Valid:</strong> ${e.detail.isValid ? '✓' : '✗'}</div>
            `;
          }
        }}"
        @nr-colorpicker-open="${() => console.log('Dropdown opened')}"
        @nr-colorpicker-close="${() => console.log('Dropdown closed')}"
      ></nr-color-picker>
      
      <div 
        id="color-info"
        style="
          padding: 16px; 
          background: #f8f9fa; 
          border-radius: 8px;
          border: 1px solid #dee2e6;
          font-family: monospace;
          font-size: 12px;
        "
      >
        <div><strong>Color:</strong> #3498db</div>
        <div><strong>Previous:</strong> -</div>
        <div><strong>Valid:</strong> ✓</div>
      </div>
    </div>
  `,
};

/**
 * Transparent and RGBA colors
 */
export const TransparentColors: Story = {
  render: () => {
    const transparentColors = [
      'transparent',
      'rgba(52, 152, 219, 0.1)',
      'rgba(52, 152, 219, 0.3)',
      'rgba(52, 152, 219, 0.5)',
      'rgba(52, 152, 219, 0.7)',
      'rgba(52, 152, 219, 0.9)',
      'rgba(231, 76, 60, 0.5)',
      'rgba(46, 204, 113, 0.5)',
    ];
    
    return html`
      <div style="
        display: inline-block;
        padding: 24px;
        background: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
                    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
      ">
        <nr-color-picker
          color="rgba(52, 152, 219, 0.5)"
          label="Transparent Color"
          helper-text="Supports transparent and RGBA values"
          .defaultColorSets="${transparentColors}"
        ></nr-color-picker>
      </div>
    `;
  },
};

/**
 * All four corners viewport test
 */
export const ViewportAllCorners: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Tests all four corners simultaneously to verify dropdown positioning works correctly in all edge cases. Each dropdown should position itself to remain fully visible within the viewport.',
      },
    },
  },
  render: () => html`
    <div style="position: relative; min-height: 100vh; padding: 8px;">
      <!-- Top Left -->
      <div style="position: absolute; top: 8px; left: 8px;">
        <nr-color-picker
          color="#3498db"
          label="Top Left"
          size="small"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
      
      <!-- Top Right -->
      <div style="position: absolute; top: 8px; right: 8px;">
        <nr-color-picker
          color="#e74c3c"
          label="Top Right"
          size="small"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
      
      <!-- Bottom Left -->
      <div style="position: absolute; bottom: 8px; left: 8px;">
        <nr-color-picker
          color="#2ecc71"
          label="Bottom Left"
          size="small"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
      
      <!-- Bottom Right -->
      <div style="position: absolute; bottom: 8px; right: 8px;">
        <nr-color-picker
          color="#f39c12"
          label="Bottom Right"
          size="small"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
      
      <!-- Center for reference -->
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
        <nr-color-picker
          color="#9b59b6"
          label="Center Reference"
          helper-text="This should open normally"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
    </div>
  `,
};

/**
 * Viewport edge scrolling test
 */
export const ViewportScrolling: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Tests dropdown positioning during page scrolling. Dropdowns should reposition themselves as the page scrolls to maintain visibility.',
      },
    },
  },
  render: () => html`
    <div style="min-height: 200vh; padding: 20px;">
      <div style="position: sticky; top: 0; background: white; padding: 16px; border: 2px solid #3498db; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 8px 0;">Sticky Header</h3>
        <nr-color-picker
          color="#3498db"
          label="Sticky Position"
          helper-text="Scroll to test repositioning"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
      
      <div style="margin: 40px 0;">
        <h3>Top Section</h3>
        <nr-color-picker
          color="#e74c3c"
          label="Top Section"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
      
      <div style="margin: 800px 0 40px 0;">
        <h3>Middle Section (scroll down)</h3>
        <nr-color-picker
          color="#2ecc71"
          label="Middle Section"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
      
      <div style="margin: 40px 0;">
        <h3>Bottom Section</h3>
        <nr-color-picker
          color="#f39c12"
          label="Bottom Section"
          helper-text="Near the bottom of the page"
          .defaultColorSets="${defaultColors}"
        ></nr-color-picker>
      </div>
    </div>
  `,
};

/**
 * Viewport narrow width test
 */
export const ViewportNarrowWidth: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Tests dropdown behavior in narrow viewports (mobile-like). Dropdown should adjust to fit available space.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 320px; margin: 0 auto; padding: 16px; border: 2px dashed #ccc; min-height: 100vh;">
      <h3 style="text-align: center; margin-bottom: 24px;">Mobile Width (320px)</h3>
      
      <div style="margin-bottom: 24px;">
        <nr-color-picker
          color="#3498db"
          label="Left Edge"
          helper-text="Near left edge"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
      
      <div style="margin-bottom: 24px; display: flex; justify-content: flex-end;">
        <nr-color-picker
          color="#e74c3c"
          label="Right Edge"
          helper-text="Near right edge"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
      
      <div style="margin-bottom: 24px; display: flex; justify-content: center;">
        <nr-color-picker
          color="#2ecc71"
          label="Centered"
          helper-text="In the center"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
    </div>
  `,
};

/**
 * Viewport resize test
 */
export const ViewportResize: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Tests dropdown repositioning on window resize. Try resizing your browser window while the dropdown is open - it should reposition automatically.',
      },
    },
  },
  render: () => html`
    <div style="padding: 40px; min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0;">Window Resize Test</h3>
          <p style="margin: 0 0 16px 0; color: #666;">
            1. Open the dropdown below<br>
            2. Resize your browser window<br>
            3. The dropdown should reposition automatically
          </p>
          <nr-color-picker
            color="#3498db"
            label="Resize Test"
            helper-text="Open dropdown and resize window"
            .defaultColorSets="${defaultColors}"
          ></nr-color-picker>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <nr-color-picker
            color="#e74c3c"
            label="Left Side"
            size="small"
            .defaultColorSets="${defaultColors.slice(0, 8)}"
          ></nr-color-picker>
          
          <nr-color-picker
            color="#2ecc71"
            label="Right Side"
            size="small"
            .defaultColorSets="${defaultColors.slice(0, 8)}"
          ></nr-color-picker>
        </div>
      </div>
    </div>
  `,
};

/**
 * Viewport with forced placement
 */
export const ViewportForcedPlacement: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Compares auto placement vs forced placement. Shows how placement="top" and placement="bottom" behave compared to placement="auto".',
      },
    },
  },
  render: () => html`
    <div style="padding: 40px; min-height: 100vh;">
      <h3 style="text-align: center; margin-bottom: 32px;">Placement Comparison</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center;">
          <h4 style="margin-bottom: 16px;">Auto (Smart)</h4>
          <nr-color-picker
            color="#3498db"
            label="Auto Placement"
            placement="auto"
            helper-text="Chooses best position"
            .defaultColorSets="${defaultColors.slice(0, 8)}"
          ></nr-color-picker>
        </div>
        
        <div style="text-align: center;">
          <h4 style="margin-bottom: 16px;">Bottom (Forced)</h4>
          <nr-color-picker
            color="#e74c3c"
            label="Bottom Placement"
            placement="bottom"
            helper-text="Always opens below"
            .defaultColorSets="${defaultColors.slice(0, 8)}"
          ></nr-color-picker>
        </div>
        
        <div style="text-align: center;">
          <h4 style="margin-bottom: 16px;">Top (Forced)</h4>
          <nr-color-picker
            color="#2ecc71"
            label="Top Placement"
            placement="top"
            helper-text="Always opens above"
            .defaultColorSets="${defaultColors.slice(0, 8)}"
          ></nr-color-picker>
        </div>
      </div>
      
      <!-- Bottom edge test -->
      <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);">
        <nr-color-picker
          color="#f39c12"
          label="Bottom Edge Auto"
          placement="auto"
          helper-text="Should open upward"
          .defaultColorSets="${defaultColors.slice(0, 8)}"
        ></nr-color-picker>
      </div>
    </div>
  `,
};

/**
 * Playground for interactive testing
 */
export const Playground: Story = {
  args: {
    color: '#3498db',
    disabled: false,
    size: 'default',
    label: 'Color Picker',
    helperText: 'Choose your favorite color',
    showInput: true,
    showCopyButton: true,
    closeOnSelect: false,
    closeOnOutsideClick: true,
    closeOnEscape: true,
    inputPlaceholder: 'Enter color',
    placement: 'auto',
    trigger: 'click',
  },
  render: (args) => html`
    <nr-color-picker
      color="${args.color}"
      ?disabled="${args.disabled}"
      size="${args.size}"
      label="${args.label}"
      helper-text="${args.helperText}"
      ?show-input="${args.showInput}"
      ?show-copy-button="${args.showCopyButton}"
      ?close-on-select="${args.closeOnSelect}"
      ?close-on-outside-click="${args.closeOnOutsideClick}"
      ?close-on-escape="${args.closeOnEscape}"
      input-placeholder="${args.inputPlaceholder}"
      placement="${args.placement}"
      trigger="${args.trigger}"
      .defaultColorSets="${defaultColors}"
    ></nr-color-picker>
  `,
};
