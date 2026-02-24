import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './timeline.component';
import { TimelineMode, TimelineItemColor } from './timeline.types';
import type { TimelineItem } from './timeline.types';

const meta: Meta = {
  title: 'Data Display/Timeline',
  component: 'nr-timeline',
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['left', 'right', 'alternate'],
      description: 'Timeline display mode',
    },
    pending: {
      control: 'text',
      description: 'Pending state content',
    },
    pendingDot: {
      control: 'text',
      description: 'Custom pending dot icon name',
    },
    reverse: {
      control: 'boolean',
      description: 'Reverse timeline order',
    },
  },
};

export default meta;
type Story = StoryObj;

// Basic timeline with left mode (default)
export const Default: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', label: '2015-09-01' },
      { children: 'Solve initial network problems', label: '2015-09-01' },
      { children: 'Technical testing', label: '2015-09-01' },
      { children: 'Network problems being solved', label: '2015-09-01' },
    ];

    return html`
      <nr-timeline .items=${items}></nr-timeline>
    `;
  },
};

// Timeline with custom colors
export const WithColors: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', color: TimelineItemColor.Green },
      { children: 'Solve initial network problems', color: TimelineItemColor.Green },
      { children: 'Technical testing', color: TimelineItemColor.Red },
      { children: 'Network problems being solved', color: TimelineItemColor.Blue },
    ];

    return html`
      <nr-timeline .items=${items}></nr-timeline>
    `;
  },
};

// Timeline with custom dots
export const WithCustomDots: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', dot: 'clock-circle', color: TimelineItemColor.Blue },
      { children: 'Solve initial network problems', dot: 'check-circle', color: TimelineItemColor.Green },
      { children: 'Technical testing', dot: 'close-circle', color: TimelineItemColor.Red },
      { children: 'Network problems being solved', dot: 'sync', color: TimelineItemColor.Gray },
    ];

    return html`
      <nr-timeline .items=${items}></nr-timeline>
    `;
  },
};

// Timeline in alternate mode
export const AlternateMode: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', label: '2015-09-01' },
      { children: 'Solve initial network problems', label: '2015-09-01' },
      { children: 'Technical testing', label: '2015-09-01' },
      { children: 'Network problems being solved', label: '2015-09-01' },
    ];

    return html`
      <nr-timeline mode=${TimelineMode.Alternate} .items=${items}></nr-timeline>
    `;
  },
};

// Timeline in right mode
export const RightMode: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', label: '2015-09-01' },
      { children: 'Solve initial network problems', label: '2015-09-01' },
      { children: 'Technical testing', label: '2015-09-01' },
    ];

    return html`
      <nr-timeline mode=${TimelineMode.Right} .items=${items}></nr-timeline>
    `;
  },
};

// Timeline with labels
export const WithLabels: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', label: '2015-09-01 09:12:11' },
      { children: 'Solve initial network problems', label: '2015-09-01 09:12:11' },
      { children: 'Technical testing', label: '2015-09-01 09:12:11' },
      { children: 'Network problems being solved', label: '2015-09-01 09:12:11' },
    ];

    return html`
      <nr-timeline .items=${items}></nr-timeline>
    `;
  },
};

// Timeline with pending state
export const PendingState: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', color: TimelineItemColor.Green },
      { children: 'Solve initial network problems', color: TimelineItemColor.Green },
      { children: 'Technical testing', color: TimelineItemColor.Blue },
    ];

    return html`
      <nr-timeline .items=${items} pending="Recording..."></nr-timeline>
    `;
  },
};

// Timeline with custom pending dot
export const CustomPendingDot: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Step 1 completed', color: TimelineItemColor.Green },
      { children: 'Step 2 completed', color: TimelineItemColor.Green },
      { children: 'Step 3 in progress', color: TimelineItemColor.Blue },
    ];

    return html`
      <nr-timeline .items=${items} pending="Loading..." pending-dot="loading"></nr-timeline>
    `;
  },
};

// Timeline in reverse order
export const ReverseOrder: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'First event', label: '2015-09-01' },
      { children: 'Second event', label: '2015-09-02' },
      { children: 'Third event', label: '2015-09-03' },
      { children: 'Fourth event', label: '2015-09-04' },
    ];

    return html`
      <nr-timeline .items=${items} reverse></nr-timeline>
    `;
  },
};

