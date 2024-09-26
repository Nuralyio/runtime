import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../hy-collapse.component';
import '../../icon/icon.component';
import '../../select/demo/select-demo';
@customElement('hy-collapse-demo')
export class HyCollapseDemo extends LitElement {
  override render() {
    return html`
      Default size
      <hy-collapse
        .sections=${[
          {
            header: 'Section 1',
            content: html` <hy-select-demo></hy-select-demo> `,
            open: false,
          },
          {header: 'Section 2', content: 'Content for section 2', open: true, collapsible: false},
          {header: 'Section 3', content: 'Content for section 3', open: false},
          {header: 'Section 4', content: 'Content for section 4', open: true, collapsible: true},
        ]}
      ></hy-collapse>

      Small size
      <hy-collapse
        .size=${'small'}
        .sections=${[
          {header: 'Section 2', content: 'Content for section 2', open: true, collapsible: false},
          {header: 'Section 3', content: 'Content for section 3', open: false},
          {header: 'Section 4', content: 'Content for section 4', open: true, collapsible: true},
        ]}
      ></hy-collapse>

      Large size
      <hy-collapse
        .size=${'large'}
        .sections=${[
          {header: 'Section 2', content: 'Content for section 2', open: true, collapsible: false},
          {header: 'Section 3', content: 'Content for section 3', open: false},
          {header: 'Section 4', content: 'Content for section 4', collapsible: true},
        ]}
      ></hy-collapse>
    `;
  }
}
