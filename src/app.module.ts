import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { CommentModule } from './comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from './email/email.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
