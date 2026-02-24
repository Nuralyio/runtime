import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './popconfirm.component';
import './popconfirm-manager.component';
import '../select/select.component';
import { PopconfirmPlacement, PopconfirmButtonType, PopconfirmIcon } from './popconfirm.types';
import { NrPopconfirmManagerElement } from './popconfirm-manager.component';

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
    open: {
      control: 'boolean',
      description: 'Whether the popconfirm is open',
      defaultValue: false,
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    open: false,
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
  args: {
    open: false,
    showCancel: false,
  },
  render: (args) => html`
    <nr-popconfirm
      title="Click to proceed"
      description="This action will be executed immediately."
      ?show-cancel=${args.showCancel}
      ?open=${args.open}
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

// Selection confirmation - List items
export const SelectionConfirmList: Story = {
  render: () => {
    const items = [
      { id: 1, name: 'Project Alpha', status: 'active' },
      { id: 2, name: 'Project Beta', status: 'pending' },
      { id: 3, name: 'Project Gamma', status: 'completed' },
      { id: 4, name: 'Project Delta', status: 'active' },
    ];

    return html`
      <div style="max-width: 400px;">
        <h3 style="margin: 0 0 16px 0;">Select a project to delete</h3>
        <ul style="list-style: none; padding: 0; margin: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          ${items.map(item => html`
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e0e0e0;">
              <div>
                <div style="font-weight: 500;">${item.name}</div>
                <div style="font-size: 12px; color: #666;">${item.status}</div>
              </div>
              <nr-popconfirm
                title="Delete ${item.name}?"
                description="This project and all its data will be permanently deleted."
                ok-type="danger"
                ok-text="Delete"
                icon="alert-triangle"
                icon-color="#ff4d4f"
                placement="left"
                @nr-confirm=${() => console.log(`Deleted: ${item.name}`)}>
                <button slot="trigger" style="padding: 4px 12px; cursor: pointer; background: #fff; border: 1px solid #ff4d4f; color: #ff4d4f; border-radius: 4px; font-size: 12px;">
                  Delete
                </button>
              </nr-popconfirm>
            </li>
          `)}
        </ul>
      </div>
    `;
  },
};

// Selection confirmation - With nr-select component
export const SelectionConfirmWithSelect: Story = {
  render: () => {
    const roleOptions = [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
      { value: 'guest', label: 'Guest' },
    ];

    let pendingValue: string | null = null;

    const handleSelectChange = (e: CustomEvent) => {
      pendingValue = e.detail.value;
      console.log(`Selected: ${pendingValue} - waiting for confirmation`);

      // Open the popconfirm
      const popconfirm = document.getElementById('select-popconfirm') as any;
      if (popconfirm) {
        popconfirm.open = true;
      }
    };

    const handleConfirm = () => {
      console.log(`Confirmed selection: ${pendingValue}`);
    };

    const handleCancel = () => {
      console.log('Selection cancelled');
      pendingValue = null;
    };

    return html`
      <div style="max-width: 300px;">
        <h3 style="margin: 0 0 16px 0;">Select with confirmation</h3>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">Selection requires confirmation before applying.</p>

        <div style="position: relative;">
          <nr-select
            id="role-select"
            placeholder="Select a role"
            .options=${roleOptions}
            @nr-change=${handleSelectChange}>
          </nr-select>

          <nr-popconfirm
            id="select-popconfirm"
            title="Confirm role change?"
            description="This will update the user's permissions immediately."
            ok-text="Apply"
            icon="user-check"
            icon-color="#1890ff"
            @nr-confirm=${handleConfirm}
            @nr-cancel=${handleCancel}>
            <span slot="trigger"></span>
          </nr-popconfirm>
        </div>
      </div>
    `;
  },
};

// Selection confirmation - Dropdown options (button style)
export const SelectionConfirmDropdown: Story = {
  render: () => {
    const roles = ['Admin', 'Editor', 'Viewer', 'Guest'];

    return html`
      <div style="max-width: 300px;">
        <h3 style="margin: 0 0 16px 0;">Change user role</h3>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">Current role: <strong>Editor</strong></p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${roles.map(role => html`
            <nr-popconfirm
              title="Change role to ${role}?"
              description="This will update the user's permissions immediately."
              ok-text="Change Role"
              icon="user"
              icon-color="#1890ff"
              placement="right"
              @nr-confirm=${() => console.log(`Role changed to: ${role}`)}>
              <button slot="trigger" style="width: 100%; padding: 10px 16px; cursor: pointer; background: #fff; border: 1px solid #d9d9d9; border-radius: 4px; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                <span>${role}</span>
                <span style="color: #999; font-size: 12px;">Click to select</span>
              </button>
            </nr-popconfirm>
          `)}
        </div>
      </div>
    `;
  },
};

