import { css } from "lit";

export default css`
    label {
        color: var(--text-label-local-color, --text-label-color);
        display: block;
        user-select: none
    }

    :host {
        --text-label-color: var(--text-label-local-color, --text-label-color);
        display: flex;
        width: fit-content
    }

    @media (prefers-color-scheme: dark) {
        :host {
            --text-label-color: var(--text-label-local-dark-color, --text-label-dark-color);
        }
    }`

