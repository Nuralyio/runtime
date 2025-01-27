import { $applications } from "$store/apps";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./ApplicationAdd";
import "./ApplicationDelete";
import { repeat } from "lit/directives/repeat.js";
import { showCreateApplicationModalAction } from "$store/actions/application/showCreateApplicationModalAction.ts";

@customElement("applications-list")
export class ApplicationList extends LitElement {
  static override styles = css``;
  @state()
  applications: any[] = [];
  @state()
  displayModal = false;
  unsubscribe: () => void;

  constructor() {
    super();
    this.unsubscribe = $applications.subscribe(applications => {
      this.applications = (Array.isArray(applications) ? Array.from(applications) : []).filter(application => !!application.user_id);
      
    });
  }

  override connectedCallback() {
    super.connectedCallback();

  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  override render() {

    return html`
      <div class="container">
        ${this.applications.length === 0
      ? html`<p>No applications available.</p>`
      : repeat(this.applications, application => application.uuid, (application, index) => html`
            <div slot="label" @click=${() => {
        location.href = "/app/studio/" + application.uuid;
      }}>
              <h2 style="margin:0">
                <a href=${"/app/studio/" + application.uuid}>
                  ${application.name}
                </a>
              </h2>
            </div>
          `)}
        <div @click=${() => {
      showCreateApplicationModalAction();
    }}>
          <h2><strong>+</strong></h2>
        </div>
      </div>

      <application-add .displayModal=${this.displayModal}></application-add>
    `;
  }
}