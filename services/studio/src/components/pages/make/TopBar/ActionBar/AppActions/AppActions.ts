import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./AppActions.style";
import { useStores } from "@nanostores/lit";
import { $environment, Environment, ViewMode } from "$store/environment/store";
import { setEnvironmentMode } from "$store/environment/action";

@customElement("topbar-app-actions")
@useStores($environment)
export class TopbarAppActions extends LitElement {
  static styles = styles;
  @state()
  environmentMode: ViewMode;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.environmentMode = environment.mode;
    });
  }
  togglePreviewMode() {
    setEnvironmentMode(
      this.environmentMode === ViewMode.Edit ? ViewMode.Preview : ViewMode.Edit
    );
  }
  render() {
    return html`<div class="app-action-wrapper">
      <hy-button icon="comment"></hy-button>
      <hy-button
        @click=${this.togglePreviewMode}
        icon=${this.environmentMode === ViewMode.Edit ? "play" : "edit"}
      ></hy-button>
      <hy-button icon="save"></hy-button>
    </div>`;
  }
}
