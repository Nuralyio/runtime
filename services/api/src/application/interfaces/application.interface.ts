import { Product } from "../models/application";

export interface IProductRepository{
    create(product: Product): Promise<Product>;
    findAll(): Promise<Product[]>;
    findProductById(id: string): Promise<Product>;
    update(id: string, product: Product): Promise<Product>;
    delete(id: string): Promise<Product>;
}