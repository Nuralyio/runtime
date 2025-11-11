import { css } from "lit";

const iconPickerStyles = css`
    :host {
        --icon-picker-icon-preview: #000000;
        --icon-picker-dropdown-background: #ffffff;
        --icon-picker-icon-item-color: #000000;
        --icon-picker-icon-item-hover-background: #e0e0e0;
        --icon-picker-icon-item-selected-background: #d0e8ff;
        --icon-picker-icon-item-selected-border: 2px solid #1890ff;
    }

    @media (prefers-color-scheme: dark) {
        :host {
            --icon-picker-icon-preview: #ffffff;
            --icon-picker-dropdown-background: #393939;
            --icon-picker-icon-item-color: #ffffff;
            --icon-picker-icon-item-hover-background: #4c4c4c;
            --icon-picker-icon-item-selected-background: #1a4d7a;
            --icon-picker-icon-item-selected-border: 2px solid #40a9ff;
        }
    }

    .trigger-container {
        width: 100%;
    }

    .icon-preview {
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .icon-name {
        font-size: 0.875rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .placeholder {
        font-size: 0.875rem;
        opacity: 0.6;
    }

    .dropdown-icon {
        width: 280px;
        max-height: 320px;
        background: var(--icon-picker-dropdown-background);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .search-container {
        padding: 10px;
        background: var(--icon-picker-dropdown-background);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
        z-index: 10;
    }

    .icons-grid {
        flex: 1;
        min-height: 0;
        overflow: auto;
        display: flex;
        background: var(--icon-picker-dropdown-background);
        padding: 5px;
    }

    .icon-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        border: 2px solid transparent;
    }

    .icon-item:hover {
        background-color: var(--icon-picker-icon-item-hover-background);
    }

    .icon-item.selected {
        background-color: var(--icon-picker-icon-item-selected-background);
        border: var(--icon-picker-icon-item-selected-border);
    }

    .icon-item nr-icon {
        --nuraly-icon-color: var(--icon-picker-icon-item-color);
        font-size: 1.1rem;
    }

    nr-icon {
        --nuraly-icon-color: var(--icon-picker-icon-preview);
    }

    .disable {
        cursor: not-allowed;
        opacity: 0.6;
    }
`;

export const styles = iconPickerStyles;