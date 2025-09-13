import { css } from 'lit';

const carouselStyles = css`
  :host {
    position: relative;
  }

  .carousel {
    width: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  ::slotted(.carousel-item-hidden) {
    position: absolute;
    opacity: 0;
  }
  ::slotted(:not(.carousel-item-hidden)) {
    opacity: 1;
    transition: opacity 0.5s ease;
  }

  .controls {
    position: absolute;
    width: 100%;
    top: 50%;
    display: flex;
    justify-content: space-between;
  }
  .button-control {
    --nuraly-button-ghost-text-color: grey;
    --nuraly-button-ghost-active-border-color: transparent;
    --nuraly-button-ghost-hover-background-color: transparent;
    --nuraly-button-ghost-hover-border-color: transparent;
  }

  .dot {
    height: 8px;
    width: 8px;
    margin: 0 5px;
    background-color: var(--carousel-dot-background-color);
    display: inline-block;
    cursor: pointer;
    opacity: 0.4;
  }

  .dot.active {
    background-color: var(--carousel-dot-active-background-color);
    opacity: 0.9;
  }

  :host {
    --carousel-dot-background-color: #bebebe;
    --carousel-dot-active-background-color: gray;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --carousel-dot-background-color: gray;
      --carousel-dot-active-background-color: lightgray;
      .button-control {
        --nuraly-button-ghost-text-color: #ffffff;
      }
    }
  }
`;

export const styles = carouselStyles;
