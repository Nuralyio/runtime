import { html } from "lit";
import { ComponentRegistry } from "../runtime/utils/component-registry";
import { ComponentType } from "../runtime/redux/store/component/component.interface";

// Studio-only component imports
import "../runtime/components/ui/components/Event/EventValue/EventValue";
import "../runtime/components/ui/components/utility/Border/Border";
import "../runtime/components/ui/components/utility/BoxShadow/BoxShadow";
import "../runtime/components/ui/components/display/BoxModel/BoxModel";
import "../runtime/components/ui/components/inputs/IconPicker/IconPicker";
import "../runtime/components/ui/components/inputs/UsersDropdown/UsersDropdown";
import "../runtime/components/ui/components/inputs/InsertDropdown/InsertDropdown";
import "../runtime/components/ui/components/utility/Handlers/Handlers";
import "../runtime/components/ui/components/utility/Function/InvokeFunction";
import "../runtime/components/ui/components/utility/Export-Import/Export-Import";
import "../runtime/components/ui/components/utility/ValidationRules/ValidationRules";
import "../runtime/components/ui/components/utility/BorderManager/BorderManager";
import "../runtime/components/ui/components/utility/AccessRoles/AccessRoles";
import "../runtime/components/ui/components/utility/ShareModal/ShareModal";
import "../runtime/components/ui/components/utility/RevisionPanel/RevisionPanel";
import "../runtime/components/ui/components/studio/FunctionsPanel/FunctionsPanel";
import "../runtime/components/ui/components/wrappers/GenerikWrapper/GenerikWrapper";

export function registerStudioComponents(): void {
  ComponentRegistry.register({ type: ComponentType.Event, tagName: "parameter-event-handler" });
  ComponentRegistry.register({ type: ComponentType.BorderRadius, tagName: "attribute-border-value" });
  ComponentRegistry.register({ type: ComponentType.BoxModel, tagName: "box-model-display" });
  ComponentRegistry.register({ type: ComponentType.ShadowBox, tagName: "attribute-box-shadow-value" });
  ComponentRegistry.register({ type: ComponentType.IconPicker, tagName: "icon-picker-block" });
  ComponentRegistry.register({ type: ComponentType.UsersDropdown, tagName: "users-dropdown-block" });
  ComponentRegistry.register({ type: ComponentType.InsertDropdown, tagName: "insert-dropdown-block" });
  ComponentRegistry.register({ type: ComponentType.Handlers, tagName: "handler-block" });
  ComponentRegistry.register({ type: ComponentType.ExportImport, tagName: "export-import-block" });
  ComponentRegistry.register({ type: ComponentType.InvokeFunction, tagName: "invoke-function-block" });
  ComponentRegistry.register({ type: ComponentType.ValidationRules, tagName: "validation-rules-display" });
  ComponentRegistry.register({ type: ComponentType.BorderManager, tagName: "border-manager-display" });
  ComponentRegistry.register({ type: ComponentType.AccessRoles, tagName: "access-roles-display" });
  ComponentRegistry.register({ type: ComponentType.ShareModal, tagName: "share-modal" });
  ComponentRegistry.register({ type: ComponentType.RevisionPanel, tagName: "revision-panel" });
  ComponentRegistry.register({
    type: ComponentType.FunctionsPanel,
    tagName: "functions-panel",
    template: () => html`<functions-panel></functions-panel>`,
  });
}
