import { Application } from "../models/application";

export interface IApplicationRepository{
    create(application: Application): Promise<Application>;
    findAll(): Promise<Application[]>;
    findApplicationById(uuid: string): Promise<Application>;
    update(uuid: string, application: Application): Promise<Application>;
    delete(uuid: string): Promise<Application>;
    
}