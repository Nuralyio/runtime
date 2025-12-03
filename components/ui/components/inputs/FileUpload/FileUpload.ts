import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
import { BaseElementBlock } from '../../base/BaseElement';
import "@nuralyui/file-upload";
import { ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("file-upload-block")
export class FileUploadBlock extends BaseElementBlock {

  static override styles = [
    css`
      :host {
        display: block;
      }
    `
  ];


  override renderComponent() {
    return html`
      <nr-file-upload
      style=${
         styleMap({
          ...this.getStyles(),
       })
      }
      
        ${ref(this.inputRef)}
        accept="*/*"
        drag
        limit="5"
        tip="JPG/PNG files up to 500kb"
        @files-changed=${(e: CustomEvent) => {
          const files: File[] = e.detail;
          this.executeEvent('onFilesChanged', e, {
            files
          })
        }}
      ></nr-file-upload>
    `;
  }
}