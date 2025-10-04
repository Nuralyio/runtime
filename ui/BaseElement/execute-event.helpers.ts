import { getNestedAttribute } from "@shared/utils/object.utils";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";

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
      executeCodeWithClosure(
        component,
        getNestedAttribute(component, `event.${eventName}`),
        { event, ...data },
        item
      );
    }
    return;
  }

  if (eventName === "onClick" && event) {
    onSelect?.(event);
  }
}