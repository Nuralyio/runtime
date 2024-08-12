import {css} from 'lit';
import {styleVariables} from './icon.variables.js';

const iconStyles = css`
  .svg-icon {
    fill: var(--hybrid-icon-color);
    width: var(--hybrid-icon-width);
    height: var(--hybrid-icon-height);
  }
`;
export const styles = [iconStyles, styleVariables];
