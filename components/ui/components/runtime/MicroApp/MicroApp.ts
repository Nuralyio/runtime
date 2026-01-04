
import { $applicationComponents, $components } from '../../../../../redux/store/component/store';
import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from '../../../../../utils/render-util';
import "../../display/TextLabel/TextLabel";
import "../../layout/Containers/Container";
import { $applicationPages, $currentPage, $microAppCurrentPage } from '../../../../../redux/store/page';
import { eventDispatcher } from '../../../../../utils/change-detection';
import { ViewMode } from '../../../../../redux/store/environment';
import { merge, Observable, Subscription } from "rxjs";
import EditorInstance, { getInitPlatform } from '../../../../../state/editor';
import { styleMap } from "lit/directives/style-map.js";
import type { PageElement } from '../../../../../redux/handlers/pages/page.interface';
import { ExecuteInstance } from '../../../../../state/runtime-context';
import "../../../nuraly-ui/src/shared/themes/default.css";
import { v4 as uuidv4 } from "uuid";
// Import isolated micro-app infrastructure
import { MicroAppStoreContext } from '../../../../../micro-app/state/MicroAppStoreContext';
import { MicroAppRuntimeContext } from '../../../../../micro-app/state/MicroAppRuntimeContext';
import { MicroAppPageManager } from '../../../../../micro-app/state/MicroAppPageManager';
import { MicroAppMessageBus, MessageTypes } from '../../../../../micro-app/messaging/MicroAppMessageBus';

// Import data loader
import { defaultMicroAppDataLoader, type MicroAppDataLoader } from "./MicroAppDataLoader";

// Import toast container
import { ToastContainer } from '../../ToastContainer/ToastContainer';

// Import popconfirm container
import { PopconfirmContainer } from '../../PopconfirmContainer/PopconfirmContainer';

// Studio app UUID - special case for editor that doesn't load from API
const STUDIO_APP_UUID = "1";

@customElement("micro-app")
export class MicroApp extends LitElement {
  static override styles = [css`

  `];

  private subscription = new Subscription();

  @property({ type: String, reflect: true }) uuid!: string;
  @property({ type: String, reflect: true }) page_uuid?: string;
  @property({ type: String, reflect: true }) componentToRenderUUID?: string;
  @property({ type: String, reflect: false }) mode: ViewMode = ViewMode.Preview;
  @property({ type: Boolean, reflect: false }) prod = true;
  @property({ type: Boolean, reflect: false }) useIsolatedContext: boolean = false; // Feature flag

  // Data loader for components and pages (optional - defaults to API loader)
  @property({ attribute: false }) dataLoader: MicroAppDataLoader = defaultMicroAppDataLoader;

  // Pre-loaded app data (optional - avoids loading step)
  @property({ type: Array, reflect: false }) appComponents?: any[];
  @property({ type: Array, reflect: false }) appPages?: any[];

  @state() components: any[] = [];
  @state() componentsToRender: any[] = [];
  @state() page: any = {};

  // Isolated micro-app contexts
  private microAppId: string = '';
  private storeContext: MicroAppStoreContext | null = null;
  private runtimeContext: MicroAppRuntimeContext | null = null;
  private pageManager: MicroAppPageManager | null = null;
  private messageBus: MicroAppMessageBus | null = null;
  private messageUnsubscribe: (() => void) | null = null;
  private globalVarUnsubscribe: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * Refreshes the component list based on the current UUID and page UUID.
   */
  refreshComponent(): void {
    const components = $applicationComponents(this.uuid).get();
    this.components = this.page_uuid
      ? components.filter((component) => component.pageId === this.page_uuid && component.root === true)
      : components;
  }

  /**
   * LitElement's willUpdate() hook: triggered before rendering.
   */
  override willUpdate(changedProperties: Map<string, any>): void {
    super.willUpdate(changedProperties);

    // Handle isolated context initialization when pre-loaded data is provided
    if (this.useIsolatedContext) {
      // Check if appComponents or appPages were just set
      const dataJustProvided = (
        (changedProperties.has("appComponents") && this.appComponents) ||
        (changedProperties.has("appPages") && this.appPages)
      );

      // Initialize isolated context if data was just provided and not initialized yet
      if (dataJustProvided && !this.storeContext) {
        this.initializeIsolatedContext();
        return;
      }
    }

    // Legacy mode: Re-initialize if uuid property changes and becomes defined
    if (!this.useIsolatedContext && changedProperties.has("uuid") && this.uuid) {
      this.initializeAppComponents();
    }

    if (changedProperties.has("components") || changedProperties.has("componentToRenderUUID")|| changedProperties.has("page_uuid")) {
      this.updateComponentsToRender();
    }
  }

  /**
   * Updates componentsToRender based on the current selection.
   */
  private updateComponentsToRender(): void {

    this.componentsToRender = this.componentToRenderUUID
      ? this.components.filter((component) => component.uuid === this.componentToRenderUUID)
      : this.components;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    // Initialize toast container singleton (ensures it exists globally)
    ToastContainer.getInstance();

    // Initialize popconfirm container singleton (ensures it exists globally)
    PopconfirmContainer.getInstance();

    // Schedule initialization check after Lit has processed properties
    // This handles the case where properties are set before adding to DOM
    this.updateComplete.then(() => {
      this._initializeAfterConnect();
    });
  }

