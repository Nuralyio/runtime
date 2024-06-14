import {css} from 'lit';
import {styleVariables} from './tooltips.variables';

const tooltipStyles = css`
  :host([show]) {
    background-color: var(--hybrid-tooltip-background-color);
    color: var(--hybrid-tooltip-text-color);
    position: fixed;
    padding: 5px;
    text-align: center;
    opacity: 0;
    border-radius: 4px;
    animation-name: show-animation;
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
  }

  @keyframes show-animation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  :host::after {
    content: '';
    height: 0;
    width: 0;
    position: absolute;
    border: 5px solid transparent;
  }
  :host(.top-position)::after {
    border-top-color: var(--hybrid-tooltip-background-color);
    top: 100%;
  }
  :host(.left-position)::after {
    border-left-color: var(--hybrid-tooltip-background-color);
    left: 100%;
  }

  :host(.right-position)::after {
    border-right-color: var(--hybrid-tooltip-background-color);
    right: 100%;
  }
  :host(.bottom-position)::after {
    border-bottom-color: var(--hybrid-tooltip-background-color);
    bottom: 100%;
  }
  :host(.alignement-center.top-position)::after,
  :host(.alignement-center.bottom-position)::after {
    right: 50%;
    transform: translate(50%);
  }

  :host(.alignement-start.top-position)::after,
  :host(.alignement-start.bottom-position)::after {
    left: 4%;
  }
  :host(.top-position.alignement-end)::after,
  :host(.alignement-end.bottom-position)::after {
    right: 4%;
  }

  :host(.alignement-center.left-position)::after,
  :host(.alignement-center.right-position)::after {
    top: 50%;
    transform: translate(0%, -50%);
  }

  :host(.alignement-start.left-position)::after,
  :host(.alignement-start.right-position)::after {
    top: 5px;
  }
  :host(.alignement-end.left-position)::after,
  :host(.alignement-end.right-position)::after {
    bottom: 5px;
  }
`;
export const styles = [tooltipStyles, styleVariables];
