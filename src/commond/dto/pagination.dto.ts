import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Number of items to return',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enableImplicitConversion: true
  limit?: number;

  @ApiProperty({
    description: 'Number of items to skip',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
