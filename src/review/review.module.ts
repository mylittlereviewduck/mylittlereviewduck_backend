import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { BookmarkService } from './bookmark.service';
import { ReviewBlockService } from './reviewBlock.service';
import { ReviewLikeService } from './reviewLike.service';

@Module({
  imports: [],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    BookmarkService,
    ReviewBlockService,
    ReviewLikeService,
  ],
  exports: [],
})
export class ReviewModule {}
