import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './popconfirm.component';
import { PopconfirmPlacement, PopconfirmButtonType, PopconfirmIcon } from './popconfirm.types';

const meta: Meta = {
  title: 'Feedback/Popconfirm',
  component: 'nr-popconfirm',
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the confirmation box',
    },
    description: {
      control: 'text',
      description: 'Description of the confirmation box',
    },
    okText: {
      control: 'text',
      description: 'Text of the OK button',
    },
    cancelText: {
      control: 'text',
      description: 'Text of the Cancel button',
    },
    okType: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'default'],
      description: 'Button type of the OK button',
    },
    showCancel: {
      control: 'boolean',
      description: 'Show cancel button',
    },
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
      description: 'Placement of the popconfirm',
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'focus'],
      description: 'Trigger mode',
    },
    icon: {
      control: 'text',
      description: 'Icon name',
    },
    iconColor: {
      control: 'color',
      description: 'Custom icon color',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the popconfirm is disabled',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show arrow',
    },
  },
};

export default meta;
type Story = StoryObj;

// Basic popconfirm
export const Default: Story = {
  render: () => html`
    <nr-popconfirm
      title="Are you sure delete this task?"
      ok-text="Yes"
      cancel-text="No"
      @nr-confirm=${() => console.log('Confirmed!')}
      @nr-cancel=${() => console.log('Cancelled!')}>
      <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Delete</button>
    </nr-popconfirm>
  `,
};

// With description
export const WithDescription: Story = {
  render: () => html`
    <nr-popconfirm
      title="Delete the task"
      description="Are you sure you want to delete this task? This action cannot be undone."
      ok-type=${PopconfirmButtonType.Danger}
      ok-text="Delete"
      cancel-text="Cancel"
      @nr-confirm=${() => console.log('Task deleted!')}>
      <button slot="trigger" style="padding: 8px 16px; cursor: pointer; background: #ff4d4f; color: white; border: none; border-radius: 4px;">
        Delete Task
      </button>
    </nr-popconfirm>
  `,
};

// Custom icon
export const CustomIcon: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <nr-popconfirm
        title="Change status?"
        icon=${PopconfirmIcon.Question}
        icon-color="#1890ff">
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Question</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Info message"
        icon=${PopconfirmIcon.Info}
        icon-color="#1890ff">
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Info</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Success operation"
        icon=${PopconfirmIcon.Success}
        icon-color="#52c41a">
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Success</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Error occurred"
        icon=${PopconfirmIcon.Error}
        icon-color="#ff4d4f"
        ok-type=${PopconfirmButtonType.Danger}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Error</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Warning message"
        icon=${PopconfirmIcon.Warning}
        icon-color="#faad14">
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Warning</button>
      </nr-popconfirm>
    </div>
  `,
};

// Different placements
export const Placements: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 50px; padding: 100px; place-items: center;">
      <!-- Top row -->
      <nr-popconfirm title="Top Start" placement=${PopconfirmPlacement.TopStart}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">TL</button>
      </nr-popconfirm>
      <nr-popconfirm title="Top" placement=${PopconfirmPlacement.Top}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Top</button>
      </nr-popconfirm>
      <nr-popconfirm title="Top End" placement=${PopconfirmPlacement.TopEnd}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">TR</button>
      </nr-popconfirm>

      <!-- Middle row -->
      <nr-popconfirm title="Left Start" placement=${PopconfirmPlacement.LeftStart}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">LT</button>
      </nr-popconfirm>
      <div></div>
      <nr-popconfirm title="Right Start" placement=${PopconfirmPlacement.RightStart}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">RT</button>
      </nr-popconfirm>

      <!-- Middle row 2 -->
      <nr-popconfirm title="Left" placement=${PopconfirmPlacement.Left}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Left</button>
      </nr-popconfirm>
      <div></div>
      <nr-popconfirm title="Right" placement=${PopconfirmPlacement.Right}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Right</button>
      </nr-popconfirm>

      <!-- Middle row 3 -->
      <nr-popconfirm title="Left End" placement=${PopconfirmPlacement.LeftEnd}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">LB</button>
      </nr-popconfirm>
      <div></div>
      <nr-popconfirm title="Right End" placement=${PopconfirmPlacement.RightEnd}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">RB</button>
      </nr-popconfirm>

      <!-- Bottom row -->
      <nr-popconfirm title="Bottom Start" placement=${PopconfirmPlacement.BottomStart}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">BL</button>
      </nr-popconfirm>
      <nr-popconfirm title="Bottom" placement=${PopconfirmPlacement.Bottom}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Bottom</button>
      </nr-popconfirm>
      <nr-popconfirm title="Bottom End" placement=${PopconfirmPlacement.BottomEnd}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">BR</button>
      </nr-popconfirm>
    </div>
  `,
};

