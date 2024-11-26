import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { CommentModule } from './comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from '../src/email/email.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ReviewModule,
    CommentModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    CacheModule.register(),
    NotificationModule,
    ReportModule,
    EventEmitterModule.forRoot(),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
