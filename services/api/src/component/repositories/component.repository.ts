import { singleton } from "tsyringe";
import prisma from "../../../prisma/prisma";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { IComponentRepository } from "../interfaces/component.interface";
import { Component } from "../models/component";

@singleton()
export class ComponentRepository implements IComponentRepository {
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
             throw new NotFoundException(`Component with uuid ${uuid} not found`)
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
    public async delete(uuids: string[]): Promise<Component[]> {
        // Ensure uuids is an array and remove any duplicates
        const uniqueUuids = [...new Set(uuids)];
      
        // Get child UUIDs recursively for all input UUIDs
        const childUuids = await getChildComponentsRecursive(uniqueUuids);
        console.log("childUuids", childUuids);
      
        // Delete all child components
        await prisma.components.deleteMany({
          where: { uuid: { in: childUuids } },
        });
      
        // Find and update parent components
        const parentComponents = await prisma.components.findMany({
          where: {
            component: {
              path: ["childrenIds"],
              array_contains: { hasSome: uniqueUuids },
            },
          },
        });
      
        for (const parent of parentComponents) {
          const updatedComponent = { ...(parent.component as any) };
          updatedComponent.childrenIds = updatedComponent.childrenIds.filter(
            (id: string) => !uniqueUuids.includes(id)
          );
      
          await prisma.components.update({
            where: { id: parent.id },
            data: {
              component: updatedComponent,
            },
          });
        }
      
        // Find and update pages
        const pagesToUpdate = await prisma.pages.findMany({
          where: { component_ids: { hasSome: uniqueUuids } },
          select: { id: true, component_ids: true },
        });
      
        for (const page of pagesToUpdate) {
          const updatedComponentIds = page.component_ids.filter(
            (id) => !uniqueUuids.includes(id)
          );
      
          await prisma.pages.update({
            where: { id: page.id },
            data: {
              component_ids: updatedComponentIds,
            },
          });
        }
      
        // Delete the specified components
        const deletedComponents = await prisma.components.deleteMany({
          where: { uuid: { in: uniqueUuids } },
        });
      
        // Fetch and return the deleted components
        const componentsToReturn = await prisma.components.findMany({
          where: { uuid: { in: uniqueUuids } },
        });
      
        return componentsToReturn.map(
          (deletedComponent) =>
            new Component(
              deletedComponent.component,
              deletedComponent.user_id,
              deletedComponent.uuid,
              deletedComponent.application_id
            )
        );
      }
}
// Fonction récursive pour récupérer tous les enfants (enfants des enfants, etc.)
async function getChildComponentsRecursive(parentUuids: string[], allChildren: string[] = []): Promise<string[]> {
    if (parentUuids.length === 0) return allChildren;

    // Récupérer les composants avec les 'childrenIds' qui correspondent aux UUIDs des parents
    const components = await prisma.components.findMany({
        where: {
            uuid: {
                in: parentUuids, // Cherche les composants avec ces UUIDs
            },
        },
        select: {
            uuid: true,  // Sélectionne les UUIDs
            component: true
        },
    });

    // Extraire les enfants (childrenIds) de chaque composant
    const childUuids = components.flatMap(component => (component.component as any)?.childrenIds || []);
    console.log("Parents traités:", parentUuids, "Enfants trouvés:", childUuids);

    // Ajouter les enfants à la liste finale de tous les enfants
    allChildren.push(...childUuids);

    // Appel récursif pour les nouveaux parents (les enfants trouvés)
    return getChildComponentsRecursive(childUuids, allChildren);
}