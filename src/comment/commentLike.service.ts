import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentLike {
  constructor() {}

  likeComment: (userIdx: number, commentIdx: number) => Promise<void>;

  unlikeComment: (userIdx: number, commentIdx: number) => Promise<void>;

  //함수 분리
  isCommentLiked: (userIdx: number, commentIdx: number) => Promise<boolean>;
}
