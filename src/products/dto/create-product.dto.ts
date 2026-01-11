import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '../schemas/product.schema';

export class CreateProductSpecificationDto {
  @ApiProperty({ example: 'Stainless Steel' })
  @IsNotEmpty()
  @IsString()
  caseMaterial: string;

  @ApiProperty({ example: '42mm' })
  @IsNotEmpty()
  @IsString()
  caseSize: string;

  @ApiProperty({ example: 'Black' })
  @IsNotEmpty()
  @IsString()
  dialColor: string;

  @ApiProperty({ example: 'Automatic' })
  @IsNotEmpty()
  @IsString()
  movement: string;

  @ApiProperty({ example: '100m' })
  @IsNotEmpty()
  @IsString()
  waterResistance: string;

  @ApiProperty({ example: 'Leather' })
  @IsNotEmpty()
  @IsString()
  strapMaterial: string;

  @ApiProperty({ example: 'Brown' })
  @IsNotEmpty()
  @IsString()
  strapColor: string;

  @ApiProperty({ example: 'Sapphire Crystal' })
  @IsNotEmpty()
  @IsString()
  crystal: string;

  @ApiPropertyOptional({ example: '72 hours' })
  @IsOptional()
  @IsString()
  powerReserve?: string;

  @ApiPropertyOptional({ type: [String], example: ['Date Display', 'Luminous Hands'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}

export class CreateProductDto {
  @ApiProperty({ example: 'Royal Oak' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Audemars Piguet' })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 'A timeless masterpiece of Swiss watchmaking...' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Iconic luxury sports watch' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.LUXURY })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ type: CreateProductSpecificationDto })
  @ValidateNested()
  @Type(() => CreateProductSpecificationDto)
  specifications: CreateProductSpecificationDto;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
