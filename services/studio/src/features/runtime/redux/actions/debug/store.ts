
/**
 * 
 * @param type 
 * create action for thos stores
 * import { logger } from "@nanostores/logger";
 import { atom, keepMount } from "nanostores";
 
 
 export interface NuralyDebug {
  error : {
     components : any[],
     functions : any[],
  },
  warning : {
     components : any[],
     functions : any[],
  }
 }
 
 export const $debug = atom<NuralyDebug>(
     {
         error : {
         components : [],
         functions : [],
         },
         warning : {
         components : [],
         functions : [],
         }
     }
 );
 
 keepMount($debug);
 
 
 

 * @param log 
 */

import { $debug } from '../../store/debug';


export function addlogDebug({
    errors
}) {
    const debug = $debug.get();
    $debug.set({
        error : {
            components :{
                ...(debug.error?.components || {}),
                [ errors.component.uuid] : errors.component
            },
           
        }
    });

}
export function resetComponentDebug() {
    const debug = $debug.get();
    $debug.set({
        error : {
            components : {},
        },
      
    });
}

// $debug.subscribe((debug) => {
//     console.log("debug",debug)
// })