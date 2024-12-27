//generate close tab to remove tab from editor state with index
import { $editorState } from "$store/apps.ts";

export function setCurrentEditorTab(tab: any) {
  $editorState.set({
    ...$editorState.get(),
    currentTab: tab
  });
}