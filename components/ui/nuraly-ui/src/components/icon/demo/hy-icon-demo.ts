import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../icon.component.js';

@customElement('nr-icon-demo')
export class HyIconDemo extends LitElement {
  @state() 
  private currentTheme: 'light' | 'dark' = 'light';

  static override readonly styles = css`
    :host {
      display: block;
      padding: 20px;
      font-family: system-ui, sans-serif;
    }

    .demo-container {
      border: 1px solid #e0e0e0;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .demo-container[data-theme="dark"] {
      background: #1a1a1a;
      border-color: #404040;
      color: #ffffff;
    }

    .theme-controls {
      margin-bottom: 30px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .theme-controls[data-theme="dark"] {
      background: #2d2d2d;
      color: #ffffff;
    }

    .icon-group {
      display: flex;
      align-items: center;
      gap: 15px;
      margin: 15px 0;
      padding: 10px;
      border: 1px dashed #ccc;
      border-radius: 4px;
    }

    .icon-group[data-theme="dark"] {
      border-color: #555;
    }

    #custom-red-icon {
      --nuraly-icon-local-color: #dc3545;
    }

    #custom-size-icon {
      --nuraly-icon-local-width: 32px;
      --nuraly-icon-local-height: 32px;
    }

    #custom-both-icon {
      --nuraly-icon-local-width: 24px;
      --nuraly-icon-local-height: 24px;
      --nuraly-icon-local-color: #28a745;
    }

    .interactive-examples {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
    }

    button[data-theme="dark"] {
      background: #333;
      border-color: #555;
      color: #fff;
    }

    .event-log {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      max-height: 150px;
      overflow-y: auto;
      margin-top: 15px;
    }

    .event-log[data-theme="dark"] {
      background: #1e1e1e;
      border-color: #404040;
      color: #ffffff;
    }
  `;

  private handleIconClick(event: CustomEvent) {
    const detail = event.detail;
    this.logEvent('icon-click', detail);
  }

  private logEvent(eventType: string, detail: any) {
    const eventLog = this.shadowRoot?.querySelector('.event-log');
    if (eventLog) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${eventType}: ${JSON.stringify(detail)}\n`;
      eventLog.textContent = logEntry + (eventLog.textContent || '');
    }
  }

  private toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    // Apply theme to document for global effect
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  private clearLog() {
    const eventLog = this.shadowRoot?.querySelector('.event-log');
    if (eventLog) {
      eventLog.textContent = '';
    }
  }

  override render() {
    return html`
      <div class="theme-controls" data-theme="${this.currentTheme}">
        <h2>Icon Component Demo - Theme: ${this.currentTheme}</h2>
        <button @click="${this.toggleTheme}" data-theme="${this.currentTheme}">
          Switch to ${this.currentTheme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
        <button @click="${this.clearLog}" data-theme="${this.currentTheme}">
          Clear Event Log
        </button>
      </div>

      <div class="demo-container" data-theme="${this.currentTheme}">
        <h3>Basic Icons</h3>
        
        <div class="icon-group" data-theme="${this.currentTheme}">
          <span>Default solid:</span>
          <nr-icon name="envelope"></nr-icon>
          <span>Regular:</span>
          <nr-icon name="envelope" type="regular"></nr-icon>
          <span>Different icons:</span>
          <nr-icon name="check"></nr-icon>
          <nr-icon name="warning"></nr-icon>
          <nr-icon name="bug"></nr-icon>
          <nr-icon name="heart"></nr-icon>
        </div>

        <h3>Custom Styling</h3>
        
        <div class="icon-group" data-theme="${this.currentTheme}">
          <span>Custom red color:</span>
          <nr-icon id="custom-red-icon" name="exclamation-triangle"></nr-icon>
          <span>Custom size:</span>
          <nr-icon id="custom-size-icon" name="star"></nr-icon>
          <span>Custom size + color:</span>
          <nr-icon id="custom-both-icon" name="check-circle"></nr-icon>
        </div>

        <h3>Interactive Icons</h3>
        
        <div class="interactive-examples">
          <span>Clickable icons:</span>
          <nr-icon 
            name="thumbs-up" 
            clickable 
            alt="Like button"
            @icon-click="${this.handleIconClick}">
          </nr-icon>
          <nr-icon 
            name="heart" 
            clickable 
            alt="Favorite button"
            @icon-click="${this.handleIconClick}">
          </nr-icon>
          <nr-icon 
            name="share" 
            clickable 
            alt="Share button"
            @icon-click="${this.handleIconClick}">
          </nr-icon>
          <nr-icon 
            name="bookmark" 
            clickable 
            disabled
            alt="Disabled bookmark button"
            @icon-click="${this.handleIconClick}">
          </nr-icon>
        </div>

        <div class="event-log" data-theme="${this.currentTheme}">
          Event log (click icons above to see events)...
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-icon-demo': HyIconDemo;
  }
}
