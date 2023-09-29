import { ComponentElement, ComponentType } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./Inputs/Container/DirectionAttribute/DirectionAttribute";
@customElement("style-panel")
export class STylePAnel extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [
    css`
      :host {
        min-width: 150px;
      }
    `,
  ];

  renderParameters(component: ComponentElement) {
    let templates = [];
    switch (component?.type) {
      case ComponentType.VerticalContainer:
        templates.push(html`
          <h4>Parameters</h4>
          <div style="padding:4px">
            <parameter-container-attribute
              .component=${{ ...component }}
            ></parameter-container-attribute>
          </div>
        `);

        break;
      case ComponentType.TextLabel:
        templates.push(html`
          <h4>Parameters</h4>
          <div style="padding:4px">
            <parameter-text-label
              .component=${component}
            ></parameter-text-label>
          </div>
          ${["onSelect", "onClick"].map((eventName: string) => {
            return html` <parameter-event
              .component=${component}
              .eventName=${eventName}
            ></parameter-event>`;
          })}
        `);
        templates.push(
          html`
          <h4>Styles</h4> 
            <div style="padding:4px">
              <attribute-text-font-size
                .component=${{ ...component }}
              ></attribute-text-font-size>
            </div>
            <div style="padding:4px">
              <attribute-text-font-weight
                .component=${component}
              ></attribute-text-font-weight>
            </div>
            <div style="padding:4px">
              <attribute-text-font-style
                .component=${component}
              ></attribute-text-font-style>
              </div>
              <div style="padding:4px">
                <attribute-background-color
                  .component=${component}
                ></attribute-background-color>
              </div>
              <div style="padding:4px">
                <attribute-color
                  .component=${component}
                ></attribute-color>
              </div>
            </div>`
        );
    }
    return templates;
  }

  render() {
    return html`${this.renderParameters({ ...this.component })}`;
  }
}
