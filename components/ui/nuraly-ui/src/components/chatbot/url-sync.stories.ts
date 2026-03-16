/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import { ChatbotCoreController } from './core/chatbot-core.controller.js';
import { MockProvider } from './providers/mock-provider.js';
import './chatbot.component.js';
import type { Meta, StoryObj } from '@storybook/web-components';
import type { ChatbotThread } from './chatbot.types.js';

const meta: Meta = {
  title: 'Components/Chatbot/URL Sync',
  component: 'nr-chatbot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# URL Sync Testing

Tests the \`enableUrlSync\` feature which syncs the active thread ID to the URL hash
(\`#conversation/<threadId>\`).

## Expected behavior

1. Switching threads updates the URL hash
2. Navigating to a URL with \`#conversation/<id>\` selects that thread on load
3. Browser back/forward navigates between threads
4. Creating a new thread updates the hash
5. Deleting the active thread clears or updates the hash
        `
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Helper to create a pre-populated controller with threads
 */
function createThreadedController(): { controller: ChatbotCoreController; threads: ChatbotThread[] } {
  const threads: ChatbotThread[] = [
    {
      id: 'thread-alpha',
      title: 'Alpha Conversation',
      messages: [
        { id: 'a1', sender: 'bot' as any, text: 'Welcome to the Alpha thread!', timestamp: new Date().toISOString() },
        { id: 'a2', sender: 'user' as any, text: 'Hello from Alpha', timestamp: new Date().toISOString() },
        { id: 'a3', sender: 'bot' as any, text: 'This is the Alpha conversation. Check the URL — it should show #conversation/thread-alpha', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'thread-beta',
      title: 'Beta Conversation',
      messages: [
        { id: 'b1', sender: 'bot' as any, text: 'Welcome to the Beta thread!', timestamp: new Date().toISOString() },
        { id: 'b2', sender: 'user' as any, text: 'Hello from Beta', timestamp: new Date().toISOString() },
        { id: 'b3', sender: 'bot' as any, text: 'This is the Beta conversation. Check the URL — it should show #conversation/thread-beta', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'thread-gamma',
      title: 'Gamma Conversation',
      messages: [
        { id: 'g1', sender: 'bot' as any, text: 'Welcome to Gamma!', timestamp: new Date().toISOString() },
        { id: 'g2', sender: 'bot' as any, text: 'Switch between threads and watch the URL hash update.', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const controller = new ChatbotCoreController({
    provider: new MockProvider({
      delay: 300,
      streaming: true,
      streamingSpeed: 5,
      streamingInterval: 20,
      contextualResponses: true
    }),
    enableThreads: true
  });

  return { controller, threads };
}

/**
 * Basic URL Sync — switch threads and watch the URL hash change.
 *
 * **How to test:**
 * 1. Click different threads in the sidebar
 * 2. Check that the browser URL updates to `#conversation/<threadId>`
 * 3. The status bar below shows the current hash in real time
 */
export const BasicUrlSync: Story = {
  render: () => {
    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-basic') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        controller.switchThread('thread-alpha');
        chatbot.enableThreadCreation = true;
      }

      // Update status bar with current hash
      const statusEl = document.querySelector('#url-status-basic');
      const updateStatus = () => {
        if (statusEl) {
          statusEl.textContent = window.location.hash || '(no hash)';
        }
      };
      updateStatus();
      window.addEventListener('hashchange', updateStatus);
      // Also poll for replaceState changes (which don't fire hashchange)
      setInterval(updateStatus, 500);
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #0f0; font-family: monospace; font-size: 13px; display: flex; align-items: center; gap: 8px;">
          <span>URL Hash:</span>
          <code id="url-status-basic" style="color: #0ff;">(loading...)</code>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-basic"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${true}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Navigate to hash on load — set `#conversation/thread-beta` before the component mounts.
 *
 * **How to test:**
 * 1. The URL should already have `#conversation/thread-beta`
 * 2. The Beta thread should be auto-selected on load
 * 3. If it does NOT select Beta, the hash-on-load feature is broken
 */
export const HashOnLoad: Story = {
  render: () => {
    // Pre-set the hash before rendering
    window.location.hash = '#conversation/thread-beta';

    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-hash-load') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        // Deliberately do NOT call switchThread — the hash should trigger it
        chatbot.enableThreadCreation = true;
      }

      const statusEl = document.querySelector('#url-status-hash-load');
      const updateStatus = () => {
        if (statusEl) {
          const state = controller.getState();
          statusEl.textContent = `Hash: ${window.location.hash || '(none)'} | Active thread: ${state.currentThreadId || '(none)'}`;
        }
      };
      updateStatus();
      window.addEventListener('hashchange', updateStatus);
      setInterval(updateStatus, 500);
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #0f0; font-family: monospace; font-size: 13px;">
          <span id="url-status-hash-load" style="color: #0ff;">(loading...)</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-hash-load"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${true}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Browser back/forward navigation between threads.
 *
 * **How to test:**
 * 1. Click thread Alpha → Beta → Gamma in the sidebar
 * 2. Press browser Back button — should return to Beta
 * 3. Press browser Back again — should return to Alpha
 * 4. Press browser Forward — should go to Beta
 */
export const BackForwardNavigation: Story = {
  render: () => {
    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-backfwd') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        controller.switchThread('thread-alpha');
        chatbot.enableThreadCreation = true;
      }

      const logEl = document.querySelector('#nav-log');
      const log = (msg: string) => {
        if (logEl) {
          const entry = document.createElement('div');
          entry.textContent = `${new Date().toLocaleTimeString()} — ${msg}`;
          logEl.prepend(entry);
          // Keep only last 20 entries
          while (logEl.children.length > 20) {
            logEl.removeChild(logEl.lastChild!);
          }
        }
      };

      log(`Initial: ${window.location.hash || '(no hash)'}`);

      window.addEventListener('hashchange', () => {
        const state = controller.getState();
        log(`hashchange → ${window.location.hash} (controller thread: ${state.currentThreadId})`);
      });

      // Monitor popstate for back/forward
      window.addEventListener('popstate', () => {
        log(`popstate → ${window.location.hash}`);
      });
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #0f0; font-family: monospace; font-size: 12px; max-height: 120px; overflow-y: auto;">
          <div style="margin-bottom: 4px; color: #ff0; font-weight: bold;">Navigation Log (switch threads, then use browser Back/Forward):</div>
          <div id="nav-log"></div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-backfwd"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${true}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Create new thread and verify URL updates.
 *
 * **How to test:**
 * 1. Click the "+" button to create a new thread
 * 2. The URL hash should update to the new thread's ID
 * 3. Send a message in the new thread
 * 4. Switch back to an existing thread — hash should update
 */
export const CreateThreadUrlUpdate: Story = {
  render: () => {
    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-create') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        controller.switchThread('thread-alpha');
        chatbot.enableThreadCreation = true;
      }

      const statusEl = document.querySelector('#url-status-create');
      const updateStatus = () => {
        if (statusEl) {
          const state = controller.getState();
          statusEl.textContent = `Hash: ${window.location.hash || '(none)'} | Thread: ${state.currentThreadId || '(none)'} | Total threads: ${state.threads.length}`;
        }
      };
      updateStatus();
      window.addEventListener('hashchange', updateStatus);
      setInterval(updateStatus, 500);
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #0f0; font-family: monospace; font-size: 13px;">
          <span id="url-status-create" style="color: #0ff;">(loading...)</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-create"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${true}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Delete active thread and verify URL updates.
 *
 * **How to test:**
 * 1. Switch to Beta thread (hash should show thread-beta)
 * 2. Delete the Beta thread
 * 3. The controller should switch to another thread
 * 4. The URL hash should update accordingly
 */
export const DeleteThreadUrlUpdate: Story = {
  render: () => {
    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-delete') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        controller.switchThread('thread-alpha');
        chatbot.enableThreadCreation = true;
      }

      const statusEl = document.querySelector('#url-status-delete');
      const updateStatus = () => {
        if (statusEl) {
          const state = controller.getState();
          statusEl.textContent = `Hash: ${window.location.hash || '(none)'} | Active: ${state.currentThreadId || '(none)'} | Threads: ${state.threads.map(t => t.id).join(', ')}`;
        }
      };
      updateStatus();
      window.addEventListener('hashchange', updateStatus);
      setInterval(updateStatus, 500);
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #0f0; font-family: monospace; font-size: 13px;">
          <span id="url-status-delete" style="color: #0ff;">(loading...)</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-delete"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${true}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * URL sync disabled — hash should NOT update when switching threads.
 *
 * **How to test:**
 * 1. Switch between threads
 * 2. The URL hash should remain empty / unchanged
 * 3. This confirms the feature properly respects the enableUrlSync flag
 */
export const UrlSyncDisabled: Story = {
  render: () => {
    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-disabled') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        controller.switchThread('thread-alpha');
        chatbot.enableThreadCreation = true;
      }

      const statusEl = document.querySelector('#url-status-disabled');
      const updateStatus = () => {
        if (statusEl) {
          statusEl.textContent = `Hash: ${window.location.hash || '(none)'} — should stay empty`;
        }
      };
      updateStatus();
      window.addEventListener('hashchange', updateStatus);
      setInterval(updateStatus, 500);
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #ff0; font-family: monospace; font-size: 13px;">
          <span>enableUrlSync = false</span>
          <span style="margin-left: 16px;" id="url-status-disabled" style="color: #0ff;">(loading...)</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-disabled"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${false}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Boxed layout with URL sync — verify URL sync works with boxed variant.
 *
 * **How to test:**
 * 1. Switch threads and verify URL hash updates
 * 2. Confirm boxed layout renders correctly alongside URL sync
 */
export const BoxedWithUrlSync: Story = {
  render: () => {
    const { controller, threads } = createThreadedController();

    setTimeout(() => {
      const chatbot = document.querySelector('#url-sync-boxed') as any;
      if (chatbot && !chatbot.controller) {
        chatbot.controller = controller;
        controller.loadConversations(threads);
        controller.switchThread('thread-alpha');
        chatbot.enableThreadCreation = true;
      }

      const statusEl = document.querySelector('#url-status-boxed');
      const updateStatus = () => {
        if (statusEl) {
          const state = controller.getState();
          statusEl.textContent = `Hash: ${window.location.hash || '(none)'} | Thread: ${state.currentThreadId || '(none)'}`;
        }
      };
      updateStatus();
      window.addEventListener('hashchange', updateStatus);
      setInterval(updateStatus, 500);
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="padding: 8px 16px; background: #1a1a2e; color: #0f0; font-family: monospace; font-size: 13px;">
          <span id="url-status-boxed" style="color: #0ff;">(loading...)</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
          <nr-chatbot
            id="url-sync-boxed"
            size="full"
            variant="default"
            .showThreads=${true}
            .enableUrlSync=${true}
            .showSendButton=${true}
            .autoScroll=${true}
            .boxed=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};
