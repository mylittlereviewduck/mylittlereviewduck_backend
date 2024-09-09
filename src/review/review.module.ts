import { ConsoleLogger, Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewBookmarkService } from './review-bookmark.service';
import { ReviewLikeService } from './review-like.service';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewLikeCheckService } from './review-like-check.service';
import { ReviewBookmarkCheckService } from './review-bookmark-check.service';
import { ReviewBlockService } from './review-block.service';
import { ReviewBlockCheckService } from './review-block-check.service';
import { ReviewShareService } from './review-share.service';
import { ReviewShareCheckService } from './review-share-check.service';
import { UserModule } from 'src/user/user.module';
import { AwsModule } from 'src/aws/aws.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ReportModule } from 'src/report/report.module';

@Module({
  imports: [
    CacheModule.register(),
    forwardRef(() => AuthModule),
    PrismaModule,
    UserModule,
    AwsModule,
    NotificationModule,
    ReportModule,
  ],
  controllers: [ReviewController],
  providers: [
    ConsoleLogger,
    ReviewService,
    ReviewLikeService,
    ReviewLikeCheckService,
    ReviewBookmarkService,
    ReviewBookmarkCheckService,
    ReviewShareService,
    ReviewShareCheckService,
    ReviewBlockService,
    ReviewBlockCheckService,
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
