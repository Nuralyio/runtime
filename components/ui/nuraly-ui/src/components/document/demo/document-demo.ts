/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../document.component.js';

@customElement('hy-document-demo')
export class HyDatePickerDemoElement extends LitElement {
  @state()
  selectedLanguage = 'en';

  override render() {
    return html`
       <hy-pdf-viewer 
       previewable="true"
          id="url-viewer"
          src="http://localhost:7004/api/v1/storage/preview/my-folder%2FRNE%20Public.pdf"
          width="100%"
          height="500px"
          previewable
        ></hy-pdf-viewer>
    `;
  }
}
