import { ProductService } from "../services/application.service";
import { Body, Controller, Delete, Get, Hidden, Path, Post, Put, Route, Security, Tags } from "tsoa";
import { ProductRepositoryPrismaPgSQL } from "../repositories/application.repository";
import { Product } from "../models/application";

@Route('/api/products')
@Tags('Products')
export class ProductController extends Controller {
  private readonly productService: ProductService;

  constructor() {
    super();
    const productRepository = new ProductRepositoryPrismaPgSQL();
    this.productService = new ProductService(productRepository);
  }

  @Post()
  // @Security('bearerAuth')
  public async create(
    @Body() requestBody: { name: string; price: number }): Promise<Product> {
    const { name, price } = requestBody;
    return await this.productService.create(name, price);
  }

  @Get()
  // @Security('bearerAuth')
  public async findAll(): Promise<Product[]> {
    return await this.productService.findAll();
  }

  @Get("{id}")
  // @Security('bearerAuth')
  public async findProductById(
    @Path() id: string
  ): Promise<Product> {
    return await this.productService.findProductById(id);
  }

  @Put("{id}")
  // @Security('bearerAuth')
  public async update(
    @Path() id: string,
    @Body() requestBody: { name: string, price: number }
  ): Promise<Product> {
    const { name, price } = requestBody;
    return await this.productService.update(id, name, price);
  }

  @Delete("{id}")
  // @Security('bearerAuth')
  public async delete(
    @Path() id: string
  ): Promise<Product> {
    return await this.productService.delete(id);
  }
}
