import { css } from "lit";

export default css`
:host {
    /* Default color variables */
    --nr-divider-color: #e0e0e0; /* Default divider color */
    --nr-divider-local-dark-color: #4a4a4a; /* Dark mode divider color */
    --nr-divider-local-light-color: #e0e0e0; /* Light mode divider color */

    /* Thickness and spacing */
    --nr-divider-thickness: 1px; /* Default thickness */
    --nr-divider-margin: 8px; /* Default margin */

    /* Resolved variables */
    --nr-resolved-divider-color: var(--nr-divider-local-color, var(--nr-divider-color));
    --nr-resolved-divider-thickness: var(--nr-divider-thickness);
    --nr-resolved-divider-margin: var(--nr-divider-margin);

    display: block;
    width: 100%;
}

.divider {
    background-color: var(--nr-resolved-divider-color);
    margin: var(--nr-resolved-divider-margin) 0;
}

.horizontal {
    height: var(--nr-resolved-divider-thickness);
    width: 100%;
}

.vertical {
    width: var(--nr-resolved-divider-thickness);
    height: 100%;
}

@media (prefers-color-scheme: dark) {
    :host {
        --nr-resolved-divider-color: var(--nr-divider-local-dark-color, var(--nr-divider-color));
    }
}

@media (prefers-color-scheme: light) {
    :host {
        --nr-resolved-divider-color: var(--nr-divider-local-light-color, var(--nr-divider-color));
    }
}
`;