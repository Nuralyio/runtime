import "../../../shared/blocks/components/Collections/Collections";
import "../../../shared/blocks/components/Button/Button";
import "../../../shared/blocks/components/Containers/Container";
import "../../../shared/blocks/components/TextInput/TextInput";
import "../../../shared/blocks/components/TextLabel/TextLabel";
import "../../../shared/blocks/wrappers/GenerikWrapper/GenerikWrapper";
import "../../../shared/blocks/wrappers/RectangleSelection/RectangleSelection";
import styles from "./Page.style";
import { $currentApplication, $resizing, $values } from "$store/apps";
import { deleteComponentAction, moveDraggedComponentIntoCurrentPageRoot, setCurrentComponentIdAction } from "$store/actions/component";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface";
import { $applicationComponents, $components, $draggingComponentInfo, $selectedComponent } from "$store/component/component-sotre";
import { updatePageInfo } from "$store/actions/page";
import { type PageElement } from "$store/handlers/pages/interfaces/interface";
import { $applicationPages, $currentPage, $currentPageViewPort, $pages } from "$store/page";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "utils/render-util";
import { $context, getVar, setVar } from "$store/context";
import { log } from "utils/logger";
import { eventDispatcher } from "utils/change-detection";
import { $environment, ViewMode, type Environment } from "$store/environment";

@customElement("content-page")
export class PageContent extends LitElement {
  static styles = styles;

  @state() draggingComponentInfo: DraggingComponentInfo;
  @state() currentPage: PageElement;
  @state() components: ComponentElement[] = [];

  @property({ type: Boolean }) isViewMode = false;
  mode: ViewMode;

  constructor() {
    super();

    $pages.listen(() => this.refreshComponent());
    $components.listen(() => this.refreshComponent());
    $context.listen(() => this.refreshComponent());
    $values.listen(() => this.refreshComponent());
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
      this.refreshComponent()
    });
    eventDispatcher.on("component:refresh", () => {
      this.refreshComponent()
    });

    $draggingComponentInfo.subscribe(draggingComponentInfo => {
      this.draggingComponentInfo = draggingComponentInfo || null;
    });
  }

  refreshComponent() {
    log.prefix("PageContent").info("refreshComponent");
    const currentPage = getVar("global", "currentPage");
    const selectedComponents = getVar("global","selectedComponents")
    const currentEditingApplication = getVar("global", "currentEditingApplication");

    if (currentEditingApplication && currentPage) {
      const currentAppUuid = currentEditingApplication.value.uuid;

      this.currentPage = $currentPage(currentAppUuid, currentPage.value).get();
      const components = $applicationComponents(currentAppUuid).get();
      this.components = components.filter(component => component.pageId && currentPage.value && component.pageId === currentPage.value && component.root );

    }
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();

    $currentPageViewPort.subscribe(() => {
      requestAnimationFrame(() => {
      });
    });
    

    const pageContainer = this.shadowRoot!.querySelector('.page-container');
    this.updatePageInfo(pageContainer?.clientWidth);

    window.onresize = () => {
      this.updatePageInfo(pageContainer?.clientWidth);
    };
    const currentPage = getVar("global", "currentPage");
    if(!currentPage) {
      setVar( "global" , "currentPage" , $applicationPages($currentApplication.get().uuid).get()[0]?.uuid );
    }
    window.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleEscapeKey.bind(this));
  }
  handleEscapeKey(e) {
    switch (e.key) {
      case 'Escape':
        this.clearSelectedComponents();
        break;
      case 'Enter':
        this.handleEnterKey(e);
        break;
      case 'Delete':
        this.confirmDelete();
        break;
      case 'Backspace':
        if (e.metaKey) {
          this.confirmDelete();
        }
        break;
    }
  }
  
  clearSelectedComponents() {
    try {
      setVar("global", "selectedComponents", []);
    } catch (error) {
      console.error("Error clearing selected components:", error);
    }
  }
  
  handleEnterKey(e) {
    try {
      const selectedComponents = getVar("global", "selectedComponents").value ?? [];
      eventDispatcher.emit("keydown", {
        key: e.key,
        selectedComponents: selectedComponents
      });
    } catch (error) {
      console.error("Error handling Enter key:", error);
    }
  }
  
  
  
  confirmDelete() {
    const selectedComponents = getVar("global", "selectedComponents").value ?? [];
    if (selectedComponents.length > 0) {
      const confirmation = window.confirm("Are you sure you want to delete the selected components?");
      if (confirmation) {
        this.handleDeleteKey();
      }
    }
  }
  handleDeleteKey() {
    const selectedComponents = getVar("global", "selectedComponents").value ?? [];
    selectedComponents.forEach(componentId => {
      const currentEditingApplication = getVar("global", "currentEditingApplication");
      const currentAppUuid = currentEditingApplication.value.uuid;
      deleteComponentAction(componentId, currentAppUuid);
    });
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

  isPreviewMode(){
    return this.mode === ViewMode.Preview || !this.mode || this.isViewMode;
  }

  render() {
    return html`
       <rectangle-selection>
      <div
        class="page-container ${this.isPreviewMode() ? 'viewer' : ''}"
        style=${styleMap(this.currentPage?.style || {})}
        @click=${this.handlePageClick}
        @dragend=${this.preventDefault}
        @dragenter=${this.preventDefault}
        @dragleave=${this.preventDefault}
        @dragover=${this.preventDefault}
        @drop=${this.handleDrop}
      >
        ${this.components.length
          ? renderComponent(this.components, null, this.mode === ViewMode.Preview || !this.mode || this.isViewMode)
          : html`<div class="page-empty-message-container">
                <p class="page-empty-message">Add an item from the insert panel</p>
              </div>`}
      </div>
      </rectangle-selection>
    `;
  }

  handlePageClick(e) {
    if (!$resizing.get()) {
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
