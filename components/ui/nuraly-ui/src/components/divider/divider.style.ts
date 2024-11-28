import { css } from "lit";

export default css`
:host {
    /* Default color variables */
    --hy-divider-color: #e0e0e0; /* Default divider color */
    --hy-divider-local-dark-color: #4a4a4a; /* Dark mode divider color */
    --hy-divider-local-light-color: #e0e0e0; /* Light mode divider color */

    /* Thickness and spacing */
    --hy-divider-thickness: 1px; /* Default thickness */
    --hy-divider-margin: 8px; /* Default margin */

    /* Resolved variables */
    --hy-resolved-divider-color: var(--hy-divider-local-color, var(--hy-divider-color));
    --hy-resolved-divider-thickness: var(--hy-divider-thickness);
    --hy-resolved-divider-margin: var(--hy-divider-margin);

    display: block;
    width: 100%;
}

.divider {
    background-color: var(--hy-resolved-divider-color);
    margin: var(--hy-resolved-divider-margin) 0;
}

.horizontal {
    height: var(--hy-resolved-divider-thickness);
    width: 100%;
}

.vertical {
    width: var(--hy-resolved-divider-thickness);
    height: 100%;
}

@media (prefers-color-scheme: dark) {
    :host {
        --hy-resolved-divider-color: var(--hy-divider-local-dark-color, var(--hy-divider-color));
    }
}

@media (prefers-color-scheme: light) {
    :host {
        --hy-resolved-divider-color: var(--hy-divider-local-light-color, var(--hy-divider-color));
    }
}
`;