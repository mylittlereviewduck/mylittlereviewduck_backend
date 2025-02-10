import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { CommentModule } from './comment/comment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from '../src/email/email.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ReviewModule,
    CommentModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    NotificationModule,
    ReportModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      maxListeners: 10,
      wildcard: true,
      verboseMemoryLeak: true,
    }),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        config: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
