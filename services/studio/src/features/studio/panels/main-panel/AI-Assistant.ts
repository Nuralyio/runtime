import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import styles from "./AI-Assistant.style.ts";
import { $context, getVar } from '../../../../features/runtime/redux/store/context.ts';
import { addPageAction } from '../../../../features/runtime/redux/actions/page/addPageAction.ts';
import { $applicationComponents } from '../../../../features/runtime/redux/store/component/store.ts';
import { traitCompoentFromSchema } from '@nuraly/runtime/utils';

@customElement("ai-assistant-block")
export class AIAssistantBlock extends LitElement {
  // WebSocket instance
  private _socket: WebSocket | null = null;

  // Draggable state^
  private _isDragging = false;
  private _offsetX = 0;
  private _offsetY = 0;

  // Track visibility on double Shift press
  private _shiftPressCount = 0;
  private _pressTimer: number | null = null;
  private _doublePressThreshold = 300; // ms to detect two Shift presses

  @state()
  private _isVisible = false; // controls visibility

  @state()
  private _lastMessage = ""; // stores the most recent message (not used in UI below but kept if needed)

  @state()
  private _chatMessages: TemplateResult[] = []; // chat message history

  @state()
  private _selectedComponents: any[] = []; // holds currently selected components

  @state()
  private _isDarkMode = false;

  @state()
  private _isDebugMode = false;
  /**
   * A state variable to track if we are in "loading" mode.
   * This will show a spinner in the Send button.
   */
  @state()
  private _isLoading = false;

