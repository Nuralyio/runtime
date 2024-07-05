import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('theme-handler')
export class ThemeHandler extends LitElement {
  static override styles = css`
    #theme-toggle {
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 10px;
      background: var(--theme-color);
      color: var(--theme-bg);
      border: none;
      cursor: pointer;
    }
  `;

  componentList: Element[] = [];
  override firstUpdated(): void {
    this.getAllComponent();
    this.toggleTheme();
  }
  toggleTheme() {
    if (this.componentList.length) {
      const themeToggle = this.renderRoot.querySelector('#theme-toggle')!;
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.componentList.forEach((component) => component.setAttribute('data-theme', savedTheme));
        document.body.setAttribute('theme', savedTheme);
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.componentList.forEach((component) => component.setAttribute('data-theme', 'dark'));
          document.body.setAttribute('theme', 'dark');
          localStorage.setItem('theme', 'dark');
        } else {
          this.componentList.forEach((component) => component.setAttribute('data-theme', 'light'));
          document.body.setAttribute('theme', 'light');
          localStorage.setItem('theme', 'light');
        }
      }
      themeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.componentList.forEach((component) => component.setAttribute('data-theme', newTheme));
        document.body.setAttribute('theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }
  }
  getAllComponent() {
    const slotElements = this.shadowRoot!.querySelector('slot')!.assignedElements();
    slotElements.forEach((element: Element) => {
      if (element.localName.includes('hy')) {
        this.componentList.push(element);
      } else {
        element.querySelectorAll('*').forEach((element) => {
          if (element.localName.includes('hy')) this.componentList?.push(element);
        });
      }
    });
  }

  override render() {
    return html` <button id="theme-toggle">Toggle Theme</button>
      <slot></slot>`;
  }
}
