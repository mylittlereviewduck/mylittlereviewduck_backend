import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentLikeService } from './comment-like.service';
import { CommentLikeCheckService } from './comment-like-check.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [PrismaModule, ReviewModule],
  controllers: [CommentController],
  providers: [CommentService, CommentLikeService, CommentLikeCheckService],
  exports: [CommentService],
})
export class CommentModule {}
