/**
 * Native Control Panel (Right Panel) Component
 *
 * Replaces the micro-app based control panel with a native Lit component.
 * Displays properties, styles, and handlers for the selected component.
 */

import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $editorState } from '@nuraly/runtime/redux/store';
import { getVar, setVar } from '@nuraly/runtime/redux/store/context';

// Component configuration mappings
const COMPONENT_CONFIGS: Record<string, {
  parameters: string[];
  handlers: string[];
  themes: string[];
}> = {
  text_label: {
    parameters: ['text_label_properties_collapse'],
    handlers: ['text_label_handler'],
    themes: ['text_label_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  text_input: {
    parameters: ['text_input_blocks'],
    handlers: ['studio_text_input_handler'],
    themes: ['text_input_icon_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  textarea: {
    parameters: ['textarea_blocks'],
    handlers: ['studio_textarea_handler'],
    themes: ['textarea_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  slider: {
    parameters: ['slider_blocks'],
    handlers: ['studio_slider_handler'],
    themes: ['slider_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  button_input: {
    parameters: ['button_blocks'],
    handlers: ['studio_button_handler'],
    themes: ['studio_button_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  checkbox: {
    parameters: ['checkbox_blocks'],
    handlers: ['studio_checkbox_handler'],
    themes: ['checkbox_button_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  image: {
    parameters: ['image_blocks'],
    handlers: ['studio_image_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  date_picker: {
    parameters: ['datepicker_block'],
    handlers: ['studio_datepicker_handler'],
    themes: ['studio_datepicker_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  select: {
    parameters: ['select_blocks'],
    handlers: ['studio_select_handler'],
    themes: ['studio_select_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  table: {
    parameters: ['table_blocks'],
    handlers: ['studio_table_handler'],
    themes: ['studio_table_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  icon: {
    parameters: ['icon_blocks'],
    handlers: ['studio_icon_handler'],
    themes: ['studio_icon_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  badge: {
    parameters: ['badge_blocks'],
    handlers: ['studio_badge_handler'],
    themes: ['badge_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  tag: {
    parameters: ['tag_blocks'],
    handlers: ['studio_tag_handler'],
    themes: ['tag_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  container: {
    parameters: ['container_blocks'],
    handlers: ['studio_container_handler'],
    themes: ['studio_container_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  card: {
    parameters: ['card_blocks'],
    handlers: ['studio_card_handler'],
    themes: ['card_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  collection: {
    parameters: ['collection_blocks'],
    handlers: ['studio_collection_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  ref_component: {
    parameters: ['ref_component_blocks'],
    handlers: ['studio_ref_component_handler'],
    themes: ['studio_ref_component_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  code: {
    parameters: ['code_blocks'],
    handlers: ['studio_code_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  rich_text: {
    parameters: ['rich_text_blocks'],
    handlers: ['studio_rich_text_handler'],
    themes: ['studio_rich_text_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  rich_text_editor: {
    parameters: ['rich_text_editor_blocks'],
    handlers: ['studio_rich_text_editor_handler'],
    themes: ['studio_rich_text_editor_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  menu: {
    parameters: ['menu_blocks'],
    handlers: ['studio_menu_handler'],
    themes: ['studio_menu_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  dropdown: {
    parameters: ['dropdown_blocks'],
    handlers: ['studio_dropdown_handler'],
    themes: ['studio_dropdown_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  embed_url: {
    parameters: ['embed_blocks'],
    handlers: ['studio_embed_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  link: {
    parameters: ['link_blocks'],
    handlers: ['studio_link_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  file_upload: {
    parameters: ['FileUpload_input_collapse_container'],
    handlers: ['studio_FileUpload_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  video: {
    parameters: ['video_blocks'],
    handlers: ['studio_video_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  document: {
    parameters: ['document_blocks'],
    handlers: ['studio_document_handler'],
    themes: ['border_manager_collapse', 'box_model_collapse']
  },
  grid_row: {
    parameters: ['grid_row_blocks'],
    handlers: ['studio_grid_row_handler'],
    themes: ['studio_grid_row_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  grid_col: {
    parameters: ['grid_col_blocks'],
    handlers: ['studio_grid_col_handler'],
    themes: ['studio_grid_col_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  form: {
    parameters: ['form_blocks'],
    handlers: ['studio_form_handler'],
    themes: ['form_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  modal: {
    parameters: ['modal_blocks'],
    handlers: ['studio_modal_handler'],
    themes: ['studio_modal_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  workflow_wrapper: {
    parameters: ['workflow_blocks'],
    handlers: ['studio_workflow_handler'],
    themes: ['studio_workflow_theme_container', 'border_manager_collapse', 'box_model_collapse']
  },
  chatbot_wrapper: {
    parameters: ['chatbot_blocks'],
    handlers: ['studio_chatbot_handler'],
    themes: ['studio_chatbot_theme_container', 'border_manager_collapse', 'box_model_collapse']
  }
};

@customElement("studio-control-panel")
export class StudioControlPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      background: var(--panel-bg, white);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --panel-bg: #1a1a1a;
        --text-color: #e0e0e0;
        --border-color: #3a3a3a;
      }
    }

    .panel-container {
      height: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-color, #666);
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }

    .empty-state nr-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    nr-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;
      --nuraly-spacing-tabs-content-padding-small: 0;
      --nuraly-border-width-tabs-content-top: 0px;
      --nuraly-border-width-tabs-top: 0px;
      --nuraly-border-width-tabs-right: 0px;
      --nuraly-border-width-tabs-bottom: 1px;
      --nuraly-border-width-tabs-left: 0px;
    }

    /* Micro-app styling overrides for compatibility during transition */
    micro-app {
      --nuraly-input-border-radius: 5px;
      --nuraly-input-border-bottom: 2px solid transparent;
      --nuraly-input-number-icons-container-width: 48px;
      --nuraly-input-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
      --nuraly-input-font-size: 12px;
      --nuraly-select-icon-width: 11px;
      --nuraly-select-border-radius: 5px;
      --nuraly-button-background-color: rgb(245, 245, 245);
      --nuraly-button-text-color: #535353;
      --nr-collapse-content-background-color: transparent;
    }

    @media (prefers-color-scheme: dark) {
      micro-app {
        --nuraly-input-border-bottom: 1px solid transparent;
        --nuraly-select-focus-border: 1px solid #ffffff;
        --nuraly-button-border-left: 1px solid #272626;
        --nuraly-button-border-right: 1px solid #272626;
        --nuraly-button-border-top: 1px solid #272626;
        --nuraly-button-border-bottom: 1px solid #272626;
        --nuraly-button-background-color: #494949;
        --nuraly-button-text-color: #ffffff;
        --nuraly-button-hover-background-color: #3b3b3b;
        --nr-collapse-border: 1px solid #a8a8a8;
        --nr-collapse-header-hover-background-color: #3a3a3a;
        --nr-collapse-header-collapsed-background-color: #3a3a3a;
        --nuraly-select-options-background-color: #0a0a0a;
      }
    }
  `;

  @state()
  private selectedComponent: any = null;

  @state()
  private currentTab: { type: string; id?: string } = { type: 'page' };

  @state()
  private currentPageId: string = '';

  @state()
  private activeTabIndex: number = 0;

  private unsubscribeEditor?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeEditor = $editorState.subscribe((state) => {
      this.currentTab = state.currentTab || { type: 'page' };

      // Get selected component from context
      const selectedComponents = getVar('global', 'selectedComponents')?.value || [];
      this.selectedComponent = selectedComponents[0] || null;

      // Get current page
      this.currentPageId = getVar('global', 'currentPage')?.value || '';
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEditor?.();
  }

  private getTabsConfig() {
    if (this.selectedComponent) {
      const config = COMPONENT_CONFIGS[this.selectedComponent.type];
      if (config) {
        return {
          parameters: [...config.parameters, 'translations_panel_block', 'access_control_panel_block'],
          handlers: config.handlers,
          themes: ['select_component_styles_state_container', ...config.themes]
        };
      }
    } else if (this.currentPageId) {
      return {
        parameters: ['page_info_container_block', 'access_control_panel_block'],
        handlers: [],
        themes: ['PageThemeStudio']
      };
    }
    return null;
  }

  private renderPropertyTabs() {
    const config = this.getTabsConfig();

    if (!config) {
      return html`
        <div class="empty-state">
          <nr-icon name="mouse-pointer"></nr-icon>
          <p>Select a component to view its properties</p>
        </div>
      `;
    }

    const tabs = [
      {
        label: 'Properties',
        icon: 'hammer',
        content: html`
          <component-property-panel
            .componentIds=${config.parameters}
            .component=${this.selectedComponent}
          ></component-property-panel>
        `
      },
      {
        label: 'Style',
        icon: 'paintbrush',
        content: html`
          <component-style-panel
            .componentIds=${config.themes}
            .component=${this.selectedComponent}
          ></component-style-panel>
        `
      },
      {
        label: 'Handlers',
        icon: 'git-compare',
        content: html`
          <component-handler-panel
            .componentIds=${config.handlers}
            .component=${this.selectedComponent}
          ></component-handler-panel>
        `
      }
    ];

    return html`
      <nr-tabs
        size="small"
        align="stretch"
        .activeTab=${this.activeTabIndex}
        .tabs=${tabs}
        @nr-tab-click=${(e: CustomEvent) => this.activeTabIndex = e.detail.index}
      ></nr-tabs>
    `;
  }

  private renderFunctionPanel() {
    return html`
      <function-properties-panel
        .functionId=${this.currentTab.id}
      ></function-properties-panel>
    `;
  }

  private renderFilesPanel() {
    return html`
      <files-properties-panel></files-properties-panel>
    `;
  }

  override render() {
    return html`
      <div class="panel-container">
        ${this.currentTab.type === 'page' ? this.renderPropertyTabs() : nothing}
        ${this.currentTab.type === 'function' ? this.renderFunctionPanel() : nothing}
        ${this.currentTab.type === 'files' ? this.renderFilesPanel() : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "studio-control-panel": StudioControlPanel;
  }
}
