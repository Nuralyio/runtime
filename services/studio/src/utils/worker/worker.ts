import type { ComponentElement } from "$store/component/interface";
import type { ComponentStore } from "$store/component/component-sotre";

// Global Variables
let activated = false;
let verbose = false; // You might want to set this based on some condition or environment variable
let port: MessagePort | null = null;
const requestMap = new Map<number, { resolve: (value: any) => void; reject: (reason?: any) => void }>();
let requestIdCounter = 0;
const updatedAttributes: Record<string, any> = {};
const updatedParameters: Record<string, any> = {};

// Utility Functions
function generateRequestId(): number {
  return ++requestIdCounter;
}

function applicationArrayToObject(applications: any[]): Record<string, any> {
  return applications.reduce((application, item) => {
    application[item.uuid] = item;
    return application;
  }, {});
}

// Component Functions
const fillComponentChildren = (
  components: ComponentElement[],
  component: ComponentElement
): ComponentElement => {
  const componentMap = new Map(components.map(comp => [comp.uuid, comp]));
  const stack: ComponentElement[] = [component];

  while (stack.length > 0) {
    const currentComponent = stack.pop();

    if (!currentComponent.childrens) currentComponent.childrens = [];

    if (currentComponent.childrenIds) {
      currentComponent.childrens = currentComponent.childrenIds
        .map((componentChildId: string) => componentMap.get(componentChildId))
        .filter(Boolean) as ComponentElement[];

      stack.push(...currentComponent.childrens);
    }
  }

  return component;
};

const flattenedComponents = (componentsStore: ComponentStore): ComponentElement[] =>{
  if (verbose) {
    console.log(`%cflattenedComponents`, 'background: #D1D1D1; color: black; padding: 2px; border-radius: 3px;', componentsStore);
  }
  return Object.values(componentsStore).flat().filter(component => !component.parent)
};

// Self Functions
self.FontSize = 'sss';
self.Color = "color";
self.Value = "value";



self.updateStyle = function (component: ComponentElement, symbol: string, value: any) {
  if (verbose) {
    console.log(`%cupdateStyle`, 'background: #D1D1D1; color: black; padding: 2px; border-radius: 3px;', component, symbol, value);
  }
  if (!component.applicationId) {
    component.applicationId = component.application_id;
  }
  port?.postMessage({
    funtionNameToExecute: "updateStyle",
    component,
    eventData: { [symbol]: value }
  });
};


self.updateEvent = function (component: ComponentElement, symbol: string, value: any) {
  if (verbose) {
    console.log(`%cupdateEvent`, 'background: #D1D1D1; color: black; padding: 2px; border-radius: 3px;', component, symbol, value);
  }
  if (!component.applicationId) {
    component.applicationId = component.application_id;
  }
  port?.postMessage({
    funtionNameToExecute: "updateEvent",
    component,
    eventData: { [symbol]: value }
  });
};

self.updateInput = function (component: ComponentElement, inputName : string, handlerType, handlerValue: any) {
  if (verbose) {
    console.log(`%cupdateInput`, 'background: #D1D1D1; color: black; padding: 2px; border-radius: 3px;', component, symbol, value);
  }
  if (!component.applicationId) {
    component.applicationId = component.application_id;
  }
  port?.postMessage({
    funtionNameToExecute: "updateInput",
    component,
    eventData: { [inputName] : {
      type: handlerType,
      value: handlerValue
    }}
  });
};


self.AddPage = function (page: any, applicationId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = generateRequestId();

    // Store the resolve and reject functions in the map
    requestMap.set(requestId, { resolve, reject });

    // Send the message to the service worker
    port?.postMessage({
      funtionNameToExecute: "addPage",
      applicationId,
      eventData: { page },
      requestId
    });
  });
};

self.GetContextVar = function (symbol: string, customContentId: string | null, component: ComponentElement): any {
  var contentId = customContentId || component.applicationId; // Use customContentId if provided, otherwise use component.applicationId
  try {
    if (
      self.context &&
      self.context[contentId] &&
      self.context[contentId][symbol] &&
      'value' in self.context[contentId][symbol]
    ) {
      return self.context[contentId][symbol].value;
    } else {
      throw new Error("Variable not found or invalid structure.");
    }
  } catch (error) {
    return null;
  }
};

self.GetVar = function (symbol: string): any {
  if (verbose) {
    console.log(`%cGetVar:`, 'background: #D1D1D1; color: black; padding: 2px; border-radius: 3px;', symbol , "Current Content" , self.context);
  }
  try {
    if (
      self.context &&
      self.context["global"] &&
      self.context["global"][symbol] &&
      'value' in self.context["global"][symbol]
    ) {
      return self.context["global"][symbol].value;
    } else {
      throw new Error("Variable not found or invalid structure.");
    }
  } catch (error) {
    return null;
  }
};

self.SetVar = function (symbol: string, value: any, component: ComponentElement) {
  port?.postMessage({
    funtionNameToExecute: "SetVar",
    component,
    eventData: { [symbol]: value }
  });
};

self.SetContextVar = function (symbol: string, value: any, component: ComponentElement) {
  port?.postMessage({
    funtionNameToExecute: "SetContextVar",
    component,
    eventData: { [symbol]: value }
  });
};

self.GetComponent = function (componentUuid: string, applicationId: string): any {
  let _component = null;
  Object.keys(self.applications[applicationId]).forEach(key => {
    if (self.applications[applicationId][key].uuid === componentUuid) {
      _component = { ...self.applications[applicationId][key] };
    }
  });
  return _component;
};

self.GetComponents = function (componentIds: string[]): ComponentElement[] {
  return self.components.filter(c => componentIds.includes(c.uuid));
};

