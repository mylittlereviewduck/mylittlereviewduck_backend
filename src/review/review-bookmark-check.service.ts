import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewBookmarkCheckService {
  constructor() {}

  isReviewBookmarked: (accountIdx: number, reviewIdx: number) => Promise<void>;
}
