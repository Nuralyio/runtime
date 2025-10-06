import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './video.component.js';

const meta: Meta = {
  title: 'Nuraly/Media/Video',
  component: 'nr-video',
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Video source URL',
    },
    poster: {
      control: 'text',
      description: 'Video poster image URL',
    },
    width: {
      control: 'text',
      description: 'Video width',
    },
    height: {
      control: 'text',
      description: 'Video height',
    },
    autoplay: {
      control: 'boolean',
      description: 'Whether video should autoplay',
    },
    loop: {
      control: 'boolean',
      description: 'Whether video should loop',
    },
    muted: {
      control: 'boolean',
      description: 'Whether video is muted',
    },
    controls: {
      control: 'boolean',
      description: 'Show video controls',
    },
    preload: {
      control: 'select',
      options: ['none', 'metadata', 'auto'],
      description: 'Preload strategy',
    },
    previewable: {
      control: 'boolean',
      description: 'Whether video is previewable (fullscreen)',
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
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: 'auto',
    height: 'auto',
    controls: true,
    preload: 'metadata',
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      width=${args.width}
      height=${args.height}
      ?autoplay=${args.autoplay}
      ?loop=${args.loop}
      ?muted=${args.muted}
      ?controls=${args.controls}
      ?previewable=${args.previewable}
      ?block=${args.block}
      preload=${args.preload || 'metadata'}
    ></nr-video>
  `,
};

export const WithPoster: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    width: '640px',
    height: '360px',
    controls: true,
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      poster=${args.poster}
      width=${args.width}
      height=${args.height}
      ?controls=${args.controls}
    ></nr-video>
  `,
};

export const AutoplayMuted: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: '640px',
    height: '360px',
    autoplay: true,
    muted: true,
    loop: true,
    controls: true,
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      width=${args.width}
      height=${args.height}
      ?autoplay=${args.autoplay}
      ?muted=${args.muted}
      ?loop=${args.loop}
      ?controls=${args.controls}
    ></nr-video>
  `,
};

export const WithFullscreenPreview: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    width: '640px',
    height: '360px',
    controls: true,
    previewable: true,
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      poster=${args.poster}
      width=${args.width}
      height=${args.height}
      ?controls=${args.controls}
      ?previewable=${args.previewable}
    ></nr-video>
  `,
};

export const BlockDisplay: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    block: true,
    width: '100%',
    height: 'auto',
    controls: true,
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      width=${args.width}
      height=${args.height}
      ?block=${args.block}
      ?controls=${args.controls}
    ></nr-video>
  `,
};

export const Loop: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: '400px',
    height: '300px',
    loop: true,
    autoplay: true,
    muted: true,
    controls: true,
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      width=${args.width}
      height=${args.height}
      ?loop=${args.loop}
      ?autoplay=${args.autoplay}
      ?muted=${args.muted}
      ?controls=${args.controls}
    ></nr-video>
  `,
};

export const WithEventHandlers: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: '640px',
    height: '360px',
    controls: true,
  },
  render: (args) => html`
    <div>
      <nr-video
        src=${args.src}
        width=${args.width}
        height=${args.height}
        ?controls=${args.controls}
        @nr-video-play=${(e: CustomEvent) => console.log('Video playing:', e.detail)}
        @nr-video-pause=${(e: CustomEvent) => console.log('Video paused:', e.detail)}
        @nr-video-ended=${(e: CustomEvent) => console.log('Video ended:', e.detail)}
        @nr-video-error=${(e: CustomEvent) => console.log('Video error:', e.detail)}
      ></nr-video>
      <p style="margin-top: 16px; color: #666; font-size: 14px;">
        Check the console for event logs (play, pause, ended, error)
      </p>
    </div>
  `,
};

export const ErrorState: Story = {
  args: {
    src: 'https://invalid-video-url.example.com/video.mp4',
    width: '640px',
    height: '360px',
    controls: true,
  },
  render: (args) => html`
    <nr-video
      src=${args.src}
      width=${args.width}
      height=${args.height}
      ?controls=${args.controls}
    ></nr-video>
  `,
};

export const MultipleVideos: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      <nr-video
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"
        width="100%"
        height="auto"
        controls
      ></nr-video>
      <nr-video
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        poster="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400"
        width="100%"
        height="auto"
        controls
      ></nr-video>
    </div>
  `,
};

export const DifferentPreloadStrategies: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3 style="margin: 0 0 8px 0;">Preload: none</h3>
        <nr-video
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          width="400px"
          height="225px"
          controls
          preload="none"
        ></nr-video>
      </div>
      <div>
        <h3 style="margin: 0 0 8px 0;">Preload: metadata</h3>
        <nr-video
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          width="400px"
          height="225px"
          controls
          preload="metadata"
        ></nr-video>
      </div>
      <div>
        <h3 style="margin: 0 0 8px 0;">Preload: auto</h3>
        <nr-video
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          width="400px"
          height="225px"
          controls
          preload="auto"
        ></nr-video>
      </div>
    </div>
  `,
};
