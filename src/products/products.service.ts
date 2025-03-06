import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/commond/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image_url) =>
          this.productImageRepository.create({ url: image_url }),
        ),
      });
      await this.productRepository.save(product);
      return {
        ...product,
        images,
      };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((image) => image.url),
    }));

    /* return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    })); */
  }

  async findOne(search_term: string): Promise<Product> {
    let product: Product;

    if (isUUID(search_term)) {
      product = await this.productRepository.findOneBy({ id: search_term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where(`UPPER(title) =:title OR slug = :slug`, {
          title: search_term.toUpperCase(),
          slug: search_term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id ${search_term} not found`);
    }
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    // QueryRunner is used to manage transactions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image_url) =>
          this.productImageRepository.create({ url: image_url }),
        );
      } /* else {
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      } */

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      //return product;
      return this.findOnePlain(id);
      //return await this.productRepository.save(product);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    await this.productRepository.remove(product);
  }
  

  private handleDBException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(
        error.detail || 'There was an error creating the product',
      );
    }
    this.logger.error(error.message);
    throw new InternalServerErrorException('Error creating product');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Error deleting products');
    }
  }

}
