import { css } from "lit";

export default css`
    :host {
        /* Default color variables */
        --text-label-local-dark-color: white; /* Dark mode text color */
        --text-label-local-light-color: black; /* Light mode text color */

        /* Font size and related properties */
        --text-label-font-size: 13px; /* Default font size */
        --text-label-font-weight: normal; /* Default font weight */
        --text-label-line-height: 1.5; /* Default line height */

        /* Padding and margin */
        --text-label-padding: 0; /* Default padding */
        --text-label-margin: 0; /* Default margin */

        /* Use the local color variable first, then fallback to global or defined values */
        --resolved-text-label-color: var(--text-label-color, var( --text-label-local-color));
        --resolved-text-label-font-size: var(--text-label-font-size);
        --resolved-text-label-font-weight: var(--text-label-font-weight);
        --resolved-text-label-line-height: var(--text-label-line-height);
        --resolved-text-label-padding: var(--text-label-padding);
        --resolved-text-label-margin: var(--text-label-margin);

        display: inline-block;
        width: fit-content;
    }

    label {
        /* Apply resolved styles 
        color: var(--resolved-text-label-color);
        font-size: var(--resolved-text-label-font-size);
        font-weight: var(--resolved-text-label-font-weight);
        line-height: var(--resolved-text-label-line-height);
        padding: var(--resolved-text-label-padding);
        margin: var(--resolved-text-label-margin);
        display: block;
        user-select: none;*/
        font-size: var(--resolved-text-label-font-size);
        color: var(--resolved-text-label-color);
    }

    @media (prefers-color-scheme: dark) {
        :host {
            /* Update resolved color for dark mode */
            --resolved-text-label-color: var(--text-label-dark-color, var(--text-label-color, var(--text-label-local-dark-color)));        }
    }

    @media (prefers-color-scheme: light) {
        :host {
            --resolved-text-label-color: var(--text-label-color, var(--text-label-local-color));
            /* Optionally update color for light mode */
        }
    }
`;