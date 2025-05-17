import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export const StudioDocumentSrcInput = [
  {
    uuid: "document_src_text_block",
    application_id: "1",
    name: "image src text block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["src_input_block", "src_handler_block"]
  },
  {
    uuid: "src_input_block",
    application_id: "1",
    name: "src block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["label_document_src" ]
  },
  {
    uuid: "label_document_src",
    name: "label image src",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value:'Src'
      }
    }
  },
  {
    uuid: "label_document_src_file",
    name: "label image src",
    component_type: ComponentType.FileUpload,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
    },
    input: {
      value: {
        type: "string",
        value:'Src'
      }
    },
    event:{
      onFilesChanged :/* js */ `
      (async () => {
        const {files} = EventData;
        const uploadedFile = await FileStorage.upload({ files });
        const url = "/api/v1/storage/preview/" + uploadedFile.path;
        const selectedComponent = Utils.first(Vars.selectedComponents);
        updateInput(selectedComponent,'src','string',url);
      })();
      `
    }
  },
  {
    uuid: "src_text_input",
    name: "src text input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange:/* js */ `
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        const newSrcText = EventData.value;
                        updateInput(selectedComponent,'src','string',newSrcText);
                 
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if(true) {
                
                                    
                if(selectedComponent.input?.src?.type == "value"){
                const currentSrc=selectedComponent.input?.src?.value??'';
                return currentSrc;
                }
            }

        
            `
      },
      state: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if(true) {
                
                                    
                let state = "unabled";
                if(selectedComponent.input?.src?.type =="handler"&&selectedComponent.input?.src?.value){
                   state = "disabled"
               }
               return state;
            }

        
            `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
                const inputPlaceHolder ="src";
             return  inputPlaceHolder;
            `
      }
    }
  },
  {
    uuid: "src_handler_block",
    application_id: "1",
    name: "src handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      width: "187px"
      
    },

    childrenIds: ["src_text_input","label_document_src_file", "src_handler"]
  },
  {
    uuid: "src_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "src handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='src';
                let srcHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                        
                        if(selectedComponent.input?.src?.type =='handler' && selectedComponent.input?.src?.value){
                           srcHandler = selectedComponent.input?.src?.value
                        }
                
                return [parameter,srcHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.src?.value != EventData.value )
                    updateInput(selectedComponent,'src','handler',EventData.value);
            
      `
    }
  }


];