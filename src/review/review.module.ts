import { ConsoleLogger, Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewLikeService } from './like.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewLikeCheckService } from './review-like-check.service';
import { ReviewBlockService } from './review-block.service';
import { ReviewBlockCheckService } from './review-block-check.service';
import { UserModule } from 'src/user/user.module';
import { AwsModule } from 'src/aws/aws.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ReviewBookmarkService } from './review-bookmark.service';
import { BookmarkService } from './bookmark.service';
import { ReviewInteractionService } from './review-interaction.service';

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
    ReviewBlockService,
    ReviewBlockCheckService,
    ReviewInteractionService,
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
