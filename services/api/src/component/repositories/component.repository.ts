import prisma from "../../../prisma/prisma";
import { IComponentRepository } from "../interfaces/component.interface";
import { Component } from "../models/component";

export class ComponentRepositoryPrismaPgSQL implements IComponentRepository {
    public async create(component: Component): Promise<Component> {
        return await prisma.components.create({
            data: {
                component: component.component,
                user_id: component.user_id,
                uuid: component.uuid,
                application_id: component.application_id
            }
        });
    }
    public async findAll(): Promise<Component[]> {
        const components = await prisma.components.findMany();
        return components.map((pcomponent: any) => new Component(pcomponent.component, pcomponent.user_id, pcomponent.uuid, pcomponent.application_id));

    }
    public async findComponentByApplication(uuid: string): Promise<Component[]> {
        const components = await prisma.components.findMany({
            where: { application_id: uuid },
            orderBy: { id: 'asc' }
        });
        return components.map((pcomponent: any) => new Component(pcomponent.component, pcomponent.user_id, pcomponent.uuid, pcomponent.application_id));
    }
    public async findComponentByUuid(uuid: string): Promise<Component | null> {
        const component = await prisma.components.findFirst({
            where: { uuid }
        });
        if (component === null) {
            return null;
        }
        return new Component(component!.component, component!.user_id, component!.uuid, component!.application_id);
    }
    public async update(uuid: string, component: Component): Promise<Component> {
        const updatedComponent = await prisma.components.update({
            where: { uuid },
            data: {
                component: component.component,
                user_id: component.user_id,
                uuid: component.uuid,
                application_id: component.application_id,
            }
        });
        return updatedComponent;

    }
    public async delete(uuid: string): Promise<Component> {
        const deleteComponent = await prisma.components.delete({
            where: { uuid }
        });
        return new Component(deleteComponent.component, deleteComponent.user_id, deleteComponent.uuid, deleteComponent.application_id);
    }

}