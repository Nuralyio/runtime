import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './document.component.js';

const meta: Meta = {
  title: 'Nuraly/Media/Document',
  component: 'nr-document',
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Document source URL',
    },
    type: {
      control: 'select',
      options: ['pdf', 'image', 'other'],
      description: 'Document type',
    },
    width: {
      control: 'text',
      description: 'Document width',
    },
    height: {
      control: 'text',
      description: 'Document height',
    },
    previewable: {
      control: 'boolean',
      description: 'Whether document is previewable (fullscreen)',
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
    src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    width: 'auto',
    height: '500px',
  },
  render: (args) => html`
    <nr-document
      src=${args.src}
      type=${args.type || 'pdf'}
      width=${args.width}
      height=${args.height}
      ?previewable=${args.previewable}
      ?block=${args.block}
    ></nr-document>
  `,
};

export const PDFDocument: Story = {
  args: {
    src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    width: '800px',
    height: '600px',
  },
  render: (args) => html`
    <nr-document
      src=${args.src}
      type=${args.type}
      width=${args.width}
      height=${args.height}
    ></nr-document>
  `,
};

export const WithFullscreenPreview: Story = {
  args: {
    src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    width: '800px',
    height: '600px',
    previewable: true,
  },
  render: (args) => html`
    <nr-document
      src=${args.src}
      type=${args.type}
      width=${args.width}
      height=${args.height}
      ?previewable=${args.previewable}
    ></nr-document>
  `,
};

export const BlockDisplay: Story = {
  args: {
    src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    block: true,
    width: '100%',
    height: '600px',
  },
  render: (args) => html`
    <nr-document
      src=${args.src}
      type=${args.type}
      width=${args.width}
      height=${args.height}
      ?block=${args.block}
    ></nr-document>
  `,
};

export const CustomDimensions: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div>
        <h3 style="margin: 0 0 8px 0;">Small (400x300)</h3>
        <nr-document
          src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          type="pdf"
          width="400px"
          height="300px"
        ></nr-document>
      </div>
      <div>
        <h3 style="margin: 0 0 8px 0;">Large (600x450)</h3>
        <nr-document
          src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          type="pdf"
          width="600px"
          height="450px"
        ></nr-document>
      </div>
    </div>
  `,
};

export const WithEventHandlers: Story = {
  args: {
    src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    width: '800px',
    height: '600px',
  },
  render: (args) => html`
    <div>
      <nr-document
        src=${args.src}
        type=${args.type}
        width=${args.width}
        height=${args.height}
        @nr-document-load=${(e: CustomEvent) => console.log('Document loaded:', e.detail)}
        @nr-document-error=${(e: CustomEvent) => console.log('Document error:', e.detail)}
        @nr-document-preview-open=${(e: CustomEvent) => console.log('Preview opened:', e.detail)}
        @nr-document-preview-close=${(e: CustomEvent) => console.log('Preview closed:', e.detail)}
      ></nr-document>
      <p style="margin-top: 16px; color: #666; font-size: 14px;">
        Check the console for event logs
      </p>
    </div>
  `,
};

export const ErrorState: Story = {
  args: {
    src: 'https://invalid-document-url.example.com/document.pdf',
    type: 'pdf',
    width: '800px',
    height: '600px',
  },
  render: (args) => html`
    <nr-document
      src=${args.src}
      type=${args.type}
      width=${args.width}
      height=${args.height}
    ></nr-document>
  `,
};

export const EmbeddedGoogleDoc: Story = {
  args: {
    src: 'https://docs.google.com/document/d/e/2PACX-1vQGfk-VHhJQhZ5VZJ8EqP-T6YU5pZZ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ5aJ/pub?embedded=true',
    type: 'other',
    width: '100%',
    height: '600px',
  },
  render: (args) => html`
    <nr-document
      src=${args.src}
      type=${args.type}
      width=${args.width}
      height=${args.height}
      block
    ></nr-document>
  `,
};

export const ResponsiveLayout: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <nr-document
        src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        type="pdf"
        width="100%"
        height="400px"
        block
      ></nr-document>
      <p style="color: #666; font-size: 14px; margin: 0;">
        This document viewer adapts to its container width
      </p>
    </div>
  `,
};

export const MultipleDocuments: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3 style="margin: 0 0 8px 0;">Document 1</h3>
        <nr-document
          src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          type="pdf"
          width="100%"
          height="400px"
          block
          previewable
        ></nr-document>
      </div>
      <div>
        <h3 style="margin: 0 0 8px 0;">Document 2</h3>
        <nr-document
          src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          type="pdf"
          width="100%"
          height="400px"
          block
          previewable
        ></nr-document>
      </div>
    </div>
  `,
};

export const InCard: Story = {
  render: () => html`
    <div style="max-width: 800px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: white;">
      <h2 style="margin: 0 0 16px 0;">Project Documentation</h2>
      <nr-document
        src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        type="pdf"
        width="100%"
        height="500px"
        block
        previewable
      ></nr-document>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
        <button style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Download PDF
        </button>
      </div>
    </div>
  `,
};
