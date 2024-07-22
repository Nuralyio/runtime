import prisma from "../../../prisma/prisma";
import { IDatabaseproviderRepository } from "../interfaces/databaseprovider.interface";
import { Databaseprovider } from "../models/databaseprovider";

export class DatabaseproviderRepositoryPrismaPgSQL implements IDatabaseproviderRepository {
    public async create(databaseprovider: Databaseprovider): Promise<Databaseprovider> {
        return await prisma.databaseproviders.create({
            data: {
                username: databaseprovider.username,
                host: databaseprovider.host,
                password: databaseprovider.password,
                port: databaseprovider.port,
                databasename: databaseprovider.databasename,
                provider_type: databaseprovider.provider_type,
                user_id: databaseprovider.user_id,
                label: databaseprovider.label,
            }
        });
    }
    public async findAll(): Promise<Databaseprovider[]> {
        const databaseproviders = await prisma.databaseproviders.findMany();
        return databaseproviders.map((pDatabaseprovider: any) => new Databaseprovider(pDatabaseprovider.username, pDatabaseprovider.host, pDatabaseprovider.password, pDatabaseprovider.port, pDatabaseprovider.databasename, pDatabaseprovider.provider_type, pDatabaseprovider.user_id, pDatabaseprovider.label));

    }
    public async findDatabaseproviderByDatabasename(databasename: string): Promise<Databaseprovider> {
        const databaseprovider = await prisma.databaseproviders.findFirst({
            where: { databasename }
        });
        return new Databaseprovider(databaseprovider!.username, databaseprovider!.host, databaseprovider!.password, databaseprovider!.port, databaseprovider!.databasename, databaseprovider!.provider_type, databaseprovider!.user_id, databaseprovider!.label);
    }
    public async findDatabaseproviderByProvidertype(provider_type: string): Promise<Databaseprovider> {
        const databaseprovider = await prisma.databaseproviders.findFirst({
            where: { provider_type }
        });
        return new Databaseprovider(databaseprovider!.username, databaseprovider!.host, databaseprovider!.password, databaseprovider!.port, databaseprovider!.databasename, databaseprovider!.provider_type, databaseprovider!.user_id, databaseprovider!.label);
    }
    public async update(provider_id: number, databaseprovider: Databaseprovider): Promise<Databaseprovider> {
        const updatedDatabaseprovider = await prisma.databaseproviders.update({
            where: { provider_id },
            data: {
                username: databaseprovider.username,
                host: databaseprovider.host,
                password: databaseprovider.password,
                port: databaseprovider.port,
                databasename: databaseprovider.databasename,
                provider_type: databaseprovider.provider_type,
                user_id: databaseprovider.user_id,
                label: databaseprovider.label,
            }
        });
        return new Databaseprovider(updatedDatabaseprovider.username, updatedDatabaseprovider.host, updatedDatabaseprovider.password, updatedDatabaseprovider.port, updatedDatabaseprovider.databasename, updatedDatabaseprovider.provider_type, updatedDatabaseprovider.user_id, updatedDatabaseprovider.label);

    }
    public async delete(provider_id: number): Promise<Databaseprovider> {
        const deleteDatabaseprovider = await prisma.databaseproviders.delete({
            where: { provider_id }
        });
        return new Databaseprovider(deleteDatabaseprovider.username, deleteDatabaseprovider.host, deleteDatabaseprovider.password, deleteDatabaseprovider.port, deleteDatabaseprovider.databasename, deleteDatabaseprovider.provider_type, deleteDatabaseprovider.user_id, deleteDatabaseprovider.label);
    }

}