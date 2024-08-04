import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewBlockCheckService {
  constructor() {}

  isReviewBlocked: (accountIdx: number, reviewIdx: number) => Promise<void>;
}
