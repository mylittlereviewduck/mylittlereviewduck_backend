export class ReviewEntity {
  idx: number;
  userIdx: number;
  title: string;
  content: string;
  view: number;
  like: number;
  tag: string[];
  createdAt: Date;

  constructor(data) {
    this.idx = data.idx;
    this.userIdx = data.userIdx;
    this.title = data.title;
    this.content = data.content;
    this.view = data.view;
    this.like = data.like;
    this.tag = data.tag;
    this.createdAt = data.createdAt;
  }
}
