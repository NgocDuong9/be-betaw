import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Product,
  ProductDocument,
  ProductCategory,
} from '../products/schemas/product.schema';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      await this.seedProducts();
    }
  }

  async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count > 0) {
      this.logger.log('Products already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding products...');

    const products = [
      {
        name: 'Royal Oak',
        brand: 'Audemars Piguet',
        price: 25000,
        originalPrice: 28000,
        description:
          'The Royal Oak is the worlds first luxury sports watch. Created by the legendary watch designer Gerald Genta in 1972, it remains one of the most iconic timepieces ever created.',
        shortDescription: 'Iconic luxury sports watch',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        ],
        category: ProductCategory.LUXURY,
        specifications: {
          caseMaterial: '18K Rose Gold',
          caseSize: '41mm',
          dialColor: 'Blue Tapisserie',
          movement: 'Calibre 4302 Automatic',
          waterResistance: '50m',
          strapMaterial: 'Integrated bracelet',
          strapColor: 'Rose Gold',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Date display', 'Self-winding'],
        },
        stock: 5,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Submariner Date',
        brand: 'Rolex',
        price: 14500,
        description:
          'The Submariner is the archetypal divers watch. Launched in 1953, it set the standard for diving watches and remains the reference for underwater timepieces.',
        shortDescription: 'The ultimate diving watch',
        images: [
          'https://images.unsplash.com/photo-1587836374828-a58e71466c4b?w=800',
        ],
        category: ProductCategory.DIVING,
        specifications: {
          caseMaterial: 'Oystersteel',
          caseSize: '41mm',
          dialColor: 'Black',
          movement: 'Calibre 3235 Automatic',
          waterResistance: '300m',
          strapMaterial: 'Oyster bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Date display', 'Unidirectional bezel', 'Luminescent display'],
        },
        stock: 8,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Speedmaster Moonwatch',
        brand: 'Omega',
        price: 7200,
        description:
          'The Speedmaster Professional Moonwatch has been part of all six lunar missions. It is the only watch to be qualified by NASA for spaceflight.',
        shortDescription: 'Moon landing chronograph',
        images: [
          'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
        ],
        category: ProductCategory.CHRONOGRAPH,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '42mm',
          dialColor: 'Black',
          movement: 'Calibre 3861 Manual-winding',
          waterResistance: '50m',
          strapMaterial: 'Steel bracelet',
          strapColor: 'Steel',
          crystal: 'Hesalite Crystal',
          powerReserve: '50 hours',
          features: ['Chronograph', 'Tachymeter scale', 'NASA certified'],
        },
        stock: 12,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Nautilus',
        brand: 'Patek Philippe',
        price: 35000,
        originalPrice: 40000,
        description:
          'The Nautilus is a luxury sports watch designed by Gerald Genta. With its distinctive porthole-shaped case, it has become one of the most sought-after watches in the world.',
        shortDescription: 'Elegant sports timepiece',
        images: [
          'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800',
        ],
        category: ProductCategory.LUXURY,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '40mm',
          dialColor: 'Blue',
          movement: 'Calibre 26-330 S C Automatic',
          waterResistance: '120m',
          strapMaterial: 'Integrated bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '45 hours',
          features: ['Date display', 'Sweep seconds hand'],
        },
        stock: 3,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Carrera Chronograph',
        brand: 'TAG Heuer',
        price: 5500,
        description:
          'The Carrera is a legendary racing chronograph. First introduced in 1963, it was designed for professional racing drivers who demanded a precise and reliable timepiece.',
        shortDescription: 'Professional racing chronograph',
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
        ],
        category: ProductCategory.SPORT,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '44mm',
          dialColor: 'Black',
          movement: 'Calibre Heuer 02 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Leather',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '80 hours',
          features: ['Chronograph', 'Date display', 'Tachymeter'],
        },
        stock: 15,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Portugieser Chronograph',
        brand: 'IWC',
        price: 8900,
        description:
          'The Portugieser combines classic elegance with sporting functionality. Its clean dial and sophisticated design make it one of the most refined chronographs available.',
        shortDescription: 'Refined classic chronograph',
        images: [
          'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800',
        ],
        category: ProductCategory.CLASSIC,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '41mm',
          dialColor: 'Silver',
          movement: 'Calibre 69355 Automatic',
          waterResistance: '30m',
          strapMaterial: 'Alligator leather',
          strapColor: 'Blue',
          crystal: 'Sapphire Crystal',
          powerReserve: '46 hours',
          features: ['Chronograph', 'Small seconds'],
        },
        stock: 10,
        isNew: true,
        isFeatured: false,
      },
      {
        name: 'Big Bang Unico',
        brand: 'Hublot',
        price: 22000,
        description:
          'The Big Bang Unico represents the fusion of traditional watchmaking with innovative materials. Bold and distinctive, it makes a powerful statement on the wrist.',
        shortDescription: 'Bold fusion chronograph',
        images: [
          'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800',
        ],
        category: ProductCategory.LIMITED_EDITION,
        specifications: {
          caseMaterial: 'Titanium and Ceramic',
          caseSize: '45mm',
          dialColor: 'Skeleton',
          movement: 'UNICO HUB1280 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Rubber',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '72 hours',
          features: ['Flyback chronograph', 'Skeleton dial', 'Column wheel'],
        },
        stock: 4,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Seamaster 300',
        brand: 'Omega',
        price: 6500,
        description:
          'The Seamaster 300 combines vintage aesthetics with modern technology. Inspired by the original 1957 model, it offers exceptional dive watch performance.',
        shortDescription: 'Heritage diving watch',
        images: [
          'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800',
        ],
        category: ProductCategory.DIVING,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '41mm',
          dialColor: 'Black',
          movement: 'Master Co-Axial 8400',
          waterResistance: '300m',
          strapMaterial: 'Nato strap',
          strapColor: 'Black and Grey',
          crystal: 'Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Date display', 'Master Chronometer', 'Luminescent markers'],
        },
        stock: 9,
        isNew: false,
        isFeatured: false,
      },
    ];

    await this.productModel.insertMany(products);
    this.logger.log(`Seeded ${products.length} products successfully`);
  }
}
