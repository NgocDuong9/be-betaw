import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({
    description: 'Full URL of the image to delete',
    example: 'https://pub-xxx.r2.dev/images/1234567890-image.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Public URL of the uploaded image',
    example: 'https://pub-xxx.r2.dev/images/1234567890-image.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Storage key of the uploaded image',
    example: 'images/1234567890-image.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 102400,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  contentType: string;
}
