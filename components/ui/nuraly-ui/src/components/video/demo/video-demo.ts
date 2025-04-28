/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../video.component.js';

@customElement('hy-video-demo')
export class HyDatePickerDemoElement extends LitElement {
  @state()
  selectedLanguage = 'en';

  override render() {
    return html`
       <hy-video-player
       previewable="true"
          id="url-viewer"
          src="https://file-examples.com/storage/fe7d258bd9680a7429c6b40/2017/04/file_example_MP4_480_1_5MG.mp4"
          width="100%"
          height="500px"
          previewable
        ></hy-video-player>
    `;
  }
}