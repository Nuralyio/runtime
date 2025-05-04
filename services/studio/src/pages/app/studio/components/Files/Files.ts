import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { isServer } from "@utils/envirement";

 let filesAppUUID = "" ;
 let filesPageUUID = "" ;
if(!isServer){
 filesAppUUID = window.__MODULES_CONFIG__.files.app_uuid;
 filesPageUUID = window.__MODULES_CONFIG__.files.main_file_component_uuid;
}

@customElement("files-page")
export class FunctionContent extends LitElement {
  @property({ type: Object })
  detail: { handler: string; uuid?: string } = { handler: "" };

  static styles = css`
      :host {
          height: 90vh;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
      }

    

      /* Remove log-related styles as they are now in log-panel */
  `;
  

  override render() {
    return html`
      <div class="content">

      <micro-app uuid=${filesAppUUID} componentToRenderUUID=${filesPageUUID}></micro-app>  
  </div>
    `;
  }
}