// Selection confirmation - Radio options
export const SelectionConfirmRadio: Story = {
  render: () => {
    const plans = [
      { id: 'free', name: 'Free', price: '$0/mo', features: 'Basic features' },
      { id: 'pro', name: 'Pro', price: '$19/mo', features: 'All features + priority support' },
      { id: 'enterprise', name: 'Enterprise', price: '$99/mo', features: 'Custom solutions + dedicated manager' },
    ];

    return html`
      <div style="max-width: 400px;">
        <h3 style="margin: 0 0 16px 0;">Select a subscription plan</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${plans.map(plan => html`
            <nr-popconfirm
              title="Switch to ${plan.name} plan?"
              description="You will be charged ${plan.price} starting from next billing cycle."
              ok-text="Confirm Switch"
              cancel-text="Cancel"
              icon="credit-card"
              icon-color="#52c41a"
              @nr-confirm=${() => console.log(`Switched to: ${plan.name}`)}>
              <div slot="trigger" style="padding: 16px; cursor: pointer; background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; transition: border-color 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-weight: 600;">${plan.name}</span>
                  <span style="color: #1890ff; font-weight: 500;">${plan.price}</span>
                </div>
                <div style="font-size: 13px; color: #666;">${plan.features}</div>
              </div>
            </nr-popconfirm>
          `)}
        </div>
      </div>
    `;
  },
};

// Selection confirmation - Table row actions
export const SelectionConfirmTable: Story = {
  render: () => {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer' },
    ];

    return html`
      <div style="overflow-x: auto;">
        <h3 style="margin: 0 0 16px 0;">User management</h3>
        <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
          <thead>
            <tr style="background: #fafafa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Name</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Email</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Role</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e0e0e0;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => html`
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${user.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${user.email}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${user.role}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                  <div style="display: flex; gap: 8px; justify-content: center;">
                    <nr-popconfirm
                      title="Edit ${user.name}?"
                      description="You will be redirected to the edit page."
                      ok-text="Edit"
                      icon="edit"
                      icon-color="#1890ff"
                      @nr-confirm=${() => console.log(`Edit: ${user.name}`)}>
                      <button slot="trigger" style="padding: 4px 8px; cursor: pointer; background: #e6f7ff; border: 1px solid #91d5ff; color: #1890ff; border-radius: 4px; font-size: 12px;">
                        Edit
                      </button>
                    </nr-popconfirm>
                    <nr-popconfirm
                      title="Delete ${user.name}?"
                      description="This action cannot be undone."
                      ok-text="Delete"
                      ok-type="danger"
                      icon="trash-2"
                      icon-color="#ff4d4f"
                      @nr-confirm=${() => console.log(`Delete: ${user.name}`)}>
                      <button slot="trigger" style="padding: 4px 8px; cursor: pointer; background: #fff1f0; border: 1px solid #ffa39e; color: #ff4d4f; border-radius: 4px; font-size: 12px;">
                        Delete
                      </button>
                    </nr-popconfirm>
                  </div>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  },
};

// Selection confirmation - Card grid
export const SelectionConfirmCards: Story = {
  render: () => {
    const templates = [
      { id: 1, name: 'Blank', icon: 'file', color: '#1890ff' },
      { id: 2, name: 'Dashboard', icon: 'layout', color: '#52c41a' },
      { id: 3, name: 'Landing Page', icon: 'globe', color: '#722ed1' },
      { id: 4, name: 'E-commerce', icon: 'shopping-cart', color: '#fa8c16' },
    ];

    return html`
      <div>
        <h3 style="margin: 0 0 16px 0;">Choose a template to start</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
          ${templates.map(template => html`
            <nr-popconfirm
              title="Use ${template.name} template?"
              description="A new project will be created with this template."
              ok-text="Create Project"
              icon="check-circle"
              icon-color="#52c41a"
              @nr-confirm=${() => console.log(`Selected: ${template.name}`)}>
              <div slot="trigger" style="padding: 24px 16px; cursor: pointer; background: #fff; border: 2px solid #e0e0e0; border-radius: 12px; text-align: center; transition: all 0.2s;">
                <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: ${template.color}15; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <nr-icon name="${template.icon}" style="color: ${template.color}; font-size: 24px;"></nr-icon>
                </div>
                <div style="font-weight: 500;">${template.name}</div>
              </div>
            </nr-popconfirm>
          `)}
        </div>
      </div>
    `;
  },
};

