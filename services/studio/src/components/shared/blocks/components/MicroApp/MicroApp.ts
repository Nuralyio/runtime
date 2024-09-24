import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import { executeEventHandler } from "core/engine";
import "@hybridui/input";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";
import { $applications, setValue } from "$store/apps";
import { $environment, type Environment, ViewMode } from "$store/environment";
import { fetchApplicationById } from "$services/applications.service";
import { fetchApplicationComponentById } from "$services/component.service";
import { $components } from "$store/component/component-sotre";
import { eventDispatcher } from "utils/change-detection";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

@customElement("micro-app-block")
export class MicroAppBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

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
    `,
  ];

  @state()
  thisvalue: any;

  unsubscribe: () => void;
  mode: ViewMode;

  constructor() {
    super();
  }

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.registerCallback('appUUID', debounce((appUUID) => {
      if (appUUID) {
        const apploaded = $components.get()[appUUID];
        if (apploaded === undefined) {
          fetch('/api/components/application/' + appUUID)
            .then((response) => response.json())
            .then((data) => {
              return data.map((component) => component.component);
            })
            .then((data) => {
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

    this.unregisterCallback('appUUID');
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updated(changedProperties: any): void {
    super.updated(changedProperties);
    if (changedProperties.has('component')) {
      this.requestUpdate();
    }
  }

  render() {
    const isPreviewMode = this.inputHandlersValue.mode === ViewMode.Preview;

    return html`
      ${this.inputHandlersValue.appUUID
        ? html`
          <micro-app
            uuid=${this.inputHandlersValue.appUUID}
            style=${styleMap({
              pointerEvents: isPreviewMode ? "auto" : "none",
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