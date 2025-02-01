class Editor {
    components: any = [];
    currentEditingApplication: any = {};
    currentComponent: any = null;
    selectedComponents : any = [];
    currentPlatform: any = {};

    getComponentStyle(component: any, attribute: string) {
        if (this.currentPlatform.platform !== "desktop") {
            return {...component?.style, ...component.breakpoints[this.currentPlatform.width]}[attribute];
        } else {
            return component?.style[attribute];
        }
    }
}

export default new Editor();