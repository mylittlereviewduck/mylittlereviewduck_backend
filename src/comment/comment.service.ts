import { Injectable } from '@nestjs/common';
import { ReviewEntity } from 'src/review/entity/Review.entity';
import { CommentEntity } from './entity/Comment.entity';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { UpdateCommentDto } from './dto/UpdateComment.dto';

@Injectable()
export class CommentService {
  constructor() {}

  getCommentListByUserIdx: (userIdx: number) => Promise<ReviewEntity[]>;

  getCommentAllByReviewIdx: (reviewIdx: number) => Promise<CommentEntity[]>;

  createComment: (createCommentDto: CreateCommentDto) => Promise<void>;

  updateComment: (updateCommentDto: UpdateCommentDto) => Promise<void>;

  deleteComment: (userIdx: number, commentIdx: number) => Promise<void>;
}
