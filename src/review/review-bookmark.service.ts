import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class ReviewBookmarkService {
  constructor() {}

  bookmarkReview: (userIdx: number, reviewIdx: number) => Promise<void>;

  unBookmarkReview: (userIdx: number, reviewIdx: number) => Promise<void>;
}
