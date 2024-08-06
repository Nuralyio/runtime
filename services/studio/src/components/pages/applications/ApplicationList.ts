import { $applications } from '$store/apps';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './ApplicationAdd';
import './ApplicationDelete';
import { showCreateApplicationModalAction } from '$store/app.action';
import { repeat } from 'lit/directives/repeat.js';

@customElement('applications-list')
export class ApplicationList extends LitElement {
  @state()
  applications: any[] = [];

  @state()
  displayModal = false;

  static override styles = css``
	unsubscribe: () => void;

  constructor() {
    super();
	 this.unsubscribe = $applications.subscribe(applications => {
      this.applications = (Array.isArray(applications) ? Array.from(applications) : []).filter(application => !!application.user_id);
		console.log(  this.applications)
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
	console.log('Rendering applications:', this.applications);

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
        <div @click=${() => { showCreateApplicationModalAction() }}>
          <h2><strong>+</strong></h2>
        </div>
      </div>

      <application-add .displayModal=${this.displayModal}></application-add>
    `;
  }
}