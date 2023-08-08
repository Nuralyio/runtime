import { CSSResultGroup, LitElement, css, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  @state()
  zoomLevel = 100;
  static styles = css`
    .page-container {
      height: 1024px;
      width: 800px;
      overflow: auto;
    }
    .zoom-area {
      background-color: white;
      min-height: 800px;
      overflow: visible;
    }
    .zoom-controll {
      bottom: 50px;
      position: absolute;
    }
  `;
  render() {
    return html`<div class="page-container">
      <div
        class="zoom-area"
        style=${styleMap({
          scale: this.zoomLevel / 100,
        })}
      >
        <slot></slot>
      </div>
      <div class="zoom-controll">
        <input
          @input=${(e) => {
            this.zoomLevel = e.target.value;
            return {};
          }}
          type="range"
          min="1"
          max="200"
          value=${this.zoomLevel}
          class="slider"
          id="myRange"
        />
      </div>
    </div>`;
  }
}
