import { BookmarkCheckService } from './bookmark-check.service';
import { Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewBookmarkService } from './review-bookmark.service';
import { ReviewLikeService } from './review-like.service';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewLikeCheckService } from './review-like-check.service';

@Module({
  imports: [CacheModule.register(), forwardRef(() => AuthModule), PrismaModule],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewBookmarkService,
    BookmarkCheckService,
    ReviewLikeService,
    ReviewLikeCheckService,
  ],
  exports: [BookmarkCheckService],
})
export class ReviewModule {}
