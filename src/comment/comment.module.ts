import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentLikeService } from './commentLike.service';
import { CommentLikeCheckService } from './comment-like-check.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentController],
  providers: [CommentService, CommentLikeService, CommentLikeCheckService],
})
export class CommentModule {}