// Different button types
export const ButtonTypes: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <nr-popconfirm
        title="Primary action?"
        ok-type=${PopconfirmButtonType.Primary}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Primary</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Delete item?"
        ok-type=${PopconfirmButtonType.Danger}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Danger</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Update settings?"
        ok-type=${PopconfirmButtonType.Secondary}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Secondary</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Continue?"
        ok-type=${PopconfirmButtonType.Default}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Default</button>
      </nr-popconfirm>
    </div>
  `,
};

// Without cancel button
export const WithoutCancel: Story = {
  render: () => html`
    <nr-popconfirm
      title="Click to proceed"
      description="This action will be executed immediately."
      ?show-cancel=${false}
      ok-text="Proceed">
      <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Proceed</button>
    </nr-popconfirm>
  `,
};

// Hover trigger
export const HoverTrigger: Story = {
  render: () => html`
    <nr-popconfirm
      title="Hover to see this"
      description="This popconfirm is triggered by hover."
      trigger="hover">
      <span slot="trigger" style="cursor: pointer; padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 4px; display: inline-block;">
        Hover me
      </span>
    </nr-popconfirm>
  `,
};

// Async confirmation
export const AsyncConfirmation: Story = {
  render: () => {
    const handleAsyncConfirm = async () => {
      console.log('Starting async operation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Async operation completed!');
    };

    return html`
      <nr-popconfirm
        title="Submit form?"
        description="This will save your changes to the server."
        ok-text="Submit"
        @nr-confirm=${handleAsyncConfirm}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer; background: #1890ff; color: white; border: none; border-radius: 4px;">
          Submit Form (2s delay)
        </button>
      </nr-popconfirm>
      <p style="margin-top: 16px; color: #666;">Click the button and watch the console. The OK button will show a loading state for 2 seconds.</p>
    `;
  },
};

// Conditional trigger
export const ConditionalTrigger: Story = {
  render: () => {
    const handleCheckboxChange = (e: Event) => {
      const checkbox = e.target as HTMLInputElement;
      const popconfirm = document.getElementById('conditional-popconfirm') as any;
      if (popconfirm) {
        popconfirm.disabled = checkbox.checked;
      }
    };

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <nr-popconfirm
          id="conditional-popconfirm"
          title="Delete the task"
          description="This action cannot be undone.">
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Delete a task</button>
        </nr-popconfirm>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" @change=${handleCheckboxChange} />
          <span>Whether directly execute</span>
        </label>
        <p style="color: #666; margin: 0;">When checked, the popconfirm is disabled and won't show.</p>
      </div>
    `;
  },
};

