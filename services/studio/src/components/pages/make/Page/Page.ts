import { type PageElement } from "$store/page/interface";
import { $currentPage } from "$store/page/store";
import { useStores } from "@nanostores/lit";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import styles from "./Page.style";
import { $currentPageComponents, $draggingComponentInfo, $selectedComponent } from "$store/component/sotre";
import { type ComponentElement, ComponentType, type DraggingComponentInfo } from "$store/component/interface";

import "../../../../core/engine";
import "../../../shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper";
import "../../../shared/blocks/ComponentElements/TextInput/TextInput";
import "../../../shared/blocks/ComponentElements/TextLabel/TextLabel";
import "../../../shared/blocks/ComponentElements/Button/Button";
import "../../../shared/blocks/ComponentElements/Containers/Container";
import "../../../shared/blocks/CodeEditor/CodeEditor";
import { renderComponent } from "utils/render-util";
import { copyComponentAction, moveDraggedComponentIntoCurrentPageRoot, pasteComponentAction, setCurrentComponentIdAction, updateComponentAttributes } from "$store/component/action";
import { $resizing } from "$store/apps";
import { styleMap } from "lit/directives/style-map.js";
@customElement("content-page")
@useStores($currentPage, $currentPageComponents)
export class PageContent extends LitElement {
  static styles = styles;

  @state()
  draggingComponentInfo: DraggingComponentInfo;

  @state()
  selectedComponent: ComponentElement;

  @state()
  currentPage: PageElement;
  @state()
  components: ComponentElement[] = [];
  constructor() {
    super();
    //generate code event listener ton keyboard event
     document.addEventListener('keydown', function(event) {
      console.log(event.key);
      // Handle arrow key presses
      switch(event.key){
        case 'ArrowDown':

          this.updateStyle( "marginTop", 1);

          break;
        case 'ArrowUp':
          this.updateStyle( "marginTop", -1);

          break;
        case 'ArrowLeft':
          this.updateStyle( "marginLeft", -1);

          break;
        case 'ArrowRight':
          this.updateStyle( "marginLeft", 1);
      }
     
    }.bind(this));

    $selectedComponent.subscribe((selectedComponent) => {
      this.selectedComponent = selectedComponent;
    });
    document.addEventListener('keydown', function(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if(this.selectedComponent.type === ComponentType.VerticalContainer){
    pasteComponentAction();        
        event.preventDefault();
        }
    
      }else if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        copyComponentAction( this.selectedComponent.id);        
        event.preventDefault();
      }

      
    }.bind(this));
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

  updateStyle(key, counter){

    if(this.selectedComponent){
            const  value = this.selectedComponent.style[key] ?? "0px"
            const numvalue = Number(value.replace("px", ""));
            updateComponentAttributes(this.selectedComponent.id, {
              [ key]: numvalue+counter+"px",
            });
          }

  }

  render() {
    return html`<div
    class="page-container"
    style=${styleMap(this.currentPage.style || {})}
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
   <div >
      ${this.components?.length
        ? renderComponent(this.components)
        : html`<div class="page-empty-message-container">
            <p class="page-empty-message">Add an item from the insert panel</p>
          </div>`}
          </div>
    </div>`;
  }
}
