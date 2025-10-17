import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';

const meta: Meta = {
  title: 'Data Entry/TimePicker',
  component: 'nr-timepicker',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the time picker',
    },
    value: {
      control: { type: 'text' },
      description: 'Selected time value',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default time value',
    },
    format: {
      control: { type: 'select' },
      options: ['24h', '12h'],
      description: 'Time format (24-hour or 12-hour)',
    },
    showSeconds: {
      control: { type: 'boolean' },
      description: 'Whether to show seconds in the time picker',
    },
    showClock: {
      control: { type: 'boolean' },
      description: 'Whether to show the visual clock interface',
    },
    minuteInterval: {
      control: { type: 'number', min: 1, max: 60 },
      description: 'Minute selection interval',
    },
    secondInterval: {
      control: { type: 'number', min: 1, max: 60 },
      description: 'Second selection interval',
    },
    minTime: {
      control: { type: 'text' },
      description: 'Minimum selectable time',
    },
    maxTime: {
      control: { type: 'text' },
      description: 'Maximum selectable time',
    },
    disabledTimes: {
      control: { type: 'object' },
      description: 'Array of disabled times',
    },
    enabledTimes: {
      control: { type: 'object' },
      description: 'Array of enabled times (whitelist)',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Time picker size',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled'],
      description: 'Time picker variant',
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'error', 'warning', 'success'],
      description: 'Validation state',
    },
    placement: {
      control: { type: 'select' },
      options: ['auto', 'bottom', 'top'],
      description: 'Clock dropdown placement',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input',
    },
    helperText: {
      control: { type: 'text' },
      description: 'Helper text below the input',
    },
    name: {
      control: { type: 'text' },
      description: 'Form field name',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the time picker is disabled',
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the time picker is read-only',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the time picker is required',
    },
    clockOpen: {
      control: { type: 'boolean' },
      description: 'Whether the clock dropdown is open',
    },
    clockMode: {
      control: { type: 'select' },
      options: ['hours', 'minutes', 'seconds'],
      description: 'Current clock selection mode',
    },
    scrollBehavior: {
      control: { type: 'select' },
      options: ['auto', 'instant', 'smooth'],
      description: 'Scroll behavior for dropdown navigation - smooth provides animated scrolling',
    },
  },
  args: {
    label: 'Select Time',
    format: '24h',
    showSeconds: false,
    showClock: true,
    minuteInterval: 1,
    secondInterval: 1,
    size: 'medium',
    variant: 'default',
    state: 'default',
    placement: 'auto',
    disabled: false,
    readonly: false,
    required: false,
    clockOpen: false,
    clockMode: 'hours',
    scrollBehavior: 'instant',
  },
};

export default meta;
type Story = StoryObj;

