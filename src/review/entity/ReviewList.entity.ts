import { PickType } from '@nestjs/swagger';
import { ReviewEntity } from './Review.entity';

export class ReviewListEntity extends PickType(ReviewEntity, [
  'idx',
  'title',
  'score',
  'createdAt',
  'user',
  'tags',
  'images',
  'likeCount',
  'dislikeCount',
  'commentCount',
]) {}
