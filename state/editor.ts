/**
 * @fileoverview Editor State Management
 * @module Runtime/State/Editor
 * 
 * @description
 * Manages editor-specific state and platform detection for the Nuraly Studio.
 * 
 * The Editor class provides:
 * - Platform detection (mobile, tablet, desktop)
 * - Breakpoint-aware style retrieval
 * - Component selection tracking
 * - Editor mode management (edit vs preview)
 * - Custom console for handler logging
 * - Tab management for editor UI
 * 
 * **Platform Detection:**
 * Automatically detects and updates platform based on window width:
 * - Mobile: ≤500px
 * - Tablet: 501-1024px
 * - Desktop: >1024px
 * 
 * **Responsive Styles:**
 * Components can have breakpoint-specific styles that override base styles
 * based on the current platform. The Editor provides methods to retrieve
 * the correct styles considering breakpoints.
 * 
 * **Editor vs Preview Mode:**
 * - Edit Mode: Platform locked, no auto-resize
 * - Preview Mode: Platform responsive, auto-resize on window resize
 * 
 * @example Basic Usage
 * ```typescript
 * import Editor from './editor';
 * 
 * // Check editor mode
 * if (Editor.getEditorMode()) {
 *   console.log('In editor');
 * }
 * 
 * // Get platform
 * const platform = Editor.getCurrentPlatform();
 * console.log(platform.platform); // "desktop", "tablet", or "mobile"
 * 
 * // Get component styles (with breakpoint consideration)
 * const styles = Editor.getComponentStyles(component);
 * ```
 * 
 * @example Platform-Aware Styles
 * ```typescript
 * // Component has base styles and breakpoint styles
 * const component = {
 *   style: { backgroundColor: 'blue', fontSize: '16px' },
 *   breakpoints: {
 *     '430px': { // Mobile
 *       style: { fontSize: '14px' }
 *     }
 *   }
 * };
 * 
 * // On mobile (width ≤500px):
 * Editor.updatePlatform(); // Sets platform to "mobile"
 * const fontSize = Editor.getComponentStyle(component, 'fontSize');
 * console.log(fontSize); // "14px" (breakpoint override)
 * 
 * // On desktop:
 * Editor.updatePlatform(); // Sets platform to "desktop"
 * const fontSize = Editor.getComponentStyle(component, 'fontSize');
 * console.log(fontSize); // "16px" (base style)
 * ```
 * 
 * @example Custom Console
 * ```typescript
 * // In handler code, console.log goes to Editor console:
 * Editor.Console.log({ message: 'Debug info', data: {...} });
 * Editor.Console.error({ message: 'Error occurred', error: err });
 * 
 * // These emit "kernel:log" events for the editor UI to display
 * ```
 * 
 * @see {@link ExecuteInstance} for runtime context
 * @see {@link RuntimeContext} for state management
 */

import { eventDispatcher } from '../utils/change-detection';
import { isServer } from '../utils/envirement';
import { $editorState } from '../redux/store/apps';

/**
 * @class Editor
 * @description Manages editor state, platform detection, and component selection
 * 
 * **Key Features:**
 * - Responsive platform detection with automatic updates
 * - Breakpoint-aware style retrieval for components
 * - Editor mode vs preview mode management
 * - Component selection state tracking
 * - Custom console for handler logging
 * - Dark mode detection
 * 
 * **Platform System:**
 * The platform is determined by window width and includes:
 * - `platform`: "mobile" | "tablet" | "desktop"
 * - `width`: Viewport width for the platform
 * - `height`: Viewport height (optional)
 * - `isMobile`: Boolean flag for mobile/tablet
 * 
 * **Breakpoint Resolution:**
 * When retrieving component styles:
 * 1. Get base styles from `component.style`
 * 2. Get breakpoint styles from `component.breakpoints[width]`
 * 3. Merge breakpoint styles over base styles
 * 4. Return merged result
 * 
 * @example Platform Detection
 * ```typescript
 * // Automatically updates on window resize (preview mode)
 * window.addEventListener('resize', () => {
 *   const platform = Editor.updatePlatform();
 *   console.log('Platform:', platform.platform);
 * });
 * ```
 */
