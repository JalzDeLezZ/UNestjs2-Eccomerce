import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private productsService: ProductsService,
  ) {}

  executeSeed() {
    this.insertNewProducts();

    return `executeSeed`;
  }

  private async insertNewProducts() {

    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = products.map(async (product) => {
      await this.productsService.create(product);
    });

    await Promise.all(insertPromises);

    return `insertNewProducts`;
  }
}
