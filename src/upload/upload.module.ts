import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { R2StorageService } from './r2-storage.service';


@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [R2StorageService],
  exports: [R2StorageService],
})
export class UploadModule {}
