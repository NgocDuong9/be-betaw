import {
  Controller,
  Get,
  Post,
  Put,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(
    @Request() req: { user: { userId: string } },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.ordersService.create(
      req.user.userId,
      createOrderDto,
    );
    return {
      success: true,
      data: order,
      message: 'Order placed successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for current user' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@Request() req: { user: { userId: string } }) {
    const orders = await this.ordersService.findByUser(req.user.userId);
    return {
      success: true,
      data: orders,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics for current user' })
  @ApiResponse({ status: 200, description: 'Order stats retrieved' })
  async getStats(@Request() req: { user: { userId: string } }) {
    const stats = await this.ordersService.getOrderStats(req.user.userId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    const order = await this.ordersService.findByIdAndUser(id, req.user.userId);
    return {
      success: true,
      data: order,
    };
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  async cancel(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    const order = await this.ordersService.cancel(id, req.user.userId);
    return {
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  @ApiResponse({ status: 200, description: 'All orders retrieved' })
  async findAllAdmin() {
    const orders = await this.ordersService.findAll();
    return {
      success: true,
      data: orders,
    };
  }

  @Put('admin/:id')
  @ApiOperation({ summary: 'Update order status (Admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.ordersService.update(id, updateOrderDto);
    return {
      success: true,
      data: order,
      message: 'Order updated successfully',
    };
  }
}
