import { type  ComponentElement, ComponentType } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./Inputs/Container/DirectionAttribute/DirectionAttribute";
import "../Page/PageParameters/PageParameters";
import "../ControlPanel/Display/SizePaddingMarginAttribute/SizePaddingMarginAttribute";
import "../ControlPanel/Collections/CollectionInputAttribute/CollectionInputAttribute";
import "./ResponsiveParameter/ResponsiveParameter";
@customElement("style-panel")
export class STylePAnel extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [
    css`
      :host {
        min-width: 150px;
      }
      h4{
        margin-bottom: 3px;
        margin-left: 3px;
        padding-left: 0px;
      }
    `,
  ];

  renderParameters(component: ComponentElement) {
    let templates = [];
          templates.push(html`<responsive-selectionl-parameter></responsive-selectionl-parameter>`);

    switch (component?.component_type) {
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
            ></parameter-event>
            `;
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
              <div style="padding:4px ; ">
                <size-padding-margin-attribute
                  .component=${component}
                ></size-padding-margin-attribute>
              </div>

              <h4>Radius</h4> 
              <div style="padding:4px ; ">
                <border-attribute
                  .component=${component}
                ></border-attribute>
              </div>

              <h4>Shadow</h4> 
              <div style="padding:4px ; ">
                <attribute-box-shadow-attribute
                  .component=${component}
                ></attribute-box-shadow-attribute>
              </div>


              
            </div>`
        );
        break;
      case ComponentType.Collection:
        templates.push(html`
          <div style="padding:4px">
            <parameter-collection-input-attribute
              .component=${{ ...component }}
            ></parameter-collection-input-attribute>
          </div>
        `);

        break;
        default:
          templates.push(html`<div style="padding:4px">
<page-parameters></page-parameters>
          </div>`);

        break;

    }

    return templates;
  }

  render() {
    return html`${this.renderParameters({ ...this.component })}`;
  }
}
