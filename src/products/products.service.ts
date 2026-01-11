import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Product, ProductDocument, ProductCategory } from './schemas/product.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  QueryLatestProductDto,
  ProductSortBy,
} from './dto';
import { PaginatedResponse } from '../common/interfaces';

interface ProductFilter {
  isActive?: boolean;
  isNew?: boolean;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  category?: ProductCategory;
  price?: { $gte?: number; $lte?: number };
  brand?: { $regex: string; $options: string } | { $in: RegExp[] };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResponse<ProductDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      brand,
    } = query;

    const filter: ProductFilter = {};
    
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    } else {
      filter.isActive = true;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    // Brand filter (support multiple brands separated by comma)
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      if (brands.length === 1) {
        filter.brand = { $regex: brands[0], $options: 'i' };
      } else {
        // Multiple brands - use $in with RegExp patterns
        filter.brand = { $in: brands.map((b) => new RegExp(b, 'i')) };
      }
    }

    // Sorting
    let sortOption: Record<string, SortOrder> = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case ProductSortBy.PRICE_ASC:
          sortOption = { price: 1 };
          break;
        case ProductSortBy.PRICE_DESC:
          sortOption = { price: -1 };
          break;
        case ProductSortBy.NAME_ASC:
          sortOption = { name: 1 };
          break;
        case ProductSortBy.NAME_DESC:
          sortOption = { name: -1 };
          break;
        case ProductSortBy.NEWEST:
          sortOption = { createdAt: -1 };
          break;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all products for admin (including inactive products)
   */
  async findAllAdmin(query: QueryProductDto): Promise<PaginatedResponse<ProductDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      brand,
    } = query;

    const filter: ProductFilter = {};
    // Note: No isActive filter for admin - show all products

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    // Brand filter (support multiple brands separated by comma)
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      if (brands.length === 1) {
        filter.brand = { $regex: brands[0], $options: 'i' };
      } else {
        filter.brand = { $in: brands.map((b) => new RegExp(b, 'i')) };
      }
    }

    // Sorting
    let sortOption: Record<string, SortOrder> = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case ProductSortBy.PRICE_ASC:
          sortOption = { price: 1 };
          break;
        case ProductSortBy.PRICE_DESC:
          sortOption = { price: -1 };
          break;
        case ProductSortBy.NAME_ASC:
          sortOption = { name: 1 };
          break;
        case ProductSortBy.NAME_DESC:
          sortOption = { name: -1 };
          break;
        case ProductSortBy.NEWEST:
          sortOption = { createdAt: -1 };
          break;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Find product by ID for admin (including inactive products)
   */
  async findByIdAdmin(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findLatest(query: QueryLatestProductDto): Promise<ProductDocument[]> {
    const { limit = 8, minPrice, maxPrice, brand, sort } = query;

    const filter: ProductFilter = {
      isActive: true,
      isNew: true,
    };

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    // Brand filter (support multiple brands separated by comma)
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      if (brands.length === 1) {
        filter.brand = { $regex: brands[0], $options: 'i' };
      } else {
        // Multiple brands - use $in with RegExp patterns
        filter.brand = { $in: brands.map((b) => new RegExp(b, 'i')) };
      }
    }

    // Sorting
    let sortOption: Record<string, SortOrder> = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case ProductSortBy.PRICE_ASC:
          sortOption = { price: 1 };
          break;
        case ProductSortBy.PRICE_DESC:
          sortOption = { price: -1 };
          break;
        case ProductSortBy.NAME_ASC:
          sortOption = { name: 1 };
          break;
        case ProductSortBy.NAME_DESC:
          sortOption = { name: -1 };
          break;
        case ProductSortBy.NEWEST:
        default:
          sortOption = { createdAt: -1 };
          break;
      }
    }

    return this.productModel
      .find(filter)
      .sort(sortOption)
      .limit(limit)
      .exec();
  }

  async findFeatured(limit: number = 4): Promise<ProductDocument[]> {
    return this.productModel
      .find({ isActive: true, isFeatured: true })
      .limit(limit)
      .exec();
  }

  async findByCategory(
    category: ProductCategory,
    limit?: number,
  ): Promise<ProductDocument[]> {
    const query = this.productModel
      .find({ isActive: true, category })
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  async search(searchQuery: string): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { brand: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
      })
      .limit(20)
      .exec();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    const result = await this.productModel
      .findByIdAndUpdate(id, { isActive: false })
      .exec();

    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateStock(id: string, quantity: number): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { stock: -quantity } },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getBrands(): Promise<string[]> {
    return this.productModel.distinct('brand', { isActive: true }).exec();
  }

  async deleteAll(): Promise<void> {
    await this.productModel.deleteMany({}).exec();
  }

  async count(): Promise<number> {
    return this.productModel.countDocuments({ isActive: true }).exec();
  }

  async getStatistics() {
    const [total, byCategory, lowStock] = await Promise.all([
      this.productModel.countDocuments({ isActive: true }).exec(),
      this.productModel.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
          },
        },
      ]),
      this.productModel.countDocuments({ isActive: true, stock: { $lt: 10 } }).exec(),
    ]);

    const categoryStats: Record<string, { count: number; avgPrice: number }> = {};
    byCategory.forEach((c) => {
      categoryStats[c._id] = { count: c.count, avgPrice: c.avgPrice };
    });

    return {
      total,
      byCategory: categoryStats,
      lowStock,
    };
  }
}

