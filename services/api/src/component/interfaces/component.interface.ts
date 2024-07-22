import { Component } from "../models/component";


export interface IComponentRepository{
    create(component:Component): Promise<Component>;
    findAll(): Promise<Component[]>;
    findComponentByApplication(application_id: string): Promise<Component[]>;
    update(uuid: string, Component: Component): Promise<Component>;
    delete(uuid: string): Promise<Component>;
    
}