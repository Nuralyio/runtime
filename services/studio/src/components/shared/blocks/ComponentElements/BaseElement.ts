import { LitElement} from "lit";
import { property, state } from "lit/decorators.js";
import { executeHandler } from "core/helper";
import { $context } from "$store/context/store";
import { generateRandomId } from "utils/randomness";
import { getNestedAttribute } from "utils/object.utils";
import { type ComponentElement } from "$store/component/interface";

export class BaseElementBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  thisvalue: any;

  updateValue() :void {
    const eventId = generateRandomId();
    const handlerType: any = getNestedAttribute(this.component, "input.value");
    if (handlerType?.type === "handler") {
      executeHandler({
        eventId,
        component: this.component,
        type: "input.value",
        extras: {},
      });
      const handler = ({ detail: { data } }) => {
        document.removeEventListener(eventId, handler as any);
        this.thisvalue = data.result;
      }
      document.addEventListener(eventId, handler as any);
    }else{
        this.thisvalue = handlerType?.value;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this.updateValue();
    $context.subscribe((context) => {
      if (this.component) {
        this.updateValue();
      }
    });
  }

}
