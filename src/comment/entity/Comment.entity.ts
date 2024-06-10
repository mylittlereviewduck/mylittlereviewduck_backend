export class CommentEntity {
  idx: number;
  userIdx: number;
  reviewIdx: number;
  commentIdx?: number;
  content: string;
  like: number;
  createdAt: Date;

  constructor(data) {
    this.idx = data.idx;
    this.userIdx = data.userIdx;
    this.reviewIdx = data.reviewIdx;
    this.commentIdx = data.commentIdx;
    this.content = data.content;
    this.like = data.like;
    this.createdAt = data.createdAt;
  }
}
