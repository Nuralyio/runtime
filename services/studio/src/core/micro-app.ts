import { $applicationComponents, $components } from "$store/component/store.ts";
import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from "utils/render-util";
import "@shared/components/TextLabel/TextLabel";
import "@shared/components/Containers/Container";
import { $applicationPages, $currentPage, $microAppCurrentPage } from "$store/page";
import { eventDispatcher } from "utils/change-detection";
import { ViewMode } from "$store/environment";
import { merge, Observable, Subscription } from "rxjs";
import EditorInstance from "./Editor";
import { styleMap } from "lit/directives/style-map.js";
import type { PageElement } from "$store/handlers/pages/interfaces/interface";

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

  @state() components: any[] = [];
  @state() componentsToRender: any[] = [];
  @state() page: any = {};

  constructor() {
    super();
  }

  /**
   * Rafraîchit la liste des composants en fonction de l'UUID actuel et de l'UUID de la page.
   */
  refreshComponent(): void {
    const components = $applicationComponents(this.uuid).get();
    this.components = this.page_uuid
      ? components.filter((component) => component.pageId === this.page_uuid && component.root === true)
      : components;
  }

  /**
   * Hook `updated()` de LitElement : déclenché lorsque les propriétés changent.
   */
  override updated(changedProperties: Map<string, any>): void {
    if (changedProperties.has("components") || changedProperties.has("componentToRenderUUID")|| changedProperties.has("page_uuid")) {
      this.updateComponentsToRender();
    }
   
  }

  /**
   * Met à jour `componentsToRender` en fonction de la sélection actuelle.
   */
  private updateComponentsToRender(): void {
    this.componentsToRender = this.componentToRenderUUID
      ? this.components.filter((component) => component.uuid === this.componentToRenderUUID)
      : this.components;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupSubscriptions();
    EditorInstance.setEditorMode(this.prod);
    this.initializeAppComponents();
  }
  
  protected firstUpdated(_changedProperties: PropertyValues): void {
    
  }
  override disconnectedCallback(): void {
    this.subscription.unsubscribe();
    super.disconnectedCallback();
  }
  
  /**
 * Récupère les composants de l'application s'ils ne sont pas déjà chargés.
 */
private initializeAppComponents(): void {
  console.log('Initializing app components for UUID:', this.uuid);

  const appLoaded = $components.get()[this.uuid];
  console.log('App already loaded?', appLoaded !== undefined);

  if (this.page_uuid) {
    console.log('Setting current page UUID in micro app:', this.page_uuid);
    $microAppCurrentPage.setKey(this.uuid, this.page_uuid);
  }

  if (appLoaded === undefined) {
    console.log('App not loaded yet, fetching components and pages...');

    // Fetch components
    fetch(`/api/components/application/${this.uuid}`)
      .then((response) => {
        console.log('Component fetch response:', response);
        return response.json();
      })
      .then((data) => {
        console.log('Raw components data:', data);
        const components = data.map((component) => component.component);
        console.log('Extracted components:', components);
        return components;
      })
      .then((components) => {
        $components.setKey(this.uuid, components);
        console.log('Components set in store');
        this.refreshComponent();
        this.updateComponentsToRender();
        this.requestUpdate();
        console.log('Component UI refreshed');
      })
      .catch((error) => {
        console.error('Error fetching components:', error);
      });

    // Fetch pages
    fetch(`/api/pages/application/${this.uuid}`)
      .then((response) => {
        console.log('Page fetch response:', response);
        return response.json();
      })
      .then((data) => {
        console.log('Fetched pages:', data);
        this.page = data[0];
        console.log('Set first page as current page:', this.page);
        this.setPageStyle();
        this.requestUpdate();
      })
      .catch((error) => {
        console.error('Error fetching pages:', error);
      });

  } else {
    console.log('App already loaded, resolving current page...');

    if (window.__URL__) {
      const page = $applicationPages(this.uuid)
        .get()
        .find((page: PageElement) => page.url === window.__URL__)?.uuid;

      console.log('Page found by URL:', window.__URL__, '=>', page);
      this.page = page;
    } else {
      const currentPage = $currentPage(this.uuid, this.page_uuid).get().uuid;
      console.log('Current page from store:', currentPage);
      this.page = currentPage;
    }

    if (this.page) {
      console.log('Setting page_uuid to:', this.page);
      this.page_uuid = this.page;
    }

    this.refreshComponent();
    console.log('Component refreshed');
    this.setPageStyle();
    console.log('Page style set');
  }
}

  /**
   * Définit le style de la page.
   */
  setPageStyle() {}

  /**
   * Configure les abonnements aux observables pertinents pour gérer la logique de rafraîchissement.
   */
  private setupSubscriptions(): void {
    const observables = [
      this.createStoreObservable($components),
    ];

    const mergedSubscription = merge(...observables)
      .subscribe(() => this.refreshComponent());

    this.subscription.add(mergedSubscription);
  }

  /**
   * Crée un observable pour un store donné.
   * @param store - Le store à observer.
   */
  private createStoreObservable(store: any): Observable<void> {
    return new Observable((subscriber) => {
      const unsubscribe = store.subscribe(() => subscriber.next());
      return () => unsubscribe();
    });
  }

  /**
   * Crée un observable pour un événement spécifique.
   * @param eventName - Le nom de l'événement à observer.
   */
  private createEventObservable(eventName: string): Observable<void> {
    return new Observable((subscriber) => {
      const handler = () => subscriber.next();
      eventDispatcher.on(eventName, handler);
      return () => eventDispatcher.off(eventName, handler);
    });
  }

  /**
   * Vérifie si l'application est en mode prévisualisation.
   */
  private isPreviewMode(): boolean {
    return this.mode === ViewMode.Preview;
  }

  override render() {
    if (!this.uuid || !this.componentsToRender.length) return nothing;

    return html`
      <div style=${styleMap({
        "height": "100%",
      })}>
        ${renderComponent(this.componentsToRender, null, this.isPreviewMode())}
      </div>
    `;
  }
}