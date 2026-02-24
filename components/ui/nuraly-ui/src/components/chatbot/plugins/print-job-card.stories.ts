/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../chatbot.component.js';
import '../../skeleton/index.js';
import { ChatbotCoreController } from '../core/chatbot-core.controller.js';
import { MockProvider } from '../providers/mock-provider.js';
import { PrintJobCardPlugin, type PrintJobData } from './print-job-card-plugin.js';

const meta: Meta = {
  title: 'Components/Chatbot/Plugins/Print Job Card',
  component: 'nr-chatbot',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# Print Job Card Plugin

The Print Job Card Plugin transforms print job status information into visually rich status cards. Perfect for office management systems, print queue monitoring, and document management applications.

## Features

- 🖨️ **Real-time Status**: Display current print job status with visual indicators
- 📊 **Progress Tracking**: Show printing progress with animated progress bars
- 🎨 **Priority Levels**: Visual badges for high/normal/low priority jobs
- ⚠️ **Error Handling**: Clear error messages and status indicators
- 📱 **Responsive Design**: Adapts to different screen sizes
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **Streaming Support**: Works with character-by-character streaming

## Status Types

- **Queued**: Job is waiting in the print queue
- **Printing**: Job is currently printing (with progress bar)
- **Completed**: Job finished successfully
- **Paused**: Job temporarily paused
- **Error**: Job encountered an error
- **Cancelled**: Job was cancelled by user

## Usage

\`\`\`typescript
import { PrintJobCardPlugin } from '@nuralyui/chatbot/plugins';

const printJobPlugin = new PrintJobCardPlugin();
controller.registerPlugin(printJobPlugin);
\`\`\`

## Tag Format

Use \`[PRINTJOB]...[/PRINTJOB]\` tags with JSON content:

### Printing Status
\`\`\`json
[PRINTJOB]{
  "jobId": "PRT-2024-1234",
  "documentName": "Q4_Financial_Report.pdf",
  "printerName": "HP LaserJet Pro MFP M428",
  "status": "printing",
  "pagesPrinted": 15,
  "totalPages": 45,
  "copies": 3,
  "userName": "John Doe",
  "submittedAt": "2024-10-28T14:30:00Z",
  "priority": "high",
  "colorMode": "color",
  "paperSize": "A4",
  "estimatedTime": "5 min"
}[/PRINTJOB]
\`\`\`

### Queued Status
\`\`\`json
[PRINTJOB]{
  "jobId": "PRT-2024-5678",
  "documentName": "Employee_Handbook_2024.pdf",
  "printerName": "Canon ImageRunner ADVANCE",
  "status": "queued",
  "totalPages": 120,
  "copies": 25,
  "userName": "HR Department",
  "submittedAt": "2024-10-28T15:00:00Z",
  "priority": "normal",
  "colorMode": "grayscale",
  "paperSize": "Letter"
}[/PRINTJOB]
\`\`\`

### Completed Status
\`\`\`json
[PRINTJOB]{
  "jobId": "PRT-2024-9999",
  "documentName": "Marketing_Brochure.pdf",
  "printerName": "Epson EcoTank ET-4760",
  "status": "completed",
  "totalPages": 8,
  "copies": 50,
  "userName": "Marketing Team",
  "submittedAt": "2024-10-28T13:00:00Z",
  "completedAt": "2024-10-28T13:15:00Z",
  "priority": "normal",
  "colorMode": "color",
  "paperSize": "A4"
}[/PRINTJOB]
\`\`\`

### Error Status
\`\`\`json
[PRINTJOB]{
  "jobId": "PRT-2024-ERROR",
  "documentName": "Large_Presentation.pptx",
  "printerName": "Brother HL-L8360CDW",
  "status": "error",
  "totalPages": 75,
  "copies": 1,
  "userName": "Jane Smith",
  "submittedAt": "2024-10-28T16:00:00Z",
  "priority": "high",
  "colorMode": "color",
  "paperSize": "A4",
  "errorMessage": "Paper jam detected in Tray 2. Please clear the jam and restart the print job."
}[/PRINTJOB]
\`\`\`

### Paused Status
\`\`\`json
[PRINTJOB]{
  "jobId": "PRT-2024-PAUSE",
  "documentName": "Training_Materials.pdf",
  "printerName": "Xerox VersaLink C405",
  "status": "paused",
  "pagesPrinted": 30,
  "totalPages": 100,
  "copies": 10,
  "userName": "Training Dept",
  "submittedAt": "2024-10-28T10:00:00Z",
  "priority": "low",
  "colorMode": "color",
  "paperSize": "Letter"
}[/PRINTJOB]
\`\`\`

### Cancelled Status
\`\`\`json
[PRINTJOB]{
  "jobId": "PRT-2024-CANCEL",
  "documentName": "Old_Draft.pdf",
  "printerName": "HP OfficeJet Pro",
  "status": "cancelled",
  "totalPages": 50,
  "copies": 1,
  "userName": "John Doe",
  "submittedAt": "2024-10-28T12:00:00Z",
  "priority": "normal",
  "colorMode": "grayscale",
  "paperSize": "A4"
}[/PRINTJOB]
\`\`\`
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj;

/**
 * Printing Status - Shows an active print job with progress
 */
export const PrintingStatus: Story = {
  render: () => {
    const printJobData: PrintJobData = {
      jobId: 'PRT-2024-1234',
      documentName: 'Q4_Financial_Report.pdf',
      printerName: 'HP LaserJet Pro MFP M428',
      status: 'printing',
      pagesPrinted: 15,
      totalPages: 45,
      copies: 3,
      userName: 'John Doe',
      submittedAt: '2024-10-28T14:30:00Z',
      priority: 'high',
      colorMode: 'color',
      paperSize: 'A4',
      estimatedTime: '5 min'
    };

    const response = `Your print job is currently processing. [PRINTJOB]${JSON.stringify(printJobData)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can help you check your print job status.\n\nTry asking:\n• "Check my print status"\n• "What\'s the status of my job?"',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'status', text: 'Check my print status', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Ask for print job status..."
        style="height: 600px;"
      ></nr-chatbot>
    `;
  }
};

/**
 * Queued Status - Shows a job waiting in queue
 */
export const QueuedStatus: Story = {
  render: () => {
    const printJobData: PrintJobData = {
      jobId: 'PRT-2024-5678',
      documentName: 'Employee_Handbook_2024.pdf',
      printerName: 'Canon ImageRunner ADVANCE',
      status: 'queued',
      totalPages: 120,
      copies: 25,
      userName: 'HR Department',
      submittedAt: '2024-10-28T15:00:00Z',
      priority: 'normal',
      colorMode: 'grayscale',
      paperSize: 'Letter'
    };

    const response = `Your print job is in the queue. [PRINTJOB]${JSON.stringify(printJobData)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can help you check your print queue status.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'queue', text: 'Check print queue', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Check print queue..."
        style="height: 600px;"
      ></nr-chatbot>
    `;
  }
};

/**
 * Completed Status - Shows a successfully completed print job
 */
export const CompletedStatus: Story = {
  render: () => {
    const printJobData: PrintJobData = {
      jobId: 'PRT-2024-9999',
      documentName: 'Marketing_Brochure.pdf',
      printerName: 'Epson EcoTank ET-4760',
      status: 'completed',
      totalPages: 8,
      copies: 50,
      userName: 'Marketing Team',
      submittedAt: '2024-10-28T13:00:00Z',
      completedAt: '2024-10-28T13:15:00Z',
      priority: 'normal',
      colorMode: 'color',
      paperSize: 'A4'
    };

    const response = `Your print job completed successfully! [PRINTJOB]${JSON.stringify(printJobData)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can help you check your completed print jobs.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'status', text: 'Check job status', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Check job status..."
        style="height: 600px;"
      ></nr-chatbot>
    `;
  }
};

/**
 * Error Status - Shows a print job with an error
 */
export const ErrorStatus: Story = {
  render: () => {
    const printJobData: PrintJobData = {
      jobId: 'PRT-2024-ERROR',
      documentName: 'Large_Presentation.pptx',
      printerName: 'Brother HL-L8360CDW',
      status: 'error',
      totalPages: 75,
      copies: 1,
      userName: 'Jane Smith',
      submittedAt: '2024-10-28T16:00:00Z',
      priority: 'high',
      colorMode: 'color',
      paperSize: 'A4',
      errorMessage: 'Paper jam detected in Tray 2. Please clear the jam and restart the print job.'
    };

    const response = `There was an error with your print job. [PRINTJOB]${JSON.stringify(printJobData)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can help you troubleshoot print job errors.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'error', text: 'What happened to my job?', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Report an issue..."
        style="height: 600px;"
      ></nr-chatbot>
    `;
  }
};

/**
 * Paused Status - Shows a paused print job
 */
export const PausedStatus: Story = {
  render: () => {
    const printJobData: PrintJobData = {
      jobId: 'PRT-2024-PAUSE',
      documentName: 'Training_Materials.pdf',
      printerName: 'Xerox VersaLink C405',
      status: 'paused',
      pagesPrinted: 30,
      totalPages: 100,
      copies: 10,
      userName: 'Training Dept',
      submittedAt: '2024-10-28T10:00:00Z',
      priority: 'low',
      colorMode: 'color',
      paperSize: 'Letter'
    };

    const response = `Your print job is currently paused. [PRINTJOB]${JSON.stringify(printJobData)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can help you check paused print jobs.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'paused', text: 'Why is my job paused?', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Check paused jobs..."
        style="height: 600px;"
      ></nr-chatbot>
    `;
  }
};

/**
 * Multiple Print Jobs - Shows multiple print job statuses in one conversation
 */
export const MultiplePrintJobs: Story = {
  render: () => {
    const job1: PrintJobData = {
      jobId: 'PRT-2024-001',
      documentName: 'Invoice_October.pdf',
      printerName: 'HP LaserJet Pro',
      status: 'printing',
      pagesPrinted: 5,
      totalPages: 10,
      copies: 1,
      userName: 'Accounting',
      submittedAt: '2024-10-28T14:00:00Z',
      priority: 'high',
      colorMode: 'grayscale',
      paperSize: 'A4',
      estimatedTime: '2 min'
    };

    const job2: PrintJobData = {
      jobId: 'PRT-2024-002',
      documentName: 'Meeting_Notes.docx',
      printerName: 'Canon Printer',
      status: 'queued',
      totalPages: 3,
      copies: 5,
      userName: 'Admin',
      submittedAt: '2024-10-28T14:05:00Z',
      priority: 'normal',
      colorMode: 'color',
      paperSize: 'Letter'
    };

    const job3: PrintJobData = {
      jobId: 'PRT-2024-003',
      documentName: 'Report_Final.pdf',
      printerName: 'Epson Printer',
      status: 'completed',
      totalPages: 25,
      copies: 2,
      userName: 'Management',
      submittedAt: '2024-10-28T13:30:00Z',
      completedAt: '2024-10-28T13:45:00Z',
      priority: 'normal',
      colorMode: 'color',
      paperSize: 'A4'
    };

    const response = `Here are your active print jobs:\n\n[PRINTJOB]${JSON.stringify(job1)}[/PRINTJOB]\n\n[PRINTJOB]${JSON.stringify(job2)}[/PRINTJOB]\n\n[PRINTJOB]${JSON.stringify(job3)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can show you all your print jobs.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'all', text: 'Show all print jobs', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Show all print jobs..."
        style="height: 700px;"
      ></nr-chatbot>
    `;
  }
};

/**
 * Cancelled Status - Shows a cancelled print job
 */
export const CancelledStatus: Story = {
  render: () => {
    const printJobData: PrintJobData = {
      jobId: 'PRT-2024-CANCEL',
      documentName: 'Old_Draft.pdf',
      printerName: 'HP OfficeJet Pro',
      status: 'cancelled',
      totalPages: 50,
      copies: 1,
      userName: 'John Doe',
      submittedAt: '2024-10-28T12:00:00Z',
      priority: 'normal',
      colorMode: 'grayscale',
      paperSize: 'A4'
    };

    const response = `This print job was cancelled. [PRINTJOB]${JSON.stringify(printJobData)}[/PRINTJOB]`;

    // Create mock provider
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [response]
    });

    // Connect provider
    mockProvider.connect();

    // Create controller with print job plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new PrintJobCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I can help you check cancelled print jobs.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'cancelled', text: 'Check cancelled job', enabled: true }
          ]
        }
      ]
    });

    return html`
      <nr-chatbot
        .controller=${controller}
        title="Print Queue Manager"
        placeholder="Check cancelled jobs..."
        style="height: 600px;"
      ></nr-chatbot>
    `;
  }
};
