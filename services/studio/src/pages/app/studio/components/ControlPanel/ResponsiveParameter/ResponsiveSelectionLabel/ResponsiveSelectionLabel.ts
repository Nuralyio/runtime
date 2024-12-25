import { css, html, LitElement } from "lit";

export class ResponsiveSelectionLabel extends LitElement {
  static override styles = [
    css`
            :host {
                display: block;
            }
        `
  ];

  override render() {
    return html`<h3>Layout</h3>`;
  }
}

customElements.define("responsive-selectionl-parameter-label", ResponsiveSelectionLabel);