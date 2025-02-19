import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/commond/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(pagination: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = pagination;

    return await this.productRepository.find({ take: limit, skip: offset });
  }

  async findOne(search_term: string): Promise<Product> {
    let product: Product;

    if (isUUID(search_term)) {
      product = await this.productRepository.findOneBy({ id: search_term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();

      product = await queryBuilder
        .where(`UPPER(title) =:title OR slug = :slug`, {
          title: search_term.toUpperCase(),
          slug: search_term.toLowerCase(),
        })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id ${search_term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
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
}
