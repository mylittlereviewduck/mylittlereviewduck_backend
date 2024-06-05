import { NaverStrategy } from './strategy/naver.strategy';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: 12 * 3600 },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, NaverStrategy],
  exports: [AuthService],
})
export class AuthModule {}
