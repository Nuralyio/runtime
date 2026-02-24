import { css } from 'lit';

const dropdownItemStyle = css`
    div {
        padding: var(--nuraly-dropdown-padding);
        cursor: pointer;
        background-color: var(--nuraly-dropdown-background-color);
        display: flex;
        align-items: center;
        color: var(--nuraly-dropdown-text-color);
        font-size: var(--nuraly-dropdown-font-size, var(--nuraly-dropdown-font-size-local)); /* Default value added */

    }
    nr-icon {
        display: flex;
    }
    :host(:not([disabled])) div:hover {
        background-color: var(--nuraly-dropdown-hovered-background-color);
        margin-left: -1px;
    }
    :host([disabled]) div {
        background-color: var(--nuraly-dropdown-disabled-background-color);
        cursor: not-allowed;
        color: var(--nuraly-dropdown-disabled-text-color);
    }

    :host(:not([icon])) .option-label {
        padding-left: var(--nuraly-dropdown-only-text-padding-left);
    }
    :host([icon]) .option-label {
        padding-left: var(--nuraly-dropdown-icon-and-text-padding-left);
    }
`;

export const styles = [dropdownItemStyle];