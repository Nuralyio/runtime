import { css } from "lit";import { css } from "lit";



export default css`export  default css`

  :host {img{

    display: inline-block;    border-top-left-radius:var(--nuraly-image-border-top-left-radius,var(--nuraly-image-local-border-top-left-radius)) ;

    box-sizing: border-box;    border-top-right-radius: var(--nuraly-image-border-top-right-radius,var(--nuraly-image-local-border-top-right-radius));

  }    border-bottom-left-radius: var(--nuraly-image-border-bottom-left-radius,var(--nuraly-image-local-border-bottom-left-radius));

    border-bottom-right-radius: var(--nuraly-image-border-bottom-right-radius,var(--nuraly-image-local-border-bottom-right-radius));

  :host([block]) {}

    display: block;.image-container {

  }    position: relative;

  }

  .image-container {

    position: relative;  img {

    width: 100%;    display: block;

    height: 100%;    max-width: 100%;

  }  }



  img {  .preview-modal {

    display: block;    position: fixed;

    max-width: 100%;    top: 0;

    border-radius: var(--nuraly-image-border-radius, 4px);    left: 0;

    object-fit: var(--nuraly-image-fit, none);    right: 0;

  }    bottom: 0;

    display: flex;

  .image-container.image--error img {    align-items: center;

    opacity: 0.4;    justify-content: center;

  }    background-color: rgba(0, 0, 0, 0.7);

    z-index: 1000;

  .image--previewable img {    animation: fadeIn 0.3s ease;

    cursor: pointer;  }

    transition: transform 0.3s ease, opacity 0.3s ease;

  }  .preview-modal img {

    max-width: 90%;

  .image--previewable img:hover {    max-height: 90%;

    opacity: 0.9;    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    transform: scale(1.02);    border-radius: 4px;

  }    animation: zoomIn 0.3s ease;

  }

  /* Preview Modal */

  .preview-modal {  .preview-close {

    position: fixed;    position: absolute;

    top: 0;    top: 20px;

    left: 0;    right: 20px;

    right: 0;    width: 40px;

    bottom: 0;    height: 40px;

    display: flex;    background: rgba(255, 255, 255, 0.2);

    align-items: center;    border: none;

    justify-content: center;    border-radius: 50%;

    background-color: var(--nuraly-image-preview-bg, rgba(0, 0, 0, 0.8));    color: white;

    z-index: var(--nuraly-image-preview-zindex, 1000);    font-size: 24px;

    animation: fadeIn 0.3s ease;    display: flex;

  }    align-items: center;

    justify-content: center;

  .preview-modal img {    cursor: pointer;

    max-width: 90%;    outline: none;

    max-height: 90%;    transition: background-color 0.3s;

    box-shadow: var(--nuraly-image-preview-shadow, 0 4px 12px rgba(0, 0, 0, 0.3));  }

    border-radius: var(--nuraly-image-preview-border-radius, 4px);

    animation: zoomIn 0.3s ease;  .preview-close:hover {

  }    background: rgba(255, 255, 255, 0.4);

  }

  .preview-close {

    position: absolute;  @keyframes fadeIn {

    top: 20px;    from {

    right: 20px;      opacity: 0;

    width: 40px;    }

    height: 40px;    to {

    background: var(--nuraly-image-preview-close-bg, rgba(255, 255, 255, 0.2));      opacity: 1;

    border: none;    }

    border-radius: 50%;  }

    color: var(--nuraly-image-preview-close-color, white);

    font-size: 24px;  @keyframes zoomIn {

    line-height: 1;    from {

    cursor: pointer;      transform: scale(0.9);

    transition: background-color 0.3s ease;      opacity: 0;

    display: flex;    }

    align-items: center;    to {

    justify-content: center;      transform: scale(1);

    outline: none;      opacity: 1;

  }    }

  }

  .preview-close:hover {`
    background: var(--nuraly-image-preview-close-hover-bg, rgba(255, 255, 255, 0.3));
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes zoomIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Loading placeholder */
  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--nuraly-image-placeholder-bg, rgba(0, 0, 0, 0.04));
    color: var(--nuraly-image-placeholder-color, rgba(0, 0, 0, 0.25));
    min-height: 100px;
  }
`;
