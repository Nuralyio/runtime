/**
 * Editor Functions
 * 
 * Functions for interacting with the editor UI.
 */

import { openEditorTab, setCurrentEditorTab } from '../../redux/actions/editor';
import { traitCompoentFromSchema } from '../../utils/clipboard-utils';

export function createEditorFunctions() {
  return {
    /**
     * Opens an editor tab
     */
    openEditorTab,

    /**
     * Sets the current active editor tab
     */
    setCurrentEditorTab,

    /**
     * Creates components from schema text
     */
    TraitCompoentFromSchema: (text) => {
      traitCompoentFromSchema(text);
    },
  };
}
