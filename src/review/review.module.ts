import { BookmarkCheckerService } from './bookmarkChecker.service';
import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewBookmarkService } from './reviewBookmark.service';
import { ReviewLikeService } from './reviewLike.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [RedisModule, AuthGuard],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewBookmarkService,
    BookmarkCheckerService,
    ReviewLikeService,
  ],
  exports: [BookmarkCheckerService],
})
export class ReviewModule {}
