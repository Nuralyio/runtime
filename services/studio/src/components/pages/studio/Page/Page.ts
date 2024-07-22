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

  @state() draggingComponentInfo: DraggingComponentInfo;
  @state() selectedComponent: ComponentElement;
  @state() currentPage: PageElement;
  @state() components: ComponentElement[] = [];

  @property({ type: Boolean }) isViewMode = false;

  constructor() {
    super();

    const currentAppUuid = $currentApplication.get().uuid;

    $selectedComponent(currentAppUuid).subscribe(selectedComponent => {
      this.selectedComponent = selectedComponent;
    });

    $applicationComponents(currentAppUuid).subscribe(components => {
      this.components = components ? [...components] : [];
    });

    $context.subscribe(() => {
      console.log("context changed");
      requestAnimationFrame(() => {
        this.refreshComponent();
      }
      )
    });

    $draggingComponentInfo.subscribe(draggingComponentInfo => {
      this.draggingComponentInfo = draggingComponentInfo || null;
    });
  }

  refreshComponent() {
    console.log("refreshComponent");
    const currentPage = getVar("global", "currentPage");
    const currentEditingApplication = getVar("global", "currentEditingApplication");

    if (currentEditingApplication && currentPage) {
      const currentAppUuid = currentEditingApplication.value.uuid;

      this.currentPage = $currentPage(currentAppUuid, currentPage.value).get();
      const components = $applicationComponents(currentAppUuid).get();
      this.components = components.filter(component => component.pageId === currentPage.value);
    }
  }



  connectedCallback() {
    super.connectedCallback();

    $currentPageViewPort.subscribe(() => {
      requestAnimationFrame(() => {
        this.updatePageInfo();
      });
    });

    const pageContainer = this.shadowRoot!.querySelector('.page-container');
    this.updatePageInfo(pageContainer?.clientWidth);

    window.onresize = () => {
      this.updatePageInfo(pageContainer?.clientWidth);
    };
  }

  updatePageInfo(containerWidth) {
    const pageContainer = this.shadowRoot!.querySelector('.page-container');
    updatePageInfo({
      windowWidth: containerWidth || pageContainer?.clientWidth,
      windowHeight: window.innerHeight,
      viewPort: this.determineViewportType(containerWidth || pageContainer?.clientWidth),
    });
  }

  determineViewportType(width) {
    if (width >= 1024) return "desktop";
    if (width >= 768) return "tablet";
    if (width >= 375) return "mobile";
    return "unknown";
  }

  render() {
    return html`
      <div
        class="page-container"
        style=${styleMap(this.currentPage?.style || {})}
        @click=${this.handlePageClick}
        @dragend=${this.preventDefault}
        @dragenter=${this.preventDefault}
        @dragleave=${this.preventDefault}
        @dragover=${this.preventDefault}
        @drop=${this.handleDrop}
      >
        ${this.components.length
        ? renderComponent(this.components, null, false)
        : html`<div class="page-empty-message-container">
              <p class="page-empty-message">Add an item from the insert panel</p>
            </div>`}
      </div>
    `;
  }

  handlePageClick(e) {
    if (!$resizing.get()) {
      e.preventDefault();
      if (!this.isViewMode) {
        setCurrentComponentIdAction(null);
      }
    }
  }

  handleDrop(e) {
    e.preventDefault();
    moveDraggedComponentIntoCurrentPageRoot(this.draggingComponentInfo.componentId);
  }

  preventDefault(e) {
    e.preventDefault();
  }
}