// Selection confirmation - Toggle switches
export const SelectionConfirmToggle: Story = {
  render: () => {
    const settings = [
      { id: 'notifications', name: 'Email Notifications', description: 'Receive email updates about your account', enabled: true },
      { id: 'marketing', name: 'Marketing Emails', description: 'Receive promotional content and offers', enabled: false },
      { id: 'two-factor', name: 'Two-Factor Auth', description: 'Add extra security to your account', enabled: true },
    ];

    return html`
      <div style="max-width: 400px;">
        <h3 style="margin: 0 0 16px 0;">Account Settings</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${settings.map(setting => html`
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fafafa; border-radius: 8px;">
              <div>
                <div style="font-weight: 500;">${setting.name}</div>
                <div style="font-size: 12px; color: #666;">${setting.description}</div>
              </div>
              <nr-popconfirm
                title="${setting.enabled ? 'Disable' : 'Enable'} ${setting.name}?"
                description="This change will take effect immediately."
                ok-text="Confirm"
                icon="${setting.enabled ? 'toggle-right' : 'toggle-left'}"
                icon-color="${setting.enabled ? '#ff4d4f' : '#52c41a'}"
                @nr-confirm=${() => console.log(`Toggled: ${setting.name}`)}>
                <button slot="trigger" style="padding: 6px 12px; cursor: pointer; background: ${setting.enabled ? '#52c41a' : '#d9d9d9'}; border: none; color: white; border-radius: 20px; font-size: 12px; min-width: 50px;">
                  ${setting.enabled ? 'ON' : 'OFF'}
                </button>
              </nr-popconfirm>
            </div>
          `)}
        </div>
      </div>
    `;
  },
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

// ===========================================
// PopconfirmManager Stories (Cursor Position)
// ===========================================

// Basic PopconfirmManager usage
export const ManagerBasic: Story = {
  render: () => {
    const handleClick = (e: MouseEvent) => {
      const manager = document.querySelector('nr-popconfirm-manager') as NrPopconfirmManagerElement;
      if (manager) {
        manager.show(
          {
            title: 'Confirm action?',
            description: 'This popconfirm appears at the cursor position.',
            onConfirm: () => console.log('Confirmed!'),
            onCancel: () => console.log('Cancelled!'),
          },
          { x: e.clientX, y: e.clientY }
        );
      }
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px;">
        <h3 style="margin: 0 0 16px 0;">PopconfirmManager - Basic Usage</h3>
        <p style="margin: 0 0 16px 0; color: #666;">Click anywhere on the button to show a popconfirm at cursor position.</p>
        <button
          @click=${handleClick}
          style="padding: 12px 24px; cursor: pointer; background: #1890ff; color: white; border: none; border-radius: 6px; font-size: 14px;">
          Click me anywhere
        </button>
      </div>
    `;
  },
};

// PopconfirmManager with different types
export const ManagerTypes: Story = {
  render: () => {
    const showConfirm = (e: MouseEvent, type: string) => {
      const manager = document.querySelector('nr-popconfirm-manager') as NrPopconfirmManagerElement;
      if (!manager) return;

      const configs: Record<string, any> = {
        delete: {
          title: 'Delete this item?',
          description: 'This action cannot be undone.',
          okText: 'Delete',
          okType: 'danger',
          icon: 'trash-2',
          iconColor: '#ff4d4f',
        },
        save: {
          title: 'Save changes?',
          description: 'Your changes will be saved.',
          okText: 'Save',
          okType: 'primary',
          icon: 'check-circle',
          iconColor: '#52c41a',
        },
        warning: {
          title: 'Are you sure?',
          description: 'This action may have consequences.',
          okText: 'Proceed',
          icon: 'alert-triangle',
          iconColor: '#faad14',
        },
        info: {
          title: 'Continue?',
          description: 'Click OK to proceed with the operation.',
          okText: 'Continue',
          icon: 'info',
          iconColor: '#1890ff',
        },
      };

      manager.show(
        {
          ...configs[type],
          onConfirm: () => console.log(`${type} confirmed!`),
          onCancel: () => console.log(`${type} cancelled!`),
        },
        { x: e.clientX, y: e.clientY }
      );
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px;">
        <h3 style="margin: 0 0 16px 0;">PopconfirmManager - Different Types</h3>
        <p style="margin: 0 0 16px 0; color: #666;">Click each button to see different popconfirm styles at cursor position.</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button
            @click=${(e: MouseEvent) => showConfirm(e, 'delete')}
            style="padding: 10px 20px; cursor: pointer; background: #ff4d4f; color: white; border: none; border-radius: 6px;">
            Delete Item
          </button>
          <button
            @click=${(e: MouseEvent) => showConfirm(e, 'save')}
            style="padding: 10px 20px; cursor: pointer; background: #52c41a; color: white; border: none; border-radius: 6px;">
            Save Changes
          </button>
          <button
            @click=${(e: MouseEvent) => showConfirm(e, 'warning')}
            style="padding: 10px 20px; cursor: pointer; background: #faad14; color: white; border: none; border-radius: 6px;">
            Warning Action
          </button>
          <button
            @click=${(e: MouseEvent) => showConfirm(e, 'info')}
            style="padding: 10px 20px; cursor: pointer; background: #1890ff; color: white; border: none; border-radius: 6px;">
            Info Action
          </button>
        </div>
      </div>
    `;
  },
};

// PopconfirmManager with list items
export const ManagerWithList: Story = {
  render: () => {
    const items = [
      { id: 1, name: 'Document 1.pdf', size: '2.4 MB' },
      { id: 2, name: 'Image.png', size: '1.2 MB' },
      { id: 3, name: 'Spreadsheet.xlsx', size: '856 KB' },
      { id: 4, name: 'Presentation.pptx', size: '4.1 MB' },
    ];

    const handleDelete = (e: MouseEvent, item: any) => {
      e.stopPropagation();
      const manager = document.querySelector('nr-popconfirm-manager') as NrPopconfirmManagerElement;
      if (manager) {
        manager.show(
          {
            title: `Delete "${item.name}"?`,
            description: 'This file will be permanently deleted.',
            okText: 'Delete',
            okType: 'danger',
            icon: 'trash-2',
            iconColor: '#ff4d4f',
            onConfirm: () => console.log(`Deleted: ${item.name}`),
          },
          { x: e.clientX, y: e.clientY }
        );
      }
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px; max-width: 400px;">
        <h3 style="margin: 0 0 16px 0;">PopconfirmManager - File List</h3>
        <p style="margin: 0 0 16px 0; color: #666;">Click the delete icon on any file to confirm deletion at cursor position.</p>
        <ul style="list-style: none; padding: 0; margin: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          ${items.map(item => html`
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e0e0e0;">
              <div>
                <div style="font-weight: 500;">${item.name}</div>
                <div style="font-size: 12px; color: #666;">${item.size}</div>
              </div>
              <button
                @click=${(e: MouseEvent) => handleDelete(e, item)}
                style="padding: 6px; cursor: pointer; background: none; border: none; color: #ff4d4f;">
                <nr-icon name="trash-2"></nr-icon>
              </button>
            </li>
          `)}
        </ul>
      </div>
    `;
  },
};

// PopconfirmManager with async operation
export const ManagerAsync: Story = {
  render: () => {
    const handleAsyncAction = async (e: MouseEvent) => {
      const manager = document.querySelector('nr-popconfirm-manager') as NrPopconfirmManagerElement;
      if (manager) {
        manager.show(
          {
            title: 'Submit data?',
            description: 'This will send your data to the server.',
            okText: 'Submit',
            okType: 'primary',
            onConfirm: async () => {
              console.log('Starting async operation...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              console.log('Async operation completed!');
            },
          },
          { x: e.clientX, y: e.clientY }
        );
      }
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px;">
        <h3 style="margin: 0 0 16px 0;">PopconfirmManager - Async Operation</h3>
        <p style="margin: 0 0 16px 0; color: #666;">Click to show a popconfirm with loading state during confirmation.</p>
        <button
          @click=${handleAsyncAction}
          style="padding: 12px 24px; cursor: pointer; background: #1890ff; color: white; border: none; border-radius: 6px; font-size: 14px;">
          Submit Data (2s delay)
        </button>
        <p style="margin-top: 12px; color: #999; font-size: 12px;">The OK button will show a loading state for 2 seconds.</p>
      </div>
    `;
  },
};

// PopconfirmManager with static confirm helper
export const ManagerStaticHelper: Story = {
  render: () => {
    const handleAction = async (e: MouseEvent) => {
      const confirmed = await NrPopconfirmManagerElement.confirm(
        {
          title: 'Perform action?',
          description: 'Using the static confirm() helper method.',
          okText: 'Yes',
          cancelText: 'No',
        },
        { x: e.clientX, y: e.clientY }
      );

      console.log(`User ${confirmed ? 'confirmed' : 'cancelled'} the action`);
      alert(`You ${confirmed ? 'confirmed' : 'cancelled'} the action!`);
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px;">
        <h3 style="margin: 0 0 16px 0;">PopconfirmManager - Static Helper</h3>
        <p style="margin: 0 0 16px 0; color: #666;">Using <code>NrPopconfirmManagerElement.confirm()</code> for promise-based confirmation.</p>
        <button
          @click=${handleAction}
          style="padding: 12px 24px; cursor: pointer; background: #722ed1; color: white; border: none; border-radius: 6px; font-size: 14px;">
          Confirm with Promise
        </button>
        <pre style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 12px; overflow-x: auto;">
const confirmed = await NrPopconfirmManagerElement.confirm({
  title: 'Perform action?',
  description: 'Using the static confirm() helper.',
}, { x: event.clientX, y: event.clientY });

if (confirmed) {
  // User clicked OK
}
        </pre>
      </div>
    `;
  },
};

// PopconfirmManager with nr-select - using static confirm with await
export const ManagerWithSelect: Story = {
  render: () => {
    const roleOptions = [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
      { value: 'guest', label: 'Guest' },
    ];

    const statusOptions = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' },
    ];

    // Track mouse position globally to capture option clicks
    let lastClickPosition = { x: 0, y: 0 };

    const setupGlobalClickTracking = () => {
      document.addEventListener('click', (e: MouseEvent) => {
        lastClickPosition = { x: e.clientX, y: e.clientY };
      }, true);
    };

    setTimeout(setupGlobalClickTracking, 100);

    const handleRoleChange = async (e: CustomEvent) => {
      const newValue = e.detail.value;
      const selectedOption = roleOptions.find(o => o.value === newValue);
      const selectElement = e.target as any;

      if (selectedOption) {
        // Store previous value to revert if cancelled
        const previousValue = selectElement._previousValue || '';
        selectElement._previousValue = newValue;

        const confirmed = await NrPopconfirmManagerElement.confirm(
          {
            title: `Change role to ${selectedOption.label}?`,
            description: 'This will update the user permissions immediately.',
            okText: 'Change Role',
            okType: 'primary',
            icon: 'user-check',
            iconColor: '#1890ff',
          },
          lastClickPosition
        );

        if (confirmed) {
          console.log(`Role confirmed: ${selectedOption.label}`);
        } else {
          // Revert the selection
          console.log('Role change cancelled, reverting...');
          selectElement.value = previousValue;
        }
      }
    };

    const handleStatusChange = async (e: CustomEvent) => {
      const newValue = e.detail.value;
      const selectedOption = statusOptions.find(o => o.value === newValue);
      const selectElement = e.target as any;
      const isDestructive = newValue === 'suspended' || newValue === 'inactive';

      if (selectedOption) {
        const previousValue = selectElement._previousValue || '';
        selectElement._previousValue = newValue;

        const confirmed = await NrPopconfirmManagerElement.confirm(
          {
            title: `Set status to ${selectedOption.label}?`,
            description: isDestructive
              ? 'This may affect user access to the system.'
              : 'The status will be updated.',
            okText: 'Update Status',
            okType: isDestructive ? 'danger' : 'primary',
            icon: isDestructive ? 'alert-triangle' : 'check-circle',
            iconColor: isDestructive ? '#ff4d4f' : '#52c41a',
          },
          lastClickPosition
        );

        if (confirmed) {
          console.log(`Status confirmed: ${selectedOption.label}`);
        } else {
          console.log('Status change cancelled, reverting...');
          selectElement.value = previousValue;
        }
      }
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px; max-width: 400px;">
        <h3 style="margin: 0 0 24px 0;">PopconfirmManager with nr-select</h3>
        <p style="margin: 0 0 24px 0; color: #666;">Select an option - confirmation appears at cursor. Cancel reverts the selection.</p>

        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">User Role</label>
            <nr-select
              placeholder="Select a role"
              .options=${roleOptions}
              @nr-change=${handleRoleChange}>
            </nr-select>
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Account Status</label>
            <nr-select
              placeholder="Select status"
              .options=${statusOptions}
              @nr-change=${handleStatusChange}>
            </nr-select>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0; font-size: 13px; color: #666;">
            <strong>How it works:</strong><br>
            1. Click on a select dropdown<br>
            2. Choose an option<br>
            3. A confirmation appears at cursor position<br>
            4. Confirm applies the change, Cancel reverts it
          </p>
        </div>
      </div>
    `;
  },
};

// PopconfirmManager with multiple selects in a form - using await
export const ManagerSelectForm: Story = {
  render: () => {
    const countryOptions = [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
    ];

    const planOptions = [
      { value: 'free', label: 'Free - $0/month' },
      { value: 'starter', label: 'Starter - $9/month' },
      { value: 'pro', label: 'Pro - $29/month' },
      { value: 'enterprise', label: 'Enterprise - $99/month' },
    ];

    const timezoneOptions = [
      { value: 'utc', label: 'UTC' },
      { value: 'est', label: 'Eastern Time (EST)' },
      { value: 'pst', label: 'Pacific Time (PST)' },
      { value: 'cet', label: 'Central European (CET)' },
    ];

    // Track mouse position globally
    let lastClickPosition = { x: 0, y: 0 };

    const setupGlobalClickTracking = () => {
      document.addEventListener('click', (e: MouseEvent) => {
        lastClickPosition = { x: e.clientX, y: e.clientY };
      }, true);
    };

    setTimeout(setupGlobalClickTracking, 100);

    const confirmChange = async (fieldName: string, options: any[], e: CustomEvent) => {
      const newValue = e.detail.value;
      const selectedOption = options.find(o => o.value === newValue);
      const selectElement = e.target as any;

      if (selectedOption) {
        const previousValue = selectElement._previousValue || '';
        selectElement._previousValue = newValue;

        const isPlanUpgrade = fieldName === 'Plan' && (newValue === 'pro' || newValue === 'enterprise');

        const confirmed = await NrPopconfirmManagerElement.confirm(
          {
            title: `Update ${fieldName}?`,
            description: isPlanUpgrade
              ? `Upgrading to ${selectedOption.label}. You will be billed accordingly.`
              : `Change ${fieldName} to "${selectedOption.label}"?`,
            okText: isPlanUpgrade ? 'Upgrade' : 'Confirm',
            okType: isPlanUpgrade ? 'primary' : 'default',
            icon: isPlanUpgrade ? 'credit-card' : 'settings',
            iconColor: isPlanUpgrade ? '#1890ff' : '#666',
          },
          lastClickPosition
        );

        if (confirmed) {
          console.log(`${fieldName} confirmed: ${selectedOption.label}`);
        } else {
          console.log(`${fieldName} change cancelled, reverting...`);
          selectElement.value = previousValue;
        }
      }
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px; max-width: 500px;">
        <h3 style="margin: 0 0 8px 0;">Account Settings</h3>
        <p style="margin: 0 0 24px 0; color: #666;">Changes require confirmation. Cancel reverts the selection.</p>

        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px;">
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">Country/Region</label>
              <nr-select
                placeholder="Select country"
                .options=${countryOptions}
                @nr-change=${(e: CustomEvent) => confirmChange('Country', countryOptions, e)}>
              </nr-select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">Subscription Plan</label>
              <nr-select
                placeholder="Select plan"
                .options=${planOptions}
                @nr-change=${(e: CustomEvent) => confirmChange('Plan', planOptions, e)}>
              </nr-select>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #999;">Plan changes take effect immediately</p>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">Timezone</label>
              <nr-select
                placeholder="Select timezone"
                .options=${timezoneOptions}
                @nr-change=${(e: CustomEvent) => confirmChange('Timezone', timezoneOptions, e)}>
              </nr-select>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};

// PopconfirmManager context menu style
export const ManagerContextMenu: Story = {
  render: () => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const manager = document.querySelector('nr-popconfirm-manager') as NrPopconfirmManagerElement;
      if (manager) {
        manager.show(
          {
            title: 'Delete this area?',
            description: 'Right-click triggered this popconfirm.',
            okText: 'Delete',
            okType: 'danger',
            onConfirm: () => console.log('Area deleted!'),
          },
          { x: e.clientX, y: e.clientY }
        );
      }
    };

    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
      <div style="padding: 40px;">
        <h3 style="margin: 0 0 16px 0;">PopconfirmManager - Context Menu Style</h3>
        <p style="margin: 0 0 16px 0; color: #666;">Right-click on the area below to trigger a popconfirm.</p>
        <div
          @contextmenu=${handleContextMenu}
          style="width: 300px; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; cursor: context-menu;">
          Right-click here
        </div>
      </div>
    `;
  },
};
