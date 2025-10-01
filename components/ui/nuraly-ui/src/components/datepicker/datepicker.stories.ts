import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../input/index.js';
import '../button/index.js';
import '../icon/index.js';
import '../select/index.js';
import '../datepicker/index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

const meta: Meta = {
  title: 'Data Entry/DatePicker',
  component: 'nr-datepicker',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the date picker',
    },
    value: {
      control: { type: 'text' },
      description: 'Selected date value',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default date value',
    },
    fieldFormat: {
      control: { type: 'select' },
      options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY', 'DD MMMM YYYY'],
      description: 'Date format pattern',
    },
    locale: {
      control: { type: 'select' },
      options: ['en', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ja', 'zh', 'ar'],
      description: 'Locale for date formatting',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the date picker is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the date picker is required',
    },
    range: {
      control: { type: 'boolean' },
      description: 'Enable date range selection',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Date picker size',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled'],
      description: 'Date picker variant',
    },
    placement: {
      control: { type: 'select' },
      options: ['auto', 'bottom', 'top'],
      description: 'Calendar placement',
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'error', 'warning', 'success'],
      description: 'Validation state',
    },
    minDate: {
      control: { type: 'text' },
      description: 'Minimum selectable date',
    },
    maxDate: {
      control: { type: 'text' },
      description: 'Maximum selectable date',
    },
    helper: {
      control: { type: 'text' },
      description: 'Helper text below the input',
    },
  },
  args: {
    label: 'Select Date',
    fieldFormat: 'DD/MM/YYYY',
    locale: 'en',
    size: 'medium',
    variant: 'default',
    placement: 'auto',
    state: 'default',
  },
};

export default meta;
type Story = StoryObj;

// Basic DatePicker
export const Default: Story = {
  args: {
    label: 'Select Date',
    placeholder: 'Choose a date',
  },
  render: (args) => html`
    <nr-datepicker
      .label=${args.label}
      .placeholder=${args.placeholder}
      .fieldFormat=${args.fieldFormat}
      .locale=${args.locale}
      .size=${args.size}
      .variant=${args.variant}
      .placement=${args.placement}
      .state=${args.state}
      .disabled=${args.disabled}
      .required=${args.required}
    ></nr-datepicker>
  `,
};

// With Default Value
export const WithDefaultValue: Story = {
  args: {
    label: 'Birth Date',
    defaultValue: '15/06/1990',
    helper: 'Please enter your birth date',
  },
  render: (args) => html`
    <nr-datepicker
      .label=${args.label}
      .defaultValue=${args.defaultValue}
      .helper=${args.helper}
      .fieldFormat=${args.fieldFormat}
      .locale=${args.locale}
      .size=${args.size}
    ></nr-datepicker>
  `,
};

// Date Range Picker
export const DateRange: Story = {
  args: {
    label: 'Select Date Range',
    range: true,
    helper: 'Choose start and end dates',
  },
  render: (args) => html`
    <nr-datepicker
      .label=${args.label}
      .range=${args.range}
      .helper=${args.helper}
      .fieldFormat=${args.fieldFormat}
      .locale=${args.locale}
      .size=${args.size}
    ></nr-datepicker>
  `,
};

// Different Sizes
export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: flex-start;">
      <nr-datepicker
        label="Small Date Picker"
        size="small"
        helper="Small size variant"
      ></nr-datepicker>
      
      <nr-datepicker
        label="Medium Date Picker"
        size="medium"
        helper="Medium size variant (default)"
      ></nr-datepicker>
      
      <nr-datepicker
        label="Large Date Picker"
        size="large"
        helper="Large size variant"
      ></nr-datepicker>
    </div>
  `,
};

// Different States
export const ValidationStates: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: flex-start;">
      <nr-datepicker
        label="Default State"
        state="default"
        helper="Normal date picker"
      ></nr-datepicker>
      
      <nr-datepicker
        label="Error State"
        state="error"
        helper="Please select a valid date"
      ></nr-datepicker>
      
      <nr-datepicker
        label="Warning State"
        state="warning"
        helper="Date is in the past"
      ></nr-datepicker>
      
      <nr-datepicker
        label="Success State"
        state="success"
        helper="Valid date selected"
      ></nr-datepicker>
    </div>
  `,
};

