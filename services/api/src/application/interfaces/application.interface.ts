import { Application } from "../models/application";

export interface IApplicationRepository{
    create(application: Application): Promise<Application>;
    findAll(applicationIds : string[]): Promise<Application[]>;
    findApplicationById(uuid: string): Promise<Application>;
    findApplicationBySubdomain(subdomain: string): Promise<Application | null>;
    update(uuid: string, application: Application): Promise<Application>;
    delete(uuid: string): Promise<Application>;

}