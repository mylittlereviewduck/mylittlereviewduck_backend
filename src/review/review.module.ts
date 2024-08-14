import { Module, forwardRef } from '@nestjs/common';
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
import { ReviewReportService } from './review-report.service';
import { ReviewShareService } from './review-share.service';
import { ReviewShareCheckService } from './review-share-check.service';
import { UserModule } from 'src/user/user.module';
import { AwsModule } from 'src/common/aws/aws.module';

@Module({
  imports: [
    CacheModule.register(),
    forwardRef(() => AuthModule),
    PrismaModule,
    UserModule,
    AwsModule,
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewLikeService,
    ReviewLikeCheckService,
    ReviewBookmarkService,
    ReviewBookmarkCheckService,
    ReviewShareService,
    ReviewShareCheckService,
    ReviewBlockService,
    ReviewBlockCheckService,
    ReviewReportService,
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
