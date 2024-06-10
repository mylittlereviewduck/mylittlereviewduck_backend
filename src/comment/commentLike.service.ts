import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentLike {
  constructor() {}

  likeComment: (userIdx: number, commentIdx: number) => Promise<void>;

  unlikeComment: (userIdx: number, commentIdx: number) => Promise<void>;

  isCommentLiked: (userIdx: number, commentIdx: number) => Promise<boolean>;
}
