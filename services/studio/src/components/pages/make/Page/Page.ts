import { PageElement } from "$store/page/interface";
import { $currentPage, $pages } from "$store/page/store";
import { useStores } from "@nanostores/lit";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./Page.style";
import { $currentPageComponents, $draggingComponentInfo } from "$store/component/sotre";
import { ComponentElement, ComponentType, DraggingComponentInfo } from "$store/component/interface";

import "../../../../core/engine";
import "../../../shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper";
import "../../../shared/blocks/ComponentElements/TextInput/TextInput";
import "../../../shared/blocks/ComponentElements/TextLabel/TextLabel";
import "../../../shared/blocks/ComponentElements/Button/Button";
import "../../../shared/blocks/ComponentElements/Containers/Container";
import "../../../shared/blocks/CodeEditor/CodeEditor";
import { renderComponent } from "utils/render-util";
import { moveDraggedComponentIntoCurrentPageRoot, setCurrentComponentIdAction } from "$store/component/action";
import { $resizing } from "$store/apps";
@customElement("content-page")
@useStores($currentPage, $currentPageComponents)
export class PageContent extends LitElement {
  static styles = styles;
  draggingComponentInfo: DraggingComponentInfo;

  @state()
  currentPage: PageElement;
  @state()
  components: ComponentElement[] = [];
  constructor() {
    super();
    $currentPage.subscribe((currentPage) => {
      this.currentPage = { ...currentPage };
    });
    $currentPageComponents.subscribe((components = []) => {
      this.components = [...components];
    });
    $draggingComponentInfo.subscribe(
      (draggingComponentInfo: DraggingComponentInfo) => {
        if (draggingComponentInfo) {
          this.draggingComponentInfo = draggingComponentInfo;
          
        } else {
          this.draggingComponentInfo = null;
        }
      }
    );
    
  }

  render() {
    return html`<div
    style="height: 100%; width: 100%;"
    @click=${(e) => {
     
      if (!$resizing.get()) {
        e.preventDefault()
      setCurrentComponentIdAction(null);
       }
       
    }}
    @dragend=${(e) => {
        e.preventDefault();
    }}
     @dragenter=${(e) => {
        e.preventDefault();
    }}
     @dragleave=${(e) => {
        e.preventDefault();
    }}
    @dragover=${(e) => {
        e.preventDefault();
    }}
    @drop=${(e) => {
        e.preventDefault();
        moveDraggedComponentIntoCurrentPageRoot(this.draggingComponentInfo.componentId)
       
       
       
      }}
    >
   <div>
      ${this.components?.length
        ? renderComponent(this.components)
        : html`<div class="page-empty-message-container">
            <p class="page-empty-message">Add an item from the insert panel</p>
          </div>`}
          </div>
    </div>`;
  }
}
