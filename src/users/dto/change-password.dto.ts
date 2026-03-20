import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword456', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
