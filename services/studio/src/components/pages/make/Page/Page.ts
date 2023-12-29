import { type PageElement } from "$store/page/interface";
import { $currentPage, $currentPageViewPort } from "$store/page/store";
import { useStores } from "@nanostores/lit";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./Page.style";
import { $currentPageComponents, $draggingComponentInfo, $selectedComponent } from "$store/component/sotre";
import { type ComponentElement, ComponentType, type DraggingComponentInfo } from "$store/component/interface";

import "../../../../core/engine";
import "../../../shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper";
import "../../../shared/blocks/ComponentElements/TextInput/TextInput";
import "../../../shared/blocks/ComponentElements/TextLabel/TextLabel";
import "../../../shared/blocks/ComponentElements/Button/Button";
import "../../../shared/blocks/ComponentElements/Containers/Container";
import "../../../shared/blocks/Collections/Collections";

import { renderComponent } from "utils/render-util";
import { copyComponentAction, moveDraggedComponentIntoCurrentPageRoot, pasteComponentAction, setCurrentComponentIdAction, updateComponentAttributes } from "$store/component/action";
import { $resizing } from "$store/apps";
import { styleMap } from "lit/directives/style-map.js";
import { updatePageInfo } from "$store/page/action";
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

  @property({ type: Boolean })
  isViewMode = false;
  constructor() {
    super();

    

    $selectedComponent.subscribe((selectedComponent) => {
      this.selectedComponent = selectedComponent;
    });
    
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

  updateStyle(key, counter) {

    if (this.selectedComponent) {
      const value = this.selectedComponent.style[key] ?? "0px"
      const numvalue = Number(value.replace("px", ""));
      updateComponentAttributes(this.selectedcomponent.uuid, {
        [key]: numvalue + counter + "px",
      });
    }

  }

  connectedCallback(): void {
    super.connectedCallback();
    $currentPageViewPort.subscribe((currentPageViewPort) => {
      requestAnimationFrame(() => {
        this.updatePageInfo();
      })
    });
    //generate code event listener ton keyboard event
    document.addEventListener('keydown', function (event) {
      console.log(event.key);
      // Handle arrow key presses
      switch (event.key) {
        case 'ArrowDown':

          this.updateStyle("marginTop", 1);

          break;
        case 'ArrowUp':
          this.updateStyle("marginTop", -1);

          break;
        case 'ArrowLeft':
          this.updateStyle("marginLeft", -1);

          break;
        case 'ArrowRight':
          this.updateStyle("marginLeft", 1);
      }
     
    }.bind(this));
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (this.selectedComponent.type === ComponentType.VerticalContainer) {
          //pasteComponentAction();        
          //event.preventDefault();
        }
    
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      //  copyComponentAction(this.selectedcomponent.uuid);        
        //event.preventDefault();
      }

      
    }.bind(this));
    const pageContainer = this.shadowRoot!.querySelector('.page-container');
    updatePageInfo({
      windowWidth: pageContainer?.clientWidth,
      windowHeight: window.innerHeight,
      viewPort: this.determineViewportType(pageContainer?.clientWidth)
    });

    window.onresize = () => {
      this.updatePageInfo();
    };
  }

  updatePageInfo() {
    const pageContainer = this.shadowRoot!.querySelector('.page-container');
    updatePageInfo({
      windowWidth: pageContainer?.clientWidth,
      windowHeight: window.innerHeight,
      viewPort: this.determineViewportType(pageContainer?.clientWidth)
    });
  }

  determineViewportType(width: number) {
    if (width >= 1024) {
      return "desktop";
    } else if (width >= 768) {
      return "tablet";
    } else if (width >= 375) {
      return "mobile";
    } else {
      return "unknown"; // You may want to return "desktop" or another default value instead of "unknown".
    }
  }


  render() {
    return html`<div
    class="page-container"
    style=${styleMap(this.currentPage.style || {})}
    @click=${(e) => {
     
        if (!$resizing.get()) {
          e.preventDefault()
          if(!this.isViewMode){
          setCurrentComponentIdAction(null);
          }
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
        ? renderComponent(this.components, null, this.isViewMode)
        : html`<div class="page-empty-message-container">
            <p class="page-empty-message">Add an item from the insert panel</p>
          </div>`}
          </div>
    </div>`;
  }
}
