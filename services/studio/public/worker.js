let activated = false;
let port = null;
const requestMap = new Map();
let requestIdCounter = 0;
const updatedAttriutes = {}; // Assuming you have this object somewhere in your actual code
const updatedParameters = {}; // Assuming you have this object somewhere in your actual code

function generateRequestId() {
    return ++requestIdCounter;
}

function appllicationArrayToObject(applications) {
    return applications.reduce((application, item) => {
        application[item.uuid] = item;
        return application;
    }, {});
}

self['FontSize'] = 'fontSize';
self['Color'] = "color";
self['Value'] = "value";

self['SetStyle'] = function (component, symbol, value) {
    if (!updatedAttriutes[component.uuid]) {
        updatedAttriutes[component.uuid] = {};
    }
    updatedAttriutes[component.uuid][symbol] = value;
};

self["updateStyle"] = function (component, symbol, value) {
    if (!component.applicationId) {
        component.applicationId = component.application_id;
    }
    port.postMessage({
        funtionNameToExecute: "updateStyle",
        component,
        eventData: { [symbol]: value }
    });
};

self["AddPage"] = function (page, applicationId) {
    return new Promise((resolve, reject) => {
        const requestId = generateRequestId();

        // Store the resolve and reject functions in the map
        requestMap.set(requestId, { resolve, reject });

        // Send the message to the service worker
        port.postMessage({
            funtionNameToExecute: "addPage",
            applicationId,
            eventData: { page },
            requestId
        });
    });
};

self["GetContextVar"] = function (symbol, customContentId, component) {
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

self["GetVar"] = function (symbol) {
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

self["SetVar"] = function (symbol, value, component) {
    port.postMessage({
        funtionNameToExecute: "SetVar",
        component,
        eventData: { [symbol]: value }
    });
};

self["SetContextVar"] = function (symbol, value, component) {
    port.postMessage({
        funtionNameToExecute: "SetContextVar",
        component,
        eventData: { [symbol]: value }
    });
};

self["GetComponent"] = function (componentUuid, applicationId) {
    let _component = null;
    Object.keys(self.applications[applicationId]).forEach(key => {
        if (self.applications[applicationId][key].uuid === componentUuid) {
            _component = { ...self.applications[applicationId][key] };
        }
    });
    return _component;
};

self["GetComponents"] = function (componentIds) {
    return self.components.filter(c => componentIds.includes(c.uuid));
};

self.addEventListener('message', event => {
    port = event.ports[0];

    if (!activated) {
        port.postMessage({ type: 'WORKER_READY' });
        activated = true;
        return
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

    self['EventData'] = extras.EventData;
    self["Current"] = component;

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

    switch (command) {
        case "registerApplications":
            const { applications } = payload;
            if (applications) {
                applications.forEach(application => {
                    self[application.name] = application;
                });
            }
            self["applications"] = appllicationArrayToObject(applications);
            break;

        case "registerContext":
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

        case "registerComponents":
            const { components } = payload;
            if (components) {
                components.forEach(component => {
                    const application_id = component.applicationId || component.application_id;
                    if (component && application_id) {
                        if (!self.applications[application_id]) {
                            self.applications[application_id] = {}; // Ensure the applicationId exists
                        }
                        self.applications[application_id][component.name] = { ...component };
                    } else {
                        console.error("Component or applicationId is undefined", component);
                    }
                });
            }
            break;
        case "executeFunction":
            if (!codeToExecuteAsString) {
                console.error('codeToExecuteAsString is not defined');
                return;
            }
            try {
                const syncResponse = executeCode(codeToExecuteAsString);
                port.postMessage({
                    syncResponse,
                    funtionNameToExecute: "syncResponse",
                });
            } catch (e) {
                port.postMessage({
                    error: e.message
                });
            }
            break;
        case "executeValue":
            try {
                const result = eval(codeToExecuteAsString);
                port.postMessage({
                    result,
                    updatedAttriutes,
                    updatedParameters
                });

                // Clean up to prevent memory leaks
                Object.keys(updatedAttriutes).forEach(key => delete updatedAttriutes[key]);
                Object.keys(updatedParameters).forEach(key => delete updatedParameters[key]);

            } catch (e) {
                port.postMessage({
                    error: e.message
                });
            }
            break;
    }
});

function executeCode(code) {
    const result = eval(code + ' ;if(typeof main !=="undefined")  main()');
    return result;
}