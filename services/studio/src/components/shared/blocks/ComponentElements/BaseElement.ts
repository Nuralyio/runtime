import { LitElement } from "lit";
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
  inputHandlersValue: any = {};

  @state()
  thisvalue: any;

  @state()
  callbacks: any = {};

  registerCallback(inputName: string, callback: any) {
    this.callbacks[inputName] = callback;
  }

  async traitInputHandler(input: any, inputName: string): Promise<void> {
    if (input?.type === "handler") {
      const eventId = generateRandomId();
      return new Promise((resolve) => {
        const handler = ({ detail: { data } }) => {
          document.removeEventListener(eventId, handler as any);
          this.thisvalue = data.result;
          this.inputHandlersValue[inputName] = data.result;
          if (this?.callbacks[inputName]) {
            this.callbacks[inputName](data.result);
          }
          resolve();
        };
        document.addEventListener(eventId, handler as any);
        executeHandler({
          eventId,
          component: this.component,
          type: `input.${inputName}`,
          extras: {},
        });
      });
    }
  }

  async traitInputsHandlers() {
    const handlerPromises = [];
    for (const [inputName, input] of Object.entries(this.component.input)) {
      handlerPromises.push(this.traitInputHandler(input, inputName));
    }
    await Promise.all(handlerPromises);
  }

  override async connectedCallback() {
    super.connectedCallback();
    $context.subscribe(async (context) => {
      if (this.component) {
        await this.traitInputsHandlers();
      }
    });
  }
}