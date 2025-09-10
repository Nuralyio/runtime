import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import '../../dist/components/icon/index.js';
import '../../dist/components/input/index.js';
import '../../dist/components/select/index.js';

const meta: Meta = {
  title: 'Components/Select',
  component: 'hy-select',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A versatile select component with comprehensive functionality including:
- Single and multiple selection modes
- Rich options with icons and descriptions  
- Searchable/filterable options
- Status states (success, warning, error)
- Keyboard navigation
- Accessibility support
- Custom styling with CSS properties

## Features
- **Single Selection**: Choose one option from the dropdown
- **Multiple Selection**: Select multiple options displayed as removable tags
- **Rich Options**: Support for icons, descriptions, and disabled states
- **Search & Filter**: Built-in search functionality for large datasets
- **Validation States**: Visual feedback for form validation
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, Esc
- **Accessibility**: ARIA labels, focus management, screen reader support

## CSS Custom Properties
- \`--hybrid-select-border-color\`: Border color
- \`--hybrid-select-focus-color\`: Focus state color
- \`--hybrid-select-error-color\`: Error state color
- \`--hybrid-select-success-color\`: Success state color
- \`--hybrid-select-background\`: Background color
- \`--hybrid-select-text-color\`: Text color
- \`--hybrid-select-dropdown-shadow\`: Dropdown shadow
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: { type: 'object' },
      description: 'Array of option objects with label, value, icon, description, disabled properties',
    },
    value: {
      control: { type: 'text' },
      description: 'Selected value(s) - string for single, array for multiple',
    },
    placeholder: { 
      control: 'text',
      description: 'Placeholder text shown when no option is selected',
    },
    multiple: { 
      control: 'boolean',
      description: 'Enable multiple selection mode with tags',
    },
    disabled: { 
      control: 'boolean',
      description: 'Disable the entire component',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search/filter functionality',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder text for search input',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    valid: {
      control: 'boolean',
      description: 'Show valid/success state',
    },
    invalid: {
      control: 'boolean',  
      description: 'Show invalid/error state',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display in invalid state',
    },
    size: { 
      control: 'select', 
      options: ['small', 'medium', 'large'],
      description: 'Component size variant',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of dropdown (CSS value)',
    },
  },
  args: {
    placeholder: 'Select an option...',
    multiple: false,
    disabled: false,
    searchable: false,
    loading: false,
    valid: false,
    invalid: false,
    errorMessage: '',
    size: 'medium',
    maxHeight: '200px',
  },
};

export default meta;
type Story = StoryObj;

// Common options used across stories
const basicOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' }
];

// Basic single selection example
export const Default: Story = {
  args: {
    placeholder: 'Select a fruit',
    multiple: false,
    disabled: false,
    searchable: false,
    size: 'medium',
  },
  render: (args) => html`
    <hy-select
      .options=${[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
        { label: 'Date', value: 'date' },
        { label: 'Elderberry', value: 'elderberry' },
        { label: 'Fig', value: 'fig' }
      ]}
      placeholder=${args.placeholder}
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?searchable=${args.searchable}
      size=${args.size}
      @change=${(e: any) => {
        console.log('Selection changed:', e.detail);
      }}
    ></hy-select>
  `,
};

// Empty states with different placeholder variations
export const EmptyStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of select components in empty state with different placeholder texts. This demonstrates how placeholders appear when no option is selected.'
      }
    }
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
      <div>
        <h4>Default placeholder</h4>
        <hy-select .options=${basicOptions}></hy-select>
      </div>
      
      <div>
        <h4>Custom placeholder</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="Choose your favorite fruit...">
        </hy-select>
      </div>
      
      <div>
        <h4>Short placeholder</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="Pick one">
        </hy-select>
      </div>
      
      <div>
        <h4>Empty placeholder (no text)</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="">
        </hy-select>
      </div>
      
      <div>
        <h4>Multiple select placeholder</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="Select multiple fruits..."
          multiple>
        </hy-select>
      </div>
      
      <div>
        <h4>Required field placeholder</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="Please select a required option *"
          required>
        </hy-select>
      </div>
      
      <div>
        <h4>Disabled with placeholder</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="This select is disabled"
          disabled>
        </hy-select>
      </div>
    </div>
  `,
};

