let activated = false;
const requestMap = new Map();

function appllicationArrayToObject(applications) {
    return applications.reduce((application, item) => {
        application[item.uuid] = item;
        return application;
    }, {});
}

self['FontSize'] = 'fontSize';
self['Color'] = "color";
self['Value'] = "value";

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (!activated) {
        event.ports[0].postMessage({ type: 'WORKER_READY' });
        activated = true;
    }
    const {
        data: {
            command /** executeFunction|executeFunction|registerApplications */,
            codeToExecuteAsString /* code to execute */,
            components /* all currentapplication components */,
            component /* component that running command*/,
            extras = {}/* extra data like eventData object */,
            payload = {} /* command payload */,
        }
    } = event;

    self['EventData'] = extras.EventData;
    self['FetchData'] = (provider, table, mapper) => {
        if (!provider || !table) {
            return;
        }
        fetch(`/api/providers/${provider}/table/${table}/columns`, {
            method: 'GET',
        }).then(response => response.json()).then(columns => {
            fetch(`/api/providers/${provider}/table/${table}/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    columns: ["username", "email"],
                }),
            }).then(response => response.json()).then(data => {
                event.ports[0].postMessage({
                    result: mapper ? mapper(data) : data,
                });
            });
        });
    };

    self['SetStyle'] = function (component, symbol, value) {
        if (!updatedAttriutes[component.uuid]) {
            updatedAttriutes[component.uuid] = {};
        }
        updatedAttriutes[component.uuid] = { [symbol]: value };
    };
    self["Current"] = component;

    self['SetValue'] = function (component, value, valaa) {
        if (!updatedParameters[component.uuid]) {
            updatedParameters[component.uuid] = {};
        }
        updatedParameters[component.uuid] = { value: value };
        return valaa;
    };

    const updatedAttriutes = {};
    const updatedParameters = {};

    self["updateStyle"] = function (component, symbol, value) {
        if (!component.applicationId) {
            component.applicationId = component.application_id;
        }
        event.ports[0].postMessage({
            funtionNameToExecute: "updateStyle",
            component,
            eventData: { [symbol]: value }
        });
    };

    let requestIdCounter = 0;

    function generateRequestId() {
        return ++requestIdCounter;
    }

    function AddPage(page, applicationId) {
        return new Promise((resolve, reject) => {
            const requestId = generateRequestId();

            // Store the resolve and reject functions in the map
            requestMap.set(requestId, { resolve, reject });
            console.log(requestMap, "requestMap");
            // Send the message to the service worker
            event.ports[0].postMessage({
                funtionNameToExecute: "addPage",
                applicationId,
                eventData: { page },
                requestId
            });
        });
    }

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

    self["AddPage"] = AddPage;

    self["GetContextVar"] = function (symbol, customContentId) {
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
    self["SetVar"] = function (symbol, value) {
        event.ports[0].postMessage({
            funtionNameToExecute: "SetVar",
            component,
            eventData: { [symbol]: value }
        });
    };

    self["SetContextVar"] = function (symbol, value) {
        event.ports[0].postMessage({
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
        return components.filter(c => componentIds.includes(c.uuid));
    };

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
                event.ports[0].postMessage({
                    syncResponse,
                    funtionNameToExecute: "syncResponse",
                });
            } catch (e) {
                event.ports[0].postMessage({
                    error: e.message
                });
            }
            break;
        case "executeValue":
            try {
                event.ports[0].postMessage({
                    result: eval(codeToExecuteAsString),
                    updatedAttriutes,
                    updatedParameters
                });
            } catch (e) {
                event.ports[0].postMessage({
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