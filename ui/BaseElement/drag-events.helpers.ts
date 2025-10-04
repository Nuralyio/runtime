import { type ComponentElement } from "@shared/redux/store/component/interface";

/**
 * Helper function to handle drag events in component wrappers
 * 
 * @param ctx Context object containing component and event information
 */
export function handleDragEvent(ctx: {
  isViewMode: boolean;
  component: ComponentElement;
  shadowRoot: ShadowRoot | null;
  eventType: string;
}) {
  if (ctx.isViewMode) return;
  
  ctx.shadowRoot?.querySelectorAll('drag-wrapper')?.forEach(wrapper =>
    wrapper.dispatchEvent(new CustomEvent(ctx.eventType, { 
      bubbles: true, 
      composed: true 
    }))
  );
}

/**
 * Sets up all drag-related event handlers for a component
 * 
 * @param ctx Context with component and instance references
 * @returns Array of bound handler functions to be used for cleanup
 */
export function setupDragEventHandlers(ctx: {
  component: ComponentElement;
  isViewMode: boolean;
  instance: any;
}) {
  // Skip setting up handlers in view mode
  if (ctx.isViewMode) return [];
  
  // Define handlers using the component instance context
  const dragEnterHandler = () => {
    handleDragEvent({
      isViewMode: ctx.isViewMode,
      component: ctx.component,
      shadowRoot: ctx.instance.shadowRoot,
      eventType: "drag-over-component"
    });
  };
  
  const dropHandler = () => {
    handleDragEvent({
      isViewMode: ctx.isViewMode,
      component: ctx.component,
      shadowRoot: ctx.instance.shadowRoot,
      eventType: "drag-leave-component"
    });
  };
  
  const dragLeaveHandler = () => {
    handleDragEvent({
      isViewMode: ctx.isViewMode,
      component: ctx.component,
      shadowRoot: ctx.instance.shadowRoot,
      eventType: "drag-leave-component"
    });
  };
  
  return [
    { event: "dragenter", handler: dragEnterHandler },
    { event: "drop", handler: dropHandler },
    { event: "dragleave", handler: dragLeaveHandler }
  ];
}