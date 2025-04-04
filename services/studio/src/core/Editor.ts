import { eventDispatcher } from "@utils/change-detection";
import { isServer } from "utils/envirement";
import { ExecuteInstance } from "./Kernel";

class Editor {
  components: any[] = [];
  currentEditingApplication: any = {};
  currentComponent: any = null;
  selectedComponents: any[] = [];
  currentPlatform: any = {};
  isPreviewMode: boolean = false;
  isEditorMode: boolean = false;
  Vars: any = {};
  currentSelection : any[]  =[]

  constructor() {
    if (!isServer) {
      window.addEventListener("resize", this.handleResize);
    }
  }

  private handleResize = () => {
    if (this.isEditorMode) {
      this.updatePlatform();
    }
  };

  private updatePlatform() {
    const width = window.innerWidth;
    let currentPlatform :any= {};

    // Simplified platform logic with clearer conditions
    if (width <= 500) {
      currentPlatform = this.createPlatform("mobile", "375px", "767px", true);
    } else if (width <= 1024) {
      currentPlatform = this.createPlatform("tablet", "1024px", "768px", true);
    } else {
      currentPlatform = this.createPlatform("desktop", "100%", undefined, false);
    }

    // If platform has changed, update the state and trigger events
    if (currentPlatform.platform !== this.currentPlatform.platform) {
      this.currentPlatform = { ...currentPlatform };
      ExecuteInstance.VarsProxy.currentPlatform = { ...this.currentPlatform };
      eventDispatcher.emit("component:refresh");
    }
  }

  private createPlatform(platform: string, width: string, height?: string, isMobile: boolean = false) {
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
    if (this.currentPlatform.platform !== "desktop") {
      const input = component?.input?.[attributeName];
      if (input?.type === "handler") {
        return input;
      }
      return component?.breakpoints?.[this.currentPlatform.width]?.input?.[attributeName] ?? input;
    }
    return component?.input?.[attributeName];
  }
}

const EditorInstance = new Editor();
export default EditorInstance;