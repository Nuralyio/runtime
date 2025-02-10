import { $applicationComponents, $components } from "$store/component/store.ts";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from "utils/render-util";
import "@shared/components/TextLabel/TextLabel";
import "@shared/components/Containers/Container";
import { $context } from "$store/context";
import { $microAppCurrentPage, $pages } from "$store/page";
import { eventDispatcher } from "utils/change-detection";
import { $environment, ViewMode } from "$store/environment";
import { debounceTime } from "rxjs/operators";
import { merge, Observable } from "rxjs";
import EditorInstance from "./Editor";

@customElement("micro-app")
export class MicroApp extends LitElement {
  static override styles = [css`
      :host *:not(style) {
         
      }
  `];

  @property({ type: String, reflect: true }) uuid!: string;
  @property({ type: String, reflect: true }) page_uuid?: string;
  @property({ type: String, reflect: true }) componentToRenderUUID?: string;
  @property({ type: String, reflect: false }) mode: ViewMode = ViewMode.Preview;
  @property({ type: Boolean, reflect: false }) prod = true;

  @state() components: any[] = [];

  constructor() {
    super();
  }

  /**
   * Refresh the list of components based on the current UUID and page UUID.
   */
  refreshComponent(): void {
    const components = $applicationComponents(this.uuid).get();
    this.components = this.page_uuid
      ? components.filter((component) => component.pageId === this.page_uuid && component.root === true)
      : components;

  }

  override connectedCallback(): void {
    this.setupSubscriptions();
    super.connectedCallback();
    this.initializeAppComponents();
    EditorInstance.setEditorMode(this.prod);
  }

  /**
   * Fetch application components if not already loaded.
   */
  private initializeAppComponents(): void {
    const appLoaded = $components.get()[this.uuid];
    if (this.page_uuid) {
      $microAppCurrentPage.setKey(this.uuid, this.page_uuid);
    }
    if (appLoaded === undefined) {
      fetch(`/api/components/application/${this.uuid}`)
        .then((response) => response.json())
        .then((data) => data.map((component) => component.component))
        .then((data) => {
          $components.setKey(this.uuid, data);
        });
    }

  }

  /**
   * Set up subscriptions to relevant observables and handle component refresh logic.
   */
  private setupSubscriptions(): void {
    const observables = [
      this.createStoreObservable($pages),
      this.createStoreObservable($components),
      this.createStoreObservable($context),
      this.createStoreObservable($applicationComponents(this.uuid)),
      this.createStoreObservable($environment),
      this.createEventObservable("component:refresh"),
    ];

    merge(...observables)
      .pipe(debounceTime(30))
      .subscribe(() => this.refreshComponent());
  }

  /**
   * Create an observable for a given store.
   * @param store - The store to observe.
   */
  private createStoreObservable(store: any): Observable<void> {
    return new Observable((subscriber) => {
      const unsubscribe = store.subscribe(() => subscriber.next());
      return () => unsubscribe();
    });
  }

  /**
   * Create an observable for a specific event.
   * @param eventName - The name of the event to observe.
   */
  private createEventObservable(eventName: string): Observable<void> {
    return new Observable((subscriber) => {
      eventDispatcher.on(eventName, () => subscriber.next());
    });
  }

  /**
   * Check if the app is in preview mode.
   */
  private isPreviewMode(): boolean {
    return this.mode === ViewMode.Preview;
  }

  override render() {
    if (!this.uuid || !this.components.length) return nothing;

    const componentsToRender = this.componentToRenderUUID
      ? this.components.filter((component) => component.uuid === this.componentToRenderUUID)
      : this.components;

    return html`
      ${renderComponent(componentsToRender, null, this.isPreviewMode())}
    `;
  }
}