// Real-world example: Project timeline
export const ProjectTimeline: Story = {
  render: () => {
    const items: TimelineItem[] = [
      {
        children: 'Project kickoff meeting',
        label: '2024-01-01',
        color: TimelineItemColor.Green,
        dot: 'check-circle',
      },
      {
        children: 'Requirements gathering completed',
        label: '2024-01-15',
        color: TimelineItemColor.Green,
        dot: 'check-circle',
      },
      {
        children: 'Development phase started',
        label: '2024-02-01',
        color: TimelineItemColor.Blue,
      },
      {
        children: 'Testing in progress',
        label: '2024-03-01',
        color: TimelineItemColor.Blue,
        dot: 'clock-circle',
      },
    ];

    return html`
      <nr-timeline .items=${items} pending="Launch scheduled"></nr-timeline>
    `;
  },
};

// Real-world example: Order tracking
export const OrderTracking: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Order placed', color: TimelineItemColor.Green, dot: 'check-circle', label: 'Jan 1, 2024' },
      { children: 'Order confirmed', color: TimelineItemColor.Green, dot: 'check-circle', label: 'Jan 1, 2024' },
      { children: 'In transit', color: TimelineItemColor.Blue, dot: 'clock-circle', label: 'Jan 2, 2024' },
      { children: 'Out for delivery', color: TimelineItemColor.Gray, label: 'Jan 3, 2024' },
    ];

    return html`
      <nr-timeline .items=${items}></nr-timeline>
    `;
  },
};

// Real-world example: Conversation history
export const ConversationHistory: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'User sent message: "I need help with my account"', label: '09:00 AM' },
      { children: 'Support replied: "I can help you with that"', label: '09:05 AM' },
      { children: 'User responded: "Thank you!"', label: '09:10 AM' },
      { children: 'Issue resolved', label: '09:15 AM', color: TimelineItemColor.Green },
    ];

    return html`
      <nr-timeline mode=${TimelineMode.Alternate} .items=${items}></nr-timeline>
    `;
  },
};

// Carbon dark theme example
export const CarbonDarkTheme: Story = {
  render: () => {
    const items: TimelineItem[] = [
      { children: 'Create a services site', label: '2015-09-01', color: TimelineItemColor.Blue },
      { children: 'Solve initial network problems', label: '2015-09-01', color: TimelineItemColor.Green },
      { children: 'Technical testing', label: '2015-09-01', color: TimelineItemColor.Red },
      { children: 'Network problems being solved', label: '2015-09-01', color: TimelineItemColor.Gray },
    ];

    return html`
      <div theme="carbon-dark" style="padding: 20px; background: #262626;">
        <nr-timeline .items=${items} pending="Recording..."></nr-timeline>
      </div>
    `;
  },
};

// All features combined
export const AllFeatures: Story = {
  render: () => {
    const items: TimelineItem[] = [
      {
        children: 'Project started',
        label: 'Q1 2024',
        color: TimelineItemColor.Green,
        dot: 'check-circle',
      },
      {
        children: 'Development phase',
        label: 'Q2 2024',
        color: TimelineItemColor.Blue,
        dot: 'code',
      },
      {
        children: 'Testing phase',
        label: 'Q3 2024',
        color: TimelineItemColor.Blue,
        dot: 'bug',
      },
      {
        children: 'Deployment ready',
        label: 'Q4 2024',
        color: TimelineItemColor.Green,
        dot: 'rocket',
      },
    ];

    return html`
      <div style="display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <h3>Left Mode</h3>
          <nr-timeline mode=${TimelineMode.Left} .items=${items}></nr-timeline>
        </div>
        <div>
          <h3>Right Mode</h3>
          <nr-timeline mode=${TimelineMode.Right} .items=${items}></nr-timeline>
        </div>
        <div style="width: 100%;">
          <h3>Alternate Mode with Pending</h3>
          <nr-timeline 
            mode=${TimelineMode.Alternate} 
            .items=${items} 
            pending="Launch in progress..."
            pending-dot="loading"
          ></nr-timeline>
        </div>
      </div>
    `;
  },
};