// Custom text
export const CustomText: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <nr-popconfirm
        title="Are you sure?"
        ok-text="Confirm"
        cancel-text="Abort">
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Custom Text 1</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Proceed with action?"
        ok-text="Yes, do it"
        cancel-text="No, cancel">
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Custom Text 2</button>
      </nr-popconfirm>

      <nr-popconfirm
        title="Remove this item?"
        ok-text="Remove"
        cancel-text="Keep"
        ok-type=${PopconfirmButtonType.Danger}>
        <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Custom Text 3</button>
      </nr-popconfirm>
    </div>
  `,
};

// Real-world examples
export const RealWorldExamples: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Delete user -->
      <div>
        <h3 style="margin: 0 0 8px 0;">Delete User</h3>
        <nr-popconfirm
          title="Delete user account?"
          description="This will permanently delete the user account and all associated data. This action cannot be undone."
          icon=${PopconfirmIcon.Warning}
          icon-color="#faad14"
          ok-type=${PopconfirmButtonType.Danger}
          ok-text="Delete User"
          cancel-text="Cancel"
          @nr-confirm=${() => console.log('User deleted')}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer; background: #ff4d4f; color: white; border: none; border-radius: 4px;">
            Delete User
          </button>
        </nr-popconfirm>
      </div>

      <!-- Logout -->
      <div>
        <h3 style="margin: 0 0 8px 0;">Logout</h3>
        <nr-popconfirm
          title="Logout?"
          description="You will be logged out of your account."
          icon=${PopconfirmIcon.Question}
          placement=${PopconfirmPlacement.Bottom}
          ok-text="Logout"
          cancel-text="Stay"
          @nr-confirm=${() => console.log('User logged out')}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">
            Logout
          </button>
        </nr-popconfirm>
      </div>

      <!-- Publish post -->
      <div>
        <h3 style="margin: 0 0 8px 0;">Publish Post</h3>
        <nr-popconfirm
          title="Publish this post?"
          description="Your post will be visible to all users."
          icon=${PopconfirmIcon.Info}
          ok-text="Publish"
          cancel-text="Keep Draft"
          @nr-confirm=${() => console.log('Post published')}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer; background: #52c41a; color: white; border: none; border-radius: 4px;">
            Publish Post
          </button>
        </nr-popconfirm>
      </div>

      <!-- Save changes -->
      <div>
        <h3 style="margin: 0 0 8px 0;">Save Changes</h3>
        <nr-popconfirm
          title="Save changes?"
          description="Your changes will be saved to the server."
          icon=${PopconfirmIcon.Success}
          ok-text="Save"
          cancel-text="Discard"
          @nr-confirm=${() => console.log('Changes saved')}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer; background: #1890ff; color: white; border: none; border-radius: 4px;">
            Save Changes
          </button>
        </nr-popconfirm>
      </div>
    </div>
  `,
};

// Carbon dark theme
export const CarbonDarkTheme: Story = {
  render: () => html`
    <div theme="carbon-dark" style="padding: 40px; background: #262626;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <nr-popconfirm
          title="Are you sure?"
          description="This action cannot be undone."
          ok-type=${PopconfirmButtonType.Primary}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Primary</button>
        </nr-popconfirm>

        <nr-popconfirm
          title="Delete item?"
          icon=${PopconfirmIcon.Warning}
          ok-type=${PopconfirmButtonType.Danger}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Danger</button>
        </nr-popconfirm>

        <nr-popconfirm
          title="Continue?"
          icon=${PopconfirmIcon.Question}>
          <button slot="trigger" style="padding: 8px 16px; cursor: pointer;">Question</button>
        </nr-popconfirm>
      </div>
    </div>
  `,
};

// All features combined
export const AllFeatures: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h2>Popconfirm Showcase</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
        <!-- Basic -->
        <nr-popconfirm title="Basic popconfirm">
          <button slot="trigger" style="width: 100%; padding: 8px;">Basic</button>
        </nr-popconfirm>

        <!-- With description -->
        <nr-popconfirm
          title="With description"
          description="Additional context here">
          <button slot="trigger" style="width: 100%; padding: 8px;">Description</button>
        </nr-popconfirm>

        <!-- Danger -->
        <nr-popconfirm
          title="Danger action"
          ok-type=${PopconfirmButtonType.Danger}>
          <button slot="trigger" style="width: 100%; padding: 8px;">Danger</button>
        </nr-popconfirm>

        <!-- Custom icon -->
        <nr-popconfirm
          title="Custom icon"
          icon=${PopconfirmIcon.Success}
          icon-color="#52c41a">
          <button slot="trigger" style="width: 100%; padding: 8px;">Success Icon</button>
        </nr-popconfirm>

        <!-- No cancel -->
        <nr-popconfirm
          title="No cancel button"
          ?show-cancel=${false}>
          <button slot="trigger" style="width: 100%; padding: 8px;">No Cancel</button>
        </nr-popconfirm>

        <!-- Custom placement -->
        <nr-popconfirm
          title="Bottom placement"
          placement=${PopconfirmPlacement.Bottom}>
          <button slot="trigger" style="width: 100%; padding: 8px;">Bottom</button>
        </nr-popconfirm>
      </div>
    </div>
  `,
};