// Different Formats
export const DateFormats: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: flex-start;">
      <nr-datepicker
        label="DD/MM/YYYY Format"
        field-format="DD/MM/YYYY"
        default-value="25/12/2023"
        helper="European format"
      ></nr-datepicker>
      
      <nr-datepicker
        label="MM/DD/YYYY Format"
        field-format="MM/DD/YYYY"
        default-value="12/25/2023"
        helper="US format"
      ></nr-datepicker>
      
      <nr-datepicker
        label="YYYY-MM-DD Format"
        field-format="YYYY-MM-DD"
        default-value="2023-12-25"
        helper="ISO format"
      ></nr-datepicker>
      
      <nr-datepicker
        label="DD MMM YYYY Format"
        field-format="DD MMM YYYY"
        default-value="25 Dec 2023"
        helper="Short month name"
      ></nr-datepicker>
      
      <nr-datepicker
        label="DD MMMM YYYY Format"
        field-format="DD MMMM YYYY"
        default-value="25 December 2023"
        helper="Full month name"
      ></nr-datepicker>
    </div>
  `,
};

// Different Locales
export const Locales: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: flex-start;">
      <nr-datepicker
        label="English (en)"
        locale="en"
        field-format="DD MMMM YYYY"
        default-value="25 December 2023"
      ></nr-datepicker>
      
      <nr-datepicker
        label="French (fr)"
        locale="fr"
        field-format="DD MMMM YYYY"
        default-value="25 décembre 2023"
      ></nr-datepicker>
      
      <nr-datepicker
        label="German (de)"
        locale="de"
        field-format="DD MMMM YYYY"
        default-value="25 Dezember 2023"
      ></nr-datepicker>
      
      <nr-datepicker
        label="Spanish (es)"
        locale="es"
        field-format="DD MMMM YYYY"
        default-value="25 diciembre 2023"
      ></nr-datepicker>
    </div>
  `,
};

// With Min/Max Dates
export const WithRestrictions: Story = {
  args: {
    label: 'Select Date (Restricted)',
    minDate: '01/01/2023',
    maxDate: '31/12/2024',
    helper: 'Only dates between 2023 and 2024 are allowed',
  },
  render: (args) => html`
    <nr-datepicker
      .label=${args.label}
      .minDate=${args.minDate}
      .maxDate=${args.maxDate}
      .helper=${args.helper}
      .fieldFormat=${args.fieldFormat}
    ></nr-datepicker>
  `,
};

// Disabled State
export const Disabled: Story = {
  args: {
    label: 'Disabled Date Picker',
    disabled: true,
    value: '15/08/2023',
    helper: 'This date picker is disabled',
  },
  render: (args) => html`
    <nr-datepicker
      .label=${args.label}
      .disabled=${args.disabled}
      .value=${args.value}
      .helper=${args.helper}
      .fieldFormat=${args.fieldFormat}
    ></nr-datepicker>
  `,
};

// Required Field
export const Required: Story = {
  args: {
    label: 'Required Date',
    required: true,
    helper: 'This field is required',
  },
  render: (args) => html`
    <nr-datepicker
      .label=${args.label}
      .required=${args.required}
      .helper=${args.helper}
      .fieldFormat=${args.fieldFormat}
    ></nr-datepicker>
  `,
};

// Interactive Example with Events
export const WithEvents: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: flex-start;">
      <nr-datepicker
        label="Date with Events"
        helper="Check the console for event logs"
        @nr-date-change=${(e: CustomEvent) => {
          console.log('Date changed:', e.detail);
          const output = document.getElementById('date-output');
          if (output) {
            output.textContent = `Selected: ${e.detail.value}`;
          }
        }}
        @nr-calendar-open=${() => {
          console.log('Calendar opened');
        }}
        @nr-calendar-close=${() => {
          console.log('Calendar closed');
        }}
      ></nr-datepicker>
      
      <div id="date-output" style="padding: 10px; background: #f5f5f5; border-radius: 4px; font-family: monospace;">
        Selected: (none)
      </div>
    </div>
  `,
};

// Range Picker with Events
export const RangeWithEvents: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: flex-start;">
      <nr-datepicker
        label="Date Range with Events"
        range
        helper="Select a date range"
        @nr-range-change=${(e: CustomEvent) => {
          console.log('Range changed:', e.detail);
          const output = document.getElementById('range-output');
          if (output) {
            output.textContent = `Range: ${e.detail.value}`;
          }
        }}
        @nr-date-change=${(e: CustomEvent) => {
          console.log('Individual date in range:', e.detail);
        }}
      ></nr-datepicker>
      
      <div id="range-output" style="padding: 10px; background: #f5f5f5; border-radius: 4px; font-family: monospace;">
        Range: (none selected)
      </div>
    </div>
  `,
};

// Complex Example with All Features
export const ComplexExample: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 30px; max-width: 600px;">
      <h3>Booking Form Example</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <nr-datepicker
          label="Check-in Date"
          required
          min-date="01/01/2024"
          helper="Select your arrival date"
          field-format="DD/MM/YYYY"
        ></nr-datepicker>
        
        <nr-datepicker
          label="Check-out Date"
          required
          min-date="02/01/2024"
          helper="Select your departure date"
          field-format="DD/MM/YYYY"
        ></nr-datepicker>
      </div>
      
      <nr-datepicker
        label="Special Event Date Range"
        range
        field-format="DD MMM YYYY"
        helper="Select the event duration"
        locale="en"
        size="large"
      ></nr-datepicker>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <nr-datepicker
          label="Birth Date"
          field-format="DD/MM/YYYY"
          max-date="31/12/2010"
          helper="Must be over 13"
          size="small"
        ></nr-datepicker>
        
        <nr-datepicker
          label="Appointment"
          field-format="DD MMM YYYY"
          min-date="01/01/2024"
          helper="Future dates only"
          size="medium"
        ></nr-datepicker>
        
        <nr-datepicker
          label="Anniversary"
          field-format="DD MMMM"
          helper="Day and month only"
          size="small"
        ></nr-datepicker>
      </div>
    </div>
  `,
};