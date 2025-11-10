import { getNestedAttribute } from "@shared/utils/object.utils";
import { executeHandler } from "@features/runtime/core/runtime-context";

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
      console.log('Executing event code:', eventName, code);
      
      // Create EventData object that matches the expected structure
      const EventData = {
        ...data,
        event
      };
      
      
      executeHandler(
        component,
        getNestedAttribute(component, `event.${eventName}`),
        EventData,
        item
      );
    } else {
    }
    return;
  }

  if (eventName === "onClick" && event) {
    onSelect?.(event);
  }
}