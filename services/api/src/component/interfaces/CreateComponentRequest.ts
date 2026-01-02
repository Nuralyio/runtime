import { Component } from "../models/component"

export interface CreateComponentRequest {
    component: any

}

// export interface Component {
//     name: string
//     type: string
//     style_handlers: StyleHandlers
//     parameters: Parameters
//     event: Event
//     input: Input
//     style: Style
//     styleBreakPoints: StyleBreakPoints
//     inputHandlers: InputHandlers
//     attributesHandlers: AttributesHandlers
//     errors: Errors
//     children_ids: any[]
//     uuid: string
//     pageId: string
//     application_id: string
// }

export interface StyleHandlers { }

export interface Parameters {
    value: string
}

export interface Event { }

export interface Input { }

export interface Style { }

export interface StyleBreakPoints {
    mobile: Mobile
    tablet: Tablet
    laptop: Laptop
}

export interface Mobile { }

export interface Tablet { }

export interface Laptop { }

export interface InputHandlers { }

export interface AttributesHandlers { }

export interface Errors { }
