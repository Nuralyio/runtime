import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "micro_app_selection_blocks",
    application_id: "1",
    name: "micro_app_selection_blocks",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: ["micro_app_selection_label", "micro_app_selection_select"]
  },
  {
    uuid: "micro_app_selection_label",
    name: "label image src",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Select Micro Application"
      }
    }
  },
  {
    uuid: "micro_app_selection_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label font family select",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 

                let options = [];
                let selectedMicroApplication;
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let appUUID = selectedComponent.input?.['appUUID'];
              
            return new Promise((resolve, reject)=>{
            fetch('/api/applications')
            .then(res=>res.json())
            .then(data=>{
                data.map((app)=>{
                    options.push({
                        label:app.name,
                        value:app.uuid
                    })
                })
                if(appUUID){
                    selectedMicroApplication = options.find((option)=> option.value == appUUID.value);   
                 }
                resolve([options,[selectedMicroApplication? selectedMicroApplication.label : ""]])
            })
            .catch(err=>{
                reject(err)
            })
            })
          
                `
      }
    },
    style: {
      display: "block",
      width: "350px"
    },
    event: {
      changed: /* js */ `

            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    const appUUIDValue = EventData.value?EventData.value:''
                    updateInput(selectedComponent, "appUUID", 'string',  appUUIDValue);
            
            
      `
    }
  }

];