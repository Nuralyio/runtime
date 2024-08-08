import {
  setCurrentComponentIdAction,
  setDraggingComponentInfo,
  setHoveredComponentIdAction,
} from "$store/actions/component";
import {
  type ComponentElement,
  type DraggingComponentInfo,
} from "$store/component/interface";
import {
  $draggingComponentInfo,
} from "$store/component/component-sotre";
import { LitElement, html} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import styles from "./GenerikWrapper.style";

import { $environment, type Environment, ViewMode } from "$store/environment";

import "./DragWrapper/DragWrapper";
import "./ResizeWrapper/ResizeWrapper";
import "./QuickActionWrapper/QuickActionWrapper";
import "../ComponentTitle/ComponentTitle";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { setContextMenuEvent } from "$store/actions/page";
import { $context, getVar, setVar } from "$store/context";
@customElement("generik-component-wrapper")
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
  showQuickAction = true;

  @state()
  currentSelection = []

  inputRef: Ref<HTMLInputElement> = createRef();
  constructor() {
    super();
    //this.addEventListener('contextmenu', (e) => this.onContextMenu(e));

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
    $context.subscribe(() => { 
      this.currentSelection = (getVar("global", "selectedComponents")?.value || [])

    });
    $draggingComponentInfo.subscribe(
      (draggingComponentInfo: DraggingComponentInfo) => {
        if (draggingComponentInfo) {
          this.draggingComponentInfo = draggingComponentInfo;

          this.draggingSituation = true;
          if (this.draggingComponentInfo?.componentId === this.component?.uuid) {
            if (this.draggingComponentInfo?.blockInfo && !this.draggingComponentInfo?.blockInfo?.height) {
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
        } else {
          this.draggingSituation = false;
          this.draggingComponentInfo = null;
        }
      }
    );
  }

  override updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
     this.requestUpdate();
    }
  }

  onContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentComponentIdAction(this.component?.uuid);
    e.ComponentTop = this.inputRef.value?.getBoundingClientRect().top;
    e.ComponentLeft = this.inputRef.value?.getBoundingClientRect().left;
    setContextMenuEvent(e);

  }

  @state()
  dropDragPalceHolderStyle: any = {};

  render() {
    return html`
  
    
    <resize-wrapper
    .isSelected=${this.currentSelection.includes( this.component.uuid)}
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
     
          @mousedown="${(e) => {
        e.stopPropagation();
   //    e.preventDefault();
        let currentSelection = (getVar("global", "selectedComponents")?.value || []);
        if (e.metaKey) {
          currentSelection.push(this.component.uuid);
        }else if (e.shiftKey) {
          currentSelection.splice(currentSelection.indexOf(this.component.uuid), 1);
        }else{
          currentSelection = [this.component.uuid];
        }
        setVar("global", "selectedComponents", [...currentSelection]);
        this.requestUpdate();

      }}"
          @mouseenter="${() => {
        setHoveredComponentIdAction(this.component?.uuid);
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
          this.selectedComponent?.uuid === this.component.uuid &&
            this.displayTitle
            ? "block"
            : "none",
      })}
            @mousedown=${(e: Event) => {
        this.isDragintiator = true;
        setTimeout(() => {
          setDraggingComponentInfo({
            componentId: this.component?.uuid,
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
          <div  ${ref(this.inputRef)}   class=${classMap({
        selected:
          this.selectedComponent?.uuid === this.component.uuid
      })} >
            <slot></slot>
          </div>
        </span>
      </drag-wrapper>
    </resize-wrapper>`;
  }
}
