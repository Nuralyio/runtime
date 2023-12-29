self.addEventListener('install', function (event) {

    // Activate right away
    self.skipWaiting();


});

self['FontSize'] = 'fontSize';
self['Color'] = "color";
self['Value'] = "value";


self.addEventListener('message', event => {

self['FetchData'] = (provider, table, mapper) => {
    if(!provider || !table){
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
                columns: ["username" , "email"],
            }),
        }).then(response => response.json()).then(data => {
            event.ports[0].postMessage({
                    result: mapper? mapper(data) : data,
                });
        });
    });
}
    const { data: { command, value, components, component } } = event;
    self['SetStyle'] = function (component, symbol, value) {
        if (!updatedAttriutes[component.uuid]) {
            updatedAttriutes[component.uuid] = {}
        }
        updatedAttriutes[component.uuid] = { [symbol]: value };
    }
    self["Current"] = component;

    self['SetValue'] = function (component, value, valaa) {
        if (!updatedAttriutes[component.uuid]) {
            updatedAttriutes[component.uuid] = {}
        }
        updatedAttriutes[component.uuid] = { value: value };
        return valaa;
    }



    /*components.forEach(_component => {  
        const parentComponent = components.find(c => c.childrenIds?.includes(_component.uuid));
        if (parentComponent) {
            _component.Parent = parentComponent;
            if (_component.uuid === component.uuid) {
                self["Parent"] = parentComponent;
            }
        }
    });
*/

    components.forEach(component => {
        self[component.name] = component;
    });
    const updatedAttriutes = {};

    switch (command) {
        case "executeFunction":
           

            try {

                event.ports[0].postMessage({
                    result: executeCode(value),
                    updatedAttriutes
                });
            } catch (e) {
                event.ports[0].postMessage({
                    error: e.message
                });
            }
           
            break;
        case "executeValue":
            event.ports[0].postMessage({
                result: executeCode(value ),
                updatedAttriutes
            });
            break;
    }
  
});


function executeCode(code) {
    const result = eval(code+ ' ;if(typeof main !=="undefined")  main()');
    return result;
}