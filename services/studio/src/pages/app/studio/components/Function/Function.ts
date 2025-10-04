import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement, type TemplateResult } from "lit";
import "@nuralyui/canvas";
import "../LogPanel/LogPanel.ts"; // Ensure the log-panel component is imported
import { LogPanel } from "../LogPanel/LogPanel.ts";
import { updateFunctionHandler } from "$store/handlers/functions/update-function-handler.ts";
import { getVar, setVar } from "$store/context.ts";
import { styleMap } from "lit/directives/style-map.js";
import { invokeFunctionHandler } from "$store/handlers/functions/invoke-function-handler.ts";
import { ButtonTheme } from "../../studio-microapp/core/utils/common-editor-theme.ts";
import { buildFunctionHandler } from "$store/handlers/functions/build-function-handler.ts";
import { deployFunctionHandler } from "$store/handlers/functions/deploy-function-handler.ts";
import { ExecuteInstance } from "core/Kernel.ts";
import "../../../../../shared/components/CodeEditor/CodeEditor.ts";

// debounce.ts
export function debounce<F extends (...args: any[]) => void>(func: F, wait: number): F {
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
  payload: string = {};

  // Debounce delay in milliseconds
  private debounceDelay = 1000;

  // Create a debounced version of handleCodeChange
  private debouncedHandleCodeChange = debounce(this.handleCodeChange.bind(this), this.debounceDelay);

  static styles = css`
      :host {
          height: 90vh;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
      }

      .content {
          flex: 1;
          overflow: auto;
          background: white;
      }

      .buttons {
        margin-bottom: 4px;
      }

      .buttons hy-button {
          margin-right: 8px;
      }

      /* Remove log-related styles as they are now in log-panel */
  `;

  /**
   * Handle button clicks to add log entries.
   * @param action The action performed.
   */
  private async handleAction(action: string) {
    // Exemple : Ajout d'une entrée de log en texte brut
    this.logPanel.addLogEntry(`⚡ ${action} action triggered.`);
    setVar("global", "currentFunctionInvoke", true);

    // Exemple : Ajout d'une entrée de log enrichie
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
      // default:
      //   this.logPanel.addLogEntry("⚠️ Unknown action.");
    }
}

  /**
   * Handle code changes to add log entries.
   * This method is debounced to prevent excessive calls.
   * @param value The new code value.
   */
  private async handleCodeChange(value: string) {
    (value)
    // Adding a rich HTML log entry with syntax highlighting or other features
    const richEntry: TemplateResult = html`<strong>Code updated:</strong> <code>${value}</code>`;
    const currentFunction = ExecuteInstance.Vars.studio_functions.find((item: any) => item.id === this.detail.uuid);

    if (currentFunction) {
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
        console.error("⚠️ Error saving function:", error);
        this.logPanel.addLogEntry(`❌ Error saving function: ${error.message || error}`);
      }
    } else {
      this.logPanel.addLogEntry("🚨 Error: Function not found.");
    }
  }

  override render() {
    return html`
      <div class="content">
        <div class="buttons">
          <hy-button
            style=${styleMap({
              ...ButtonTheme
            })
            }
            .iconPosition="${"right"}" .icon="${["hammer"]}" @click=${() => this.handleAction("Build")}>
            Build
          </hy-button>
          <hy-button
            style=${styleMap({
              ...ButtonTheme
            })
            }
            .iconPosition="${"right"}" .icon="${["paper-plane"]}" @click=${() => this.handleAction("Deploy")}>
            Deploy
          </hy-button>

          <hy-dropdown
            placeholder="Select an option"

            .template=${html`
              <div style="width: 600px;
    height: 310px;
    padding: 8px;
    background: #2d2d2d;
    border-radius: 4px;
padding-bottom: 50px;">

                <code-editor
                  theme="vs"
                  @change=${(event: CustomEvent) => {
                    const {
                      detail: { value }
                    } = event;
                    this.payload = JSON.parse(value);
                  }}
                  .code=${`
{
    "data": "Hello World"
}
          `}
                language="json"
                >
                </code-editor>
                <hy-button
                  style=${styleMap({
                    ...ButtonTheme,
                    "--hybrid-button-margin-y": "10px"
                  })}
                  .icon=${["bug"]}
                  @click=${() => {
                    window.dispatchEvent(new CustomEvent("add-log", { detail: { result: "invoking function ..." } }));
                    invokeFunctionHandler(getVar("global", "currentFunction").value.id, this.payload )
                      .then(async (result) => {
                        const _result = await result.text();
                        window.dispatchEvent(new CustomEvent("add-log", { detail: { result: _result } }));
                      });
                  }}>Submit
                </hy-button>
            `}>
            <hy-button
              style=${styleMap({
                ...ButtonTheme
              })
              }
              .iconPosition="${"right"}" .icon="${["drafting-compass"]}"
              @click=${() => this.handleAction("Invoke")}>
              Invoke
            </hy-button>
          </hy-dropdown>
        </div>
        <code-editor
          theme="vs"
          @change=${(event: CustomEvent) => {
            const {
              detail: { value }
            } = event;
            this.debouncedHandleCodeChange(value);
          }}
          .code=${this.detail?.handler}
          language="javascript"
        >
        </code-editor>
      </div>
      <log-panel></log-panel>
    `;
  }
}
