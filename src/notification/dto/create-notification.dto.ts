import { CommentEntity } from 'src/comment/entity/Comment.entity';
import { ReviewEntity } from 'src/review/entity/Review.entity';
import { UserEntity } from 'src/user/entity/User.entity';

export class CreateNotificationDto {
  senderIdx: string;
  recipientIdx: string;
  type: number;
  reviewIdx?: number;
  commentIdx?: number;
}
