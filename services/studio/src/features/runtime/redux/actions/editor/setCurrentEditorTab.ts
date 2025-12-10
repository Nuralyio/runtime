import { $editorState } from '../../store/apps';

export function setCurrentEditorTab(tab: any) {
  $editorState.set({
    ...$editorState.get(),
    currentTab: tab
  });
}