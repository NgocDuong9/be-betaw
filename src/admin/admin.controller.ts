import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  // ============ DASHBOARD ============
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboard() {
    const [userCount, orderStats, productCount] = await Promise.all([
      this.usersService.count(),
      this.ordersService.getStatistics(),
      this.productsService.count(),
    ]);

    return {
      success: true,
      data: {
        users: {
          total: userCount,
        },
        orders: orderStats,
        products: {
          total: productCount,
        },
      },
    };
  }

  // ============ USER MANAGEMENT ============
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User details' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
    };
  }

  @Put('users/:id/toggle-active')
  @ApiOperation({ summary: 'Toggle user active status (activate/deactivate)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async toggleUserActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    const user = await this.usersService.toggleActive(id, body.isActive);
    return {
      success: true,
      data: user,
      message: body.isActive ? 'User activated' : 'User deactivated',
    };
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User role updated' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole },
  ) {
    const user = await this.usersService.setRole(id, body.role);
    return {
      success: true,
      data: user,
      message: `User role updated to ${body.role}`,
    };
  }

  @Get('users/:id/orders')
  @ApiOperation({ summary: 'Get orders for a specific user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User orders' })
  async getUserOrders(@Param('id') userId: string) {
    const orders = await this.ordersService.findByUser(userId);
    return {
      success: true,
      data: orders,
    };
  }

  // ============ ORDER MANAGEMENT ============
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of all orders' })
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const orders = await this.ordersService.findAllAdmin({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return {
      success: true,
      data: orders,
    };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order details' })
  async getOrderById(@Param('id') id: string) {
    const order = await this.ordersService.findByIdAdmin(id);
    return {
      success: true,
      data: order,
    };
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const order = await this.ordersService.updateStatusAdmin(id, body.status);
    return {
      success: true,
      data: order,
      message: `Order status updated to ${body.status}`,
    };
  }

  // ============ PRODUCT MANAGEMENT ============
  @Get('products')
  @ApiOperation({ summary: 'Get all products (including inactive)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of all products' })
  async getAllProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.productsService.findAllAdmin({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
    });
    return {
      success: true,
      ...result,
    };
  }

  @Get('products/stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({ status: 200, description: 'Product statistics' })
  async getProductStats() {
    const stats = await this.productsService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID (including inactive)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Product details' })
  async getProductById(@Param('id') id: string) {
    const product = await this.productsService.findByIdAdmin(id);
    return {
      success: true,
      data: product,
    };
  }
}
