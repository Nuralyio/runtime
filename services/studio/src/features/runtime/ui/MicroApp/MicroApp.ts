import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/input";
import { $environment, type Environment, ViewMode } from "@shared/redux/store/environment.ts";
import { $components } from "@shared/redux/store/component/store.ts";
import { $microAppCurrentPage } from "@shared/redux/store/page.ts";
import { debounce } from "@shared/utils/time.ts";


@customElement("micro-app-block")
export class MicroAppBlock extends BaseElementBlock {
  static styles = [
    css`
      .no-app-selected {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        width:400px;
        border: 2px dashed gray;
        color: gray;
        text-align: center;
      }
    `
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;
  unsubscribe: () => void;
  mode: ViewMode;

  constructor() {
    super();
  }

  override async connectedCallback(): Promise<void> {
    await super.connectedCallback();
    const pageUUID = $microAppCurrentPage.get()["84105b5d-49fe-4724-bc0e-325b578cbe17"];
    this.registerCallback("appUUID", debounce((appUUID: string) => {
      if (appUUID) {
        const appLoaded = $components.get()[appUUID];
        if (appLoaded === undefined) {
          fetch("/api/components/application/" + appUUID)
            .then((response) => response.json())
            .then((data) => {
              return data.map((component) => component.component);
            })
            .then((data) => {
              if (pageUUID)
                data = data.filter((component) => component.pageId === pageUUID);
              $components.setKey(appUUID, data);
              this.requestUpdate();
            });
        }
      }
    }, 0));
    this.unsubscribe = $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.unregisterCallback("appUUID");
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  

  render() {
    const isPreviewMode = this.inputHandlersValue.mode === ViewMode.Preview || this.inputHandlersValue.mode === ViewMode.Preview;

    return html`
      ${this.inputHandlersValue.appUUID
      ? html`
          <micro-app
            uuid=${this.inputHandlersValue.appUUID}
            componentToRenderUUID=${this.inputHandlersValue.componentToRenderUUID ?? nothing}
            style=${styleMap({
        pointerEvents: isPreviewMode ? "auto" : "none"
      })}
          ></micro-app>
        `
      : html`
          <div class="no-app-selected">
            No micro-app selected
          </div>
        `}
    `;
  }
}