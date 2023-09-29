import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { useStores } from "@nanostores/lit";
import { $currentPage, $pages } from "$store/page/store";
import "@hybridui/menu";
import "@hybridui/icon";
import { setCurrentPageAction } from "$store/page/action";
import { PageElement } from "$store/page/interface";
import { $pagesWithComponents } from "$store/component/sotre";
import { ComponentElement } from "$store/component/interface";
import { setCurrentComponentIdAction } from "$store/component/action";
@customElement("screen-list-editor")
@useStores($pages, $pagesWithComponents, $currentPage)
export class ScreenListEditor extends LitElement {
  options: any[] = [];
  @state()
  currentPage: PageElement;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    $currentPage.subscribe((currentPage: PageElement) => {
      this.currentPage = { ...currentPage };
    });
    $pagesWithComponents.subscribe((pages: PageElement[] = []) => {
      setTimeout(() => {
        this.options = [...pages].map((page) => ({
          label: page.name,
          id: page.id,
          handler: () => {
            setCurrentPageAction(page.id);
          },
          children: [
            ...page.components?.map((component: ComponentElement) => ({
              handler: () => {
                if (this.currentPage?.id !== component?.pageId) {
                  setCurrentPageAction(component?.pageId);
                }
                setCurrentComponentIdAction(component?.id);
              },
              id: component.id,
              label: component.name,
            })),
          ],
        }));
        this.requestUpdate();
      });
    });
  }
  render() {
    return html`
      ${this.options
        ? html` <hy-menu
            placeholder="Select an option"
            .options=${this.options}
            @change="${(e: any) => {}}"
          ></hy-menu>`
        : nothing}
    `;
  }
}
