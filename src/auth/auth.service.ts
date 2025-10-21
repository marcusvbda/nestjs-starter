import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (match) return user;
    return null;
  }

  async login(user: {
    id: number;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email };

    const refreshPlain = randomBytes(64).toString('hex');
    const refreshHash = await bcrypt.hash(refreshPlain, 10);
    const expiresAt = addDays(
      new Date(),
      Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30),
    );

    const refreshToken = await this.prisma.refreshToken.create({
      data: { tokenHash: refreshHash, userId: user.id, expiresAt },
    });

    const accessToken = this.jwt.sign({
      ...payload,
      refreshTokenId: refreshToken.id,
    });

    return { accessToken, refreshToken: refreshPlain };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { revoked: false },
    });

    const matchedToken = await Promise.all(
      tokens.map(async (t) =>
        (await bcrypt.compare(refreshToken, t.tokenHash)) ? t : null,
      ),
    ).then((res) => res.find(Boolean));

    if (!matchedToken) throw new UnauthorizedException('Invalid refresh token');
    if (matchedToken.expiresAt < new Date())
      throw new UnauthorizedException('Refresh expired');

    // Revoga o token antigo
    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked: true },
    });

    const user = await this.usersService.findById(matchedToken.userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.login({ id: user.id, email: user.email });
  }

  async logout(refreshToken: string): Promise<boolean> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { revoked: false },
    });

    const matchedToken = await Promise.all(
      tokens.map(async (t) =>
        (await bcrypt.compare(refreshToken, t.tokenHash)) ? t : null,
      ),
    ).then((res) => res.find(Boolean));

    if (!matchedToken) return false;

    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked: true },
    });

    return true;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredRefreshTokens(): Promise<void> {
    const expiredTokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (expiredTokens.length > 0) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          id: { in: expiredTokens.map((token: { id: any }) => token.id) },
        },
      });
      console.log('Cleaned up expired tokens:', expiredTokens.length);
    }
  }
}
