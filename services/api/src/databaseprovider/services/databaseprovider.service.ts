import { IDatabaseproviderRepository } from '../interfaces/databaseprovider.interface';
import { Databaseprovider } from '../models/databaseprovider';

export class DatabaseproviderService {
    private databaseproviderRepository: IDatabaseproviderRepository;

    constructor(databaseproviderRepository: IDatabaseproviderRepository) {
        this.databaseproviderRepository = databaseproviderRepository;
    }

    public async create(username: string, host: string, password: string, port: number, databasename: string, provider_type: string, user_id: string, label: string): Promise<Databaseprovider> {
        const databaseprovider: Databaseprovider = new Databaseprovider(username, host, password, port, databasename, provider_type, user_id, label);
        return await this.databaseproviderRepository.create(databaseprovider);
    }

    public async findAll(): Promise<Databaseprovider[]> {
        return await this.databaseproviderRepository.findAll();
    }

    public async findDatabaseproviderByDatabasename(databasename: string): Promise<Databaseprovider> {
        return await this.databaseproviderRepository.findDatabaseproviderByDatabasename(databasename);
    }

    public async findDatabaseproviderByProvidertype(provider_type: string): Promise<Databaseprovider> {
        return await this.databaseproviderRepository.findDatabaseproviderByProvidertype(provider_type);
    }

    public async update(provider_id: number, username: string, host: string, password: string, port: number, databasename: string, provider_type: string, user_id: string, label: string): Promise<Databaseprovider> {
        const uDatabaseprovider: Databaseprovider = new Databaseprovider(username, host, password, port, databasename, provider_type, user_id, label);
        return await this.databaseproviderRepository.update(provider_id, uDatabaseprovider);
    }

    public async delete(provider_id: number): Promise<Databaseprovider> {
        return await this.databaseproviderRepository.delete(provider_id);
    }

}