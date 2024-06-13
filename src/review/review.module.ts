import { BookmarkCheckerService } from './bookmarkChecker.service';
import { Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewBookmarkService } from './reviewBookmark.service';
import { ReviewLikeService } from './reviewLike.service';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register(), forwardRef(() => AuthModule)],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewBookmarkService,
    BookmarkCheckerService,
    ReviewLikeService,
    ,
  ],
  exports: [BookmarkCheckerService],
})
export class ReviewModule {}
