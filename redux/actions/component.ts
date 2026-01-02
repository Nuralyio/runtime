import { type ComponentElement } from "../store/component/component.interface";

const isServer = typeof window === "undefined";


export type UpdateType = "style" | "event" | "input" | "values" | "style_handlers" | "inputHandlers";

export let clipboardComponent: ComponentElement | null = null;

// Re-export all component actions from the component folder
export { addComponentAction } from './component/addComponentAction';
export { addComponentAsChildOf } from './component/addComponentAsChildOf';
export { addComponentToCurrentPageAction } from './component/addComponentToCurrentPageAction';
export { copyComponentAction } from './component/copyComponentAction';
export { deleteComponentAction } from './component/deleteComponentAction';
export { moveDraggedComponent } from './component/moveDraggedComponent';
export { moveDraggedComponentInside } from './component/moveDraggedComponentInside';
export { moveDraggedComponentIntoCurrentPageRoot } from './component/moveDraggedComponentIntoCurrentPageRoot';
export { setCurrentComponentIdAction } from './component/setCurrentComponentIdAction';
export { setDraggingComponentInfo } from './component/setDraggingComponentInfo';
export { setHoveredComponentAction } from './component/setHoveredComponentAction';
export { setHoveredComponentIdAction } from './component/setHoveredComponentIdAction';
export { updateComponentName } from './component/update-component-name';
export { updateComponentAttributes } from './component/updateComponentAttributes';

