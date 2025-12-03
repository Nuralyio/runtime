import { $editorState } from '../../store/apps';

export function openEditorTab(tab: any) {
  // check if tab is already open
  const isTabOpen = $editorState.get().tabs.find((t: any) => t.id === tab.id);
  if (!isTabOpen) {
    $editorState.set({
      ...$editorState.get(),
      tabs: [...$editorState.get().tabs, tab],
    });
  }
}