  /**
   * Initialize the micro-app after connection and property processing
   * Called after updateComplete to ensure all properties are available
   */
  private _initializeAfterConnect(): void {
    // Skip if already initialized
    if (this.useIsolatedContext && this.storeContext) {
      return;
    }
    if (!this.useIsolatedContext && this.subscription.closed === false && this.components.length > 0) {
      return;
    }

    // Initialize isolated context if feature is enabled
    if (this.useIsolatedContext) {
      // Only initialize now if we have pre-loaded data
      if (this.appComponents || this.appPages) {
        this.initializeIsolatedContext();
      }
    } else {
      // Legacy mode
      this.setupSubscriptions();
      if(!ExecuteInstance.Vars.currentPlatform){
        ExecuteInstance.VarsProxy.currentPlatform = getInitPlatform()
      }
      EditorInstance.setEditorMode(this.prod);
      this.initializeAppComponents();
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {

  }

  override disconnectedCallback(): void {
    this.subscription.unsubscribe();

    // Cleanup global variable subscription (both legacy and isolated modes)
    if (this.globalVarUnsubscribe) {
      this.globalVarUnsubscribe();
      this.globalVarUnsubscribe = null;
    }

    // Cleanup isolated context
    if (this.useIsolatedContext) {
      this.cleanupIsolatedContext();
    }

    super.disconnectedCallback();
  }
  
  /**
   * Retrieves application components if they are not already loaded.
   */
  private initializeAppComponents(): void {
  // Guard: Don't proceed if uuid is undefined or null
  if (!this.uuid) {
    return;
  }

  const appLoaded = $components.get()[this.uuid];

  if (this.page_uuid) {
    $microAppCurrentPage.setKey(this.uuid, this.page_uuid);
  }

  if (appLoaded === undefined && this.uuid !== STUDIO_APP_UUID) {
    // Load components using the configured data loader
    this.dataLoader.loadComponents(this.uuid)
      .then((result) => {
        if (result.error) {
          console.error('Error loading components:', result.error);
          return;
        }

        $components.setKey(this.uuid, result.components);
        this.refreshComponent();
        this.updateComponentsToRender();
      })
      .catch((err) => {
        console.error('[MicroApp] Failed to load components:', err);
      });

    // Load pages using the configured data loader
    this.dataLoader.loadPages(this.uuid)
      .then((result) => {
        if (result.error) {
          console.error('Error loading pages:', result.error);
          return;
        }

        if (result.pages.length > 0) {
          this.page = result.pages[0];
        }
      })
      .catch((err) => {
        console.error('[MicroApp] Failed to load pages:', err);
      });

  } else {

    if (typeof window !== 'undefined' && window.__URL__) {
      const page = $applicationPages(this.uuid)
        .get()
        .find((page: PageElement) => page.url === window.__URL__)?.uuid;

      this.page = page;
    } else {
      const currentPage = $currentPage(this.uuid, this.page_uuid).get()?.uuid;
      if(currentPage){
        this.page = currentPage;

      }else{
        const pages = $applicationPages(this.uuid).get();
        this.page = pages[0]?.uuid;
      }
    }

    this.refreshComponent();
  }
}

  /**
   * Configures subscriptions to relevant observables to manage refresh logic.
   */
  private setupSubscriptions(): void {
    const observables = [
      this.createStoreObservable($components),
    ];

    const mergedSubscription = merge(...observables)
      .subscribe(() => this.refreshComponent());

    this.subscription.add(mergedSubscription);

    // Subscribe to global variable changes to trigger micro-app re-render (LEGACY MODE)
    // This ensures that when global variables change, the micro-app components re-render
    const globalVarHandler = () => {
      // Trigger refresh of the micro-app
      this.refreshComponent();
    };
    eventDispatcher.on('global:variable:changed', globalVarHandler);

    // Store unsubscribe function for cleanup
    this.globalVarUnsubscribe = () => {
      eventDispatcher.off('global:variable:changed', globalVarHandler);
    };
  }

  /**
   * Creates an observable for a given store.
   * @param store - The store to observe.
   */
  private createStoreObservable(store: any): Observable<void> {
    return new Observable((subscriber) => {
      const unsubscribe = store.subscribe(() => subscriber.next());
      return () => unsubscribe();
    });
  }

  /**
   * Creates an observable for a specific event.
   * @param eventName - The name of the event to observe.
   */
  private createEventObservable(eventName: string): Observable<void> {
    return new Observable((subscriber) => {
      const handler = () => subscriber.next();
      eventDispatcher.on(eventName, handler);
      return () => eventDispatcher.off(eventName, handler);
    });
  }

  /**
   * Checks if the application is in preview mode.
   */
  private isPreviewMode(): boolean {
    return this.mode === ViewMode.Preview;
  }

  /**
   * Initialize isolated micro-app context
   */
  private async initializeIsolatedContext(): Promise<void> {
    try {
      // Generate unique micro-app instance ID using proper UUID
      this.microAppId = `${this.uuid}_${uuidv4()}`;

      // 1. Create store context with optional pre-loaded data
      this.storeContext = new MicroAppStoreContext(
        this.microAppId,
        this.uuid,
        this.appComponents,
        this.appPages
      );

      // 2. Create runtime context
      this.runtimeContext = new MicroAppRuntimeContext(this.storeContext);

      // 3. Create page manager
      this.pageManager = new MicroAppPageManager(this.storeContext);
      // Store page manager reference in store context for handler access
      this.storeContext.setPageManager(this.pageManager);

      // 4. Get message bus
      this.messageBus = MicroAppMessageBus.getInstance();

      // 6. Subscribe to messages
      this.messageUnsubscribe = this.messageBus.subscribe(this.microAppId, (message) => {
        this.handleMessage(message);
      });

      // 7. Load application data
      await this.storeContext.loadApplication();

      // 8. Load pages
      await this.pageManager.loadPages();

      // 9. Register components in runtime
      this.runtimeContext.registerComponents();

      // 9.5. Sync components to global store so Container can find children
      // This is needed because Container.ts looks up children in the global $components store
      const componentsWithChildren = this.storeContext.getComponents();
      $components.setKey(this.uuid, componentsWithChildren);

      // 10. Setup subscriptions to isolated stores
      this.setupIsolatedSubscriptions();

      // 11. Update component list
      this.refreshIsolatedComponents();

      // 12. Set platform if not already set
      if (!this.runtimeContext.getVar('currentPlatform')) {
        this.runtimeContext.setVar('currentPlatform', getInitPlatform());
      }

      EditorInstance.setEditorMode(this.prod);

    } catch (error) {
      console.error(`[MicroApp] Failed to initialize isolated context:`, error);
    }
  }

  /**
   * Handle incoming messages from message bus
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case MessageTypes.FILE_SELECTED:
        // Handle file selection from Files micro-app
        break;
      case MessageTypes.DATA_UPDATED:
        // Handle data updates
        this.requestUpdate();
        break;
      default:
        // Handle custom messages
        break;
    }
  }

  /**
   * Setup subscriptions to isolated stores
   */
  private setupIsolatedSubscriptions(): void {
    if (!this.storeContext) return;

    // Subscribe to component changes
    const componentsUnsub = this.storeContext.$components.subscribe(() => {
      this.refreshIsolatedComponents();
    });
    this.subscription.add(componentsUnsub);

    // Subscribe to page changes
    const pagesUnsub = this.storeContext.$pages.subscribe(() => {
      this.pageManager?.reloadPages();
    });
    this.subscription.add(pagesUnsub);

    // Subscribe to global variable changes to trigger micro-app re-render
    // This ensures that when global variables change, the micro-app components re-render
    const globalVarHandler = () => {
      // Trigger re-render of the entire micro-app
      this.requestUpdate();
    };
    eventDispatcher.on('global:variable:changed', globalVarHandler);

    // Store unsubscribe function for cleanup
    this.globalVarUnsubscribe = () => {
      eventDispatcher.off('global:variable:changed', globalVarHandler);
    };
  }

  /**
   * Refresh components from isolated store
   */
  private refreshIsolatedComponents(): void {
    if (!this.storeContext || !this.pageManager) return;

    const allComponents = this.storeContext.getComponents();
    const currentPage = this.pageManager.getCurrentPage();

    // Filter components by page if page_uuid is specified
    this.components = this.page_uuid
      ? allComponents.filter((component) => component.pageId === this.page_uuid && component.root === true)
      : currentPage
      ? allComponents.filter((component) => component.pageId === currentPage.uuid && component.root === true)
      : allComponents.filter((component) => component.root === true);

    this.updateComponentsToRender();
  }

  /**
   * Cleanup isolated context
   */
  private cleanupIsolatedContext(): void {
    // Unsubscribe from messages
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
      this.messageUnsubscribe = null;
    }

    // Note: Global variable subscription cleanup is handled in disconnectedCallback()

    // Cleanup contexts in reverse order
    if (this.pageManager) {
      this.pageManager.cleanup();
      this.pageManager = null;
    }

    if (this.runtimeContext) {
      this.runtimeContext.cleanup();
      this.runtimeContext = null;
    }

    if (this.storeContext) {
      this.storeContext.cleanup();
      this.storeContext = null;
    }

    this.messageBus = null;
  }

  /**
   * Get the execution context (isolated or global)
   */
  private getExecutionContext(): any {
    if (this.useIsolatedContext && this.runtimeContext) {
      return this.runtimeContext;
    }
    return ExecuteInstance;
  }

  override render() {
    if (!this.uuid || !this.componentsToRender.length) return nothing;

    return html`
      <div 
       
      style=${styleMap({
        "height": "100%",
      })}>
        ${renderComponent(this.componentsToRender, null, this.isPreviewMode())}
      </div>
    `;
  }
}