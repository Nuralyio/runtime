import { css } from "lit";

const textLabelStyles= css`
label{
    color:var(--text-label-color);
    display:block;
    user-select: none
}

:host{
    --text-label-color:black;
    display: flex;
    width:fit-content
}

@media (prefers-color-scheme: dark) {
    :host { 
        --text-label-color:white;
      }
 }

`

export const styles =[textLabelStyles];