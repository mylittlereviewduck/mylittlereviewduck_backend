import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentLikeService } from './comment-like.service';
import { CommentLikeCheckService } from './comment-like-check.service';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewModule } from 'src/review/review.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PrismaModule,
    ReviewModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentLikeService, CommentLikeCheckService],
  exports: [CommentService],
})
export class CommentModule {}
