/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ChatbotSize } from './chatbot.types.js';
import { ChatbotCoreController } from './core/chatbot-core.controller.js';
import { MockProvider } from './providers/mock-provider.js';

import './chatbot.component.js';

const meta: Meta = {
  title: 'Components/Chatbot/File Upload Validation',
  component: 'nr-chatbot',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# File Upload Validation Testing

Test the \`maxFileSize\` configuration from \`ChatbotCoreController\`.

This story demonstrates how file upload validation works with different size limits:
- **10MB Limit**: Standard limit for most use cases
- **30MB Limit**: Higher limit for larger files
- **5MB Limit**: Strict limit for restricted scenarios

Each chatbot instance validates files according to its configured \`maxFileSize\` setting.
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj;

/**
 * File Upload Validation - Test maxFileSize Configuration
 * Demonstrates file upload validation with different file size limits.
 * Tests that the maxFileSize from controller config is properly applied.
 */
export const FileUploadValidation: Story = {
  render: (args) => {
    setTimeout(() => {
      const chatbot10MB = document.querySelector('#chatbot-10mb') as any;
      const chatbot30MB = document.querySelector('#chatbot-30mb') as any;
      const chatbot5MB = document.querySelector('#chatbot-5mb') as any;

      const setupChatbot = (element: any, maxFileSize: number, label: string) => {
        if (element && !element.controller) {
          const controller = new ChatbotCoreController({
            provider: new MockProvider({
              delay: 300,
              streaming: true,
              streamingSpeed: 5,
              streamingInterval: 20,
              contextualResponses: true
            }),
            enableFileUpload: true,
            maxFileSize: maxFileSize,
            maxFiles: 5,
            allowedFileTypes: ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
            metadata: {
              tag: 'file-upload-test'
            },
            ui: {
              onStateChange: (state) => {
                element.messages = state.messages;
                element.isBotTyping = state.isTyping;
                element.chatStarted = state.messages.length > 0;
                element.uploadedFiles = state.uploadedFiles;
              },
              onTypingStart: () => { element.isBotTyping = true; },
              onTypingEnd: () => { element.isBotTyping = false; },
              focusInput: () => { element.focusInput(); },
              showNotification: (message, type) => {
                const container = document.getElementById(`notifications-${label}`);
                if (container) {
                  const notif = document.createElement('div');
                  notif.style.cssText = `
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 6px;
                    font-size: 13px;
                    background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
                    color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
                    border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
                  `;
                  notif.textContent = `[${type.toUpperCase()}] ${message}`;
                  container.appendChild(notif);
                  
                  // Auto-remove after 5 seconds
                  setTimeout(() => notif.remove(), 5000);
                }
                console.log(`[${label} - ${type.toUpperCase()}] ${message}`);
              }
            }
          });

          element.controller = controller;
          element.enableFileUpload = true;
          element.actionButtons = [{ type: 'attach', enabled: true }];
          element.suggestions = [
            { id: `${label}-1`, text: `Test with ${label} limit`, enabled: true },
            { id: `${label}-2`, text: 'Try uploading files', enabled: true }
          ];
        }
      };

      setupChatbot(chatbot10MB, 10 * 1024 * 1024, '10MB');
      setupChatbot(chatbot30MB, 30 * 1024 * 1024, '30MB');
      setupChatbot(chatbot5MB, 5 * 1024 * 1024, '5MB');

      // Helper function to create test files
      const createTestFile = (sizeMB: number, name: string) => {
        const sizeBytes = sizeMB * 1024 * 1024;
        const blob = new Blob([new Uint8Array(sizeBytes)], { type: 'application/pdf' });
        return new File([blob], name, { type: 'application/pdf' });
      };

      // Wire up test buttons
      setTimeout(() => {
        const setupTestButtons = (chatbotId: string, label: string) => {
          const test3MB = document.getElementById(`test-3mb-${chatbotId}`) as HTMLButtonElement;
          const test8MB = document.getElementById(`test-8mb-${chatbotId}`) as HTMLButtonElement;
          const test15MB = document.getElementById(`test-15mb-${chatbotId}`) as HTMLButtonElement;
          const test25MB = document.getElementById(`test-25mb-${chatbotId}`) as HTMLButtonElement;

          const uploadFile = async (sizeMB: number, fileName: string) => {
            const chatbot = document.getElementById(chatbotId) as any;
            const controller = chatbot?.controller as ChatbotCoreController | undefined;
            if (!controller) return;

            const file = createTestFile(sizeMB, fileName);
            await controller.uploadFiles([file]);
          };

          if (test3MB) test3MB.onclick = () => uploadFile(3, 'test-3MB.pdf');
          if (test8MB) test8MB.onclick = () => uploadFile(8, 'test-8MB.pdf');
          if (test15MB) test15MB.onclick = () => uploadFile(15, 'test-15MB.pdf');
          if (test25MB) test25MB.onclick = () => uploadFile(25, 'test-25MB.pdf');
        };

        setupTestButtons('chatbot-10mb', '10MB');
        setupTestButtons('chatbot-30mb', '30MB');
        setupTestButtons('chatbot-5mb', '5MB');
      }, 100);
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 20px; max-width: 1200px;">
        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 12px 0; font-size: 24px;">📂 File Upload Validation Testing</h2>
          <p style="margin: 0 0 8px 0; font-size: 15px; opacity: 0.95;">
            Test the <code style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">maxFileSize</code> configuration from <code style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">ChatbotCoreController</code>.
          </p>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Each chatbot has a different file size limit. Try uploading files using the test buttons or the attach button.
          </p>
        </div>

        <!-- 10MB Limit Chatbot -->
        <div style="display: flex; gap: 16px;">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 16px; background: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #1565c0; font-size: 18px;">💙 10MB Limit</h3>
              <p style="margin: 0 0 12px 0; color: #1565c0; font-size: 13px;">
                <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px;">maxFileSize: 10 * 1024 * 1024</code>
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="test-3mb-chatbot-10mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ✅ Upload 3MB (Should Pass)
                </button>
                <button id="test-8mb-chatbot-10mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ✅ Upload 8MB (Should Pass)
                </button>
                <button id="test-15mb-chatbot-10mb" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ❌ Upload 15MB (Should Fail)
                </button>
                <button id="test-25mb-chatbot-10mb" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ❌ Upload 25MB (Should Fail)
                </button>
              </div>
              <div id="notifications-10MB" style="margin-top: 12px;"></div>
            </div>
            <div style="height: 400px; border: 1px solid #2196f3; border-radius: 8px; overflow: hidden;">
              <nr-chatbot
                id="chatbot-10mb"
                .size=${ChatbotSize.Small}
                .showSendButton=${true}
                .autoScroll=${true}
              ></nr-chatbot>
            </div>
          </div>

          <!-- 30MB Limit Chatbot -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 16px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 18px;">💚 30MB Limit</h3>
              <p style="margin: 0 0 12px 0; color: #2e7d32; font-size: 13px;">
                <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px;">maxFileSize: 30 * 1024 * 1024</code>
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="test-3mb-chatbot-30mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ✅ Upload 3MB (Should Pass)
                </button>
                <button id="test-8mb-chatbot-30mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ✅ Upload 8MB (Should Pass)
                </button>
                <button id="test-15mb-chatbot-30mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ✅ Upload 15MB (Should Pass)
                </button>
                <button id="test-25mb-chatbot-30mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  ✅ Upload 25MB (Should Pass)
                </button>
              </div>
              <div id="notifications-30MB" style="margin-top: 12px;"></div>
            </div>
            <div style="height: 400px; border: 1px solid #4caf50; border-radius: 8px; overflow: hidden;">
              <nr-chatbot
                id="chatbot-30mb"
                .size=${ChatbotSize.Small}
                .showSendButton=${true}
                .autoScroll=${true}
              ></nr-chatbot>
            </div>
          </div>
        </div>

        <!-- 5MB Limit Chatbot (Strict) -->
        <div style="padding: 16px; background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #e65100; font-size: 18px;">🧡 5MB Limit (Strict)</h3>
          <p style="margin: 0 0 12px 0; color: #e65100; font-size: 13px;">
            <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px;">maxFileSize: 5 * 1024 * 1024</code>
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="test-3mb-chatbot-5mb" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              ✅ Upload 3MB (Should Pass)
            </button>
            <button id="test-8mb-chatbot-5mb" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              ❌ Upload 8MB (Should Fail)
            </button>
            <button id="test-15mb-chatbot-5mb" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              ❌ Upload 15MB (Should Fail)
            </button>
            <button id="test-25mb-chatbot-5mb" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              ❌ Upload 25MB (Should Fail)
            </button>
          </div>
          <div id="notifications-5MB" style="margin-top: 12px;"></div>
        </div>
        <div style="height: 400px; border: 1px solid #ff9800; border-radius: 8px; overflow: hidden;">
          <nr-chatbot
            id="chatbot-5mb"
            .size=${ChatbotSize.Medium}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>

        <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #9c27b0;">
          <h4 style="margin: 0 0 8px 0; color: #6a1b9a;">📝 Expected Behavior:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #6a1b9a; font-size: 14px; line-height: 1.8;">
            <li><strong>Green buttons (✅):</strong> Files should upload successfully</li>
            <li><strong>Red buttons (❌):</strong> Files should be rejected with error notification</li>
            <li>Error message should display: "File size exceeds maximum allowed (X MB)"</li>
            <li>Check notifications area and browser console for validation messages</li>
          </ul>
        </div>
      </div>
    `;
  }
};
