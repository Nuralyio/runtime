import { getNestedAttribute } from "@shared/utils/object.utils";
import { executeHandler } from "@features/runtime/state/runtime-context";

export function handleComponentEvent({
  isViewMode,
  component,
  item,
  eventName,
  event,
  data,
  onSelect,
}: {
  isViewMode: boolean;
  component: any;
  item: any;
  eventName: string;
  event?: Event;
  data?: any;
  onSelect?: (e: Event) => void;
}) {

  if (isViewMode) {
    const code = component.event?.[eventName];
    if (code) {
      const EventData = {
        ...data,
        event
      };

      // Check if component belongs to a micro-app with isolated context
      if (component.__microAppContext) {
        const { runtimeContext } = component.__microAppContext;

        // Use micro-app's isolated handler executor
        try {
          // Get the handler executor from the micro-app
          const handlerCode = getNestedAttribute(component, `event.${eventName}`);
          const handlerExecutor = (runtimeContext as any).storeContext?.handlerExecutor;

          if (handlerExecutor) {
            handlerExecutor.executeHandler(handlerCode, component, EventData);
          } else {
            // Fallback: execute with global but this shouldn't happen
            console.warn('[MicroApp] Handler executor not found, using global context');
            executeHandler(component, handlerCode, EventData, item);
          }
        } catch (error) {
          console.error('[MicroApp] Handler execution error:', error);
        }
      } else {
        // Use global execution context for non-micro-app components
        executeHandler(
          component,
          getNestedAttribute(component, `event.${eventName}`),
          EventData,
          item
        );
      }
    } else {
    }
    return;
  }

  if (eventName === "onClick" && event) {
    onSelect?.(event);
  }
}