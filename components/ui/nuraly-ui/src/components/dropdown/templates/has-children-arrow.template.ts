import {html} from 'lit';
import {NOTHING_STRING} from '../hy-dropdown.constants';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const childrensArrow = (boundery: any) => {
  return html` <hy-icon
    style="z-index:0"
    name="caret-right"
    class="has-childrens ${(boundery.right && 'carret-boundery-right') || NOTHING_STRING}"
  ></hy-icon>`;
};
