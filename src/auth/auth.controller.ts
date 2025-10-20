import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  async logout(@Body() dto: RefreshDto) {
    const success = await this.authService.logout(dto.refreshToken);
    if (!success) throw new UnauthorizedException('Invalid token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logged-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged user information' })
  getLoggedUser(@Request() req) {
    return { ...req.auth.user };
  }
}
