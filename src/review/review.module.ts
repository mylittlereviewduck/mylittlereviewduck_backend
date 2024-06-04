import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { BookmarkService } from './bookmark.service';
import { ReviewLikeService } from './reviewLike.service';

@Module({
  imports: [],
  controllers: [ReviewController],
  providers: [ReviewService, BookmarkService, ReviewLikeService],
  exports: [],
})
export class ReviewModule {}
