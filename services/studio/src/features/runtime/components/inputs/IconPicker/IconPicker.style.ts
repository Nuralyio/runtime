import { css } from "lit";

const iconPickerStyles = css`
    
    .hello{
        height: 200px; overflow: auto; display: flex; background: #393939
    }
    :host {
        --icon-picker-input-container-border: 2px solid #d0d0d0;
        --icon-picker-icon-preview: #000000;
        --icon-picker-icon-text-color: #393939;
        --icon-picker-disabled-background-color: grey;
        --icon-picker-dropdown-background: #ffffff;
        --icon-picker-dropdown-border: 1px solid #d0d0d0;
        --icon-picker-icon-item-color: #000000;
        --icon-picker-icon-item-hover-background: #e0e0e0;
        --icon-picker-icon-item-selected-border: 1px solid #d0d0d0;
        --icon-picker-input-background-color: #ffffff;
        --hybrid-input-background-color: #f4f4f4;
        --hybrid-input-border-bottom : 2px solid #ddd;
    }

    @media (prefers-color-scheme: dark) {
        :host {
            --icon-picker-input-container-border: 2px solid #ddd;
            --icon-picker-icon-preview: #ffffff;
            --icon-picker-icon-text-color: #ffffff;
            --icon-picker-dropdown-background: #393939;
            --icon-picker-dropdown-border: 1px solid #ddd;
            --icon-picker-icon-item-color: #ffffff;
            --icon-picker-icon-item-hover-background: #4c4c4c;
            --icon-picker-icon-item-selected-border: 1px solid #ffffff;
            --icon-picker-input-background-color: #2d2d2d;
            --hybrid-input-background-color: #393939;
            --hybrid-input-border-bottom : 2px solid #ddd;
        }
    }

    .input-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
    }

    .icon-preview {
        font-size: 1.5rem;
    }

    .dropdown {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
        gap: 8px;
        padding: 10px;
        background-color: var(--icon-picker-dropdown-background);
        border: var(--icon-picker-dropdown-border);
        border-radius: 6px;
        max-height: 300px;
        overflow-y: auto;
    }

    .icon-item {
    
    }

    .icon-item:hover {
        background-color: var(--icon-picker-icon-item-hover-background);
    }

    .icon-item .selected {
        border: red;
    }

    hy-icon {
        --hybrid-icon-color: var(--icon-picker-icon-preview);
        font-size: 1.25rem;
    }

    .search-container {
        position: sticky;
        top: 0;
        background: var(--icon-picker-dropdown-background);
        padding: 10px 0;
        grid-column: 1 / -1;
        z-index: 1;
    }

    input {
        border: var(--icon-picker-input-container-border);
        width: 100%;
        max-width: 200px;
        background: var(--icon-picker-input-background-color);
        color: var(--icon-picker-icon-text-color);
        padding: 5px;
        border-radius: 5px;
        font-size: 14px;
    }

    input:focus {
        outline: none;
    }

    .disable {
        cursor: not-allowed;
    }
    .dropdown-icon{
        height: 300px;
    }
`;

export const styles = iconPickerStyles;