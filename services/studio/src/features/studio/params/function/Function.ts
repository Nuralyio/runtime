import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { LogPanel } from '../../panels/log-panel/LogPanel.ts';
import { updateFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/update-function-handler.ts';
import { setVar } from '../../../../features/runtime/redux/store/context.ts';
import { styleMap } from "lit/directives/style-map.js";
import { invokeFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/invoke-function-handler.ts';
import { ButtonTheme } from '../../core/utils/common-editor-theme.ts';
import { buildFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/build-function-handler.ts';
import { deployFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/deploy-function-handler.ts';
import { ExecuteInstance } from '../../../runtime/state/runtime-context';

/**
 * Debounce utility function
 */
function debounce<F extends (...args: any[]) => void>(func: F, wait: number): F {
  let timeout: number | undefined;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  } as F;
}

@customElement("function-page")
export class FunctionContent extends LitElement {
  @property({ type: Object })
  detail: { handler: string; uuid?: string } = { handler: "" };

  @query("log-panel")
  private logPanel!: LogPanel;

  @state()
  private payload: any = {};

  private readonly debounceDelay = 1000;
  private debouncedHandleCodeChange = debounce(this.handleCodeChange.bind(this), this.debounceDelay);

  static styles = css`
    :host {
      height: 100%;
      width: calc(100vw - 650px);
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }

    .content {
      flex: 1;
      overflow: auto;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .content code-editor {
      flex: 1;
      min-height: 0;
    }

    .buttons {
      margin-bottom: 4px;
      padding: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex-shrink: 0;
      align-items: center;
    }

    .buttons nr-button {
      margin-right: 0;
    }

    .buttons nr-dropdown {
      display: inline-flex;
    }

    log-panel {
      max-height: 200px;
      flex-shrink: 0;
    }
  `;

  /**
   * Handle action button clicks (Build, Deploy)
   */
  private async handleAction(action: "Build" | "Deploy") {
    this.logPanel.addLogEntry(`⚡ ${action} action triggered.`);
    setVar("global", "currentFunctionInvoke", true);

    try {
      switch (action) {
        case "Deploy":
          this.logPanel.addLogEntry("🚀 Deploying function ...");
          await deployFunctionHandler(this.detail.uuid);
          this.logPanel.addLogEntry("✅ Function deployed!");
          break;
        case "Build":
          this.logPanel.addLogEntry("🏗️ Building function ...");
          await buildFunctionHandler(this.detail.uuid);
          this.logPanel.addLogEntry("✅ Function built!");
          break;
      }
    } catch (error: any) {
      this.logPanel.addLogEntry(`❌ ${action} failed: ${error.message || error}`);
    }
  }

  /**
   * Handle code changes (debounced)
   */
  private async handleCodeChange(value: string) {
    const currentFunction = ExecuteInstance.Vars.studio_functions?.find(
      (item: any) => item.id === this.detail.uuid
    );

    if (!currentFunction) {
      this.logPanel.addLogEntry("🚨 Error: Function not found.");
      return;
    }

    currentFunction.handler = value;
    this.logPanel.addLogEntry("💾 Saving function ...");

    try {
      const result = await updateFunctionHandler(currentFunction);
      if (result.ok) {
        this.logPanel.addLogEntry("✅ Saved successfully.");
      } else {
        this.logPanel.addLogEntry("❌ Error saving function");
      }
    } catch (error: any) {
      console.error("Error saving function:", error);
      this.logPanel.addLogEntry(`❌ Error saving function: ${error.message || error}`);
    }
  }

  /**
   * Handle invoke function submission
   */
  private handleInvoke() {
    this.logPanel.addLogEntry("⚡ Invoking function ...");
    invokeFunctionHandler(this.detail.uuid, this.payload)
      .then(async (result) => {
        const text = await result.text();
        this.logPanel.addLogEntry(`✅ Result: ${text}`);
      })
      .catch((err) => {
        this.logPanel.addLogEntry(`❌ Error: ${err.message || err}`);
      });
  }

  /**
   * Handle payload editor changes
   */
  private handlePayloadChange(event: CustomEvent) {
    const { detail: { value } } = event;
    try {
      this.payload = JSON.parse(value);
    } catch {
      // Invalid JSON, keep previous payload
    }
  }

  override render() {
    return html`
      <div class="content">
        <div class="buttons">
          <nr-button
            style=${styleMap(ButtonTheme)}
            .iconPosition=${"right"}
            .icon=${["hammer"]}
            @click=${() => this.handleAction("Build")}>
            Build
          </nr-button>
          <nr-button
            style=${styleMap(ButtonTheme)}
            .iconPosition=${"right"}
            .icon=${["paper-plane"]}
            @click=${() => this.handleAction("Deploy")}>
            Deploy
          </nr-button>

          <nr-dropdown trigger="click" min-width="620px" max-height="400px">
            <nr-button
              slot="trigger"
              style=${styleMap(ButtonTheme)}
              .iconPosition=${"right"}
              .icon=${["drafting-compass"]}>
              Invoke
            </nr-button>
            <div slot="content" style="width: 600px; padding: 12px; background: #fff; border-radius: 4px;">
              <div style="margin-bottom: 8px; font-size: 13px; font-weight: 500; color: #333;">Payload (JSON)</div>
              <code-editor
                style="height: 200px; width: 100%; display: block; border: 1px solid #e0e0e0; border-radius: 4px;"
                theme="vs"
                @change=${this.handlePayloadChange}
                .code=${`{\n    "data": "Hello World"\n}`}
                language="json">
              </code-editor>
              <nr-button
                style=${styleMap({ ...ButtonTheme, "margin-top": "12px" })}
                .icon=${["bug"]}
                @click=${this.handleInvoke}>
                Submit
              </nr-button>
            </div>
          </nr-dropdown>
        </div>

        <code-editor
          theme="vs"
          @change=${(event: CustomEvent) => {
            const { detail: { value } } = event;
            this.debouncedHandleCodeChange(value);
          }}
          .code=${this.detail?.handler}
          language="javascript">
        </code-editor>
      </div>
      <log-panel></log-panel>
    `;
  }
}
