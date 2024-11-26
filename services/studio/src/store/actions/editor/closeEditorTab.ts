//generate close tab to remove tab from editor state with index
import { $editorState } from "$store/apps.ts";

export function closeEditorTab(tab: any) {
  $editorState.set({
    ...$editorState.get(),
    tabs: $editorState.get().tabs.filter((t: any) => t.id !== tab.id)
  });
}