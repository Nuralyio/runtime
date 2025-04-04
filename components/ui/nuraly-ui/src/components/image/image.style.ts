import { css } from "lit";

export  default css`
img{
    border-top-left-radius:var(--hybrid-image-border-top-left-radius,var(--hybrid-image-local-border-top-left-radius)) ;
    border-top-right-radius: var(--hybrid-image-border-top-right-radius,var(--hybrid-image-local-border-top-right-radius));
    border-bottom-left-radius: var(--hybrid-image-border-bottom-left-radius,var(--hybrid-image-local-border-bottom-left-radius));
    border-bottom-right-radius: var(--hybrid-image-border-bottom-right-radius,var(--hybrid-image-local-border-bottom-right-radius));
}
`