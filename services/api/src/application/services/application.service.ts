import { IProductRepository } from '../interfaces/application.interface';
import { Product } from '../models/application';

export class ProductService {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository){
    this.productRepository = productRepository;
  }

  public async create(name: string, price: number): Promise<Product> {
    const product: Product = new Product(name, price);
    return await this.productRepository.create(product)
  }

  public async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  public async findProductById(id: string): Promise<Product> {
    return await this.productRepository.findProductById(id);
  }

  public async update(id: string, name: string, price: number): Promise<Product> {
    const product: Product = new Product(name, price, id);
    return await this.productRepository.update(id, product);
  }

  public async delete(id: string): Promise<Product> {
    return await this.productRepository.delete(id);
  }
}