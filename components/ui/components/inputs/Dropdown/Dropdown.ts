import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@nuralyui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { $components, $activeSlot } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util';
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';

@customElement("dropdown-block")
export class DropdownBlock extends BaseElementBlock {
    static styles = [css`
        :host {
            display: inline-block;
        }

        /* Slot placeholder styles */
        .slot-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            min-height: 60px;
            border: 2px dashed #d1d5db;
            border-radius: 6px;
            background-color: #f9fafb;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .slot-placeholder:hover {
            border-color: #9ca3af;
            background-color: #f3f4f6;
        }

        .slot-placeholder.active {
            border-color: #8b5cf6;
            background-color: #f5f3ff;
        }

        .slot-placeholder .slot-label {
            font-size: 12px;
            font-weight: 500;
            color: #374151;
        }

        .slot-placeholder nr-label {
            font-size: 11px;
            color: #6b7280;
        }

        .content-placeholder {
            min-height: 100px;
            min-width: 150px;
        }

        .slot-container {
            min-height: 40px;
        }

        .trigger-slot-wrapper {
            display: inline-block;
        }
    `];

    @property({ type: Object })
    component: ComponentElement;

    @state() triggerChildren: ComponentElement[] = [];
    @state() contentChildren: ComponentElement[] = [];

    @state()
    options: any[] = [];

    // Temporary state for editing - synced with editorOpen input property
    @state()
    private _editorOpen = false;

    constructor() {
        super();
    }

    override connectedCallback() {
        super.connectedCallback();
        this.registerCallback("value", () => {
            this.requestUpdate();
        });
        this.updateChildrenComponents();
    }

    private updateChildrenComponents(): void {
        const appComponents = $components.get()[this.component?.application_id] ?? [];
        const childrenIds = this.component?.children_ids ?? [];

        // Get slot assignments from component
        const slots = this.component?.slots || {};
        const triggerSlotIds = slots.trigger || [];
        const contentSlotIds = slots.content || [];

        // If no slot assignments, use legacy behavior (all children go to trigger)
        if (triggerSlotIds.length === 0 && contentSlotIds.length === 0) {
            this.triggerChildren = childrenIds
                .map((id) => appComponents.find((c) => c.uuid === id))
                .filter(Boolean) ?? [];
            this.contentChildren = [];
        } else {
            this.triggerChildren = triggerSlotIds
                .map((id: string) => appComponents.find((c) => c.uuid === id))
                .filter(Boolean) ?? [];
            this.contentChildren = contentSlotIds
                .map((id: string) => appComponents.find((c) => c.uuid === id))
                .filter(Boolean) ?? [];
        }
    }

    override updated(changedProperties: Map<string, any>) {
        super.updated(changedProperties);
        if (changedProperties.has("component")) {
            this.updateChildrenComponents();

            // In editor mode, sync _editorOpen with the editorOpen input property
            if (!this.isViewMode) {
                const editorOpenValue = this.component?.input?.editorOpen?.value ?? false;
                if (this._editorOpen !== editorOpenValue) {
                    this._editorOpen = editorOpenValue;
                }
            }
        }
    }

    private setActiveSlot(slot: string | null) {
        $activeSlot.set(slot);
    }

    private renderTriggerSlot() {
        const mode = (this.resolvedInputs?.mode as 'options' | 'content') || 'options';

        if (this.isViewMode) {
            return this.triggerChildren.length
                ? renderComponent(
                    this.triggerChildren.map((c) => ({ ...c, item: this.item })),
                    this.item,
                    this.isViewMode
                )
                : html`<nr-button size="small">${this.resolvedInputs?.label ?? 'Dropdown'}</nr-button>`;
        }

        // Editor mode - only show placeholder in content mode
        if (this.triggerChildren.length) {
            return html`
                <div class="trigger-slot-wrapper">
                    ${renderComponent(
                        this.triggerChildren.map((c) => ({ ...c, item: this.item })),
                        this.item,
                        this.isViewMode,
                        { ...this.component, uniqueUUID: this.uniqueUUID }
                    )}
                </div>
            `;
        }

        // Show placeholder only in content mode, otherwise show default button
        if (mode === 'content') {
            return html`
                <div class="trigger-slot-wrapper">
                    <div
                        class="slot-placeholder ${$activeSlot.get() === 'trigger' ? 'active' : ''}"
                        @click="${(e: Event) => {
                            e.stopPropagation();
                            this.setActiveSlot('trigger');
                            setCurrentComponentIdAction(this.component?.uuid);
                        }}"
                    >
                        <nr-icon name="pointer"></nr-icon>
                        <span class="slot-label">Trigger</span>
                        <nr-label>Drop button here</nr-label>
                        <drag-wrapper
                            .where=${"inside"}
                            .message=${"Drop as trigger"}
                            .component=${{ ...this.component }}
                            .slot=${"trigger"}
                            .inputRef=${this.inputRef}
                            .isDragInitiator=${this.isDragInitiator}
                        ></drag-wrapper>
                    </div>
                </div>
            `;
        }

        // Options mode - show default button
        return html`<nr-button size="small">${this.resolvedInputs?.label ?? 'Dropdown'}</nr-button>`;
    }