// No options available scenarios
export const NoOptions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of select components with no options available. This demonstrates how the component behaves when the options array is empty or when data is still loading.'
      }
    }
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
      <div>
        <h4>Empty options array (default message)</h4>
        <hy-select 
          .options=${[]}
          placeholder="Click to see empty state">
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Component with empty options array - dropdown shows "No options available" message
        </small>
      </div>
      
      <div>
        <h4>Custom no-options message</h4>
        <hy-select 
          .options=${[]}
          placeholder="Custom empty state"
          no-options-message="No items found">
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Using custom no-options-message property
        </small>
      </div>
      
      <div>
        <h4>Loading state (no options yet)</h4>
        <hy-select 
          .options=${[]}
          placeholder="Loading options..."
          no-options-message="Loading..."
          disabled>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Disabled while options are being loaded from an API
        </small>
      </div>
      
      <div>
        <h4>No results found state</h4>
        <hy-select 
          .options=${[]}
          placeholder="Search returned no results"
          no-options-message="No results found">
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          When search/filter returns no results
        </small>
      </div>
      
      <div>
        <h4>Multiple select with no options</h4>
        <hy-select 
          .options=${[]}
          placeholder="No options to select"
          no-options-message="No items available for selection"
          multiple>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Multiple selection mode with empty options
        </small>
      </div>
      
      <div>
        <h4>Dynamic options (simulate loading)</h4>
        <hy-select 
          .options=${[]}
          placeholder="Click to simulate loading..."
          @click=${(e: any) => {
            const select = e.target;
            if (select.options.length === 0) {
              // Simulate async loading
              setTimeout(() => {
                select.options = [
                  { label: 'Loaded Option 1', value: '1' },
                  { label: 'Loaded Option 2', value: '2' },
                  { label: 'Loaded Option 3', value: '3' }
                ];
                select.placeholder = 'Options loaded! Select one...';
                select.requestUpdate();
              }, 1000);
              select.placeholder = 'Loading...';
              select.disabled = true;
              setTimeout(() => {
                select.disabled = false;
              }, 1000);
            }
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Click to simulate loading options dynamically
        </small>
      </div>
      
      <div>
        <h4>Error state with no options</h4>
        <hy-select 
          .options=${[]}
          placeholder="Failed to load options"
          status="error">
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Error state when options failed to load
        </small>
      </div>
    </div>
  `,
};

// Search and filter functionality
export const SearchableSelect: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Searchable select allows users to filter options by typing. Includes single and multiple selection modes with search.'
      }
    }
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 500px;">
      <div>
        <h4>Single select with search</h4>
        <hy-select 
          .options=${[
            { label: 'Apple', value: 'apple' },
            { label: 'Apricot', value: 'apricot' },
            { label: 'Banana', value: 'banana' },
            { label: 'Blueberry', value: 'blueberry' },
            { label: 'Cherry', value: 'cherry' },
            { label: 'Cranberry', value: 'cranberry' },
            { label: 'Date', value: 'date' },
            { label: 'Elderberry', value: 'elderberry' },
            { label: 'Fig', value: 'fig' },
            { label: 'Grape', value: 'grape' },
            { label: 'Kiwi', value: 'kiwi' },
            { label: 'Lemon', value: 'lemon' },
            { label: 'Mango', value: 'mango' },
            { label: 'Orange', value: 'orange' },
            { label: 'Papaya', value: 'papaya' },
            { label: 'Pear', value: 'pear' },
            { label: 'Pineapple', value: 'pineapple' },
            { label: 'Strawberry', value: 'strawberry' },
            { label: 'Watermelon', value: 'watermelon' }
          ]}
          placeholder="Search for fruits..."
          searchable
          search-placeholder="Type to search fruits..."
          @nr-change=${(e: any) => {
            console.log('Searchable select changed:', e.detail.value);
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Type to filter options (try "app", "berry", etc.)
        </small>
      </div>
      
      <div>
        <h4>Multiple select with search</h4>
        <hy-select 
          .options=${[
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
            { label: 'Python', value: 'python' },
            { label: 'Java', value: 'java' },
            { label: 'C++', value: 'cpp' },
            { label: 'C#', value: 'csharp' },
            { label: 'Ruby', value: 'ruby' },
            { label: 'PHP', value: 'php' },
            { label: 'Go', value: 'go' },
            { label: 'Rust', value: 'rust' },
            { label: 'Swift', value: 'swift' },
            { label: 'Kotlin', value: 'kotlin' },
            { label: 'Dart', value: 'dart' },
            { label: 'Scala', value: 'scala' },
            { label: 'Haskell', value: 'haskell' }
          ]}
          placeholder="Search programming languages..."
          searchable
          multiple
          search-placeholder="Filter languages..."
          @nr-change=${(e: any) => {
            console.log('Multiple searchable select changed:', e.detail.value);
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Search and select multiple programming languages
        </small>
      </div>
      
      <div>
        <h4>Search with no results</h4>
        <hy-select 
          .options=${[
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' }
          ]}
          placeholder="Try searching for 'yellow'..."
          searchable
          search-placeholder="Search colors..."
          no-options-message="No colors found"
          @nr-change=${(e: any) => {
            console.log('No results select changed:', e.detail.value);
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Type "yellow" to see the no results message
        </small>
      </div>
    </div>
  `,
};

// Multiple selection with tags
export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Multiple selection mode allows users to select multiple options. Selected items are displayed as removable tags.'
      }
    }
  },
  args: {
    multiple: true,
    placeholder: 'Select programming languages',
    searchable: true,
  },
  render: (args) => html`
    <hy-select
      .options=${[
        { label: 'JavaScript', value: 'js' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'Python', value: 'py' },
        { label: 'Java', value: 'java' },
        { label: 'C++', value: 'cpp' },
        { label: 'Rust', value: 'rust' },
        { label: 'Go', value: 'go' },
        { label: 'PHP', value: 'php' },
        { label: 'Ruby', value: 'ruby' },
        { label: 'Swift', value: 'swift' }
      ]}
      placeholder=${args.placeholder}
      ?multiple=${args.multiple}
      ?searchable=${args.searchable}
      @change=${(e: any) => {
        console.log('Multiple selection changed:', e.detail);
      }}
    ></hy-select>
  `,
};

