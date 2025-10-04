import { css } from "lit";

const textLabelStyles = css`
label{
    color:var(--text-label-color);
    user-select: none
}

:host{
    display: flex;
    width:fit-content;
}

@media (prefers-color-scheme: dark) {
    :host { 
      }
 }

`;

export const styles = [textLabelStyles];