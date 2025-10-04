import { eventDispatcher } from "@shared/utils/change-detection";
import { isServer } from "@shared/utils/envirement";
import { ExecuteInstance } from "./Kernel";
import { $editorState } from "@shared/redux/store/apps";

class Editor {
  components: any[] = [];
  functions: any[] = [];
  currentEditingApplication: any = {};
  currentComponent: any = null;
  selectedComponents: any[] = [];
  currentPlatform: any = {};
  isPreviewMode: boolean = false;
  isEditorMode: boolean = false;
  Vars: any = {};
  currentSelection: any[] = []
  Tabs: any[] = [];

  constructor() {
    if (!isServer) {
      window.addEventListener("resize", this.handleResize);
    }
    eventDispatcher.on('Vars:currentPlatform', (data) => {
      this.currentPlatform = {...ExecuteInstance.Vars.currentPlatform};
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
      ExecuteInstance.VarsProxy.currentPlatform = { ...this.currentPlatform };
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
      this.log(log)
    },
    error: (log: any) => {
      this.log(log)
    },
    warn: (log: any) => {
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