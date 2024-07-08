import prisma from '../../../prisma/prisma'
import { IProductRepository } from '../interfaces/application.interface';
import { Product } from '../models/application';

export class ProductRepositoryPrismaPgSQL implements IProductRepository {

  public async create(product: Product): Promise<Product> {
    return await prisma.product.create({
      data: {
        name: product.name,
        price: product.price
      }
    })
  }

  public async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany();
    return products.map((product) => new Product(product.name, product.price, product.id));
  }
  
  public async findProductById(id: string): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id }
    });
    return new Product(product!.name, product!.price, product!.id);
  }

  public async update(id: string, product: Product): Promise<Product> {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        price: product.price
      }
    });
    return new Product(updatedProduct.name, updatedProduct.price, updatedProduct.id);
  }

  public async delete(id: string): Promise<Product> {
    const deleteProduct = await prisma.product.delete({
      where: { id }
    });
    return new Product(deleteProduct.name, deleteProduct.price, deleteProduct.id);
  }
}