import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
import { BaseElementBlock } from "@runtime/components/base/BaseElement.ts";
import { getVar } from "@shared/redux/store/context";
import { invokeFunctionHandler } from "@shared/redux/handlers/functions/invoke-function-handler";

@customElement("invoke-function-block")
export class InvokeFunctionBlock extends BaseElementBlock {

  static override styles = [
    css`
        :host{
            height: 200px;
        }
        .code-editor{
            margin-top:10px;
            width: 100%;
            height: 200px;
        }
        
    `
  ];
  override render() {
    return html`
      ${false  ? html`
        <nr-label>Payload</nr-label>
      <div class="code-editor">
        <code-editor
          theme="vs"
          @change=${(event: CustomEvent) => {
            const {
              detail: { value },
            } = event;
           // this.debouncedHandleCodeChange(value);
          }}
          .code=${`
{
  payload : {
    data: "Hello World"
  }
}
          `}
          language="javascript"
        >
        </code-editor>
        <br/>
        <nr-button .icon=${["bug"]} 
        @click=${()=>{
          window.dispatchEvent(new CustomEvent('add-log', {detail: {result:"invoking function ..." }}));
          invokeFunctionHandler(getVar('global','currentFunction').value.id, {payload: {data: "Hello World"}})
            .then(async (result)=>{
              const _result = await result.text() 
              window.dispatchEvent(new CustomEvent('add-log', {detail: {result:_result }}));
          })
        }}>Submit</nr-button>
      </div>` : html`
        <div style="padding :15px 5px; margin: 10px">
          <nr-label>Click Invoke to test the function with custom payload</nr-label>
        </div>
      `}
    `;
  }
}