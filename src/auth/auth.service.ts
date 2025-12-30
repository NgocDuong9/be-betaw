import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated. Please contact support.');
    }

    if (await this.usersService.validatePassword(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      role: user.role,
    };
    return {
      user: user.toJSON(),
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      role: user.role,
    };
    return {
      user: user.toJSON(),
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated');
    }
    return user;
  }
}

