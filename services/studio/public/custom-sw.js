self.addEventListener('install', function (event) {

	// Activate right away
	self.skipWaiting();


});

self['FontSize'] = Symbol("style.fontSize");

self.addEventListener('message', event => {
    const {data:{command,value,components}} =event;
    switch (command) {

        case "executeFunction":
       const updatedAttriutes ={};
       self['SetStyle'] =  function( component, symbol, value){
        if(!updatedAttriutes[component.id]){
            updatedAttriutes[component.id] = {}
        }
        updatedAttriutes[component.id] ={'fontSize' :value};
       }

            components.forEach(component => {
                self[component.name]= component;
            });
            try{
                event.ports[0].postMessage({
                    result:executeCode(value),
                    updatedAttriutes
                });
                console.log(updatedAttriutes)
            }catch(e){
                event.ports[0].postMessage({
                    error:e.message
                });
            }
           
        break
    }
  
});


function executeCode(code ){
    const result =  eval(code);
    console.log("result",result)
    return result;
}