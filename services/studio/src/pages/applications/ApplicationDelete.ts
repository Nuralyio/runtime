import { css, html, LitElement } from "lit";

export class ApplicationDelete extends LitElement {

  static override styles = [
    css`
            :host {
                display: block;
            }
        `
  ];

  override render() {
    return html``;
  }
}

customElements.define("application-delete", ApplicationDelete);