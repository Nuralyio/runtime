import { Component } from "../models/component";


export interface IComponentRepository {
    create(component: Component): Promise<Component>;
    findAll(): Promise<Component[]>;
    findComponentByApplication(application_id: string): Promise<Component[]>;
    findComponentByUuid(uuid: string): Promise<Component | null>;
    update(uuid: string, Component: Component): Promise<Component>;
    delete(uuid: string[]): Promise<Component[]>;

}