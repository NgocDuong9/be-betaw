import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './dto';

export interface PopulatedCartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    images: string[];
    stock: number;
    category: string;
  };
}

export interface CartResponse {
  id: string;
  userId: string;
  items: PopulatedCartItem[];
  itemCount: number;
  subtotal: number;
  updatedAt: Date;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // Get user's cart with populated products
  async getCart(userId: string): Promise<CartResponse> {
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      // Create empty cart if not exists
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    return this.populateCart(cart);
  }

  // Add item to cart
  async addToCart(userId: string, dto: AddToCartDto): Promise<CartResponse> {
    const product = await this.productModel.findById(dto.productId);
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === dto.productId,
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += dto.quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return this.populateCart(cart);
  }

  // Update item quantity
  async updateCartItem(userId: string, dto: UpdateCartItemDto): Promise<CartResponse> {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === dto.productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    if (dto.quantity <= 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = dto.quantity;
    }

    await cart.save();
    return this.populateCart(cart);
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();
    return this.populateCart(cart);
  }

  // Clear cart
  async clearCart(userId: string): Promise<CartResponse> {
    const cart = await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { items: [] },
      { new: true },
    );

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.populateCart(cart);
  }

  // Sync local cart to server (merge or replace)
  async syncCart(userId: string, dto: SyncCartDto): Promise<CartResponse> {
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    // Merge local cart with server cart
    for (const localItem of dto.items) {
      const product = await this.productModel.findById(localItem.productId);
      if (!product || !product.isActive) continue;

      const existingIndex = cart.items.findIndex(
        (item) => item.productId.toString() === localItem.productId,
      );

      if (existingIndex > -1) {
        // Take the higher quantity
        cart.items[existingIndex].quantity = Math.max(
          cart.items[existingIndex].quantity,
          localItem.quantity,
        );
      } else {
        cart.items.push({
          productId: new Types.ObjectId(localItem.productId),
          quantity: localItem.quantity,
          addedAt: new Date(),
        });
      }
    }

    await cart.save();
    return this.populateCart(cart);
  }

  // Helper to populate cart with product data
  private async populateCart(cart: CartDocument): Promise<CartResponse> {
    const productIds = cart.items.map((item) => item.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } });

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p]),
    );

    const populatedItems: PopulatedCartItem[] = cart.items
      .filter((item) => productMap.has(item.productId.toString()))
      .map((item) => {
        const product = productMap.get(item.productId.toString())!;
        return {
          productId: item.productId.toString(),
          quantity: item.quantity,
          addedAt: item.addedAt,
          product: {
            id: product._id.toString(),
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            images: product.images,
            stock: product.stock,
            category: product.category,
          },
        };
      });

    const subtotal = populatedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const itemCount = populatedItems.reduce(
      (count, item) => count + item.quantity,
      0,
    );

    return {
      id: cart._id.toString(),
      userId: cart.userId.toString(),
      items: populatedItems,
      itemCount,
      subtotal,
      updatedAt: cart.updatedAt,
    };
  }
}
