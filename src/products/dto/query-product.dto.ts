import { IsOptional, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto';
import { ProductCategory } from '../schemas/product.schema';

export enum ProductSortBy {
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
  NAME_ASC = 'name-asc',
  NAME_DESC = 'name-desc',
  NEWEST = 'newest',
}

export class QueryProductDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ enum: ProductSortBy })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sort?: ProductSortBy;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
