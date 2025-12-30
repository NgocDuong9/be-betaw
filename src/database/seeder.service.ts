import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import {
  Product,
  ProductDocument,
  ProductCategory,
} from '../products/schemas/product.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      await this.seedProducts();
      await this.seedAdminUser();
    }
  }

  async seedAdminUser() {
    const adminEmail = 'admin@betawatch.com';
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping...');
      return;
    }

    this.logger.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = new this.userModel({
      firstName: 'Admin',
      lastName: 'BetaWatch',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await admin.save();
    this.logger.log('Admin user created: admin@betawatch.com / Admin@123');
  }

  async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count > 0) {
      this.logger.log('Products already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding products...');

    const products = [
      // ==================== LUXURY CATEGORY ====================
      {
        name: 'Royal Oak',
        brand: 'Audemars Piguet',
        price: 45000,
        originalPrice: 52000,
        description: 'The Royal Oak is the worlds first luxury sports watch. Created by the legendary watch designer Gerald Genta in 1972, it remains one of the most iconic timepieces ever created. The octagonal bezel with exposed screws has become a symbol of luxury watchmaking.',
        shortDescription: 'Iconic luxury sports watch with octagonal bezel',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        ],
        category: ProductCategory.LUXURY,
        specifications: {
          caseMaterial: '18K Rose Gold',
          caseSize: '41mm',
          dialColor: 'Blue Grande Tapisserie',
          movement: 'Calibre 4302 Automatic',
          waterResistance: '50m',
          strapMaterial: 'Integrated bracelet',
          strapColor: 'Rose Gold',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Date display', 'Self-winding', 'Exhibition caseback'],
        },
        stock: 3,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Nautilus 5711',
        brand: 'Patek Philippe',
        price: 85000,
        originalPrice: 95000,
        description: 'The Nautilus is a luxury sports watch designed by Gerald Genta in 1976. With its distinctive porthole-shaped case inspired by ocean liners, it has become one of the most sought-after watches in the world.',
        shortDescription: 'Legendary sports-elegant timepiece',
        images: [
          'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800',
        ],
        category: ProductCategory.LUXURY,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '40mm',
          dialColor: 'Blue Gradient',
          movement: 'Calibre 26-330 S C Automatic',
          waterResistance: '120m',
          strapMaterial: 'Integrated bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '45 hours',
          features: ['Date display', 'Sweep seconds hand', 'Fold-over clasp'],
        },
        stock: 2,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Calatrava 5227',
        brand: 'Patek Philippe',
        price: 38000,
        description: 'The Calatrava represents the pure essence of the round wristwatch. Since 1932, it has embodied the timeless values of traditional watchmaking with its understated elegance.',
        shortDescription: 'Pure elegance in classic watchmaking',
        images: [
          'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800',
        ],
        category: ProductCategory.LUXURY,
        specifications: {
          caseMaterial: '18K White Gold',
          caseSize: '39mm',
          dialColor: 'Silver Opaline',
          movement: 'Calibre 324 S C Automatic',
          waterResistance: '30m',
          strapMaterial: 'Alligator leather',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '45 hours',
          features: ['Date display', 'Hinged dust cover', 'Hand-stitched strap'],
        },
        stock: 4,
        isNew: false,
        isFeatured: true,
      },
      {
        name: 'Overseas',
        brand: 'Vacheron Constantin',
        price: 28000,
        description: 'The Overseas collection is the sporty-chic expression of Vacheron Constantin. Inspired by the spirit of travel and adventure, it combines elegance with robustness.',
        shortDescription: 'Sporty elegance for global travelers',
        images: [
          'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800',
        ],
        category: ProductCategory.LUXURY,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '41mm',
          dialColor: 'Blue',
          movement: 'Calibre 5100 Automatic',
          waterResistance: '150m',
          strapMaterial: 'Interchangeable system',
          strapColor: 'Blue Rubber',
          crystal: 'Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Date display', 'Quick-change strap system', 'Geneva Seal'],
        },
        stock: 5,
        isNew: true,
        isFeatured: false,
      },

      // ==================== DIVING CATEGORY ====================
      {
        name: 'Submariner Date',
        brand: 'Rolex',
        price: 14500,
        description: 'The Submariner is the archetypal divers watch. Launched in 1953, it was the first divers wristwatch waterproof to a depth of 100 metres. It has set the standard for diving watches ever since.',
        shortDescription: 'The ultimate diving watch icon',
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
          features: ['Date display', 'Cerachrom bezel', 'Triplock crown', 'Luminescent Chromalight display'],
        },
        stock: 8,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Seamaster 300',
        brand: 'Omega',
        price: 6500,
        description: 'The Seamaster 300 combines vintage aesthetics with modern Master Chronometer technology. Inspired by the original 1957 model, it offers exceptional dive watch performance with authentic styling.',
        shortDescription: 'Heritage diving with modern performance',
        images: [
          'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800',
        ],
        category: ProductCategory.DIVING,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '41mm',
          dialColor: 'Black Vintage',
          movement: 'Master Co-Axial 8400',
          waterResistance: '300m',
          strapMaterial: 'NATO strap',
          strapColor: 'Black and Grey',
          crystal: 'Domed Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Date display', 'Master Chronometer', 'Luminescent markers', 'Vintage lume'],
        },
        stock: 10,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Seamaster Planet Ocean',
        brand: 'Omega',
        price: 7200,
        description: 'The Planet Ocean is Omegas ultimate dive watch, designed for the most demanding underwater conditions. With its robust construction and 600m water resistance, it is trusted by professional divers worldwide.',
        shortDescription: 'Professional diving excellence',
        images: [
          'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
        ],
        category: ProductCategory.DIVING,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '43.5mm',
          dialColor: 'Black',
          movement: 'Co-Axial Master Chronometer 8900',
          waterResistance: '600m',
          strapMaterial: 'Steel bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Date display', 'Helium escape valve', 'Unidirectional bezel', 'Master Chronometer certified'],
        },
        stock: 7,
        isNew: true,
        isFeatured: false,
      },
      {
        name: 'Pelagos',
        brand: 'Tudor',
        price: 4800,
        description: 'The Pelagos is Tudors flagship diving watch, designed for professional saturation divers. Its titanium construction and innovative features make it one of the most capable dive watches available.',
        shortDescription: 'Professional titanium diver',
        images: [
          'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
        ],
        category: ProductCategory.DIVING,
        specifications: {
          caseMaterial: 'Titanium',
          caseSize: '42mm',
          dialColor: 'Black',
          movement: 'MT5612 Automatic',
          waterResistance: '500m',
          strapMaterial: 'Titanium bracelet',
          strapColor: 'Titanium',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Date display', 'Helium escape valve', 'In-house movement', 'Self-adjusting clasp'],
        },
        stock: 12,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Aquaracer Professional 300',
        brand: 'TAG Heuer',
        price: 3200,
        description: 'The Aquaracer embodies TAGs racing heritage combined with diving capability. Its sporty design and robust construction make it perfect for both land and sea adventures.',
        shortDescription: 'Sporty diving versatility',
        images: [
          'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800',
        ],
        category: ProductCategory.DIVING,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '43mm',
          dialColor: 'Blue',
          movement: 'Calibre 5 Automatic',
          waterResistance: '300m',
          strapMaterial: 'Steel bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '38 hours',
          features: ['Date display', 'Unidirectional bezel', 'Luminescent markers', 'Double safety clasp'],
        },
        stock: 15,
        isNew: true,
        isFeatured: false,
      },

      // ==================== CHRONOGRAPH CATEGORY ====================
      {
        name: 'Speedmaster Moonwatch Professional',
        brand: 'Omega',
        price: 7200,
        description: 'The Speedmaster Professional Moonwatch has been part of all six lunar landing missions. It is the only watch to have been qualified by NASA for all manned space flights and remains the choice of astronauts today.',
        shortDescription: 'The legendary Moon landing chronograph',
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
          features: ['Chronograph', 'Tachymeter scale', 'NASA flight-qualified', 'Manual winding'],
        },
        stock: 12,
        isNew: false,
        isFeatured: true,
      },
      {
        name: 'Daytona Cosmograph',
        brand: 'Rolex',
        price: 28000,
        originalPrice: 32000,
        description: 'The Cosmograph Daytona is the ultimate chronograph for racing enthusiasts. Introduced in 1963, it has become an icon of motorsport timing and remains highly coveted by collectors.',
        shortDescription: 'The ultimate racing chronograph',
        images: [
          'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800',
        ],
        category: ProductCategory.CHRONOGRAPH,
        specifications: {
          caseMaterial: 'Oystersteel',
          caseSize: '40mm',
          dialColor: 'White',
          movement: 'Calibre 4130 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Oyster bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '72 hours',
          features: ['Chronograph', 'Tachymeter scale', 'In-house movement', 'Screw-down pushers'],
        },
        stock: 2,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Carrera Chronograph',
        brand: 'TAG Heuer',
        price: 5500,
        description: 'The Carrera is a legendary racing chronograph named after the dangerous Carrera Panamericana race. First introduced in 1963, it was designed for professional racing drivers who demanded a precise and reliable timepiece.',
        shortDescription: 'Professional racing heritage',
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
        ],
        category: ProductCategory.CHRONOGRAPH,
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
          features: ['Chronograph', 'Date display', 'Tachymeter', 'Column-wheel mechanism'],
        },
        stock: 15,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Portugieser Chronograph',
        brand: 'IWC',
        price: 8900,
        description: 'The Portugieser Chronograph combines classic elegance with sporting functionality. Its clean dial design and sophisticated aesthetic make it one of the most refined chronographs available.',
        shortDescription: 'Refined elegance meets precision timing',
        images: [
          'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800',
        ],
        category: ProductCategory.CHRONOGRAPH,
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
          features: ['Chronograph', 'Small seconds', 'Minutes counter', 'Hours counter'],
        },
        stock: 10,
        isNew: true,
        isFeatured: false,
      },
      {
        name: 'Navitimer B01 Chronograph',
        brand: 'Breitling',
        price: 9200,
        description: 'The Navitimer is the ultimate pilots chronograph, featuring the iconic circular slide rule for aviation calculations. Since 1952, it has been the choice of pilots around the world.',
        shortDescription: 'The iconic pilots chronograph',
        images: [
          'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800',
        ],
        category: ProductCategory.CHRONOGRAPH,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '43mm',
          dialColor: 'Black',
          movement: 'B01 Manufacture Calibre',
          waterResistance: '30m',
          strapMaterial: 'Leather',
          strapColor: 'Brown',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Chronograph', 'Slide rule bezel', 'Date display', 'COSC certified'],
        },
        stock: 8,
        isNew: false,
        isFeatured: false,
      },

      // ==================== SPORT CATEGORY ====================
      {
        name: 'GMT-Master II',
        brand: 'Rolex',
        price: 18500,
        description: 'The GMT-Master II was originally developed for Pan Am pilots to tell time in multiple time zones. Its iconic two-tone bezel and robust construction make it a favorite among travelers and watch enthusiasts.',
        shortDescription: 'The world travelers essential',
        images: [
          'https://images.unsplash.com/photo-1587836374828-a58e71466c4b?w=800',
        ],
        category: ProductCategory.SPORT,
        specifications: {
          caseMaterial: 'Oystersteel',
          caseSize: '40mm',
          dialColor: 'Black',
          movement: 'Calibre 3285 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Jubilee bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['GMT function', 'Date display', 'Bidirectional bezel', 'Independent hour hand'],
        },
        stock: 4,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'Black Bay 58',
        brand: 'Tudor',
        price: 3900,
        description: 'The Black Bay Fifty-Eight brings vintage proportions to Tudors dive watch collection. Named after the year Tudor achieved 200m water resistance, it offers authentic 1950s styling.',
        shortDescription: 'Vintage-inspired modern classic',
        images: [
          'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
        ],
        category: ProductCategory.SPORT,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '39mm',
          dialColor: 'Black',
          movement: 'MT5402 Automatic',
          waterResistance: '200m',
          strapMaterial: 'NATO strap',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Date display', 'Unidirectional bezel', 'Vintage snowflake hands', 'In-house movement'],
        },
        stock: 18,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Aqua Terra 150M',
        brand: 'Omega',
        price: 5800,
        description: 'The Aqua Terra perfectly bridges the gap between elegant dress watch and capable sports watch. Its versatile design transitions seamlessly from boardroom to beach.',
        shortDescription: 'Versatile elegance for every occasion',
        images: [
          'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800',
        ],
        category: ProductCategory.SPORT,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '41mm',
          dialColor: 'Blue Teak',
          movement: 'Master Chronometer 8900',
          waterResistance: '150m',
          strapMaterial: 'Steel bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Date display', 'Master Chronometer certified', 'Teak-pattern dial', 'Anti-magnetic'],
        },
        stock: 11,
        isNew: true,
        isFeatured: false,
      },
      {
        name: 'Explorer II',
        brand: 'Rolex',
        price: 11500,
        description: 'The Explorer II was developed for cave explorers and polar expeditioners who lose track of day and night. Its distinctive 24-hour hand and fixed bezel make it an essential tool watch.',
        shortDescription: 'Built for extreme exploration',
        images: [
          'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800',
        ],
        category: ProductCategory.SPORT,
        specifications: {
          caseMaterial: 'Oystersteel',
          caseSize: '42mm',
          dialColor: 'Polar White',
          movement: 'Calibre 3285 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Oyster bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['GMT function', 'Date display', '24-hour bezel', 'Orange GMT hand'],
        },
        stock: 6,
        isNew: false,
        isFeatured: false,
      },

      // ==================== CLASSIC CATEGORY ====================
      {
        name: 'Reverso Classic',
        brand: 'Jaeger-LeCoultre',
        price: 8500,
        description: 'The Reverso was invented in 1931 to withstand the rigors of polo. Its legendary reversible case allows wearers to protect the dial or reveal a personalized engraving.',
        shortDescription: 'Art Deco icon with reversible case',
        images: [
          'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800',
        ],
        category: ProductCategory.CLASSIC,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '45.6 x 27.4mm',
          dialColor: 'Silver',
          movement: 'Calibre 822 Manual',
          waterResistance: '30m',
          strapMaterial: 'Alligator leather',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '42 hours',
          features: ['Reversible case', 'Small seconds', 'Manual winding', 'Engravable caseback'],
        },
        stock: 7,
        isNew: false,
        isFeatured: true,
      },
      {
        name: 'Pilot Mark XX',
        brand: 'IWC',
        price: 5500,
        description: 'The Pilot Mark series traces its heritage to the legendary Mark XI used by the British Royal Air Force. The Mark XX continues this tradition with modern reliability and classic styling.',
        shortDescription: 'Military aviation heritage',
        images: [
          'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800',
        ],
        category: ProductCategory.CLASSIC,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '40mm',
          dialColor: 'Black',
          movement: 'Calibre 32111 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Calfskin leather',
          strapColor: 'Brown',
          crystal: 'Sapphire Crystal',
          powerReserve: '72 hours',
          features: ['Date display', 'Luminescent hands', 'Anti-magnetic', 'Quick-change strap'],
        },
        stock: 9,
        isNew: true,
        isFeatured: false,
      },
      {
        name: 'Master Ultra Thin Moon',
        brand: 'Jaeger-LeCoultre',
        price: 12500,
        description: 'The Master Ultra Thin Moon showcases the art of slender watchmaking with a beautiful moon phase display. Its elegant design and refined complications embody dressy sophistication.',
        shortDescription: 'Slim elegance with moon phase',
        images: [
          'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800',
        ],
        category: ProductCategory.CLASSIC,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '39mm',
          dialColor: 'Silver',
          movement: 'Calibre 925/1 Automatic',
          waterResistance: '50m',
          strapMaterial: 'Alligator leather',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '70 hours',
          features: ['Moon phase display', 'Date display', 'Ultra-thin design', 'Dual time zone'],
        },
        stock: 5,
        isNew: false,
        isFeatured: false,
      },
      {
        name: 'Tank Francaise',
        brand: 'Cartier',
        price: 7200,
        description: 'The Tank was created in 1917 inspired by Renault tanks on the Western Front. The Tank Francaise adds an integrated bracelet for a more contemporary, sporty feel while maintaining the elegant lines.',
        shortDescription: 'Iconic rectangular elegance',
        images: [
          'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800',
        ],
        category: ProductCategory.CLASSIC,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '32 x 27mm',
          dialColor: 'Silver',
          movement: 'Quartz',
          waterResistance: '30m',
          strapMaterial: 'Steel bracelet',
          strapColor: 'Steel',
          crystal: 'Sapphire Crystal',
          powerReserve: 'Battery powered',
          features: ['Roman numerals', 'Blue steel hands', 'Octagonal crown', 'Integrated bracelet'],
        },
        stock: 12,
        isNew: true,
        isFeatured: false,
      },

      // ==================== LIMITED EDITION CATEGORY ====================
      {
        name: 'Big Bang Unico',
        brand: 'Hublot',
        price: 25000,
        originalPrice: 28000,
        description: 'The Big Bang Unico represents the Art of Fusion philosophy with its innovative combination of materials. Bold and distinctive, it makes a powerful statement while showcasing Hublots in-house movement.',
        shortDescription: 'Bold fusion of innovation',
        images: [
          'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800',
        ],
        category: ProductCategory.LIMITED_EDITION,
        specifications: {
          caseMaterial: 'Titanium and King Gold',
          caseSize: '45mm',
          dialColor: 'Skeleton',
          movement: 'UNICO HUB1280 Manufacture',
          waterResistance: '100m',
          strapMaterial: 'Rubber with deployment clasp',
          strapColor: 'Black',
          crystal: 'Sapphire Crystal',
          powerReserve: '72 hours',
          features: ['Flyback chronograph', 'Skeleton dial', 'Column wheel', 'Limited to 500 pieces'],
        },
        stock: 2,
        isNew: true,
        isFeatured: true,
      },
      {
        name: 'BR 05 Skeleton Blue',
        brand: 'Bell and Ross',
        price: 8900,
        description: 'The BR 05 Skeleton reveals the intricate mechanics of the movement through its open-worked dial. This limited edition in blue showcases Bell and Ross technical mastery.',
        shortDescription: 'Industrial skeleton artistry',
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
        ],
        category: ProductCategory.LIMITED_EDITION,
        specifications: {
          caseMaterial: 'Stainless Steel with Blue PVD',
          caseSize: '40mm',
          dialColor: 'Skeleton Blue',
          movement: 'BR-CAL.322 Automatic',
          waterResistance: '100m',
          strapMaterial: 'Rubber',
          strapColor: 'Blue',
          crystal: 'Sapphire Crystal',
          powerReserve: '54 hours',
          features: ['Skeleton dial', 'Integrated bracelet', 'Limited to 250 pieces', 'Exhibition caseback'],
        },
        stock: 3,
        isNew: true,
        isFeatured: false,
      },
      {
        name: 'Seamaster Spectre 007',
        brand: 'Omega',
        price: 9500,
        description: 'This limited edition Seamaster was created for the James Bond film Spectre. Featuring unique styling cues from the movies, it represents the ultimate Bond watch for collectors.',
        shortDescription: 'James Bond limited edition',
        images: [
          'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800',
        ],
        category: ProductCategory.LIMITED_EDITION,
        specifications: {
          caseMaterial: 'Stainless Steel',
          caseSize: '41mm',
          dialColor: 'Black with 12-hour scale',
          movement: 'Master Co-Axial 8400',
          waterResistance: '300m',
          strapMaterial: 'NATO strap',
          strapColor: 'Grey and Black stripes',
          crystal: 'Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Master Chronometer', 'Lollipop seconds hand', '007 engraved on caseback', 'Limited to 7007 pieces'],
        },
        stock: 1,
        isNew: false,
        isFeatured: true,
      },
      {
        name: 'Royal Oak Offshore Diver',
        brand: 'Audemars Piguet',
        price: 32000,
        description: 'The Royal Oak Offshore Diver brings the iconic octagonal design to extreme depths. This special edition features vibrant colors and enhanced diving capabilities.',
        shortDescription: 'Bold diving statement',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        ],
        category: ProductCategory.LIMITED_EDITION,
        specifications: {
          caseMaterial: 'Stainless Steel with Ceramic',
          caseSize: '42mm',
          dialColor: 'Electric Blue',
          movement: 'Calibre 4308 Automatic',
          waterResistance: '300m',
          strapMaterial: 'Rubber',
          strapColor: 'Blue',
          crystal: 'Sapphire Crystal',
          powerReserve: '60 hours',
          features: ['Inner rotating bezel', 'Super-LumiNova', 'Screw-locked crown', 'Limited edition of 300'],
        },
        stock: 2,
        isNew: true,
        isFeatured: false,
      },
    ];

    await this.productModel.insertMany(products);
    this.logger.log(`Seeded ${products.length} products successfully`);
  }

  async reseed(): Promise<{ message: string; count: number }> {
    this.logger.log('Resetting and reseeding products...');
    
    // Delete all products
    await this.productModel.deleteMany({});
    this.logger.log('All products deleted');
    
    // Force reseed
    const countBefore = await this.productModel.countDocuments();
    if (countBefore === 0) {
      await this.seedProducts();
    }
    
    const countAfter = await this.productModel.countDocuments();
    return {
      message: `Successfully reseeded ${countAfter} products`,
      count: countAfter,
    };
  }
}
