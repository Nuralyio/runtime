import "../../../../core/engine";
import "../../../shared/blocks/Collections/Collections";
import "../../../shared/blocks/ComponentElements/Button/Button";
import "../../../shared/blocks/ComponentElements/Containers/Container";
import "../../../shared/blocks/ComponentElements/TextInput/TextInput";
import "../../../shared/blocks/ComponentElements/TextLabel/TextLabel";
import "../../../shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper";
import styles from "./Page.style";
import { $currentApplication, $resizing } from "$store/apps";
import { copyComponentAction, moveDraggedComponentIntoCurrentPageRoot, pasteComponentAction, setCurrentComponentIdAction, updateComponentAttributes } from "$store/component/action";
import { ComponentType, type ComponentElement, type DraggingComponentInfo } from "$store/component/interface";
import { $applicationComponents, $componentWithChildrens, $currentPageComponents, $draggingComponentInfo, $selectedComponent } from "$store/component/sotre";
import { updatePageInfo } from "$store/page/action";
import { type PageElement } from "$store/page/interface";
import { $currentPage, $currentPageViewPort } from "$store/page/store";
import { useStores } from "@nanostores/lit";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "utils/render-util";
import { $context, getVar } from "$store/context/store";

@customElement("content-page")
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

    $selectedComponent($currentApplication.get().uuid).subscribe((selectedComponent) => {
      this.selectedComponent = selectedComponent;
    });
    $applicationComponents($currentApplication.get().uuid).subscribe((components = []) => {
      this.components = [...components];
      this.refreshComponent();
  });
    $context.subscribe((context) => {
      this.refreshComponent();
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
  refreshComponent(){
    const currentPage = getVar("global", "currentPage")
    const currentEditingApplication = getVar("global", "currentEditingApplication")
    console.log("currentPage", currentPage , "currentEditingApplication", currentEditingApplication)
    if (currentEditingApplication && currentPage) {
      $currentPage(currentEditingApplication.value.uuid, currentPage.value).subscribe((currentPage) => {
        if (currentPage) {
          this.currentPage = currentPage;
        }
      })
      console.log(currentEditingApplication.value.uuid)
      const components = $applicationComponents(currentEditingApplication.value.uuid).get();
      console.warn("components", components)
      this.components = components.filter((component) => {
        return component.pageId === currentPage.value;
      });
    }
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
    style=${styleMap(this.currentPage?.style || {})}
    @click=${(e) => {
        if (!$resizing.get()) {
          e.preventDefault()
          if (!this.isViewMode) {
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
        ? renderComponent(this.components, null, false)
        : html`<div class="page-empty-message-container">
            <p class="page-empty-message">Add an item from the insert panel</p>
          </div>`}
          </div>
    </div>`;
  }
}
