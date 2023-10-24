import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html } from "lit";

export function renderComponent(components: ComponentElement[]) {
  return html`
    ${components.map((component: ComponentElement) => {
      switch (component?.type) {
        case ComponentType.TextInput:
          return html`<generik-component-wrapper .component=${{ ...component }}>
            <text-input-block .component=${{ ...component }}></text-input-block>
          </generik-component-wrapper>`;
        case ComponentType.TextLabel:
          return html`<generik-component-wrapper .component=${{ ...component }}>
            <text-label-block .component=${{ ...component }}></text-label-block>
          </generik-component-wrapper>`;
        case ComponentType.Button:
          return html`<generik-component-wrapper .component=${{ ...component }}>
            <button-block .component=${{ ...component }}></button-block>
          </generik-component-wrapper>`;
        case ComponentType.VerticalContainer:
          return html`
            <vertical-container-block
              .component=${{ ...component }}
            ></vertical-container-block>
          `;
        default:
          return html``;
      }
    })}
  `;
}