// Event Listener
self.addEventListener('message', event => {
  port = event.ports[0];

  if (!activated && port) {
    if (verbose) {
      console.log(`%cWorker : activated`, 'background: #4682B4; color: white; padding: 2px; border-radius: 3px;');
    }
    port.postMessage({ type: 'WORKER_READY' });
    activated = true;
  }

  const {
    data: {
      command, // executeFunction|executeValue|registerApplications
      codeToExecuteAsString, // code to execute
      components, // all current application components
      component, // component that running command
      extras = {}, // extra data like eventData object
      payload = {} // command payload
    }
  } = event;

  self.EventData = extras.EventData;
  self.Current = component;

  const { requestId, success, result } = event.data;
  if (requestId) {
    // Retrieve the resolve and reject functions from the map
    const { resolve, reject } = requestMap.get(requestId);

    if (success) {
      resolve(result);
    } else {
      reject(result);
    }

    // Remove the entry from the map
    requestMap.delete(requestId);
  }

  const startTime = performance.now();

  switch (command) {
    case "registerApplications":
      if (verbose) {
        console.log(`%cWorker : command : registerApplications`, 'background: #4682B4; color: white; padding: 2px; border-radius: 3px;', "Registering applications");
      }
      const { applications } = payload;
      if (applications) {
        applications.forEach(application => {
          self[application.name] = application;
          self[application.uuid] = application;
        });
      }
      self.applications = applicationArrayToObject(applications);
      break;

    case "registerContext":
      if (verbose) {
        console.log(`%cWorker : command : registerContext`, 'background: #4682B4; color: white; padding: 2px; border-radius: 3px;', "Registering context");
      }
      const { context } = payload;
      if (context) {
        if (!self.context) {
          self.context = {};
        }

        Object.keys(context).forEach(key => {
          self.context[key] = context[key];
        });
      }
      break;

    case "registerApplicationComponents":
      if (verbose) {
        console.log(`%cWorker : command : registerApplicationComponents`, 'background: #4682B4; color: white; padding: 2px; border-radius: 3px;', "Registering application components");
      }
      const { componentStore }: { componentStore: ComponentStore } = payload;
      const componentsFlattened = flattenedComponents(componentStore);
      const componentWithChildren = componentsFlattened.map(component => fillComponentChildren(componentsFlattened, component));

      if(verbose){
        console.log(`%c Worker: componentWithChildren`, 'background: #FF6347; color: white; padding: 2px; border-radius: 3px;', componentWithChildren);
      }

      if (componentWithChildren) {
        componentWithChildren.forEach(component => {
          const application_id = component.applicationId || component.application_id;
          if(!self[self[application_id].name]){
            self[self[application_id].name] = {};
          }
          self[self[application_id].name][component.uuid] = { ...component };
          console.log(self[self[application_id].name][component.uuid])

          if (component && application_id) {
            if (!self.applications[application_id]) {
              self.applications[application_id] = {}; // Ensure the applicationId exists
            }
            self.applications[application_id][component.name] = { ...component };
          } else {
            if (verbose) {
              console.log(`%cComponent or applicationId is undefined`, 'background: #FF6347; color: white; padding: 2px; border-radius: 3px;', component);
            }
          }
        });
      }
      break;
    case "executeFunction":
      if (verbose) {
        console.log(`%cWorker : command : executeFunction`, 'background: #4682B4; color: white; padding: 2px; border-radius: 3px;', "Executing function");
      }
      if (!codeToExecuteAsString) {
        if (verbose) {
          console.log(`%ccodeToExecuteAsString is not defined`, 'background: #FF6347; color: white; padding: 2px; border-radius: 3px;');
        }
        return;
      }
      try {
        const syncResponse = executeCode(codeToExecuteAsString);
        const application_id = component.applicationId || component.application_id;
        self[self[application_id].name][component.uuid] = { ...component, value:  syncResponse};

        console.log('-----')
        self[self[application_id].name][component.uuid] = { ...component, values:  {syncResponse : "aa"}};
        console.log(self[self[application_id].name][component.uuid])
        port?.postMessage({
          syncResponse,
          funtionNameToExecute: "syncResponse",
        });
      } catch (e) {
        port?.postMessage({
          error: e.message
        });
      }
      break;
    case "executeValue":
      if (verbose) {
        console.log(`%cWorker : command : executeValue`, 'background: #4682B4; color: white; padding: 2px; border-radius: 3px;', "Executing value");
      }
      try {
        const result = eval(codeToExecuteAsString);
        port?.postMessage({
          result,
          updatedAttributes,
          updatedParameters
        });

        // Clean up to prevent memory leaks
        Object.keys(updatedAttributes).forEach(key => delete updatedAttributes[key]);
        Object.keys(updatedParameters).forEach(key => delete updatedParameters[key]);

      } catch (e) {
        if (verbose) {
          console.error(`%cError executing value`, 'background: #FF6347; color: white; padding: 2px; border-radius: 3px;', e.stack, codeToExecuteAsString);
        }
        port?.postMessage({
          error: e.message
        });
      }
      break;
  }

  if (verbose) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`%cWorker : command : ${command} : Execution time :${duration.toFixed(2)} ms`, 'background: #90EE90; color: black; padding: 2px; border-radius: 3px;');
  }
});

// Code Execution Function
function executeCode(code: string): any {
  const result = eval(code + ' ;if(typeof main !=="undefined")  main()');
  return result;
}

// global.d.ts

interface CustomSelf extends Worker {
    [x: string]: (component: ComponentElement, symbol: string, value: any) => void;
    context: Record<string, any>;
    applications: Record<string, any>;
    components: ComponentElement[];
    FontSize: string;
    Color: string;
    Value: string;
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
