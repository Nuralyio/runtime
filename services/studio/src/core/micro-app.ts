import { $applicationComponents, $components } from "$store/component/store.ts";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from "utils/render-util";
import "@shared/components/TextLabel/TextLabel";
import "@shared/components/Containers/Container";
import { $context } from "$store/context";
import { $currentPage, $microAppCurrentPage, $pages } from "$store/page";
import { eventDispatcher } from "utils/change-detection";
import { $environment, ViewMode } from "$store/environment";
import { debounceTime } from "rxjs/operators";
import { merge, Observable, Subscription } from "rxjs";
import EditorInstance from "./Editor";
import { styleMap } from "lit/directives/style-map.js";

@customElement("micro-app")
export class MicroApp extends LitElement {
  static override styles = [css`
      :host *:not(style) {
         
      }
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
    this.setupSubscriptions();
    super.connectedCallback();
    this.initializeAppComponents();
    EditorInstance.setEditorMode(this.prod);
  }
  
  override disconnectedCallback(): void {
    this.subscription.unsubscribe();
    super.disconnectedCallback();
  }
  
  /**
   * Récupère les composants de l'application s'ils ne sont pas déjà chargés.
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
          this.refreshComponent()
          this.updateComponentsToRender();
          this.requestUpdate();
        });

        this.page_uuid && fetch(`/api/pages/${this.page_uuid}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          this.page = data;
          this.setPageStyle();
          this.requestUpdate();

        });
    } else {
      this.page = $currentPage(this.uuid, this.page_uuid).get();
      this.setPageStyle();
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
      .pipe(debounceTime(10))
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
        "background-color": this.page?.style?.["background-color"] || "",
        "height": "100%",
      })}>
        ${renderComponent(this.componentsToRender, null, this.isPreviewMode())}
      </div>
    `;
  }
}