import {css} from 'lit';

const dropdwonStyle = css`
  .dropdown {
    position: relative;
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  }

  .dropdown-content {
    transition: transform 0.3s ease;

    display: none;
    position: absolute;
    min-width: 160px;
    z-index: 1;
    opacity: 0;
    transform: scale(0.8); /* Initial scale value */
    transform-origin: top center; /* Adjust the transform origin as needed */
    box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.08), 0 3px 3px -4px rgba(0, 0, 0, 0.12), 0 9px 9px 4px rgba(0, 0, 0, 0.05);

    background-color: #fff;
    background-clip: padding-box;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    transition: opacity 0.3s ease-in-out, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Transition for opacity and transform */
    transition: all 1s linear;
  }

  .dropdown-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .dropdown-content ul li {
    padding: 12px 16px;
    cursor: pointer;
  }

  .nested {
    display: none;
    position: absolute;
    left: 100%;
    width: 100%;
    top: 0;
  }
  .block {
    margin: 0px 3px;
    box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.08), 0 3px 3px -4px rgba(0, 0, 0, 0.12), 0 9px 9px 4px rgba(0, 0, 0, 0.05);
  }
  .dropdown-content ul li:hover {
    background-color: #ddd;
  }
  .dropdown-content ul li:hover > .nested {
    display: block;
  }

  .dropdown-content.show {
    display: block;
    opacity: 1;
    transform: scale(1); /* Scale to 1 to show the content */
  }

  .selected {
    background-color: #ddd;
  }
  .has-childrens {
    color: #444444;
    margin-left: 6px;
    float: right;
  }
`;
export const styles = [dropdwonStyle];
