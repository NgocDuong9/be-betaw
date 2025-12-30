import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductCategory {
  LUXURY = 'luxury',
  SPORT = 'sport',
  CLASSIC = 'classic',
  LIMITED_EDITION = 'limited-edition',
  DIVING = 'diving',
  CHRONOGRAPH = 'chronograph',
}

@Schema()
export class ProductSpecification {
  @Prop({ required: true })
  caseMaterial: string;

  @Prop({ required: true })
  caseSize: string;

  @Prop({ required: true })
  dialColor: string;

  @Prop({ required: true })
  movement: string;

  @Prop({ required: true })
  waterResistance: string;

  @Prop({ required: true })
  strapMaterial: string;

  @Prop({ required: true })
  strapColor: string;

  @Prop({ required: true })
  crystal: string;

  @Prop()
  powerReserve?: string;

  @Prop({ type: [String], default: [] })
  features: string[];
}

export const ProductSpecificationSchema =
  SchemaFactory.createForClass(ProductSpecification);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  originalPrice?: number;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, enum: ProductCategory })
  category: ProductCategory;

  @Prop({ type: ProductSpecificationSchema, required: true })
  specifications: ProductSpecification;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add text index for search
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Transform when converting to JSON - using any to avoid strict type issues
ProductSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
