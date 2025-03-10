import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No Token');
    }

    try {
      const payload: authorizationToken = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      if (payload.type != 'refresh') {
        throw new BadRequestException('Need refresh Token');
      }

      const searchedLoginUser = await this.prismaService.loginUserTb.findFirst({
        where: {
          accountIdx: payload.idx,
        },
      });

      if (!searchedLoginUser)
        throw new UnauthorizedException('Already Not Login User');

      if (token !== searchedLoginUser.refreshToken) {
        throw new UnauthorizedException('UnauthorizedException');
      }

      request.user = payload;
    } catch (err) {
      if (err instanceof TokenExpiredError)
        throw new UnauthorizedException('Authentication TimeOut');

      if (err instanceof UnauthorizedException)
        throw new UnauthorizedException(err.message);

      if (err instanceof BadRequestException)
        throw new BadRequestException(err.message);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type == 'Bearer' ? token : undefined;
  }
}
