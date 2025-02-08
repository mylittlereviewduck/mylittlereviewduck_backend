import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SseService } from './sse.service';
import { CommentModule } from 'src/comment/comment.module';
import { ReviewModule } from 'src/review/review.module';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [
    PrismaModule,
    ReviewModule,
    forwardRef(() => UserModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, SseService, FirebaseService],
  exports: [NotificationService, SseService, FirebaseService],
})
export class NotificationModule {}