    private renderContentSlot() {
        if (this.isViewMode) {
            return this.contentChildren.length
                ? renderComponent(
                    this.contentChildren.map((c) => ({ ...c, item: this.item })),
                    this.item,
                    this.isViewMode
                )
                : nothing;
        }

        // Editor mode - content slot (only used in content mode)
        return html`
            <div class="slot-container">
                ${this.contentChildren.length
                    ? renderComponent(
                        this.contentChildren.map((c) => ({ ...c, item: this.item })),
                        this.item,
                        this.isViewMode,
                        { ...this.component, uniqueUUID: this.uniqueUUID }
                    )
                    : html`
                        <div
                            class="slot-placeholder content-placeholder ${$activeSlot.get() === 'content' ? 'active' : ''}"
                            @click="${(e: Event) => {
                                e.stopPropagation();
                                this.setActiveSlot('content');
                                setCurrentComponentIdAction(this.component?.uuid);
                            }}"
                        >
                            <nr-icon name="layout-grid"></nr-icon>
                            <span class="slot-label">Dropdown Content</span>
                            <nr-label>Drop components here</nr-label>
                            <drag-wrapper
                                .where=${"inside"}
                                .message=${"Drop inside dropdown"}
                                .component=${{ ...this.component }}
                                .slot=${"content"}
                                .inputRef=${this.inputRef}
                                .isDragInitiator=${this.isDragInitiator}
                            ></drag-wrapper>
                        </div>
                    `}
            </div>
        `;
    }

    override renderComponent() {
        const options = this.resolvedInputs?.options ?? this.resolvedInputs?.value?.[0] ?? [];
        const size = (this.resolvedInputs?.size as 'small' | 'medium' | 'large') || 'medium';
        const placement = (this.resolvedInputs?.placement as 'bottom' | 'top' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'auto') || 'bottom';
        const trigger = (this.resolvedInputs?.trigger as 'click' | 'hover' | 'focus' | 'manual') || 'click';
        const animation = (this.resolvedInputs?.animation as 'none' | 'fade' | 'slide' | 'scale') || 'fade';

        // Mode: 'options' uses options array, 'content' uses slot for custom components
        const mode = (this.resolvedInputs?.mode ?? this.component?.input?.mode?.value) as 'options' | 'content' || 'options';
        const useContentSlot = mode === 'content';

        // In editor mode
        if (!this.isViewMode) {
            // Content mode in editor - show trigger and content slot when _editorOpen
            if (useContentSlot) {
                if (!this._editorOpen) {
                    return html`
                        <div ${ref(this.inputRef)} style=${styleMap({ ...this.getStyles() })}>
                            ${this.renderTriggerSlot()}
                        </div>
                    `;
                }

                return html`
                    <nr-dropdown
                        ${ref(this.inputRef)}
                        style=${styleMap({ ...this.getStyles() })}
                        .open=${true}
                        .trigger=${'manual'}
                        .placement=${placement}
                        .size=${size}
                        .animation=${animation}
                        .disabled=${this.resolvedInputs?.state == "disabled"}
                        .items=${[]}
                        .arrow=${this.resolvedInputs?.arrow || false}
                        .autoClose=${false}
                        .closeOnOutsideClick=${false}
                        .closeOnEscape=${false}
                        .offset=${this.resolvedInputs?.offset || 4}
                        .maxHeight=${this.resolvedInputs?.maxHeight || '300px'}
                        .minWidth=${this.resolvedInputs?.minWidth || 'auto'}
                    >
                        <span slot="trigger">
                            ${this.renderTriggerSlot()}
                        </span>
                        <div slot="content">
                            ${this.renderContentSlot()}
                        </div>
                    </nr-dropdown>
                `;
            }

            // Options mode in editor - just show trigger with options preview
            return html`
                <div ${ref(this.inputRef)} style=${styleMap({ ...this.getStyles() })}>
                    ${this.renderTriggerSlot()}
                </div>
            `;
        }

        // View mode - normal dropdown behavior
        return html`
            <nr-dropdown
                .open=${this.resolvedInputs?.show || false}
                ${ref(this.inputRef)}
                style=${styleMap({ ...this.getStyles() })}
                .trigger=${trigger}
                .placement=${placement}
                .size=${size}
                .animation=${animation}
                .disabled=${this.resolvedInputs?.state == "disabled"}
                .items=${useContentSlot ? [] : options}
                .arrow=${this.resolvedInputs?.arrow || false}
                .autoClose=${this.resolvedInputs?.autoClose !== false}
                .closeOnOutsideClick=${this.resolvedInputs?.closeOnOutsideClick !== false}
                .closeOnEscape=${this.resolvedInputs?.closeOnEscape !== false}
                .offset=${this.resolvedInputs?.offset || 4}
                .delay=${this.resolvedInputs?.delay || 50}
                .maxHeight=${this.resolvedInputs?.maxHeight || '300px'}
                .minWidth=${this.resolvedInputs?.minWidth || 'auto'}
                .cascadeDirection=${this.resolvedInputs?.cascadeDirection || 'auto'}
                .cascadeDelay=${this.resolvedInputs?.cascadeDelay || 50}
                .cascadeOnHover=${this.resolvedInputs?.cascadeOnHover !== false}
                @nr-dropdown-item-click=${(e: CustomEvent) => {
                    const item = e.detail.item;
                    this.executeEvent('onItemClick', e, {
                        value: item.value,
                        item: item,
                        additionalData: item.additionalData
                    });
                }}
                @nr-dropdown-open=${(e: CustomEvent) => {
                    this.executeEvent('onOpen', e);
                }}
                @nr-dropdown-close=${(e: CustomEvent) => {
                    this.executeEvent('onClose', e);
                }}
            >
                <span slot="trigger">
                    ${this.triggerChildren.length
                        ? renderComponent(this.triggerChildren.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode)
                        : html`<nr-button size="small">${this.resolvedInputs?.label ?? 'Dropdown'}</nr-button>`}
                </span>
                ${useContentSlot && this.contentChildren.length > 0 ? html`
                    <div slot="content">
                        ${renderComponent(this.contentChildren.map((c) => ({ ...c, item: this.item })), this.item, this.isViewMode)}
                    </div>
                ` : nothing}
            </nr-dropdown>
        `;
    }
}
