import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { useStores } from "@nanostores/lit";
import { $currentPage, $pages } from "$store/page/store";
import "@hybridui/menu";
import "@hybridui/icon";
import { setCurrentPageAction } from "$store/page/action";
import { type PageElement } from "$store/page/interface";
import { $pagesWithComponents } from "$store/component/sotre";
import { type ComponentElement } from "$store/component/interface";
import { setCurrentComponentIdAction, setHoveredComponentIdAction } from "$store/component/action";
@customElement("screen-list-editor")
@useStores($pages, $pagesWithComponents, $currentPage)
export class ScreenListEditor extends LitElement {
  options: any[] = [];
  @state()
  currentPage: PageElement;

  constructor() {
    super();
  }

  /*handleChildren(component: ComponentElement){
    return component?.childrens?.map((child: ComponentElement) => ({
      handler: () => {
        if (this.currentPage?.id !== child?.pageId) {
          setCurrentPageAction(child?.pageId);
        }
        setCurrentComponentIdAction(child?.id);
      },
      id: child.id,
      label: child.name,
    }));
  }
*/
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
            ...this.generateMenu(page.components),
          ],
        }));
        this.requestUpdate();

      });
    });
  }
  generateMenu(components: ComponentElement[]) {
    return components.map((component: ComponentElement) => ({
      label: component.name,
      id: component.id,
      handler: () => {
        if (this.currentPage?.id !== component?.pageId) {
          setCurrentPageAction(component?.pageId);
        }
        setCurrentComponentIdAction(component?.id);
      },
      mouseEnterHander : ()=>{
        setHoveredComponentIdAction(component?.id);
      },
      mouseLeaveHander : ()=>{
        setHoveredComponentIdAction(null);
      },
      children: component.childrens ? this.generateMenu(component.childrens) : [],
    }));
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
