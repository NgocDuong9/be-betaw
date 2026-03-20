import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req: { user: { userId: string } }) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      success: true,
      data: user,
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  async updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(req.user.userId, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'Profile updated successfully',
    };
  }

  @Put('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @Request() req: { user: { userId: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.userId, changePasswordDto);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'User account deleted' })
  async deleteAccount(@Request() req: { user: { userId: string } }) {
    await this.usersService.remove(req.user.userId);
    return {
      success: true,
      message: 'Account deleted successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
    };
  }
}
