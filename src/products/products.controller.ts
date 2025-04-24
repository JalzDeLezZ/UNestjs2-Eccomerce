import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/commond/dto/pagination.dto';
import { MyAuth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('products')
//@MyAuth() //! Only active if we want to protect all the routes in this controller
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @MyAuth(ValidRoles.admin)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.productsService.findAll(pagination);
  }

  @Get(':search_term')
  findOne(@Param('search_term') search_term: string) {
    return this.productsService.findOnePlain(search_term);
  }

  @Patch(':id')
  @MyAuth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @MyAuth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
