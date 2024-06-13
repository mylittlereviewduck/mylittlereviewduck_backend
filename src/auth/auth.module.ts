import { AuthGuard } from './auth.guard';
import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwtConstants';
import { MailModule } from 'src/common/Email/Email.module';
import { GoogleStrategy } from './strategy/google.strategy';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    ReviewModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: 12 * 3600 },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, GoogleStrategy],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
