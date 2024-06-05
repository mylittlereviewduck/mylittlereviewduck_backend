import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthModule, GoogleStrategy],
})
export class AuthModule {}
