import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { $draggingComponentInfo, $hoveredComponent } from '../../../../../redux/store/component/store.ts';
import { type ComponentElement, type DraggingComponentInfo } from '../../../../../redux/store/component/component.interface.ts';
import { $environment, type Environment, ViewMode } from '../../../../../redux/store/environment.ts';
import { $context, getVar, setVar } from '../../../../../redux/store/context.ts';
import styles from "./GenerikWrapper.style.ts";

import "./DragWrapper/DragWrapper.ts";
import "./ResizeWrapper/ResizeWrapper.ts";
import "./QuickActionWrapper/QuickActionWrapper.ts";
import "../ComponentTitle/ComponentTitle.ts";
import { setDraggingComponentInfo } from '../../../../../redux/actions/component/setDraggingComponentInfo.ts';
import { updateComponentAttributes } from '../../../../../redux/actions/component/updateComponentAttributes.ts';
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setHoveredComponentAction } from '../../../../../redux/actions/component/setHoveredComponentAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';

function safeParseInt(value) {
  const result = parseInt(value, 10);
  return isNaN(result) ? 0 : result;
}

@customElement("generik-component-wrapper")
export class GenerikComponentWrapper extends LitElement {
  static styles = styles;
  @property({ type: Object }) component: ComponentElement;
  @property({ type: Boolean }) highlighted: boolean;
  @state() selectedComponent: ComponentElement;
  @state() hoveredComponent: ComponentElement;
  @state() displayTitle = true;
  @state() isDraggable = false;
  @state() isDragInitiator = false;
  @state() draggingSituation = false;
  @state() dragOver = false;
  @state() draggingComponentInfo: DraggingComponentInfo;
  @state() environmentMode: ViewMode;
  @state() wrapperStyle: any = {};
  @state() showQuickAction = true;
  @state() currentSelection = [];
  @state() dropDragPlaceholderStyle: any = {};
  inputRef: Ref<HTMLInputElement> = createRef();
  resizerRef: Ref<HTMLDivElement> = createRef();
  private isResizing = false;
  private startX = 0;
  private startMarginLeft = 0;

  constructor() {
    super();
    this.addEventListener("contextmenu", (e) => this.onContextMenu(e));

    $environment.subscribe((environment: Environment) => {
      this.environmentMode = environment.mode;
      this.wrapperStyle =
        environment.mode === ViewMode.Edit ? {  } : {};
    });
    $hoveredComponent.subscribe((hoveredComponent: ComponentElement) => {
      this.hoveredComponent = hoveredComponent;
    });
    $context.subscribe(() => {
    });
    $draggingComponentInfo.subscribe((draggingComponentInfo: DraggingComponentInfo) => {
      if (draggingComponentInfo) {
        this.draggingComponentInfo = draggingComponentInfo;
        this.draggingSituation = true;
        if (this.draggingComponentInfo?.componentId === this.component?.uuid) {
          if (
            this.draggingComponentInfo?.blockInfo &&
            !this.draggingComponentInfo?.blockInfo?.height
          ) {
            const rect = this.inputRef.value?.getBoundingClientRect();
            this.draggingComponentInfo.blockInfo.height = `${rect.height}px`;
            this.draggingComponentInfo.blockInfo.width = `${rect.width}px`;
            setDraggingComponentInfo({
              componentId: this.draggingComponentInfo?.componentId,
              blockInfo: { ...this.draggingComponentInfo.blockInfo }
            });
          }
        }
      } else {
        this.draggingSituation = false;
        this.draggingComponentInfo = null;
      }
    });
  }

  override update(changedProperties) {
    super.update(changedProperties);


    if (changedProperties.has("highlighted")) {
      const currentSelection = getVar("global", "selectedComponents")?.value || [];
      if (this.highlighted) {
        setVar("global", "selectedComponents", [...currentSelection, this.component.uuid]);
      } else {
        setVar("global", "selectedComponents", currentSelection.filter((uuid) => uuid !== this.component.uuid));
      }
    }
  }

  onContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentComponentIdAction(this.component?.uuid);
    const rect = this.inputRef.value?.getBoundingClientRect();
    e.ComponentTop = rect.top;
    e.ComponentLeft = rect.left;
    setContextMenuEvent(e);
  }

  override connectedCallback() {
    super.connectedCallback();
    // Find the closest parent "generik-component-wrapper"
    const closestWrapper = this.closest("generik-component-wrapper");
    if (closestWrapper) {
    } else {
    }
  }

  render() {
    return html`
      <style>
        :host {

        }
      </style>
      <resize-wrapper
        .isSelected=${this.currentSelection.includes(this.component.uuid)}
        .component=${{ ...this.component }}
        .selectedComponent=${{ ...this.selectedComponent }}
        .hoveredComponent=${{ ...this.hoveredComponent }}
        .inputRef=${this.inputRef}
      >
      </resize-wrapper>

        <drag-wrapper
          .component=${{ ...this.component }}
          .draggingComponentInfo=${{ ...this.draggingComponentInfo }}
          .isDragInitiator=${this.isDragInitiator}
        >
          <span
            draggable=${this.isDragInitiator}
            class=${classMap({ isDraggable: this.isDragInitiator })}
            @dragend=${() => this.requestUpdate()}
            @mousedown=${this.handleMouseDown}
            @mouseenter=${() => setHoveredComponentAction(this.component)}
            @mouseleave=${() => setHoveredComponentAction(null)}
          >
         
            <div
              ${ref(this.inputRef)}
              class=${classMap({ selected: this.selectedComponent?.uuid === this.component.uuid })}
            >
              <div
                ${ref(this.resizerRef)}
                class="left-resizer"
                style=${styleMap({
                  width: `${safeParseInt(this.component?.style?.marginLeft) + 10}px`,
                  zIndex: 1000,
                  height: `${this.inputRef?.value?.offsetHeight}px`,
                  cursor: "ew-resize"
                })}
                @mousedown=${this.startResizing}
              >
                <span class="text">${safeParseInt(this.component?.style?.marginLeft)}px</span>
              </div>
              <slot></slot>
            </div>
            <component-title
              @dragInit=${(e) => (this.isDragInitiator = e.detail.value)}
              .component=${{ ...this.component }}
              .selectedComponent=${{ ...this.selectedComponent }}
              .hoveredComponent=${{ ...this.hoveredComponent }}

            ></component-title>
          </span>
        </drag-wrapper>
    `;
  }

  private handleMouseDown(e: MouseEvent) {
    e.stopPropagation();
    let currentSelection = getVar("global", "selectedComponents")?.value || [];
    if (e.metaKey) {
      currentSelection.push(this.component.uuid);
    } else if (e.shiftKey) {
      currentSelection = currentSelection.filter((uuid) => uuid !== this.component.uuid);
    } else {
      currentSelection = [this.component.uuid];
    }
    setVar("global", "selectedComponents", [...currentSelection]);
  }

  private startResizing(e: MouseEvent) {
    this.isResizing = true;
    this.startX = e.clientX;
    this.startMarginLeft = safeParseInt(this.component?.style?.marginLeft) || 0;
    document.addEventListener("mousemove", this.resize);
    document.addEventListener("mouseup", this.stopResizing);
  }

  private updateComponentMarginLeft(newMarginLeft: number) {
    const updatedStyle = {
      ...this.component.style,
      marginLeft: `${newMarginLeft}px`
    };
    this.component = { ...this.component, style: updatedStyle };
    updateComponentAttributes(this.component.application_id, this.component.uuid, "style", updatedStyle);
  }

  private resize = (e: MouseEvent) => {
    if (this.isResizing) {
      const deltaX = e.clientX - this.startX;
      const newMarginLeft = this.startMarginLeft + deltaX;
      this.updateComponentMarginLeft(newMarginLeft);
    }
  };

  private stopResizing = () => {
    this.isResizing = false;
    document.removeEventListener("mousemove", this.resize.bind(this));
    document.removeEventListener("mouseup", this.stopResizing.bind(this));
    requestAnimationFrame(() => {
      this.requestUpdate();
    });
  };
}