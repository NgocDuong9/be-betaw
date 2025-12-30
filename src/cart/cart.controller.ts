import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { userId: string };
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Request() req: RequestWithUser) {
    const cart = await this.cartService.getCart(req.user.userId);
    return {
      success: true,
      data: cart,
    };
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart' })
  async addToCart(
    @Request() req: RequestWithUser,
    @Body() dto: AddToCartDto,
  ) {
    const cart = await this.cartService.addToCart(req.user.userId, dto);
    return {
      success: true,
      data: cart,
      message: 'Item added to cart',
    };
  }

  @Put('update')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  async updateCartItem(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateCartItem(req.user.userId, dto);
    return {
      success: true,
      data: cart,
      message: 'Cart item updated',
    };
  }

  @Delete('item/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  async removeFromCart(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    const cart = await this.cartService.removeFromCart(req.user.userId, productId);
    return {
      success: true,
      data: cart,
      message: 'Item removed from cart',
    };
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Request() req: RequestWithUser) {
    const cart = await this.cartService.clearCart(req.user.userId);
    return {
      success: true,
      data: cart,
      message: 'Cart cleared',
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync local cart to server (merge items)' })
  @ApiResponse({ status: 200, description: 'Cart synced successfully' })
  async syncCart(
    @Request() req: RequestWithUser,
    @Body() dto: SyncCartDto,
  ) {
    const cart = await this.cartService.syncCart(req.user.userId, dto);
    return {
      success: true,
      data: cart,
      message: 'Cart synced successfully',
    };
  }
}
