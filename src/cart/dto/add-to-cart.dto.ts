import { IsMongoId, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID to add to cart' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
