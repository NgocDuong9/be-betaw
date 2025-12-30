import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeederService } from './seeder.service';

@ApiTags('Database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly seederService: SeederService) {}

  @Post('reseed')
  @ApiOperation({ summary: 'Reset and reseed all products (Development only)' })
  @ApiResponse({ status: 200, description: 'Products reseeded successfully' })
  async reseed() {
    const result = await this.seederService.reseed();
    return {
      success: true,
      data: result,
    };
  }

  @Get('seed-status')
  @ApiOperation({ summary: 'Check if products are seeded' })
  @ApiResponse({ status: 200, description: 'Seed status retrieved' })
  async getSeedStatus() {
    return {
      success: true,
      data: {
        message: 'Use POST /api/database/reseed to reset and reseed products',
      },
    };
  }
}
