import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/card/index.js';

const meta: Meta = {
  title: 'Components/Card',
  component: 'nr-card',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Card title',
    },
    subtitle: {
      control: { type: 'text' },
      description: 'Card subtitle',
    },
    image: {
      control: { type: 'text' },
      description: 'Card image URL',
    },
    elevation: {
      control: { type: 'select' },
      options: ['none', 'low', 'medium', 'high'],
      description: 'Card elevation/shadow',
    },
    outlined: {
      control: { type: 'boolean' },
      description: 'Whether the card has an outline',
    },
  },
  args: {
    title: 'Card Title',
    subtitle: 'Card Subtitle',
    image: '',
    elevation: 'medium',
    outlined: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'Default Card',
    subtitle: 'This is a default card component',
  },
  render: (args) => html`
    <nr-card
      title="${args.title}"
      subtitle="${args.subtitle}"
      image="${args.image}"
      elevation="${args.elevation}"
      ?outlined="${args.outlined}"
      style="width: 300px;"
    >
      <p>This is the main content of the card. You can put any content here including text, images, buttons, and other components.</p>
    </nr-card>
  `,
};

export const WithImage: Story = {
  args: {
    title: 'Card with Image',
    subtitle: 'Beautiful landscape photo',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
  },
  render: (args) => html`
    <nr-card
      title="${args.title}"
      subtitle="${args.subtitle}"
      image="${args.image}"
      elevation="${args.elevation}"
      ?outlined="${args.outlined}"
      style="width: 300px;"
    >
      <p>This card features a beautiful image at the top, perfect for showcasing visual content.</p>
    </nr-card>
  `,
};

export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    subtitle: 'Card with border',
    outlined: true,
    elevation: 'none',
  },
  render: (args) => html`
    <nr-card
      title="${args.title}"
      subtitle="${args.subtitle}"
      image="${args.image}"
      elevation="${args.elevation}"
      ?outlined="${args.outlined}"
      style="width: 300px;"
    >
      <p>This card uses an outline style instead of elevation for a different visual approach.</p>
    </nr-card>
  `,
};

export const ElevationLevels: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 2rem;">
      <nr-card title="No Elevation" subtitle="elevation='none'" elevation="none" style="width: 250px;">
        <p>Card with no shadow</p>
      </nr-card>
      <nr-card title="Low Elevation" subtitle="elevation='low'" elevation="low" style="width: 250px;">
        <p>Card with subtle shadow</p>
      </nr-card>
      <nr-card title="Medium Elevation" subtitle="elevation='medium'" elevation="medium" style="width: 250px;">
        <p>Card with medium shadow</p>
      </nr-card>
      <nr-card title="High Elevation" subtitle="elevation='high'" elevation="high" style="width: 250px;">
        <p>Card with pronounced shadow</p>
      </nr-card>
    </div>
  `,
};

export const ProductCard: Story = {
  render: () => html`
    <nr-card
      title="Premium Headphones"
      subtitle="$299.99"
      image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=200&fit=crop"
      elevation="medium"
      style="width: 300px;"
    >
      <div style="padding: 0 0 1rem 0;">
        <p style="margin: 0 0 1rem 0; color: #666;">High-quality wireless headphones with noise cancellation and premium sound quality.</p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <span style="background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">Wireless</span>
          <span style="background: #e8f5e8; color: #388e3c; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">Noise Canceling</span>
        </div>
        <button style="width: 100%; padding: 0.75rem; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Add to Cart
        </button>
      </div>
    </nr-card>
  `,
};

export const ArticleCard: Story = {
  render: () => html`
    <nr-card
      title="Getting Started with Web Components"
      subtitle="Published on March 15, 2024"
      image="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop"
      elevation="medium"
      style="width: 350px;"
    >
      <div style="padding: 0 0 1rem 0;">
        <p style="margin: 0 0 1rem 0; color: #666; line-height: 1.5;">
          Learn how to create reusable, framework-agnostic components using modern web standards. This comprehensive guide covers everything from basic concepts to advanced patterns.
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #666; font-size: 0.9rem;">5 min read</span>
          <button style="padding: 0.5rem 1rem; background: transparent; color: #1976d2; border: 1px solid #1976d2; border-radius: 4px; cursor: pointer;">
            Read More
          </button>
        </div>
      </div>
    </nr-card>
  `,
};

export const CardGrid: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 900px;">
      <nr-card title="Feature 1" subtitle="Essential functionality" elevation="medium">
        <p>Description of the first key feature that makes your product stand out.</p>
      </nr-card>
      <nr-card title="Feature 2" subtitle="Advanced capabilities" elevation="medium">
        <p>Description of the second important feature that adds value to your offering.</p>
      </nr-card>
      <nr-card title="Feature 3" subtitle="Premium experience" elevation="medium">
        <p>Description of the third feature that completes your product's feature set.</p>
      </nr-card>
    </div>
  `,
};
