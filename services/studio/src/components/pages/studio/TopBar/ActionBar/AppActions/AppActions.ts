import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import styles from "./AppActions.style";
import { useStores } from "@nanostores/lit";
import { $environment, type Environment, ViewMode } from "$store/environment";
import { setEnvironmentMode } from "$store/actions/environment";
import { $currentApplication } from "$store/apps";

@customElement("topbar-app-actions")
export class TopbarAppActions extends LitElement {
  static styles = styles;
  @state()
  environmentMode: ViewMode;

  @state()
  viewTab;
  application: any;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.environmentMode = environment.mode;
    });
    $currentApplication.subscribe((application) => {
      this.application = application;
    }
    );
  }
  togglePreviewMode() {
    setEnvironmentMode(
      this.environmentMode === ViewMode.Edit ? ViewMode.Preview : ViewMode.Edit
    );
  }
  render() {
    return html`<div class="app-action-wrapper" >
      <!-- <hy-button icon="comment"></hy-button> -->
      <hy-button
        @click=${() => {
        this.togglePreviewMode();
      }
      }
        .icon=${this.environmentMode === ViewMode.Edit ? ["play"] : ["pencil"]}
      ></hy-button>
    </div>`;
  }
}
