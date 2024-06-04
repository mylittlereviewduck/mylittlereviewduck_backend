import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentService {
  constructor() {}

  //유저가 댓글을 단 게시글들을 반환
  async getCommentListByUserIdx() {}

  async getCommentAllByReviewIdx() {}

  async createComment() {}

  async updateComment() {}

  async deleteComment() {}
}
