import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDocument> {
    const { items, shippingAddress, paymentMethod, notes } = createOrderDto;

    // Validate and get product details
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.productsService.findById(item.productId);

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${product.name}. Available: ${product.stock}`,
          );
        }

        return {
          productId: new Types.ObjectId(item.productId),
          productName: product.name,
          productImage: product.images[0] || '',
          price: product.price,
          quantity: item.quantity,
        };
      }),
    );

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 5000 ? 0 : 50; // Free shipping over $5000
    const total = subtotal + tax + shipping;

    // Create order
    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      shippingAddress,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      notes,
    });

    const savedOrder = await order.save();

    // Update stock for each product
    await Promise.all(
      items.map((item) =>
        this.productsService.updateStock(item.productId, item.quantity),
      ),
    );

    return savedOrder;
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByIdAndUser(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancel(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.findByIdAndUser(id, userId);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Only pending or confirmed orders can be cancelled',
      );
    }

    order.status = OrderStatus.CANCELLED;
    return order.save();
  }

  async getOrderStats(userId?: string) {
    const match = userId ? { userId: new Types.ObjectId(userId) } : {};

    const stats = await this.orderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    return stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
  }
}
