import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { R2StorageService, UploadResult } from './r2-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|gif|webp|svg\+xml)$/;

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly r2StorageService: R2StorageService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB)',
        },
        folder: {
          type: 'string',
          description: 'Folder to store image (optional)',
          default: 'images',
        },
      },
      required: ['file'],
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Folder to store image',
    example: 'products',
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        key: { type: 'string' },
        size: { type: 'number' },
        contentType: { type: 'string' },
      },
    },
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<UploadResult> {
    return this.r2StorageService.uploadFile(file, folder ?? 'images');
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of image files (max 10, each max 5MB)',
        },
      },
      required: ['files'],
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Folder to store images',
    example: 'products',
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          key: { type: 'string' },
          size: { type: 'number' },
          contentType: { type: 'string' },
        },
      },
    },
  })
  async uploadMultipleImages(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<UploadResult[]> {
    // Validate each file
    const validatedFiles = files.filter((file) => {
      const isValidSize = file.size <= MAX_FILE_SIZE;
      const isValidType = ALLOWED_MIME_TYPES.test(file.mimetype);
      return isValidSize && isValidType;
    });

    return this.r2StorageService.uploadMultipleFiles(
      validatedFiles,
      folder ?? 'images',
    );
  }

  @Delete('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete image by URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL of the image to delete',
        },
      },
      required: ['url'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  async deleteImage(@Body('url') url: string): Promise<{ message: string }> {
    await this.r2StorageService.deleteFileByUrl(url);
    return { message: 'Image deleted successfully' };
  }

  @Delete('image/:key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete image by key' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  async deleteImageByKey(
    @Param('key') key: string,
  ): Promise<{ message: string }> {
    await this.r2StorageService.deleteFile(key);
    return { message: 'Image deleted successfully' };
  }
}