// Pre-selected values
export const WithDefaults: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Select component with a pre-selected default value. The component displays the selected option on initial render.'
      }
    }
  },
  args: {
    value: 'md',
    placeholder: 'Select size',
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <label>Single with default:</label>
      <hy-select
        .options=${[
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' }
        ]}
        .value=${args.value}
        placeholder=${args.placeholder}
      ></hy-select>
      
      <label>Multiple with defaults:</label>
      <hy-select
        .options=${[
          { label: 'Red', value: 'red' },
          { label: 'Green', value: 'green' },
          { label: 'Blue', value: 'blue' },
          { label: 'Yellow', value: 'yellow' },
          { label: 'Purple', value: 'purple' }
        ]}
        .value=${['red', 'blue']}
        placeholder="Select colors"
        multiple
      ></hy-select>
    </div>
  `,
};

// Interactive placeholder behavior
export const PlaceholderBehavior: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive examples showing how placeholders behave during selection and clearing. Try selecting and clearing values to see how the placeholder reappears.'
      }
    }
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 500px;">
      <div>
        <h4>Single select - placeholder returns after clearing</h4>
        <hy-select 
          .options=${[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' }
          ]}
          placeholder="Choose an option (will reappear when cleared)"
          @nr-change=${(e: any) => {
            console.log('Single select changed:', e.detail.value);
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Select an option, then click the clear button to see placeholder return
        </small>
      </div>
      
      <div>
        <h4>Multiple select - placeholder behavior with tags</h4>
        <hy-select 
          .options=${[
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' },
            { label: 'Yellow', value: 'yellow' }
          ]}
          placeholder="Select colors (placeholder hidden when tags appear)"
          multiple
          @nr-change=${(e: any) => {
            console.log('Multiple select changed:', e.detail.value);
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Select multiple options to see tags replace placeholder, remove all to see placeholder return
        </small>
      </div>
      
      <div>
        <h4>Long placeholder text behavior</h4>
        <hy-select 
          .options=${basicOptions}
          placeholder="This is a very long placeholder text that demonstrates how the component handles lengthy placeholder content gracefully"
          @nr-change=${(e: any) => {
            console.log('Long placeholder select changed:', e.detail.value);
          }}>
        </hy-select>
        <small style="color: #666; margin-top: 8px; display: block;">
          Long placeholder text should be properly truncated or wrapped based on CSS
        </small>
      </div>
    </div>
  `,
};

