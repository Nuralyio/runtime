import { JsonValue } from "@prisma/client/runtime/library";
import prisma from "../../../prisma/prisma";
import { IComponentRepository } from "../interfaces/component.interface";
import { Component } from "../models/component";

export class ComponentRepositoryPrismaPgSQL implements IComponentRepository {
    public async create(component: Component): Promise<Component> {
        return await prisma.components.create({
            data: {
                component:component.component,
                user_id:component.user_id,
                uuid:component.uuid,
                application_id:component.application_id
            }
        });
    }
    public async findAll(): Promise<Component[]> {
        const components = await prisma.components.findMany();
    return components.map((pcomponent: any) => new Component(pcomponent.component, pcomponent.user_id, pcomponent.uuid, pcomponent.application_id));

    }
    public async findComponentByApplication(uuid: string): Promise<Component[]> {
        const components = await prisma.components.findMany({
            where: { application_id: uuid }
          });
          return components.map((pcomponent: any) => new Component(pcomponent.component, pcomponent.user_id, pcomponent.uuid, pcomponent.application_id));
    }
    public async update(uuid: string, component: Component): Promise<Component> {
        const updatedComponent = await prisma.components.update({
            where: { uuid },
            data: {
              component:component.component,
              user_id: component.user_id,
              uuid: component.uuid,
              application_id: component.application_id
            }
        });
        return new Component(updatedComponent.component, updatedComponent.user_id, updatedComponent.uuid, updatedComponent.application_id);
      
    }
    public async delete(uuid: string): Promise<Component> {
        const deleteComponent = await prisma.components.delete({
            where: { uuid }
          });
          return new Component(deleteComponent.component, deleteComponent.user_id, deleteComponent.uuid, deleteComponent.application_id); 
    }
    
}