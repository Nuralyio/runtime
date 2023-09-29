import { CSSResultGroup, LitElement, css, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import { $environment, Environment, ViewMode } from "$store/environment/store";
import { $pageZoom } from "$store/page/store";
import { updatePageZoom } from "$store/page/action";
@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  zoomLevel = 100;

  static styles = css`
    :host {
      width: 100%;
      height: 78vh;
    }
    .page-container {
      width: 100%;
      height: 78vh;
      overflow: auto;
    }
    .zoom-area {
      overflow: visible;
      background-color: white;
    }
    .zoom-controll {
      bottom: 0px;
      text-align: right;
    }
  `;
  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }
  connectedCallback(): void {
    super.connectedCallback();
    $pageZoom.subscribe((pageZoom: string) => {
      requestAnimationFrame(() => {
        this.zoomLevel = Number(pageZoom);
        this.requestUpdate();
      });
    });
  }
  render() {
    return html`<div>
        <div class="page-container">
          <div
            class="zoom-area"
            style=${styleMap({
              scale: this.zoomLevel / 100,
            })}
          >
            <slot></slot>
          </div>
        </div>
      </div>
      <br />

      <div class="zoom-controll">
        <input
          @input=${(e) => {
            updatePageZoom(e.target.value);
          }}
          type="range"
          id="cowbell"
          name="cowbell"
          min="0"
          max="200"
          .value=${this.zoomLevel}
          step="10"
        />
      </div>`;
  }
}
