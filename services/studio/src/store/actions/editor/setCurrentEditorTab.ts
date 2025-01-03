import { $editorState } from "$store/apps.ts";

export function setCurrentEditorTab(tab: any) {
  $editorState.set({
    ...$editorState.get(),
    currentTab: tab
  });
}