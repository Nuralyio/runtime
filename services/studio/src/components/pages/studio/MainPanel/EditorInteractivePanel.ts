import { LitElement, css, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/dropdown";
import "@hybridui/color-picker";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { $environment, type Environment, ViewMode } from "$store/environment/store";
import { $contextMenuEvent, $currentPageViewPort, $pageZoom } from "$store/page/store";
import { updatePageZoom } from "$store/page/action";
import { type ComponentElement } from "$store/component/interface";
import { $selectedComponent } from "$store/component/sotre";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { $currentApplication } from "$store/apps";

@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  zoomLevel = 100;
  //
  @state()
  selectedComponent: ComponentElement;

  inputRef: Ref<HTMLInputElement> = createRef();

  static styles = css`
  :host {
      height: 100vh;
      display: block;
      background-color:#949494
    }
    .page-container {
      width: 100%;
      overflow: auto;
    }
    .zoom-area {
      overflow: visible;
      background-color: white;
      min-height: 800px;
    }
    .zoom-controll {
      bottom: 0px;
      text-align: right;
    }
  `;
  @state()
  currentPageViewPort: string
  constructor() {
    super();
    $selectedComponent( $currentApplication.get().uuid).subscribe((selectedComponent) => {
      /* if(selectedComponent?.uuid !== this.component?.uuid){
         this.showQuickAction = false;
       }*/
      this.selectedComponent = selectedComponent;
    });
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });

    $currentPageViewPort.subscribe((currentPageViewPort) => {
      if (currentPageViewPort) {
        switch (currentPageViewPort) {
          case "tablet":
            this.currentPageViewPort = "720px";
            break;
          case "mobile":
            this.currentPageViewPort = "375px";
            break;
            default:
              this.currentPageViewPort = "100%";
          }
        this.requestUpdate();
      }
    });
  }

  handleScroll(event) {
    this.inputRef.value!.style!.display = 'none';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.shadowRoot.querySelector('.page-container').removeEventListener('scroll', this.handleScroll.bind(this));

  }
  connectedCallback(): void {
    super.connectedCallback();
     $contextMenuEvent.subscribe((contextMenuEvent: any) => {
      if (contextMenuEvent && Object.keys(contextMenuEvent).length) {
        if (this.inputRef && this.inputRef.value) {
          this.inputRef.value.style.display = 'block'
          this.inputRef.value.style.top = `${contextMenuEvent.ComponentTop - 5}px`;
          this.inputRef.value.style.left = `${contextMenuEvent.ComponentLeft - 0}px`;
          this.inputRef.value!.style!.display = 'block'
        }
      } else {
        this.inputRef.value ? this.inputRef.value!.style!.display = 'none' : 'none'
      }
    })
  requestAnimationFrame(() => {
      this.shadowRoot!.querySelector('.page-container').addEventListener('scroll', this.handleScroll.bind(this));
    });
    $pageZoom.subscribe((pageZoom: string) => {
      requestAnimationFrame(() => {
        this.zoomLevel = Number(pageZoom);
        this.requestUpdate();
      });
    });


  }
  render() {
     
    return html`<div style=" padding: 20px;" >
  <quick-action-wrapper
  ${ref(this.inputRef)}
  style="position : absolute ; display : none"
               @click=${(e: Event) => {
        }}
             @displayQuickActionChanged=${(e: CustomEvent) => {
        // this.showQuickAction = e.detail.showQuickAction;
      }}
             .component=${{ ...this.selectedComponent }}
             ></quick-action-wrapper>
        <div class="page-container">
          <div
            class="zoom-area"
            style=${styleMap({
                  margin: "0px auto",
              width: `${this.currentPageViewPort}`,
        scale: this.zoomLevel / 100,
      })}
          >
            <slot></slot>
          </div>
        </div>
      </div>
      <br />

    `;
  }
}
