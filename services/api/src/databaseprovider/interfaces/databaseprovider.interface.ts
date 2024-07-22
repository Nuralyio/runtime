import { Databaseprovider } from "../models/databaseprovider";


export interface IDatabaseproviderRepository {
    create(databaseprovider: Databaseprovider): Promise<Databaseprovider>;
    findAll(): Promise<Databaseprovider[]>;
    findDatabaseproviderByDatabasename(databasename: string): Promise<Databaseprovider>;
    findDatabaseproviderByProvidertype(provider_type: string): Promise<Databaseprovider>;
    update(provider_id: number, Databaseprovider: Databaseprovider): Promise<Databaseprovider>;
    delete(provider_id: number): Promise<Databaseprovider>;

}