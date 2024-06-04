import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentLike {
  constructor() {}

  async likeComment() {}

  async unlikeComment() {}

  async isCommentLiked() {}
}
