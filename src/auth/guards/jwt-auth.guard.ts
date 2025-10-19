import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      throw new UnauthorizedException('Invalid token');
    }

    if (!payload || !payload.sub || !payload.refreshTokenId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.refreshTokenId },
    });

    if (
      !refreshToken ||
      refreshToken.revoked ||
      refreshToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Token revoked or expired');
    }

    req['user'] = {
      id: payload.sub,
      email: payload.email,
      refreshTokenId: payload.refreshTokenId,
    };

    return true;
  }
}