// Basic TimePicker
export const Default: Story = {
  args: {
    label: 'Select Time',
    placeholder: 'Choose a time',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .placeholder=${args.placeholder}
      .value=${args.value}
      .format=${args.format}
      .showSeconds=${args.showSeconds}
      .showClock=${args.showClock}
      .size=${args.size}
      .variant=${args.variant}
      .state=${args.state}
      .placement=${args.placement}
      .disabled=${args.disabled}
      .readonly=${args.readonly}
      .required=${args.required}
      .helperText=${args.helperText}
      .scrollBehavior=${args.scrollBehavior}
    ></nr-timepicker>
  `,
};

// 12-Hour Format
export const TwelveHourFormat: Story = {
  args: {
    label: 'Meeting Time',
    format: '12h',
    value: '2:30 PM',
    helperText: '12-hour format with AM/PM',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .format=${args.format}
      .value=${args.value}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
      .scrollBehavior=${args.scrollBehavior}
    ></nr-timepicker>
  `,
};

// With Seconds
export const WithSeconds: Story = {
  args: {
    label: 'Precise Time',
    showSeconds: true,
    value: '14:30:45',
    helperText: 'Includes seconds for precise timing',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .showSeconds=${args.showSeconds}
      .value=${args.value}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
      .scrollBehavior=${args.scrollBehavior}
    ></nr-timepicker>
  `,
};

// 12-Hour with Seconds
export const TwelveHourWithSeconds: Story = {
  args: {
    label: 'Full Time Format',
    format: '12h',
    showSeconds: true,
    value: '2:30:15 PM',
    helperText: '12-hour format with seconds',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .format=${args.format}
      .showSeconds=${args.showSeconds}
      .value=${args.value}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
    ></nr-timepicker>
  `,
};

// Time Range Constraints
export const TimeRange: Story = {
  args: {
    label: 'Business Hours',
    minTime: '09:00',
    maxTime: '17:00',
    helperText: 'Available between 9 AM and 5 PM',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .minTime=${args.minTime}
      .maxTime=${args.maxTime}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
    ></nr-timepicker>
  `,
};

// Custom Intervals
export const CustomIntervals: Story = {
  args: {
    label: 'Appointment Slots',
    minuteInterval: 15,
    helperText: '15-minute intervals only',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .minuteInterval=${args.minuteInterval}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
    ></nr-timepicker>
  `,
};

// Different Sizes
export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
      <nr-timepicker
        label="Small Time Picker"
        size="small"
        value="10:30"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Medium Time Picker (Default)"
        size="medium"
        value="12:00"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Large Time Picker"
        size="large"
        value="15:45"
      ></nr-timepicker>
    </div>
  `,
};

// Variants
export const Variants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
      <nr-timepicker
        label="Default Variant"
        variant="default"
        value="09:00"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Outlined Variant"
        variant="outlined"
        value="12:30"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Filled Variant"
        variant="filled"
        value="18:00"
      ></nr-timepicker>
    </div>
  `,
};

// States
export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
      <nr-timepicker
        label="Required Field"
        required
        helperText="This field is required"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Error State"
        state="error"
        value="25:00"
        helperText="Invalid time format"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Warning State"
        state="warning"
        value="23:59"
        helperText="Very late time selected"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Success State"
        state="success"
        value="09:30"
        helperText="Perfect time choice!"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Disabled"
        disabled
        value="12:00"
        helperText="Cannot be changed"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Read Only"
        readonly
        value="15:30"
        helperText="Display only"
      ></nr-timepicker>
    </div>
  `,
};

// Disabled Times
export const DisabledTimes: Story = {
  args: {
    label: 'Available Slots',
    disabledTimes: ['12:00', '12:30', '13:00', '13:30'],
    helperText: 'Lunch break times are unavailable',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .disabledTimes=${args.disabledTimes}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
    ></nr-timepicker>
  `,
};

// Enabled Times Only
export const EnabledTimesOnly: Story = {
  args: {
    label: 'Meeting Slots',
    enabledTimes: ['09:00', '10:30', '14:00', '15:30', '17:00'],
    helperText: 'Only specific meeting times available',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .enabledTimes=${args.enabledTimes}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
    ></nr-timepicker>
  `,
};

// Without Clock Interface
export const InputOnly: Story = {
  args: {
    label: 'Input Only',
    showClock: false,
    helperText: 'No visual clock, input field only',
  },
  render: (args) => html`
    <nr-timepicker
      .label=${args.label}
      .showClock=${args.showClock}
      .helperText=${args.helperText}
      .size=${args.size}
      .variant=${args.variant}
    ></nr-timepicker>
  `,
};

// Interactive Example
export const Interactive: Story = {
  args: {
    label: 'Interactive Demo',
    format: '24h',
    showSeconds: true,
    helperText: 'Try interacting with this time picker',
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
      <nr-timepicker
        id="interactive-timepicker"
        .label=${args.label}
        .format=${args.format}
        .showSeconds=${args.showSeconds}
        .helperText=${args.helperText}
        @nr-time-change=${(e: CustomEvent) => {
          console.log('Time changed:', e.detail);
          // Update display
          const display = document.getElementById('time-display');
          if (display) {
            display.textContent = `Selected: ${e.detail.value}`;
          }
        }}
        @nr-clock-open=${() => {
          console.log('Clock opened');
        }}
        @nr-clock-close=${() => {
          console.log('Clock closed');
        }}
      ></nr-timepicker>
      
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button 
          @click=${() => {
            const picker = document.getElementById('interactive-timepicker') as any;
            picker?.setToNow();
          }}
          style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;"
        >
          Set to Now
        </button>
        
        <button 
          @click=${() => {
            const picker = document.getElementById('interactive-timepicker') as any;
            picker?.clear();
          }}
          style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;"
        >
          Clear
        </button>
        
        <button 
          @click=${() => {
            const picker = document.getElementById('interactive-timepicker') as any;
            picker?.openClock();
          }}
          style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;"
        >
          Open Clock
        </button>
        
        <button 
          @click=${() => {
            const picker = document.getElementById('interactive-timepicker') as any;
            if (picker) picker.value = '14:30:00';
          }}
          style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;"
        >
          Set 14:30:00
        </button>
      </div>
      
      <div 
        id="time-display"
        style="padding: 1rem; background: #f3f4f6; border-radius: 4px; color: #374151; font-family: monospace;"
      >
        No time selected
      </div>
    </div>
  `,
};

// Form Integration
export const FormIntegration: Story = {
  render: () => html`
    <form 
      style="display: flex; flex-direction: column; gap: 1rem; max-width: 300px;"
      @submit=${(e: Event) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        console.log('Form submitted:', data);
        alert('Form submitted! Check console for data.');
      }}
    >
      <nr-timepicker
        label="Start Time"
        name="startTime"
        required
        value="09:00"
        helperText="When does your workday start?"
      ></nr-timepicker>
      
      <nr-timepicker
        label="End Time"
        name="endTime"
        required
        value="17:00"
        helperText="When does your workday end?"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Break Time"
        name="breakTime"
        format="12h"
        value="12:30 PM"
        helperText="Lunch break time"
      ></nr-timepicker>
      
      <button 
        type="submit"
        style="padding: 0.75rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Submit Schedule
      </button>
    </form>
  `,
};

// Smooth Scroll Behavior
export const SmoothScrollBehavior: Story = {
  args: {
    label: 'Smooth Scroll Animation',
    scrollBehavior: 'smooth',
    value: '14:30:45',
    showSeconds: true,
    helperText: 'Animated scrolling when opening dropdown or changing values',
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <nr-timepicker
        .label=${args.label}
        .scrollBehavior=${args.scrollBehavior}
        .value=${args.value}
        .showSeconds=${args.showSeconds}
        .helperText=${args.helperText}
        .size=${args.size}
        .variant=${args.variant}
      ></nr-timepicker>
      
      <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; max-width: 400px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #333;">Try these actions to see smooth scrolling:</h4>
        <ul style="margin: 0; padding-left: 1.5rem; color: #666;">
          <li>Click the input to open the dropdown</li>
          <li>Type a time (e.g., "08:15:30") and watch columns scroll smoothly</li>
          <li>Click the "Now" button to see animated scroll to current time</li>
          <li>Change between hour/minute/second selections</li>
        </ul>
      </div>
      
      <div style="display: flex; gap: 1rem;">
        <nr-timepicker
          label="Instant (Default)"
          scroll-behavior="instant"
          value="09:15:30"
          show-seconds
          helper-text="No animation - instant scroll"
        ></nr-timepicker>
        
        <nr-timepicker
          label="Smooth Animation"
          scroll-behavior="smooth"
          value="15:45:15"
          show-seconds
          helper-text="Smooth animated scrolling"
        ></nr-timepicker>
      </div>
    </div>
  `,
};

// Advanced Configuration
export const AdvancedConfiguration: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      <nr-timepicker
        label="Office Hours"
        min-time="08:00"
        max-time="18:00"
        minute-interval="30"
        helperText="30-min intervals, office hours only"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Shift Schedule"
        format="12h"
        .disabledTimes=${['12:00 PM', '12:30 PM', '1:00 PM']}
        helperText="Lunch hours disabled"
      ></nr-timepicker>
      
      <nr-timepicker
        label="Training Sessions"
        .enabledTimes=${['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']}
        format="12h"
        helperText="Only specific slots available"
      ></nr-timepicker>
      
      <nr-timepicker
        label="High Precision"
        show-seconds
        second-interval="5"
        minute-interval="5"
        helperText="5-minute and 5-second intervals"
      ></nr-timepicker>
    </div>
  `,
};