// Different validation states
export const ValidationStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Various validation and status states including valid, invalid with error message, and loading state.'
      }
    }
  },
  render: () => html`
    <div style="display: grid; gap: 1.5rem; max-width: 400px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Valid State</label>
        <hy-select
          .options=${basicOptions}
          placeholder="Valid selection"
          valid
        ></hy-select>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Invalid State</label>
        <hy-select
          .options=${basicOptions}
          placeholder="Invalid selection"
          .invalid=${true}
          .errorMessage=${'Please select a valid option'}
        ></hy-select>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Loading State</label>
        <hy-select
          .options=${basicOptions}
          placeholder="Loading state"
          .loading=${true}
        ></hy-select>
      </div>
    </div>
  `,
};

// Disabled options and component
export const DisabledStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of disabled functionality including individual disabled options within the dropdown and entire component disabled state.'
      }
    }
  },
  args: {
    disabled: false,
  },
  render: (args) => html`
    <div style="display: grid; gap: 1.5rem; max-width: 400px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Individual Disabled Options</label>
        <hy-select
          .options=${[
            { label: 'Available Option', value: 'available' },
            { label: 'Disabled Option', value: 'disabled', disabled: true },
            { label: 'Another Available', value: 'available2' },
            { label: 'Also Disabled', value: 'disabled2', disabled: true },
            { label: 'Final Available', value: 'available3' }
          ]}
          placeholder="Some options disabled"
        ></hy-select>
        <small style="color: #666; font-size: 0.875rem;">Try opening - some options are disabled</small>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Entire Component Disabled</label>
        <hy-select
          .options=${basicOptions}
          placeholder="Entire component disabled"
          ?disabled=${args.disabled || true}
        ></hy-select>
        <small style="color: #666; font-size: 0.875rem;">Cannot be opened or interacted with</small>
      </div>
    </div>
  `,
};

// Rich options with icons and descriptions
export const RichOptions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Select options enhanced with icons and descriptions for richer visual presentation and better user experience.'
      }
    }
  },
  args: {
    placeholder: 'Select an action',
    searchable: true,
  },
  render: (args) => html`
    <div style="display: grid; gap: 1.5rem; max-width: 400px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Actions with Icons & Descriptions</label>
        <hy-select
          .options=${[
            { 
              label: 'User Profile', 
              value: 'profile',
              icon: '👤',
              description: 'Manage your account settings and preferences'
            },
            { 
              label: 'Dashboard', 
              value: 'dashboard',
              icon: '📊',
              description: 'View analytics and key metrics'
            },
            { 
              label: 'Settings', 
              value: 'settings',
              icon: '⚙️',
              description: 'Configure application preferences'
            },
            { 
              label: 'Messages', 
              value: 'messages',
              icon: '💬',
              description: 'Read and send messages'
            },
            { 
              label: 'Help & Support', 
              value: 'help',
              icon: '❓',
              description: 'Get assistance and documentation'
            },
            { 
              label: 'Logout', 
              value: 'logout',
              icon: '🚪',
              description: 'Sign out of your account'
            }
          ]}
          placeholder=${args.placeholder}
          ?searchable=${args.searchable}
        ></hy-select>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">File Types</label>
        <hy-select
          .options=${[
            { label: 'Document', value: 'doc', icon: '📄', description: 'Word documents and PDFs' },
            { label: 'Spreadsheet', value: 'xls', icon: '📊', description: 'Excel and CSV files' },
            { label: 'Image', value: 'img', icon: '🖼️', description: 'Photos and graphics' },
            { label: 'Video', value: 'vid', icon: '🎥', description: 'Movies and recordings' },
            { label: 'Audio', value: 'aud', icon: '🎵', description: 'Music and sound files' }
          ]}
          placeholder="Select file type"
          multiple
        ></hy-select>
      </div>
    </div>
  `,
};

