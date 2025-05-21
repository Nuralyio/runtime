import { customElement, state, query } from "lit/decorators.js";
import { repeat } from 'lit/directives/repeat.js';
import { css, html, LitElement, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { LocalStorageService } from "core/localStorageService";
import EditorInstance from "core/Editor";
import { ExecuteInstance } from "core/Kernel";
import { $componentById } from "$store/component/store";

@customElement("log-panel")
export class LogPanel extends LitElement {
  @state()
  private logContent: any[] = [html`Log output will appear here...`];

  @state()
  private showLog: boolean = LocalStorageService.get<boolean>('logPanelVisible', false);

  // Use @query to get a reference to the log-content div
  @query('.log-content')
  private logContentDiv!: HTMLDivElement;

  // Reference to the log container for dynamic height adjustment
  @query('.log-container')
  private logContainer!: HTMLDivElement;

  // Variables to handle resizing
  private isResizing: boolean = false;
  private startY: number = 0;
  private startHeight: number = 0;

  // Media query list for detecting system color scheme
  private colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  // State to track current color scheme
  @state()
  private isDarkMode: boolean = this.colorSchemeMedia.matches;

  static styles = css`
    :host {
      width: 100%;
      display: block;
      position: relative; /* Allow absolute positioning of children */
      min-height: 40px; /* Space for the show log button */
      /* Define CSS variables for light theme */
      --background-color: #f9f9f9;
      --header-background: #ddd;
      --text-color: #000;
      --border-color: #ccc;
      --button-color: #000;
      --button-hover: #555;
    }

    /* Dark mode overrides using prefers-color-scheme */
    @media (prefers-color-scheme: dark) {
      :host {
        --background-color: #2e2e2e;
        --header-background: #444;
        --text-color: #f1f1f1;
        --border-color: #666;
        --button-color: #f1f1f1;
        --button-hover: #bbb;
      }
    }

    .log-container {
      position: fixed; /* Fixed position relative to viewport */
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 500px; /* Initial height */
      background-color: var(--background-color);
      border-top: 1px solid var(--border-color);
      box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
      overflow: auto;
      display: flex;
      flex-direction: column;
      min-height: 150px;
      z-index: 1000; /* Ensure it appears above other content */
      transition: height 0.02s ease;
      color: var(--text-color);
    }
    
    .log-header {
      display: flex;
      font-size: 14px;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background-color: var(--header-background);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
      cursor: row-resize; /* Change cursor to indicate draggable */
      user-select: none; /* Prevent text selection during drag */
    }
    
    .log-content {
      padding: 8px;
      font-family: monospace;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      flex: 1;
      overflow: auto;
      color: var(--text-color);
    }
    
    button.close-button {
      border: none;
      background: none;
      cursor: pointer;
      line-height: 1;
      color: var(--button-color);
      transition: color 0.3s;
    }
    
    button.close-button:hover {
      color: var(--button-hover);
    }
    
    .show-log-button {
      position: fixed; /* Fixed position for the button too */
      bottom: 8px;
      right: 8px;
      z-index: 999; /* Just below the panel but above other content */
      background-color: var(--header-background);
      border: 1px solid var(--border-color);
      color: var(--text-color);
      cursor: pointer;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `;

  constructor() {
    super();
    // Bind the listener to ensure proper 'this' context
    this.handleColorSchemeChange = this.handleColorSchemeChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // Listen for changes in the system color scheme
    this.colorSchemeMedia.addEventListener('change', this.handleColorSchemeChange);
    window.addEventListener('add-log' , (e) => {
      this.addLogEntry(e.detail.result)
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up the event listener
    this.colorSchemeMedia.removeEventListener('change', this.handleColorSchemeChange);
  }

  /**
   * Handles changes to the system color scheme.
   * @param event MediaQueryListEvent
   */
  private handleColorSchemeChange(event: MediaQueryListEvent) {
    this.isDarkMode = event.matches;
    // Optionally, trigger re-render if needed
    this.requestUpdate();
  }

  /**
   * Adds a new entry to the log.
   * Accepts either a string or a TemplateResult for rich content.
   * @param entry The log message to add.
   */
  public addLogEntry(entry: string | TemplateResult) {
    if (typeof entry === 'string') {
      this.logContent = [...this.logContent, html`${unsafeHTML(entry)}`];
    } else  if(typeof entry === "object"){
      entry = JSON.stringify(entry, null, 2);
      this.logContent = [...this.logContent, entry];
    }
    this.requestUpdate(); // Ensure the component updates
   setTimeout(() =>{
    const uuidElements = this.shadowRoot.querySelectorAll('[data-uuid]');
    console.log(uuidElements);
    uuidElements.forEach(el => {
      if (!el.classList.contains('listener-added')) {
        const uuid = el.getAttribute('data-uuid');
        const application_id = el.getAttribute('data-application_uuid');
        if (uuid) {
          el.classList.add('listener-added');
          el.addEventListener('click', () => {
            console.log(`Clicked UUID: ${uuid}`);
            EditorInstance.currentSelection = Array.from([uuid]);
            const component= $componentById( application_id, uuid).get();
            ExecuteInstance.VarsProxy.selectedComponents = Array.from([component]);
            this.dispatchEvent(new CustomEvent('uuid-clicked', { detail: uuid }));
          });
        }
      }
    });
   }, 0); // Scroll to bottom
  
    // Scroll to bottom whenever a new entry is added
    // Use setTimeout to ensure scrolling happens after DOM update
    setTimeout(() => this.scrollToBottom(), 0);
  }

  /**
   * Toggles the visibility of the log container.
   */
  private toggleLog() {
    this.showLog = !this.showLog;
    LocalStorageService.set('logPanelVisible', this.showLog);
    if( this.showLog){
     setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  /**
   * Scrolls the log content div to the bottom.
   */
  private scrollToBottom() {
    if (this.logContentDiv) {
      this.logContentDiv.scrollTop = this.logContentDiv.scrollHeight;
    }
  }

  /**
   * LitElement lifecycle method called after each update.
   * @param changedProperties Map of changed properties.
   */
  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has("logContent") && this.showLog) {
      this.scrollToBottom();
    }
  }

  /**
   * Handle the start of the resizing process.
   * @param event Mouse down event.
   */
  private onMouseDown(event: MouseEvent) {
    if (!event.target || (event.target as HTMLElement).closest('button')) {
      return; // Don't start resize when clicking the close button
    }
    
    this.isResizing = true;
    this.startY = event.clientY;
    const computedStyle = window.getComputedStyle(this.logContainer);
    this.startHeight = parseInt(computedStyle.height, 10);
    
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    event.preventDefault(); // Prevent text selection
  }

  /**
   * Handle the resizing while the mouse is moving.
   * Resizes from bottom edge (moving up makes panel larger)
   * @param event Mouse move event.
   */
  private onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing) return;
    
    // Calculate how much the mouse moved from the starting position
    const dy = this.startY - event.clientY;
    // Add dy to startHeight to make panel larger when moving up
    let newHeight = this.startHeight + dy;
    
    // Optional: Enforce min and max heights
    const minHeight = 150;
    const maxHeight = window.innerHeight * 0.8; // Max 80% of viewport height
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    
    this.logContainer.style.height = `${newHeight}px`;
  }

  /**
   * Handle the end of the resizing process.
   */
  private onMouseUp = () => {
    if (this.isResizing) {
      this.isResizing = false;
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  override render() {
    return html`
      ${this.showLog
        ? html`
          <div class="log-container">
            <div class="log-header" @mousedown=${this.onMouseDown}>
              <span>Console</span>
              <button class="close-button" @click=${this.toggleLog}>✖</button>
            </div>
            <div class="log-content">
              ${repeat(this.logContent, (entry, index) => index, (entry) => html`<div>${entry}</div>`)}
            </div>
          </div>
        `
        : html`
          <hy-button class="show-log-button" @click=${this.toggleLog}>
            Console
          </hy-button>
        `}
    `;
  }
}