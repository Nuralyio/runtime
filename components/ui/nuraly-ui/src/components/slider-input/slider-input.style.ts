import { css } from "lit";

export default css`
:host {
      --hy-slider-background: #7c7c7c;
      --hy-slider-height: 2px;
      --hy-slider-radius: var(--hy-slider-height);
      --hy-slider-value-color: #00ccff;
      --hy-slider-value-width: 0;
      --hy-slider-thumb-color: #e0e0e0;
      --hy-slider-thumb-diameter: 15px;
      --hy-slider-thumb-offset: 0;

      display: inline-block;
    }

    .range-container {
      position: relative;
      width: 100%;
    }

    .range-slider,
    .range-slider-value {
      border-radius: var(--hy-slider-radius);
      height: var(--hy-slider-height);
      max-height: var(--hy-slider-thumb-diameter);
      position: absolute;
      top: calc((var(--hy-slider-thumb-diameter) - min(var(--hy-slider-height), var(--hy-slider-thumb-diameter))) / 2);
    }

    .range-slider {
      background: var(--hy-slider-background);
      width: 100%;
    }

    .range-slider-value {
      background: var(--hy-slider-value-color);
      width: var(--hy-slider-value-width);
    }

    .range-thumb {
      background: var(--hy-slider-thumb-color);
      border-radius: 50%;
      height: var(--hy-slider-thumb-diameter);
      position: absolute;
      transform: translateX(var(--hy-slider-thumb-offset));
      width: var(--hy-slider-thumb-diameter);
    }

    input {
      display: inline-block;
      height: var(--hy-slider-thumb-diameter);
      margin: 0;
      opacity: 0;
      position: relative;
      width: 100%;
    }

    :host([disabled]) {
      --hy-slider-background: #d9d9d9;
      --hy-slider-value-color: #a8a8a8;
      --hy-slider-thumb-color: #f0f0f0;
    }

     @media (prefers-color-scheme: dark) {
        body {
           --hy-slider-background: #767676;
	      --hy-slider-height: 2px;
	      --hy-slider-radius: var(--hy-slider-height);
	      --hy-slider-value-color: #ff6200;
	      --hy-slider-value-width: 0;
	      --hy-slider-thumb-color: #adadad;
	      --hy-slider-thumb-diameter: 15px;
	      --hy-slider-thumb-offset: 0;
        }
      }
`;