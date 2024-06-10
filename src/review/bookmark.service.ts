import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class BookmarkService {
  constructor() {}

  getReviewAllBookmarked: (userIdx: number) => Promise<ReviewEntity>;

  bookmarkReview: (userIdx: number, reviewIdx: number) => Promise<void>;

  deleteBookmark: (userIdx: number, reviewIdx: number) => Promise<void>;

  isBookmarked: (userIdx: number, reviewIdx: number) => Promise<boolean>;
}
