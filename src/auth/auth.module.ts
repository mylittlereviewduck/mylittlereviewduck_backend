import { AuthGuard } from './auth.guard';
import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { UserModule } from '../../src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwtConstants';
import { MailModule } from '../common/Email/email.module';
import { GoogleStrategy } from './strategy/google.strategy';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../../src/user/user.service';
import { NaverStrategy } from './strategy/naver.strategy';
import { AppleStrategy } from './strategy/apple.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { EmailAuthService } from './email-auth.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: 12 * 3600 },
    }),
    MailModule,
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
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
