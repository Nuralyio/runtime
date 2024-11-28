import {LitElement, html} from 'lit';
import {styles} from './hy-collapse.style.js';
import {customElement, property} from 'lit/decorators.js';
import {CollapseSize, ISection} from './hy-collapse.type.js';
import {map} from 'lit/directives/map.js';
import {classMap} from 'lit/directives/class-map.js';

@customElement('hy-collapse')
export class HyCollapse extends LitElement {
  static override styles = styles;

  @property({type: Array}) sections: ISection[] = [];
  @property() size = CollapseSize.Default;

  toggleSection(index: number) {
    const section = this.sections[index];
    if (section.collapsible != false) {
      this.sections = this.sections.map((section, i) => (i === index ? {...section, open: !section.open} : section));
    }
    this.dispatchEvent(new CustomEvent('section-toggled', {detail: {index}}));
  }

  override render() {
    return html`
      ${map(
        this.sections,
        (section, index) => html`
          <div
            class="
          collapse-section
          ${classMap({
              'collapse-small': this.size == CollapseSize.Small,
              'collapse-large': this.size == CollapseSize.Large,
            })}
          "
          >
            <hy-label
              class="
              header
              ${classMap({
                'disabled-header': section.collapsible == false,
                'collapsed-header': section.open == true,
                'fold-header': section.open != true
              })}
                "
              @click="${() => this.toggleSection(index)}"
            >
              ${html`<hy-icon
                class="collapse-icon"
                name="${section.open && section.collapsible != false ? 'chevron-down' : 'chevron-right'}"
              ></hy-icon>`}
              ${section.header}
            </hy-label>
            ${section.open && section.collapsible != false ? html`<div class="content">${section.content}</div>` : ''}
          </div>
        `
      )}
    `;
  }
}
