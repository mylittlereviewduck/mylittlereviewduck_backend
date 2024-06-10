export class CommentLikeEntity {
  userIdx: number;
  reviewIdx: number;

  constructor(data) {
    this.userIdx = data.userIdx;
    this.reviewIdx = data.reviewIdx;
  }
}
