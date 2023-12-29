import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html } from "lit";

export function renderComponent(components: ComponentElement[] , item? : any, isViewMode? : boolean) {
  return html`
    ${!isViewMode ? components.map((component: ComponentElement) => {
      switch (component?.component_type) {
        case ComponentType.TextInput:
          return html`<generik-component-wrapper  .component=${{ ...component }}>
            <text-input-block .item =${{...item}} .component=${{ ...component }}></text-input-block>
          </generik-component-wrapper>`;
        case ComponentType.TextLabel:
          return html`<generik-component-wrapper .component=${{ ...component }}>
            <text-label-block .item =${{...item}}  .component=${{ ...component }}></text-label-block>
          </generik-component-wrapper>`;
        case ComponentType.Button:
          return html`<generik-component-wrapper .component=${{ ...component }}>
          </generik-component-wrapper>`;
        case ComponentType.VerticalContainer:
          return html`
            <vertical-container-block
              .item =${{...item}}  .component=${{ ...component }}
            ></vertical-container-block>
          `;
        case ComponentType.Collection:
          return html`
            <colletion-viwer
              .component=${{ ...component }}
            ></colletion-viwer>
          `;
        default:
          return html``;
      }
    })
    :components.map((component: ComponentElement) => {
      switch (component?.component_type) {
        case ComponentType.TextInput:
          return html` <text-input-block .item =${{...item}} .component=${{ ...component }}></text-input-block>`;
        case ComponentType.TextLabel:
          return html` <text-label-block .item =${{...item}}  .component=${{ ...component }}></text-label-block>`;
        case ComponentType.Button:
          return html`            <button-block  .item =${{...item}}  .component=${{ ...component }}></button-block>
`;
        case ComponentType.VerticalContainer:
          return html`
            <vertical-container-block
              .isViewMode=${isViewMode}

              .item =${{...item}}  .component=${{ ...component }}
            ></vertical-container-block>
          `;
        case ComponentType.Collection:
          return html`
            <colletion-viwer
              .isViewMode=${isViewMode}
            
              .component=${{ ...component }}
            ></colletion-viwer>
          `;
        default:
          return html``;
      }
    })
  }
  `;
}

