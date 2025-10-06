import { css } from 'lit';

/**
 * Column component styles for the Grid system
 * Using shared CSS variables from /src/shared/themes/
 */
export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .nr-col {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    
    /* Theme-aware */
    color: var(--nuraly-color-text);
  }

  /* Column spans (1-24) - Apply flex to :host */
  :host([data-span="1"]) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
  :host([data-span="2"]) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
  :host([data-span="3"]) { flex: 0 0 12.5%; max-width: 12.5%; }
  :host([data-span="4"]) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
  :host([data-span="5"]) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
  :host([data-span="6"]) { flex: 0 0 25%; max-width: 25%; }
  :host([data-span="7"]) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
  :host([data-span="8"]) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
  :host([data-span="9"]) { flex: 0 0 37.5%; max-width: 37.5%; }
  :host([data-span="10"]) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
  :host([data-span="11"]) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
  :host([data-span="12"]) { flex: 0 0 50%; max-width: 50%; }
  :host([data-span="13"]) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
  :host([data-span="14"]) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
  :host([data-span="15"]) { flex: 0 0 62.5%; max-width: 62.5%; }
  :host([data-span="16"]) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
  :host([data-span="17"]) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
  :host([data-span="18"]) { flex: 0 0 75%; max-width: 75%; }
  :host([data-span="19"]) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
  :host([data-span="20"]) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
  :host([data-span="21"]) { flex: 0 0 87.5%; max-width: 87.5%; }
  :host([data-span="22"]) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
  :host([data-span="23"]) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
  :host([data-span="24"]) { flex: 0 0 100%; max-width: 100%; }

  /* Column offsets (0-24) - Apply to :host */
  :host([data-offset="0"]) { margin-left: 0; }
  :host([data-offset="1"]) { margin-left: 4.16666667%; }
  :host([data-offset="2"]) { margin-left: 8.33333333%; }
  :host([data-offset="3"]) { margin-left: 12.5%; }
  :host([data-offset="4"]) { margin-left: 16.66666667%; }
  :host([data-offset="5"]) { margin-left: 20.83333333%; }
  :host([data-offset="6"]) { margin-left: 25%; }
  :host([data-offset="7"]) { margin-left: 29.16666667%; }
  :host([data-offset="8"]) { margin-left: 33.33333333%; }
  :host([data-offset="9"]) { margin-left: 37.5%; }
  :host([data-offset="10"]) { margin-left: 41.66666667%; }
  :host([data-offset="11"]) { margin-left: 45.83333333%; }
  :host([data-offset="12"]) { margin-left: 50%; }
  :host([data-offset="13"]) { margin-left: 54.16666667%; }
  :host([data-offset="14"]) { margin-left: 58.33333333%; }
  :host([data-offset="15"]) { margin-left: 62.5%; }
  :host([data-offset="16"]) { margin-left: 66.66666667%; }
  :host([data-offset="17"]) { margin-left: 70.83333333%; }
  :host([data-offset="18"]) { margin-left: 75%; }
  :host([data-offset="19"]) { margin-left: 79.16666667%; }
  :host([data-offset="20"]) { margin-left: 83.33333333%; }
  :host([data-offset="21"]) { margin-left: 87.5%; }
  :host([data-offset="22"]) { margin-left: 91.66666667%; }
  :host([data-offset="23"]) { margin-left: 95.83333333%; }

  /* Order - Apply to :host */
  :host([data-order="1"]) { order: 1; }
  :host([data-order="2"]) { order: 2; }
  :host([data-order="3"]) { order: 3; }
  :host([data-order="4"]) { order: 4; }
  :host([data-order="5"]) { order: 5; }
  :host([data-order="6"]) { order: 6; }
  :host([data-order="7"]) { order: 7; }
  :host([data-order="8"]) { order: 8; }
  :host([data-order="9"]) { order: 9; }
  :host([data-order="10"]) { order: 10; }

  /* Pull (right positioning) - Apply to :host */
  :host([data-pull="0"]) { right: auto; }
  :host([data-pull="1"]) { right: 4.16666667%; }
  :host([data-pull="2"]) { right: 8.33333333%; }
  :host([data-pull="3"]) { right: 12.5%; }
  :host([data-pull="4"]) { right: 16.66666667%; }
  :host([data-pull="5"]) { right: 20.83333333%; }
  :host([data-pull="6"]) { right: 25%; }
  :host([data-pull="7"]) { right: 29.16666667%; }
  :host([data-pull="8"]) { right: 33.33333333%; }
  :host([data-pull="9"]) { right: 37.5%; }
  :host([data-pull="10"]) { right: 41.66666667%; }
  :host([data-pull="11"]) { right: 45.83333333%; }
  :host([data-pull="12"]) { right: 50%; }

  /* Push (left positioning) - Apply to :host */
  :host([data-push="0"]) { left: auto; }
  :host([data-push="1"]) { left: 4.16666667%; }
  :host([data-push="2"]) { left: 8.33333333%; }
  :host([data-push="3"]) { left: 12.5%; }
  :host([data-push="4"]) { left: 16.66666667%; }
  :host([data-push="5"]) { left: 20.83333333%; }
  :host([data-push="6"]) { left: 25%; }
  :host([data-push="7"]) { left: 29.16666667%; }
  :host([data-push="8"]) { left: 33.33333333%; }
  :host([data-push="9"]) { left: 37.5%; }
  :host([data-push="10"]) { left: 41.66666667%; }
  :host([data-push="11"]) { left: 45.83333333%; }
  :host([data-push="12"]) { left: 50%; }
`;
