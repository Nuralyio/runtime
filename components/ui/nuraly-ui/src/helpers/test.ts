export function getMiddleOfElement(element: HTMLElement) {
  const {x, y, width, height} = element.getBoundingClientRect();

  return {
    x: Math.floor(x + window.pageXOffset + width / 2),
    y: Math.floor(y + window.pageYOffset + height / 2),
  };
}
