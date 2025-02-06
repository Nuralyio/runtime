class Editor {
    components: any = [];
    currentEditingApplication: any = {};
    currentComponent: any = null;
    selectedComponents : any = [];
    currentPlatform: any = {};

    getComponentStyle(component: any, attribute: string) {
        if (this.currentPlatform.platform !== "desktop") {
            return {...component?.style, ...component.breakpoints?.[this.currentPlatform.width]?.style}[attribute];
        } else {
            return component?.style?.[attribute];
        }
    }

    getComponentBreakpointStyle(component: any, attribute: string) {
        return component.breakpoints?.[this.currentPlatform.width].style?.[attribute];
    }
    getComponentBreakpointInput(component: any, attributeName: string) {
        if(this.currentPlatform.platform !== "desktop"){
            if(component?.input?.[attributeName]?.type === "handler"){
                return component?.input?.[attributeName];
            }else{
                return component.breakpoints?.[this.currentPlatform.width]?.input?.[attributeName] ?? component?.input?.[attributeName];
            }
        }else{
            return component?.input?.[attributeName];
        }
    }

}
const EditorInstance = new Editor();
export default EditorInstance;