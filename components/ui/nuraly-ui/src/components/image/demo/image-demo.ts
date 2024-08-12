/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../image.component';
import '../../../helpers/ThemeHandler';

@customElement('hy-image-demo')
export class ImageDemoElement extends LitElement {
  override render() {
    return html`
      <theme-handler>
      <h2>With valid src and alt</h2>
          <hy-image
            .src="${'https://picsum.photos/200'}"
            .alt="${'Image'}"
          ></hy-image>
          <h2>With custom width and height</h2>

         <hy-image
         .src="${'https://picsum.photos/200'}"
         .width="${'100px'}"
         .height="${'300px'}">
         </hy-image> 

         <h2>With custom width and height and invalid src</h2>

         <hy-image
         .src="${'https://picsffum.photos/200'}"
         .width="${'100px'}"
         .height="${'300px'}">
         </hy-image> 

          <h2>With invalid src and valid fallback provided</h2>
          <hy-image
            .src="${'https://picdsum.photos/200'}"
            .fallback="${'https://placehold.co/50?text=image'}">
          </hy-image>
          <h2>With invalid src no fallback provided and without alt </h2>
           <hy-image
             .src="${'https://picdsum.photos/200'}"
           ></hy-image>
          <h2>With invalid src, invalid fallback provided and with alt</h2>
           <hy-image
             .src="${'https://picdsum.photos/200'}"
             .fallback="${'https://placehfold.jp/150x150.png'}"
             .alt="${'image'}"
             >
           </hy-image>

      </theme-handler>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-image-demo': ImageDemoElement;
  }
}
