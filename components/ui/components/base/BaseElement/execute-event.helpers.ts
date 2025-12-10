import { getNestedAttribute } from '../../../../../utils/object.utils';
import { executeHandler } from '../../../../../state/runtime-context';

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

  if (true)  {//use isViewMode when integrating preview mode
    const code = component.event?.[eventName];
    if (code) {
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