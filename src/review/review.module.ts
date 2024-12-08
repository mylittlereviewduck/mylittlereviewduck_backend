import { ConsoleLogger, Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewLikeService } from './like.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewLikeCheckService } from './review-like-check.service';
import { ReviewBlockService } from './review-block.service';
import { ReviewBlockCheckService } from './review-block-check.service';
import { ReviewShareService } from './share.service';
import { ReviewShareCheckService } from './review-share.service';
import { UserModule } from 'src/user/user.module';
import { AwsModule } from 'src/aws/aws.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ReviewBookmarkService } from './review-bookmark.service';
import { BookmarkService } from './bookmark.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    PrismaModule,
    forwardRef(() => UserModule),
    AwsModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [ReviewController],
  providers: [
    ConsoleLogger,
    ReviewService,
    ReviewLikeService,
    ReviewLikeCheckService,
    BookmarkService,
    ReviewBookmarkService,
    ReviewShareService,
    ReviewShareCheckService,
    ReviewBlockService,
    ReviewBlockCheckService,
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
