import {
  moveDraggedComponent,
  setCurrentComponentIdAction,
  setDraggingComponentInfo,
  setHoveredComponentIdAction,
  updateComponentAttributes,
} from "$store/component/action";
import {
  ComponentElement,
  DraggingComponentInfo,
} from "$store/component/interface";
import {
  $currentComponentId,
  $draggingComponentInfo,
  $hoveredComponent,
  $selectedComponent,
} from "$store/component/sotre";
import { useStores } from "@nanostores/lit";
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import styles from "./GenerikWrapper.style";

import { $environment, Environment, ViewMode } from "$store/environment/store";

import "./DragWrapper/DragWrapper";
import "./ResizeWrapper/ResizeWrapper";
import "./QuickActionWrapper/QuickActionWrapper";
import "../ComponentTitle/ComponentTitle";
import { Ref, createRef, ref } from "lit/directives/ref.js";
@customElement("generik-component-wrapper")
@useStores($currentComponentId, $environment)
export class GenerikComponentWrapper extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = styles;

  @state()
  selectedComponent: ComponentElement;

  @state()
  hoveredComponent: ComponentElement;

  @state()
  displayTitle = true;

  @state()
  isDraggbale = false;

  @state()
  isDragintiator = false;

  @state()
  draggingSituation = false;

  @state()
  dragOver = false;

  @state()
  draggingComponentInfo: DraggingComponentInfo;

  @state()
  environmentMode: ViewMode;

  @state()
  wrapperStyle: any = {};

  @state()
  showQuickAction = false;

  inputRef: Ref<HTMLInputElement> = createRef();
  constructor() {
    super();
    this.addEventListener('contextmenu', (e) => this.onContextMenu(e));

    $environment.subscribe((environment: Environment) => {
      this.environmentMode = environment.mode;
      if (environment.mode === ViewMode.Edit) {
        this.wrapperStyle = {
          "pointer-events": "none",
        };
      } else {
        this.wrapperStyle = {};
      }
    });
    $currentComponentId.subscribe(() => {});
    $draggingComponentInfo.subscribe(
      (draggingComponentInfo: DraggingComponentInfo) => {
        if (draggingComponentInfo) {
          this.draggingSituation = true;
          if(this.draggingComponentInfo?.componentId === this.component?.id){
            if(this.draggingComponentInfo?.blockInfo && !this.draggingComponentInfo?.blockInfo?.height){
              this.draggingComponentInfo.blockInfo.height = `${this.inputRef.value?.getBoundingClientRect().height}px`;
              this.draggingComponentInfo.blockInfo.width = `${this.inputRef.value?.getBoundingClientRect().width}px`;

              setDraggingComponentInfo({
                componentId: this.draggingComponentInfo?.componentId,
                blockInfo: {
                  ...this.draggingComponentInfo.blockInfo
                },
              });

            }
          }
          this.draggingComponentInfo = draggingComponentInfo;
        } else {
          this.draggingSituation = false;
          this.draggingComponentInfo = null;
        }
      }
    );
    $selectedComponent.subscribe((selectedComponent) => {
      if(selectedComponent?.id !== this.component?.id){
        this.showQuickAction = false;
      }
      this.selectedComponent = selectedComponent;
    });
    $hoveredComponent.subscribe((hoveredComponent) => {
      this.hoveredComponent = hoveredComponent;
    });
  }


  onContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentComponentIdAction(this.component?.id);
    this.showQuickAction = true;
  }

  @state()
  dropDragPalceHolderStyle: any = {};

  render() {
    return html`
    ${this.showQuickAction ? html`
             <quick-action-wrapper
             @click=${(e: Event) => {
              e.stopPropagation();
              e.preventDefault();
              }}
             @displayQuickActionChanged=${(e: CustomEvent) => {
             // this.showQuickAction = e.detail.showQuickAction;
              }}
             .component=${{...this.component}}
             ></quick-action-wrapper>
              ` : nothing}
    
    <resize-wrapper
      .component=${{ ...this.component }}
      .selectedComponent=${{ ...this.selectedComponent }}
      .hoveredComponent=${{ ...this.hoveredComponent }}
    >
      <drag-wrapper
        .component=${{ ...this.component }}
        .draggingComponentInfo=${{ ...this.draggingComponentInfo }}
        .isDragintiator=${this.isDragintiator}
      >
        <span
          draggable=${this.isDragintiator}
          class=${classMap({
            isDraggable: this.isDragintiator,
          })}
          @dragend=${() => {
            this.requestUpdate();
          }}
          @click="${(e) => {
            e.stopPropagation();
            e.preventDefault();
            setCurrentComponentIdAction(this.component?.id);
          }}"
          @mouseenter="${() => {
            setHoveredComponentIdAction(this.component?.id);
          }}"
          @mouseleave="${() => {
            setHoveredComponentIdAction(null);
          }}"
        >
          <component-title
            @dragInit=${(e) => {
              this.isDragintiator = e.detail.value;
            }}
            .component=${{ ...this.component }}
            .selectedComponent=${{ ...this.selectedComponent }}
          ></component-title>
          <!--span
            style=${styleMap({
            display:
              this.selectedComponent?.id === this.component.id &&
              this.displayTitle
                ? "block"
                : "none",
          })}
            @mousedown=${(e: Event) => {
            this.isDragintiator = true;
            setTimeout(() => {
              setDraggingComponentInfo({
                componentId: this.component?.id,
                blockInfo: {
                  height: this.component.style.height,
                  width: this.component.style.width,
                },
              });
            }, 100);
          }}
            @mouseup=${(e: Event) => {
            e.preventDefault();
            this.isDragintiator = false;
            setDraggingComponentInfo(null);
          }}
            class="component-name"
            >${this.component.name}</span
          -->
          <div  ${ref(this.inputRef)} style=${styleMap(this.wrapperStyle)}>
            <slot></slot>
          </div>
        </span>
      </drag-wrapper>
    </resize-wrapper>`;
  }
}