  // Theme detection and management
  private _mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  static styles = [
    styles,
    css`

        .ai-message {
            padding: 10px;
            background-color: var(--ai-message-background, #f1f1f1);
            border-radius: 5px;
            overflow: auto;
        }

        .ai-message h3 {
            margin: 10px 0 5px 0;
            font-size: 1.1em;
            color: var(--header-color, #333);
        }

        .ai-message ul {
            list-style-type: disc;
            padding-left: 20px;
            margin: 0 0 10px 0;
        }

        .ai-message li {
            margin-bottom: 5px;
            word-wrap: break-word;
        }

        .ai-message a {
            color: var(--link-color, #0066cc);
            text-decoration: none;
        }

        .ai-message a:hover {
            text-decoration: underline;
        }

        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border-left-color: #09f;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Additional Styles for Selected Components */
        .selected-components {
            padding: 10px;
            background-color: var(--selected-components-background, #e8f4ff);
            border-radius: 5px;
            overflow: auto;
            margin-bottom: 10px;
        }

        .selected-components h3 {
            margin: 0 0 5px 0;
            font-size: 1.1em;
            color: var(--header-color, #333);
        }

        .selected-components ul {
            list-style-type: disc;
            padding-left: 20px;
            margin: 0;
        }

        .selected-components li {
            margin-bottom: 5px;
            word-wrap: break-word;
        }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("toggle-ai-assistant", this._toggleVisibility.bind(this));

    this._isDarkMode = this._mediaQuery.matches;
    this._updateTheme();

    this._mediaQuery.addEventListener("change", this._handleThemeChange);

    this._initializeWebSocket();

    // Listen for context changes related to selected components
    $context.listen(() => {
      const currentComponentIds = getVar("global", "selectedComponents")?.value;
      if (!currentComponentIds) {
        // If no components are selected, clear the selectedComponents state
        this._selectedComponents = [];
        return;
      }

      const currentEditingApplication = getVar('global', "currentEditingApplication").value;
      const applicationComponents = $applicationComponents(currentEditingApplication.uuid).get();
      const selectedComponents = applicationComponents.filter((component) =>
        Array.from(currentComponentIds).includes(component.uuid)
      );


      // Update the _selectedComponents state without modifying _chatMessages
      this._selectedComponents = selectedComponents;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("toggle-ai-assistant", this._toggleVisibility.bind(this));
    window.removeEventListener("keydown", this._onKeyDown);
    this._mediaQuery.removeEventListener("change", this._handleThemeChange);

    this._socket?.close();
  }

  private _initializeWebSocket() {
    const domain = window.location.hostname;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    this._socket = new WebSocket(`${protocol}://${domain}/api/v1/agent/chatbot`);
    this._socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
    });

    this._socket.addEventListener("message", (event) => {
      const data = event.data;
      console.log("Received message:", data);
      const response = JSON.parse(data);

      // Build the AI message
      const aiMessage = this._buildAIMessage(response);

      // Add the AI message to chat messages
      //this._chatMessages = [...this._chatMessages, aiMessage];
      this._chatMessages = [aiMessage];
      // Once a response is received, stop loading
      this._isLoading = false;
    });

    this._socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
      this._socket = null;
      // If needed, you could also stop loading here if the connection fails
      this._isLoading = false;
    });

    this._socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      // Handle error state, stop loading if necessary
      this._isLoading = false;
    });
  }

  /**
   * Constructs the AI message as a TemplateResult
   * @param response The parsed WebSocket response
   * @returns TemplateResult representing the AI message
   */
  private _buildAIMessage(response: any): TemplateResult {
    return html`<div class="ai-message">
      <b>Nuraly</b>:<br />
      ${this._isDebugMode
        ? html`<pre
          style="white-space: pre-wrap; word-wrap: break-word; max-width: 100%; overflow-x: auto;"
        >
            ${JSON.stringify(response, null, 2)}
          </pre>`
        : nothing}
      ${response.message ?? nothing}
      ${this._renderComponents(response.components)}
      ${this._renderPages(response.pages)}
      ${this.executeAction(response)}
    </div>`;
  }

  private executeAction(response: any) {
    if (response.components || response.pages) {
      return html`
        <nr-button
          @click=${() => {
            if (response.components) {
              traitCompoentFromSchema(JSON.stringify(response))
            }
            if (response.pages) {
              response.pages.forEach((page: any) => {
                addPageAction({ name: page.name, url: page.name, component_ids: [] });
              });
            }
          }}
        >
          Execute
        </nr-button>
      `;
    }
    return nothing;
  }

  /**
   * Renders the components section if available
   * @param components Array of component objects
   * @returns TemplateResult or nothing
   */
  private _renderComponents(components: any[]): TemplateResult | null {
    if (Array.isArray(components) && components.length > 0) {
      return html`
        <h3>Components:</h3>
        <ul>
          ${components.map(
            (component) =>
              html`<li>
                ${component.name}
              </li>`
          )}
        </ul>
      `;
    }
    return null;
  }

  /**
   * Renders the pages section if available
   * @param pages Array of page objects
   * @returns TemplateResult or nothing
   */
  private _renderPages(pages: any[]): TemplateResult | null {
    if (Array.isArray(pages) && pages.length > 0) {
      return html`
        <h3>Pages:</h3>
        <ul>
          ${pages.map(
            (page) =>
              html`<li>
                <strong>${page.name}</strong>:
                <a href="${page.url}" target="_blank" rel="noopener noreferrer">
                  ${page.url}
                </a>
              </li>`
          )}
        </ul>
      `;
    }
    return null;
  }

  /**
   * Appends a user message to the chat.
   */
  private _sendMessage() {
    this._chatMessages  =[]
    const inputEl = this.shadowRoot?.querySelector("input");
    if (inputEl) {
      const messageText = inputEl.value.trim();
      if (messageText.length > 0) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
          // Set loading to true when we send a message
          this._isLoading = true;
          const body  = {
            message: messageText
          }
          if(this._selectedComponents.length && this._selectedComponents[0].component_type!=="vertical-container-block"){
            body['payload'] = JSON.stringify(this._selectedComponents);
          }
          this._socket.send(JSON.stringify(body));
          this._chatMessages = [
            ...this._chatMessages,
            html`<div class="user-message">You: ${messageText}</div>`,
          ];
        } else {
          console.error("WebSocket is not open");
        }
        inputEl.value = "";
      }
    }
  }

  render() {
    // Update the "visible" attribute based on _isVisible
    if (this._isVisible) {
      this.setAttribute("visible", "");
    } else {
      this.removeAttribute("visible");
    }

    return html`
      ${this._isVisible
      ? html`
            <div
              class="chat-bubble"
              @pointerdown=${this._pointerDown}
              @pointermove=${this._pointerMove}
              @pointerup=${this._pointerUp}
              @pointercancel=${this._pointerUp}
              @pointerleave=${this._pointerUp}
            >
              ${this._renderSelectedComponents()}

              <div class="message-container">
                ${this._chatMessages.map(
        (message) => html`<div class="message">${message}</div>`
      )}
              </div>

              <div class="input-container">
                <input
                  autofocus
                  type="text"
                  placeholder="Type your message..."
                  value=""
                  @keydown=${this._onInputKeyDown}
                />
                <button @click=${this._sendMessage} ?disabled=${this._isLoading}>
                  ${this._isLoading
        ? html`<span class="spinner"></span>`
        : html`Send`}
                </button>
              </div>
            </div>
          `
      : nothing}
    `;
  }

  /**
   * Renders the selected components after the chat messages.
   * @returns TemplateResult or nothing
   */
  private _renderSelectedComponents(): TemplateResult | null {
    if (this._selectedComponents.length === 0) {
      return null;
    }

    return html`
      <div class="selected-components">
        <h3>Selected Components:</h3>
        <ul>
          ${this._selectedComponents.map(
      (component) => html`<li>${component.name}</li>`
    )}
        </ul>
      </div>
    `;
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      this._shiftPressCount++;
      if (this._shiftPressCount === 1) {
        this._pressTimer = window.setTimeout(() => {
          this._shiftPressCount = 0;
          this._pressTimer = null;
        }, this._doublePressThreshold);
      } else if (this._shiftPressCount === 2) {
        if (this._pressTimer) {
          clearTimeout(this._pressTimer);
          this._pressTimer = null;
        }
        this._shiftPressCount = 0;
        this._toggleVisibility();
      }
    }
  };

  private _toggleVisibility() {
    this._isVisible = !this._isVisible;
    // When becoming visible, focus the input:
    if (this._isVisible) {
      requestAnimationFrame(() => {
        this.shadowRoot?.querySelector<HTMLInputElement>("input")?.focus();
      });
    }
  }

  private _onInputKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this._sendMessage();
    }
  }

  private _pointerDown(e: PointerEvent) {
    const target = e.composedPath()[0] as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("input")
    ) {
      return;
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    let currentBottom = parseFloat(getComputedStyle(this).bottom);
    if (isNaN(currentBottom)) {
      currentBottom = 20;
      this.style.bottom = "20px";
    }

    let currentLeft = parseFloat(getComputedStyle(this).left);
    if (isNaN(currentLeft)) {
      const rect = this.getBoundingClientRect();
      currentLeft = window.innerWidth / 2 - rect.width / 2;
      this.style.left = `${currentLeft}px`;
    }

    this._offsetX = e.clientX - currentLeft;
    const pointerBottom = window.innerHeight - e.clientY;
    this._offsetY = pointerBottom - currentBottom;

    this._isDragging = true;
  }

  private _pointerMove(e: PointerEvent) {
    if (!this._isDragging) return;

    const pointerBottom = window.innerHeight - e.clientY;
    const newBottom = pointerBottom - this._offsetY;

    const pointerX = e.clientX;
    const newLeft = pointerX - this._offsetX;

    this.style.bottom = `${newBottom}px`;
    this.style.left = `${newLeft}px`;
  }

  private _pointerUp(e: PointerEvent) {
    this._isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  private _handleThemeChange = (e: MediaQueryListEvent) => {
    this._isDarkMode = e.matches;
    this._updateTheme();
  };

  private _updateTheme() {
    if (this._isDarkMode) {
      this.setAttribute("dark", "");
    } else {
      this.removeAttribute("dark");
    }
  }
}