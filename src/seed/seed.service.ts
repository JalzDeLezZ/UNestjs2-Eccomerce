import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async executeSeed(/* userJWT: User */) {
    //! user comming from JWT
    await this.deleteTables();
    const firstUser = await this.insertNewUsers();
    await this.insertNewProducts(firstUser);
    return `executeSeed`;
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().execute();
  }

  private async insertNewUsers() {
    const seedUser = initialData.users;
    const users: User[] = [];

    seedUser.forEach((user) => {
      const newUser = this.userRepository.create({
        ...user,
        password: bcrypt.hashSync(user.password, 10),
      });
      users.push(newUser);
    });

    const result = await this.userRepository.save(users);

    return result[0];
  }

  private async insertNewProducts(userx: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = products.map(async (product) => {
      await this.productsService.create(product, userx);
    });

    await Promise.all(insertPromises);

    return `insertNewProducts`;
  }
}
