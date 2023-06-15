import {html} from 'lit';
import {NOTHING_STRING} from '../menu.constants';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const childrensArrow = (boundery: any, isSelected: boolean) => {
  return html` <hy-icon
    style="z-index:0"
    name="caret-${isSelected ? 'down' : 'right'}"
    class="has-childrens ${(boundery.right && 'carret-boundery-right') || NOTHING_STRING}"
  ></hy-icon>`;
};
