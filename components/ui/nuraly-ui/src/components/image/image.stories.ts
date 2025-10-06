import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './image.component.js';

const meta: Meta = {
  title: 'Nuraly/Media/Image',
  component: 'nr-image',
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    fallback: {
      control: 'text',
      description: 'Fallback image URL when loading fails',
    },
    width: {
      control: 'text',
      description: 'Image width (auto, px, %, etc.)',
    },
    height: {
      control: 'text',
      description: 'Image height (auto, px, %, etc.)',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the image',
    },
    previewable: {
      control: 'boolean',
      description: 'Whether the image is previewable (clickable to show fullscreen)',
    },
    fit: {
      control: 'select',
      options: ['none', 'fill', 'contain', 'cover', 'scale-down'],
      description: 'Object-fit CSS property value',
    },
    block: {
      control: 'boolean',
      description: 'Display as block element',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Mountain landscape',
    width: 'auto',
    height: 'auto',
  },
  render: (args) => html`
    <nr-image
      src=${args.src}
      alt=${args.alt}
      width=${args.width}
      height=${args.height}
      ?previewable=${args.previewable}
      ?block=${args.block}
      fit=${args.fit || 'none'}
    ></nr-image>
  `,
};

export const WithPreview: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Mountain landscape - Click to preview',
    previewable: true,
    width: '400px',
    height: '300px',
  },
  render: (args) => html`
    <nr-image
      src=${args.src}
      alt=${args.alt}
      width=${args.width}
      height=${args.height}
      ?previewable=${args.previewable}
    ></nr-image>
  `,
};

export const WithFallback: Story = {
  args: {
    src: 'https://invalid-url.example.com/image.jpg',
    fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    alt: 'Image with fallback',
    width: '400px',
    height: '300px',
  },
  render: (args) => html`
    <nr-image
      src=${args.src}
      fallback=${args.fallback}
      alt=${args.alt}
      width=${args.width}
      height=${args.height}
    ></nr-image>
  `,
};

export const ObjectFitCover: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Cover fit',
    width: '400px',
    height: '300px',
    fit: 'cover',
  },
  render: (args) => html`
    <nr-image
      src=${args.src}
      alt=${args.alt}
      width=${args.width}
      height=${args.height}
      fit=${args.fit}
    ></nr-image>
  `,
};

export const ObjectFitContain: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Contain fit',
    width: '400px',
    height: '300px',
    fit: 'contain',
  },
  render: (args) => html`
    <div style="background: #f0f0f0; padding: 20px;">
      <nr-image
        src=${args.src}
        alt=${args.alt}
        width=${args.width}
        height=${args.height}
        fit=${args.fit}
      ></nr-image>
    </div>
  `,
};

export const BlockDisplay: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Block display image',
    block: true,
    width: '100%',
    height: 'auto',
  },
  render: (args) => html`
    <nr-image
      src=${args.src}
      alt=${args.alt}
      width=${args.width}
      height=${args.height}
      ?block=${args.block}
    ></nr-image>
  `,
};

export const MultipleImages: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      <nr-image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
        alt="Mountain 1"
        width="100%"
        height="200px"
        fit="cover"
        previewable
      ></nr-image>
      <nr-image
        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400"
        alt="Mountain 2"
        width="100%"
        height="200px"
        fit="cover"
        previewable
      ></nr-image>
      <nr-image
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400"
        alt="Mountain 3"
        width="100%"
        height="200px"
        fit="cover"
        previewable
      ></nr-image>
    </div>
  `,
};

export const WithEventHandlers: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Image with events',
    width: '400px',
    height: '300px',
  },
  render: (args) => html`
    <div>
      <nr-image
        src=${args.src}
        alt=${args.alt}
        width=${args.width}
        height=${args.height}
        @nr-image-load=${(e: CustomEvent) => console.log('Image loaded:', e.detail)}
        @nr-image-error=${(e: CustomEvent) => console.log('Image error:', e.detail)}
      ></nr-image>
      <p style="margin-top: 16px; color: #666; font-size: 14px;">
        Check the console for event logs
      </p>
    </div>
  `,
};

export const ErrorState: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.example.com/image.jpg',
    alt: 'This image will fail to load',
    width: '400px',
    height: '300px',
  },
  render: (args) => html`
    <nr-image
      src=${args.src}
      alt=${args.alt}
      width=${args.width}
      height=${args.height}
    ></nr-image>
  `,
};
