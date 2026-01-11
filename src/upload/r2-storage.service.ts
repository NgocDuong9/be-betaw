import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

@Injectable()
export class R2StorageService implements OnModuleInit {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly accountId: string;

  constructor(private readonly configService: ConfigService) {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID') ?? '';
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ?? '';
    
    this.bucketName = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME') ?? '';
    this.publicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL') ?? '';

    const endpoint = `https://${this.accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  onModuleInit() {
    // Log config khi khởi động để debug
    this.logger.log('=== Cloudflare R2 Configuration ===');
    this.logger.log(`Account ID: ${this.accountId ? this.accountId.substring(0, 8) + '...' : '❌ MISSING'}`);
    this.logger.log(`Bucket Name: ${this.bucketName || '❌ MISSING'}`);
    this.logger.log(`Public URL: ${this.publicUrl || '❌ MISSING'}`);
    this.logger.log(`Endpoint: https://${this.accountId}.r2.cloudflarestorage.com`);
    
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    this.logger.log(`Access Key ID: ${accessKeyId ? accessKeyId.substring(0, 8) + '...' : '❌ MISSING'}`);
    this.logger.log(`Secret Access Key: ${secretAccessKey ? '✅ SET' : '❌ MISSING'}`);
    this.logger.log('===================================');
  }

  /**
   * Upload file lên Cloudflare R2
   * @param file - File từ Multer
   * @param folder - Thư mục lưu trữ (default: 'images')
   * @returns UploadResult với URL public
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'images',
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(file.originalname);
    const key = `${folder}/${timestamp}-${sanitizedFileName}`;

    this.logger.log(`Uploading file: ${file.originalname} -> ${key}`);
    this.logger.log(`File size: ${file.size} bytes, Type: ${file.mimetype}`);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const resultUrl = `${this.publicUrl}/${key}`;
      this.logger.log(`✅ Upload successful: ${resultUrl}`);

      return {
        url: resultUrl,
        key,
        size: file.size,
        contentType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('❌ Error uploading file to R2:');
      this.logger.error(`Error name: ${error instanceof Error ? error.name : 'Unknown'}`);
      this.logger.error(`Error message: ${error instanceof Error ? error.message : String(error)}`);
      
      if (error && typeof error === 'object' && '$metadata' in error) {
        const metadata = (error as { $metadata: { httpStatusCode?: number } }).$metadata;
        this.logger.error(`HTTP Status Code: ${metadata.httpStatusCode}`);
      }

      // Throw lỗi chi tiết hơn
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Upload nhiều files cùng lúc
   * @param files - Array files từ Multer
   * @param folder - Thư mục lưu trữ
   * @returns Array của UploadResult
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'images',
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Xóa file từ R2
   * @param key - Key của file cần xóa
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Xóa file từ URL
   * @param fileUrl - URL đầy đủ của file
   */
  async deleteFileByUrl(fileUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(fileUrl);
    if (key) {
      await this.deleteFile(key);
    }
  }

  /**
   * Lấy signed URL cho private files
   * @param key - Key của file
   * @param expiresIn - Thời gian hết hạn (giây)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Extract key từ URL
   */
  private extractKeyFromUrl(url: string): string | null {
    if (!url.startsWith(this.publicUrl)) {
      return null;
    }
    return url.replace(`${this.publicUrl}/`, '');
  }

  /**
   * Sanitize filename để tránh các ký tự đặc biệt
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