// Large dataset for performance testing
export const LargeDataset: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Performance test with large datasets. Demonstrates search functionality and how the component handles many options efficiently.'
      }
    }
  },
  args: {
    searchable: true,
    multiple: false,
    placeholder: 'Search through many options',
  },
  render: (args) => html`
    <div style="display: grid; gap: 1.5rem; max-width: 500px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Countries (100+ options)</label>
        <hy-select
          .options=${[
            'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
            'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile',
            'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Egypt',
            'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland',
            'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
            'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'South Korea', 'Kuwait',
            'Latvia', 'Lithuania', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands',
            'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
            'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
            'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
            'Ukraine', 'United Kingdom', 'United States', 'Vietnam', 'Zimbabwe'
          ].map(country => ({ 
            label: country, 
            value: country.toLowerCase().replace(/\s+/g, '-'),
            description: `Country: ${country}`
          }))}
          placeholder=${args.placeholder}
          ?searchable=${args.searchable}
          ?multiple=${args.multiple}
        ></hy-select>
        <small style="color: #666; font-size: 0.875rem;">Type to search through options</small>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Generated Items (200 options)</label>
        <hy-select
          .options=${Array.from({ length: 200 }, (_, i) => ({
            label: `Item ${i + 1} - ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'][i % 10]}`,
            value: `item${i + 1}`,
            description: `Generated item ${i + 1} for testing`
          }))}
          placeholder="Search through 200 generated items"
          searchable
          multiple
        ></hy-select>
        <small style="color: #666; font-size: 0.875rem;">Stress test with many options</small>
      </div>
    </div>
  `,
};

// Interactive example with events
export const EventHandling: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Event handling demonstration. Open browser console to see events fired during user interactions. Shows change, focus, blur, and dropdown events.'
      }
    }
  },
  render: () => html`
    <div style="display: grid; gap: 1.5rem; max-width: 500px;">
      <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
        <strong>📝 Instructions:</strong>
        <ul style="margin: 0.5rem 0 0 1rem; font-size: 0.875rem;">
          <li>Open browser console (F12)</li>
          <li>Interact with the selects below</li>
          <li>Watch for logged events</li>
        </ul>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Single Selection Events</label>
        <hy-select
          .options=${[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' }
          ]}
          placeholder="Select to see events"
          @change=${(e: any) => {
            console.log('✅ Change event:', e.detail);
            // You can also show a notification or update UI here
          }}
          @dropdown-open=${() => console.log('🔽 Dropdown opened')}
          @dropdown-close=${() => console.log('🔼 Dropdown closed')}
        ></hy-select>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Multiple Selection Events</label>
        <hy-select
          .options=${[
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
            { label: 'Angular', value: 'angular' },
            { label: 'Svelte', value: 'svelte' }
          ]}
          placeholder="Select frameworks"
          multiple
          @change=${(e: any) => {
            console.log('🔄 Multiple selection changed:', e.detail);
            console.log('Current values:', e.detail.value);
          }}
          @tag-remove=${(e: any) => {
            console.log('🗑️ Tag removed:', e.detail);
          }}
        ></hy-select>
      </div>
    </div>
  `,
};

// Interactive playground with all controls
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all select component features. Use the controls panel below to experiment with different properties and configurations.'
      }
    }
  },
  args: {
    placeholder: 'Choose your options...',
    multiple: false,
    disabled: false,
    searchable: false,
    searchPlaceholder: 'Type to search...',
    loading: false,
    valid: false,
    invalid: false,
    errorMessage: 'Please make a valid selection',
    size: 'medium',
    maxHeight: '200px',
  },
  render: (args) => html`
    <div style="max-width: 400px;">
      <hy-select
        .options=${[
          { label: '🍎 Apple', value: 'apple', description: 'Fresh red apples' },
          { label: '🍌 Banana', value: 'banana', description: 'Yellow bananas' },
          { label: '🍒 Cherry', value: 'cherry', description: 'Sweet cherries' },
          { label: '🥝 Kiwi', value: 'kiwi', description: 'Exotic kiwi fruit' },
          { label: '🍓 Strawberry', value: 'strawberry', description: 'Juicy strawberries' },
          { label: '🥭 Mango', value: 'mango', description: 'Tropical mangoes' },
          { label: '🍇 Grapes', value: 'grapes', description: 'Purple grapes' },
          { label: '🍊 Orange', value: 'orange', description: 'Citrus oranges' },
          { label: '🍑 Peach', value: 'peach', description: 'Soft peaches' },
          { label: '🥥 Coconut', value: 'coconut', description: 'Fresh coconuts', disabled: true }
        ]}
        placeholder=${args.placeholder}
        ?multiple=${args.multiple}
        ?disabled=${args.disabled}
        ?searchable=${args.searchable}
        search-placeholder=${args.searchPlaceholder}
        ?loading=${args.loading}
        ?valid=${args.valid}
        ?invalid=${args.invalid}
        .errorMessage=${args.errorMessage}
        size=${args.size}
        .maxHeight=${args.maxHeight}
        @change=${(e: any) => {
          console.log('Playground selection changed:', e.detail);
        }}
      ></hy-select>
    </div>
  `,
};

// Comprehensive showcase of all select component features
export const AllFeatures: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase demonstrating all select component features, states, and interactions in a single organized layout.'
      }
    }
  },
  render: () => html`
    <div style="padding: 20px; display: grid; gap: 30px;">
      <h2>Select Component</h2>
      
      <!-- Basic Single Selection -->
      <section>
        <h3>1. Basic Single Selection</h3>
        <p>Click to open, select an option, dropdown should close automatically</p>
        <hy-select
          .options=${[
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Cherry', value: 'cherry' },
            { label: 'Date', value: 'date' }
          ]}
          placeholder="Select a fruit"
          @change=${(e: any) => console.log('Single selection:', e.detail)}
        ></hy-select>
      </section>

      <!-- Multiple Selection -->
      <section>
        <h3>2. Multiple Selection</h3>
        <p>Multiple selection - dropdown stays open, shows tags for selected items</p>
        <hy-select
          .options=${[
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
            { label: 'Python', value: 'py' },
            { label: 'Rust', value: 'rust' },
            { label: 'Go', value: 'go' }
          ]}
          placeholder="Select programming languages"
          multiple
          @change=${(e: any) => console.log('Multiple selection:', e.detail)}
        ></hy-select>
      </section>

      <!-- Pre-selected Values -->
      <section>
        <h3>3. Pre-selected Values</h3>
        <p>Single and multiple with default selections</p>
        <div style="display: grid; gap: 15px; grid-template-columns: 1fr 1fr;">
          <hy-select
            .options=${[
              { label: 'Small', value: 'sm' },
              { label: 'Medium', value: 'md' },
              { label: 'Large', value: 'lg' }
            ]}
            .defaultValue=${['md']}
            placeholder="Size (pre-selected)"
          ></hy-select>
          <hy-select
            .options=${[
              { label: 'Red', value: 'red' },
              { label: 'Green', value: 'green' },
              { label: 'Blue', value: 'blue' },
              { label: 'Yellow', value: 'yellow' }
            ]}
            .defaultValue=${['red', 'blue']}
            placeholder="Colors (multiple pre-selected)"
            multiple
          ></hy-select>
        </div>
      </section>

      <!-- Positioning Test -->
      <section>
        <h3>4. Positioning Test</h3>
        <p>Multiple selects to test positioning (second should not go to left: 0)</p>
        <div style="display: grid; gap: 15px; grid-template-columns: 1fr 1fr 1fr;">
          <hy-select
            .options=${[
              { label: 'Option A1', value: 'a1' },
              { label: 'Option A2', value: 'a2' },
              { label: 'Option A3', value: 'a3' }
            ]}
            placeholder="First Select"
          ></hy-select>
          <hy-select
            .options=${[
              { label: 'Option B1', value: 'b1' },
              { label: 'Option B2', value: 'b2' },
              { label: 'Option B3', value: 'b3' }
            ]}
            placeholder="Second Select"
          ></hy-select>
          <hy-select
            .options=${[
              { label: 'Option C1', value: 'c1' },
              { label: 'Option C2', value: 'c2' },
              { label: 'Option C3', value: 'c3' }
            ]}
            placeholder="Third Select"
          ></hy-select>
        </div>
      </section>

      <!-- Disabled Options -->
      <section>
        <h3>5. Disabled Options</h3>
        <p>Some options are disabled and cannot be selected</p>
        <hy-select
          .options=${[
            { label: 'Available Option 1', value: 'av1' },
            { label: 'Disabled Option', value: 'dis1', disabled: true },
            { label: 'Available Option 2', value: 'av2' },
            { label: 'Another Disabled', value: 'dis2', disabled: true },
            { label: 'Available Option 3', value: 'av3' }
          ]}
          placeholder="Select with disabled options"
        ></hy-select>
      </section>

      <!-- Status States -->
      <section>
        <h3>6. Status States</h3>
        <p>Different status states: success, warning, error</p>
        <div style="display: grid; gap: 15px; grid-template-columns: 1fr 1fr 1fr;">
          <hy-select
            .options=${[
              { label: 'Valid Choice 1', value: 'v1' },
              { label: 'Valid Choice 2', value: 'v2' }
            ]}
            placeholder="Success State"
            status="success"
          ></hy-select>
          <hy-select
            .options=${[
              { label: 'Warning Choice 1', value: 'w1' },
              { label: 'Warning Choice 2', value: 'w2' }
            ]}
            placeholder="Warning State"
            status="warning"
          ></hy-select>
          <hy-select
            .options=${[
              { label: 'Error Choice 1', value: 'e1' },
              { label: 'Error Choice 2', value: 'e2' }
            ]}
            placeholder="Error State"
            status="error"
          ></hy-select>
        </div>
      </section>

      <!-- Disabled Component -->
      <section>
        <h3>7. Disabled Component</h3>
        <p>Entire component is disabled</p>
        <hy-select
          .options=${[
            { label: 'Cannot Select 1', value: 'cs1' },
            { label: 'Cannot Select 2', value: 'cs2' }
          ]}
          placeholder="Disabled select"
          disabled
        ></hy-select>
      </section>

      <!-- Click Outside Test -->
      <section>
        <h3>8. Click Outside Test</h3>
        <p>Open any dropdown above, then click here to test outside click closing</p>
        <div style="padding: 20px; background: #f0f0f0; border-radius: 8px; text-align: center;">
          Click here to test outside click behavior
        </div>
      </section>

      <!-- Event Testing -->
      <section>
        <h3>9. Event Testing</h3>
        <p>Check console for change events when selecting options</p>
        <hy-select
          .options=${[
            { label: 'Event Test 1', value: 'et1' },
            { label: 'Event Test 2', value: 'et2' },
            { label: 'Event Test 3', value: 'et3' }
          ]}
          placeholder="Select to see events in console"
          @change=${(e: any) => {
            console.log('✅ Change event fired:', e.detail);
            alert('Selection changed! Check console for details.');
          }}
          @dropdown-open=${() => console.log('🔽 Dropdown opened')}
          @dropdown-close=${() => console.log('🔼 Dropdown closed')}
        ></hy-select>
      </section>

      <!-- Large Option List -->
      <section>
        <h3>10. Large Option List</h3>
        <p>Test with many options to check scrolling and performance</p>
        <hy-select
          .options=${Array.from({ length: 20 }, (_, i) => ({
            label: `Option ${i + 1} - ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][i % 6]}`,
            value: `opt${i + 1}`
          }))}
          placeholder="Select from many options"
        ></hy-select>
      </section>
    </div>
  `,
};
