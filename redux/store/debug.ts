import { atom, keepMount } from "nanostores";


export interface NuralyDebug {
 error : {
    components : any,
    // functions : any,
 },

}

export const $debug = atom<NuralyDebug>(
    {
        error : {
        components : {},
        // functions : {},
        },
       
    }
);

keepMount($debug);

// logger({
//     'Debug': $debug,
// });


