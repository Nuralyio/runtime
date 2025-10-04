// global.d.ts

interface CustomSelf extends Worker {
    context: Record<string, any>;
    applications: Record<string, any>;
    components: ComponentElement[];
    FontSize: string;
    Color: string;
    Value: string;
    SetStyle: (component: ComponentElement, symbol: string, value: any) => void;
    updateStyle: (component: ComponentElement, symbol: string, value: any) => void;
    AddPage: (page: any, applicationId: string) => Promise<any>;
    GetContextVar: (symbol: string, customContentId: string | null, component: ComponentElement) => any;
    GetVar: (symbol: string) => any;
    SetVar: (symbol: string, value: any, component: ComponentElement) => void;
    SetContextVar: (symbol: string, value: any, component: ComponentElement) => void;
    GetComponent: (componentUuid: string, applicationId: string) => any;
    GetComponents: (componentIds: string[]) => ComponentElement[];
    EventData: any;
    Current: ComponentElement;
  }
  
  declare var self: CustomSelf;

  interface Window {
    __FUNCTION_APP_UUID__?: string;
    __FUNCTION_PAGE_UUID__?: string;
    __FILES_APP_UUID__?: string;
    __FILES_PAGE_UUID__?: string;
    __MODULES_CONFIG__?: any;
    __URL__?: string;
  }

  // YAML module declarations
  declare module '*.yaml' {
    const content: any;
    export default content;
  }

  declare module '*.yml' {
    const content: any;
    export default content;
  }
  