class Editor {
  components: any[] = [];
  functions: any[] = [];
  currentEditingApplication: any = {};
  currentComponent: any = null;
  selectedComponents: any[] = [];
  currentPlatform: any = {};
  isPreviewMode: boolean = false;
  isEditorMode: boolean = false;
  /** Flag to prevent re-processing of inputs while editing a handler */
  isEditingHandler: boolean = false;
  Vars: any = {};
  currentSelection: any[] = []
  Tabs: any[] = [];

  /**
   * Lazy getter for ExecuteInstance to avoid circular dependency.
   * Uses dynamic import to load after module initialization.
   */
  private get ExecuteInstance() {
    return (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
  }

  constructor() {
    if (!isServer) {
      window.addEventListener("resize", this.handleResize);
    }
    eventDispatcher.on('Vars:currentPlatform', (data) => {
      if (this.ExecuteInstance?.Vars?.currentPlatform) {
        this.currentPlatform = {...this.ExecuteInstance.Vars.currentPlatform};
      }
    })
    $editorState.subscribe(() =>{
      this.Tabs = $editorState.get().tabs;
    })

  }

  private handleResize = () => {
    if (!this.isEditorMode) {
      this.updatePlatform();
    }
  };

  get isDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  public updatePlatform() {
    if(isServer) return;
    const width = window.innerWidth;
    let currentPlatform: any = {};

    // Simplified platform logic with clearer conditions
    if (width <= 500) {
      currentPlatform = createPlatform("mobile", "430px", "767px", true);
    } else if (width <= 1024) {
      currentPlatform = createPlatform("tablet", "1024px", "768px", true);
    } else {
      currentPlatform = createPlatform("desktop", "1366px", undefined, false);
    }

    // If platform has changed, update the state and trigger events
    if (currentPlatform.platform !== this.currentPlatform.platform) {
      this.currentPlatform = { ...currentPlatform };
      // Guard: ExecuteInstance may not be initialized yet during startup
      if (this.ExecuteInstance?.VarsProxy) {
        this.ExecuteInstance.VarsProxy.currentPlatform = { ...this.currentPlatform };
      }
      eventDispatcher.emit("component:refresh");
    }
    return currentPlatform
  }

  private static createPlatform(platform: string, width: string, height?: string, isMobile: boolean = false) {
    return { platform, width, height, isMobile };
  }

  setEditorMode(isEditorMode: boolean) {
    this.isEditorMode = isEditorMode;
    if (this.isEditorMode) {
      this.updatePlatform();
    }
  }

  getEditorMode() {
    return this.isEditorMode;
  }

  getComponentStyle(component: any, attribute: string) {
    if (this.currentPlatform.platform !== "desktop") {
      const breakpointStyle = component?.breakpoints?.[this.currentPlatform.width]?.style;
      return { ...component?.style, ...breakpointStyle }[attribute];
    } else {
      return component?.style?.[attribute];
    }
  }

  getComponentStyles(component: any) {
    if (this.currentPlatform.platform !== "desktop") {
      const breakpointStyle = component?.breakpoints?.[this.currentPlatform.width]?.style;
      return { ...component?.style, ...breakpointStyle };
    } else {
      return component?.style ?? {};
    }
  }

  /**
   * Get component style value for a specific attribute considering selected state and platform
   * @param component - The component object
   * @param attribute - The style attribute name
   * @returns The style value for the attribute
   */
  getComponentStyleForState(component: any, attribute: string) {
    const selectedState = this.ExecuteInstance.Vars.selected_component_style_state;
    let baseStyle = component?.style ?? {};
    
    // Apply platform/breakpoint styles
    if (this.currentPlatform.platform !== "desktop") {
      const breakpointStyle = component?.breakpoints?.[this.currentPlatform.width]?.style;
      baseStyle = { ...baseStyle, ...breakpointStyle };
    }
    
    // If a pseudo-state is selected and not default, check if the attribute exists in that state
    if (selectedState && selectedState !== "default") {
      const pseudoStateStyle = baseStyle[selectedState];
      if (pseudoStateStyle && typeof pseudoStateStyle === 'object' && attribute in pseudoStateStyle) {
        return pseudoStateStyle[attribute];
      }
    }
    
    // Return base value (excluding pseudo-state objects)
    const pseudoStates = [':hover', ':focus', ':active', ':disabled'];
    if (pseudoStates.includes(attribute)) {
      return baseStyle[attribute];
    }
    
    return baseStyle[attribute];
  }

  /**
   * Get all component styles considering selected state and platform
   * @param component - The component object
   * @returns Merged style object with pseudo-state styles applied if selected
   */
  getComponentStylesForState(component: any) {
    const selectedState = this.ExecuteInstance.Vars.selected_component_style_state;
    let baseStyle = component?.style ?? {};
    
    // Apply platform/breakpoint styles
    if (this.currentPlatform.platform !== "desktop") {
      const breakpointStyle = component?.breakpoints?.[this.currentPlatform.width]?.style;
      baseStyle = { ...baseStyle, ...breakpointStyle };
    }
    
    // If a pseudo-state is selected and not default, merge the pseudo-state styles
    if (selectedState && selectedState !== "default") {
      const pseudoStateStyle = baseStyle[selectedState];
      if (pseudoStateStyle && typeof pseudoStateStyle === 'object') {
        // Filter out pseudo-state keys from base
        const pseudoStates = [':hover', ':focus', ':active', ':disabled'];
        const regularStyles = Object.keys(baseStyle)
          .filter(key => !pseudoStates.includes(key))
          .reduce((obj, key) => {
            obj[key] = baseStyle[key];
            return obj;
          }, {});
        
        // Merge: base styles overridden by pseudo-state styles
        return { ...regularStyles, ...pseudoStateStyle };
      }
    }
    
    return baseStyle;
  }

  getCurrentPlatform() {
    return this.currentPlatform;
  }

  getComponentBreakpointStyle(component: any, attribute: string) {
    return component?.breakpoints?.[this.currentPlatform.width]?.style?.[attribute];
  }

  getComponentBreakpointInput(component: any, attributeName: string) {
    const baseInput = component?.input?.[attributeName];
    const breakpointInput = component?.breakpoints?.[this.currentPlatform.width]?.input?.[attributeName];
  
    if (baseInput?.type === "handler") {
      return baseInput;
    }
  
    return { ...baseInput, ...breakpointInput };
  }

  getComponentBreakpointInputs(component: any) {
    const baseInput = component?.input;
    const breakpointInput = component?.breakpoints?.[this.currentPlatform.width]?.input;
  
    if (baseInput?.type === "handler") {
      return baseInput;
    }
  
    return { ...baseInput, ...breakpointInput };
  }

  log(log){
    eventDispatcher.emit("kernel:log",log)
  }
  Console = {
    log: (log: any) => {
      console.log(log);
      this.log(log)
    },
    error: (log: any) => {
      console.error(log);
      this.log(log)
    },
    warn: (log: any) => {
      console.warn(log);
      this.log(log)
    },
    info: (log: any) => {
      this.log(log)
    },
    debug: (log: any) => {
      this.log(log)
    }
  }
  



}

const EditorInstance = new Editor();
export default EditorInstance;
const createPlatform = (platform: string, width: string, height?: string, isMobile: boolean = false)=> {
  return { platform, width, height, isMobile };
}

export const  getInitPlatform = () => {
  if(isServer) return;
  const width = window.innerWidth;
  let currentPlatform: any = {};

  // Simplified platform logic with clearer conditions
  if (width <= 500) {
    currentPlatform = createPlatform("mobile", "430px", "932px", true);
  } else if (width <= 1024) {
    currentPlatform = createPlatform("tablet", "1024px", "768px", true);
  } else {
    currentPlatform = createPlatform("desktop", "1366px", undefined, false);
  }

  // If platform has changed, update the state and trigger events
  return currentPlatform
}