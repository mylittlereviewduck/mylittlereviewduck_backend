import { AuthGuard } from './auth.guard';
import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { UserModule } from '../../src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../../src/user/user.service';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { EmailAuthService } from './email-auth.service';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../../src/email/email.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: 12 * 3600 },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailAuthService,
    AuthGuard,
    UserService,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
