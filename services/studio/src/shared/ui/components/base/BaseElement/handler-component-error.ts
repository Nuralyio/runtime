import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";

@customElement("handler-component-error-block")
export class HandlerComponentError extends LitElement {
    @property({type: Object})
    error: any;
    render(){
        return html`
            <div style="
            margin-top: 20px;
            position: absolute;
            z-index: 1001;
            background: white;
            padding: 5px;
            border-radius: 4px;
            font-weight: 400;
            font-size: 14px;
            color: #c33d3d;
            border-radius: 18px;
            border: 1px solid;
            font-size: 12px;
          ">
                <pre>${JSON.stringify(this.error, null, 2)}</pre>
            </div>
        `;
    }
}