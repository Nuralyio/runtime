import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { $componentsByUUIDs, $selectedComponent } from "@shared/redux/store/component/store.ts";
import { $currentApplication } from "@shared/redux/store/apps.ts";

@customElement("export-import-block")
export class ExportImportBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  exportCode: string = "";

  handleCodeChange(type: string, event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    console.log(`${type} code changed:`, value);
  }

  copyToClipboard(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      console.log("Content copied to clipboard:", content);
    });
  }

  downloadContent(content: string, fileName: string) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  override async firstUpdated(): Promise<void> {}

  renderDropdown(templateContent: string, buttonLabel: string, type: string) {
    const isExport = type === "export";
    return html`
      <hy-dropdown
        .template=${html`
          <div style="width: 700px; padding: 8px; background: #2d2d2d; border-radius: 4px; height: 300px; resize: both">
            <code-editor
              theme="vs"
              @change=${(event: CustomEvent) => this.handleCodeChange(type, event)}
              .code=${templateContent}
              language="json"
            ></code-editor>
            <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: flex-end;">
              ${isExport
      ? html`
                    <hy-button @click=${() => this.copyToClipboard(templateContent)}>Copy</hy-button>
                    <hy-button
                      @click=${() => this.downloadContent(templateContent, "exported-data.json")}
                    >
                      Download
                    </hy-button>
                  `
      : nothing}
              ${isExport ? nothing : html` <hy-button @click=${() => console.log(`${type} confirmed`)}>
                Confirm Import
              </hy-button>`}
             
            </div>
          </div>
        `}
      >
        <hy-button @click=${() => {
      $selectedComponent($currentApplication.get().uuid).subscribe((component) => {

        const uuidSet = new Set<string>();

        const collectUUIDs = (comp: ComponentElement): void => {
          if(comp){
            const { uuid, childrens } = comp;
            if (uuid) uuidSet.add(uuid);
            if (childrens) childrens.forEach((child: ComponentElement) => collectUUIDs(child));
          }
        };

        collectUUIDs(component);

        let components = $componentsByUUIDs($currentApplication.get().uuid, Array.from(uuidSet)).get();
        components = components.map((component) => {
          delete component.childrens;
          return component;
        });

        this.exportCode = JSON.stringify(components, null, 2);
        console.log("Exported UUIDs as JSON:", this.exportCode);
      });
    }}>
          ${buttonLabel}
        </hy-button>
      </hy-dropdown>
    `;
  }

  render() {
    const exportCode = `
{
  "exportedData": {
    "info": "Sample Export Data"
  }
}`;
    const importCode = `
{
  "importedData": {
    "info": "Sample Import Data"
  }
}`;

    return html`
      ${this.renderDropdown(this.exportCode, "Export", "export")}
      ${this.renderDropdown(importCode, "Import", "import")}
    `;
  }
}